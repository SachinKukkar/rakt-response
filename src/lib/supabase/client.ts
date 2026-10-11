"use client";

import { createBrowserClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl } from "@/lib/env";

/** Browser client — used only for auth flows that must run client-side. */
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
