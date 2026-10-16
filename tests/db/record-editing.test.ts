import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Transaction } from "@electric-sql/pglite";
import { as, createTestDb, createUser, donorMetadata, expectDbError, makeStaff, type Db, type TestUser } from "./harness";

/*
 * Editing and removing records (migration 1100): donors fix and remove their
 * own donation records, volunteers who verify donations correct details,
 * administrators can edit or delete anything, and every change is audited.
 */

let db: Db;
let donor: TestUser;
let otherDonor: TestUser;
let volunteer: TestUser;
let verifier: TestUser;
let admin: TestUser;
let requester: TestUser;

const inHours = (h: number) => new Date(Date.now() + h * 3600_000).toISOString();

async function addRecord(user: TestUser, date: string, type = "whole_blood", centre = "Fictional Blood Bank"): Promise<string> {
  const result = await as(db, user, (tx) =>
    tx.query<{ id: string }>(
      `insert into public.donation_records (donor_id, donation_type, donation_date, centre_name) values ($1, $2, $3, $4) returning id`,
      [user.id, type, date, centre],
    ),
  );
  return result.rows[0].id;
}

async function record(id: string) {
  const result = await db.query<{ centre_name: string; verification_status: string; record_source: string; verified_by: string | null; review_reason: string | null }>(
    "select centre_name, verification_status, record_source, verified_by, review_reason from public.donation_records where id = $1",
    [id],
  );
  return result.rows[0];
}

