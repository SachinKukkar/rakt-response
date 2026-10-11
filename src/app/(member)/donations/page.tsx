import type { Metadata } from "next";
import Link from "next/link";
import { Droplet, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActionForm } from "@/components/common/action-form";
import { EmptyState, PageHeader, SectionHeading } from "@/components/common/page-parts";
import { VerificationBadge } from "@/components/common/status-badge";
import { DonationSummaryCards } from "@/components/donations/donation-summary";
import { deleteDonation } from "@/actions/donations";
import { requireViewer } from "@/lib/auth";
import { getDonationRecords, getDonorData } from "@/lib/data/member";
import { getPublicSettings } from "@/lib/data/public";
import { DONATION_TYPE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("Donation history") };
}

export default async function DonationsPage() {
  const t = await getT();
  const viewer = await requireViewer("/donations");
  const [donor, records, settings] = await Promise.all([getDonorData(viewer.id), getDonationRecords(viewer.id), getPublicSettings()]);

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
      <DonationSummaryCards summary={donor.summary} intervalDays={settings.wholeBloodIntervalDays} />
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
                {record.verification_status === "pending" ? (
                  <ActionForm
                    action={deleteDonation}
                    fields={{ record_id: record.id }}
                    label="Remove"
                    variant="ghost"
                    size="sm"
                    confirmText="Remove this self-reported record?"
                    className="mt-2"
                    hideAfterSuccess
                  />
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
