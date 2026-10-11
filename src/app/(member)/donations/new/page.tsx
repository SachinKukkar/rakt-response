import type { Metadata } from "next";
import Link from "next/link";
import { Notice, PageHeader } from "@/components/common/page-parts";
import { DonationForm } from "@/components/donations/donation-form";
import { requireViewer } from "@/lib/auth";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("Record a donation") };
}

export default async function NewDonationPage() {
  const t = await getT();
  const viewer = await requireViewer("/donations/new");
  const [before, after] = t("Recording donations is part of the donor profile. {link} to continue.").split("{link}");
  return (
    <div className="max-w-2xl">
      <PageHeader backHref="/donations" backLabel="Donation history" title="Record a donation" description="Add a whole blood, SDP or other apheresis donation." />
      {viewer.profile?.is_donor ? (
        <DonationForm />
      ) : (
        <Notice title="Add your blood group first">
          {before}
          <Link href="/profile/edit" className="font-semibold text-primary underline">
            {t("Complete your donor details")}
          </Link>
          {after}
        </Notice>
      )}
    </div>
  );
}
