import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createTestDb, type Db } from "./harness";
import { BLOOD_GROUPS, REQUEST_STATUSES, REQUEST_TRANSITIONS, STORY_STATUSES, STORY_TRANSITIONS } from "@/lib/constants";

let db: Db;
beforeAll(async () => {
  db = await createTestDb();
});
afterAll(async () => {
  await db.close();
});

/** The UI only offers transitions the database will accept (and vice versa). */
describe("TypeScript and SQL rules stay in sync", () => {
  it("request status transitions", async () => {
    for (const from of REQUEST_STATUSES) {
      for (const to of REQUEST_STATUSES) {
        const { rows } = await db.query<{ ok: boolean }>("select private.request_transition_allowed($1, $2) as ok", [from, to]);
        expect(rows[0].ok, `${from} -> ${to}`).toBe(REQUEST_TRANSITIONS[from].includes(to));
      }
    }
  });

  it("story status transitions", async () => {
    for (const from of STORY_STATUSES) {
      for (const to of STORY_STATUSES) {
        const { rows } = await db.query<{ ok: boolean }>("select private.story_transition_allowed($1, $2) as ok", [from, to]);
        expect(rows[0].ok, `${from} -> ${to}`).toBe(STORY_TRANSITIONS[from].includes(to));
      }
    }
  });

  it("enum values match the constants", async () => {
    const { rows } = await db.query<{ label: string }>(
      "select enumlabel as label from pg_enum e join pg_type t on t.oid = e.enumtypid where t.typname = 'blood_group' order by enumsortorder",
    );
    expect(rows.map((r) => r.label)).toEqual([...BLOOD_GROUPS]);
    expect(BLOOD_GROUPS).toContain("Oh");
  });

  it("every public table has row level security enabled", async () => {
    const { rows } = await db.query<{ relname: string }>(
      "select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity",
    );
    expect(rows).toEqual([]);
  });

  it("no SECURITY DEFINER function in public is missing a fixed search_path", async () => {
    const { rows } = await db.query<{ proname: string }>(
      `select p.proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
       where n.nspname in ('public', 'private') and p.prosecdef
         and not exists (select 1 from unnest(coalesce(p.proconfig, '{}')) c where c like 'search_path=%')`,
    );
    expect(rows).toEqual([]);
  });

  it("anonymous users can execute only the intended public functions", async () => {
    const { rows } = await db.query<{ proname: string }>(
      `select p.proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
       where n.nspname = 'public' and has_function_privilege('anon', p.oid, 'execute') order by 1`,
    );
    expect(rows.map((r) => r.proname)).toEqual([
      "get_impact_metrics",
      "get_public_blood_request",
      "get_published_story",
      "is_admin",
      "is_staff",
      "list_public_blood_requests",
      "list_published_stories",
      "staff_can",
    ]);
  });
});
