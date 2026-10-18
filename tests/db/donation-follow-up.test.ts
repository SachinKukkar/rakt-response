import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Transaction } from "@electric-sql/pglite";
import { as, createTestDb, createUser, donorMetadata, expectDbError, makeStaff, type Db, type TestUser } from "./harness";

let db: Db;
let patient: TestUser;
let verifier: TestUser;
let coordinator: TestUser;
let ravi: TestUser;
let sita: TestUser;
let arun: TestUser;
let outsider: TestUser;
let directoryDonor: TestUser;

const inHours = (h: number) => new Date(Date.now() + h * 3600_000).toISOString();
const todayIst = () => new Date(Date.now() + 5.5 * 3600_000).toISOString().slice(0, 10);
const addDays = (date: string, n: number) => new Date(Date.parse(`${date}T00:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);

const donor = (name: string, phone: string, displayName: string | null = null) =>
  donorMetadata({
    full_name: name,
    display_name: displayName,
    phone,
    preferences: { directory_visible: true, contact_consent: true, emergency_alerts: true, open_to_contact: true, preferred_contact_method: "phone" },
  });

async function createRequest(tx: Transaction, hospital: string) {
  const result = await tx.query<{ request_id: string; reference_code: string }>(
    `select * from public.create_blood_request($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)`,
    [
      "Fictional Patient", 50, "male", "O+", "whole_blood", 2, hospital, "Maharashtra", "Pune", "Pune",
      "IP-777", "Ward 1", "surgery", inHours(24), "urgent", "Fictional Requester", "child", "+919811111111", "phone", null,
    ],
  );
  return result.rows[0];
}

/** A verified request the given donors have joined. */
async function joinedRequest(hospital: string, donors: TestUser[]) {
  const req = await as(db, patient, (tx) => createRequest(tx, hospital));
  await as(db, verifier, (tx) => tx.query("select public.set_request_status($1, 'verified')", [req.request_id]));
  for (const d of donors) await as(db, d, (tx) => tx.query("select public.respond_to_blood_request($1, 'interested')", [req.request_id]));
  return req;
}

const report = (who: TestUser, requestId: string, donated: boolean, date: string | null = null) =>
  as(db, who, (tx) => tx.query<{ report_my_donation: string | null }>("select public.report_my_donation($1, $2, $3)", [requestId, donated, date])).then(
    (r) => r.rows[0].report_my_donation,
  );
const response = (requestId: string, donorId: string) =>
  db
    .query<{
      outcome: string;
      donated_on: string | null;
      donation_record_id: string | null;
      follow_up_due_at: string | null;
      followed_up_at: string | null;
      followed_up_by: string | null;
    }>(
      "select outcome, donated_on::text, donation_record_id, follow_up_due_at, followed_up_at, followed_up_by from public.request_responses where request_id = $1 and donor_id = $2",
      [requestId, donorId],
    )
    .then((r) => r.rows[0]);
const notificationsFor = (user: TestUser, titleLike: string) =>
  db
    .query<{ title: string; body: string; link: string }>("select title, body, link from public.notifications where user_id = $1 and title like $2 order by created_at", [
      user.id,
      titleLike,
    ])
    .then((r) => r.rows);
const checks = (who: TestUser) =>
  as(db, who, (tx) =>
    tx.query<{ request_id: string; outcome: string; can_report: boolean; ask_now: boolean }>("select * from public.list_my_donation_checks()"),
  ).then((r) => r.rows);

beforeAll(async () => {
  db = await createTestDb();
  await db.query("update public.platform_settings set value = '20'::jsonb where key = 'requester_open_request_limit'");
  await db.query("update public.platform_settings set value = '20'::jsonb where key = 'member_request_daily_limit'");
  patient = await createUser(db, { full_name: "Pooja Patient", is_donor: false, terms_accepted: true });
  verifier = await createUser(db, { full_name: "Vera Verifier", is_donor: false, terms_accepted: true });
  await makeStaff(db, verifier, "volunteer", { can_verify_requests: true });
  coordinator = await createUser(db, { full_name: "Cyrus Coordinator", is_donor: false, terms_accepted: true });
  await makeStaff(db, coordinator, "volunteer", { can_verify_requests: false });
  ravi = await createUser(db, donor("Ravi Joiner", "+919800000201", "Ravi J."));
  sita = await createUser(db, donor("Sita Joiner", "+919800000202"));
  arun = await createUser(db, donor("Arun Joiner", "+919800000203"));
  outsider = await createUser(db, donor("Omar Outsider", "+919800000204"));
  directoryDonor = await createUser(db, donor("Dev Directory", "+919800000205"));
});

afterAll(async () => {
  await db.close();
});

describe("donors tell us they donated", () => {
  let requestId = "";
  let code = "";

  it("adds the donation to their record, moves their next date, and starts a follow-up", async () => {
    const req = await joinedRequest("Fictional Follow-up Hospital", [ravi]);
    requestId = req.request_id;
    code = req.reference_code;
    const recordId = await report(ravi, requestId, true, todayIst());

    const record = await db.query<Record<string, string>>(
      "select donor_id, donation_type, donation_date::text, centre_name, city, district, record_source, verification_status from public.donation_records where id = $1",
      [recordId],
    );
    expect(record.rows[0]).toMatchObject({
      donor_id: ravi.id,
      donation_type: "whole_blood",
      donation_date: todayIst(),
      centre_name: "Fictional Follow-up Hospital",
      city: "Pune",
      district: "Pune",
      record_source: "self_reported",
      verification_status: "pending",
    });
    const rr = await response(requestId, ravi.id);
    expect(rr).toMatchObject({ outcome: "donated", donated_on: todayIst(), donation_record_id: recordId, followed_up_at: null });
    expect(rr.follow_up_due_at).not.toBeNull();

    const next = await as(db, ravi, (tx) => tx.query<{ d: string }>("select public.my_next_eligible_date()::text as d"));
    expect(next.rows[0].d).toBe(addDays(todayIst(), 90));
  });

  it("thanks the donor and tells the Rakt Mitras who verify requests when nobody coordinates it", async () => {
    const thanks = await notificationsFor(ravi, "Thank you for donating");
    expect(thanks).toHaveLength(1);
    expect(thanks[0].body).toContain(code);
    expect(thanks[0].body).toContain("It is in your donation record");
    expect(thanks[0].link).toBe(`/requests/${requestId}`);
    const followUp = await notificationsFor(verifier, `Follow up after donation: ${code}`);
    expect(followUp).toHaveLength(1);
    expect(followUp[0].link).toBe("/volunteer/coordination");
    expect(await notificationsFor(coordinator, `Follow up after donation: ${code}`)).toHaveLength(0);
  });

  it("cannot report the same request twice", async () => {
    expect(await expectDbError(report(ravi, requestId, true, todayIst()))).toMatch(/already told us/);
  });

  it("only donors who joined can report, and the date must make sense", async () => {
    expect(await expectDbError(report(outsider, requestId, true))).toMatch(/requests you joined/);
    const req = await joinedRequest("Fictional Date Hospital", [sita]);
    expect(await expectDbError(report(sita, req.request_id, true, addDays(todayIst(), 2)))).toMatch(/future/);
    expect(await expectDbError(report(sita, req.request_id, true, addDays(todayIst(), -3)))).toMatch(/before this request/);
    expect(await expectDbError(as(db, null, (tx) => tx.query("select public.report_my_donation($1, true, null)", [req.request_id])))).toMatch(
      /permission denied/,
    );
  });

  it("a donor can say they didn't donate, which stops the question", async () => {
    const req = await joinedRequest("Fictional No Hospital", [arun]);
    expect((await checks(arun)).some((c) => c.request_id === req.request_id)).toBe(true);
    expect(await report(arun, req.request_id, false)).toBeNull();
    expect((await response(req.request_id, arun.id)).outcome).toBe("did_not_donate");
    expect((await checks(arun)).some((c) => c.request_id === req.request_id)).toBe(false);
  });

  it("reuses a record the donor already added for that day instead of duplicating it", async () => {
    const req = await joinedRequest("Fictional Reuse Hospital", [sita]);
    const added = await as(db, sita, (tx) =>
      tx.query<{ id: string }>(
        "insert into public.donation_records (donor_id, donation_type, donation_date, centre_name) values ($1, 'whole_blood', $2, 'Fictional Reuse Hospital') returning id",
        [sita.id, todayIst()],
      ),
    );
    expect(await report(sita, req.request_id, true, todayIst())).toBe(added.rows[0].id);
    const count = await db.query<{ n: number }>("select count(*)::int as n from public.donation_records where donor_id = $1", [sita.id]);
    expect(count.rows[0].n).toBe(1);
  });
});

describe("Rakt Mitras follow up after donation", () => {
  it("recording a donation as a Rakt Mitra also starts a follow-up and asks the donor to add it", async () => {
    const req = await joinedRequest("Fictional Directory Hospital", []);
    await as(db, verifier, (tx) => tx.query("select public.record_coordination($1, $2, null, 'donated')", [req.request_id, directoryDonor.id]));
    const rr = await response(req.request_id, directoryDonor.id);
    expect(rr).toMatchObject({ outcome: "donated", donation_record_id: null, followed_up_at: null });
    expect(rr.follow_up_due_at).not.toBeNull();
    const thanks = await notificationsFor(directoryDonor, "Thank you for donating");
    expect(thanks.at(-1)?.body).toContain("Add it to your donation record");
    // They never joined on the site, so the link goes to the donation form.
    expect(thanks.at(-1)?.link).toBe("/donations/new");
  });

  it("a donor whose donation a Rakt Mitra recorded can still add it to their record, without a second follow-up", async () => {
    const donorV = await createUser(db, donor("Vikram Joiner", "+919800000210"));
    const req = await joinedRequest("Fictional Recorded Hospital", [donorV]);
    await as(db, verifier, (tx) => tx.query("select public.record_coordination($1, $2, null, 'donated')", [req.request_id, donorV.id]));
    const before = await notificationsFor(verifier, `Follow up after donation: ${req.reference_code}`);
    expect(before).toHaveLength(1);
    expect((await notificationsFor(donorV, "Thank you for donating")).at(-1)?.link).toBe(`/requests/${req.request_id}`);
    expect((await checks(donorV)).find((c) => c.request_id === req.request_id)).toMatchObject({ outcome: "donated", can_report: true, ask_now: false });

    expect(await expectDbError(report(donorV, req.request_id, false))).toMatch(/already told us/);
    const recordId = await report(donorV, req.request_id, true, todayIst());
    expect(recordId).not.toBeNull();
    expect(await response(req.request_id, donorV.id)).toMatchObject({ outcome: "donated", donation_record_id: recordId });
    expect(await notificationsFor(verifier, `Follow up after donation: ${req.reference_code}`)).toHaveLength(1);
    expect((await checks(donorV)).find((c) => c.request_id === req.request_id)).toMatchObject({ can_report: false });
    expect(await expectDbError(report(donorV, req.request_id, true, todayIst()))).toMatch(/already told us/);
  });

  it("goes to the Rakt Mitras coordinating the request when there are any", async () => {
    const donorX = await createUser(db, donor("Xena Joiner", "+919800000206"));
    const req = await joinedRequest("Fictional Assigned Hospital", [donorX]);
    await as(db, coordinator, (tx) => tx.query("select public.assign_request($1)", [req.request_id]));
    await report(donorX, req.request_id, true);
    expect(await notificationsFor(coordinator, `Follow up after donation: ${req.reference_code}`)).toHaveLength(1);
    expect(await notificationsFor(verifier, `Follow up after donation: ${req.reference_code}`)).toHaveLength(0);
  });

  it("lets Rakt Mitras open the donor's contact after the request closes, until the follow-up is done", async () => {
    const donorY = await createUser(db, donor("Yash Joiner", "+919800000207"));
    const req = await joinedRequest("Fictional Closed Hospital", [donorY, outsider]);
    await report(donorY, req.request_id, true);
    await as(db, verifier, (tx) => tx.query("select public.set_request_status($1, 'fulfilled', 'Blood bank confirmed the donation')", [req.request_id]));

    const contact = await as(db, verifier, (tx) =>
      tx.query<{ phone: string }>("select * from public.reveal_donor_contact($1, $2)", [donorY.id, req.request_id]),
    );
    expect(contact.rows[0].phone).toBe("+919800000207");
    const audit = await db.query<{ basis: string }>(
      "select metadata ->> 'basis' as basis from public.audit_logs where action = 'donor_contact.revealed' and entity_id = $1 order by created_at desc limit 1",
      [donorY.id],
    );
    expect(audit.rows[0].basis).toBe("donation_follow_up");
    // Someone who joined but did not donate: the closed request gives no access.
    expect(await expectDbError(as(db, verifier, (tx) => tx.query("select * from public.reveal_donor_contact($1, $2)", [outsider.id, req.request_id])))).toMatch(
      /verified, active/,
    );

    // Members can't mark follow-ups; Rakt Mitras can, once, with a note for the team.
    expect(
      await expectDbError(as(db, patient, (tx) => tx.query("select public.complete_donation_follow_up($1, $2, null)", [req.request_id, donorY.id]))),
    ).toMatch(/authorised/);
    await as(db, verifier, (tx) =>
      tx.query("select public.complete_donation_follow_up($1, $2, $3)", [req.request_id, donorY.id, "Feeling fine, thanked them."]),
    );
    const rr = await response(req.request_id, donorY.id);
    expect(rr.followed_up_at).not.toBeNull();
    expect(rr.followed_up_by).toBe(verifier.id);
    const note = await db.query<{ body: string }>(
      "select body from public.internal_notes where subject_type = 'blood_request' and subject_id = $1 order by created_at desc limit 1",
      [req.request_id],
    );
    expect(note.rows[0].body).toMatch(/^Follow-up with Donor #[0-9A-F]{4}: Feeling fine, thanked them\.$/);
    expect(note.rows[0].body).not.toContain("Yash");
    expect(
      await expectDbError(as(db, verifier, (tx) => tx.query("select public.complete_donation_follow_up($1, $2, null)", [req.request_id, donorY.id]))),
    ).toMatch(/no follow-up waiting/);
    // Done: no more access through the closed request.
    expect(await expectDbError(as(db, verifier, (tx) => tx.query("select * from public.reveal_donor_contact($1, $2)", [donorY.id, req.request_id])))).toMatch(
      /verified, active/,
    );
  });

  it("correcting the outcome clears the follow-up", async () => {
    const donorZ = await createUser(db, donor("Zoya Joiner", "+919800000208"));
    const req = await joinedRequest("Fictional Correction Hospital", [donorZ]);
    await report(donorZ, req.request_id, true);
    await as(db, verifier, (tx) => tx.query("select public.record_coordination($1, $2, null, 'did_not_donate')", [req.request_id, donorZ.id]));
    expect(await response(req.request_id, donorZ.id)).toMatchObject({ outcome: "did_not_donate", donated_on: null, follow_up_due_at: null });
  });
});

describe("asking donors after the request's time", () => {
  it("asks once the needed-by time has passed, and stops a while after the request closes", async () => {
    const donorW = await createUser(db, donor("Wasim Joiner", "+919800000209"));
    const req = await joinedRequest("Fictional Later Hospital", [donorW]);
    let mine = (await checks(donorW)).find((c) => c.request_id === req.request_id);
    expect(mine).toMatchObject({ outcome: "pending", can_report: true, ask_now: false });

    await db.query("update public.blood_requests set required_by = now() - interval '2 hours' where id = $1", [req.request_id]);
    mine = (await checks(donorW)).find((c) => c.request_id === req.request_id);
    expect(mine).toMatchObject({ can_report: true, ask_now: true });

    await db.query(
      "update public.blood_requests set status = 'fulfilled', required_by = now() - interval '21 days', closed_at = now() - interval '20 days' where id = $1",
      [req.request_id],
    );
    expect((await checks(donorW)).some((c) => c.request_id === req.request_id)).toBe(false);
    expect(await expectDbError(report(donorW, req.request_id, true))).toMatch(/has closed/);
  });
});
