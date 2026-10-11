import type { Metadata } from "next";
import { PageHero } from "@/components/learn/learn-parts";
import Link from "next/link";
import { FilePenLine, Hospital, Mail, MessageCircle, Phone, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/common/page-parts";
import { getPublicSettings } from "@/lib/data/public";
import { mailtoLink, telLink, whatsappLink } from "@/lib/contact-links";
import { formatPhone } from "@/lib/phone";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: t("Contact"),
    description: t("How to reach the Rakt Response team, report inaccurate information or request a correction."),
  };
}

export const revalidate = 300;

export default async function ContactPage() {
  const t = await getT();
  const settings = await getPublicSettings();
  const [needBloodBefore, needBloodAfter] = t(
    "Contact the treating hospital or the nearest licensed blood bank first. Then {link} so our volunteers can help find voluntary donors.",
  ).split("{link}");
  const hasAny = settings.contactEmail || settings.contactPhone || settings.whatsapp;
  return (
    <>
      <PageHero
        eyebrow={t("Contact")}
        title={t("Talk to")}
        highlight={t("the team.")}
        subtitle={t("Volunteers reply as fast as they can. We're not an emergency service.")}
      />
    <div className="page-container max-w-3xl py-8">

      <Notice tone="warning" icon={Hospital} title={t("Need blood urgently?")} className="mb-6">
        {needBloodBefore}
        <Link href="/blood-requests/new" className="font-semibold text-primary underline">
          {t("submit a blood request")}
        </Link>
        {needBloodAfter}
      </Notice>

      <section className="surface space-y-3 p-5" aria-labelledby="reach-us">
        <h2 id="reach-us" className="text-lg font-bold">
          {t("Reach the team")}
        </h2>
        {settings.serviceArea ? <p className="text-sm text-muted-foreground">{t("Currently serving: {area}", { area: settings.serviceArea })}</p> : null}
        {hasAny ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {settings.contactPhone ? (
              <Button asChild variant="outline">
                <a href={telLink(settings.contactPhone)}>
                  <Phone className="size-4" aria-hidden="true" /> {formatPhone(settings.contactPhone)}
                </a>
              </Button>
            ) : null}
            {settings.whatsapp ? (
              <Button asChild variant="outline">
                <a href={whatsappLink(settings.whatsapp)} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="size-4" aria-hidden="true" /> {t("WhatsApp")}
                </a>
              </Button>
            ) : null}
            {settings.contactEmail ? (
              <Button asChild variant="outline">
                <a href={mailtoLink(settings.contactEmail, "Rakt Response enquiry")}>
                  <Mail className="size-4" aria-hidden="true" /> {settings.contactEmail}
                </a>
              </Button>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {t(
              "Public contact details have not been published yet. Signed-in members can reach volunteers through their blood requests and notifications.",
            )}
          </p>
        )}
      </section>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <section className="surface p-5">
          <ShieldAlert className="mb-2 size-6 text-primary" aria-hidden="true" />
          <h2 className="font-bold">{t("Report inaccurate information")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
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
        <section className="surface p-5">
          <FilePenLine className="mb-2 size-6 text-primary" aria-hidden="true" />
          <h2 className="font-bold">{t("Corrections, withdrawals & privacy")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t(
              "Manage your consent, correct your profile or request deletion from your account. Story contributors can withdraw or request corrections from My stories.",
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
    </>
  );
}
