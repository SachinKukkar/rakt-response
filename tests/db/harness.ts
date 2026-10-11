import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { PGlite, type Transaction } from "@electric-sql/pglite";

const root = path.resolve(__dirname, "..", "..");
const migrationsDir = path.join(root, "supabase", "migrations");

export type Db = PGlite;
export type Role = "anon" | "authenticated" | "service_role";

export interface TestUser {
  id: string;
  email: string;
}

export function migrationFiles(): string[] {
  return readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();
}

/** Creates a fresh in-memory database with the Supabase stub and all migrations applied. */
export async function createTestDb(): Promise<Db> {
  const db = new PGlite();
  await db.exec(readFileSync(path.join(__dirname, "supabase-stub.sql"), "utf8"));
  for (const file of migrationFiles()) {
    const sql = readFileSync(path.join(migrationsDir, file), "utf8");
    try {
      await db.exec(sql);
    } catch (error) {
      throw new Error(`Migration ${file} failed: ${(error as Error).message}`);
    }
  }
  return db;
}

let counter = 0;

/** Inserts an auth user (as the platform would) and returns its id. */
export async function createUser(
  db: Db,
  metadata: Record<string, unknown> = {},
  options: { confirmed?: boolean; email?: string } = {},
): Promise<TestUser> {
  counter += 1;
  const email = options.email ?? `user${counter}-${Date.now()}@example.test`;
  const result = await db.query<{ id: string }>(
    `insert into auth.users (email, raw_user_meta_data, email_confirmed_at)
     values ($1, $2::jsonb, $3) returning id`,
    [email, JSON.stringify(metadata), options.confirmed === false ? null : new Date().toISOString()],
  );
  return { id: result.rows[0].id, email };
}

export const donorMetadata = (overrides: Record<string, unknown> = {}) => ({
  full_name: "Test Donor",
  display_name: "Test D.",
  is_donor: true,
  blood_group: "O+",
  age_confirmed: true,
  terms_accepted: true,
  donation_experience: "regular",
  phone: "+919800000001",
  location: { state: "Maharashtra", district: "Pune", city: "Pune", locality: "Kothrud", pincode: "411038" },
  preferences: {
    directory_visible: true,
    contact_consent: true,
    emergency_alerts: true,
    open_to_contact: true,
    show_donation_summary: true,
    preferred_contact_method: "whatsapp",
  },
  ...overrides,
});

/** Runs `fn` inside a transaction impersonating an API role, then rolls back unless `commit`. */
export async function as<T>(
  db: Db,
  who: TestUser | null | "service_role",
  fn: (tx: Transaction) => Promise<T>,
  options: { commit?: boolean } = { commit: true },
): Promise<T> {
  return db.transaction(async (tx) => {
    let role: Role = "anon";
    let claims: Record<string, unknown> = { role: "anon" };
    if (who === "service_role") {
      role = "service_role";
      claims = { role: "service_role" };
    } else if (who) {
      role = "authenticated";
      claims = { sub: who.id, role: "authenticated", email: who.email };
    }
    await tx.query(`select set_config('request.jwt.claims', $1, true)`, [JSON.stringify(claims)]);
    await tx.exec(`set local role ${role}`);
    const value = await fn(tx);
    if (options.commit === false) {
      await tx.rollback();
    }
    return value;
  });
}

/** Grants a staff role directly (bypassing RPCs) for test setup. */
export async function makeStaff(
  db: Db,
  user: TestUser,
  role: "volunteer" | "admin",
  flags: { can_verify_donations?: boolean; can_verify_requests?: boolean; can_export?: boolean } = {},
) {
  await db.query(
    `insert into public.staff_roles (user_id, role, can_verify_donations, can_verify_requests, can_export)
     values ($1, $2, $3, $4, $5)
     on conflict (user_id) do update set role = excluded.role,
       can_verify_donations = excluded.can_verify_donations,
       can_verify_requests = excluded.can_verify_requests,
       can_export = excluded.can_export, is_active = true`,
    [user.id, role, flags.can_verify_donations ?? false, flags.can_verify_requests ?? true, flags.can_export ?? false],
  );
}

/** Asserts that a promise rejects with a Postgres error and returns the message. */
export async function expectDbError(promise: Promise<unknown>): Promise<string> {
  try {
    await promise;
  } catch (error) {
    return (error as Error).message;
  }
  throw new Error("Expected the database to reject the operation, but it succeeded");
}
