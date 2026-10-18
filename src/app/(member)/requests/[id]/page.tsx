import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HandHeart, Hospital, MessageCircle, Phone, ShieldCheck, UserRoundSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActionForm } from "@/components/common/action-form";
import { EmptyState, KeyValue, Notice, PageHeader, SectionHeading } from "@/components/common/page-parts";
import { RequestCard } from "@/components/requests/request-card";
import { DonorContactCard } from "@/components/requests/donor-contact-card";
import { cancelMyRequest, respondToRequest } from "@/actions/requests";
import { requireViewer } from "@/lib/auth";
import {
  getEligibleDonors,
  getOpenRequestsForDonor,
  getRequestDetailsForDonor,
  type OpenRequestForDonor,
  type RequestDetailsForDonor,
} from "@/lib/data/member";
import { createClient } from "@/lib/supabase/server";
import { donorWhatsappMessage, telLink, whatsappLink } from "@/lib/contact-links";
import {
  CLOSED_REQUEST_STATUSES,
  CONTACT_METHOD_LABELS,
  JOIN_REASON_LABELS,
  PATIENT_GENDER_LABELS,
  REQUEST_REASON_LABELS,
  REQUEST_STATUS_LABELS,
  REQUEST_TYPE_LABELS,
  REQUESTER_RELATION_LABELS,
} from "@/lib/constants";
import { formatDate, formatDateTime } from "@/lib/format";
import { formatPhone } from "@/lib/phone";
import { uuidSchema } from "@/lib/validation/common";
import type { BloodRequestRow } from "@/lib/types";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("Request") };
}

export default async function RequestPage({ params }: PageProps<"/requests/[id]">) {
  const { id } = await params;
  if (!uuidSchema.safeParse(id).success) notFound();
  const viewer = await requireViewer(`/requests/${id}`);
  const supabase = await createClient();
  const { data } = await supabase.from("blood_requests").select("*").eq("id", id).eq("created_by", viewer.id).maybeSingle();
  const own = data as BloodRequestRow | null;
  if (own) return <PatientView request={own} />;

  const details = await getRequestDetailsForDonor(id);
  if (details) return <JoinedDonorView requestId={id} details={details} />;

  const open = (await getOpenRequestsForDonor()).find((r) => r.request_id === id);
  if (open) return <OpenRequestView request={open} />;
  notFound();
}

