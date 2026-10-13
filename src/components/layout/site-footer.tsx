import Link from "next/link";
import { LogoMark } from "@/components/brand/logo";
import { EmailLink, PhoneLink, WhatsAppLink } from "@/components/common/contact-link";
import { SITE } from "@/lib/constants";
import { getPublicSettings } from "@/lib/data/public";
import { getT } from "@/i18n/server";
import { FOOTER_GROUPS } from "./nav-config";

export async function SiteFooter() {
  const [t, settings] = await Promise.all([getT(), getPublicSettings()]);
  const hasContact = Boolean(settings.contactEmail || settings.contactPhone || settings.whatsapp);
  const contactLink = "text-white hover:text-white min-h-11";
  return (
    <footer className="mt-16 bg-navy text-white">
      <div className="page-container grid gap-10 py-10 lg:grid-cols-[1.3fr_2fr]">
        <div className="space-y-4">
          <Link href="/" className="inline-flex min-h-11 items-center gap-3 rounded-full" aria-label={t("Rakt Response home")}>
            <LogoMark size="md" />
            <span>
              {/* On navy, "Response" is white; navy text would disappear. */}
              <span className="block text-xl font-extrabold">
                <span className="text-crimson">Rakt</span> Response
              </span>
              <span className="block text-sm text-white/75">{t(SITE.tagline)}</span>
            </span>
          </Link>
          <p className="max-w-md text-sm leading-relaxed text-white/75">{t(SITE.description)}</p>
          {hasContact ? (
            <ul className="space-y-1 text-sm" aria-label={t("Contact the team")}>
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
            <Link href="/contact" className="inline-flex min-h-11 items-center text-sm font-semibold underline-offset-2 hover:underline">
              {t("Contact the team")}
            </Link>
          )}
          <p className="max-w-md text-xs leading-relaxed text-white/60">
            {t(
              "Rakt Response is a volunteer coordination platform. It does not store blood, certify compatibility or replace a hospital or licensed blood bank. In an emergency, contact the treating hospital or the nearest licensed blood bank immediately.",
            )}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3">
          {FOOTER_GROUPS.map((group) => (
            <nav key={group.title} aria-label={t(group.title)}>
              <p className="mb-2 text-sm font-bold">{t(group.title)}</p>
              <ul className="text-sm text-white/80">
                {group.links.map((item) => (
                  <li key={item.href}>
                    <Link className="flex min-h-11 items-center hover:text-white hover:underline" href={item.href}>
                      {t(item.label)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="page-container flex flex-col gap-1 py-4 text-xs text-white/60 sm:flex-row sm:justify-between">
          <p>{t("© {year} Rakt Response Team. All rights reserved.", { year: new Date().getFullYear() })}</p>
          <p>
            {t(SITE.supporting)} · {t("Built by volunteers, for voluntary donors.")}
          </p>
        </div>
      </div>
    </footer>
  );
}
