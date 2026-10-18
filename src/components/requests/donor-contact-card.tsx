"use client";

import { useState, useTransition } from "react";
import { Eye, Loader2, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BloodGroupChip } from "@/components/common/blood-group-chip";
import { Pill } from "@/components/common/status-badge";
import { revealDonorToRequester, type RevealedDonorContact } from "@/actions/requests";
import { mailtoLink, patientWhatsappMessage, telLink, whatsappLink } from "@/lib/contact-links";
import { CONTACT_METHOD_LABELS, type BloodGroup } from "@/lib/constants";
import type { EligibleDonor } from "@/lib/data/member";
import { formatPhone } from "@/lib/phone";
import { useT } from "@/i18n/client";

/** Buttons for the one channel the donor chose. */
function ContactButtons({ contact, referenceCode, bloodGroup, hospital }: {
  contact: RevealedDonorContact;
  referenceCode: string;
  bloodGroup: BloodGroup;
  hospital: string;
}) {
  const t = useT();
  if (contact.phone) {
    return (
      <Button asChild size="sm">
        <a href={telLink(contact.phone)}>
          <Phone className="size-4" aria-hidden="true" /> {t("Call {phone}", { phone: formatPhone(contact.phone) })}
        </a>
      </Button>
    );
  }
  if (contact.whatsapp) {
    return (
      <Button asChild size="sm">
        <a href={whatsappLink(contact.whatsapp, patientWhatsappMessage(referenceCode, bloodGroup, hospital))} target="_blank" rel="noopener noreferrer">
          <MessageCircle className="size-4" aria-hidden="true" /> {t("WhatsApp {phone}", { phone: formatPhone(contact.whatsapp) })}
        </a>
      </Button>
    );
  }
  if (contact.email) {
    return (
      <Button asChild size="sm">
        <a href={mailtoLink(contact.email, `Rakt Response request ${referenceCode}`)}>
          <Mail className="size-4" aria-hidden="true" /> {t("Email {email}", { email: contact.email })}
        </a>
      </Button>
    );
  }
  return <p className="text-sm text-muted-foreground">{t("No contact details on file.")}</p>;
}

export function DonorContactCard({ donor, requestId, referenceCode, bloodGroup, hospital }: {
  donor: EligibleDonor;
  requestId: string;
  referenceCode: string;
  bloodGroup: BloodGroup;
  hospital: string;
}) {
  const t = useT();
  const [contact, setContact] = useState<RevealedDonorContact | null>(
    donor.contact_opened && !donor.hidden ? { channel: donor.channel, phone: donor.phone, whatsapp: donor.whatsapp, email: donor.email } : null,
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const area = [donor.locality, donor.city].filter(Boolean).join(", ");

  return (
    <article className={`surface space-y-3 p-4 ${donor.joined ? "border-success/40" : ""}`}>
      <div className="flex items-start gap-3">
        <BloodGroupChip group={donor.blood_group} size="sm" />
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="font-bold text-navy">{donor.label}</p>
            {donor.joined ? <Pill tone="success">{t("Ready to donate")}</Pill> : <Pill tone="info">{t("Can give now")}</Pill>}
          </div>
          {area ? (
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-4 shrink-0" aria-hidden="true" /> {area}
            </p>
          ) : null}
          {!donor.hidden ? (
            <p className="text-xs text-muted-foreground">{t("Prefers: {method}", { method: t(CONTACT_METHOD_LABELS[donor.channel]) })}</p>
          ) : null}
        </div>
      </div>

      {donor.hidden ? (
        <p className="rounded-xl bg-secondary p-3 text-sm text-secondary-foreground">
          {t("This donor keeps their number hidden. They have your request and will reach you, or a volunteer will connect you.")}
        </p>
      ) : contact ? (
        <div className="flex flex-wrap gap-2">
          <ContactButtons contact={contact} referenceCode={referenceCode} bloodGroup={bloodGroup} hospital={hospital} />
        </div>
      ) : (
        <div className="space-y-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                setError(null);
                const result = await revealDonorToRequester(requestId, donor.donor_id);
                if (result.ok && result.data) setContact(result.data);
                else if (!result.ok) setError(result.message);
              })
            }
          >
            {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
            {t("Show contact")}
          </Button>
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {t(error)}
            </p>
          ) : null}
        </div>
      )}
    </article>
  );
}
