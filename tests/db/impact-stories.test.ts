import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Transaction } from "@electric-sql/pglite";
import { as, createTestDb, createUser, donorMetadata, expectDbError, makeStaff, type Db, type TestUser } from "./harness";

let db: Db;
let contributor: TestUser;
let stranger: TestUser;
let volunteer: TestUser;
let admin: TestUser;

const BODY =
  "This is a fictional test story used only by automated tests. It describes an experience in enough words to satisfy the minimum length rule.";

async function submit(tx: Transaction, overrides: Record<string, unknown> = {}): Promise<string> {
  const p = {
    type: "donor",
    name: "Contributor Fictional",
    displayName: "C. Fictional",
    email: "contributor@example.test",
    phone: null,
    city: "Pune",
    title: "My first donation",
    body: BODY,
    period: "March 2026",
    donationType: "whole_blood",
    bloodGroup: "O+",
    campId: null,
    supporting: "Private note for reviewers",
    photo: null,
    consentContact: true,
    consentPublish: true,
    showName: true,
    showPhoto: false,
    showPersonal: false,
    rights: true,
    ...overrides,
  };
  const result = await tx.query<{ submit_story: string }>(
    `select public.submit_story($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)`,
    [
      p.type, p.name, p.displayName, p.email, p.phone, p.city, p.title, p.body, p.period, p.donationType, p.bloodGroup,
      p.campId, p.supporting, p.photo, p.consentContact, p.consentPublish, p.showName, p.showPhoto, p.showPersonal, p.rights,
    ],
  );
  return result.rows[0].submit_story;
}

beforeAll(async () => {
  db = await createTestDb();
  contributor = await createUser(db, donorMetadata({ full_name: "Contributor Fictional" }));
  stranger = await createUser(db, donorMetadata({ full_name: "Stranger Fictional" }));
  volunteer = await createUser(db, donorMetadata({ full_name: "Volunteer Fictional" }));
  admin = await createUser(db, donorMetadata({ full_name: "Admin Fictional" }));
  await makeStaff(db, volunteer, "volunteer");
  await makeStaff(db, admin, "admin");
});

afterAll(async () => {
  await db.close();
});

describe("story submission", () => {
  it("requires sign-in, rights confirmation and publish consent", async () => {
    const anon = await expectDbError(as(db, null, (tx) => submit(tx)));
    expect(anon).toMatch(/permission denied/);
    const noRights = await expectDbError(as(db, contributor, (tx) => submit(tx, { rights: false })));
    expect(noRights).toMatch(/right to share/);
    const noConsent = await expectDbError(as(db, contributor, (tx) => submit(tx, { consentPublish: false })));
    expect(noConsent).toMatch(/consent to publish/);
  });

  it("restricts volunteer stories to authorised volunteers", async () => {
    const message = await expectDbError(as(db, contributor, (tx) => submit(tx, { type: "volunteer" })));
    expect(message).toMatch(/authorised volunteers/);
    const ok = await as(db, volunteer, (tx) => submit(tx, { type: "volunteer", title: "Coordinating at night" }));
    expect(ok).toBeTruthy();
  });

  it("rejects photo paths outside the contributor's folder", async () => {
    const message = await expectDbError(as(db, contributor, (tx) => submit(tx, { photo: `${stranger.id}/x.jpg` })));
    expect(message).toMatch(/Invalid photo/);
  });

  it("keeps submissions private: contributor sees own, strangers and the public see nothing", async () => {
    const id = await as(db, contributor, (tx) => submit(tx));
    const own = await as(db, contributor, (tx) => tx.query("select id from public.impact_stories where id = $1", [id]));
    expect(own.rows).toHaveLength(1);
    const other = await as(db, stranger, (tx) => tx.query("select id from public.impact_stories where id = $1", [id]));
    expect(other.rows).toHaveLength(0);
    const volunteerView = await as(db, volunteer, (tx) => tx.query("select id from public.impact_stories where id = $1", [id]));
    expect(volunteerView.rows).toHaveLength(0);
    const anonTable = await expectDbError(as(db, null, (tx) => tx.query("select * from public.impact_stories")));
    expect(anonTable).toMatch(/permission denied/);
    const publicList = await as(db, null, (tx) => tx.query("select * from public.list_published_stories()"));
    expect(publicList.rows).toHaveLength(0);
    const consents = await as(db, contributor, (tx) => tx.query("select * from public.story_consents where story_id = $1", [id]));
    expect(consents.rows).toHaveLength(1);
  });
});

