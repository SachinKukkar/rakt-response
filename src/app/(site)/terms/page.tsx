import type { Metadata } from "next";
import { PageHero } from "@/components/learn/learn-parts";
import Link from "next/link";
import { Notice } from "@/components/common/page-parts";

export const metadata: Metadata = {
  title: "Terms of use",
  description: "The rules for using Rakt Response, and what the platform can and cannot do.",
};

export default function TermsPage() {
  return (
    <>
      <PageHero eyebrow="The fine print" title="Terms of" highlight="use." subtitle="How Rakt Response works, and what it can and can&apos;t do. Last updated 11 October 2026." />
    <div className="page-container max-w-3xl py-8">
      <Notice tone="warning" title="Review before production" className="mb-6">
        These terms describe how the platform works. The organisation should have them reviewed by a qualified professional before
        relying on them.
      </Notice>
      <div className="prose-rr">
        <h2>What Rakt Response is</h2>
        <p>
          Rakt Response is a free, volunteer-run platform that helps voluntary blood donors register, keep a record of their
          donations and be reached — with their consent — by authorised volunteers coordinating verified blood requests.
        </p>

        <h2>What Rakt Response is not</h2>
        <ul>
          <li>It is not a hospital, blood bank or medical service, and does not give medical advice.</li>
          <li>It does not store blood, reserve units, certify compatibility or guarantee that a donor will be available.</li>
          <li>It does not decide whether anyone is eligible to donate — the blood centre&apos;s screening does.</li>
          <li>In an emergency, always contact the treating hospital or a licensed blood bank first.</li>
        </ul>

        <h2>Your responsibilities</h2>
        <ul>
          <li>Give accurate information, keep it up to date and only register yourself.</li>
          <li>Only submit blood requests that are genuine, and tell us when a request is no longer needed.</li>
          <li>Do not include patient names, diagnoses, medical records or other people&apos;s personal details in requests or stories unless you have the right to share them.</li>
          <li>Never offer, request or accept payment for blood. Donation through Rakt Response is voluntary and unpaid.</li>
          <li>Do not attempt to scrape, copy, export or misuse donor information, or to access areas you are not authorised for.</li>
        </ul>

        <h2>Volunteers and administrators</h2>
        <p>
          Authorised volunteers may only use donor information to coordinate a specific, verified blood request, must respect each
          donor&apos;s consent and contact preferences, and must not keep or share contact details for any other purpose. Access is
          logged and may be withdrawn at any time.
        </p>

        <h2>Stories and content</h2>
        <p>
          When you submit a story you confirm you have the right to share it. You allow Rakt Response to review it and, if approved,
          publish the parts you consented to on this website. We may correct formatting without changing your meaning. You can ask
          for corrections or withdraw your story at any time from <Link href="/share-your-story/submissions">My stories</Link>.
        </p>

        <h2>Suspension</h2>
        <p>
          We may hide, correct or remove information and suspend accounts that break these terms, put donors at risk or appear
          fraudulent.
        </p>

        <h2>Liability</h2>
        <p>
          Rakt Response is provided free of charge, as is, by volunteers. To the extent permitted by law, we are not liable for
          decisions made by donors, requesters, hospitals or blood banks, or for any donor being unavailable.
        </p>

        <h2>Governing law</h2>
        <p>These terms are governed by the laws of India.</p>

        <p>
          Questions? See our <Link href="/privacy">privacy policy</Link> or <Link href="/contact">contact the team</Link>.
        </p>
      </div>
    </div>
    </>
  );
}
