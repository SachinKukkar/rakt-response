import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { as, createTestDb, createUser, donorMetadata, expectDbError, makeStaff, type Db, type TestUser } from "./harness";

let db: Db;
let donorA: TestUser;
let donorB: TestUser;
let volunteer: TestUser;
let admin: TestUser;

beforeAll(async () => {
  db = await createTestDb();
  donorA = await createUser(db, donorMetadata({ full_name: "Asha Fictional" }));
  donorB = await createUser(db, donorMetadata({ full_name: "Bharat Fictional", blood_group: "B-" }));
  volunteer = await createUser(db, donorMetadata({ full_name: "Vina Volunteer" }));
  admin = await createUser(db, donorMetadata({ full_name: "Arun Admin" }));
  await makeStaff(db, volunteer, "volunteer");
  await makeStaff(db, admin, "admin");
});

afterAll(async () => {
  await db.close();
});

describe("signup bootstrap trigger", () => {
  it("creates the profile, private contacts, preferences, location and self-reported history", async () => {
    const user = await createUser(
      db,
      donorMetadata({
        donations: [
          { donation_type: "whole_blood", donation_date: "2025-01-10", centre_name: "Fictional Blood Centre" },
          { donation_type: "sdp", donation_date: "2025-03-02", centre_name: "Fictional Hospital" },
          { donation_type: "sdp", donation_date: "2999-01-01", centre_name: "Future date is skipped" },
        ],
      }),
    );
    const profile = await db.query<{ blood_group: string; is_donor: boolean; terms_accepted_at: string | null }>(
      "select blood_group, is_donor, terms_accepted_at from public.profiles where id = $1",
      [user.id],
    );
    expect(profile.rows[0]).toMatchObject({ blood_group: "O+", is_donor: true });
    expect(profile.rows[0].terms_accepted_at).not.toBeNull();

    const contacts = await db.query<{ phone: string; email: string }>(
      "select phone, email from public.profile_contacts where profile_id = $1",
      [user.id],
    );
    expect(contacts.rows[0]).toEqual({ phone: "+919800000001", email: user.email });

    const records = await db.query<{ record_source: string; verification_status: string }>(
      "select record_source, verification_status from public.donation_records where donor_id = $1",
      [user.id],
    );
    expect(records.rows).toHaveLength(2);
    expect(records.rows.every((r) => r.record_source === "self_reported" && r.verification_status === "pending")).toBe(true);

    const consents = await db.query<{ count: number }>(
      "select count(*)::int as count from public.consent_events where profile_id = $1",
      [user.id],
    );
    expect(consents.rows[0].count).toBeGreaterThanOrEqual(4);
  });

  it("keeps only the name in auth metadata so contact details never reach the JWT", async () => {
    const user = await createUser(db, donorMetadata({ full_name: "Token Check" }));
    const meta = await db.query<{ raw_user_meta_data: Record<string, unknown> }>(
      "select raw_user_meta_data from auth.users where id = $1",
      [user.id],
    );
    expect(meta.rows[0].raw_user_meta_data).toEqual({ full_name: "Token Check", display_name: "Test D." });
    const phone = await db.query<{ phone: string }>("select phone from public.profile_contacts where profile_id = $1", [user.id]);
    expect(phone.rows[0].phone).toBe("+919800000001");
  });

  it("never derives roles from signup metadata", async () => {
    const user = await createUser(db, { ...donorMetadata(), role: "admin", staff_role: "admin", is_admin: true });
    const roles = await db.query("select * from public.staff_roles where user_id = $1", [user.id]);
    expect(roles.rows).toHaveLength(0);
  });

  it("still creates a minimal private profile from malformed metadata", async () => {
    const user = await createUser(db, {
      full_name: 42,
      blood_group: "Z+",
      phone: "not-a-number",
      preferences: { directory_visible: "yes" },
      location: { state: "", district: "x" },
    });
    const profile = await db.query<{ full_name: string; is_donor: boolean }>(
      "select full_name, is_donor from public.profiles where id = $1",
      [user.id],
    );
    expect(profile.rows[0]).toEqual({ full_name: "Rakt Response member", is_donor: false });
    const prefs = await db.query<{ directory_visible: boolean; contact_consent: boolean }>(
      "select directory_visible, contact_consent from public.donor_preferences where profile_id = $1",
      [user.id],
    );
    expect(prefs.rows[0]).toEqual({ directory_visible: false, contact_consent: false });
  });

  it("keeps preferences private by default", async () => {
    const user = await createUser(db, { full_name: "Private Person", blood_group: "A+", is_donor: true });
    const prefs = await db.query<Record<string, boolean>>(
      "select directory_visible, contact_consent, emergency_alerts, open_to_contact from public.donor_preferences where profile_id = $1",
      [user.id],
    );
    expect(Object.values(prefs.rows[0]).every((v) => v === false)).toBe(true);
  });
});

