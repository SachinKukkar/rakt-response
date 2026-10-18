import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { BloodGroup } from "@/lib/constants";

export interface ProfileLabel {
  id: string;
  label: string;
  blood_group: BloodGroup | null;
}

/**
 * Minimal labels (display name, blood group) for people staff are already
 * working with. Volunteers cannot read the profiles table directly.
 */
export async function profileLabels(ids: Array<string | null | undefined>): Promise<Map<string, ProfileLabel>> {
  const unique = [...new Set(ids.filter((id): id is string => Boolean(id)))].slice(0, 200);
  if (!unique.length) return new Map();
  const supabase = await createClient();
  const { data } = await supabase.rpc("staff_profile_labels", { p_ids: unique });
  return new Map(((data ?? []) as ProfileLabel[]).map((p) => [p.id, p]));
}

export async function displayNames(ids: Array<string | null | undefined>): Promise<Map<string, string>> {
  const labels = await profileLabels(ids);
  return new Map([...labels].map(([id, p]) => [id, p.label]));
}

export async function activeStaff(): Promise<Array<{ user_id: string; role: string; name: string }>> {
  const supabase = await createClient();
  // Only administrators can list all staff rows; others get just themselves.
  const { data } = await supabase.from("staff_roles").select("user_id, role").eq("is_active", true);
  const rows = (data ?? []) as Array<{ user_id: string; role: string }>;
  const names = await displayNames(rows.map((r) => r.user_id));
  return rows.map((r) => ({ ...r, name: names.get(r.user_id) ?? "Rakt Mitra" }));
}
