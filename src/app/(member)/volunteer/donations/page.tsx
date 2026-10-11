import type { Metadata } from "next";
import { PageHeader } from "@/components/common/page-parts";
import { DonationReviewList } from "@/components/volunteer/donation-review";
import { requireStaff, viewerCan } from "@/lib/auth";

export const metadata: Metadata = { title: "Donation records" };

export default async function VolunteerDonationsPage({ searchParams }: PageProps<"/volunteer/donations">) {
  const viewer = await requireStaff();
  return (
    <div>
      <PageHeader eyebrow="Volunteer" title="Donation records" description="Review self-reported donations. Whole blood and SDP records are verified separately." />
      <DonationReviewList basePath="/volunteer/donations" searchParams={await searchParams} canVerify={viewerCan(viewer, "verify_donations")} viewerId={viewer.id} />
    </div>
  );
}
