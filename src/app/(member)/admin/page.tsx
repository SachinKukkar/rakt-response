import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, ClipboardCheck, Droplet, HandHeart, HeartPulse, MessageSquareQuote, Trash2, UserCog, Users } from "lucide-react";
import { Notice, PageHeader, SectionHeading, StatCard } from "@/components/common/page-parts";
import { BarList } from "@/components/admin/bar-list";
import { getAdminAnalytics, storiesAwaitingReview } from "@/lib/data/admin";
import { formatNumber } from "@/lib/format";
import { BLOOD_GROUPS } from "@/lib/constants";

export const metadata: Metadata = { title: "Administration" };

export default async function AdminOverviewPage() {
  const [analytics, storyQueue] = await Promise.all([getAdminAnalytics(), storiesAwaitingReview()]);
  if (!analytics) return <Notice tone="warning">Analytics could not be loaded.</Notice>;
  const queue = [
    { href: "/admin/donors?filter=pending", label: "Donor profiles to verify", value: analytics.donors.pending_verification, icon: BadgeCheck },
    { href: "/admin/donors?filter=blood_group_change", label: "Blood group corrections", value: analytics.donors.blood_group_changes, icon: UserCog },
    { href: "/admin/donors?filter=deletion", label: "Deletion requests", value: analytics.donors.deletion_requests, icon: Trash2 },
    { href: "/admin/donations", label: "Donation records to review", value: analytics.donations.pending, icon: Droplet },
    { href: "/admin/requests?tab=verify", label: "Requests awaiting verification", value: analytics.requests.awaiting_verification, icon: ClipboardCheck },
    { href: "/admin/stories", label: "Stories awaiting review", value: storyQueue, icon: MessageSquareQuote },
  ];
  const groups = BLOOD_GROUPS.map((g) => ({ label: g, value: analytics.by_blood_group.find((b) => b.blood_group === g)?.count ?? 0 }));

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Administrator" title="Administration" description="Every figure here is calculated from database records at the time you load the page." />
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Key figures">
        <StatCard label="Registered donors" value={formatNumber(analytics.donors.registered)} icon={Users} tone="navy" hint="Active, email confirmed" />
        <StatCard label="Verified donors" value={formatNumber(analytics.donors.verified)} icon={BadgeCheck} />
        <StatCard label="Verified whole blood" value={formatNumber(analytics.donations.verified_whole_blood)} icon={Droplet} />
        <StatCard label="Verified SDP" value={formatNumber(analytics.donations.verified_sdp)} icon={HeartPulse} />
        <StatCard label="Active requests" value={formatNumber(analytics.requests.active)} icon={HandHeart} />
        <StatCard label="Fulfilled requests" value={formatNumber(analytics.requests.fulfilled)} icon={ClipboardCheck} />
        <StatCard label="In directory" value={formatNumber(analytics.donors.directory_visible)} icon={Users} hint="Opted-in donors" />
        <StatCard label="Unconfirmed sign-ups" value={formatNumber(analytics.donors.unconfirmed_email)} icon={UserCog} />
      </section>

      <section aria-labelledby="queue-heading">
        <SectionHeading id="queue-heading" title="Needs attention" />
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {queue.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="surface flex min-h-16 items-center gap-3 p-4 hover:border-primary/40">
                <item.icon className="size-5 shrink-0 text-primary" aria-hidden="true" />
                <span className="flex-1 text-sm font-semibold text-navy">{item.label}</span>
                <span className="rounded-full bg-accent px-2.5 py-0.5 text-sm font-bold text-accent-foreground">{formatNumber(item.value)}</span>
                <ArrowRight className="size-4 text-muted-foreground" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="surface p-4" aria-labelledby="groups-heading">
          <SectionHeading id="groups-heading" title="Donors by blood group" as="h3" />
          <BarList items={groups} label="Donors by blood group" />
        </section>
        <section className="surface p-4" aria-labelledby="district-heading">
          <SectionHeading id="district-heading" title="Top districts" as="h3" action={<Link href="/admin/analytics" className="text-sm font-semibold text-primary hover:underline">Analytics</Link>} />
          <BarList items={analytics.by_district.map((d) => ({ label: d.district, value: d.count }))} label="Donors by district" />
        </section>
      </div>
    </div>
  );
}
