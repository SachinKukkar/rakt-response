import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabaseUrl } from "@/lib/env";

/**
 * Service-role client. SERVER ONLY — bypasses RLS. Used narrowly for:
 *  - anonymous blood-request submission (via the rate-limited RPC),
 *  - deleting auth users when processing deletion requests.
 * Returns null when the key is not configured; callers must degrade gracefully.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!isSupabaseConfigured() || !key) return null;
  return createSupabaseClient(supabaseUrl, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