describe("profile privacy (RLS)", () => {
  it("anonymous visitors cannot read profiles, contacts or locations", async () => {
    for (const table of ["profiles", "profile_contacts", "donor_locations", "donation_records", "blood_requests"]) {
      const message = await expectDbError(as(db, null, (tx) => tx.query(`select * from public.${table}`)));
      expect(message).toMatch(/permission denied/);
    }
  });

  it("a donor sees only their own profile", async () => {
    const rows = await as(db, donorA, (tx) => tx.query<{ id: string }>("select id from public.profiles"));
    expect(rows.rows.map((r) => r.id)).toEqual([donorA.id]);
  });

  it("a donor cannot read another donor's contact details or location", async () => {
    const contacts = await as(db, donorA, (tx) =>
      tx.query("select * from public.profile_contacts where profile_id = $1", [donorB.id]),
    );
    expect(contacts.rows).toHaveLength(0);
    const locations = await as(db, donorA, (tx) =>
      tx.query("select * from public.donor_locations where profile_id = $1", [donorB.id]),
    );
    expect(locations.rows).toHaveLength(0);
  });

  it("volunteers cannot browse profiles, locations or contacts directly — only minimal labels", async () => {
    const profiles = await as(db, volunteer, (tx) => tx.query("select id from public.profiles where id = $1", [donorB.id]));
    expect(profiles.rows).toHaveLength(0);
    const locations = await as(db, volunteer, (tx) => tx.query("select * from public.donor_locations where profile_id = $1", [donorB.id]));
    expect(locations.rows).toHaveLength(0);
    const labels = await as(db, volunteer, (tx) =>
      tx.query<{ label: string }>("select * from public.staff_profile_labels(array[$1]::uuid[])", [donorB.id]),
    );
    expect(labels.rows[0].label).toBe("Test D.");
    const donorAttempt = await expectDbError(as(db, donorA, (tx) => tx.query("select * from public.staff_profile_labels(array[$1]::uuid[])", [donorB.id])));
    expect(donorAttempt).toMatch(/Not authorised/);
    const contacts = await as(db, volunteer, (tx) =>
      tx.query("select * from public.profile_contacts where profile_id = $1", [donorB.id]),
    );
    expect(contacts.rows).toHaveLength(0);
  });

  it("administrators can read contact rows", async () => {
    const contacts = await as(db, admin, (tx) =>
      tx.query("select phone from public.profile_contacts where profile_id = $1", [donorB.id]),
    );
    expect(contacts.rows).toHaveLength(1);
  });

  it("a donor can edit permitted fields of their own profile", async () => {
    await as(db, donorA, (tx) => tx.query("update public.profiles set display_name = 'Asha F.' where id = $1", [donorA.id]));
    const row = await db.query<{ display_name: string }>("select display_name from public.profiles where id = $1", [donorA.id]);
    expect(row.rows[0].display_name).toBe("Asha F.");
  });

  it("a donor cannot update someone else's profile", async () => {
    const result = await as(db, donorA, (tx) =>
      tx.query("update public.profiles set display_name = 'Hacked' where id = $1", [donorB.id]),
    );
    expect(result.affectedRows).toBe(0);
  });

  it("a donor cannot mark themselves verified", async () => {
    const message = await expectDbError(
      as(db, donorA, (tx) =>
        tx.query("update public.profiles set verification_status = 'verified', verified_at = now() where id = $1", [donorA.id]),
      ),
    );
    expect(message).toMatch(/protected profile fields/);
  });

  it("a donor cannot change their email copy in contacts", async () => {
    const message = await expectDbError(
      as(db, donorA, (tx) =>
        tx.query("update public.profile_contacts set email = 'x@example.test' where profile_id = $1", [donorA.id]),
      ),
    );
    expect(message).toMatch(/managed through account settings/);
  });

  it("a verified blood group can only change through a correction request", async () => {
    await as(db, admin, (tx) => tx.query("select public.verify_profile($1, 'verified', true, null)", [donorB.id]));
    const message = await expectDbError(
      as(db, donorB, (tx) => tx.query("update public.profiles set blood_group = 'AB+' where id = $1", [donorB.id])),
    );
    expect(message).toMatch(/request a correction/);

    await as(db, donorB, (tx) => tx.query("select public.request_blood_group_change('AB+')"));
    const pending = await db.query<{ requested_blood_group: string; blood_group: string }>(
      "select requested_blood_group, blood_group from public.profiles where id = $1",
      [donorB.id],
    );
    expect(pending.rows[0]).toEqual({ requested_blood_group: "AB+", blood_group: "B-" });

    await as(db, admin, (tx) => tx.query("select public.resolve_blood_group_change($1, true)", [donorB.id]));
    const resolved = await db.query<{ requested_blood_group: string | null; blood_group: string }>(
      "select requested_blood_group, blood_group from public.profiles where id = $1",
      [donorB.id],
    );
    expect(resolved.rows[0]).toEqual({ requested_blood_group: null, blood_group: "AB+" });
  });
});

