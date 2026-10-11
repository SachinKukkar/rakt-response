import "server-only";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { ProfileRow, StaffRoleRow } from "@/lib/types";

export interface Viewer {
  id: string;
  email: string | null;
  profile: ProfileRow | null;
  staff: StaffRoleRow | null;
  isStaff: boolean;
  isAdmin: boolean;
}

/**
 * The signed-in user, their profile and their staff role — read from the
 * database on every request (never from client-supplied data). Cached per
 * request so layouts and pages share one lookup.
 */
export const getViewer = cache(async (): Promise<Viewer | null> => {
  // Session-dependent pages must always render per request, even in builds
  // made without Supabase credentials.
  await connection();
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (error || !claims?.sub) return null;
  const id = String(claims.sub);

  const [profileResult, staffResult] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "id, full_name, display_name, bio, is_donor, blood_group, blood_group_verified, requested_blood_group, age_confirmed, donation_experience, approx_previous_donations, verification_status, verified_at, photo_path, is_active, deletion_requested_at, last_active_at, created_at",
      )
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("staff_roles")
      .select("user_id, role, can_verify_donations, can_verify_requests, can_export, is_active")
      .eq("user_id", id)
      .eq("is_active", true)
      .maybeSingle(),
  ]);

  const profile = (profileResult.data as ProfileRow | null) ?? null;
  // Deactivated accounts keep no privileges even if a role row remains.
  const staff = profile?.is_active ? ((staffResult.data as StaffRoleRow | null) ?? null) : null;
  return {
    id,
    email: typeof claims.email === "string" ? claims.email : null,
    profile,
    staff,
    isStaff: Boolean(staff),
    isAdmin: staff?.role === "admin",
  };
});

export async function requireViewer(next?: string): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer) redirect(next ? `/login?next=${encodeURIComponent(next)}` : "/login");
  return viewer;
}

export async function requireStaff(): Promise<Viewer & { staff: StaffRoleRow }> {
  const viewer = await requireViewer();
  // Staff areas are not advertised: anyone else gets an ordinary 404.
  if (!viewer.staff) notFound();
  return viewer as Viewer & { staff: StaffRoleRow };
}

export async function requireAdmin(): Promise<Viewer & { staff: StaffRoleRow }> {
  const viewer = await requireStaff();
  if (!viewer.isAdmin) notFound();
  return viewer;
}

export function viewerCan(viewer: Viewer, permission: "verify_donations" | "verify_requests" | "export"): boolean {
  if (!viewer.staff) return false;
  if (viewer.isAdmin) return true;
  if (permission === "verify_donations") return viewer.staff.can_verify_donations;
  if (permission === "verify_requests") return viewer.staff.can_verify_requests;
  return viewer.staff.can_export;
}
