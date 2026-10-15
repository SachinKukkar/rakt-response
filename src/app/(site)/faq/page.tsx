import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import Link from "next/link";
import { Fragment } from "react";
import { Droplet, Lock, MessageCircleQuestion, NotebookPen, Siren, TriangleAlert, type LucideIcon } from "lucide-react";
import { Notice } from "@/components/common/page-parts";
import { CtaBand, MoreDetails, PageHero, SectionTitle, TLDR, TopicPills } from "@/components/learn/learn-parts";
import { getT } from "@/i18n/server";
import type { TFunction } from "@/i18n/translate";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return pageMetadata(t("FAQ"), t("Answers to common questions about blood donation, privacy, verified requests and how Rakt Response works."));
}

/** Puts links and bold text into a translated sentence at its {slots}. */
function rich(text: string, slots: Record<string, React.ReactNode>) {
  return text.split(/\{(\w+)\}/).map((part, i) => <Fragment key={i}>{i % 2 ? slots[part] : part}</Fragment>);
}

type Faq = { q: string; a: React.ReactNode };

const groups = (t: TFunction): { id: string; icon: LucideIcon; kicker: string; title: string; items: Faq[] }[] => [
  {
    id: "donating",
    icon: Droplet,
    kicker: t("Donating"),
    title: t("About donating"),
    items: [
      {
        q: t("Is donating blood safe?"),
        a: (
          <p>
            {rich(
              t(
                "At licensed centres, trained staff use sterile, single-use equipment that is thrown away after each donor, so it can't pass an infection to you. Most people feel fine; some feel briefly light-headed, which is why you rest before leaving. See {link}.",
              ),
              { link: <Link href="/donation-process">{t("what to expect")}</Link> },
            )}
          </p>
        ),
      },
      {
        q: t("How often can I donate?"),
        a: (
          <p>
            {rich(
              t(
                "It depends on the type. Whole blood needs the longest gap, and in India it typically differs for men and women; SDP has its own, shorter interval. The blood centre decides each time ({link}).",
              ),
              { link: <Link href="/eligibility">{t("eligibility info")}</Link> },
            )}
          </p>
        ),
      },
      {
        q: t("What is the difference between whole blood and SDP?"),
        a: (
          <p>
            {rich(
              t(
                "Whole blood goes into a bag and is separated into components later. SDP (single donor platelets) uses a machine to keep only platelets and return the rest; it takes longer, needs extra checks, and the two are not interchangeable ({link}).",
              ),
              { link: <Link href="/donation-types">{t("compare types")}</Link> },
            )}
          </p>
        ),
      },
      {
        q: t("Does registering mean I am eligible to donate?"),
        a: (
          <p>
            {t(
              "No. Registering only means you're willing to be contacted. Rakt Response doesn't decide eligibility; the blood centre's doctor screens you at every donation, and their decision is final.",
            )}
          </p>
        ),
      },
      {
        q: t("What is the Bombay (Oh) blood group?"),
        a: (
          <p>
            {t(
              "A rare blood group, first identified in Bombay (now Mumbai). Routine tests can mistake it for O, and people with it can receive only Oh blood. If you know your group is Oh, please register: you may be one of very few donors who can help.",
            )}
          </p>
        ),
      },
      {
        q: t("Does Rakt Response pay donors?"),
        a: (
          <p>
            {t(
              "No. We support voluntary, non-remunerated donation only. Nobody should ask for or offer money to donate through the platform; if it happens, please tell us.",
            )}
          </p>
        ),
      },
    ],
  },
  {
    id: "privacy",
    icon: Lock,
    kicker: t("Privacy"),
    title: t("Privacy and your profile"),
    items: [
      {
        q: t("Who can see my phone number?"),
        a: (
          <p>
            {t(
              "Nobody publicly. Only an authorised volunteer coordinating a verified request can see it, and only if you've consented to be contacted. Every access is logged.",
            )}
          </p>
        ),
      },
      {
        q: t("Can I hide my profile or withdraw my consent?"),
        a: (
          <p>
            {rich(
              t(
                "Yes, any time. In Privacy & settings you can switch directory visibility, contact permission and alerts on or off, and changes apply straight away ({link}).",
              ),
              { link: <Link href="/privacy">{t("privacy policy")}</Link> },
            )}
          </p>
        ),
      },
      {
        q: t("Will I get SMS or WhatsApp spam?"),
        a: (
          <p>
            {t(
              "No. We don't send bulk messages. Updates are in-app, and a volunteer contacts you directly only about a verified request, and only with your consent.",
            )}
          </p>
        ),
      },
      {
        q: t("How do I delete my account?"),
        a: (
          <p>
            {t(
              "Request deletion from Settings. You're removed from donor discovery at once and an administrator completes the request; your contact details, location and profile are anonymised, though aggregated, non-identifying counts may remain.",
            )}
          </p>
        ),
      },
    ],
  },
  {
    id: "requests",
    icon: Siren,
    kicker: t("Requests"),
    title: t("Blood requests and emergencies"),
    items: [
      {
        q: t("What should I do in an emergency?"),
        a: (
          <p>
            {t(
              "Contact the treating hospital or the nearest licensed blood bank immediately, and don't wait for a response on Rakt Response. We can help find voluntary donors, but we are not an emergency service.",
            )}
          </p>
        ),
      },
      {
        q: t("How are blood requests verified?"),
        a: (
          <p>
            {t(
              "An authorised volunteer checks the details with the requester or hospital before marking a request verified. Unverified requests are never shown as confirmed.",
            )}
          </p>
        ),
      },
      {
        q: t("Does Rakt Response guarantee blood?"),
        a: (
          <p>
            {t(
              "No. We coordinate between voluntary donors and people seeking blood; we don't store blood, reserve units, certify compatibility or guarantee a donor will be available. Hospitals and licensed blood banks remain responsible for supplying blood.",
            )}
          </p>
        ),
      },
    ],
  },
  {
    id: "records",
    icon: NotebookPen,
    kicker: t("Records"),
    title: t("Donation records and stories"),
    items: [
      {
        q: t("What do “self-reported” and “verified” donations mean?"),
        a: (
          <p>
            {rich(
              t(
                "{selfReported} means you added it yourself; it becomes {verified} once a volunteer or administrator checks it against supporting details. Neither label is a medical decision about when you can donate next.",
              ),
              { selfReported: <strong>{t("Self-reported")}</strong>, verified: <strong>{t("verified")}</strong> },
            )}
          </p>
        ),
      },
      {
        q: t("How are stories published?"),
        a: <p>{t("Only after review by our team and with your consent. You choose what to share and can withdraw your story later.")}</p>,
      },
    ],
  },
];

