import { readFileSync } from "node:fs";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { as, createTestDb, type Db } from "./harness";

let db: Db;

// Extra platform objects the seed touches (present in real Supabase).
const SEED_STUB = `
alter table auth.users
  add column instance_id uuid, add column aud text, add column role text, add column encrypted_password text,
  add column confirmation_token text, add column recovery_token text, add column email_change_token_new text, add column email_change text;
create table auth.identities (
  id uuid primary key, user_id uuid references auth.users(id) on delete cascade, provider_id text, provider text,
  identity_data jsonb, last_sign_in_at timestamptz, created_at timestamptz, updated_at timestamptz
);
create schema extensions;
create function extensions.gen_salt(text) returns text language sql as $$ select 'salt' $$;
create function extensions.crypt(text, text) returns text language sql as $$ select md5($1 || $2) $$;
`;

beforeAll(async () => {
  db = await createTestDb();
  await db.exec(SEED_STUB);
  await db.exec(readFileSync(path.resolve(__dirname, "../../supabase/seed.sql"), "utf8"));
});

afterAll(async () => {
  await db.close();
});

describe("development seed", () => {
  it("creates fictional accounts through the normal signup trigger", async () => {
    const result = await db.query<{ count: number }>("select count(*)::int as count from public.profiles");
    expect(result.rows[0].count).toBe(8);
    const emails = await db.query<{ email: string }>("select email from auth.users");
    expect(emails.rows.every((r) => r.email.endsWith("@example.test"))).toBe(true);
  });

  it("produces data visible through the public functions", async () => {
    const requests = await as(db, null, (tx) => tx.query("select * from public.list_public_blood_requests()"));
    expect(requests.rows).toHaveLength(1);
    const stories = await as(db, null, (tx) => tx.query<{ title: string }>("select * from public.list_published_stories()"));
    expect(stories.rows[0].title).toContain("Sample — development only");
    const metrics = await as(db, null, (tx) => tx.query<{ get_impact_metrics: Record<string, number> }>("select public.get_impact_metrics()"));
    expect(metrics.rows[0].get_impact_metrics.verified_whole_blood_donations).toBe(1);
  });

  it("is idempotent", async () => {
    await db.exec(readFileSync(path.resolve(__dirname, "../../supabase/seed.sql"), "utf8"));
    const result = await db.query<{ count: number }>("select count(*)::int as count from auth.users");
    expect(result.rows[0].count).toBe(8);
  });
});
