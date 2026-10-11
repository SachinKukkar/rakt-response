import "server-only";
import { createClient } from "@/lib/supabase/server";
import { EMPTY_SUMMARY, type DonationSummary } from "@/lib/donations";
import type { ContactsRow, DonationRecordRow, LocationRow, PreferencesRow } from "@/lib/types";
import type { BloodGroup, RequestStatus, RequestType, ResponseStatus, Urgency } from "@/lib/constants";

export type ContactRequestStatusLike = "pending" | "accepted" | "declined" | "cancelled" | "expired";

export async function getDonorData(userId: string) {
  const supabase = await createClient();
  const [prefs, location, contacts, summary] = await Promise.all([
    supabase.from("donor_preferences").select("*").eq("profile_id", userId).maybeSingle(),
    supabase.from("donor_locations").select("*").eq("profile_id", userId).maybeSingle(),
    supabase.from("profile_contacts").select("*").eq("profile_id", userId).maybeSingle(),
    supabase.rpc("donation_summary", { p_donor: userId }),
  ]);
  return {
    preferences: (prefs.data as PreferencesRow | null) ?? null,
    location: (location.data as LocationRow | null) ?? null,
    contacts: (contacts.data as ContactsRow | null) ?? null,
    summary: ((Array.isArray(summary.data) ? summary.data[0] : summary.data) as DonationSummary | null) ?? EMPTY_SUMMARY,
  };
}

export async function getDonationRecords(userId: string, limit = 100): Promise<DonationRecordRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("donation_records")
    .select("id, donor_id, donation_type, donation_date, centre_name, city, district, event_name, record_source, verification_status, verified_at, review_reason, created_at")
    .eq("donor_id", userId)
    .order("donation_date", { ascending: false })
    .limit(limit);
  return (data ?? []) as DonationRecordRow[];
}

export interface RequestMatch {
  request_id: string;
  reference_code: string;
  blood_group: BloodGroup;
  request_type: RequestType;
  units_needed: number | null;
  hospital_name: string;
  city: string;
  district: string;
  required_by: string;
  urgency: Urgency;
  status: RequestStatus;
  verified_at: string | null;
  my_response: ResponseStatus | null;
  contact_request_id: string | null;
  contact_request_status: ContactRequestStatusLike | null;
  contact_request_message: string | null;
  contact_request_expires_at: string | null;
}

export async function getRequestMatches(): Promise<RequestMatch[]> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("list_my_request_matches");
  return (data ?? []) as RequestMatch[];
}

/** Rough profile completeness for the dashboard (not a quality score). */
export function profileCompletion(input: {
  hasBloodGroup: boolean;
  hasPhone: boolean;
  hasLocation: boolean;
  hasMadeConsentChoice: boolean;
  hasHistoryOrFirstTimer: boolean;
}): { percent: number; missing: string[] } {
  const checks: Array<[boolean, string]> = [
    [input.hasBloodGroup, "Add your blood group"],
    [input.hasPhone, "Add a mobile number"],
    [input.hasLocation, "Add your area"],
    [input.hasMadeConsentChoice, "Review your contact & directory choices"],
    [input.hasHistoryOrFirstTimer, "Record your donation history"],
  ];
  const done = checks.filter(([ok]) => ok).length;
  return { percent: Math.round((done / checks.length) * 100), missing: checks.filter(([ok]) => !ok).map(([, label]) => label) };
}
