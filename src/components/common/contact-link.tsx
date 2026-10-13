import { Mail, MessageCircle, Phone } from "lucide-react";
import { telLink, whatsappLink } from "@/lib/contact-links";
import { formatPhone } from "@/lib/phone";
import { cn } from "@/lib/utils";

const linkClass = "inline-flex min-h-9 items-center gap-1.5 font-medium text-primary underline-offset-2 hover:underline";

/** A phone number you can tap to call. */
export function PhoneLink({ phone, className, icon = true }: { phone: string; className?: string; icon?: boolean }) {
  return (
    <a href={telLink(phone)} className={cn(linkClass, className)}>
      {icon ? <Phone className="size-4 shrink-0" aria-hidden="true" /> : null}
      {formatPhone(phone)}
    </a>
  );
}

/** Opens WhatsApp with this number. */
export function WhatsAppLink({ phone, className, label }: { phone: string; className?: string; label?: string }) {
  return (
    <a href={whatsappLink(phone)} target="_blank" rel="noopener noreferrer" className={cn(linkClass, className)}>
      <MessageCircle className="size-4 shrink-0" aria-hidden="true" />
      {label ?? formatPhone(phone)}
    </a>
  );
}

/** An email address you can tap to write to. */
export function EmailLink({ email, className, icon = true }: { email: string; className?: string; icon?: boolean }) {
  return (
    <a href={`mailto:${email}`} className={cn(linkClass, "break-all", className)}>
      {icon ? <Mail className="size-4 shrink-0" aria-hidden="true" /> : null}
      {email}
    </a>
  );
}
