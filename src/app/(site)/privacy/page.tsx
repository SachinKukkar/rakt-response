import type { Metadata } from "next";
import { Fragment, type ReactNode } from "react";
import { PageHero } from "@/components/learn/learn-parts";
import Link from "next/link";
import { Notice } from "@/components/common/page-parts";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: t("Privacy policy"),
    description: t("What personal information Rakt Response collects, why, who can see it, and how to control or delete it."),
  };
}

/** Puts JSX (links, bold names) into a translated sentence at its {placeholders}. */
function rich(text: string, parts: Record<string, ReactNode>) {
  return text.split(/\{(\w+)\}/).map((piece, i) => (i % 2 === 1 ? <Fragment key={i}>{parts[piece]}</Fragment> : piece));
}

const ACCESS = [
  { data: "Name, email, account settings", who: "You; Rakt Response administrators" },
  { data: "Mobile / WhatsApp number", who: "You; administrators. A volunteer only when coordinating a verified request and only if you allowed contact (or accepted that volunteer's contact request). Every access is logged." },
  { data: "Blood group, display name, broad area (city / locality)", who: "Authorised volunteers and administrators — only if you turned on directory visibility. Never public." },
  { data: "PIN code and approximate map location", who: "You; volunteers and administrators for search and distance filtering. Never public, never shown on donor cards." },
  { data: "Donation history", who: "You; volunteers and administrators. A verified summary appears on directory cards only if you allow it." },
  { data: "Blood request details you submit", who: "You (if signed in); volunteers and administrators. If you allow public listing, only the blood group, donation type, hospital, city/district, needed-by time and urgency of a verified request are public." },
  { data: "Stories you submit", who: "You; administrators. Only the parts you consented to are published, and only after review." },
  { data: "Audit logs (who did what, when — without contact details)", who: "Administrators" },
];

