import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/learn/learn-parts";
import Link from "next/link";
import { FilePenLine, Hospital, Mail, MessageCircle, Phone, ShieldAlert } from "lucide-react";
import { Notice } from "@/components/common/page-parts";
import { ContactPeople } from "@/components/site/contact-people";
import { SectionLabel } from "@/components/site/parts";
import { getPublicSettings } from "@/lib/data/public";
import { mailtoLink, telLink, whatsappLink } from "@/lib/contact-links";
import { formatPhone } from "@/lib/phone";
import { PHOTOS } from "@/lib/photos";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return pageMetadata(t("Contact"), t("How to reach the Rakt Response team, report inaccurate information or request a correction."));
}

export const revalidate = 300;

const CHANNEL = "press inline-flex h-12 items-center gap-2 rounded-full border border-navy/15 px-5 text-[15px] font-medium text-navy transition-colors hover:bg-navy/5";

export default async function ContactPage() {
  const t = await getT();
  const settings = await getPublicSettings();
  const [needBloodBefore, needBloodAfter] = t(
    "Contact the treating hospital or the nearest licensed blood bank first. Then {link} so our Rakt Mitras can help find voluntary donors.",
  ).split("{link}");
  const hasChannels = settings.contactEmail || settings.contactPhone || settings.whatsapp;
  return (
    <>
      <PageHero
        eyebrow={t("Contact")}
        title={t("Talk to")}
        highlight={t("the team.")}
        subtitle={t("Rakt Mitras reply as fast as they can. We're not an emergency service.")}
        photo={PHOTOS.holdingHand}
      />
      <div className="page-container py-14 sm:py-20">
        <div className="max-w-5xl">
        <Notice tone="warning" icon={Hospital} title={t("Need blood urgently?")}>
          {needBloodBefore}
          <Link href="/blood-requests/new" className="font-semibold text-primary underline">
            {t("submit a blood request")}
          </Link>
          {needBloodAfter}
        </Notice>

        <section className="mt-14" aria-labelledby="reach-us">
          <SectionLabel>{t("Call the team")}</SectionLabel>
          <h2 id="reach-us" className="display-sm mt-4">
            {t("Reach the team")}
          </h2>
          {settings.serviceArea ? <p className="mt-2 text-muted-foreground">{t("Currently serving: {area}", { area: settings.serviceArea })}</p> : null}
          <ContactPeople tone="cream" className="mt-7" />
          {hasChannels ? (
            <div className="mt-6 flex flex-wrap gap-2.5">
              {settings.contactPhone ? (
                <a href={telLink(settings.contactPhone)} className={CHANNEL}>
                  <Phone className="size-4 text-primary" aria-hidden="true" /> {formatPhone(settings.contactPhone)}
                </a>
              ) : null}
              {settings.whatsapp ? (
                <a href={whatsappLink(settings.whatsapp)} target="_blank" rel="noopener noreferrer" className={CHANNEL}>
                  <MessageCircle className="size-4 text-primary" aria-hidden="true" /> {t("WhatsApp")}
                </a>
              ) : null}
              {settings.contactEmail ? (
                <a href={mailtoLink(settings.contactEmail, "Rakt Response enquiry")} className={CHANNEL}>
                  <Mail className="size-4 text-primary" aria-hidden="true" /> {settings.contactEmail}
                </a>
              ) : null}
            </div>
          ) : null}
          <p className="label-mono mt-6 text-muted-foreground">{t("In an emergency call 112, or go to the nearest hospital")}</p>
        </section>

        <div className="mt-14 grid gap-4 sm:grid-cols-2">
          <section className="surface p-6 sm:p-7">
            <span className="icon-tile">
              <ShieldAlert className="size-5" aria-hidden="true" />
            </span>
            <h2 className="mt-5 text-xl font-medium tracking-[-0.02em]">{t("Report inaccurate information")}</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
              {t(
                "Seen a request, story or figure that looks wrong? Tell us the page link and what is incorrect. Please don't include patient medical details.",
              )}
            </p>
            {settings.contactEmail ? (
              <a
                className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-primary underline"
                href={mailtoLink(settings.contactEmail, "Report inaccurate information")}
              >
                {t("Email a report")}
              </a>
            ) : null}
          </section>
          <section className="surface p-6 sm:p-7">
            <span className="icon-tile">
              <FilePenLine className="size-5" aria-hidden="true" />
            </span>
            <h2 className="mt-5 text-xl font-medium tracking-[-0.02em]">{t("Corrections, withdrawals & privacy")}</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
              {t(
                "Choose how patients can reach you, correct your profile or request deletion from your account. Story contributors can withdraw or request corrections from My stories.",
              )}
            </p>
            <div className="mt-3 flex flex-wrap gap-x-4">
              <Link className="inline-flex min-h-11 items-center text-sm font-semibold text-primary underline" href="/settings">
                {t("Privacy & settings")}
              </Link>
              <Link className="inline-flex min-h-11 items-center text-sm font-semibold text-primary underline" href="/share-your-story/submissions">
                {t("My stories")}
              </Link>
            </div>
          </section>
        </div>
        </div>
      </div>
    </>
  );
}
