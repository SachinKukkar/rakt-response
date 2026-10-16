import type { Metadata } from "next";
import Link from "next/link";
import { Download, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BloodGroupChip } from "@/components/common/blood-group-chip";
import { EmptyState, PageHeader } from "@/components/common/page-parts";
import { Pagination, parsePage } from "@/components/common/pagination";
import { Pill, ProfileVerificationBadge } from "@/components/common/status-badge";
import { selectClass } from "@/components/common/form-parts";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { BLOOD_GROUPS, bloodGroupName, type BloodGroup } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import type { ProfileRow } from "@/lib/types";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("Donors") };
}

const PAGE_SIZE = 25;
const FILTERS: Record<string, string> = {
  all: "All members",
  donors: "Donors",
  pending: "Needs verification",
  verified: "Verified",
  blood_group_change: "Blood group corrections",
  deletion: "Deletion requested",
  inactive: "Deactivated",
};

export default async function AdminDonorsPage({ searchParams }: PageProps<"/admin/donors">) {
  const viewer = await requireAdmin();
  const t = await getT();
  const params = await searchParams;
  const filterRaw = Array.isArray(params.filter) ? params.filter[0] : params.filter;
  const filter = filterRaw && filterRaw in FILTERS ? filterRaw : "donors";
  const groupRaw = Array.isArray(params.group) ? params.group[0] : params.group;
  const group = BLOOD_GROUPS.includes(groupRaw as BloodGroup) ? (groupRaw as BloodGroup) : null;
  const q = String((Array.isArray(params.q) ? params.q[0] : params.q) ?? "").trim().slice(0, 80);
  const page = parsePage(params.page);

  const supabase = await createClient();
  let query = supabase
    .from("profiles")
    .select("id, full_name, display_name, is_donor, blood_group, blood_group_verified, requested_blood_group, verification_status, is_active, deletion_requested_at, last_active_at, created_at", { count: "exact" });
  if (filter === "donors") query = query.eq("is_donor", true).eq("is_active", true);
  if (filter === "pending") query = query.eq("is_donor", true).eq("is_active", true).in("verification_status", ["unverified", "pending"]);
  if (filter === "verified") query = query.eq("verification_status", "verified");
  if (filter === "blood_group_change") query = query.not("requested_blood_group", "is", null);
  if (filter === "deletion") query = query.not("deletion_requested_at", "is", null).eq("is_active", true);
  if (filter === "inactive") query = query.eq("is_active", false);
  if (group) query = query.eq("blood_group", group);
  if (q) query = query.or(`full_name.ilike.%${q.replace(/[%_,()]/g, "")}%,display_name.ilike.%${q.replace(/[%_,()]/g, "")}%`);
  const { data, count } = await query.order("created_at", { ascending: false }).range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  const profiles = (data ?? []) as ProfileRow[];

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Administrator"
        title="Donors & members"
        actions={
          viewer.isAdmin ? (
            <Button asChild variant="outline">
              <a download href="/api/admin/export/donors">
                <Download className="size-4" aria-hidden="true" /> {t("Export CSV")}
              </a>
            </Button>
          ) : null
        }
      />
      <form method="get" className="surface grid gap-3 p-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end" role="search">
        <label className="space-y-1 text-xs font-semibold text-navy">
          {t("Show")}
          <select name="filter" defaultValue={filter} className={selectClass}>
            {Object.entries(FILTERS).map(([k, label]) => (
              <option key={k} value={k}>
                {t(label)}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-xs font-semibold text-navy">
          {t("Blood group")}
          <select name="group" defaultValue={group ?? ""} className={selectClass}>
            <option value="">{t("All")}</option>
            {BLOOD_GROUPS.map((g) => (
              <option key={g} value={g}>
                {t(bloodGroupName(g))}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-xs font-semibold text-navy">
          {t("Name")}
          <Input name="q" defaultValue={q} />
        </label>
        <Button type="submit">{t("Apply")}</Button>
      </form>
      {profiles.length === 0 ? (
        <EmptyState icon={Users} title="No members match" />
      ) : (
        <ul className="space-y-2">
          {profiles.map((p) => (
            <li key={p.id}>
              <Link href={`/admin/donors/${p.id}`} className="surface flex items-center gap-3 p-3.5 hover:border-primary/40">
                {p.blood_group ? <BloodGroupChip group={p.blood_group} size="sm" /> : <span className="size-9 rounded-full bg-muted" aria-hidden="true" />}
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-navy">{p.full_name}</span>
                  <span className="block text-xs text-muted-foreground">
                    {t("Joined {date}", { date: formatDate(p.created_at) })} · {p.is_donor ? t("Donor") : t("Member")}
                  </span>
                </span>
                <span className="flex flex-col items-end gap-1">
                  <ProfileVerificationBadge status={p.verification_status} />
                  {p.requested_blood_group ? <Pill tone="warning">{t("Correction → {group}", { group: p.requested_blood_group })}</Pill> : null}
                  {p.deletion_requested_at ? <Pill tone="danger">Deletion requested</Pill> : null}
                  {!p.is_active ? <Pill>Inactive</Pill> : null}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Pagination page={page} pageSize={PAGE_SIZE} total={count ?? 0} basePath="/admin/donors" params={{ filter, group: group ?? undefined, q: q || undefined }} />
    </div>
  );
}
