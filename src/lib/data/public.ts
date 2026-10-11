import "server-only";
import { createPublicClient } from "@/lib/supabase/public";
import type { ImpactMetrics, PublicRequestRow, StoryCard } from "@/lib/types";
import type { BloodGroup, RequestType, StoryType } from "@/lib/constants";

/** Real, record-derived metrics. Returns null when the database is unavailable. */
export async function getImpactMetrics(): Promise<ImpactMetrics | null> {
  const client = createPublicClient();
  if (!client) return null;
  const { data, error } = await client.rpc("get_impact_metrics");
  if (error || !data) return null;
  return data as ImpactMetrics;
}

export async function listPublishedStories(
  types: readonly StoryType[] | null,
  limit: number,
  offset = 0,
): Promise<{ stories: StoryCard[]; total: number } | null> {
  const client = createPublicClient();
  if (!client) return null;
  const { data, error } = await client.rpc("list_published_stories", {
    p_types: types && types.length ? [...types] : null,
    p_limit: limit,
    p_offset: offset,
  });
  if (error) return null;
  const stories = (data ?? []) as StoryCard[];
  return { stories, total: Number(stories[0]?.total_count ?? 0) };
}

export async function listPublicRequests(filters: {
  bloodGroup?: BloodGroup | null;
  district?: string | null;
  requestType?: RequestType | null;
  limit: number;
  offset: number;
}): Promise<{ requests: PublicRequestRow[]; total: number } | null> {
  const client = createPublicClient();
  if (!client) return null;
  const { data, error } = await client.rpc("list_public_blood_requests", {
    p_blood_group: filters.bloodGroup ?? null,
    p_district: filters.district ?? null,
    p_request_type: filters.requestType ?? null,
    p_limit: filters.limit,
    p_offset: filters.offset,
  });
  if (error) return null;
  const requests = (data ?? []) as PublicRequestRow[];
  return { requests, total: Number(requests[0]?.total_count ?? 0) };
}

export interface PublicSettings {
  contactEmail: string;
  contactPhone: string;
  whatsapp: string;
  serviceArea: string;
  registrationOpen: boolean;
  wholeBloodIntervalDays: number;
}

export const DEFAULT_PUBLIC_SETTINGS: PublicSettings = {
  contactEmail: "",
  contactPhone: "",
  whatsapp: "",
  serviceArea: "",
  registrationOpen: true,
  wholeBloodIntervalDays: 90,
};

export async function getPublicSettings(): Promise<PublicSettings> {
  const client = createPublicClient();
  if (!client) return DEFAULT_PUBLIC_SETTINGS;
  const { data } = await client.from("platform_settings").select("key, value").eq("is_public", true);
  const map = new Map((data ?? []).map((row: { key: string; value: unknown }) => [row.key, row.value]));
  const str = (k: string) => (typeof map.get(k) === "string" ? (map.get(k) as string) : "");
  return {
    contactEmail: str("org.contact_email"),
    contactPhone: str("org.contact_phone"),
    whatsapp: str("org.whatsapp"),
    serviceArea: str("org.service_area"),
    registrationOpen: map.get("registration_open") !== false,
    wholeBloodIntervalDays: typeof map.get("whole_blood_interval_days") === "number" ? (map.get("whole_blood_interval_days") as number) : 90,
  };
}
