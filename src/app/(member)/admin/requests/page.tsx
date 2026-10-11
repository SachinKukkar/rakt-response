import type { Metadata } from "next";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/page-parts";
import { RequestQueue } from "@/components/volunteer/request-queue";
import { requireAdmin } from "@/lib/auth";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("All requests") };
}

export default async function AdminRequestsPage({ searchParams }: PageProps<"/admin/requests">) {
  const viewer = await requireAdmin();
  const t = await getT();
  return (
    <div>
      <PageHeader
        eyebrow="Administrator"
        title="Blood requests"
        description="Open a request to verify, assign volunteers or close it."
        actions={
          viewer.isAdmin ? (
            <Button asChild variant="outline">
              <a download href="/api/admin/export/requests">
                <Download className="size-4" aria-hidden="true" /> {t("Export CSV")}
              </a>
            </Button>
          ) : null
        }
      />
      <RequestQueue basePath="/admin/requests" searchParams={await searchParams} />
    </div>
  );
}
