import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BloodGroupChip } from "@/components/common/blood-group-chip";
import { CardListSkeleton, EmptyState, Notice, PageHeader } from "@/components/common/page-parts";
import { Pagination, parsePage } from "@/components/common/pagination";
import { Pill, ProfileVerificationBadge } from "@/components/common/status-badge";
import { selectClass } from "@/components/common/form-parts";
import { DirectoryFilters } from "@/components/volunteer/directory-filters";
import { DonorContactPanel } from "@/components/volunteer/coordination-forms";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { BLOOD_GROUPS, DONATION_TYPES, INDIAN_STATES, type BloodGroup, type DonationType } from "@/lib/constants";
import { formatDate, relativeTime } from "@/lib/format";
import { uuidSchema } from "@/lib/validation/common";
import { getT } from "@/i18n/server";
import type { DirectoryDonor } from "@/lib/types";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("Donor directory") };
}

const PAGE_SIZE = 20;
type Params = Record<string, string | string[] | undefined>;

function one(v: string | string[] | undefined): string {
  return (Array.isArray(v) ? v[0] : v)?.trim() ?? "";
}

function parseFilters(params: Params) {
  const groups = one(params.groups)
    .split(",")
    .filter((g): g is BloodGroup => BLOOD_GROUPS.includes(g as BloodGroup));
  const type = one(params.type);
  const state = one(params.state);
  const num = (key: string) => {
    const n = Number(one(params[key]));
    return Number.isFinite(n) && one(params[key]) !== "" ? n : null;
  };
  const lat = num("lat");
  const lng = num("lng");
  const sort = one(params.sort);
  return {
    p_blood_groups: groups.length ? groups : null,
    p_state: (INDIAN_STATES as readonly string[]).includes(state) ? state : null,
    p_district: one(params.district).slice(0, 60) || null,
    p_city: one(params.city).slice(0, 80) || null,
    p_locality: one(params.locality).slice(0, 100) || null,
    p_pincode: /^[1-9]\d{5}$/.test(one(params.pincode)) ? one(params.pincode) : null,
    p_donation_type: (DONATION_TYPES as readonly string[]).includes(type) ? (type as DonationType) : null,
    p_verified_only: one(params.verified) === "1",
    p_open_only: one(params.open) === "1",
    p_active_within_days: [30, 90, 365].includes(num("active") ?? 0) ? num("active") : null,
    p_query: one(params.q).slice(0, 80) || null,
    p_near_lat: lat !== null && Math.abs(lat) <= 90 ? lat : null,
    p_near_lng: lng !== null && Math.abs(lng) <= 180 ? lng : null,
    p_radius_km: [5, 10, 25, 50].includes(num("radius") ?? 0) ? num("radius") : null,
    p_sort: ["relevance", "recent", "locality", "distance"].includes(sort) ? sort : "relevance",
  };
}

async function Results({ params, requestContext }: { params: Params; requestContext: { id: string; reference_code: string } | null }) {
  const t = await getT();
  const supabase = await createClient();
  const filters = parseFilters(params);
  const page = parsePage(params.page);
  const { data, error } = await supabase.rpc("search_donors", { ...filters, p_limit: PAGE_SIZE, p_offset: (page - 1) * PAGE_SIZE });
  if (error) return <Notice tone="warning">The directory could not be searched right now.</Notice>;
  const donors = (data ?? []) as DirectoryDonor[];
  const total = Number(donors[0]?.total_count ?? 0);
  const passthrough: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(params)) if (k !== "page") passthrough[k] = one(v) || undefined;

  if (!donors.length) {
    return (
      <EmptyState
        icon={Users}
        title="No donors match these filters"
        description="Try a wider area, remove the 'open to contact' filter, or search nearby districts."
      />
    );
  }
  return (
    <>
      <p className="mb-3 text-sm text-muted-foreground" aria-live="polite">
        {total === 1 ? t("{count} donor found", { count: total }) : t("{count} donors found", { count: total })}
      </p>
      <ul className="grid gap-3 md:grid-cols-2">
        {donors.map((d) => (
          <li key={d.donor_id} className="surface space-y-3 p-4">
            <div className="flex items-start gap-3">
              <BloodGroupChip group={d.blood_group} size="md" />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-navy">{d.display_name}</p>
                <p className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                  {d.locality ? `${d.locality}, ` : ""}
                  {d.city}, {d.district}
                  {d.distance_km !== null ? ` · ~${d.distance_km} km` : ""}
                </p>
                <p className="text-xs text-muted-foreground">{t("Active {when}", { when: relativeTime(d.last_active_at) })}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <ProfileVerificationBadge status={d.verification_status} />
              {d.open_to_contact ? <Pill tone="success">{t("Open to contact")}</Pill> : <Pill>{t("Not available now")}</Pill>}
              {d.has_sdp_history ? <Pill tone="brand">{t("SDP history")}</Pill> : null}
            </div>
            {d.show_donation_summary ? (
              <p className="text-xs text-muted-foreground">
                {t("Verified: {count} whole blood", { count: d.verified_whole_blood_count ?? 0 })}
                {d.last_verified_whole_blood ? ` ${t("(last {date})", { date: formatDate(d.last_verified_whole_blood) })}` : ""} · {d.verified_sdp_count ?? 0} SDP
                {d.last_verified_sdp ? ` ${t("(last {date})", { date: formatDate(d.last_verified_sdp) })}` : ""}
              </p>
            ) : null}
            {requestContext ? (
              <DonorContactPanel
                donorId={d.donor_id}
                requestId={requestContext.id}
                referenceCode={requestContext.reference_code}
                canReveal={d.contact_consent && d.open_to_contact}
                canAsk
                contactRequestStatus={null}
              />
            ) : (
              <p className="text-xs text-muted-foreground">{t("Choose an active request above to contact this donor.")}</p>
            )}
          </li>
        ))}
      </ul>
      <Pagination page={page} pageSize={PAGE_SIZE} total={total} basePath="/volunteer/donors" params={passthrough} />
    </>
  );
}

