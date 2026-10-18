import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Camera, Droplets, MailWarning, MessageSquareQuote, Pencil, PenLine, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BloodGroupChip } from "@/components/common/blood-group-chip";
import { KeyValue, Notice, PageHeader, SectionHeading } from "@/components/common/page-parts";
import { ActionForm } from "@/components/common/action-form";
import { Pill, ProfileVerificationBadge, StoryStatusBadge } from "@/components/common/status-badge";
import { resendMyVerification } from "@/actions/profile";
import { requireViewer } from "@/lib/auth";
import { getDonationRecords, getDonorData } from "@/lib/data/member";
import { createClient } from "@/lib/supabase/server";
import { CONTACT_METHOD_LABELS, DONATION_EXPERIENCE_LABELS, type StoryStatus } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { formatPhone } from "@/lib/phone";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("My profile") };
}

export default async function ProfilePage() {
  const t = await getT();
  const viewer = await requireViewer("/profile");
  const profile = viewer.profile;
  const supabase = await createClient();
  const [donor, records, userResult, storiesResult, photoResult] = await Promise.all([
    getDonorData(viewer.id),
    getDonationRecords(viewer.id),
    supabase.auth.getUser(),
    supabase
      .from("impact_stories")
      .select("id, title, status, created_at")
      .eq("contributor_id", viewer.id)
      .order("created_at", { ascending: false })
      .limit(3),
    profile?.photo_path ? supabase.storage.from("profile-photos").createSignedUrl(profile.photo_path, 600) : null,
  ]);
  const photoUrl = photoResult?.data?.signedUrl ?? null;
  const authUser = userResult.data.user;
  const emailConfirmed = Boolean(authUser?.email_confirmed_at);
  const pendingEmail = authUser?.new_email ?? null;
  const stories = (storiesResult.data ?? []) as Array<{ id: string; title: string; status: StoryStatus; created_at: string }>;
  const verifiedRecords = records.filter((r) => r.verification_status === "verified");
  const lastDonation = records[0]?.donation_date ?? null;
  const prefs = donor.preferences;
  const yesNo = (v: boolean | undefined) => (v ? <Pill tone="success">On</Pill> : <Pill>Off</Pill>);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My profile"
        actions={
          <Button asChild variant="outline">
            <Link href="/profile/edit">
              <Pencil className="size-4" aria-hidden="true" /> {t("Edit")}
            </Link>
          </Button>
        }
      />
      <section className="surface flex flex-wrap items-center gap-4 p-5">
        <div className="grid size-20 place-items-center overflow-hidden rounded-full bg-accent">
          {photoUrl ? (
            <Image src={photoUrl} alt="" width={80} height={80} className="size-20 object-cover" unoptimized />
          ) : (
            <Camera className="size-7 text-primary" aria-hidden="true" />
          )}
        </div>
        {/* Phones: photo and blood group share the first row, the text gets the full width below. */}
        <div className="order-last min-w-0 basis-full sm:order-none sm:flex-1 sm:basis-0">
          <p className="text-xl font-extrabold text-navy">{profile?.full_name}</p>
          <p className="text-sm text-muted-foreground">
            {t("Rakt Mitras see you as “{name}”. Only admins see your full name and photo.", {
              name:
                profile?.display_name ||
                (prefs?.show_first_name || viewer.isStaff
                  ? (profile?.full_name.split(" ")[0] ?? "")
                  : t("Donor #{code}", { code: viewer.id.replace(/-/g, "").slice(0, 4).toUpperCase() })),
            })}
          </p>
          {profile?.bio ? <p className="mt-1.5 text-sm text-foreground/80 italic">“{profile.bio}”</p> : null}
          <div className="mt-2 flex flex-wrap gap-2">{profile ? <ProfileVerificationBadge status={profile.verification_status} /> : null}</div>
        </div>
        {profile?.blood_group ? (
          <div className="ml-auto text-center sm:ml-0">
            <BloodGroupChip group={profile.blood_group} size="lg" />
            <p className="mt-1 text-xs text-muted-foreground">{profile.blood_group_verified ? t("Verified group") : t("Self-declared")}</p>
          </div>
        ) : null}
      </section>

      <section className="surface flex flex-wrap items-center gap-3 p-5" aria-labelledby="email-heading">
        {emailConfirmed && !pendingEmail ? (
          <BadgeCheck className="size-6 shrink-0 text-success" aria-hidden="true" />
        ) : (
          <MailWarning className="size-6 shrink-0 text-primary" aria-hidden="true" />
        )}
        <div className="min-w-0 flex-1">
          <h3 id="email-heading" className="font-bold text-navy">
            {pendingEmail ? t("Confirm your new email") : emailConfirmed ? t("Email verified") : t("Email not verified yet")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {pendingEmail
              ? t("We sent a link to {pendingEmail}. Your account keeps using {email} until you confirm.", { pendingEmail, email: viewer.email })
              : emailConfirmed
                ? authUser?.email_confirmed_at
                  ? t("{email} was confirmed on {date}, so your donor profile is verified.", { email: viewer.email, date: formatDate(authUser.email_confirmed_at) })
                  : t("{email} was confirmed, so your donor profile is verified.", { email: viewer.email })
                : t("Confirm your email to get your verified donor badge.")}
          </p>
        </div>
        {pendingEmail || !emailConfirmed ? (
          <ActionForm action={resendMyVerification} label="Resend verification email" pendingText="Sending…" variant="outline" size="sm" />
        ) : null}
      </section>

      {profile?.requested_blood_group ? (
        <Notice tone="warning">{t("A correction to {group} is waiting for administrator review.", { group: profile.requested_blood_group })}</Notice>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="surface p-5" aria-labelledby="details-heading">
          <SectionHeading id="details-heading" title="Details" as="h3" />
          <dl>
            <KeyValue label="Email">{viewer.email ?? "—"}</KeyValue>
            <KeyValue label="Mobile">{donor.contacts?.phone ? formatPhone(donor.contacts.phone) : t("Not added")}</KeyValue>
            <KeyValue label="WhatsApp">{donor.contacts?.whatsapp ? formatPhone(donor.contacts.whatsapp) : t("Same as mobile")}</KeyValue>
            <KeyValue label="Experience">{profile?.donation_experience ? t(DONATION_EXPERIENCE_LABELS[profile.donation_experience]) : "—"}</KeyValue>
            <KeyValue label="Age declaration">{profile?.age_confirmed ? t("Confirmed 18–65") : t("Not confirmed")}</KeyValue>
            <KeyValue label="Member since">{formatDate(profile?.created_at)}</KeyValue>
          </dl>
        </section>
        <section className="surface p-5" aria-labelledby="area-heading">
          <SectionHeading id="area-heading" title="Area" as="h3" />
          {donor.location ? (
            <dl>
              <KeyValue label="State">{donor.location.state}</KeyValue>
              <KeyValue label="District">{donor.location.district}</KeyValue>
              <KeyValue label="City / town">{donor.location.city}</KeyValue>
              <KeyValue label="Locality">{donor.location.locality ?? "—"}</KeyValue>
              <KeyValue label="PIN code">{donor.location.pincode ?? "—"}</KeyValue>
              <KeyValue label="Approximate map point">{donor.location.approx_lat !== null ? t("Added (~1 km)") : t("Not added")}</KeyValue>
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">{t("No area added yet. Rakt Mitras can't match you to nearby requests without it.")}</p>
          )}
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="surface p-5" aria-labelledby="donations-heading">
          <SectionHeading
            id="donations-heading"
            title="My donations"
            as="h3"
            action={
              <Button asChild variant="ghost" size="sm">
                <Link href="/donations">
                  <Droplets className="size-4" aria-hidden="true" /> {t("View all")}
                </Link>
              </Button>
            }
          />
          <dl>
            <KeyValue label="Donations logged">{records.length}</KeyValue>
            <KeyValue label="Verified by a Rakt Mitra">{verifiedRecords.length}</KeyValue>
            <KeyValue label="Last donation">{lastDonation ? formatDate(lastDonation) : t("None logged yet")}</KeyValue>
          </dl>
          <Button asChild size="sm" className="mt-3">
            <Link href="/donations/new">{t("Log a donation")}</Link>
          </Button>
        </section>
        <section className="surface p-5" aria-labelledby="stories-heading">
          <SectionHeading
            id="stories-heading"
            title="My stories"
            as="h3"
            action={
              stories.length ? (
                <Button asChild variant="ghost" size="sm">
                  <Link href="/share-your-story/submissions">
                    <MessageSquareQuote className="size-4" aria-hidden="true" /> {t("Manage")}
                  </Link>
                </Button>
              ) : undefined
            }
          />
          {stories.length ? (
            <ul className="divide-y divide-border">
              {stories.map((story) => (
                <li key={story.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{story.title}</p>
                    <p className="text-xs text-muted-foreground">{t("Shared {date}", { date: formatDate(story.created_at) })}</p>
                  </div>
                  <StoryStatusBadge status={story.status} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t("Tell people why you donate, with a photo if you like. An admin reviews it and you choose what is shown.")}
            </p>
          )}
          <Button asChild size="sm" variant={stories.length ? "outline" : "default"} className="mt-3">
            <Link href="/share-your-story">
              <PenLine className="size-4" aria-hidden="true" /> {t("Share your story")}
            </Link>
          </Button>
        </section>
      </div>

      <section className="surface p-5" aria-labelledby="privacy-heading">
        <SectionHeading
          id="privacy-heading"
          title="Privacy & availability"
          as="h3"
          action={
            <Button asChild variant="ghost" size="sm">
              <Link href="/settings">
                <SlidersHorizontal className="size-4" aria-hidden="true" /> {t("Manage")}
              </Link>
            </Button>
          }
        />
        <dl>
          <KeyValue label="Number hidden from patients">{yesNo(prefs?.hide_number)}</KeyValue>
          <KeyValue label="Currently open to contact">{yesNo(prefs?.open_to_contact)}</KeyValue>
          <KeyValue label="In-app request alerts">{yesNo(prefs?.emergency_alerts)}</KeyValue>
          <KeyValue label="Share verified donation summary">{yesNo(prefs?.show_donation_summary)}</KeyValue>
          <KeyValue label="Rakt Mitras see my first name">{yesNo(prefs?.show_first_name)}</KeyValue>
          <KeyValue label="Preferred contact">{prefs ? t(CONTACT_METHOD_LABELS[prefs.preferred_contact_method]) : "—"}</KeyValue>
        </dl>
      </section>
    </div>
  );
}
