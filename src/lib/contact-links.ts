/**
 * Consent-based contact links. These are only rendered after the server has
 * authorised access to a donor's number (see reveal_donor_contact()).
 * Message templates deliberately contain no patient or donor details.
 */
export function telLink(e164: string): string {
  return `tel:${e164.replace(/[^\d+]/g, "")}`;
}

export function whatsappLink(e164: string, message?: string): string {
  const digits = e164.replace(/\D/g, "");
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${text}`;
}

export function volunteerWhatsappMessage(referenceCode: string): string {
  return `Hello, this is a Rakt Response volunteer reaching out about blood donation request ${referenceCode}. Is now a good time to talk? You are free to say no.`;
}

export function mailtoLink(email: string, subject: string): string {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}`;
}
