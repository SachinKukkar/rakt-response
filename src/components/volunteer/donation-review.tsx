import { CheckCircle2, Droplet, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ActionForm } from "@/components/common/action-form";
import { BloodGroupChip } from "@/components/common/blood-group-chip";
import { EmptyState, Notice } from "@/components/common/page-parts";
import { Pagination, parsePage } from "@/components/common/pagination";
import { VerificationBadge } from "@/components/common/status-badge";
import { deleteDonation } from "@/actions/donations";
import { verifyDonationRecord } from "@/actions/volunteer";
import { createClient } from "@/lib/supabase/server";
import { DONATION_TYPE_LABELS, type VerificationStatus } from "@/lib/constants";
import { profileLabels } from "@/lib/data/staff";
import { formatDate } from "@/lib/format";
import type { DonationRecordRow } from "@/lib/types";
import { cn } from "@/lib/utils";
import { getT } from "@/i18n/server";
import Link from "next/link";

const PAGE_SIZE = 20;

/** Review queue for donation records, shared by volunteer and admin areas. */
export async function DonationReviewList({
  basePath,
  searchParams,
  canVerify,
  viewerId,
  isAdmin = false,
}: {
  basePath: string;
  searchParams: Record<string, string | string[] | undefined>;
  canVerify: boolean;
  viewerId: string;
  /** Administrators can also delete records. */
  isAdmin?: boolean;
}) {
  const statusParam = (Array.isArray(searchParams.status) ? searchParams.status[0] : searchParams.status) ?? "pending";
  const status: VerificationStatus = statusParam === "verified" || statusParam === "rejected" ? statusParam : "pending";
  const page = parsePage(searchParams.page);
  const t = await getT();
  const supabase = await createClient();
  const { data, count } = await supabase
    .from("donation_records")
    .select("id, donor_id, donation_type, donation_date, centre_name, city, district, event_name, record_source, verification_status, verified_at, review_reason, created_at", { count: "exact" })
    .eq("verification_status", status)
    .order(status === "pending" ? "created_at" : "verified_at", { ascending: status === "pending" })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  const records = (data ?? []) as DonationRecordRow[];
  const donors = await profileLabels(records.map((r) => r.donor_id));

  return (
    <div className="space-y-4">
      {!canVerify ? (
        <Notice>{t("You can view records, but verifying them needs the “verify donations” permission from an administrator.")}</Notice>
      ) : null}
      {searchParams.saved || searchParams.removed ? (
        <p className="flex items-start gap-2 rounded-xl border border-success/25 bg-success-soft px-3.5 py-3 text-sm text-success" role="status">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {searchParams.removed ? t("Record removed.") : t("Changes saved.")}
        </p>
      ) : null}
      <nav aria-label={t("Record status")} className="flex gap-2">
        {(["pending", "verified", "rejected"] as const).map((s) => (
          <Link
            key={s}
            href={`${basePath}?status=${s}`}
            aria-current={s === status ? "page" : undefined}
            className={cn("inline-flex h-10 items-center rounded-full border px-4 text-sm font-semibold capitalize", s === status ? "border-primary bg-primary text-white" : "bg-white text-navy")}
          >
            {s === "rejected" ? t("Not verified") : t(s)}
          </Link>
        ))}
      </nav>
      {records.length === 0 ? (
        <EmptyState icon={Droplet} title="No records here" />
      ) : (
        <ul className="space-y-3">
          {records.map((r) => {
            const donor = donors.get(r.donor_id);
            const own = r.donor_id === viewerId;
            return (
              <li key={r.id} className="surface space-y-3 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    {donor?.blood_group ? <BloodGroupChip group={donor.blood_group} size="sm" /> : null}
                    <div>
                      <p className="font-semibold text-navy">{donor?.label ?? t("Donor")}</p>
                      <p className="text-sm">
                        {t(DONATION_TYPE_LABELS[r.donation_type])} · {formatDate(r.donation_date)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {r.centre_name}
                        {r.city ? `, ${r.city}` : ""}
                        {r.district ? `, ${r.district}` : ""}
                        {r.event_name ? ` · ${r.event_name}` : ""} · {t("added {date}", { date: formatDate(r.created_at) })}
                      </p>
                    </div>
                  </div>
                  <VerificationBadge status={r.verification_status} source={r.record_source} />
                </div>
                {r.review_reason ? <p className="text-xs text-muted-foreground">{t("Reviewer note: {note}", { note: r.review_reason })}</p> : null}
                {status === "pending" && canVerify && !own ? (
                  <div className="flex flex-wrap items-end gap-2">
                    <ActionForm action={verifyDonationRecord} fields={{ record_id: r.id, status: "verified" }} label="Verify" size="sm" hideAfterSuccess />
                    <ActionForm action={verifyDonationRecord} fields={{ record_id: r.id, status: "rejected" }} label="Not verified" size="sm" variant="outline" hideAfterSuccess className="flex flex-wrap items-end gap-2 space-y-0">
                      <label className="sr-only" htmlFor={`reason-${r.id}`}>
                        {t("Reason")}
                      </label>
                      <Input id={`reason-${r.id}`} name="reason" placeholder={t("Reason (required)")} className="h-9 w-48" required maxLength={300} />
                    </ActionForm>
                  </div>
                ) : null}
                {own && status === "pending" ? <p className="text-xs text-muted-foreground">{t("Your own record — another reviewer must verify it.")}</p> : null}
                {canVerify || isAdmin ? (
                  <div className="flex flex-wrap items-start gap-2 border-t border-border/70 pt-3">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/donations/${r.id}/edit?from=${encodeURIComponent(`${basePath}?status=${status}`)}`}>
                        <Pencil className="size-3.5" aria-hidden="true" /> {t("Edit")}
                      </Link>
                    </Button>
                    {isAdmin ? (
                      <ActionForm
                        action={deleteDonation}
                        fields={{ record_id: r.id, return_to: `${basePath}?status=${status}` }}
                        label="Delete"
                        variant="ghost"
                        size="sm"
                        confirmText="Delete this donation record permanently?"
                        hideAfterSuccess
                      />
                    ) : null}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
      <Pagination page={page} pageSize={PAGE_SIZE} total={count ?? 0} basePath={basePath} params={{ status }} />
      <p className="text-xs text-muted-foreground">
        {t(
          "Verify only with proportionate evidence (e.g. a donor card, certificate or confirmation from the blood centre). Verification confirms the record, not the donor's eligibility.",
        )}
      </p>
    </div>
  );
}
