import type { DonationType } from "@/lib/constants";

export interface DonationLike {
  id?: string;
  donation_type: DonationType;
  donation_date: string; // YYYY-MM-DD
  verification_status?: "pending" | "verified" | "rejected";
}

const DAY = 86_400_000;

function toTime(date: string): number {
  return new Date(`${date}T00:00:00Z`).getTime();
}

/**
 * Records of the same type within `windowDays` of the candidate date are
 * likely duplicates (e.g. the same donation entered twice). Rejected records
 * are ignored. The database separately blocks exact duplicates.
 */
export function findPossibleDuplicates<T extends DonationLike>(existing: T[], candidate: DonationLike, windowDays = 7): T[] {
  const target = toTime(candidate.donation_date);
  if (Number.isNaN(target)) return [];
  return existing.filter(
    (record) =>
      record.id !== candidate.id &&
      record.verification_status !== "rejected" &&
      record.donation_type === candidate.donation_type &&
      Math.abs(toTime(record.donation_date) - target) <= windowDays * DAY,
  );
}

export interface DonationSummary {
  last_reported_whole_blood: string | null;
  last_verified_whole_blood: string | null;
  last_reported_sdp: string | null;
  last_verified_sdp: string | null;
  verified_whole_blood_count: number;
  verified_sdp_count: number;
  verified_other_apheresis_count: number;
  reported_whole_blood_count: number;
  reported_sdp_count: number;
  pending_count: number;
}

export const EMPTY_SUMMARY: DonationSummary = {
  last_reported_whole_blood: null,
  last_verified_whole_blood: null,
  last_reported_sdp: null,
  last_verified_sdp: null,
  verified_whole_blood_count: 0,
  verified_sdp_count: 0,
  verified_other_apheresis_count: 0,
  reported_whole_blood_count: 0,
  reported_sdp_count: 0,
  pending_count: 0,
};

/** Same definitions as public.donation_summary(), used for previews and tests. */
export function summarizeDonations(records: DonationLike[]): DonationSummary {
  const live = records.filter((r) => r.verification_status !== "rejected");
  const verified = records.filter((r) => r.verification_status === "verified");
  const latest = (list: DonationLike[], type: DonationType) =>
    list
      .filter((r) => r.donation_type === type)
      .map((r) => r.donation_date)
      .sort()
      .at(-1) ?? null;
  return {
    last_reported_whole_blood: latest(live, "whole_blood"),
    last_verified_whole_blood: latest(verified, "whole_blood"),
    last_reported_sdp: latest(live, "sdp"),
    last_verified_sdp: latest(verified, "sdp"),
    verified_whole_blood_count: verified.filter((r) => r.donation_type === "whole_blood").length,
    verified_sdp_count: verified.filter((r) => r.donation_type === "sdp").length,
    verified_other_apheresis_count: verified.filter((r) => r.donation_type === "other_apheresis").length,
    reported_whole_blood_count: live.filter((r) => r.donation_type === "whole_blood").length,
    reported_sdp_count: live.filter((r) => r.donation_type === "sdp").length,
    pending_count: records.filter((r) => r.verification_status === "pending").length,
  };
}

/**
 * INFORMATIONAL ESTIMATE ONLY — the earliest date a typical whole-blood donor
 * might be asked back, using the configured minimum interval. It is not an
 * eligibility decision: screening at the blood centre decides. Intentionally
 * not offered for SDP/apheresis, where intervals depend on the procedure and
 * clinical assessment.
 */
export function informationalWholeBloodEstimate(lastDonation: string | null, intervalDays: number): string | null {
  if (!lastDonation || !Number.isFinite(intervalDays) || intervalDays <= 0) return null;
  const time = toTime(lastDonation);
  if (Number.isNaN(time)) return null;
  return new Date(time + intervalDays * DAY).toISOString().slice(0, 10);
}
