import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { Fragment, type ReactNode } from "react";
import { PageHero } from "@/components/learn/learn-parts";
import Link from "next/link";
import { Notice } from "@/components/common/page-parts";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return pageMetadata(t("Terms of use"), t("The rules for using Rakt Response, and what the platform can and cannot do."));
}

/** Puts JSX (links) into a translated sentence at its {placeholders}. */
function rich(text: string, parts: Record<string, ReactNode>) {
  return text.split(/\{(\w+)\}/).map((piece, i) => (i % 2 === 1 ? <Fragment key={i}>{parts[piece]}</Fragment> : piece));
}

export default async function TermsPage() {
  const t = await getT();
  return (
    <>
      <PageHero
        eyebrow={t("The fine print")}
        title={t("Terms of")}
        highlight={t("use.")}
        subtitle={t("How Rakt Response works, and what it can and can't do. Last updated 11 October 2026.")}
      />
    <div className="page-container max-w-3xl py-8">
      <Notice tone="warning" title={t("Review before production")} className="mb-6">
        {t("These terms describe how the platform works. The organisation should have them reviewed by a qualified professional before relying on them.")}
      </Notice>
      <div className="prose-rr">
        <h2>{t("What Rakt Response is")}</h2>
        <p>
          {t(
            "Rakt Response is a free, volunteer-run platform that helps voluntary blood donors register, keep a record of their donations and be reached — with their consent — by authorised volunteers coordinating verified blood requests.",
          )}
        </p>

        <h2>{t("What Rakt Response is not")}</h2>
        <ul>
          <li>{t("It is not a hospital, blood bank or medical service, and does not give medical advice.")}</li>
          <li>{t("It does not store blood, reserve units, certify compatibility or guarantee that a donor will be available.")}</li>
          <li>{t("It does not decide whether anyone is eligible to donate — the blood centre's screening does.")}</li>
          <li>{t("In an emergency, always contact the treating hospital or a licensed blood bank first.")}</li>
        </ul>

        <h2>{t("Your responsibilities")}</h2>
        <ul>
          <li>{t("Give accurate information, keep it up to date and only register yourself.")}</li>
          <li>{t("Only submit blood requests that are genuine, and tell us when a request is no longer needed.")}</li>
          <li>{t("Do not include patient names, diagnoses, medical records or other people's personal details in requests or stories unless you have the right to share them.")}</li>
          <li>{t("Never offer, request or accept payment for blood. Donation through Rakt Response is voluntary and unpaid.")}</li>
          <li>{t("Do not attempt to scrape, copy, export or misuse donor information, or to access areas you are not authorised for.")}</li>
        </ul>

        <h2>{t("Volunteers and administrators")}</h2>
        <p>
          {t(
            "Authorised volunteers may only use donor information to coordinate a specific, verified blood request, must respect each donor's consent and contact preferences, and must not keep or share contact details for any other purpose. Access is logged and may be withdrawn at any time.",
          )}
        </p>

        <h2>{t("Stories and content")}</h2>
        <p>
          {rich(
            t(
              "When you submit a story you confirm you have the right to share it. You allow Rakt Response to review it and, if approved, publish the parts you consented to on this website. We may correct formatting without changing your meaning. You can ask for corrections or withdraw your story at any time from {link}.",
            ),
            { link: <Link href="/share-your-story/submissions">{t("My stories")}</Link> },
          )}
        </p>

        <h2>{t("Suspension")}</h2>
        <p>
          {t("We may hide, correct or remove information and suspend accounts that break these terms, put donors at risk or appear fraudulent.")}
        </p>

        <h2>{t("Liability")}</h2>
        <p>
          {t(
            "Rakt Response is provided free of charge, as is, by volunteers. To the extent permitted by law, we are not liable for decisions made by donors, requesters, hospitals or blood banks, or for any donor being unavailable.",
          )}
        </p>

        <h2>{t("Governing law")}</h2>
        <p>{t("These terms are governed by the laws of India.")}</p>

        <p>
          {rich(t("Questions? See our {privacy} or {contact}."), {
            privacy: <Link href="/privacy">{t("privacy policy")}</Link>,
            contact: <Link href="/contact">{t("contact the team")}</Link>,
          })}
        </p>
      </div>
    </div>
    </>
  );
}
