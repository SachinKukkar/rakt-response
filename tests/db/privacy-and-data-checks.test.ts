import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { as, createTestDb, createUser, donorMetadata, expectDbError, makeStaff, type Db, type TestUser } from "./harness";

let db: Db;
let noDisplayName: TestUser;
let withDisplayName: TestUser;
let twin: TestUser;
let volunteer: TestUser;
let admin: TestUser;

beforeAll(async () => {
  db = await createTestDb();
  noDisplayName = await createUser(db, donorMetadata({ full_name: "Priya Sharma Fictional", display_name: "", phone: "+919811100001" }));
  withDisplayName = await createUser(db, donorMetadata({ full_name: "Anita Rao Fictional", display_name: "Anu", phone: "+919811100002" }));
  // Same mobile number as `noDisplayName`: should be flagged for review.
  twin = await createUser(db, donorMetadata({ full_name: "Second Account Fictional", display_name: "", phone: "+919811100001" }));
  volunteer = await createUser(db, donorMetadata({ full_name: "Vikram Volunteer Fictional", display_name: "" }));
  admin = await createUser(db, donorMetadata({ full_name: "Admin Person Fictional" }));
  await makeStaff(db, volunteer, "volunteer");
  await makeStaff(db, admin, "admin");
});

afterAll(async () => {
  await db.close();
});

const names = (rows: Array<{ donor_id: string; display_name: string }>) => new Map(rows.map((r) => [r.donor_id, r.display_name]));

describe("donor names shown to volunteers", () => {
  it("never shows a full name: display name, else a neutral code", async () => {
    const result = await as(db, volunteer, (tx) =>
      tx.query<{ donor_id: string; display_name: string }>("select donor_id, display_name from public.search_donors(p_limit => 50)"),
    );
    const byId = names(result.rows);
    expect(byId.get(withDisplayName.id)).toBe("Anu");
    expect(byId.get(noDisplayName.id)).toMatch(/^Donor #[0-9A-F]{4}$/);
    for (const label of byId.values()) expect(label).not.toMatch(/Sharma|Rao|Fictional/);
  });

  it("does not let volunteers find donors by their hidden surname", async () => {
    const result = await as(db, volunteer, (tx) => tx.query("select donor_id from public.search_donors(p_query => 'Sharma')"));
    expect(result.rows).toHaveLength(0);
  });

  it("shows the first name only when the donor opts in", async () => {
    await as(db, noDisplayName, (tx) =>
      tx.query("update public.donor_preferences set show_first_name = true where profile_id = $1", [noDisplayName.id]),
    );
    const result = await as(db, volunteer, (tx) =>
      tx.query<{ donor_id: string; display_name: string }>("select donor_id, display_name from public.search_donors(p_limit => 50)"),
    );
    expect(names(result.rows).get(noDisplayName.id)).toBe("Priya");
  });

  it("keeps full names for administrators", async () => {
    const result = await as(db, admin, (tx) =>
      tx.query<{ donor_id: string; display_name: string }>("select donor_id, display_name from public.search_donors(p_query => 'Sharma')"),
    );
    expect(names(result.rows).get(noDisplayName.id)).toBe("Priya Sharma Fictional");
  });

  it("labels staff by their usual name so volunteers recognise each other", async () => {
    const result = await as(db, volunteer, (tx) =>
      tx.query<{ id: string; label: string }>("select id, label from public.staff_profile_labels($1::uuid[])", [[volunteer.id, twin.id]]),
    );
    const byId = new Map(result.rows.map((r) => [r.id, r.label]));
    expect(byId.get(volunteer.id)).toBe("Vikram");
    expect(byId.get(twin.id)).toMatch(/^Donor #/);
  });
});

describe("administrator data checks", () => {
  type Check = { key: string; total: number; items: Array<{ profile_id: string; name: string; detail: string }> };
  const run = (user: TestUser) =>
    as(db, user, (tx) => tx.query<{ r: { checks: Check[] } }>("select public.admin_data_checks() as r")).then((res) => res.rows[0].r.checks);

  it("is administrator-only", async () => {
    expect(await expectDbError(run(volunteer))).toMatch(/Only administrators/);
    expect(await expectDbError(run(noDisplayName))).toMatch(/Only administrators/);
  });

  it("flags close donations, shared phone numbers and blood groups to confirm", async () => {
    await db.query(
      `insert into public.donation_records (donor_id, donation_type, donation_date, centre_name, verification_status, verified_at)
       values ($1, 'whole_blood', '2026-01-01', 'Fictional Centre', 'verified', now()),
              ($1, 'whole_blood', '2026-01-31', 'Fictional Centre', 'pending', null)`,
      [withDisplayName.id],
    );
    const checks = await run(admin);
    const find = (key: string) => checks.find((c) => c.key === key);

    const close = find("whole_blood_too_close");
    expect(close?.items.map((i) => i.profile_id)).toEqual([withDisplayName.id]);
    expect(close?.items[0].detail).toMatch(/30 days apart/);

    const shared = find("shared_phone");
    const sharedIds = shared?.items.map((i) => i.profile_id) ?? [];
    expect(sharedIds).toEqual(expect.arrayContaining([noDisplayName.id, twin.id]));
    expect(sharedIds).not.toContain(withDisplayName.id);

    expect(find("group_to_confirm")?.items.map((i) => i.profile_id)).toEqual([withDisplayName.id]);
    // Administrators see full names in the report.
    expect(close?.items[0].name).toBe("Anita Rao Fictional");
  });
});
