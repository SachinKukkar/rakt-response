import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Transaction } from "@electric-sql/pglite";
import { as, createTestDb, createUser, donorMetadata, expectDbError, makeStaff, type Db, type TestUser } from "./harness";

let db: Db;
let patient: TestUser;
let secondPatient: TestUser;
let busyPatient: TestUser;
let oldFormPatient: TestUser;
let verifier: TestUser;
let ready: TestUser;
let emailDonor: TestUser;
let oldSdp: TestUser;
let recent: TestUser;
let recentSdp: TestUser;
let hidden: TestUser;
let paused: TestUser;
let otherGroup: TestUser;
let otherDistrict: TestUser;
let noPhone: TestUser;
let oldForm: TestUser;
let inAppDonor: TestUser;

const inHours = (h: number) => new Date(Date.now() + h * 3600_000).toISOString();
const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString().slice(0, 10);
const addDays = (date: string, n: number) => new Date(Date.parse(`${date}T00:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);

const donorWith = (name: string, phone: string | null, overrides: Record<string, unknown> = {}, prefs: Record<string, unknown> = {}) =>
  donorMetadata({
    full_name: name,
    display_name: null,
    phone,
    preferences: {
      directory_visible: true,
      contact_consent: true,
      emergency_alerts: true,
      open_to_contact: true,
      hide_number: false,
      preferred_contact_method: "phone",
      ...prefs,
    },
    ...overrides,
  });

async function createRequest(tx: Transaction, overrides: Partial<Record<string, unknown>> = {}) {
  const p = {
    patientName: "Fictional Patient",
    patientAge: 42,
    patientGender: "female",
    group: "O+",
    type: "whole_blood",
    units: 2,
    hospital: "Fictional General Hospital",
    state: "Maharashtra",
    district: "Pune",
    city: "Pune",
    hospitalPatientId: "IP-12345",
    ward: "Ward 4",
    reason: "surgery",
    requiredBy: inHours(24),
    urgency: "urgent",
    requesterName: "Fictional Requester",
    relation: "child",
    phone: "+919811111111",
    method: "phone",
    notes: null,
    ...overrides,
  };
  const result = await tx.query<{ request_id: string; reference_code: string }>(
    `select * from public.create_blood_request($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)`,
    [
      p.patientName, p.patientAge, p.patientGender, p.group, p.type, p.units, p.hospital, p.state, p.district, p.city,
      p.hospitalPatientId, p.ward, p.reason, p.requiredBy, p.urgency, p.requesterName, p.relation, p.phone, p.method, p.notes,
    ],
  );
  return result.rows[0];
}

type DonorRow = { donor_id: string; label: string; joined: boolean; hidden: boolean; contact_opened: boolean; phone: string | null };
const listDonors = (who: TestUser, requestId: string) =>
  as(db, who, (tx) => tx.query<DonorRow>("select * from public.list_eligible_donors_for_my_request($1)", [requestId])).then((r) => r.rows);
const reveal = (who: TestUser, requestId: string, donorId: string) =>
  as(db, who, (tx) =>
    tx.query<{ channel: string; phone: string | null; whatsapp: string | null; email: string | null }>(
      "select * from public.reveal_donor_contact_to_requester($1, $2)",
      [requestId, donorId],
    ),
  ).then((r) => r.rows[0]);
const verify = (requestId: string) => as(db, verifier, (tx) => tx.query("select public.set_request_status($1, 'verified')", [requestId]));
const join = (who: TestUser, requestId: string) =>
  as(db, who, (tx) => tx.query("select public.respond_to_blood_request($1, 'interested')", [requestId]));
const setting = (key: string, value: number) => db.query("update public.platform_settings set value = $2::jsonb where key = $1", [key, String(value)]);

beforeAll(async () => {
  db = await createTestDb();
  patient = await createUser(db, { full_name: "Pooja Patient", is_donor: false, terms_accepted: true });
  secondPatient = await createUser(db, { full_name: "Second Patient", is_donor: false, terms_accepted: true });
  busyPatient = await createUser(db, { full_name: "Busy Patient", is_donor: false, terms_accepted: true });
  oldFormPatient = await createUser(db, { full_name: "Old Form Patient", is_donor: false, terms_accepted: true });
  verifier = await createUser(db, { full_name: "Vera Verifier", is_donor: false, terms_accepted: true });
  await makeStaff(db, verifier, "volunteer", { can_verify_requests: true });

  ready = await createUser(db, donorWith("Ravi Ready", "+919800000101"));
  emailDonor = await createUser(db, donorWith("Esha Email", "+919800000102", {}, { preferred_contact_method: "email" }));
  oldSdp = await createUser(
    db,
    donorWith("Om SDP", "+919800000103", { donations: [{ donation_type: "sdp", donation_date: daysAgo(20), centre_name: "Fictional Blood Centre" }] }, { preferred_contact_method: "whatsapp" }),
  );
  recent = await createUser(db, donorWith("Rina Recent", "+919800000104", { donations: [{ donation_type: "whole_blood", donation_date: daysAgo(30), centre_name: "Fictional Blood Centre" }] }));
  recentSdp = await createUser(db, donorWith("Sam SDP", "+919800000105", { donations: [{ donation_type: "sdp", donation_date: daysAgo(5), centre_name: "Fictional Blood Centre" }] }));
  hidden = await createUser(db, donorWith("Hema Hidden", "+919800000106", {}, { hide_number: true }));
  paused = await createUser(db, donorWith("Paras Paused", "+919800000107", {}, { open_to_contact: false }));
  otherGroup = await createUser(db, donorWith("Bina B", "+919800000108", { blood_group: "B+" }));
  otherDistrict = await createUser(
    db,
    donorWith("Mohan Mumbai", "+919800000109", { location: { state: "Maharashtra", district: "Mumbai", city: "Mumbai" } }),
  );
  noPhone = await createUser(db, donorWith("Nina NoPhone", null));
  // An older registration form: no "Hide my number" key, and contact switched off.
  oldForm = await createUser(
    db,
    donorMetadata({
      full_name: "Olga Old",
      phone: "+919800000110",
      preferences: { directory_visible: true, contact_consent: false, emergency_alerts: false, open_to_contact: false },
    }),
  );
  inAppDonor = await createUser(
    db,
    donorMetadata({
      full_name: "Ian InApp",
      phone: "+919800000111",
      preferences: { directory_visible: true, contact_consent: true, open_to_contact: true, preferred_contact_method: "in_app" },
    }),
  );
});

afterAll(async () => {
  await db.close();
});

describe("signup and Hide my number", () => {
  it("an older form that switched off contact starts hidden; a donor without a phone starts hidden", async () => {
    const { rows } = await db.query<{ profile_id: string; hide_number: boolean }>(
      "select profile_id, hide_number from public.donor_preferences where profile_id = any($1)",
      [[oldForm.id, noPhone.id, ready.id, inAppDonor.id]],
    );
    const hiddenById = Object.fromEntries(rows.map((r) => [r.profile_id, r.hide_number]));
    expect(hiddenById[oldForm.id]).toBe(true);
    expect(hiddenById[noPhone.id]).toBe(true);
    expect(hiddenById[ready.id]).toBe(false);
    expect(hiddenById[inAppDonor.id]).toBe(false);
  });

  it("'In-app' becomes Call", async () => {
    const { rows } = await db.query<{ preferred_contact_method: string }>(
      "select preferred_contact_method from public.donor_preferences where profile_id = $1",
      [inAppDonor.id],
    );
    expect(rows[0].preferred_contact_method).toBe("phone");
  });

  it("showing the number again turns directory and contact back on, and each change is logged", async () => {
    await as(db, oldForm, (tx) => tx.query("update public.donor_preferences set hide_number = false where profile_id = $1", [oldForm.id]));
    const prefs = await db.query<{ directory_visible: boolean; contact_consent: boolean; hide_number: boolean }>(
      "select directory_visible, contact_consent, hide_number from public.donor_preferences where profile_id = $1",
      [oldForm.id],
    );
    expect(prefs.rows[0]).toEqual({ directory_visible: true, contact_consent: true, hide_number: false });
    const events = await db.query<{ granted: boolean }>(
      "select granted from public.consent_events where profile_id = $1 and consent_type = 'hide_number' order by id",
      [oldForm.id],
    );
    expect(events.rows.map((e) => e.granted)).toEqual([true, false]);
    // Back to hidden for the rest of the tests.
    await as(db, oldForm, (tx) => tx.query("update public.donor_preferences set hide_number = true where profile_id = $1", [oldForm.id]));
  });
});

describe("a donor's own next date", () => {
  it("is the date they can give again, or empty when they can give now", async () => {
    const next = (who: TestUser) =>
      as(db, who, (tx) => tx.query<{ d: string | null }>("select public.my_next_eligible_date()::text as d")).then((r) => r.rows[0].d);
    expect(await next(recent)).toBe(addDays(daysAgo(30), 90));
    expect(await next(recentSdp)).toBe(addDays(daysAgo(5), 14));
    expect(await next(ready)).toBeNull();
    expect(await next(oldSdp)).toBeNull();
  });
});

describe("requests need an account and the patient's details", () => {
  it("anonymous visitors cannot create requests", async () => {
    const message = await expectDbError(as(db, null, (tx) => createRequest(tx)));
    expect(message).toMatch(/permission denied/);
  });

  it("the old submission path no longer takes requests without an account, even from the server", async () => {
    const message = await expectDbError(
      as(db, "service_role", (tx) =>
        tx.query(
          `select * from public.submit_blood_request('Anon', '+919811111111', null, 'phone', 'O+', 'whole_blood', 1,
             'Anon Hospital', 'Maharashtra', 'Pune', 'Pune', $1, 'urgent', null, true, 'client-key')`,
          [inHours(24)],
        ),
      ),
    );
    expect(message).toMatch(/sign in/);
  });

  it("rejects a request without the patient's name, a valid phone or the requester's relation", async () => {
    for (const overrides of [{ patientName: "" }, { phone: "98111" }, { relation: "neighbour" }, { units: null }, { method: "in_app" }]) {
      const message = await expectDbError(as(db, busyPatient, (tx) => createRequest(tx, overrides)));
      expect(message).toMatch(/not valid/);
    }
  });

  it("a member can have at most two open requests", async () => {
    await as(db, busyPatient, (tx) => createRequest(tx, { hospital: "Busy Hospital 1" }));
    await as(db, busyPatient, (tx) => createRequest(tx, { hospital: "Busy Hospital 2" }));
    const third = await expectDbError(as(db, busyPatient, (tx) => createRequest(tx, { hospital: "Busy Hospital 3" })));
    expect(third).toMatch(/already have open requests/);
  });
});

describe("a patient's donor list", () => {
  let requestId: string;

  it("is empty until a volunteer verifies the request", async () => {
    requestId = (await as(db, patient, (tx) => createRequest(tx))).request_id;
    expect(await listDonors(patient, requestId)).toEqual([]);
  });

  it("after verification shows only donors who can give now, nearby, by first name, without contact details", async () => {
    await verify(requestId);
    const rows = await listDonors(patient, requestId);
    expect(new Set(rows.map((r) => r.donor_id))).toEqual(new Set([ready.id, emailDonor.id, oldSdp.id, inAppDonor.id]));
    const ravi = rows.find((r) => r.donor_id === ready.id)!;
    expect(ravi.label).toBe("Ravi");
    expect(ravi.joined).toBe(false);
    expect(ravi.contact_opened).toBe(false);
    expect(ravi.phone).toBeNull();
  });

  it("is refused to anyone but the request's creator", async () => {
    const message = await expectDbError(listDonors(secondPatient, requestId));
    expect(message).toMatch(/not yours/);
  });

  it("opens one contact at a time on the donor's own channel, records it and logs it", async () => {
    const call = await reveal(patient, requestId, ready.id);
    expect(call).toEqual({ channel: "phone", phone: "+919800000101", whatsapp: null, email: null });
    const mail = await reveal(patient, requestId, emailDonor.id);
    expect(mail.channel).toBe("email");
    expect(mail.phone).toBeNull();
    expect(mail.email).toMatch(/@example\.test$/);
    const whatsapp = await reveal(patient, requestId, oldSdp.id);
    expect(whatsapp).toMatchObject({ channel: "whatsapp", whatsapp: "+919800000103", phone: null });

    const rows = await listDonors(patient, requestId);
    expect(rows.find((r) => r.donor_id === ready.id)).toMatchObject({ contact_opened: true, phone: "+919800000101" });
    const disclosures = await db.query("select * from public.donor_disclosures where request_id = $1", [requestId]);
    expect(disclosures.rows).toHaveLength(3);
    const audit = await db.query(
      "select * from public.audit_logs where action = 'donor_contact.revealed_to_requester' and entity_id = $1",
      [ready.id],
    );
    expect(audit.rows).toHaveLength(1);
  });

  it("never opens a hidden, recent or other-district donor", async () => {
    for (const donor of [hidden, recent, recentSdp, otherDistrict, paused]) {
      const message = await expectDbError(reveal(patient, requestId, donor.id));
      expect(message).toMatch(/not available/);
    }
  });

  it("limits new contacts per hour and per 30 days; reopening one already opened is free", async () => {
    await setting("requester_reveal_hourly_limit", 3);
    const hourly = await expectDbError(reveal(patient, requestId, inAppDonor.id));
    expect(hourly).toMatch(/last hour/);
    expect((await reveal(patient, requestId, ready.id)).phone).toBe("+919800000101");
    await setting("requester_reveal_hourly_limit", 15);
    await setting("requester_reveal_monthly_donors", 3);
    const monthly = await expectDbError(reveal(patient, requestId, inAppDonor.id));
    expect(monthly).toMatch(/this month/);
    await setting("requester_reveal_monthly_donors", 40);
  });
});

describe("donors joining requests", () => {
  let requestId: string;
  let secondRequestId: string;

  beforeAll(async () => {
    requestId = (await as(db, secondPatient, (tx) => createRequest(tx, { hospital: "Join Test Hospital" }))).request_id;
    await verify(requestId);
  });

  it("donors see open verified requests with whether they can join, and why not", async () => {
    type Row = { request_id: string; can_join: boolean; reason: string | null; eligible_from: string | null; matches_group: boolean };
    const listFor = async (who: TestUser) =>
      (await as(db, who, (tx) =>
        tx.query<Row>(
          "select request_id, can_join, reason, eligible_from::text as eligible_from, matches_group from public.list_open_requests_for_donor()",
        ),
      )).rows.find(
        (r) => r.request_id === requestId,
      )!;
    expect(await listFor(ready)).toMatchObject({ can_join: true, reason: null, matches_group: true });
    const tooSoon = await listFor(recent);
    expect(tooSoon).toMatchObject({ can_join: false, reason: "too_soon" });
    expect(tooSoon.eligible_from).toBe(addDays(daysAgo(30), 90));
    expect(await listFor(otherGroup)).toMatchObject({ can_join: false, reason: "other_group", matches_group: false });
    expect(await listFor(patient)).toMatchObject({ can_join: false, reason: "not_donor" });
  });

  it("joining needs the same blood group and enough time since the last donation", async () => {
    expect(await expectDbError(join(recent, requestId))).toMatch(/too recent/);
    expect(await expectDbError(join(otherGroup, requestId))).toMatch(/different blood group/);
    expect(await expectDbError(join(secondPatient, requestId))).toMatch(/donor profile/);
  });

  it("a donor who joins is shown first to the patient, who is notified; the donor sees the patient and hospital details", async () => {
    await join(ready, requestId);
    const notes = await db.query<{ link: string }>(
      "select link from public.notifications where user_id = $1 and kind = 'request_update' and link = $2 and title like 'A donor is ready%'",
      [secondPatient.id, `/requests/${requestId}`],
    );
    expect(notes.rows).toHaveLength(1);
    const rows = await listDonors(secondPatient, requestId);
    expect(rows[0]).toMatchObject({ donor_id: ready.id, joined: true });
    const details = await as(db, ready, (tx) => tx.query("select * from public.get_request_details_for_donor($1)", [requestId]));
    expect(details.rows[0]).toMatchObject({
      patient_name: "Fictional Patient",
      hospital_patient_id: "IP-12345",
      requester_name: "Fictional Requester",
      requester_relation: "child",
      requester_phone: "+919811111111",
    });
    const notJoined = await as(db, emailDonor, (tx) => tx.query("select * from public.get_request_details_for_donor($1)", [requestId]));
    expect(notJoined.rows).toHaveLength(0);
  });

  it("a hidden donor who joins is shown to the patient without a number", async () => {
    await join(hidden, requestId);
    const row = (await listDonors(secondPatient, requestId)).find((r) => r.donor_id === hidden.id);
    expect(row).toMatchObject({ joined: true, hidden: true, phone: null });
    expect(await expectDbError(reveal(secondPatient, requestId, hidden.id))).toMatch(/not available/);
  });

  it("limits how many open requests a donor can join", async () => {
    secondRequestId = (await as(db, busyPatient, (tx) => tx.query<{ id: string }>(
      "select id from public.blood_requests where created_by = $1 and hospital_name = 'Busy Hospital 1'",
      [busyPatient.id],
    ))).rows[0].id;
    await verify(secondRequestId);
    await setting("donor_open_join_limit", 1);
    expect(await expectDbError(join(ready, secondRequestId))).toMatch(/several open requests/);
    await setting("donor_open_join_limit", 3);
    await setting("donor_join_daily_limit", 1);
    expect(await expectDbError(join(ready, secondRequestId))).toMatch(/today/);
    await setting("donor_join_daily_limit", 3);
  });

  it("requesters can't change the place, date or patient after submitting; volunteers can", async () => {
    const message = await expectDbError(
      as(db, secondPatient, (tx) => tx.query("update public.blood_requests set district = 'Mumbai' where id = $1", [requestId])),
    );
    expect(message).toMatch(/Only a volunteer/);
    await as(db, verifier, (tx) => tx.query("update public.blood_requests set ward = 'Ward 7' where id = $1", [requestId]));
  });
});

describe("requests made before this change", () => {
  it("never share the requester's phone with donors who join", async () => {
    const old = await as(db, oldFormPatient, (tx) =>
      tx.query<{ request_id: string }>(
        `select * from public.submit_blood_request('Old Requester', '+919822222222', null, 'phone', 'O+', 'whole_blood', 1,
           'Old Form Hospital', 'Maharashtra', 'Pune', 'Pune', $1, 'urgent', null, true, null)`,
        [inHours(24)],
      ),
    );
    const requestId = old.rows[0].request_id;
    await verify(requestId);
    await join(emailDonor, requestId);
    const details = await as(db, emailDonor, (tx) => tx.query("select * from public.get_request_details_for_donor($1)", [requestId]));
    expect(details.rows[0]).toMatchObject({ requester_name: "Old Requester", requester_phone: null });
  });
});