export default async function FaqPage() {
  const t = await getT();
  const GROUPS = groups(t);
  return (
    <>
      <PageHero
        eyebrow={t("FAQ")}
        title={t("Questions?")}
        highlight={t("Answers.")}
        subtitle={t("Short answers about donating, privacy and how Rakt Response works. Tap a question to open it.")}
      >
        <nav aria-label={t("FAQ sections")} className="snap-row sm:mx-0 sm:flex-wrap sm:px-0">
          {GROUPS.map((g) => (
            <a
              key={g.id}
              href={`#${g.id}`}
              className="press inline-flex h-11 items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 text-sm font-semibold whitespace-nowrap text-white backdrop-blur hover:bg-white/20"
            >
              <g.icon className="size-4" aria-hidden="true" />
              {g.kicker}
            </a>
          ))}
        </nav>
      </PageHero>

      <div className="page-container space-y-10 pb-4">
        <TLDR
          items={[
            t("Donating at a licensed centre uses sterile, single-use kit."),
            t("Registering isn't eligibility. The blood centre decides, every time."),
            t("Your number is never public. Contact needs your consent."),
            t("Emergency? Go to the treating hospital or a licensed blood bank now."),
          ]}
        />

        <Notice title={t("Rakt Response is not a hospital or blood bank")} tone="warning" icon={TriangleAlert}>
          {t("We coordinate between voluntary donors and people seeking blood. We can't guarantee availability or compatibility.")}
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

        <Notice title={t("Still have a question?")} icon={MessageCircleQuestion} className="max-w-3xl">
          {rich(
            t(
              "For questions about your own health, talk to a blood centre or your doctor. For anything about Rakt Response, {link}.",
            ),
            {
              link: (
                <Link href="/contact" className="font-medium text-primary underline underline-offset-4">
                  {t("contact us")}
                </Link>
              ),
            },
          )}
        </Notice>

        <TopicPills current="/faq" />
      </div>

      <CtaBand />
    </>
  );
}
