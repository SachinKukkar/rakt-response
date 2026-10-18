import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Hospital } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Notice, PageHeader } from "@/components/common/page-parts";
import { RequestCard } from "@/components/requests/request-card";
import { createPublicClient } from "@/lib/supabase/public";
import { uuidSchema } from "@/lib/validation/common";
import type { PublicRequestRow } from "@/lib/types";
import { formatDateTime } from "@/lib/format";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return pageMetadata(t("Blood request"), t("A verified blood request shared with consent. Only the blood group, hospital, city and time needed are shown."), { robots: { index: false } });
}

export default async function BloodRequestDetailPage({ params }: PageProps<"/blood-requests/[id]">) {
  const t = await getT();
  const { id } = await params;
  if (!uuidSchema.safeParse(id).success) notFound();
  const client = createPublicClient();
  if (!client) notFound();
  const { data } = await client.rpc("get_public_blood_request", { p_id: id });
  const request = (Array.isArray(data) ? data[0] : null) as PublicRequestRow | null;
  if (!request) notFound();
  const open = request.status === "verified" || request.status === "in_coordination";

  return (
    <div className="page-container max-w-2xl py-8 sm:py-12">
      <PageHeader
        backHref="/blood-requests"
        backLabel="All requests"
        title={t("{group} donors needed", { group: request.blood_group })}
        eyebrow={t("Request {code}", { code: request.reference_code })}
      />
      <RequestCard request={request} />
      <div className="mt-4 space-y-4">
        {request.verified_at ? (
          <p className="text-sm text-muted-foreground">
            {t("Verified by a Rakt Mitra on {date}.", { date: formatDateTime(request.verified_at) })}
          </p>
        ) : null}
        {open ? (
          <div className="surface space-y-3 p-5">
            <h2 className="text-lg font-bold">{t("Can you help?")}</h2>
            <p className="text-sm text-muted-foreground">
              {t(
                "Registered donors with this blood group who can give now can join the request. Joining shows you the patient's details and the family's number. The blood centre will check your eligibility.",
              )}
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button asChild>
                <Link href={`/requests/${request.id}`}>{t("I can help — sign in to join")}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/register">{t("Register as a donor")}</Link>
              </Button>
            </div>
          </div>
        ) : (
          <Notice title={t("This request is no longer open")}>{t("Thank you to everyone who responded.")}</Notice>
        )}
        <Notice tone="warning" icon={Hospital}>
          {t(
            "Rakt Response facilitates coordination only. It does not reserve blood, certify compatibility or replace the hospital or a licensed blood bank.",
          )}
        </Notice>
      </div>
    </div>
  );
}
