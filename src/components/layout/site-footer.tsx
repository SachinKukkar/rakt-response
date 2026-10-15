import Link from "next/link";
import { MARK_PATH, MARK_VIEWBOX } from "@/components/brand/logo";
import { EmailLink, PhoneLink, WhatsAppLink } from "@/components/common/contact-link";
import { SITE } from "@/lib/constants";
import { getPublicSettings } from "@/lib/data/public";
import { getT } from "@/i18n/server";
import { FOOTER_GROUPS } from "./nav-config";

/** Photographs used on the site: real camps in India, not our own (credited here). */
const PHOTO_CREDITS = [
  { label: "Baranagar Ramakrishna Mission camp, public domain", href: "https://commons.wikimedia.org/wiki/File:Blood_Donation_Camp_-_Baranagar_Mission_-_48768901286.jpg" },
  { label: "Chittaranjan Bayam Samiti camp, Howrah, by Biswarup Ganguly, CC BY 3.0", href: "https://commons.wikimedia.org/wiki/File:Moumita_Panja_Donating_Blood_-_Blood_Donation_and_Health_Care_Camp_-_Chittaranjan_Bayam_Samiti_-_Howrah_2015-05-10_6821.JPG" },
];

/** The close of every page: the mark built large, then the links. */
export async function SiteFooter() {
  const [t, settings] = await Promise.all([getT(), getPublicSettings()]);
  const hasContact = Boolean(settings.contactEmail || settings.contactPhone || settings.whatsapp);
  const contactLink = "text-white hover:text-white min-h-11";
  return (
    <footer className="mt-16 bg-navy font-display text-white">
      {/* The mark, built large: the drop-bubble and the name. */}
      <div className="page-container flex items-end gap-5 overflow-hidden pt-16 md:gap-10 md:pt-24">
        <svg viewBox={MARK_VIEWBOX} className="h-[22svh] w-auto shrink-0 md:h-[34svh]" aria-hidden="true">
          <path d={MARK_PATH} className="fill-primary" />
        </svg>
        <Link href="/" className="pb-2 text-[length:var(--step-display)] leading-[0.85] font-semibold tracking-[-0.05em]" aria-label={t("Rakt Response home")}>
          <span className="text-crimson">Rakt</span>
          <br />
          Response
        </Link>
      </div>

      <div className="page-container grid gap-10 py-14 md:grid-cols-12 md:py-20">
        <div className="space-y-4 md:col-span-4">
          <p className="text-[length:var(--step-lead)] font-medium">{t(SITE.tagline)}</p>
          {hasContact ? (
            <ul className="space-y-1 text-[length:var(--step-body)]" aria-label={t("Contact the team")}>
              {settings.contactPhone ? (
                <li>
                  <PhoneLink phone={settings.contactPhone} className={contactLink} />
                </li>
              ) : null}
              {settings.whatsapp ? (
                <li>
                  <WhatsAppLink phone={settings.whatsapp} label={t("WhatsApp")} className={contactLink} />
                </li>
              ) : null}
              {settings.contactEmail ? (
                <li>
                  <EmailLink email={settings.contactEmail} className={contactLink} />
                </li>
              ) : null}
            </ul>
          ) : (
            <Link href="/contact" className="inline-flex min-h-11 items-center text-[length:var(--step-body)] font-semibold underline-offset-4 hover:underline">
              {t("Contact the team")}
            </Link>
          )}
          <p className="max-w-md text-[length:var(--step-small)] leading-relaxed text-white/75">
            {t(
              "Rakt Response is a volunteer coordination platform. It does not store blood, certify compatibility or replace a hospital or licensed blood bank. In an emergency, contact the treating hospital or the nearest licensed blood bank immediately.",
            )}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 md:col-span-8">
          {FOOTER_GROUPS.map((group) => (
            <nav key={group.title} aria-label={t(group.title)}>
              <p className="mb-2 text-[length:var(--step-body)] font-semibold">{t(group.title)}</p>
              <ul className="text-[length:var(--step-body)] text-white/85">
                {group.links.map((item) => (
                  <li key={item.href}>
                    <Link className="flex min-h-11 items-center underline-offset-4 hover:text-white hover:underline" href={item.href}>
                      {t(item.label)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      <div className="bg-[#0f2140]">
        <div className="page-container flex flex-col gap-2 py-5 text-[length:var(--step-small)] text-white/75 md:flex-row md:items-center md:justify-between">
          <p>{t("© {year} Rakt Response Team. All rights reserved.", { year: new Date().getFullYear() })}</p>
          <p>
            {t("Photographs of blood donation camps in India via Wikimedia Commons:")}{" "}
            {PHOTO_CREDITS.map((c, i) => (
              <span key={c.href}>
                {i ? "; " : ""}
                <a href={c.href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-white">
                  {c.label}
                </a>
              </span>
            ))}
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
