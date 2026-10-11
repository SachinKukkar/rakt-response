import type { Metadata } from "next";
import Link from "next/link";
import { Notice, PageHeader } from "@/components/common/page-parts";
import { DonationForm } from "@/components/donations/donation-form";
import { requireViewer } from "@/lib/auth";

export const metadata: Metadata = { title: "Record a donation" };

export default async function NewDonationPage() {
  const viewer = await requireViewer("/donations/new");
  return (
    <div className="max-w-2xl">
      <PageHeader backHref="/donations" backLabel="Donation history" title="Record a donation" description="Add a whole blood, SDP or other apheresis donation." />
      {viewer.profile?.is_donor ? (
        <DonationForm />
      ) : (
        <Notice title="Add your blood group first">
          Recording donations is part of the donor profile.{" "}
          <Link href="/profile/edit" className="font-semibold text-primary underline">
            Complete your donor details
          </Link>{" "}
          to continue.
        </Notice>
      )}
    </div>
  );
}
