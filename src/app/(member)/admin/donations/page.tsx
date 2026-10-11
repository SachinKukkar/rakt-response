import type { Metadata } from "next";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/page-parts";
import { DonationReviewList } from "@/components/volunteer/donation-review";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Donation records" };

export default async function AdminDonationsPage({ searchParams }: PageProps<"/admin/donations">) {
  const viewer = await requireAdmin();
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
                <Download className="size-4" aria-hidden="true" /> Export CSV
              </a>
            </Button>
          ) : null
        }
      />
      <DonationReviewList basePath="/admin/donations" searchParams={await searchParams} canVerify viewerId={viewer.id} />
    </div>
  );
}
