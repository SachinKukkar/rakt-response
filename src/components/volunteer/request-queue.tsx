import Link from "next/link";
import { ClipboardList, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/common/page-parts";
import { Pagination, parsePage } from "@/components/common/pagination";
import { Pill } from "@/components/common/status-badge";
import { RequestCard } from "@/components/requests/request-card";
import { selectClass } from "@/components/common/form-parts";
import { createClient } from "@/lib/supabase/server";
import { BLOOD_GROUPS, REQUEST_TYPE_LABELS, REQUEST_TYPES, type BloodGroup, type RequestStatus, type RequestType } from "@/lib/constants";
import type { BloodRequestRow } from "@/lib/types";
import { cn } from "@/lib/utils";
import { getT } from "@/i18n/server";

const TABS = {
  verify: { label: "Needs verification", statuses: ["submitted", "under_verification"] as RequestStatus[] },
  active: { label: "Active", statuses: ["verified", "in_coordination"] as RequestStatus[] },
  closed: { label: "Closed", statuses: ["fulfilled", "cancelled", "expired", "rejected"] as RequestStatus[] },
} as const;
type Tab = keyof typeof TABS;

const PAGE_SIZE = 20;

function one(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

/** Server-rendered, filterable request queue shared by volunteer and admin areas. */
export async function RequestQueue({ basePath, searchParams }: { basePath: string; searchParams: Record<string, string | string[] | undefined> }) {
  const tabParam = one(searchParams.tab);
  const tab: Tab = tabParam && tabParam in TABS ? (tabParam as Tab) : "verify";
  const page = parsePage(searchParams.page);
  const t = await getT();
  const groupParam = one(searchParams.group);
  const typeParam = one(searchParams.type);
  const group = BLOOD_GROUPS.includes(groupParam as BloodGroup) ? (groupParam as BloodGroup) : null;
  const type = REQUEST_TYPES.includes(typeParam as RequestType) ? (typeParam as RequestType) : null;
  const district = (one(searchParams.district) ?? "").trim().slice(0, 60);

  const supabase = await createClient();
  let query = supabase
    .from("blood_requests")
    .select("id, reference_code, blood_group, request_type, units_needed, hospital_name, city, district, required_by, urgency, status, possible_duplicate_of, created_at", { count: "exact" })
    .in("status", TABS[tab].statuses);
  if (group) query = query.eq("blood_group", group);
  if (type) query = query.eq("request_type", type);
  if (district) query = query.eq("district_norm", district.toLowerCase());
  query = tab === "closed" ? query.order("updated_at", { ascending: false }) : query.order("urgency", { ascending: false }).order("required_by", { ascending: true });
  const { data, count } = await query.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  const requests = (data ?? []) as BloodRequestRow[];

  return (
    <div className="space-y-4">
      <nav aria-label={t("Request status")} className="-mx-4 overflow-x-auto px-4">
        <ul className="flex w-max gap-2">
          {(Object.keys(TABS) as Tab[]).map((key) => (
            <li key={key}>
              <Link
                href={`${basePath}?tab=${key}`}
                aria-current={key === tab ? "page" : undefined}
                className={cn(
                  "inline-flex h-10 items-center rounded-full border px-4 text-sm font-semibold",
                  key === tab ? "border-primary bg-primary text-white" : "bg-white text-navy hover:border-primary/40",
                )}
              >
                {t(TABS[key].label)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <form method="get" className="surface grid gap-3 p-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end" role="search" aria-label={t("Filter requests")}>
        <input type="hidden" name="tab" value={tab} />
        <label className="space-y-1 text-xs font-semibold text-navy">
          {t("Blood group")}
          <select name="group" defaultValue={group ?? ""} className={selectClass}>
            <option value="">{t("All")}</option>
            {BLOOD_GROUPS.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-xs font-semibold text-navy">
          {t("Donor type")}
          <select name="type" defaultValue={type ?? ""} className={selectClass}>
            <option value="">{t("All")}</option>
            {REQUEST_TYPES.map((rt) => (
              <option key={rt} value={rt}>
                {t(REQUEST_TYPE_LABELS[rt])}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-xs font-semibold text-navy">
          {t("District")}
          <Input name="district" defaultValue={district} />
        </label>
        <Button type="submit">{t("Filter")}</Button>
      </form>
      {requests.length ? (
        <>
          <div className="grid gap-3 md:grid-cols-2">
            {requests.map((r) => (
              <RequestCard
                key={r.id}
                request={r}
                href={`/volunteer/requests/${r.id}`}
                footer={
                  r.possible_duplicate_of ? (
                    <Pill tone="warning" icon={Copy}>
                      {t("Possible duplicate")}
                    </Pill>
                  ) : undefined
                }
              />
            ))}
          </div>
          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            total={count ?? 0}
            basePath={basePath}
            params={{ tab, group: group ?? undefined, type: type ?? undefined, district: district || undefined }}
          />
        </>
      ) : (
        <EmptyState icon={ClipboardList} title="No requests here" description="Try another tab or clear the filters." />
      )}
    </div>
  );
}