describe("consent", () => {
  it("revoking contact consent also turns off open-to-contact and is logged", async () => {
    await as(db, donorA, (tx) =>
      tx.query("update public.donor_preferences set contact_consent = false where profile_id = $1", [donorA.id]),
    );
    const prefs = await db.query<{ open_to_contact: boolean; contact_consent_at: string | null }>(
      "select open_to_contact, contact_consent_at from public.donor_preferences where profile_id = $1",
      [donorA.id],
    );
    expect(prefs.rows[0]).toEqual({ open_to_contact: false, contact_consent_at: null });
    const events = await as(db, donorA, (tx) =>
      tx.query<{ granted: boolean }>(
        "select granted from public.consent_events where profile_id = $1 and consent_type = 'contact' order by id desc limit 1",
        [donorA.id],
      ),
    );
    expect(events.rows[0].granted).toBe(false);
    // restore for later tests
    await as(db, donorA, (tx) =>
      tx.query(
        "update public.donor_preferences set contact_consent = true, open_to_contact = true where profile_id = $1",
        [donorA.id],
      ),
    );
  });

  it("a donor cannot read another donor's consent history", async () => {
    const rows = await as(db, donorA, (tx) => tx.query("select * from public.consent_events where profile_id = $1", [donorB.id]));
    expect(rows.rows).toHaveLength(0);
  });
});

