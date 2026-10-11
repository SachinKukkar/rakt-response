"use client";

import { useActionState, useState, useTransition } from "react";
import { Eye, Loader2, Mail, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ActionForm } from "@/components/common/action-form";
import { FormMessage, SubmitButton, selectClass } from "@/components/common/form-parts";
import { recordCoordination, revealDonorContact, sendContactRequest, setRequestStatus, type RevealedContact } from "@/actions/volunteer";
import { initialActionState } from "@/lib/action-result";
import { mailtoLink, telLink, volunteerWhatsappMessage, whatsappLink } from "@/lib/contact-links";
import {
  CONTACT_METHOD_LABELS,
  OUTCOME_LABELS,
  OUTCOMES,
  REQUEST_STATUS_LABELS,
  RESPONSE_LABELS,
  RESPONSE_STATUSES,
  type RequestStatus,
} from "@/lib/constants";
import { formatPhone } from "@/lib/phone";
import { useT } from "@/i18n/client";

/**
 * Contact details are fetched only when the volunteer explicitly asks, the
 * server checks consent + role + rate limit and logs the access, and the
 * result lives only in this component's memory.
 */
export function DonorContactPanel({
  donorId,
  requestId,
  referenceCode,
  canReveal,
  canAsk,
  contactRequestStatus,
}: {
  donorId: string;
  requestId: string;
  referenceCode: string;
  canReveal: boolean;
  canAsk: boolean;
  contactRequestStatus: string | null;
}) {
  const [contact, setContact] = useState<RevealedContact | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [asking, setAsking] = useState(false);
  const t = useT();

  if (contact) {
    return (
      <div className="space-y-2 rounded-xl border border-success/25 bg-success-soft/60 p-3">
        <p className="text-xs text-success">
          <ShieldCheck className="mr-1 inline size-3.5" aria-hidden="true" />
          {t("Access logged. Use only for request {code}. Preferred: {method}.", { code: referenceCode, method: t(CONTACT_METHOD_LABELS[contact.preferred]) })}
        </p>
        <div className="flex flex-wrap gap-2">
          {contact.phone ? (
            <Button asChild size="sm">
              <a href={telLink(contact.phone)}>
                <Phone className="size-4" aria-hidden="true" /> {t("Call {phone}", { phone: formatPhone(contact.phone) })}
              </a>
            </Button>
          ) : null}
          {contact.whatsapp ? (
            <Button asChild size="sm" variant="outline">
              <a href={whatsappLink(contact.whatsapp, volunteerWhatsappMessage(referenceCode))} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="size-4" aria-hidden="true" /> {t("WhatsApp")}
              </a>
            </Button>
          ) : null}
          {contact.email ? (
            <Button asChild size="sm" variant="outline">
              <a href={mailtoLink(contact.email, `Rakt Response request ${referenceCode}`)}>
                <Mail className="size-4" aria-hidden="true" /> {t("Email")}
              </a>
            </Button>
          ) : null}
          {!contact.phone && !contact.whatsapp && !contact.email ? <p className="text-sm">{t("No contact details on file.")}</p> : null}
        </div>
        <ActionForm
          action={recordCoordination}
          fields={{ request_id: requestId, donor_id: donorId, attempted: "true" }}
          label="Log a contact attempt"
          size="sm"
          variant="ghost"
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {canReveal ? (
          <Button
            type="button"
            size="sm"
            variant="navy"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                setError(null);
                const result = await revealDonorContact(donorId, requestId);
                if (result.ok && result.data) setContact(result.data);
                else if (!result.ok) setError(result.message);
              })
            }
          >
            {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
            {t("View contact details")}
          </Button>
        ) : null}
        {!canReveal && canAsk && contactRequestStatus !== "pending" && contactRequestStatus !== "declined" ? (
          <Button type="button" size="sm" variant="outline" onClick={() => setAsking((v) => !v)} aria-expanded={asking}>
            {t("Ask for permission to contact")}
          </Button>
        ) : null}
      </div>
      {contactRequestStatus === "pending" ? <p className="text-xs text-muted-foreground">{t("Contact request sent — waiting for the donor.")}</p> : null}
      {contactRequestStatus === "declined" ? <p className="text-xs text-muted-foreground">{t("The donor declined to share contact details for this request.")}</p> : null}
      {asking ? (
        <ActionForm action={sendContactRequest} fields={{ donor_id: donorId, request_id: requestId }} label="Send contact request" size="sm" hideAfterSuccess>
          <label htmlFor={`msg-${donorId}`} className="text-xs font-semibold text-navy">
            {t("Short message (no patient details)")}
          </label>
          <Textarea id={`msg-${donorId}`} name="message" rows={2} maxLength={500} placeholder={t("e.g. Platelets needed tomorrow morning at the hospital.")} />
        </ActionForm>
      ) : null}
      {error ? (
        <p className="text-xs font-medium text-destructive" role="alert">
          {t(error)}
        </p>
      ) : null}
    </div>
  );
}

