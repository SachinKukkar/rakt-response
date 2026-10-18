import type { Metadata } from "next";
import { PageHeader } from "@/components/common/page-parts";
import { RequestQueue } from "@/components/volunteer/request-queue";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("Request queue") };
}

export default async function VolunteerRequestsPage({ searchParams }: PageProps<"/volunteer/requests">) {
  return (
    <div>
      <PageHeader eyebrow="Rakt Mitra" title="Blood requests" description="Verify new requests before any donor is contacted. Close requests honestly." />
      <RequestQueue basePath="/volunteer/requests" searchParams={await searchParams} />
    </div>
  );
}
