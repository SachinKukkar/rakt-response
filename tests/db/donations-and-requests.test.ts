import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Transaction } from "@electric-sql/pglite";
import { as, createTestDb, createUser, donorMetadata, expectDbError, makeStaff, type Db, type TestUser } from "./harness";

let db: Db;
let donor: TestUser;
let otherDonor: TestUser;
let noConsentDonor: TestUser;
let hiddenDonor: TestUser;
let unconfirmedDonor: TestUser;
let sdpDonor: TestUser;
let requester: TestUser;
let volunteer: TestUser;
let verifier: TestUser;
let admin: TestUser;

const inHours = (h: number) => new Date(Date.now() + h * 3600_000).toISOString();

async function submitRequest(
  tx: Transaction,
  overrides: Partial<Record<string, unknown>> = {},
): Promise<{ request_id: string; reference_code: string; possible_duplicate_of: string | null }> {
  const p = {
    name: "Fictional Requester",
    phone: "+919811111111",
    email: null,
    method: "phone",
    group: "O+",
    type: "whole_blood",
    units: 2,
    hospital: "Fictional General Hospital",
    state: "Maharashtra",
    district: "Pune",
    city: "Pune",
    requiredBy: inHours(24),
    urgency: "urgent",
    notes: null,
    publicListing: true,
    clientKey: null,
    ...overrides,
  };
  const result = await tx.query<{ request_id: string; reference_code: string; possible_duplicate_of: string | null }>(
    `select * from public.submit_blood_request($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
    [
      p.name, p.phone, p.email, p.method, p.group, p.type, p.units, p.hospital, p.state, p.district, p.city,
      p.requiredBy, p.urgency, p.notes, p.publicListing, p.clientKey,
    ],
  );
  return result.rows[0];
}

beforeAll(async () => {
  db = await createTestDb();
  donor = await createUser(db, donorMetadata({ full_name: "Dev Donor" }));
  otherDonor = await createUser(db, donorMetadata({ full_name: "Other Donor", phone: "+919800000002" }));
  noConsentDonor = await createUser(
    db,
    donorMetadata({
      full_name: "Quiet Donor",
      preferences: { directory_visible: true, contact_consent: false, emergency_alerts: false, open_to_contact: false },
    }),
  );
  hiddenDonor = await createUser(
    db,
    donorMetadata({ full_name: "Hidden Donor", preferences: { directory_visible: false, contact_consent: true, open_to_contact: true } }),
  );
  unconfirmedDonor = await createUser(db, donorMetadata({ full_name: "Unconfirmed Donor" }), { confirmed: false });
  sdpDonor = await createUser(
    db,
    donorMetadata({
      full_name: "Platelet Donor",
      donations: [{ donation_type: "sdp", donation_date: "2026-01-15", centre_name: "Fictional Apheresis Unit" }],
    }),
  );
  requester = await createUser(db, { full_name: "Requesting Member", is_donor: false, terms_accepted: true });
  volunteer = await createUser(db, donorMetadata({ full_name: "Vol Unteer", location: { state: "Maharashtra", district: "Mumbai", city: "Mumbai" } }));
  verifier = await createUser(db, donorMetadata({ full_name: "Veri Fier", location: { state: "Maharashtra", district: "Mumbai", city: "Mumbai" } }));
  admin = await createUser(db, donorMetadata({ full_name: "Ad Min", location: { state: "Maharashtra", district: "Mumbai", city: "Mumbai" } }));
  await makeStaff(db, volunteer, "volunteer", { can_verify_donations: false, can_verify_requests: false });
  await makeStaff(db, verifier, "volunteer", { can_verify_donations: true, can_verify_requests: true });
  await makeStaff(db, admin, "admin");
  await db.query("update public.platform_settings set value = '50' where key = 'member_request_daily_limit'");
});

afterAll(async () => {
  await db.close();
});

describe("donation records", () => {
  it("forces donor submissions to be self-reported and pending", async () => {
    await as(db, donor, (tx) =>
      tx.query(
        `insert into public.donation_records (donor_id, donation_type, donation_date, centre_name, record_source, verification_status)
         values ($1, 'whole_blood', '2025-06-01', 'Fictional Blood Bank', 'admin_verified', 'verified')`,
        [donor.id],
      ),
    );
    const row = await db.query<{ record_source: string; verification_status: string; created_by: string }>(
      "select record_source, verification_status, created_by from public.donation_records where donor_id = $1 and donation_date = '2025-06-01'",
      [donor.id],
    );
    expect(row.rows[0]).toEqual({ record_source: "self_reported", verification_status: "pending", created_by: donor.id });
  });

  it("rejects exact duplicates and future dates", async () => {
    const dup = await expectDbError(
      as(db, donor, (tx) =>
        tx.query(
          `insert into public.donation_records (donor_id, donation_type, donation_date, centre_name) values ($1, 'whole_blood', '2025-06-01', 'Again')`,
          [donor.id],
        ),
      ),
    );
    expect(dup).toMatch(/duplicate key/);
    const future = await expectDbError(
      as(db, donor, (tx) =>
        tx.query(
          `insert into public.donation_records (donor_id, donation_type, donation_date, centre_name) values ($1, 'sdp', current_date + 3, 'Future')`,
          [donor.id],
        ),
      ),
    );
    expect(future).toMatch(/future/);
  });

  it("donors cannot add records for someone else", async () => {
    const message = await expectDbError(
      as(db, donor, (tx) =>
        tx.query(
          `insert into public.donation_records (donor_id, donation_type, donation_date, centre_name) values ($1, 'sdp', '2025-02-02', 'X Centre')`,
          [otherDonor.id],
        ),
      ),
    );
    expect(message).toMatch(/row-level security/);
  });

  it("only volunteers with the verification permission can verify, never their own records", async () => {
    const rec = await db.query<{ id: string }>(
      "select id from public.donation_records where donor_id = $1 and donation_date = '2025-06-01'",
      [donor.id],
    );
    const id = rec.rows[0].id;
    const asDonor = await expectDbError(as(db, donor, (tx) => tx.query("select public.verify_donation_record($1, 'verified')", [id])));
    expect(asDonor).toMatch(/not authorised/);
    const asVolunteer = await expectDbError(
      as(db, volunteer, (tx) => tx.query("select public.verify_donation_record($1, 'verified')", [id])),
    );
    expect(asVolunteer).toMatch(/not authorised/);

    await createUser(db); // unrelated
    const own = await db.query<{ id: string }>("select id from public.donation_records where donor_id = $1 limit 1", [verifier.id]);
    if (own.rows[0]) {
      const self = await expectDbError(
        as(db, verifier, (tx) => tx.query("select public.verify_donation_record($1, 'verified')", [own.rows[0].id])),
      );
      expect(self).toMatch(/your own/);
    }

    await as(db, verifier, (tx) => tx.query("select public.verify_donation_record($1, 'verified')", [id]));
    const after = await db.query<{ record_source: string; verification_status: string; verified_by: string }>(
      "select record_source, verification_status, verified_by from public.donation_records where id = $1",
      [id],
    );
    expect(after.rows[0]).toEqual({ record_source: "volunteer_verified", verification_status: "verified", verified_by: verifier.id });

    const note = await as(db, donor, (tx) =>
      tx.query<{ kind: string }>("select kind from public.notifications where kind = 'donation_verification'"),
    );
    expect(note.rows).toHaveLength(1);
  });

  it("rejection requires a reason", async () => {
    await as(db, donor, (tx) =>
      tx.query(
        `insert into public.donation_records (donor_id, donation_type, donation_date, centre_name) values ($1, 'sdp', '2025-08-08', 'SDP Centre')`,
        [donor.id],
      ),
    );
    const rec = await db.query<{ id: string }>("select id from public.donation_records where donor_id = $1 and donation_type = 'sdp'", [donor.id]);
    const message = await expectDbError(
      as(db, verifier, (tx) => tx.query("select public.verify_donation_record($1, 'rejected', '')", [rec.rows[0].id])),
    );
    expect(message).toMatch(/reason/);
  });

  it("donors cannot edit or delete a verified record", async () => {
    const rec = await db.query<{ id: string }>(
      "select id from public.donation_records where donor_id = $1 and verification_status = 'verified'",
      [donor.id],
    );
    const update = await as(db, donor, (tx) =>
      tx.query("update public.donation_records set centre_name = 'Changed' where id = $1", [rec.rows[0].id]),
    );
    expect(update.affectedRows).toBe(0);
    const del = await as(db, donor, (tx) => tx.query("delete from public.donation_records where id = $1", [rec.rows[0].id]));
    expect(del.affectedRows).toBe(0);
  });

  it("donors cannot self-verify through a direct update of a pending record", async () => {
    const rec = await db.query<{ id: string }>(
      "select id from public.donation_records where donor_id = $1 and verification_status = 'pending' limit 1",
      [donor.id],
    );
    const message = await expectDbError(
      as(db, donor, (tx) =>
        tx.query("update public.donation_records set verification_status = 'verified', verified_at = now() where id = $1", [rec.rows[0].id]),
      ),
    );
    expect(message).toMatch(/authorised reviewer/);
  });

  it("summarises reported and verified donations separately by type", async () => {
    const summary = await as(db, donor, (tx) =>
      tx.query<Record<string, unknown>>("select * from public.donation_summary($1)", [donor.id]),
    );
    expect(summary.rows[0]).toMatchObject({
      verified_whole_blood_count: 1,
      verified_sdp_count: 0,
      reported_sdp_count: 1,
      pending_count: 1,
    });
    // RLS: another donor's summary is empty
    const other = await as(db, otherDonor, (tx) =>
      tx.query<Record<string, unknown>>("select * from public.donation_summary($1)", [donor.id]),
    );
    expect(other.rows[0]).toMatchObject({ verified_whole_blood_count: 0, pending_count: 0 });
  });
});

describe("blood request lifecycle", () => {
  let requestId: string;

  it("anonymous visitors cannot call the submission function directly", async () => {
    const message = await expectDbError(as(db, null, (tx) => submitRequest(tx)));
    expect(message).toMatch(/permission denied/);
  });

  it("the server (service role) can submit on behalf of an anonymous requester, with rate limiting", async () => {
    await db.query("update public.platform_settings set value = '2' where key = 'anon_request_daily_limit'");
    const first = await as(db, "service_role", (tx) => submitRequest(tx, { clientKey: "hash-abc", hospital: "Anon Hospital 1" }));
    expect(first.reference_code).toMatch(/^RR-\d{6}-[0-9A-F]{5}$/);
    await as(db, "service_role", (tx) => submitRequest(tx, { clientKey: "hash-abc", hospital: "Anon Hospital 2" }));
    const third = await expectDbError(as(db, "service_role", (tx) => submitRequest(tx, { clientKey: "hash-abc", hospital: "Anon Hospital 3" })));
    expect(third).toMatch(/Too many requests/);
    const noKey = await expectDbError(as(db, "service_role", (tx) => submitRequest(tx, { clientKey: null })));
    expect(noKey).toMatch(/sign in/);
  });

  it("a member can submit, and a near-identical request is flagged as a possible duplicate", async () => {
    const first = await as(db, requester, (tx) => submitRequest(tx));
    requestId = first.request_id;
    expect(first.possible_duplicate_of).toBeNull();
    const second = await as(db, requester, (tx) => submitRequest(tx, { hospital: "  fictional general HOSPITAL " }));
    expect(second.possible_duplicate_of).toBe(requestId);
  });

  it("rejects requests in the past", async () => {
    const message = await expectDbError(as(db, requester, (tx) => submitRequest(tx, { requiredBy: inHours(-5) })));
    expect(message).toMatch(/past/);
  });

  it("the requester can read their request; other donors cannot", async () => {
    const own = await as(db, requester, (tx) => tx.query("select id from public.blood_requests where id = $1", [requestId]));
    expect(own.rows).toHaveLength(1);
    const other = await as(db, donor, (tx) => tx.query("select id from public.blood_requests where id = $1", [requestId]));
    expect(other.rows).toHaveLength(0);
  });

  it("the requester cannot change the status directly", async () => {
    const message = await expectDbError(
      as(db, requester, (tx) => tx.query("update public.blood_requests set status = 'verified' where id = $1", [requestId])),
    );
    expect(message).toMatch(/coordination workflow/);
  });

  it("unverified requests are not listed publicly", async () => {
    const list = await as(db, null, (tx) => tx.query("select * from public.list_public_blood_requests()"));
    expect(list.rows).toHaveLength(0);
  });

  it("only staff with verification permission can verify", async () => {
    const donorAttempt = await expectDbError(
      as(db, donor, (tx) => tx.query("select public.set_request_status($1, 'verified')", [requestId])),
    );
    expect(donorAttempt).toMatch(/Only authorised volunteers/);
    const volunteerAttempt = await expectDbError(
      as(db, volunteer, (tx) => tx.query("select public.set_request_status($1, 'verified')", [requestId])),
    );
    expect(volunteerAttempt).toMatch(/not authorised to verify/);
  });

  it("verification alerts only opted-in, matching, confirmed donors and notifies the requester", async () => {
    await as(db, verifier, (tx) => tx.query("select public.set_request_status($1, 'verified')", [requestId]));
    const alerted = await db.query<{ user_id: string }>(
      "select user_id from public.notifications where kind = 'request_alert'",
    );
    const ids = alerted.rows.map((r) => r.user_id);
    expect(ids).toContain(donor.id);
    expect(ids).toContain(sdpDonor.id);
    expect(ids).not.toContain(noConsentDonor.id); // no emergency alert consent
    expect(ids).not.toContain(unconfirmedDonor.id);
    expect(ids).not.toContain(volunteer.id); // different district
    const requesterNote = await as(db, requester, (tx) =>
      tx.query<{ title: string }>("select title from public.notifications where kind = 'request_update'"),
    );
    expect(requesterNote.rows.some((r) => r.title.includes("Verified"))).toBe(true);
  });

  it("verified, consented requests are listed publicly without requester details", async () => {
    const list = await as(db, null, (tx) => tx.query<Record<string, unknown>>("select * from public.list_public_blood_requests('O+')"));
    expect(list.rows).toHaveLength(1);
    const row = list.rows[0];
    expect(row).not.toHaveProperty("requester_phone");
    expect(row).not.toHaveProperty("requester_name");
    expect(row).not.toHaveProperty("requester_email");
    const detail = await as(db, null, (tx) => tx.query("select * from public.get_public_blood_request($1)", [requestId]));
    expect(detail.rows).toHaveLength(1);
  });

  it("rejects invalid transitions and requires a note for fulfilment", async () => {
    const back = await expectDbError(as(db, verifier, (tx) => tx.query("select public.set_request_status($1, 'submitted')", [requestId])));
    expect(back).toMatch(/cannot move/);
    const noNote = await expectDbError(as(db, verifier, (tx) => tx.query("select public.set_request_status($1, 'fulfilled')", [requestId])));
    expect(noNote).toMatch(/reason/);
  });

  it("donors can respond to an open request and assigned volunteers hear about interest", async () => {
    await as(db, volunteer, (tx) => tx.query("select public.assign_request($1)", [requestId]));
    await as(db, volunteer, (tx) => tx.query("select public.set_request_status($1, 'in_coordination')", [requestId]));
    await as(db, donor, (tx) => tx.query("select public.respond_to_blood_request($1, 'interested')", [requestId]));
    const note = await as(db, volunteer, (tx) =>
      tx.query<{ title: string }>("select title from public.notifications where kind = 'contact_response'"),
    );
    expect(note.rows.length).toBeGreaterThan(0);
    const response = await as(db, donor, (tx) =>
      tx.query<{ response: string }>("select response from public.request_responses where request_id = $1", [requestId]),
    );
    expect(response.rows[0].response).toBe("interested");
    // donors cannot write responses directly
    const direct = await expectDbError(
      as(db, donor, (tx) => tx.query("update public.request_responses set outcome = 'donated' where donor_id = $1", [donor.id])),
    );
    expect(direct).toMatch(/permission denied/);
  });

  it("history records every status change", async () => {
    const events = await as(db, requester, (tx) =>
      tx.query<{ to_status: string | null }>(
        "select to_status from public.request_events where request_id = $1 and event_type in ('created','status_changed') order by id",
        [requestId],
      ),
    );
    expect(events.rows.map((e) => e.to_status)).toEqual(["submitted", "verified", "in_coordination"]);
  });

  it("closing a request completes assignments", async () => {
    await as(db, verifier, (tx) =>
      tx.query("select public.set_request_status($1, 'fulfilled', 'Hospital blood bank confirmed the donation')", [requestId]),
    );
    const assignments = await as(db, volunteer, (tx) =>
      tx.query<{ status: string }>("select status from public.volunteer_assignments where request_id = $1", [requestId]),
    );
    expect(assignments.rows.every((a) => a.status === "completed")).toBe(true);
  });

  it("expires stale requests and sends follow-up reminders", async () => {
    const stale = await as(db, requester, (tx) => submitRequest(tx, { hospital: "Stale Hospital", requiredBy: inHours(1) }));
    await db.query("update public.blood_requests set required_by = now() - interval '2 days' where id = $1", [stale.request_id]);
    const notAllowed = await expectDbError(as(db, donor, (tx) => tx.query("select public.expire_stale_requests()")));
    expect(notAllowed).toMatch(/Not authorised/);
    const count = await as(db, volunteer, (tx) => tx.query<{ expire_stale_requests: number }>("select public.expire_stale_requests()"));
    expect(count.rows[0].expire_stale_requests).toBeGreaterThanOrEqual(1);

    const open = await as(db, requester, (tx) => submitRequest(tx, { hospital: "Follow Up Hospital", group: "B+" }));
    await as(db, volunteer, (tx) => tx.query("select public.assign_request($1)", [open.request_id]));
    await db.query("update public.volunteer_assignments set follow_up_at = now() - interval '1 minute' where request_id = $1", [open.request_id]);
    const reminders = await as(db, volunteer, (tx) => tx.query<{ generate_follow_up_reminders: number }>("select public.generate_follow_up_reminders()"));
    expect(reminders.rows[0].generate_follow_up_reminders).toBe(1);
  });

  it("purges requester contact details from long-closed requests (admins only)", async () => {
    const r = await as(db, "service_role", (tx) => submitRequest(tx, { clientKey: "purge-key", hospital: "Purge Hospital", group: "AB+" }));
    await as(db, verifier, (tx) => tx.query("select public.set_request_status($1, 'rejected', 'Could not confirm with hospital')", [r.request_id]));
    await db.query("update public.blood_requests set closed_at = now() - interval '120 days' where id = $1", [r.request_id]);
    const denied = await expectDbError(as(db, volunteer, (tx) => tx.query("select public.purge_closed_request_contacts(90)")));
    expect(denied).toMatch(/Not authorised/);
    await as(db, admin, (tx) => tx.query("select public.purge_closed_request_contacts(90)"));
    const row = await db.query<{ requester_phone: string | null }>("select requester_phone from public.blood_requests where id = $1", [r.request_id]);
    expect(row.rows[0].requester_phone).toBeNull();
  });

  it("requesters can cancel their own open request", async () => {
    const r = await as(db, requester, (tx) => submitRequest(tx, { hospital: "Cancel Hospital", group: "A-" }));
    const other = await expectDbError(as(db, donor, (tx) => tx.query("select public.cancel_my_blood_request($1, 'x')", [r.request_id])));
    expect(other).toMatch(/not found/);
    await as(db, requester, (tx) => tx.query("select public.cancel_my_blood_request($1, 'Arranged elsewhere')", [r.request_id]));
    const row = await db.query<{ status: string }>("select status from public.blood_requests where id = $1", [r.request_id]);
    expect(row.rows[0].status).toBe("cancelled");
  });
});

describe("donor directory and contact access", () => {
  let activeRequest: string;

  beforeAll(async () => {
    const r = await as(db, requester, (tx) => submitRequest(tx, { hospital: "Directory Hospital", type: "sdp", group: "O+" }));
    activeRequest = r.request_id;
    await as(db, verifier, (tx) => tx.query("select public.set_request_status($1, 'verified')", [activeRequest]));
  });

  it("is not available to donors", async () => {
    const message = await expectDbError(as(db, donor, (tx) => tx.query("select * from public.search_donors()")));
    expect(message).toMatch(/Only authorised volunteers/);
  });

  it("returns only directory-visible, confirmed, active donors and no contact columns", async () => {
    const result = await as(db, volunteer, (tx) =>
      tx.query<Record<string, unknown>>("select * from public.search_donors(p_blood_groups => array['O+']::public.blood_group[], p_district => 'pune')"),
    );
    const ids = result.rows.map((r) => r.donor_id);
    expect(ids).toContain(donor.id);
    expect(ids).toContain(noConsentDonor.id);
    expect(ids).not.toContain(hiddenDonor.id);
    expect(ids).not.toContain(unconfirmedDonor.id);
    for (const row of result.rows) {
      expect(Object.keys(row)).not.toEqual(expect.arrayContaining(["phone"]));
      expect(row).not.toHaveProperty("whatsapp");
      expect(row).not.toHaveProperty("email");
      expect(row).not.toHaveProperty("pincode");
      expect(row).not.toHaveProperty("approx_lat");
    }
    expect(Number(result.rows[0].total_count)).toBe(result.rows.length);
  });

  it("supports filtering by donation history type, openness and paging", async () => {
    const sdp = await as(db, volunteer, (tx) =>
      tx.query<{ donor_id: string }>("select donor_id from public.search_donors(p_donation_type => 'sdp')"),
    );
    // sdpDonor declared SDP history at signup; `donor` has a pending self-reported SDP record.
    expect(sdp.rows.map((r) => r.donor_id).sort()).toEqual([sdpDonor.id, donor.id].sort());
    const open = await as(db, volunteer, (tx) =>
      tx.query<{ donor_id: string }>("select donor_id from public.search_donors(p_open_only => true)"),
    );
    expect(open.rows.map((r) => r.donor_id)).not.toContain(noConsentDonor.id);
    const page = await as(db, volunteer, (tx) =>
      tx.query<{ donor_id: string; total_count: string }>("select donor_id, total_count from public.search_donors(p_limit => 1, p_offset => 1)"),
    );
    expect(page.rows).toHaveLength(1);
    expect(Number(page.rows[0].total_count)).toBeGreaterThan(1);
  });

  it("escapes wildcard characters in text search", async () => {
    const result = await as(db, volunteer, (tx) => tx.query("select * from public.search_donors(p_query => '%')"));
    expect(result.rows).toHaveLength(0);
  });

  it("provides blood-group facet counts", async () => {
    const facets = await as(db, volunteer, (tx) =>
      tx.query<{ blood_group: string; donor_count: number }>("select * from public.search_donor_facets(p_district => 'Pune')"),
    );
    expect(facets.rows.find((f) => f.blood_group === "O+")?.donor_count).toBeGreaterThanOrEqual(3);
  });

  it("matches donors for a request, prioritising SDP history for SDP requests", async () => {
    const match = await as(db, volunteer, (tx) =>
      tx.query<{ donor_id: string; has_sdp_history: boolean }>("select donor_id, has_sdp_history from public.match_donors_for_request($1)", [activeRequest]),
    );
    expect(match.rows[0].donor_id).toBe(sdpDonor.id);
    expect(match.rows[0].has_sdp_history).toBe(true);
  });

  it("reveals contact details only with consent, for an active verified request, and logs access", async () => {
    const asDonor = await expectDbError(
      as(db, donor, (tx) => tx.query("select * from public.reveal_donor_contact($1, $2)", [otherDonor.id, activeRequest])),
    );
    expect(asDonor).toMatch(/Only authorised volunteers/);

    const withConsent = await as(db, volunteer, (tx) =>
      tx.query<{ phone: string }>("select * from public.reveal_donor_contact($1, $2)", [donor.id, activeRequest]),
    );
    expect(withConsent.rows[0].phone).toBe("+919800000001");

    const noConsent = await expectDbError(
      as(db, volunteer, (tx) => tx.query("select * from public.reveal_donor_contact($1, $2)", [noConsentDonor.id, activeRequest])),
    );
    expect(noConsent).toMatch(/not agreed/);

    const closed = await db.query<{ id: string }>("select id from public.blood_requests where status = 'fulfilled' limit 1");
    const closedAttempt = await expectDbError(
      as(db, volunteer, (tx) => tx.query("select * from public.reveal_donor_contact($1, $2)", [donor.id, closed.rows[0].id])),
    );
    expect(closedAttempt).toMatch(/verified, active blood request/);

    const audit = await db.query<{ count: number }>(
      "select count(*)::int as count from public.audit_logs where action = 'donor_contact.revealed' and entity_id = $1",
      [donor.id],
    );
    expect(audit.rows[0].count).toBe(1);
  });

  it("supports a consent-based contact request the donor can accept", async () => {
    const id = await as(db, volunteer, (tx) =>
      tx.query<{ create_contact_request: string }>("select public.create_contact_request($1, $2, 'Can we call you?')", [noConsentDonor.id, activeRequest]),
    );
    const crId = id.rows[0].create_contact_request;
    const dup = await expectDbError(
      as(db, volunteer, (tx) => tx.query("select public.create_contact_request($1, $2)", [noConsentDonor.id, activeRequest])),
    );
    expect(dup).toMatch(/already waiting/);
    const wrongDonor = await expectDbError(as(db, donor, (tx) => tx.query("select public.respond_to_contact_request($1, true)", [crId])));
    expect(wrongDonor).toMatch(/not found/);
    await as(db, noConsentDonor, (tx) => tx.query("select public.respond_to_contact_request($1, true)", [crId]));
    const revealed = await as(db, volunteer, (tx) =>
      tx.query<{ phone: string }>("select * from public.reveal_donor_contact($1, $2)", [noConsentDonor.id, activeRequest]),
    );
    expect(revealed.rows[0].phone).toBe("+919800000001");
  });

  it("shows donors only the requests relevant to them, without requester details", async () => {
    const mine = await as(db, noConsentDonor, (tx) => tx.query<Record<string, unknown>>("select * from public.list_my_request_matches()"));
    const row = mine.rows.find((r) => r.request_id === activeRequest);
    expect(row?.contact_request_status).toBe("accepted");
    expect(row).not.toHaveProperty("requester_phone");
    expect(row).not.toHaveProperty("requester_name");
    const hidden = await as(db, hiddenDonor, (tx) => tx.query<{ request_id: string }>("select request_id from public.list_my_request_matches()"));
    // A donor hidden from the directory still sees publicly listed matches for their group and district — never private ones.
    for (const r of hidden.rows) {
      const listed = await db.query<{ public_listing_consent: boolean }>("select public_listing_consent from public.blood_requests where id = $1", [r.request_id]);
      expect(listed.rows[0].public_listing_consent).toBe(true);
    }
    const requesterView = await as(db, requester, (tx) => tx.query("select * from public.list_my_request_matches()"));
    expect(requesterView.rows).toHaveLength(0); // non-donor
  });

  it("rate limits contact reveals per volunteer", async () => {
    await db.query("update public.platform_settings set value = '3' where key = 'contact_reveal_hourly_limit'");
    await as(db, verifier, (tx) => tx.query("select * from public.reveal_donor_contact($1, $2)", [donor.id, activeRequest]));
    await as(db, verifier, (tx) => tx.query("select * from public.reveal_donor_contact($1, $2)", [otherDonor.id, activeRequest]));
    await as(db, verifier, (tx) => tx.query("select * from public.reveal_donor_contact($1, $2)", [sdpDonor.id, activeRequest]));
    const limited = await expectDbError(
      as(db, verifier, (tx) => tx.query("select * from public.reveal_donor_contact($1, $2)", [donor.id, activeRequest])),
    );
    expect(limited).toMatch(/hourly limit/);
  });

  it("records coordination outcomes and contact attempts", async () => {
    await as(db, volunteer, (tx) =>
      tx.query("select public.record_coordination($1, $2, 'unavailable', null, true)", [activeRequest, otherDonor.id]),
    );
    const row = await as(db, volunteer, (tx) =>
      tx.query<{ response: string; contact_attempts: number }>(
        "select response, contact_attempts from public.request_responses where request_id = $1 and donor_id = $2",
        [activeRequest, otherDonor.id],
      ),
    );
    expect(row.rows[0]).toEqual({ response: "unavailable", contact_attempts: 1 });
  });

  it("volunteers see overview counts; donors cannot", async () => {
    const overview = await as(db, volunteer, (tx) => tx.query<{ get_volunteer_overview: Record<string, number> }>("select public.get_volunteer_overview()"));
    expect(overview.rows[0].get_volunteer_overview).toHaveProperty("active_requests");
    const denied = await expectDbError(as(db, donor, (tx) => tx.query("select public.get_volunteer_overview()")));
    expect(denied).toMatch(/Not authorised/);
  });

  it("admin analytics are admin-only and derived from records", async () => {
    const denied = await expectDbError(as(db, volunteer, (tx) => tx.query("select public.get_admin_analytics()")));
    expect(denied).toMatch(/Only administrators/);
    const analytics = await as(db, admin, (tx) =>
      tx.query<{ get_admin_analytics: { donors: { registered: number }; monthly_registrations: unknown[] } }>("select public.get_admin_analytics()"),
    );
    const data = analytics.rows[0].get_admin_analytics;
    expect(data.donors.registered).toBeGreaterThan(0);
    expect(data.monthly_registrations).toHaveLength(12);
  });

  it("staff audit events are namespaced", async () => {
    await as(db, admin, (tx) => tx.query("select public.log_audit_event('export.donors_csv', 'report', null, '{\"rows\": 3}')"));
    const bad = await expectDbError(as(db, admin, (tx) => tx.query("select public.log_audit_event('profiles.delete_all')")));
    expect(bad).toMatch(/Invalid audit action/);
  });
});