export default async function PrivacyPage() {
  const t = await getT();
  return (
    <>
      <PageHero
        eyebrow={t("Your data")}
        title={t("Privacy,")}
        highlight={t("in plain words.")}
        subtitle={t("What we collect, who sees it, and how to change your mind. Last updated 11 October 2026.")}
      />
    <div className="page-container max-w-3xl py-8">
      <Notice tone="warning" title={t("Review before production")} className="mb-6">
        {t(
          "This policy describes how the Rakt Response platform actually handles data. It is not legal advice. The organisation should have it reviewed by a qualified professional against the Digital Personal Data Protection Act, 2023 and its rules before relying on it.",
        )}
      </Notice>
      <div className="prose-rr">
        <h2>{t("Who we are")}</h2>
        <p>
          {rich(
            t(
              "Rakt Response is a community, volunteer-run platform that keeps a register of voluntary blood donors, records their donation history and helps authorised volunteers coordinate verified blood requests. Rakt Response is the data fiduciary for the information described here. Contact details for privacy questions and grievances are on our {link}.",
            ),
            { link: <Link href="/contact">{t("contact page")}</Link> },
          )}
        </p>

        <h2>{t("What we collect and why")}</h2>
        <ul>
          <li>
            <strong>{t("Account:")}</strong>{" "}
            {t("full name, email and password (stored only as a secure hash by our authentication provider) — to create and secure your account.")}
          </li>
          <li>
            <strong>{t("Donor profile:")}</strong>{" "}
            {t(
              "blood group, a self-declaration that you are 18–65, donation experience, optional display name, optional mobile/WhatsApp number, preferred contact method and optional profile photo — to match and reach donors for blood requests. We do not ask for your date of birth, gender or medical history.",
            )}
          </li>
          <li>
            <strong>{t("Location:")}</strong>{" "}
            {t(
              "state, district, city, locality and PIN code, and optionally an approximate map point that we round to about 1 km — to find donors near a hospital. We never ask for or store your street address.",
            )}
          </li>
          <li>
            <strong>{t("Donation history:")}</strong>{" "}
            {t(
              "type (whole blood, SDP, other apheresis), date, centre and area, with whether it is self-reported or verified — to help coordination and to report verified community figures.",
            )}
          </li>
          <li>
            <strong>{t("Consents:")}</strong>{" "}
            {t(
              "your choices for directory visibility, contact, emergency alerts and sharing a donation summary, with the time each was given or withdrawn.",
            )}
          </li>
          <li>
            <strong>{t("Blood requests:")}</strong>{" "}
            {t(
              "requester name and contact, blood group, type of donor needed, hospital, area, time needed, urgency and optional notes. Please do not include patient names, diagnoses or documents.",
            )}
          </li>
          <li>
            <strong>{t("Stories:")}</strong>{" "}
            {t(
              "your story, the details you choose to share, optional photo and private follow-up contact. Photos are stripped of hidden metadata (such as GPS location) before storage.",
            )}
          </li>
          <li>
            <strong>{t("Security records:")}</strong>{" "}
            {t(
              "audit logs of privileged actions (such as a volunteer viewing contact details), and short-lived rate-limit counters. For requests submitted without an account we keep only a salted one-way hash of your connection address, never the address itself.",
            )}
          </li>
        </ul>

        <h2>{t("Who can see your information")}</h2>
      </div>
      <div className="my-4 space-y-2">
        {ACCESS.map((row) => (
          <div key={row.data} className="surface p-4 text-sm">
            <p className="font-semibold text-navy">{t(row.data)}</p>
            <p className="mt-1 text-muted-foreground">{t(row.who)}</p>
          </div>
        ))}
      </div>
      <div className="prose-rr">
        <p>
          {t(
            "We do not sell personal data, show advertising or use analytics or tracking cookies. We do not publish donor lists or phone numbers, and exports of donor data are restricted to authorised administrators and logged.",
          )}
        </p>

        <h2>{t("Your choices and rights")}</h2>
        <ul>
          <li>{t("Turn directory visibility, contact permission, alerts and summary sharing on or off at any time in Privacy & settings.")}</li>
          <li>{t("View and correct your profile, location and self-reported history. A verified blood group is corrected through a review request.")}</li>
          <li>{t("Withdraw a story or narrow what it shows; withdrawal removes public access immediately.")}</li>
          <li>{t("Request deletion of your account from Settings. We remove you from discovery at once and an administrator completes the request.")}</li>
          <li>{t("Contact us to access your data, raise a grievance or nominate someone to act for you.")}</li>
        </ul>

        <h2>{t("Service providers")}</h2>
        <p>
          {rich(
            t(
              "The platform runs on {supabase} (database, authentication, file storage) and is hosted on {vercel}. Account emails are sent through the authentication provider or an email service configured by the organisation. If you open the optional map, map tiles load from {osm}, which receives your connection address. Data may be processed outside India depending on the hosting region the organisation selects.",
            ),
            {
              supabase: <strong>Supabase</strong>,
              vercel: <strong>Vercel</strong>,
              osm: <strong>OpenStreetMap</strong>,
            },
          )}
        </p>

        <h2>{t("Cookies and storage")}</h2>
        <p>
          {t(
            "We use only essential cookies to keep you signed in. We do not store personal data in your browser's local storage. Our offline support caches only public pages and images, never your private information.",
          )}
        </p>

        <h2>{t("Retention")}</h2>
        <ul>
          <li>{t("Your account and profile: until you ask us to delete them.")}</li>
          <li>{t("Deletion requests: your contact details, location and profile are anonymised; aggregated, non-identifying donation counts may remain.")}</li>
          <li>{t("Requester contact details on closed blood requests: removed after about 90 days.")}</li>
          <li>{t("Audit logs: kept for up to three years to protect donors and investigate misuse.")}</li>
          <li>{t("Rate-limit counters: about two days.")}</li>
        </ul>

        <h2>{t("Security")}</h2>
        <p>
          {t(
            "Access is controlled by role-based permissions enforced in the database itself (row-level security), not just in the app. Contact details are only released after consent and role checks, access is rate-limited and logged, and connections are encrypted. No system is perfectly secure; please tell us at once if you notice anything wrong.",
          )}
        </p>

        <h2>{t("Children")}</h2>
        <p>{t("Donor registration is only for people aged 18 to 65. Please do not register on behalf of a child.")}</p>

        <h2>{t("Changes")}</h2>
        <p>{t("We will update this page when our practices change and show the date of the latest version above.")}</p>
      </div>
    </div>
    </>
  );
}
