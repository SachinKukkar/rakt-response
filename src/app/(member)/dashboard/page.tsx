import type { Metadata } from "next";
import Link from "next/link";
import { Bell, Droplet, HandHeart, MessageSquareQuote, ShieldCheck, SlidersHorizontal, UserRoundPen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ActionForm } from "@/components/common/action-form";
import { BloodGroupChip } from "@/components/common/blood-group-chip";
import { EmptyState, Notice, SectionHeading } from "@/components/common/page-parts";
import { ProfileVerificationBadge } from "@/components/common/status-badge";
import { DonationSummaryCards } from "@/components/donations/donation-summary";
import { RequestCard } from "@/components/requests/request-card";
import { setAvailability } from "@/actions/profile";
import { requireViewer } from "@/lib/auth";
import { getDonorData, getMyDonationChecks, getMyNextEligibleDate, getOpenRequestsForDonor, getRequestMatches, profileCompletion } from "@/lib/data/member";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";
import { getT } from "@/i18n/server";
import type { NotificationRow } from "@/lib/types";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("Dashboard") };
}

const NOTICES: Record<string, string> = {
  "password-updated": "Your password was updated.",
};

export default async function DashboardPage({ searchParams }: PageProps<"/dashboard">) {
  const t = await getT();
  const params = await searchParams;
  const viewer = await requireViewer("/dashboard");
  const profile = viewer.profile;
  const supabase = await createClient();
  const [donor, matches, openRequests, nextEligible, donationChecks, notificationsResult] = await Promise.all([
    getDonorData(viewer.id),
    profile?.is_donor ? getRequestMatches() : Promise.resolve([]),
    profile?.is_donor ? getOpenRequestsForDonor() : Promise.resolve([]),
    profile?.is_donor ? getMyNextEligibleDate() : Promise.resolve(null),
    profile?.is_donor ? getMyDonationChecks() : Promise.resolve([]),
    supabase.from("notifications").select("id, kind, title, body, link, read_at, created_at").order("created_at", { ascending: false }).limit(3),
  ]);
  const notifications = (notificationsResult.data ?? []) as NotificationRow[];
  const prefs = donor.preferences;
  const completion = profileCompletion({
    hasBloodGroup: Boolean(profile?.blood_group),
    hasPhone: Boolean(donor.contacts?.phone),
    hasLocation: Boolean(donor.location),
    hasMadeConsentChoice: Boolean(prefs?.directory_consent_at || prefs?.contact_consent_at || prefs?.emergency_consent_at),
    hasHistoryOrFirstTimer:
      donor.summary.reported_whole_blood_count + donor.summary.reported_sdp_count > 0 || profile?.donation_experience === "first_time",
  });
  const notice = typeof params.notice === "string" ? NOTICES[params.notice] : undefined;
  const name = profile?.display_name || profile?.full_name?.split(" ")[0] || t("there");
  const pendingContact = matches.filter((m) => m.contact_request_status === "pending").length;
  const myGroupRequests = openRequests.filter((r) => r.matches_group);
  const askDonated = donationChecks.filter((c) => c.ask_now);
  const [becomeDonorBefore, becomeDonorAfter] = t(
    "You registered as a member. Add your blood group and area from {link} whenever you're ready to join the donor register.",
  ).split("{link}");

  return (
    <div className="space-y-6">
      {params.welcome ? (
        <Notice tone="brand" icon={ShieldCheck} title="Welcome to Rakt Response">
          {t("Your account is active. Choose how patients can reach you, or hide your number, in Privacy & settings.")}
        </Notice>
      ) : null}
      {notice ? <Notice>{notice}</Notice> : null}
      {profile?.deletion_requested_at ? (
        <Notice tone="warning" title="Account deletion requested">
          {t("You were removed from discovery on {date}.", { date: formatDate(profile.deletion_requested_at) })}{" "}
          <Link href="/settings" className="font-semibold underline">
            {t("Manage request")}
          </Link>
        </Notice>
      ) : null}

      {askDonated.length ? (
        <Notice tone="brand" icon={HandHeart} title="Did you donate?">
          <p>{t("You joined these requests. Tell us if you gave blood, so we can thank you and keep your record right.")}</p>
          <ul className="mt-1">
            {askDonated.slice(0, 3).map((c) => (
              <li key={c.request_id}>
                <Link href={`/requests/${c.request_id}#donated`} className="inline-flex min-h-11 items-center font-semibold text-primary underline">
                  {t("{code} at {hospital}", { code: c.reference_code, hospital: c.hospital_name })}
                </Link>
              </li>
            ))}
          </ul>
        </Notice>
      ) : null}

      {/* Hero card */}
      <section className="brand-band overflow-hidden rounded-3xl p-5 text-white sm:p-6">
        <div className="flex items-center gap-4">
          {profile?.blood_group ? (
            <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-white/95">
              <BloodGroupChip group={profile.blood_group} size="md" />
            </span>
          ) : null}
          <div className="min-w-0">
            <p className="text-sm text-white/85">{t("Welcome back,")}</p>
            <h1 className="truncate text-2xl font-extrabold text-white">{name}</h1>
            <div className="mt-1.5">
              {profile ? <ProfileVerificationBadge status={profile.verification_status} /> : null}
            </div>
          </div>
        </div>
        {profile?.is_donor ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/10 p-3">
            <p className="text-sm">
              {prefs?.open_to_contact ? t("You're open to being contacted for requests.") : t("You're currently not available for contact.")}
            </p>
            <ActionForm
              action={setAvailability}
              fields={{ open: prefs?.open_to_contact ? "false" : "true" }}
              label={prefs?.open_to_contact ? "Pause availability" : "I'm available"}
              size="sm"
              variant="secondary"
              className="[&_[role=status]]:bg-white [&_[role=alert]]:bg-white"
            />
          </div>
        ) : null}
      </section>

      {/* Quick actions */}
      <section aria-labelledby="quick-actions">
        <h2 id="quick-actions" className="sr-only">
          {t("Quick actions")}
        </h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { href: "/donations/new", label: t("Record a donation"), icon: Droplet },
            { href: "/requests", label: pendingContact ? t("Requests ({count} waiting)", { count: pendingContact }) : t("Requests for me"), icon: HandHeart },
            { href: "/settings", label: t("Availability & privacy"), icon: SlidersHorizontal },
            { href: "/share-your-story", label: t("Share your story"), icon: MessageSquareQuote },
          ].map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="surface flex h-full min-h-24 flex-col justify-between gap-2 p-4 transition-colors hover:border-primary/40">
                <span className="grid size-10 place-items-center rounded-xl bg-accent text-primary">
                  <item.icon className="size-5" aria-hidden="true" />
                </span>
                <span className="text-sm font-semibold text-navy">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Profile completion */}
      {completion.percent < 100 ? (
        <section className="surface p-4" aria-labelledby="completion-heading">
          <div className="flex items-center justify-between gap-3">
            <h2 id="completion-heading" className="text-base font-bold">
              {t("Profile {percent}% complete", { percent: completion.percent })}
            </h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/profile/edit">
                <UserRoundPen className="size-4" aria-hidden="true" /> {t("Complete")}
              </Link>
            </Button>
          </div>
          <Progress value={completion.percent} className="mt-2" aria-label={t("Profile completion")} />
          <ul className="mt-3 flex flex-wrap gap-2">
            {completion.missing.map((m) => (
              <li key={m} className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                {t(m)}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Donations */}
      {profile?.is_donor ? (
        <section aria-labelledby="donations-heading">
          <SectionHeading
            id="donations-heading"
            title="Your donations"
            action={
              <Link href="/donations" className="shrink-0 text-sm font-semibold text-primary hover:underline">
                {t("History")}
              </Link>
            }
          />
          <DonationSummaryCards summary={donor.summary} nextEligible={nextEligible} />
        </section>
      ) : (
        <Notice title="Become a donor">
          {becomeDonorBefore}
          <Link href="/profile/edit" className="font-semibold text-primary underline">
            {t("your profile")}
          </Link>
          {becomeDonorAfter}
        </Notice>
      )}

      {/* Relevant requests */}
      {profile?.is_donor ? (
        <section aria-labelledby="matches-heading">
          <SectionHeading
            id="matches-heading"
            title="Requests that match you"
            description="Verified requests for your blood group. Join one when you can give."
            action={
              <Link href="/requests" className="shrink-0 text-sm font-semibold text-primary hover:underline">
                {t("All")}
              </Link>
            }
          />
          {myGroupRequests.length ? (
            <div className="grid gap-3 md:grid-cols-2">
              {myGroupRequests.slice(0, 2).map((m) => (
                <RequestCard key={m.request_id} request={{ ...m, id: m.request_id }} href={`/requests/${m.request_id}`} />
              ))}
            </div>
          ) : (
            <EmptyState icon={HandHeart} title="No matching requests right now" description="We'll notify you in the app if a verified request matches your preferences." />
          )}
        </section>
      ) : null}

      {/* Notifications */}
      <section aria-labelledby="notif-heading">
        <SectionHeading
          id="notif-heading"
          title="Latest notifications"
          action={
            <Link href="/notifications" className="shrink-0 text-sm font-semibold text-primary hover:underline">
              {t("View all")}
            </Link>
          }
        />
        {notifications.length ? (
          <ul className="space-y-2">
            {notifications.map((n) => (
              <li key={n.id} className="surface flex items-start gap-3 p-3.5">
                <Bell className={n.read_at ? "mt-0.5 size-4 text-muted-foreground" : "mt-0.5 size-4 text-primary"} aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-navy">{t(n.title)}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(n.created_at, { hour: "numeric", minute: "2-digit" })}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">{t("No notifications yet.")}</p>
        )}
      </section>
    </div>
  );
}