export default async function DonorDirectoryPage({ searchParams }: PageProps<"/volunteer/donors">) {
  await requireStaff();
  const t = await getT();
  const params = await searchParams;
  const supabase = await createClient();
  const filters = parseFilters(params);
  const requestParam = one(params.request);
  const [facetsResult, activeResult, contextResult] = await Promise.all([
    supabase.rpc("search_donor_facets", {
      p_state: filters.p_state,
      p_district: filters.p_district,
      p_city: filters.p_city,
      p_locality: filters.p_locality,
      p_pincode: filters.p_pincode,
      p_donation_type: filters.p_donation_type,
      p_verified_only: filters.p_verified_only,
      p_open_only: filters.p_open_only,
      p_active_within_days: filters.p_active_within_days,
      p_query: filters.p_query,
    }),
    supabase
      .from("blood_requests")
      .select("id, reference_code, blood_group, hospital_name")
      .in("status", ["verified", "in_coordination"])
      .order("required_by")
      .limit(50),
    uuidSchema.safeParse(requestParam).success
      ? supabase.from("blood_requests").select("id, reference_code, status, blood_group, hospital_name").eq("id", requestParam).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);
  const facets = Object.fromEntries(((facetsResult.data ?? []) as Array<{ blood_group: string; donor_count: number }>).map((f) => [f.blood_group, f.donor_count]));
  const active = (activeResult.data ?? []) as Array<{ id: string; reference_code: string; blood_group: string; hospital_name: string }>;
  const context = contextResult.data as { id: string; reference_code: string; status: string; blood_group: string; hospital_name: string } | null;
  const usableContext = context && (context.status === "verified" || context.status === "in_coordination") ? context : null;

  const keep: Array<[string, string]> = Object.entries(params)
    .filter(([k]) => k !== "request" && k !== "page")
    .map(([k, v]) => [k, one(v)]);

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Rakt Mitra"
        title="Donor directory"
        description="Contact details are never listed here. They open for one verified request at a time, and every access is logged."
      />
      <section className="surface p-3" aria-label={t("Request context")}>
        {usableContext ? (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm">
              {t("Coordinating")} <strong className="text-navy">{usableContext.reference_code}</strong> ·{" "}
              {usableContext.blood_group} {t("at {hospital}", { hospital: usableContext.hospital_name })}
            </p>
            <Button asChild variant="ghost" size="sm">
              <Link href={`/volunteer/requests/${usableContext.id}`}>{t("Back to request")}</Link>
            </Button>
          </div>
        ) : (
          <form method="get" className="flex flex-wrap items-end gap-2">
            {keep.map(([k, v]) => (
              <input key={k} type="hidden" name={k} value={v} />
            ))}
            <label className="min-w-0 flex-1 space-y-1 text-xs font-semibold text-navy">
              {t("Contact donors for a verified request")}
              <select name="request" className={selectClass} defaultValue="">
                <option value="" disabled>
                  {active.length ? t("Choose a request…") : t("No active verified requests")}
                </option>
                {active.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.reference_code} · {r.blood_group} · {r.hospital_name}
                  </option>
                ))}
              </select>
            </label>
            <Button type="submit" variant="outline" disabled={!active.length}>
              {t("Use request")}
            </Button>
          </form>
        )}
      </section>
      <DirectoryFilters facets={facets} />
      <Notice>
        Matching here is by declared blood group only. Compatibility, cross-matching and donor eligibility are decided by the hospital and
        blood centre.
      </Notice>
      <Suspense key={JSON.stringify(params)} fallback={<CardListSkeleton rows={4} />}>
        <Results params={params} requestContext={usableContext} />
      </Suspense>
    </div>
  );
}
