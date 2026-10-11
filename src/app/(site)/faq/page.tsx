import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircleQuestion, TriangleAlert } from "lucide-react";
import { Notice } from "@/components/common/page-parts";
import { CtaBand, MoreDetails, PageHero, SectionTitle, TLDR, TopicPills } from "@/components/learn/learn-parts";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers to common questions about blood donation, privacy, verified requests and how Rakt Response works.",
};

type Faq = { q: string; a: React.ReactNode };

const GROUPS: { id: string; emoji: string; kicker: string; title: string; items: Faq[] }[] = [
  {
    id: "donating",
    emoji: "🩸",
    kicker: "Donating",
    title: "About donating",
    items: [
      {
        q: "Is donating blood safe?",
        a: (
          <p>
            At licensed centres, trained staff use sterile, single-use equipment that is thrown away after each donor, so it
            can&apos;t pass an infection to you. Most people feel fine; some feel briefly light-headed, which is why you rest
            before leaving. See <Link href="/donation-process">what to expect</Link>.
          </p>
        ),
      },
      {
        q: "How often can I donate?",
        a: (
          <p>
            It depends on the type. Whole blood needs the longest gap, and in India it typically differs for men and women; SDP
            has its own, shorter interval. The blood centre decides each time (<Link href="/eligibility">eligibility info</Link>
            ).
          </p>
        ),
      },
      {
        q: "What is the difference between whole blood and SDP?",
        a: (
          <p>
            Whole blood goes into a bag and is separated into components later. SDP (single donor platelets) uses a machine to
            keep only platelets and return the rest; it takes longer, needs extra checks, and the two are not interchangeable (
            <Link href="/donation-types">compare types</Link>).
          </p>
        ),
      },
      {
        q: "Does registering mean I am eligible to donate?",
        a: (
          <p>
            No. Registering only means you&apos;re willing to be contacted. Rakt Response doesn&apos;t decide eligibility; the
            blood centre&apos;s doctor screens you at every donation, and their decision is final.
          </p>
        ),
      },
      {
        q: "Does Rakt Response pay donors?",
        a: (
          <p>
            No. We support voluntary, non-remunerated donation only. Nobody should ask for or offer money to donate through the
            platform; if it happens, please tell us.
          </p>
        ),
      },
    ],
  },
  {
    id: "privacy",
    emoji: "🔒",
    kicker: "Privacy",
    title: "Privacy and your profile",
    items: [
      {
        q: "Who can see my phone number?",
        a: (
          <p>
            Nobody publicly. Only an authorised volunteer coordinating a verified request can see it, and only if you&apos;ve
            consented to be contacted. Every access is logged.
          </p>
        ),
      },
      {
        q: "Can I hide my profile or withdraw my consent?",
        a: (
          <p>
            Yes, any time. In Privacy &amp; settings you can switch directory visibility, contact permission and alerts on or
            off, and changes apply straight away (<Link href="/privacy">privacy policy</Link>).
          </p>
        ),
      },
      {
        q: "Will I get SMS or WhatsApp spam?",
        a: (
          <p>
            No. We don&apos;t send bulk messages. Updates are in-app, and a volunteer contacts you directly only about a
            verified request, and only with your consent.
          </p>
        ),
      },
      {
        q: "How do I delete my account?",
        a: (
          <p>
            Request deletion from Settings. You&apos;re removed from donor discovery at once and an administrator completes the
            request; your contact details, location and profile are anonymised, though aggregated, non-identifying counts may
            remain.
          </p>
        ),
      },
    ],
  },
  {
    id: "requests",
    emoji: "🚨",
    kicker: "Requests",
    title: "Blood requests and emergencies",
    items: [
      {
        q: "What should I do in an emergency?",
        a: (
          <p>
            Contact the treating hospital or the nearest licensed blood bank immediately, and don&apos;t wait for a response on
            Rakt Response. We can help find voluntary donors, but we are not an emergency service.
          </p>
        ),
      },
      {
        q: "How are blood requests verified?",
        a: (
          <p>
            An authorised volunteer checks the details with the requester or hospital before marking a request verified.
            Unverified requests are never shown as confirmed.
          </p>
        ),
      },
      {
        q: "Does Rakt Response guarantee blood?",
        a: (
          <p>
            No. We coordinate between voluntary donors and people seeking blood; we don&apos;t store blood, reserve units,
            certify compatibility or guarantee a donor will be available. Hospitals and licensed blood banks remain responsible
            for supplying blood.
          </p>
        ),
      },
    ],
  },
  {
    id: "records",
    emoji: "📒",
    kicker: "Records",
    title: "Donation records and stories",
    items: [
      {
        q: "What do “self-reported” and “verified” donations mean?",
        a: (
          <p>
            <strong>Self-reported</strong> means you added it yourself; it becomes <strong>verified</strong> once a volunteer or
            administrator checks it against supporting details. Neither label is a medical decision about when you can donate
            next.
          </p>
        ),
      },
      {
        q: "How are stories published?",
        a: (
          <p>
            Only after review by our team and with your consent. You choose what to share and can withdraw your story later.
          </p>
        ),
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <>
      <PageHero
        eyebrow="FAQ"
        title="Questions?"
        highlight="Answers."
        subtitle="Short answers about donating, privacy and how Rakt Response works. Tap a question to open it."
      >
        <nav aria-label="FAQ sections" className="snap-row sm:mx-0 sm:flex-wrap sm:px-0">
          {GROUPS.map((g) => (
            <a
              key={g.id}
              href={`#${g.id}`}
              className="press inline-flex h-11 items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 text-sm font-semibold whitespace-nowrap text-white backdrop-blur hover:bg-white/20"
            >
              <span aria-hidden="true">{g.emoji}</span>
              {g.kicker}
            </a>
          ))}
        </nav>
      </PageHero>

      <div className="page-container space-y-10 pb-4">
        <TLDR
          items={[
            "Donating at a licensed centre uses sterile, single-use kit.",
            "Registering isn't eligibility. The blood centre decides, every time.",
            "Your number is never public. Contact needs your consent.",
            "Emergency? Go to the treating hospital or a licensed blood bank now.",
          ]}
        />

        <Notice title="Rakt Response is not a hospital or blood bank" tone="warning" icon={TriangleAlert}>
          We coordinate between voluntary donors and people seeking blood. We can&apos;t guarantee availability or
          compatibility.
        </Notice>

        <div className="max-w-3xl space-y-10">
          {GROUPS.map((g) => (
            <section key={g.id} id={g.id} aria-labelledby={`${g.id}-heading`} className="scroll-mt-24">
              <SectionTitle kicker={g.kicker} title={g.title} id={`${g.id}-heading`} />
              <div className="space-y-3">
                {g.items.map((item) => (
                  <MoreDetails key={item.q} title={item.q}>
                    {item.a}
                  </MoreDetails>
                ))}
              </div>
            </section>
          ))}
        </div>

        <Notice title="Still have a question?" icon={MessageCircleQuestion} className="max-w-3xl">
          For questions about your own health, talk to a blood centre or your doctor. For anything about Rakt Response,{" "}
          <Link href="/contact" className="font-medium text-primary underline underline-offset-4">
            contact us
          </Link>
          .
        </Notice>

        <TopicPills current="/faq" />
      </div>

      <CtaBand />
    </>
  );
}
