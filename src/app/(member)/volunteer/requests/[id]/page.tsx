import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Copy, Mail, MessageCircle, Phone, Search, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ActionForm } from "@/components/common/action-form";
import { BloodGroupChip } from "@/components/common/blood-group-chip";
import { EmptyState, KeyValue, Notice, PageHeader, SectionHeading } from "@/components/common/page-parts";
import { Pill, ProfileVerificationBadge, RequestStatusBadge, UrgencyBadge } from "@/components/common/status-badge";
import { selectClass } from "@/components/common/form-parts";
import { LocationFields } from "@/components/forms/location-pickers";
import { CoordinationOutcomeForm, DonorContactPanel, StatusChangeForm } from "@/components/volunteer/coordination-forms";
import { addInternalNote, assignRequest, editRequestDetails } from "@/actions/volunteer";
import { adminDeleteRequest } from "@/actions/admin";
import { requireStaff, viewerCan } from "@/lib/auth";
import { activeStaff, displayNames } from "@/lib/data/staff";
import { createClient } from "@/lib/supabase/server";
import { mailtoLink, telLink, whatsappLink } from "@/lib/contact-links";
import {
  CONTACT_METHOD_LABELS,
  OUTCOME_LABELS,
  REQUEST_TRANSITIONS,
  REQUEST_TYPE_LABELS,
  RESPONSE_LABELS,
  URGENCIES,
  URGENCY_LABELS,
  type Outcome,
  type ResponseStatus,
} from "@/lib/constants";
import { formatDate, formatDateTime, relativeTime } from "@/lib/format";
import { formatPhone } from "@/lib/phone";
import { uuidSchema } from "@/lib/validation/common";
import { getT } from "@/i18n/server";
import type { BloodRequestRow, MatchedDonor, RequestEventRow } from "@/lib/types";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("Request coordination") };
}

function toIndiaLocalInput(iso: string): string {
  const d = new Date(new Date(iso).getTime() + 5.5 * 3600_000);
  return d.toISOString().slice(0, 16);
}

