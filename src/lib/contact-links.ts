/**
 * Contact links. These are only rendered after the server has allowed access
 * to a number (reveal_donor_contact(), reveal_donor_contact_to_requester(),
 * get_request_details_for_donor()). Message templates contain no patient or
 * donor names.
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
  return `Hello, this is a Rakt Mitra from Rakt Response reaching out about blood donation request ${referenceCode}. Is now a good time to talk? You are free to say no.`;
}

/** From a patient's family to a donor who can give now. */
export function patientWhatsappMessage(referenceCode: string, bloodGroup: string, hospital: string): string {
  return `Hello, I found you on Rakt Response. We need ${bloodGroup} blood at ${hospital} (request ${referenceCode}). Could you help? You are free to say no.`;
}

/** From a donor who joined a request to the patient's family. */
export function donorWhatsappMessage(referenceCode: string): string {
  return `Hello, I'm a Rakt Response donor. I joined your request ${referenceCode} and can help. When should I come to the hospital?`;
}

export function mailtoLink(email: string, subject: string): string {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}`;
}
