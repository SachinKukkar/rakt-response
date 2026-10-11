import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Camera, Pencil, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BloodGroupChip } from "@/components/common/blood-group-chip";
import { KeyValue, Notice, PageHeader, SectionHeading } from "@/components/common/page-parts";
import { Pill, ProfileVerificationBadge } from "@/components/common/status-badge";
import { requireViewer } from "@/lib/auth";
import { getDonorData } from "@/lib/data/member";
import { createClient } from "@/lib/supabase/server";
import { CONTACT_METHOD_LABELS, DONATION_EXPERIENCE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { formatPhone } from "@/lib/phone";

export const metadata: Metadata = { title: "My profile" };

export default async function ProfilePage() {
  const viewer = await requireViewer("/profile");
  const profile = viewer.profile;
  const donor = await getDonorData(viewer.id);
  let photoUrl: string | null = null;
  if (profile?.photo_path) {
    const supabase = await createClient();
    const { data } = await supabase.storage.from("profile-photos").createSignedUrl(profile.photo_path, 600);
    photoUrl = data?.signedUrl ?? null;
  }
  const prefs = donor.preferences;
  const yesNo = (v: boolean | undefined) => (v ? <Pill tone="success">On</Pill> : <Pill>Off</Pill>);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My profile"
        actions={
          <Button asChild variant="outline">
            <Link href="/profile/edit">
              <Pencil className="size-4" aria-hidden="true" /> Edit
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
        <div className="min-w-0 flex-1">
          <p className="text-xl font-extrabold text-navy">{profile?.full_name}</p>
          {profile?.display_name ? <p className="text-sm text-muted-foreground">Shown to volunteers as “{profile.display_name}”</p> : null}
          <div className="mt-2 flex flex-wrap gap-2">{profile ? <ProfileVerificationBadge status={profile.verification_status} /> : null}</div>
        </div>
        {profile?.blood_group ? (
          <div className="text-center">
            <BloodGroupChip group={profile.blood_group} size="lg" />
            <p className="mt-1 text-xs text-muted-foreground">{profile.blood_group_verified ? "Verified group" : "Self-declared"}</p>
          </div>
        ) : null}
      </section>

      {profile?.requested_blood_group ? (
        <Notice tone="warning">A correction to {profile.requested_blood_group} is waiting for administrator review.</Notice>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="surface p-5" aria-labelledby="details-heading">
          <SectionHeading id="details-heading" title="Details" as="h3" />
          <dl>
            <KeyValue label="Email">{viewer.email ?? "—"}</KeyValue>
            <KeyValue label="Mobile">{donor.contacts?.phone ? formatPhone(donor.contacts.phone) : "Not added"}</KeyValue>
            <KeyValue label="WhatsApp">{donor.contacts?.whatsapp ? formatPhone(donor.contacts.whatsapp) : "Same as mobile"}</KeyValue>
            <KeyValue label="Experience">{profile?.donation_experience ? DONATION_EXPERIENCE_LABELS[profile.donation_experience] : "—"}</KeyValue>
            <KeyValue label="Age declaration">{profile?.age_confirmed ? "Confirmed 18–65" : "Not confirmed"}</KeyValue>
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
              <KeyValue label="Approximate map point">{donor.location.approx_lat !== null ? "Added (~1 km)" : "Not added"}</KeyValue>
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">No area added yet. Volunteers can&apos;t match you to nearby requests without it.</p>
          )}
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
                <SlidersHorizontal className="size-4" aria-hidden="true" /> Manage
              </Link>
            </Button>
          }
        />
        <dl>
          <KeyValue label="Visible in volunteer directory">{yesNo(prefs?.directory_visible)}</KeyValue>
          <KeyValue label="Volunteers may contact me">{yesNo(prefs?.contact_consent)}</KeyValue>
          <KeyValue label="Currently open to contact">{yesNo(prefs?.open_to_contact)}</KeyValue>
          <KeyValue label="In-app request alerts">{yesNo(prefs?.emergency_alerts)}</KeyValue>
          <KeyValue label="Share verified donation summary">{yesNo(prefs?.show_donation_summary)}</KeyValue>
          <KeyValue label="Preferred contact">{prefs ? CONTACT_METHOD_LABELS[prefs.preferred_contact_method] : "—"}</KeyValue>
        </dl>
      </section>
    </div>
  );
}
