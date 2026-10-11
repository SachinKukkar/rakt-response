import type { Metadata } from "next";
import { PageHero } from "@/components/learn/learn-parts";
import Link from "next/link";
import {
  Activity,
  BadgeCheck,
  ClipboardCheck,
  Droplet,
  Eye,
  FilePenLine,
  HandHeart,
  HeartPulse,
  Inbox,
  Lock,
  MessageSquareQuote,
  ShieldCheck,
  Tent,
  UserCheck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, Notice, SectionHeading } from "@/components/common/page-parts";
import { Pill } from "@/components/common/status-badge";
import { ImpactStats, type MetricDefinition } from "@/components/impact/impact-stats";
import { StoryCard, TrustLabelGuide } from "@/components/stories/story-parts";
import { getImpactMetrics, listPublishedStories } from "@/lib/data/public";
import { createPublicClient } from "@/lib/supabase/public";
import { formatDate, formatNumber } from "@/lib/format";
import { TRUST_LABELS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Our Impact",
  description: "Transparent, record-based figures, real stories shared with consent, and how Rakt Response works.",
};

export const revalidate = 300;

const IMPACT_METRICS: MetricDefinition[] = [
  { key: "registered_donors", label: "Registered donors", icon: Users, definition: "Active donor accounts with a confirmed email address." },
  { key: "verified_donors", label: "Verified donors", icon: UserCheck, definition: "Donor profiles checked by an administrator. Verification is not a medical eligibility decision." },
  { key: "verified_whole_blood_donations", label: "Verified whole blood donations", icon: Droplet, definition: "Whole blood donation records verified by an authorised volunteer or administrator." },
  { key: "verified_sdp_donations", label: "Verified SDP donations", icon: HeartPulse, definition: "Single donor platelet records that have been verified. Counted separately from whole blood." },
  { key: "requests_received", label: "Blood requests received", icon: Inbox, definition: "Requests submitted to volunteers (excluding drafts). Includes requests that could not be verified." },
  { key: "requests_verified", label: "Requests verified", icon: ClipboardCheck, definition: "Requests a volunteer confirmed with the requester or hospital." },
  { key: "requests_coordinated", label: "Requests coordinated", icon: HandHeart, definition: "Verified requests where volunteers actively coordinated with potential donors." },
  { key: "requests_fulfilled", label: "Requests fulfilled", icon: Activity, definition: "Closed as fulfilled with a confirmation note. Contacting a donor or receiving interest does not count." },
  { key: "camps_completed", label: "Donation camps organised", icon: Tent, definition: "Completed camps recorded by administrators." },
];

interface PublicCamp {
  id: string;
  name: string;
  camp_date: string;
  city: string;
  district: string;
  organizing_partners: string | null;
  partners_confirmed: boolean;
  registrations_count: number | null;
  verified_donor_count: number | null;
  verified_units_collected: number | null;
  volunteer_count: number | null;
  highlights: string | null;
  learnings: string | null;
  data_source: string | null;
  data_verified_at: string | null;
}

const HOW_WE_WORK = [
  { icon: UserCheck, title: "Donor registration & verification", text: "Donors register themselves. Profiles are private by default and an administrator can verify identity details. Verification never decides medical eligibility." },
  { icon: ClipboardCheck, title: "Reviewing blood requests", text: "Every request is checked by an authorised volunteer — usually with the requester or hospital — before it is marked verified, shown publicly or sent to donors." },
  { icon: HandHeart, title: "Coordinating with donors", text: "Volunteers contact only donors who allowed it, or who accept a contact request. Each access to contact details is logged and rate-limited." },
  { icon: Droplet, title: "Updating donation records", text: "Donors add donations as self-reported. Authorised reviewers verify them separately for whole blood and SDP." },
  { icon: Lock, title: "Protecting privacy", text: "No public donor lists, phone numbers or addresses. Permissions are enforced by the database, not only the app." },
  { icon: Eye, title: "What we can and cannot guarantee", text: "We help find willing voluntary donors. We cannot guarantee availability, reserve blood, certify compatibility or replace hospitals and licensed blood banks." },
];

