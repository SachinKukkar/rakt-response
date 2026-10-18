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
import { getOpenRequestsForDonor, getRequestMatches, type OpenRequestForDonor } from "@/lib/data/member";
import { createClient } from "@/lib/supabase/server";
import { CLOSED_REQUEST_STATUSES, JOIN_REASON_LABELS } from "@/lib/constants";
import { formatDate, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { BloodRequestRow } from "@/lib/types";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("Requests") };
}

/** Join button, or why the donor can't join yet. */
async function JoinFooter({ request }: { request: OpenRequestForDonor }) {
  const t = await getT();
  if (request.my_response === "interested") {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Pill tone="success">{t("You joined")}</Pill>
        <Button asChild size="sm" variant="outline">
          <Link href={`/requests/${request.request_id}`}>{t("See patient details")}</Link>
        </Button>
      </div>
    );
  }
  if (request.can_join) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <ActionForm action={respondToRequest} fields={{ request_id: request.request_id, response: "interested" }} label="I can donate" size="sm" />
        <Button asChild size="sm" variant="ghost">
          <Link href={`/requests/${request.request_id}`}>{t("Details")}</Link>
        </Button>
      </div>
    );
  }
  return (
    <p className="text-xs text-muted-foreground">
      {request.reason ? t(JOIN_REASON_LABELS[request.reason] ?? request.reason) : null}
      {request.eligible_from ? ` · ${t("You can give again from {date}.", { date: formatDate(request.eligible_from) })}` : ""}
    </p>
  );
}

export default async function MyRequestsPage({ searchParams }: PageProps<"/requests">) {
  const t = await getT();
  const viewer = await requireViewer("/requests");
  const showAll = (await searchParams).show === "all";
  const isDonor = Boolean(viewer.profile?.is_donor);
  const supabase = await createClient();
  const [open, matches, ownResult] = await Promise.all([
    isDonor ? getOpenRequestsForDonor() : Promise.resolve([]),
    isDonor ? getRequestMatches() : Promise.resolve([]),
    supabase
      .from("blood_requests")
      .select("id, reference_code, blood_group, request_type, units_needed, hospital_name, city, district, required_by, urgency, status, closure_reason, created_at")
      .eq("created_by", viewer.id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);
  const own = (ownResult.data ?? []) as BloodRequestRow[];
  const contactRequests = matches.filter((m) => m.contact_request_status === "pending");
  const shown = showAll ? open : open.filter((r) => r.matches_group);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Requests"
        description="Open requests you can help with, and requests you've submitted."
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
          <SectionHeading id="contact-heading" title="Contact requests waiting for you" description="A Rakt Mitra asked if they may contact you. Your details are shared only if you accept." />
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

      {isDonor ? (
        <section aria-labelledby="open-heading">
          <SectionHeading
            id="open-heading"
            title="Open requests"
            description="Verified by a Rakt Mitra. Join a request when you can give: you'll see the patient's details and the family's number."
          />
          <nav aria-label={t("Filter requests")} className="mb-3 flex gap-2">
            {[
              { href: "/requests", label: "My blood group", active: !showAll },
              { href: "/requests?show=all", label: "All", active: showAll },
            ].map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={tab.active ? "page" : undefined}
                className={cn(
                  "inline-flex h-10 items-center rounded-full px-4 text-sm font-medium transition-colors",
                  tab.active ? "bg-night text-cream" : "bg-navy/6 text-navy hover:bg-navy/10",
                )}
              >
                {t(tab.label)}
              </Link>
            ))}
          </nav>
          <Notice className="mb-3">
            {t("Joining is not a commitment, and it is never treated as a confirmed donation. The blood centre will check your eligibility.")}
          </Notice>
          {shown.length ? (
            <ul className="grid gap-3 md:grid-cols-2">
              {shown.map((r) => (
                <li key={r.request_id}>
                  <RequestCard request={{ ...r, id: r.request_id }} footer={<JoinFooter request={r} />} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={HandHeart}
              title="Nothing needs you right now"
              description={showAll ? "There are no open verified requests at the moment." : "Verified requests for your blood group will appear here."}
            />
          )}
        </section>
      ) : (
        <Notice icon={UserRoundSearch} title={t("Want to help with requests?")}>
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
                  href={`/requests/${r.id}`}
                  footer={
                    CLOSED_REQUEST_STATUSES.includes(r.status) ? (
                      r.closure_reason ? <p className="text-xs text-muted-foreground">{t("Note: {reason}", { reason: t(r.closure_reason) })}</p> : null
                    ) : (
                      <div className="flex flex-wrap items-center gap-2">
                        <Button asChild size="sm">
                          <Link href={`/requests/${r.id}`}>{t("Open request")}</Link>
                        </Button>
                        <ActionForm
                          action={cancelMyRequest}
                          fields={{ request_id: r.id, reason: "No longer needed" }}
                          label="Cancel — no longer needed"
                          variant="ghost"
                          size="sm"
                          confirmText="Cancel this request? Donors and Rakt Mitras will stop contacting you."
                          hideAfterSuccess
                        />
                      </div>
                    )
                  }
                />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState icon={ClipboardList} title="You haven't submitted any requests" description="If someone needs blood, submit a request and a Rakt Mitra will verify it." />
        )}
      </section>
    </div>
  );
}
