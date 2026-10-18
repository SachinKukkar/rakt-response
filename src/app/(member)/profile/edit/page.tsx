import type { Metadata } from "next";
import { PageHeader, SectionHeading } from "@/components/common/page-parts";
import { BloodGroupForm, LocationForm, PhotoForm, ProfileDetailsForm } from "@/components/profile/profile-forms";
import { requireViewer } from "@/lib/auth";
import { getDonorData } from "@/lib/data/member";
import { createClient } from "@/lib/supabase/server";
import type { DonorLocationInput } from "@/lib/validation/registration";
import { INDIAN_STATES } from "@/lib/constants";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("Edit profile") };
}

export default async function EditProfilePage() {
  const viewer = await requireViewer("/profile/edit");
  const profile = viewer.profile;
  const donor = await getDonorData(viewer.id);
  let photoUrl: string | null = null;
  if (profile?.photo_path) {
    const supabase = await createClient();
    const { data } = await supabase.storage.from("profile-photos").createSignedUrl(profile.photo_path, 600);
    photoUrl = data?.signedUrl ?? null;
  }
  const loc = donor.location;
  const locationDefaults: DonorLocationInput = {
    state: (INDIAN_STATES as readonly string[]).includes(loc?.state ?? "") ? (loc!.state as DonorLocationInput["state"]) : ("" as DonorLocationInput["state"]),
    district: loc?.district ?? "",
    city: loc?.city ?? "",
    locality: loc?.locality ?? "",
    pincode: loc?.pincode ?? "",
    lat: loc?.approx_lat !== null && loc?.approx_lat !== undefined ? Number(loc.approx_lat) : null,
    lng: loc?.approx_lng !== null && loc?.approx_lng !== undefined ? Number(loc.approx_lng) : null,
    max_distance_km: donor.preferences?.max_distance_km ?? null,
  };

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader backHref="/profile" backLabel="Profile" title="Edit profile" description="Keep your details current so Rakt Mitras can respond quickly." />
      <section className="surface p-5" aria-labelledby="photo-heading">
        <SectionHeading id="photo-heading" title="Profile photo" as="h3" />
        <PhotoForm photoUrl={photoUrl} />
      </section>
      <section className="surface p-5" aria-labelledby="bg-heading">
        <SectionHeading id="bg-heading" title="Blood group" as="h3" />
        <BloodGroupForm current={profile?.blood_group ?? null} verified={Boolean(profile?.blood_group_verified)} requested={profile?.requested_blood_group ?? null} />
      </section>
      <section className="surface p-5" aria-labelledby="details-heading">
        <SectionHeading id="details-heading" title="Personal details" as="h3" />
        <ProfileDetailsForm
          ageConfirmed={Boolean(profile?.age_confirmed)}
          defaults={{
            full_name: profile?.full_name ?? "",
            display_name: profile?.display_name ?? "",
            bio: profile?.bio ?? "",
            donation_experience: profile?.donation_experience ?? "",
            approx_previous_donations: profile?.approx_previous_donations ?? null,
            phone: donor.contacts?.phone ?? "",
            whatsapp: donor.contacts?.whatsapp ?? "",
          }}
        />
      </section>
      <section className="surface p-5" aria-labelledby="area-heading">
        <SectionHeading id="area-heading" title="Area" description="Never your street address." as="h3" />
        <LocationForm defaults={locationDefaults} />
      </section>
    </div>
  );
}