/** The patient's own request: its state, and once verified, the donors who can give now. */
async function PatientView({ request }: { request: BloodRequestRow }) {
  const t = await getT();
  const verified = request.status === "verified" || request.status === "in_coordination";
  const closed = CLOSED_REQUEST_STATUSES.includes(request.status);
  const donors = verified ? await getEligibleDonors(request.id) : [];
  const joined = donors.filter((d) => d.joined);
  const nearby = donors.filter((d) => !d.joined);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t("Ref. {code}", { code: request.reference_code })}
        title={t("Your request")}
        description={t("For {group} blood at {hospital}.", { group: request.blood_group, hospital: request.hospital_name })}
        actions={
          <Button asChild variant="outline">
            <Link href="/requests">{t("All my requests")}</Link>
          </Button>
        }
      />
      <RequestCard request={request} />

      {verified ? (
        <section aria-labelledby="donors-heading" className="space-y-4">
          <SectionHeading
            id="donors-heading"
            title="Donors who can give now"
            description="Same blood group, near you, and enough time since their last donation. Tap Show contact to reach a donor on the channel they chose."
          />
          <Notice icon={ShieldCheck}>
            {t("Please use these numbers only for this request and don't share them. The blood centre's doctor still checks every donor.")}
          </Notice>
          {joined.length ? (
            <div className="space-y-3">
              <h3 className="font-bold text-navy">{t("Ready to donate ({count})", { count: joined.length })}</h3>
              <ul className="grid gap-3 md:grid-cols-2">
                {joined.map((d) => (
                  <li key={d.donor_id}>
                    <DonorContactCard donor={d} requestId={request.id} referenceCode={request.reference_code} bloodGroup={request.blood_group} hospital={request.hospital_name} />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {nearby.length ? (
            <div className="space-y-3">
              {joined.length ? <h3 className="font-bold text-navy">{t("More donors who can give now ({count})", { count: nearby.length })}</h3> : null}
              <ul className="grid gap-3 md:grid-cols-2">
                {nearby.map((d) => (
                  <li key={d.donor_id}>
                    <DonorContactCard donor={d} requestId={request.id} referenceCode={request.reference_code} bloodGroup={request.blood_group} hospital={request.hospital_name} />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {!donors.length ? (
            <EmptyState
              icon={UserRoundSearch}
              title="No donor can give right now in your district"
              description="Volunteers are looking too. We'll notify you when a donor joins your request."
            />
          ) : null}
        </section>
      ) : closed ? (
        <Notice title={t(REQUEST_STATUS_LABELS[request.status])}>
          {request.closure_reason ? t("Note: {reason}", { reason: t(request.closure_reason) }) : t("This request is closed.")}
        </Notice>
      ) : (
        <Notice icon={Hospital} title={t("A volunteer is checking your request")}>
          {t("They check it with the hospital. Once it is verified, donors who can give now appear here, and you can contact them directly.")}
        </Notice>
      )}

      <section className="surface p-5" aria-labelledby="details-heading">
        <SectionHeading id="details-heading" title="Details you gave" as="h3" />
        <dl>
          <KeyValue label="Patient">
            {[request.patient_name, request.patient_age !== null ? t("{age} years", { age: request.patient_age }) : null, request.patient_gender ? t(PATIENT_GENDER_LABELS[request.patient_gender]) : null]
              .filter(Boolean)
              .join(" · ") || "—"}
          </KeyValue>
          <KeyValue label="IP / UHID">{request.hospital_patient_id ?? "—"}</KeyValue>
          <KeyValue label="Ward or bed">{request.ward ?? "—"}</KeyValue>
          <KeyValue label="Reason">{request.reason ? t(REQUEST_REASON_LABELS[request.reason]) : "—"}</KeyValue>
          <KeyValue label="Your relation">{request.requester_relation ? t(REQUESTER_RELATION_LABELS[request.requester_relation]) : "—"}</KeyValue>
          <KeyValue label="Your phone">
            {request.requester_phone ? `${formatPhone(request.requester_phone)} · ${t(CONTACT_METHOD_LABELS[request.requester_contact_method])}` : "—"}
          </KeyValue>
        </dl>
        <p className="mt-3 text-xs text-muted-foreground">{t("Need to change something? Contact a volunteer.")}</p>
      </section>

      {!closed ? (
        <ActionForm
          action={cancelMyRequest}
          fields={{ request_id: request.id, reason: "No longer needed" }}
          label="Cancel — no longer needed"
          variant="ghost"
          size="sm"
          confirmText="Cancel this request? Donors and volunteers will stop contacting you."
          hideAfterSuccess
        />
      ) : null}
    </div>
  );
}

/** A donor who joined: what they need at the blood bank, and the family's number. */
async function JoinedDonorView({ requestId, details }: { requestId: string; details: RequestDetailsForDonor }) {
  const t = await getT();
  const phone = details.requester_phone;
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t("Ref. {code}", { code: details.reference_code })}
        title={t("You joined this request")}
        description={t("Thank you. Here is what you need at the blood bank.")}
        actions={
          <Button asChild variant="outline">
            <Link href="/requests">{t("All requests")}</Link>
          </Button>
        }
      />
      <section className="surface p-5" aria-labelledby="patient-heading">
        <SectionHeading id="patient-heading" title="Patient and hospital" as="h3" />
        <dl>
          <KeyValue label="Blood group">{details.blood_group}</KeyValue>
          <KeyValue label="Needed">
            {t(REQUEST_TYPE_LABELS[details.request_type])}
            {details.units_needed ? ` · ${t(details.units_needed > 1 ? "{count} units" : "{count} unit", { count: details.units_needed })}` : ""}
          </KeyValue>
          <KeyValue label="When needed">{formatDateTime(details.required_by)}</KeyValue>
          <KeyValue label="Patient">
            {[details.patient_name, details.patient_age !== null ? t("{age} years", { age: details.patient_age }) : null].filter(Boolean).join(" · ") || "—"}
          </KeyValue>
          <KeyValue label="Hospital">{details.hospital_name}</KeyValue>
          <KeyValue label="IP / UHID">{details.hospital_patient_id ?? "—"}</KeyValue>
          <KeyValue label="Ward or bed">{details.ward ?? "—"}</KeyValue>
          <KeyValue label="City">{`${details.city}, ${details.district}`}</KeyValue>
        </dl>
      </section>

      <section className="surface space-y-3 p-5" aria-labelledby="family-heading">
        <SectionHeading id="family-heading" title="Patient's family" as="h3" />
        <p className="text-sm">
          <strong className="text-navy">{details.requester_name}</strong>
          {details.requester_relation ? ` · ${t(REQUESTER_RELATION_LABELS[details.requester_relation])}` : ""}
        </p>
        {phone ? (
          <div className="flex flex-wrap gap-2">
            {details.requester_contact_method === "whatsapp" ? (
              <Button asChild size="sm">
                <a href={whatsappLink(phone, donorWhatsappMessage(details.reference_code))} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="size-4" aria-hidden="true" /> {t("WhatsApp {phone}", { phone: formatPhone(phone) })}
                </a>
              </Button>
            ) : (
              <Button asChild size="sm">
                <a href={telLink(phone)}>
                  <Phone className="size-4" aria-hidden="true" /> {t("Call {phone}", { phone: formatPhone(phone) })}
                </a>
              </Button>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t("A volunteer will share the family's contact details with you.")}</p>
        )}
      </section>

      <Notice icon={HandHeart} title={t("At the blood bank")}>
        {t("Say you are donating for this patient and give the hospital's IP / UHID number if there is one. The blood centre's doctor decides if you can donate.")}
      </Notice>

      <ActionForm
        action={respondToRequest}
        fields={{ request_id: requestId, response: "unavailable" }}
        label="I can't donate after all"
        variant="ghost"
        size="sm"
        confirmText="Leave this request? The family will no longer see you as ready to donate."
        hideAfterSuccess
      />
    </div>
  );
}

/** An open request a donor hasn't joined: join it, or see why not yet. */
async function OpenRequestView({ request }: { request: OpenRequestForDonor }) {
  const t = await getT();
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t("Ref. {code}", { code: request.reference_code })}
        title={t("Open request")}
        actions={
          <Button asChild variant="outline">
            <Link href="/requests">{t("All requests")}</Link>
          </Button>
        }
      />
      <RequestCard request={{ ...request, id: request.request_id }} />
      {request.can_join ? (
        <div className="surface space-y-3 p-5">
          <p className="text-sm">{t("Joining shows you the patient's details and the family's number, and tells them you are ready to donate.")}</p>
          <ActionForm action={respondToRequest} fields={{ request_id: request.request_id, response: "interested" }} label="I can donate" />
        </div>
      ) : (
        <Notice>
          {request.reason ? t(JOIN_REASON_LABELS[request.reason] ?? request.reason) : null}
          {request.eligible_from ? ` ${t("You can give again from {date}.", { date: formatDate(request.eligible_from) })}` : ""}
        </Notice>
      )}
    </div>
  );
}
