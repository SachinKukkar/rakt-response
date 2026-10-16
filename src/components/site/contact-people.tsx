import { MessageCircle, Phone } from "lucide-react";
import { TEAM_CONTACTS } from "@/lib/constants";
import { telLink, whatsappLink } from "@/lib/contact-links";
import { initials } from "@/lib/format";
import { formatPhone } from "@/lib/phone";
import { cn } from "@/lib/utils";
import { getT } from "@/i18n/server";

/** Team members visitors can call or message directly, with large, labelled buttons. */
export async function ContactPeople({ tone = "night", className }: { tone?: "night" | "cream"; className?: string }) {
  const t = await getT();
  const night = tone === "night";
  return (
    <ul className={cn("grid gap-3 sm:grid-cols-2", className)} aria-label={t("Call the team")}>
      {TEAM_CONTACTS.map((person) => (
        <li
          key={person.phone}
          className={cn("rounded-2xl border p-4 sm:p-5", night ? "border-white/12 bg-night/40 text-cream backdrop-blur" : "border-border bg-card text-navy")}
        >
          <div className="flex items-center gap-3.5">
            <span className="cover-red grid size-11 shrink-0 place-items-center rounded-full text-sm font-medium text-white" aria-hidden="true">
              {initials(person.name)}
            </span>
            <div className="min-w-0">
              <p className="text-[17px] leading-tight font-medium">{person.name}</p>
              <p className={cn("mt-1 font-mono text-sm whitespace-nowrap tabular-nums", night ? "text-cream/70" : "text-muted-foreground")}>
                {formatPhone(person.phone)}
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <a
              href={telLink(person.phone)}
              aria-label={t("Call {name}", { name: person.name })}
              className="press inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary text-[15px] font-medium text-white transition-colors hover:bg-[#b32323]"
            >
              <Phone className="size-4" aria-hidden="true" />
              {t("Call")}
            </a>
            <a
              href={whatsappLink(person.phone)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("WhatsApp {name}", { name: person.name })}
              className={cn(
                "press inline-flex h-12 items-center justify-center gap-2 rounded-full text-[15px] font-medium transition-colors",
                night ? "bg-white/10 text-cream hover:bg-white/15" : "bg-navy/6 text-navy hover:bg-navy/10",
              )}
            >
              <MessageCircle className="size-4" aria-hidden="true" />
              {t("WhatsApp")}
            </a>
          </div>
        </li>
      ))}
    </ul>
  );
}
