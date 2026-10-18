import Link from "next/link";
import { EmailLink } from "@/components/common/contact-link";
import { ArrowLink } from "@/components/site/arrow-link";
import { LiveClock } from "@/components/site/live-clock";
import { TEAM_CONTACTS } from "@/lib/constants";
import { telLink } from "@/lib/contact-links";
import { getPublicSettings } from "@/lib/data/public";
import { formatPhone } from "@/lib/phone";
import { getT } from "@/i18n/server";
import { FOOTER_GROUPS } from "./nav-config";

export async function SiteFooter() {
  const [t, settings] = await Promise.all([getT(), getPublicSettings()]);
  return (
    <footer className="on-night relative overflow-hidden">
      <div className="wide grid gap-12 pt-20 pb-14 lg:grid-cols-[1fr_1.6fr] lg:gap-16 lg:pt-28">
        <div className="max-w-md">
          <p className="display-sm text-cream">{t("Every donor matters. Every response can save a life.")}</p>
          <ArrowLink href="/register" className="mt-7">
            {t("Become a Donor")}
          </ArrowLink>
          <p className="mt-8 text-xs leading-relaxed text-cream/55">
            {t(
              "Rakt Response is a coordination platform run by Rakt Mitras. It does not store blood, certify compatibility or replace a hospital or licensed blood bank. In an emergency, contact the treating hospital or the nearest licensed blood bank immediately.",
            )}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
          {FOOTER_GROUPS.map((group) => (
            <nav key={group.title} aria-label={t(group.title)}>
              <p className="label-mono mb-4 text-cream/50">{t(group.title)}</p>
              <ul className="space-y-0.5 text-[15px]">
                {group.links.map((item) => (
                  <li key={item.href}>
                    <Link className="inline-flex min-h-9 items-center text-cream/80 transition-colors hover:text-cream" href={item.href}>
                      {t(item.label)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
          <div>
            <p className="label-mono mb-4 text-cream/50">{t("Contact")}</p>
            <ul className="space-y-3 text-[15px]">
              {TEAM_CONTACTS.map((person) => (
                <li key={person.phone}>
                  <span className="block text-cream/80">{person.name}</span>
                  <a href={telLink(person.phone)} className="inline-flex min-h-9 items-center font-mono text-sm text-cream tabular-nums hover:underline">
                    {formatPhone(person.phone)}
                  </a>
                </li>
              ))}
              {settings.contactEmail ? (
                <li>
                  <EmailLink email={settings.contactEmail} icon={false} className="text-cream/80 hover:text-cream" />
                </li>
              ) : null}
              <li>
                <Link href="/contact" className="inline-flex min-h-9 items-center text-cream/80 hover:text-cream">
                  {t("All contact options")}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="wide">
        <div className="label-mono flex flex-col gap-3 border-t border-white/10 pt-6 pb-10 text-cream/55 md:flex-row md:items-center md:justify-between">
          <p>{t("© {year} Rakt Response Team", { year: new Date().getFullYear() })}</p>
          <p>
            {t("India")} · <LiveClock />
          </p>
          <p className="md:text-right">{t("Not an emergency service. In an emergency call 112.")}</p>
        </div>
      </div>
    </footer>
  );
}
