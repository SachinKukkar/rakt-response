import type { Metadata } from "next";
import { CheckCircle2, Download } from "lucide-react";
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
  const params = await searchParams;
  return (
    <div>
      <PageHeader
        eyebrow="Administrator"
        title="Blood requests"
        description="Open a request to verify, assign Rakt Mitras or close it."
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
      {params.deleted ? (
        <p className="mb-4 flex items-start gap-2 rounded-xl border border-success/25 bg-success-soft px-3.5 py-3 text-sm text-success" role="status">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {t("The request was deleted.")}
        </p>
      ) : null}
      <RequestQueue basePath="/admin/requests" searchParams={params} />
    </div>
  );
}