async function submitRequest(tx: Transaction): Promise<string> {
  const result = await tx.query<{ request_id: string }>(
    `select * from public.submit_blood_request($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
    ["Fictional Requester", "+919811111111", null, "phone", "O+", "whole_blood", 2, "Fictional General Hospital", "Maharashtra", "Pune", "Pune", inHours(24), "urgent", null, true, null],
  );
  return result.rows[0].request_id;
}

async function submitStory(tx: Transaction): Promise<string> {
  const body =
    "This is a fictional test story used only by automated tests. It describes an experience in enough words to satisfy the minimum length rule.";
  const result = await tx.query<{ submit_story: string }>(
    `select public.submit_story($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)`,
    ["donor", "Fictional Contributor", "F. Contributor", "contributor@example.test", null, "Pune", "A fictional story", body, "March 2026", "whole_blood", "O+", null, "Private note", null, true, true, true, false, false, true],
  );
  return result.rows[0].submit_story;
}

beforeAll(async () => {
  db = await createTestDb();
  donor = await createUser(db, donorMetadata({ full_name: "Edit Donor" }));
  otherDonor = await createUser(db, donorMetadata({ full_name: "Other Donor", phone: "+919800000002" }));
  volunteer = await createUser(db, donorMetadata({ full_name: "Plain Volunteer", phone: "+919800000003" }));
  verifier = await createUser(db, donorMetadata({ full_name: "Donation Verifier", phone: "+919800000004" }));
  admin = await createUser(db, donorMetadata({ full_name: "Full Admin", phone: "+919800000005" }));
  requester = await createUser(db, { full_name: "Requesting Member", is_donor: false, terms_accepted: true });
  await makeStaff(db, volunteer, "volunteer", { can_verify_donations: false, can_verify_requests: false });
  await makeStaff(db, verifier, "volunteer", { can_verify_donations: true, can_verify_requests: true });
  await makeStaff(db, admin, "admin");
  await db.query("update public.platform_settings set value = '50' where key = 'member_request_daily_limit'");
});

afterAll(async () => {
  await db.close();
});

describe("donors editing their own donation records", () => {
  it("can fix a pending record, which stays pending", async () => {
    const id = await addRecord(donor, "2025-01-10");
    const result = await as(db, donor, (tx) => tx.query("update public.donation_records set centre_name = 'Corrected Centre' where id = $1", [id]));
    expect(result.affectedRows).toBe(1);
    expect(await record(id)).toMatchObject({ centre_name: "Corrected Centre", verification_status: "pending", record_source: "self_reported" });
  });

  it("can fix a verified record, which goes back to pending for checking", async () => {
    const id = await addRecord(donor, "2025-02-10");
    await as(db, verifier, (tx) => tx.query("select public.verify_donation_record($1, 'verified')", [id]));
    expect(await record(id)).toMatchObject({ verification_status: "verified", record_source: "volunteer_verified", verified_by: verifier.id });

    await as(db, donor, (tx) => tx.query("update public.donation_records set donation_date = '2025-02-11' where id = $1", [id]));
    expect(await record(id)).toMatchObject({ verification_status: "pending", record_source: "self_reported", verified_by: null });
  });

  it("can fix a record marked not verified, which clears the reviewer note", async () => {
    const id = await addRecord(donor, "2025-03-10", "sdp", "Fictional Apheresis Unit");
    await as(db, verifier, (tx) => tx.query("select public.verify_donation_record($1, 'rejected', 'Date looks wrong')", [id]));
    await as(db, donor, (tx) => tx.query("update public.donation_records set donation_date = '2025-03-12' where id = $1", [id]));
    expect(await record(id)).toMatchObject({ verification_status: "pending", review_reason: null });
  });

  it("still cannot verify their own record by editing it", async () => {
    const id = await addRecord(donor, "2025-04-10");
    const message = await expectDbError(
      as(db, donor, (tx) => tx.query("update public.donation_records set verification_status = 'verified', verified_at = now() where id = $1", [id])),
    );
    expect(message).toMatch(/authorised reviewer/);
  });

  it("can remove their own record at any status, but never someone else's", async () => {
    const id = await addRecord(donor, "2025-05-10");
    await as(db, verifier, (tx) => tx.query("select public.verify_donation_record($1, 'verified')", [id]));
    const removed = await as(db, donor, (tx) => tx.query("delete from public.donation_records where id = $1", [id]));
    expect(removed.affectedRows).toBe(1);

    const others = await addRecord(otherDonor, "2025-05-11");
    const edit = await as(db, donor, (tx) => tx.query("update public.donation_records set centre_name = 'Hijack' where id = $1", [others]));
    expect(edit.affectedRows).toBe(0);
    const del = await as(db, donor, (tx) => tx.query("delete from public.donation_records where id = $1", [others]));
    expect(del.affectedRows).toBe(0);
  });
});

describe("staff correcting donation records", () => {
  it("volunteers without the verification permission cannot touch other donors' records", async () => {
    const id = await addRecord(otherDonor, "2025-06-10");
    const edit = await as(db, volunteer, (tx) => tx.query("update public.donation_records set centre_name = 'Changed' where id = $1", [id]));
    expect(edit.affectedRows).toBe(0);
  });

  it("verifying volunteers can correct details and the record keeps its status, but cannot delete", async () => {
    const id = await addRecord(otherDonor, "2025-07-10");
    await as(db, verifier, (tx) => tx.query("select public.verify_donation_record($1, 'verified')", [id]));
    const edit = await as(db, verifier, (tx) => tx.query("update public.donation_records set centre_name = 'Fixed By Volunteer' where id = $1", [id]));
    expect(edit.affectedRows).toBe(1);
    expect(await record(id)).toMatchObject({ centre_name: "Fixed By Volunteer", verification_status: "verified" });
    const del = await as(db, verifier, (tx) => tx.query("delete from public.donation_records where id = $1", [id]));
    expect(del.affectedRows).toBe(0);
  });

  it("administrators can edit and delete any record", async () => {
    const id = await addRecord(otherDonor, "2025-08-10");
    await as(db, verifier, (tx) => tx.query("select public.verify_donation_record($1, 'verified')", [id]));
    await as(db, admin, (tx) => tx.query("update public.donation_records set event_name = 'Fixed Camp Name' where id = $1", [id]));
    expect(await record(id)).toMatchObject({ verification_status: "verified" });
    const del = await as(db, admin, (tx) => tx.query("delete from public.donation_records where id = $1", [id]));
    expect(del.affectedRows).toBe(1);
  });

  it("every edit and removal is written to the audit log", async () => {
    const actions = await db.query<{ action: string }>(
      "select distinct action from public.audit_logs where entity_type = 'donation_records' order by action",
    );
    expect(actions.rows.map((r) => r.action)).toEqual(expect.arrayContaining(["donation_records.delete", "donation_records.update"]));
  });
});

describe("administrators deleting requests and stories", () => {
  it("only administrators can delete a blood request; its history goes with it and the deletion is audited", async () => {
    const id = await as(db, requester, (tx) => submitRequest(tx));
    const asVerifier = await expectDbError(as(db, verifier, (tx) => tx.query("select public.admin_delete_blood_request($1)", [id])));
    expect(asVerifier).toMatch(/Only administrators/);
    const asOwner = await expectDbError(as(db, requester, (tx) => tx.query("select public.admin_delete_blood_request($1)", [id])));
    expect(asOwner).toMatch(/Only administrators/);

    await as(db, admin, (tx) => tx.query("select public.admin_delete_blood_request($1)", [id]));
    const left = await db.query("select 1 from public.blood_requests where id = $1", [id]);
    expect(left.rows).toHaveLength(0);
    const events = await db.query("select 1 from public.request_events where request_id = $1", [id]);
    expect(events.rows).toHaveLength(0);
    const audit = await db.query("select 1 from public.audit_logs where action = 'blood_requests.deleted' and entity_id = $1", [id]);
    expect(audit.rows).toHaveLength(1);
  });

  it("only administrators can delete a story, and the photo paths come back for file clean-up", async () => {
    const id = await as(db, donor, (tx) => submitStory(tx));
    const asContributor = await expectDbError(as(db, donor, (tx) => tx.query("select public.admin_delete_story($1)", [id])));
    expect(asContributor).toMatch(/Only administrators/);

    const result = await as(db, admin, (tx) => tx.query<{ admin_delete_story: Record<string, unknown> }>("select public.admin_delete_story($1)", [id]));
    expect(result.rows[0].admin_delete_story).toHaveProperty("public_photo_path");
    const left = await db.query("select 1 from public.impact_stories where id = $1", [id]);
    expect(left.rows).toHaveLength(0);
    const audit = await db.query("select 1 from public.audit_logs where action = 'impact_stories.deleted' and entity_id = $1", [id]);
    expect(audit.rows).toHaveLength(1);
  });

  it("anonymous visitors cannot call either function", async () => {
    const request = await expectDbError(as(db, null, (tx) => tx.query("select public.admin_delete_blood_request(gen_random_uuid())")));
    expect(request).toMatch(/permission denied/);
    const story = await expectDbError(as(db, null, (tx) => tx.query("select public.admin_delete_story(gen_random_uuid())")));
    expect(story).toMatch(/permission denied/);
  });

  it("the audit log stays append-only, even for administrators", async () => {
    const message = await expectDbError(as(db, admin, (tx) => tx.query("delete from public.audit_logs")));
    expect(message).toMatch(/permission denied|append-only|not allowed/i);
  });
});