export function CoordinationOutcomeForm({ requestId, donorId, response, outcome }: { requestId: string; donorId: string; response: string | null; outcome: string | null }) {
  const [state, action] = useActionState(recordCoordination, initialActionState);
  const t = useT();
  return (
    <form action={action} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
      <input type="hidden" name="request_id" value={requestId} />
      <input type="hidden" name="donor_id" value={donorId} />
      <input type="hidden" name="attempted" value="false" />
      <label className="space-y-1 text-xs font-semibold text-navy">
        {t("Response")}
        <select name="response" defaultValue={response ?? ""} className={selectClass}>
          <option value="">{t("No change")}</option>
          {RESPONSE_STATUSES.map((r) => (
            <option key={r} value={r}>
              {t(RESPONSE_LABELS[r])}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-1 text-xs font-semibold text-navy">
        {t("Outcome")}
        <select name="outcome" defaultValue={outcome ?? ""} className={selectClass}>
          <option value="">{t("No change")}</option>
          {OUTCOMES.map((o) => (
            <option key={o} value={o}>
              {t(OUTCOME_LABELS[o])}
            </option>
          ))}
        </select>
      </label>
      <SubmitButton size="sm" variant="outline">
        Save
      </SubmitButton>
      <FormMessage state={state} className="sm:col-span-3" />
    </form>
  );
}

export function StatusChangeForm({ requestId, allowed, canVerify }: { requestId: string; allowed: RequestStatus[]; canVerify: boolean }) {
  const [state, action] = useActionState(setRequestStatus, initialActionState);
  const t = useT();
  const options = allowed.filter((s) => canVerify || !["under_verification", "verified", "rejected"].includes(s));
  const [choice, setChoice] = useState<RequestStatus | "">(options[0] ?? "");
  // After a successful change the allowed options change; fall back to the first valid one.
  const status = choice && options.includes(choice) ? choice : (options[0] ?? "");
  const setStatus = setChoice;
  if (!options.length) {
    return (
      <div className="space-y-2">
        <FormMessage state={state} />
        <p className="text-sm text-muted-foreground">{t("This request is closed.")}</p>
      </div>
    );
  }
  const needsReason = status === "rejected" || status === "cancelled" || status === "fulfilled";
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="request_id" value={requestId} />
      <label className="block space-y-1 text-sm font-semibold text-navy">
        {t("Move to")}
        <select name="status" value={status} onChange={(e) => setStatus(e.target.value as RequestStatus)} className={selectClass}>
          {options.map((s) => (
            <option key={s} value={s}>
              {t(REQUEST_STATUS_LABELS[s])}
            </option>
          ))}
        </select>
      </label>
      <label className="block space-y-1 text-sm font-semibold text-navy">
        {needsReason ? t("Reason / confirmation (required)") : t("Note (optional)")}
        <Input name="reason" required={needsReason} maxLength={500} placeholder={status === "fulfilled" ? t("e.g. Hospital blood bank confirmed donation completed") : ""} />
      </label>
      {status === "verified" ? (
        <p className="text-xs text-muted-foreground">{t("Verifying alerts opted-in donors of this blood group in the district (in-app only).")}</p>
      ) : null}
      {status === "fulfilled" ? (
        <p className="text-xs text-muted-foreground">{t("Only mark fulfilled when the hospital or requester confirms the need was met — not when a donor is merely interested.")}</p>
      ) : null}
      <FormMessage state={state} />
      <SubmitButton>Update status</SubmitButton>
    </form>
  );
}