describe("moderation and publication", () => {
  let storyId: string;

  beforeAll(async () => {
    storyId = await as(db, contributor, (tx) => submit(tx, { title: "A morning at the blood centre" }));
  });

  it("only administrators can moderate", async () => {
    const message = await expectDbError(
      as(db, volunteer, (tx) => tx.query("select public.set_story_status($1, 'under_review')", [storyId])),
    );
    expect(message).toMatch(/Only administrators/);
  });

  it("cannot skip review straight to publication", async () => {
    const message = await expectDbError(as(db, admin, (tx) => tx.query("select public.set_story_status($1, 'published')", [storyId])));
    expect(message).toMatch(/cannot move/);
  });

  it("cannot display details without consent", async () => {
    const message = await expectDbError(
      as(db, admin, (tx) =>
        tx.query("select public.update_story_public_content($1, null, null, null, null, true, false, true, true)", [storyId]),
      ),
    );
    expect(message).toMatch(/consented/);
  });

  it("donation badge requires a verified record belonging to the contributor", async () => {
    const message = await expectDbError(
      as(db, admin, (tx) => tx.query("select public.set_story_verification($1, true, true, true, null)", [storyId])),
    );
    expect(message).toMatch(/verified donation record/);
  });

  it("publishes after review, exposing only permitted fields", async () => {
    await as(db, admin, async (tx) => {
      await tx.query("select public.set_story_status($1, 'under_review')", [storyId]);
      await tx.query("select public.set_story_verification($1, true, true, false, null, 'Spoke to contributor')", [storyId]);
      await tx.query(
        "select public.update_story_public_content($1, 'A morning at the blood centre', null, 'A short excerpt.', 'Chitra', true, false, false, true)",
        [storyId],
      );
      await tx.query("select public.set_story_status($1, 'approved')", [storyId]);
      await tx.query("select public.set_story_status($1, 'published')", [storyId]);
    });
    const list = await as(db, null, (tx) =>
      tx.query<Record<string, unknown>>("select * from public.list_published_stories(array['donor']::public.story_type[])"),
    );
    expect(list.rows).toHaveLength(1);
    const card = list.rows[0];
    expect(card.display_name).toBe("Chitra");
    expect(card.excerpt).toBe("A short excerpt.");
    expect(card.identity_verified).toBe(true);
    expect(card.donation_verified).toBe(false);
    expect(card).not.toHaveProperty("follow_up_email");
    expect(card).not.toHaveProperty("private_supporting_details");

    const detail = await as(db, null, (tx) =>
      tx.query<Record<string, unknown>>("select * from public.get_published_story($1)", [card.slug]),
    );
    expect(detail.rows[0].blood_group).toBeNull(); // no consent for personal details
    expect(detail.rows[0].body).toBe(BODY);

    const events = await as(db, contributor, (tx) =>
      tx.query<{ event_type: string }>("select event_type from public.story_verification_events where story_id = $1", [storyId]),
    );
    // contributors only see non-internal events
    expect(events.rows.map((e) => e.event_type)).not.toContain("verification_updated");
    expect(events.rows.map((e) => e.event_type)).toContain("submitted");
  });

  it("narrowing consent hides the detail immediately", async () => {
    await as(db, contributor, (tx) => tx.query("select public.update_story_consents($1, false, false, false, true)", [storyId]));
    const list = await as(db, null, (tx) => tx.query<{ display_name: string | null }>("select display_name from public.list_published_stories()"));
    expect(list.rows[0].display_name).toBeNull();
  });

  it("withdrawal removes public access immediately and cannot be overridden by an admin", async () => {
    const other = await expectDbError(as(db, stranger, (tx) => tx.query("select public.request_story_withdrawal($1, 'not mine')", [storyId])));
    expect(other).toMatch(/not found/);
    await as(db, contributor, (tx) => tx.query("select public.request_story_withdrawal($1, 'Changed my mind')", [storyId]));
    const list = await as(db, null, (tx) => tx.query("select * from public.list_published_stories()"));
    expect(list.rows).toHaveLength(0);
    const republish = await expectDbError(as(db, admin, (tx) => tx.query("select public.set_story_status($1, 'published')", [storyId])));
    expect(republish).toMatch(/consent/);
  });

  it("contributors can request corrections", async () => {
    const id = await as(db, contributor, (tx) => submit(tx, { title: "Second fictional story" }));
    await as(db, contributor, (tx) => tx.query("select public.request_story_correction($1, 'Please fix the hospital name')", [id]));
    const adminNotes = await as(db, admin, (tx) =>
      tx.query<{ title: string }>("select title from public.notifications where kind = 'story_update' and title like 'Story correction%'"),
    );
    expect(adminNotes.rows).toHaveLength(1);
  });
});