export default async function ImpactPage() {
  const client = createPublicClient();
  const [metrics, stories, campsResult] = await Promise.all([
    getImpactMetrics(),
    listPublishedStories(null, 3),
    client
      ? client
          .from("camp_records")
          .select(
            "id, name, camp_date, city, district, organizing_partners, partners_confirmed, registrations_count, verified_donor_count, verified_units_collected, volunteer_count, highlights, learnings, data_source, data_verified_at",
          )
          .eq("is_public", true)
          .eq("status", "completed")
          .order("camp_date", { ascending: false })
          .limit(6)
      : Promise.resolve({ data: null }),
  ]);
  const camps = (campsResult.data ?? []) as PublicCamp[];

  return (
    <>
      <PageHero eyebrow="Our Impact" title="Real people." highlight="Real numbers." subtitle="Every figure comes straight from verified records. Every story is shared with permission." chips={["No made-up stats", "Verified ≠ self-reported", "Open about how we work"]} />
    <div className="page-container py-8">

      <section className="mb-10" aria-labelledby="metrics-heading">
        <SectionHeading id="metrics-heading" title="Impact dashboard" description="Each figure is counted live from records. Unverified data is never shown as verified." />
        <ImpactStats metrics={metrics} items={IMPACT_METRICS} showDefinitions />
        {metrics && metrics.coordination_sample_size >= 3 && metrics.median_hours_to_coordination !== null ? (
          <p className="mt-3 rounded-xl bg-secondary p-3 text-sm text-secondary-foreground">
            Median time from verification to active coordination:{" "}
            <strong>{metrics.median_hours_to_coordination} hours</strong> (based on {formatNumber(metrics.coordination_sample_size)} requests with
            recorded timestamps).
          </p>
        ) : null}
        {metrics ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Self-reported donations awaiting verification: {formatNumber(metrics.self_reported_donations)} — shown separately and not
            included in verified totals.
          </p>
        ) : null}
      </section>

      {metrics && metrics.manual_sources.length ? (
        <section className="mb-10" aria-labelledby="sources-heading">
          <SectionHeading
            id="sources-heading"
            title="Documented figures from partners"
            description="Figures we cannot derive from platform records, each with its source and verification date."
          />
          <ul className="grid gap-3 sm:grid-cols-2">
            {metrics.manual_sources.map((source) => (
              <li key={`${source.label}-${source.verified_at}`} className="surface p-4">
                <Pill tone="success" icon={BadgeCheck}>
                  {TRUST_LABELS.impact_verified.label}
                </Pill>
                <p className="mt-2 text-2xl font-extrabold text-navy">
                  {formatNumber(Number(source.value))} {source.unit ?? ""}
                </p>
                <p className="font-semibold">{source.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {source.period_start || source.period_end
                    ? `Period: ${formatDate(source.period_start)} – ${formatDate(source.period_end)}. `
                    : ""}
                  Source: {source.source}. Verified {formatDate(source.verified_at)}.
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mb-10" aria-labelledby="stories-heading">
        <SectionHeading
          id="stories-heading"
          title="Stories of donors, families and volunteers"
          action={
            <Link href="/stories" className="shrink-0 text-sm font-semibold text-primary hover:underline">
              All stories
            </Link>
          }
        />
        {stories && stories.stories.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stories.stories.map((story) => (
              <StoryCard key={story.slug} story={story} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={MessageSquareQuote}
            title="No stories published yet"
            description="We only publish real experiences after review and with the contributor's consent."
            action={
              <Button asChild variant="outline">
                <Link href="/share-your-story">Share your story</Link>
              </Button>
            }
          />
        )}
        <div className="mt-4">
          <TrustLabelGuide />
        </div>
      </section>

      <section className="mb-10" aria-labelledby="camps-heading">
        <SectionHeading id="camps-heading" title="Blood donation camps" description="Registrations and attendance are never counted as completed donations." />
        {camps.length ? (
          <ul className="grid gap-3 md:grid-cols-2">
            {camps.map((camp) => (
              <li key={camp.id} className="surface space-y-2 p-4">
                <p className="text-xs font-semibold text-primary">
                  {formatDate(camp.camp_date)} · {camp.city}, {camp.district}
                </p>
                <p className="font-bold text-navy">{camp.name}</p>
                {camp.partners_confirmed && camp.organizing_partners ? (
                  <p className="text-sm text-muted-foreground">With {camp.organizing_partners}</p>
                ) : null}
                <dl className="grid grid-cols-2 gap-2 text-sm">
                  {camp.data_verified_at && camp.verified_donor_count !== null ? (
                    <div className="rounded-xl bg-success-soft p-2">
                      <dt className="text-xs text-success">Verified donors</dt>
                      <dd className="font-bold text-navy">{formatNumber(camp.verified_donor_count)}</dd>
                    </div>
                  ) : null}
                  {camp.data_verified_at && camp.verified_units_collected !== null ? (
                    <div className="rounded-xl bg-success-soft p-2">
                      <dt className="text-xs text-success">Verified units collected</dt>
                      <dd className="font-bold text-navy">{formatNumber(camp.verified_units_collected)}</dd>
                    </div>
                  ) : null}
                  {camp.registrations_count !== null ? (
                    <div className="rounded-xl bg-muted p-2">
                      <dt className="text-xs text-muted-foreground">Registrations (not donations)</dt>
                      <dd className="font-bold text-navy">{formatNumber(camp.registrations_count)}</dd>
                    </div>
                  ) : null}
                  {camp.volunteer_count !== null ? (
                    <div className="rounded-xl bg-muted p-2">
                      <dt className="text-xs text-muted-foreground">Volunteers</dt>
                      <dd className="font-bold text-navy">{formatNumber(camp.volunteer_count)}</dd>
                    </div>
                  ) : null}
                </dl>
                {camp.highlights ? <p className="text-sm">{camp.highlights}</p> : null}
                {camp.learnings ? <p className="text-sm text-muted-foreground">Learnings: {camp.learnings}</p> : null}
                {camp.data_verified_at ? (
                  <p className="text-xs text-muted-foreground">
                    Figures verified {formatDate(camp.data_verified_at)}
                    {camp.data_source ? ` · Source: ${camp.data_source}` : ""}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">Participation figures not yet verified.</p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState icon={Tent} title="No camps recorded yet" description="Completed camps appear here once administrators record and verify them." />
        )}
      </section>

      <section className="mb-10" aria-labelledby="how-heading">
        <SectionHeading id="how-heading" title="How We Work" description="What happens behind the scenes, in plain language." />
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {HOW_WE_WORK.map((item) => (
            <li key={item.title} className="surface p-4">
              <item.icon className="mb-2 size-6 text-primary" aria-hidden="true" />
              <p className="font-semibold text-navy">{item.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{item.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="report-heading" className="grid gap-3 md:grid-cols-2">
        <Notice icon={ShieldCheck} title="Report inaccurate information">
          <p id="report-heading">
            If a figure, request or story looks wrong, please <Link href="/contact" className="font-semibold text-primary underline">tell us</Link>. We
            will review it and correct or remove it.
          </p>
        </Notice>
        <Notice icon={FilePenLine} title="Corrections and removal">
          Contributors can request a correction or withdraw their story at any time from{" "}
          <Link href="/share-your-story/submissions" className="font-semibold text-primary underline">
            My stories
          </Link>
          . Withdrawal removes it from the website immediately.
        </Notice>
      </section>
    </div>
    </>
  );
}
