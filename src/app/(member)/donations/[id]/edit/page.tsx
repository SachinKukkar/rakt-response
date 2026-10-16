import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/common/page-parts";
import { DonationForm } from "@/components/donations/donation-form";
import { requireViewer, viewerCan } from "@/lib/auth";
import type { DonationType, VerificationStatus } from "@/lib/constants";
import { profileLabels } from "@/lib/data/staff";
import { safeNextPath } from "@/lib/redirects";
import { createClient } from "@/lib/supabase/server";
import { uuidSchema } from "@/lib/validation/common";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("Edit donation") };
}

interface EditableRow {
  id: string;
  donor_id: string;
  donation_type: DonationType;
  donation_date: string;
  centre_name: string;
  city: string | null;
  district: string | null;
  event_name: string | null;
  verification_status: VerificationStatus;
}

/**
 * Edit one donation record. The database decides who may see and change it:
 * the donor, volunteers who verify donations, and administrators.
 */
export default async function EditDonationPage({ params, searchParams }: PageProps<"/donations/[id]/edit">) {
  const viewer = await requireViewer("/donations");
  const [{ id }, query, t] = await Promise.all([params, searchParams, getT()]);
  if (!uuidSchema.safeParse(id).success) notFound();

  const supabase = await createClient();
  const { data } = await supabase
    .from("donation_records")
    .select("id, donor_id, donation_type, donation_date, centre_name, city, district, event_name, verification_status")
    .eq("id", id)
    .maybeSingle();
  const record = data as EditableRow | null;
  if (!record) notFound();
  const isOwner = record.donor_id === viewer.id;
  if (!isOwner && !viewerCan(viewer, "verify_donations")) notFound();

  const fromParam = Array.isArray(query.from) ? query.from[0] : query.from;
  const back = safeNextPath(fromParam, isOwner ? "/donations" : "/volunteer/donations");
  const donorName = isOwner ? null : ((await profileLabels([record.donor_id])).get(record.donor_id)?.label ?? t("Donor"));

  return (
    <div className="max-w-2xl">
      <PageHeader
        backHref={back}
        backLabel="Back"
        title="Edit donation"
        description={isOwner ? t("Fix anything that was typed wrong, then save.") : t("Correcting a record for {name}.", { name: (donorName ?? "").replace(/\.$/, "") })}
      />
      <DonationForm
        returnTo={back}
        record={{
          id: record.id,
          isOwner,
          status: record.verification_status,
          values: {
            donation_type: record.donation_type,
            donation_date: record.donation_date,
            centre_name: record.centre_name,
            city: record.city ?? "",
            district: record.district ?? "",
            event_name: record.event_name ?? "",
            confirm_duplicate: false,
          },
        }}
      />
    </div>
  );
}
