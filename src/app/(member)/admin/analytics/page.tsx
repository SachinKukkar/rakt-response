import type { Metadata } from "next";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Notice, PageHeader, SectionHeading, StatCard } from "@/components/common/page-parts";
import { BarList, MonthlyColumns } from "@/components/admin/bar-list";
import { requireAdmin } from "@/lib/auth";
import { getAdminAnalytics } from "@/lib/data/admin";
import { BLOOD_GROUPS, REQUEST_STATUS_LABELS, type RequestStatus } from "@/lib/constants";
import { formatDateTime, formatNumber } from "@/lib/format";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("Analytics") };
}

export default async function AdminAnalyticsPage() {
  const viewer = await requireAdmin();
  const analytics = await getAdminAnalytics();
  const t = await getT();
  if (!analytics) return <Notice tone="warning">Analytics could not be loaded.</Notice>;
  const canExport = viewer.isAdmin;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Administrator" title="Analytics" description={t("Calculated from records at {time}. Verified and unverified figures are kept separate.", { time: formatDateTime(analytics.generated_at) })} />
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label={t("Donation totals")}>
        <StatCard label="Verified whole blood" value={formatNumber(analytics.donations.verified_whole_blood)} />
        <StatCard label="Verified SDP" value={formatNumber(analytics.donations.verified_sdp)} />
        <StatCard label="Verified other apheresis" value={formatNumber(analytics.donations.verified_other_apheresis)} />
        <StatCard label="Pending review" value={formatNumber(analytics.donations.pending)} hint={t("{count} not verified", { count: formatNumber(analytics.donations.rejected) })} />
      </section>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="surface p-4" aria-labelledby="reg-heading">
          <SectionHeading id="reg-heading" title="New donor registrations (12 months)" as="h3" />
          <MonthlyColumns label="Monthly donor registrations" data={analytics.monthly_registrations} series={[{ key: "count", name: t("Registrations"), className: "bg-navy" }]} />
        </section>
        <section className="surface p-4" aria-labelledby="don-heading">
          <SectionHeading id="don-heading" title="Verified donations by month" as="h3" />
          <MonthlyColumns
            label="Monthly verified donations"
            data={analytics.monthly_verified_donations}
            series={[
              { key: "whole_blood", name: t("Whole blood"), className: "bg-primary" },
              { key: "sdp", name: t("SDP"), className: "bg-navy" },
            ]}
          />
        </section>
        <section className="surface p-4" aria-labelledby="bg-heading">
          <SectionHeading id="bg-heading" title="Donors by blood group" as="h3" />
          <BarList label="Donors by blood group" items={BLOOD_GROUPS.map((g) => ({ label: g, value: analytics.by_blood_group.find((b) => b.blood_group === g)?.count ?? 0 }))} />
        </section>
        <section className="surface p-4" aria-labelledby="dist-heading">
          <SectionHeading id="dist-heading" title="Donors by district (top 15)" as="h3" />
          <BarList label="Donors by district" items={analytics.by_district.map((d) => ({ label: d.district, value: d.count }))} />
        </section>
        <section className="surface p-4 lg:col-span-2" aria-labelledby="req-heading">
          <SectionHeading id="req-heading" title="Requests by status" as="h3" />
          <BarList
            label="Requests by status"
            items={Object.entries(analytics.requests.by_status).map(([status, count]) => ({ label: t(REQUEST_STATUS_LABELS[status as RequestStatus] ?? status), value: Number(count) }))}
          />
        </section>
      </div>
      <section className="surface space-y-3 p-4" aria-labelledby="export-heading">
        <SectionHeading id="export-heading" title="Reports" description="CSV exports never include phone numbers, email addresses or exact locations. Every export is logged." as="h3" />
        {canExport ? (
          <div className="flex flex-wrap gap-2">
            {[
              { kind: "donors", label: "Donor summary" },
              { kind: "donations", label: "Donation records" },
              { kind: "requests", label: "Blood requests" },
            ].map((e) => (
              <Button key={e.kind} asChild variant="outline">
                <a download href={`/api/admin/export/${e.kind}`}>
                  <Download className="size-4" aria-hidden="true" /> {t(e.label)}
                </a>
              </Button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t("You need the export permission.")}</p>
        )}
      </section>
    </div>
  );
}
