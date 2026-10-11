import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardList, HandHeart, Plus, UserRoundSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActionForm } from "@/components/common/action-form";
import { EmptyState, Notice, PageHeader, SectionHeading } from "@/components/common/page-parts";
import { Pill } from "@/components/common/status-badge";
import { RequestCard } from "@/components/requests/request-card";
import { cancelMyRequest, respondToContactRequest, respondToRequest } from "@/actions/requests";
import { requireViewer } from "@/lib/auth";
import { getRequestMatches } from "@/lib/data/member";
import { createClient } from "@/lib/supabase/server";
import { CLOSED_REQUEST_STATUSES, RESPONSE_LABELS } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import type { BloodRequestRow } from "@/lib/types";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("Requests") };
}

export default async function MyRequestsPage() {
  const t = await getT();
  const viewer = await requireViewer("/requests");
  const supabase = await createClient();
  const [matches, ownResult] = await Promise.all([
    viewer.profile?.is_donor ? getRequestMatches() : Promise.resolve([]),
    supabase
      .from("blood_requests")
      .select("id, reference_code, blood_group, request_type, units_needed, hospital_name, city, district, required_by, urgency, status, closure_reason, created_at")
      .eq("created_by", viewer.id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);
  const own = (ownResult.data ?? []) as BloodRequestRow[];
  const contactRequests = matches.filter((m) => m.contact_request_status === "pending");
  const others = matches.filter((m) => m.contact_request_status !== "pending");

  return (
    <div className="space-y-8">
      <PageHeader
        title="Requests"
        description="Requests where your help could matter, and requests you've submitted."
        actions={
          <Button asChild variant="outline">
            <Link href="/blood-requests/new">
              <Plus className="size-4" aria-hidden="true" /> {t("New request")}
            </Link>
          </Button>
        }
      />

      {contactRequests.length ? (
        <section aria-labelledby="contact-heading">
          <SectionHeading id="contact-heading" title="Contact requests waiting for you" description="A volunteer asked if they may contact you. Your details are shared only if you accept." />
          <ul className="space-y-3">
            {contactRequests.map((m) => (
              <li key={m.contact_request_id}>
                <RequestCard
                  request={{ ...m, id: m.request_id }}
                  className="border-primary/30"
                  footer={
                    <div className="space-y-3">
                      {m.contact_request_message ? <p className="text-sm">&ldquo;{m.contact_request_message}&rdquo;</p> : null}
                      {m.contact_request_expires_at ? (
                        <p className="text-xs text-muted-foreground">
                          {t("Respond by {date}", { date: formatDateTime(m.contact_request_expires_at) })}
                        </p>
                      ) : null}
                      <div className="flex flex-wrap gap-2">
                        <ActionForm action={respondToContactRequest} fields={{ contact_request_id: m.contact_request_id!, accept: "true" }} label="Share my contact details" hideAfterSuccess />
                        <ActionForm action={respondToContactRequest} fields={{ contact_request_id: m.contact_request_id!, accept: "false" }} label="Decline" variant="outline" hideAfterSuccess />
                      </div>
                    </div>
                  }
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {viewer.profile?.is_donor ? (
        <section aria-labelledby="matches-heading">
          <SectionHeading id="matches-heading" title="Requests that match you" description="Respond only if you can currently donate. A volunteer will confirm before you travel." />
          <Notice className="mb-3">
            {t("Interest is not a commitment, and it is never treated as a confirmed donation. The blood centre will check your eligibility.")}
          </Notice>
          {others.length ? (
            <ul className="grid gap-3 md:grid-cols-2">
              {others.map((m) => (
                <li key={m.request_id}>
                  <RequestCard
                    request={{ ...m, id: m.request_id }}
                    footer={
                      <div className="space-y-2">
                        {m.my_response && m.my_response !== "no_response" ? (
                          <Pill tone={m.my_response === "interested" ? "success" : "neutral"}>
                            {t("Your response: {response}", { response: t(RESPONSE_LABELS[m.my_response]) })}
                          </Pill>
                        ) : null}
                        {m.contact_request_status === "accepted" ? <Pill tone="info">{t("You shared contact details")}</Pill> : null}
                        <div className="flex flex-wrap gap-2">
                          <ActionForm action={respondToRequest} fields={{ request_id: m.request_id, response: "interested" }} label="I can help" size="sm" />
                          <ActionForm action={respondToRequest} fields={{ request_id: m.request_id, response: "unavailable" }} label="Not available" size="sm" variant="outline" />
                        </div>
                      </div>
                    }
                  />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={HandHeart} title="Nothing needs you right now" description="Verified requests for your blood group in your district will appear here." />
          )}
        </section>
      ) : (
        <Notice icon={UserRoundSearch} title={t("Want to respond to requests?")}>
          <Link href="/profile/edit" className="font-semibold text-primary underline">
            {t("Add your blood group and area")}
          </Link>{" "}
          {t("to join the donor register.")}
        </Notice>
      )}

      <section aria-labelledby="own-heading">
        <SectionHeading id="own-heading" title="Requests you submitted" />
        {own.length ? (
          <ul className="space-y-3">
            {own.map((r) => (
              <li key={r.id}>
                <RequestCard
                  request={r}
                  footer={
                    CLOSED_REQUEST_STATUSES.includes(r.status) ? (
                      r.closure_reason ? <p className="text-xs text-muted-foreground">{t("Note: {reason}", { reason: t(r.closure_reason) })}</p> : null
                    ) : (
                      <ActionForm
                        action={cancelMyRequest}
                        fields={{ request_id: r.id, reason: "No longer needed" }}
                        label="Cancel — no longer needed"
                        variant="ghost"
                        size="sm"
                        confirmText="Cancel this request? Volunteers will stop contacting donors."
                        hideAfterSuccess
                      />
                    )
                  }
                />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState icon={ClipboardList} title="You haven't submitted any requests" description="If someone needs blood, submit a request and a volunteer will verify it." />
        )}
      </section>
    </div>
  );
}
