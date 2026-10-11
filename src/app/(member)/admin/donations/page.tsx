import type { Metadata } from "next";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/page-parts";
import { DonationReviewList } from "@/components/volunteer/donation-review";
import { requireAdmin } from "@/lib/auth";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("Donation records") };
}

export default async function AdminDonationsPage({ searchParams }: PageProps<"/admin/donations">) {
  const viewer = await requireAdmin();
  const t = await getT();
  return (
    <div>
      <PageHeader
        eyebrow="Administrator"
        title="Donation records"
        description="Administrator verification is recorded as “administrator-verified”."
        actions={
          viewer.isAdmin ? (
            <Button asChild variant="outline">
              <a download href="/api/admin/export/donations">
                <Download className="size-4" aria-hidden="true" /> {t("Export CSV")}
              </a>
            </Button>
          ) : null
        }
      />
      <DonationReviewList basePath="/admin/donations" searchParams={await searchParams} canVerify viewerId={viewer.id} />
    </div>
  );
}