describe("roles and privilege escalation", () => {
  it("users cannot insert themselves into staff_roles", async () => {
    const message = await expectDbError(
      as(db, donorA, (tx) => tx.query("insert into public.staff_roles (user_id, role) values ($1, 'admin')", [donorA.id])),
    );
    expect(message).toMatch(/permission denied/);
  });

  it("non-admins cannot grant roles", async () => {
    const message = await expectDbError(
      as(db, volunteer, (tx) => tx.query("select public.grant_staff_role($1, 'admin')", [volunteer.id])),
    );
    expect(message).toMatch(/Only administrators/);
  });

  it("admins cannot change their own role", async () => {
    const message = await expectDbError(as(db, admin, (tx) => tx.query("select public.revoke_staff_role($1)", [admin.id])));
    expect(message).toMatch(/your own role/);
  });

  it("admins can grant and revoke roles, and it is audited", async () => {
    await as(db, admin, (tx) => tx.query("select public.grant_staff_role($1, 'volunteer', true, true, false)", [donorA.id]));
    const granted = await db.query<{ role: string; can_verify_donations: boolean }>(
      "select role, can_verify_donations from public.staff_roles where user_id = $1",
      [donorA.id],
    );
    expect(granted.rows[0]).toEqual({ role: "volunteer", can_verify_donations: true });
    await as(db, admin, (tx) => tx.query("select public.revoke_staff_role($1)", [donorA.id]));
    const isStaff = await as(db, donorA, (tx) => tx.query<{ is_staff: boolean }>("select public.is_staff()"));
    expect(isStaff.rows[0].is_staff).toBe(false);
    const audit = await db.query<{ count: number }>(
      "select count(*)::int as count from public.audit_logs where entity_id = $1 and action like 'staff_roles.%'",
      [donorA.id],
    );
    expect(audit.rows[0].count).toBeGreaterThanOrEqual(2);
  });

  it("bootstrap_first_admin is not callable by signed-in users", async () => {
    const message = await expectDbError(
      as(db, donorA, (tx) => tx.query("select public.bootstrap_first_admin($1)", [donorA.email])),
    );
    expect(message).toMatch(/permission denied/);
  });

  it("bootstrap_first_admin refuses once an administrator exists", async () => {
    const message = await expectDbError(
      as(db, "service_role", (tx) => tx.query("select public.bootstrap_first_admin($1)", [donorA.email])),
    );
    expect(message).toMatch(/already exists/);
  });

  it("bootstrap_first_admin works on a fresh database for a confirmed account", async () => {
    const fresh = await createTestDb();
    const first = await createUser(fresh, donorMetadata());
    const unconfirmed = await createUser(fresh, donorMetadata(), { confirmed: false });
    const notConfirmed = await expectDbError(
      as(fresh, "service_role", (tx) => tx.query("select public.bootstrap_first_admin($1)", [unconfirmed.email])),
    );
    expect(notConfirmed).toMatch(/Confirm the email/);
    await as(fresh, "service_role", (tx) => tx.query("select public.bootstrap_first_admin($1)", [first.email]));
    const isAdmin = await as(fresh, first, (tx) => tx.query<{ is_admin: boolean }>("select public.is_admin()"));
    expect(isAdmin.rows[0].is_admin).toBe(true);
    await fresh.close();
  });

  it("only admins can read audit logs, and nobody can alter them", async () => {
    const donorView = await as(db, donorA, (tx) => tx.query("select * from public.audit_logs"));
    expect(donorView.rows).toHaveLength(0);
    const volunteerView = await as(db, volunteer, (tx) => tx.query("select * from public.audit_logs"));
    expect(volunteerView.rows).toHaveLength(0);
    const adminView = await as(db, admin, (tx) => tx.query("select * from public.audit_logs"));
    expect(adminView.rows.length).toBeGreaterThan(0);
    const deleteAttempt = await expectDbError(db.query("delete from public.audit_logs"));
    expect(deleteAttempt).toMatch(/append-only/);
    const updateAttempt = await expectDbError(db.query("update public.audit_logs set action = 'tampered'"));
    expect(updateAttempt).toMatch(/append-only/);
  });

  it("deleting an account with audit history works and keeps the anonymised entries", async () => {
    const leaver = await createUser(db, donorMetadata({ full_name: "Audit Leaver" }));
    await as(db, leaver, (tx) => tx.query("select public.request_account_deletion('test')"));
    const before = await db.query<{ count: number }>("select count(*)::int as count from public.audit_logs where actor_id = $1", [leaver.id]);
    expect(before.rows[0].count).toBeGreaterThan(0);
    await db.query("delete from auth.users where id = $1", [leaver.id]);
    const orphaned = await db.query<{ count: number }>(
      "select count(*)::int as count from public.audit_logs where entity_id = $1 and action = 'profiles.deletion_requested' and actor_id is null",
      [leaver.id],
    );
    expect(orphaned.rows[0].count).toBe(1);
    const tamper = await expectDbError(db.query("update public.audit_logs set actor_id = null, action = 'x' where actor_id is not null"));
    expect(tamper).toMatch(/append-only/);
  });

  it("platform settings: public keys are readable anonymously, private ones are not", async () => {
    const anon = await as(db, null, (tx) => tx.query<{ key: string }>("select key from public.platform_settings"));
    const keys = anon.rows.map((r) => r.key);
    expect(keys).toContain("org.contact_email");
    expect(keys).not.toContain("contact_reveal_hourly_limit");
    const update = await as(db, donorA, (tx) =>
      tx.query("update public.platform_settings set value = '1' where key = 'contact_reveal_hourly_limit'"),
    );
    expect(update.affectedRows).toBe(0);
  });
});

