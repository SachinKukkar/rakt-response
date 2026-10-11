/**
 * Makes an existing, email-confirmed account the FIRST Rakt Response
 * administrator. Refuses to run once any administrator exists.
 *
 *   npm run bootstrap-admin -- you@your-organisation.org
 *
 * Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 * (or the environment). Alternative without a key: run
 *   select public.bootstrap_first_admin('you@your-organisation.org');
 * in the Supabase SQL editor.
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });
config();

async function main() {
  const email = process.argv[2]?.trim();
  if (!email || !email.includes("@")) {
    console.error("Usage: npm run bootstrap-admin -- you@your-organisation.org");
    process.exit(1);
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (server-only) first.");
    process.exit(1);
  }
  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await supabase.rpc("bootstrap_first_admin", { p_email: email });
  if (error) {
    console.error(`Bootstrap refused: ${error.message}`);
    process.exit(1);
  }
  console.log(`Done. ${email} (${data}) is now the first administrator. Sign out and back in to see the admin area.`);
}

main();
