import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Droplet, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActionForm } from "@/components/common/action-form";
import { EmptyState, PageHeader, SectionHeading } from "@/components/common/page-parts";
import { VerificationBadge } from "@/components/common/status-badge";
import { DonationSummaryCards } from "@/components/donations/donation-summary";
import { deleteDonation } from "@/actions/donations";
import { requireViewer } from "@/lib/auth";
import { getDonationRecords, getDonorData, getMyNextEligibleDate } from "@/lib/data/member";
import { DONATION_TYPE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("Donation history") };
}

export default async function DonationsPage({ searchParams }: PageProps<"/donations">) {
  const t = await getT();
  const viewer = await requireViewer("/donations");
  const [donor, records, nextEligible, params] = await Promise.all([getDonorData(viewer.id), getDonationRecords(viewer.id), getMyNextEligibleDate(), searchParams]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Donation history"
        description="Whole blood and SDP are tracked separately. New records are self-reported until an authorised volunteer verifies them."
        actions={
          viewer.profile?.is_donor ? (
            <Button asChild>
              <Link href="/donations/new">
                <Plus className="size-4" aria-hidden="true" /> {t("Record a donation")}
              </Link>
            </Button>
          ) : null
        }
      />
      {params.saved || params.removed ? (
        <p className="flex items-start gap-2 rounded-xl border border-success/25 bg-success-soft px-3.5 py-3 text-sm text-success" role="status">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {params.removed
            ? t("Record removed.")
            : params.saved === "edited"
            ? t("Changes saved.")
            : params.saved === "recheck"
              ? t("Changes saved. The record will be checked again by a volunteer.")
              : t("Donation saved. It shows as self-reported until a volunteer verifies it.")}
        </p>
      ) : null}
      <DonationSummaryCards summary={donor.summary} nextEligible={nextEligible} />
      <section aria-labelledby="records-heading">
        <SectionHeading id="records-heading" title="All records" />
        {records.length === 0 ? (
          <EmptyState
            icon={Droplet}
            title="No donations recorded yet"
            description="Add donations you've made — even from years ago — so volunteers can coordinate better."
            action={
              viewer.profile?.is_donor ? (
                <Button asChild variant="outline">
                  <Link href="/donations/new">{t("Record a donation")}</Link>
                </Button>
              ) : null
            }
          />
        ) : (
          <ul className="space-y-3">
            {records.map((record) => (
              <li key={record.id} className="surface p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-navy">{t(DONATION_TYPE_LABELS[record.donation_type])}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(record.donation_date)} · {record.centre_name}
                      {record.city ? `, ${record.city}` : ""}
                    </p>
                    {record.event_name ? <p className="text-xs text-muted-foreground">{t("Event: {name}", { name: record.event_name })}</p> : null}
                  </div>
                  <VerificationBadge status={record.verification_status} source={record.record_source} />
                </div>
                {record.verification_status === "rejected" && record.review_reason ? (
                  <p className="mt-2 rounded-xl bg-destructive/5 p-2.5 text-xs text-destructive">{t("Reviewer note: {note}", { note: record.review_reason })}</p>
                ) : null}
                <div className="mt-3 flex flex-wrap items-start gap-2 border-t border-border/70 pt-3">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/donations/${record.id}/edit`}>
                      <Pencil className="size-3.5" aria-hidden="true" /> {t("Edit")}
                    </Link>
                  </Button>
                  <ActionForm
                    action={deleteDonation}
                    fields={{ record_id: record.id, return_to: "/donations" }}
                    label="Remove"
                    variant="ghost"
                    size="sm"
                    confirmText={
                      record.verification_status === "verified"
                        ? "This record is verified. Remove it? It will no longer count towards your verified donations."
                        : "Remove this record?"
                    }
                    hideAfterSuccess
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