describe("notifications", () => {
  it("users can mark their own notifications read but cannot rewrite them or read others", async () => {
    const own = await as(db, donorB, (tx) => tx.query<{ id: string }>("select id from public.notifications"));
    expect(own.rows.length).toBeGreaterThan(0);
    const id = own.rows[0].id;
    await as(db, donorB, (tx) => tx.query("update public.notifications set read_at = now() where id = $1", [id]));
    const message = await expectDbError(
      as(db, donorB, (tx) => tx.query("update public.notifications set title = 'changed' where id = $1", [id])),
    );
    expect(message).toMatch(/read status/);
    const others = await as(db, donorA, (tx) => tx.query("select * from public.notifications where id = $1", [id]));
    expect(others.rows).toHaveLength(0);
    const insert = await expectDbError(
      as(db, donorA, (tx) =>
        tx.query("insert into public.notifications (user_id, kind, title) values ($1, 'system', 'spam')", [donorB.id]),
      ),
    );
    expect(insert).toMatch(/permission denied/);
  });
});

describe("account deletion", () => {
  it("a deletion request withdraws the donor from discovery and an admin can anonymise", async () => {
    const leaving = await createUser(db, donorMetadata({ full_name: "Leaving Donor" }));
    await as(db, leaving, (tx) => tx.query("select public.request_account_deletion('moving away')"));
    const prefs = await db.query<{ directory_visible: boolean }>(
      "select directory_visible from public.donor_preferences where profile_id = $1",
      [leaving.id],
    );
    expect(prefs.rows[0].directory_visible).toBe(false);

    const notAllowed = await expectDbError(as(db, volunteer, (tx) => tx.query("select public.anonymize_account($1)", [leaving.id])));
    expect(notAllowed).toMatch(/Only administrators/);

    await as(db, admin, (tx) => tx.query("select public.anonymize_account($1)", [leaving.id]));
    const profile = await db.query<{ full_name: string; is_active: boolean; blood_group: string | null }>(
      "select full_name, is_active, blood_group from public.profiles where id = $1",
      [leaving.id],
    );
    expect(profile.rows[0]).toEqual({ full_name: "Deleted member", is_active: false, blood_group: null });
    const contacts = await db.query<{ phone: string | null; email: string | null }>(
      "select phone, email from public.profile_contacts where profile_id = $1",
      [leaving.id],
    );
    expect(contacts.rows[0]).toEqual({ phone: null, email: null });
  });
});