export default async function VolunteerRequestPage({ params }: PageProps<"/volunteer/requests/[id]">) {
  const viewer = await requireStaff();
  const t = await getT();
  const { id } = await params;
  if (!uuidSchema.safeParse(id).success) notFound();
  const supabase = await createClient();
  const { data } = await supabase.from("blood_requests").select("*").eq("id", id).maybeSingle();
  const request = data as BloodRequestRow | null;
  if (!request) notFound();

  const open = request.status === "verified" || request.status === "in_coordination";
  const [assignmentsResult, eventsResult, notesResult, responsesResult, matchesResult, staff] = await Promise.all([
    supabase.from("volunteer_assignments").select("id, volunteer_id, status, follow_up_at, created_at").eq("request_id", id).order("created_at"),
    supabase.from("request_events").select("*").eq("request_id", id).order("created_at", { ascending: false }).limit(40),
    supabase.from("internal_notes").select("id, author_id, body, created_at").eq("subject_type", "blood_request").eq("subject_id", id).order("created_at", { ascending: false }),
    supabase.from("request_responses").select("donor_id, response, outcome, contact_attempts, last_contacted_at, responded_at").eq("request_id", id),
    open ? supabase.rpc("match_donors_for_request", { p_request: id, p_limit: 30, p_offset: 0 }) : Promise.resolve({ data: [] }),
    viewer.isAdmin ? activeStaff() : Promise.resolve([]),
  ]);
  const assignments = (assignmentsResult.data ?? []) as Array<{ id: string; volunteer_id: string; status: string; follow_up_at: string | null }>;
  const events = (eventsResult.data ?? []) as RequestEventRow[];
  const notes = (notesResult.data ?? []) as Array<{ id: string; author_id: string; body: string; created_at: string }>;
  const responses = (responsesResult.data ?? []) as Array<{ donor_id: string; response: ResponseStatus; outcome: Outcome; contact_attempts: number; last_contacted_at: string | null }>;
  const matches = (matchesResult.data ?? []) as MatchedDonor[];
  const names = await displayNames([
    ...assignments.map((a) => a.volunteer_id),
    ...events.map((e) => e.actor_id),
    ...notes.map((n) => n.author_id),
    ...responses.map((r) => r.donor_id),
  ]);
  const activeAssignments = assignments.filter((a) => a.status === "active");
  const iAmAssigned = activeAssignments.some((a) => a.volunteer_id === viewer.id);
  const matchedIds = new Set(matches.map((m) => m.donor_id));
  const otherResponses = responses.filter((r) => !matchedIds.has(r.donor_id));

  return (
    <div className="space-y-6">
      <PageHeader backHref="/volunteer/requests" backLabel="Request queue" eyebrow={`${t("Request")} ${request.reference_code}`} title={`${request.blood_group} · ${t(REQUEST_TYPE_LABELS[request.request_type])}`} />

      <section className="surface space-y-3 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <BloodGroupChip group={request.blood_group} size="lg" />
          <div className="space-y-1">
            <div className="flex flex-wrap gap-1.5">
              <UrgencyBadge urgency={request.urgency} />
              <RequestStatusBadge status={request.status} />
              {request.public_listing_consent ? <Pill tone="info">{t("Public listing allowed")}</Pill> : <Pill>{t("Not publicly listed")}</Pill>}
            </div>
            <p className="font-semibold text-navy">{request.hospital_name}</p>
            <p className="text-sm text-muted-foreground">
              {request.city}, {request.district}
              {request.state ? `, ${request.state}` : ""}
            </p>
            <p className="text-sm">
              {t("Needed by")} <strong>{formatDateTime(request.required_by)}</strong> ({relativeTime(request.required_by)})
              {request.units_needed ? ` · ${t("{count} unit(s)", { count: request.units_needed })}` : ""}
            </p>
          </div>
        </div>
        {request.notes ? <p className="rounded-xl bg-muted p-3 text-sm">{t("Requester notes: {notes}", { notes: request.notes })}</p> : null}
        {request.possible_duplicate_of ? (
          <Notice tone="warning" icon={Copy} title="Possible duplicate">
            {t("A similar open request exists.")}{" "}
            <Link href={`/volunteer/requests/${request.possible_duplicate_of}`} className="font-semibold underline">
              {t("Compare requests")}
            </Link>{" "}
            {t("before contacting donors.")}
          </Notice>
        ) : null}
        {request.request_type === "sdp" ? (
          <Notice>
            {t(
              "SDP request: prefer donors with declared SDP history, but never assume eligibility. The apheresis centre screens donors and decides timing.",
            )}
          </Notice>
        ) : null}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="surface p-4" aria-labelledby="requester-heading">
          <SectionHeading id="requester-heading" title="Requester (private)" as="h3" />
          <dl>
            <KeyValue label="Name">{request.requester_name}</KeyValue>
            <KeyValue label="Prefers">{t(CONTACT_METHOD_LABELS[request.requester_contact_method])}</KeyValue>
            <KeyValue label="Submitted">{formatDateTime(request.created_at)}</KeyValue>
            <KeyValue label="Account">{request.created_by ? t("Signed-in member") : t("Submitted without an account")}</KeyValue>
          </dl>
          <div className="mt-3 flex flex-wrap gap-2">
            {request.requester_phone ? (
              <>
                <Button asChild size="sm">
                  <a href={telLink(request.requester_phone)}>
                    <Phone className="size-4" aria-hidden="true" /> {formatPhone(request.requester_phone)}
                  </a>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <a href={whatsappLink(request.requester_phone)} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="size-4" aria-hidden="true" /> {t("WhatsApp")}
                  </a>
                </Button>
              </>
            ) : null}
            {request.requester_email ? (
              <Button asChild size="sm" variant="outline">
                <a href={mailtoLink(request.requester_email, `Your blood request ${request.reference_code}`)}>
                  <Mail className="size-4" aria-hidden="true" /> {t("Email")}
                </a>
              </Button>
            ) : null}
          </div>
        </section>

        <section className="surface p-4" aria-labelledby="status-heading">
          <SectionHeading id="status-heading" title="Status" as="h3" />
          <StatusChangeForm requestId={request.id} allowed={REQUEST_TRANSITIONS[request.status]} canVerify={viewerCan(viewer, "verify_requests")} />
          {request.closure_reason ? <p className="mt-3 text-sm text-muted-foreground">{t("Closing note: {reason}", { reason: request.closure_reason })}</p> : null}
        </section>
      </div>

      <section className="surface p-4" aria-labelledby="assign-heading">
        <SectionHeading id="assign-heading" title="Volunteers coordinating" as="h3" />
        {activeAssignments.length ? (
          <ul className="mb-3 flex flex-wrap gap-2">
            {activeAssignments.map((a) => (
              <li key={a.id}>
                <Pill tone="info" icon={UserCheck}>
                  {names.get(a.volunteer_id) ?? t("Volunteer")}
                  {a.follow_up_at ? ` · ${t("follow up {when}", { when: relativeTime(a.follow_up_at) })}` : ""}
                </Pill>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mb-3 text-sm text-muted-foreground">{t("Nobody is coordinating this request yet.")}</p>
        )}
        <div className="flex flex-wrap items-end gap-3">
          {!iAmAssigned && !["fulfilled", "cancelled", "expired", "rejected"].includes(request.status) ? (
            <ActionForm action={assignRequest} fields={{ request_id: request.id }} label="I'll coordinate this" size="sm" />
          ) : null}
          {viewer.isAdmin && staff.length ? (
            <ActionForm action={assignRequest} fields={{ request_id: request.id }} label="Assign" size="sm" variant="outline" className="flex items-end gap-2 space-y-0">
              <label className="space-y-1 text-xs font-semibold text-navy">
                {t("Assign a volunteer")}
                <select name="volunteer_id" className={selectClass} required>
                  {staff
                    .filter((s) => s.user_id !== viewer.id)
                    .map((s) => (
                      <option key={s.user_id} value={s.user_id}>
                        {s.name} ({t(s.role)})
                      </option>
                    ))}
                </select>
              </label>
            </ActionForm>
          ) : null}
        </div>
      </section>

      <section aria-labelledby="donors-heading">
        <SectionHeading
          id="donors-heading"
          title="Matching donors"
          description="Same blood group, same district, directory-visible. Compatibility beyond an exact group match is for the hospital to decide."
          action={
            <Button asChild variant="outline" size="sm">
              <Link href={`/volunteer/donors?request=${request.id}&groups=${encodeURIComponent(request.blood_group)}&district=${encodeURIComponent(request.district)}${request.request_type === "sdp" ? "&type=sdp" : ""}`}>
                <Search className="size-4" aria-hidden="true" /> {t("Search directory")}
              </Link>
            </Button>
          }
        />
        {!open ? (
          <Notice>{t("Donor contact is available only once a request is verified and active.")}</Notice>
        ) : matches.length === 0 ? (
          <EmptyState icon={Search} title="No matching donors in this district" description="Search the directory with a wider area, or check nearby districts." />
        ) : (
          <ul className="space-y-3">
            {matches.map((m) => (
              <li key={m.donor_id} className="surface space-y-3 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <BloodGroupChip group={m.blood_group} size="sm" />
                    <div>
                      <p className="font-semibold text-navy">{m.display_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {m.locality ? `${m.locality}, ` : ""}
                        {m.city} · {t("active {when}", { when: relativeTime(m.last_active_at) })}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <ProfileVerificationBadge status={m.verification_status} />
                    {m.has_sdp_history ? <Pill tone="brand">{t("SDP history")}</Pill> : null}
                    {m.open_to_contact ? <Pill tone="success">{t("Open to contact")}</Pill> : <Pill>{t("Not open now")}</Pill>}
                    {m.response ? <Pill tone={m.response === "interested" ? "success" : "neutral"}>{t(RESPONSE_LABELS[m.response])}</Pill> : null}
                    {m.outcome && m.outcome !== "pending" ? <Pill tone="info">{t(OUTCOME_LABELS[m.outcome])}</Pill> : null}
                  </div>
                </div>
                {m.last_verified_whole_blood || m.last_verified_sdp ? (
                  <p className="text-xs text-muted-foreground">
                    {t("Last verified:")} {m.last_verified_whole_blood ? t("whole blood {date}", { date: formatDate(m.last_verified_whole_blood) }) : ""}
                    {m.last_verified_whole_blood && m.last_verified_sdp ? " · " : ""}
                    {m.last_verified_sdp ? `SDP ${formatDate(m.last_verified_sdp)}` : ""} {t("(not an eligibility decision)")}
                  </p>
                ) : null}
                <DonorContactPanel
                  donorId={m.donor_id}
                  requestId={request.id}
                  referenceCode={request.reference_code}
                  canReveal={(m.contact_consent && m.open_to_contact) || m.contact_request_status === "accepted"}
                  canAsk
                  contactRequestStatus={m.contact_request_status}
                />
                {m.contact_attempts ? <p className="text-xs text-muted-foreground">{t("Contact attempts: {count}", { count: m.contact_attempts })}</p> : null}
                <CoordinationOutcomeForm requestId={request.id} donorId={m.donor_id} response={m.response} outcome={m.outcome} />
              </li>
            ))}
          </ul>
        )}
        {otherResponses.length ? (
          <div className="surface mt-4 p-4">
            <h3 className="mb-2 text-sm font-bold">{t("Other donors on this request")}</h3>
            <ul className="space-y-1.5 text-sm">
              {otherResponses.map((r) => (
                <li key={r.donor_id} className="flex flex-wrap justify-between gap-2">
                  <span>{names.get(r.donor_id) ?? t("Donor")}</span>
                  <span className="text-muted-foreground">
                    {t(RESPONSE_LABELS[r.response])} · {t(OUTCOME_LABELS[r.outcome])} · {t("{count} attempt(s)", { count: r.contact_attempts })}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <details className="surface p-4">
        <summary className="flex min-h-11 cursor-pointer items-center font-bold text-navy">{t("Edit request details")}</summary>
        <ActionForm action={editRequestDetails} fields={{ request_id: request.id }} label="Save details" className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-sm font-semibold text-navy sm:col-span-2">
            {t("Hospital / blood bank")}
            <Input name="hospital_name" defaultValue={request.hospital_name} required />
          </label>
          <LocationFields
            className="sm:col-span-2"
            idPrefix="edit-"
            required={{ district: true, city: true }}
            labels={{ city: "City / town" }}
            names={{ district: "district", city: "city" }}
            defaults={{ district: request.district, city: request.city }}
          />
          <label className="space-y-1 text-sm font-semibold text-navy">
            {t("Units")}
            <Input name="units_needed" type="number" min={1} max={50} defaultValue={request.units_needed ?? ""} />
          </label>
          <label className="space-y-1 text-sm font-semibold text-navy">
            {t("Urgency")}
            <select name="urgency" defaultValue={request.urgency} className={selectClass}>
              {URGENCIES.map((u) => (
                <option key={u} value={u}>
                  {t(URGENCY_LABELS[u])}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm font-semibold text-navy sm:col-span-2">
            {t("Needed by (India time)")}
            <Input name="required_by" type="datetime-local" defaultValue={toIndiaLocalInput(request.required_by)} required />
          </label>
          <label className="space-y-1 text-sm font-semibold text-navy sm:col-span-2">
            {t("Notes")}
            <Textarea name="notes" defaultValue={request.notes ?? ""} rows={2} />
          </label>
        </ActionForm>
      </details>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="surface p-4" aria-labelledby="history-heading">
          <SectionHeading id="history-heading" title="History" as="h3" />
          <ol className="space-y-2 text-sm">
            {events.map((e) => (
              <li key={e.id} className="border-l-2 border-primary/30 pl-3">
                <p className="font-medium">
                  {t(e.event_type.replaceAll("_", " "))}
                  {e.to_status ? ` → ${t(e.to_status.replaceAll("_", " "))}` : ""}
                </p>
                {e.note ? <p className="text-muted-foreground">{e.note}</p> : null}
                <p className="text-xs text-muted-foreground">
                  {formatDateTime(e.created_at)}
                  {e.actor_id ? ` · ${names.get(e.actor_id) ?? t("Team member")}` : ""}
                </p>
              </li>
            ))}
          </ol>
        </section>
        <section className="surface space-y-3 p-4" aria-labelledby="notes-heading">
          <SectionHeading id="notes-heading" title="Internal notes" description="Visible to volunteers and admins only." as="h3" />
          <ActionForm action={addInternalNote} fields={{ subject_type: "blood_request", subject_id: request.id }} label="Add note" size="sm" variant="outline">
            <label htmlFor="note-body" className="sr-only">
              {t("Note")}
            </label>
            <Textarea id="note-body" name="body" rows={2} maxLength={2000} placeholder={t("e.g. Spoke to blood bank, 2 units confirmed needed.")} required />
          </ActionForm>
          <ul className="space-y-2 text-sm">
            {notes.map((n) => (
              <li key={n.id} className="rounded-xl bg-muted p-3">
                <p className="whitespace-pre-line">{n.body}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {names.get(n.author_id) ?? t("Team member")} · {formatDateTime(n.created_at)}
                </p>
              </li>
            ))}
          </ul>
        </section>
        {viewer.isAdmin ? (
          <section className="surface space-y-3 border-destructive/30 p-4" aria-labelledby="delete-heading">
            <SectionHeading
              id="delete-heading"
              title="Delete this request"
              description="Administrators only. Removes the request and its history for good. Use it for test, spam or duplicate requests; to close a real request, change its status instead."
              as="h3"
            />
            <ActionForm
              action={adminDeleteRequest}
              fields={{ request_id: request.id }}
              label="Delete request permanently"
              variant="destructive"
              size="sm"
              confirmText="Delete this request and its history permanently? This cannot be undone."
            />
          </section>
        ) : null}
      </div>
    </div>
  );
}
