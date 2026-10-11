import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface AdminAnalytics {
  generated_at: string;
  donors: {
    registered: number;
    unconfirmed_email: number;
    verified: number;
    pending_verification: number;
    directory_visible: number;
    deletion_requests: number;
    blood_group_changes: number;
  };
  by_blood_group: Array<{ blood_group: string; count: number }>;
  by_district: Array<{ district: string; count: number }>;
  donations: { verified_whole_blood: number; verified_sdp: number; verified_other_apheresis: number; pending: number; rejected: number };
  requests: { awaiting_verification: number; active: number; fulfilled: number; by_status: Record<string, number> };
  monthly_registrations: Array<{ month: string; count: number }>;
  monthly_verified_donations: Array<{ month: string; whole_blood: number; sdp: number }>;
}

export async function getAdminAnalytics(): Promise<AdminAnalytics | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_admin_analytics");
  if (error || !data) return null;
  return data as AdminAnalytics;
}

export async function storiesAwaitingReview(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("impact_stories")
    .select("id", { count: "exact", head: true })
    .in("status", ["submitted", "under_review", "verification_requested"]);
  return count ?? 0;
}