describe("impact metrics and camps", () => {
  it("are computed from records and exclude unverified camp figures", async () => {
    const before = await as(db, null, (tx) => tx.query<{ get_impact_metrics: Record<string, unknown> }>("select public.get_impact_metrics()"));
    const metrics = before.rows[0].get_impact_metrics;
    expect(metrics.registered_donors).toBe(4);
    expect(metrics.verified_donors).toBe(4); // confirmed emails count as verified donors
    expect(metrics.requests_fulfilled).toBe(0);
    expect(metrics.camp_verified_donors).toBeNull();
    expect(metrics.manual_sources).toEqual([]);
  });

  it("refuses verified camp figures without a documented source", async () => {
    const message = await expectDbError(
      as(db, admin, (tx) =>
        tx.query(
          `insert into public.camp_records (name, camp_date, district, city, status, verified_donor_count, is_public)
           values ('Fictional Camp', '2026-05-01', 'Pune', 'Pune', 'completed', 40, true)`,
        ),
      ),
    );
    expect(message).toMatch(/camp_verified_figures_documented/);
  });

  it("only administrators manage camps and metric sources", async () => {
    const message = await expectDbError(
      as(db, volunteer, (tx) =>
        tx.query(`insert into public.camp_records (name, camp_date, district, city) values ('Nope Camp', '2026-05-01', 'Pune', 'Pune')`),
      ),
    );
    expect(message).toMatch(/row-level security/);
    await as(db, admin, (tx) =>
      tx.query(
        `insert into public.camp_records (name, camp_date, district, city, status, verified_donor_count, data_source, data_verified_at, is_public)
         values ('Fictional Camp', '2026-05-01', 'Pune', 'Pune', 'completed', 40, 'Blood centre collection sheet', now(), true)`,
      ),
    );
    await as(db, admin, (tx) =>
      tx.query(
        `insert into public.impact_metrics_sources (metric_key, label, value, source_description, is_public)
         values ('partner_units', 'Units collected at partner camps', 120, 'Partner blood centre annual letter', true)`,
      ),
    );
    const after = await as(db, null, (tx) => tx.query<{ get_impact_metrics: Record<string, unknown> }>("select public.get_impact_metrics()"));
    const metrics = after.rows[0].get_impact_metrics;
    expect(metrics.camps_completed).toBe(1);
    expect(Number(metrics.camp_verified_donors)).toBe(40);
    expect((metrics.manual_sources as unknown[]).length).toBe(1);
  });
});
