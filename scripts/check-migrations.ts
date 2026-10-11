/**
 * Applies all migrations to an in-memory PGlite database (with a Supabase
 * stub) to catch SQL errors quickly: `npm run db:check`.
 */
import { createTestDb, migrationFiles } from "../tests/db/harness";

async function main() {
  const db = await createTestDb();
  const tables = await db.query<{ count: number }>(
    "select count(*)::int as count from information_schema.tables where table_schema = 'public'",
  );
  console.log(`Applied ${migrationFiles().length} migrations; ${tables.rows[0].count} public tables.`);
  await db.close();
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
