import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { Fragment } from "react";
import Link from "next/link";
import { Cake, CalendarClock, Droplet, HeartPulse, MessageCircleQuestion, Pill, Scale, Smile, Thermometer, TriangleAlert, UserCheck, type LucideIcon } from "lucide-react";
import { Notice } from "@/components/common/page-parts";
import { CtaBand, MoreDetails, PageHero, SectionTitle, TLDR, TopicPills } from "@/components/learn/learn-parts";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return pageMetadata(t("Eligibility"), t(
      "General information about blood donation eligibility in India. This is not a medical assessment: the blood centre's doctor decides at every donation.",
    ));
}

/** Puts JSX into a translated sentence at its {placeholders}, so word order can follow the language. */
function withParts(text: string, parts: Record<string, React.ReactNode>): React.ReactNode[] {
  return text.split(/\{(\w+)\}/).map((piece, i) => (i % 2 === 1 ? <Fragment key={i}>{parts[piece] ?? `{${piece}}`}</Fragment> : piece));
}

const CHECKS: { icon: LucideIcon; title: string; usually: string; note: string }[] = [
  { icon: UserCheck, title: "Age", usually: "Usually 18–65", note: "First-timers near the top end may get extra checks." },
  { icon: Scale, title: "Weight", usually: "Usually 45–50 kg+", note: "Larger collections may need a higher minimum." },
  { icon: Thermometer, title: "Feeling well", usually: "Well on the day", note: "Fever, a cold or an upset stomach? Wait until you've recovered." },
  { icon: Droplet, title: "Haemoglobin", usually: "Checked at the centre", note: "A quick finger-prick or similar test on the day." },
  { icon: Pill, title: "Tattoo, illness, meds", usually: "Often a waiting period", note: "Also recent surgery, dental work, vaccines, piercings or travel." },
  { icon: CalendarClock, title: "Since your last donation", usually: "Usually 90 / 120 days (whole blood)", note: "Typically men / women. SDP has its own, shorter gap." },
];

const TELL_THE_CENTRE = [
  "Pregnancy, recent childbirth, breastfeeding or recent miscarriage",
  "Long-term conditions, such as heart, lung, kidney or liver conditions, diabetes or high blood pressure",
  "Any medicines you take, including antibiotics or blood thinners",
  "Recent infections, including dengue, malaria, jaundice or hepatitis, and contact with people who had them",
  "Recent surgery, dental treatment, tattoos, piercings, acupuncture or vaccinations",
  "Anything else you're unsure about",
];

export default async function EligibilityPage() {
  const t = await getT();
  return (
    <>
      <PageHero
        eyebrow="Can I donate?"
        title="The quick"
        highlight="check."
        subtitle="Here's what blood centres usually look at. They make the final call, every time."
        chips={[
          { icon: Cake, label: "Age" },
          { icon: Scale, label: "Weight" },
          { icon: Smile, label: "Feeling well" },
          { icon: CalendarClock, label: "Last donation" },
        ]}
      />

      <div className="page-container space-y-10 pb-4">
        <TLDR
          items={[
            "These are typical ranges, not a yes or no.",
            "The blood centre screens you at every donation. Their call is final.",
            "Being asked to wait is common, often temporary, and never a judgement.",
            "Answer the questionnaire honestly, every time.",
          ]}
        />

        <Notice title="General information, not a medical assessment" tone="warning" icon={TriangleAlert}>
          <strong>{t("Rakt Response doesn't decide who can donate.")}</strong>{" "}
          {t(
            "Donor selection in India follows national NBTC and NACO guidance, and the blood centre's doctor screens you on the day. Registering or reading this page doesn't mean you can donate on any particular day.",
          )}
        </Notice>

        <section aria-labelledby="checks-heading">
          <SectionTitle kicker="Quick check" title="What centres usually look at" id="checks-heading" />
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CHECKS.map((c) => (
              <li key={c.title} className="surface flex gap-4 p-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary text-white">
                  <c.icon className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h3 className="leading-tight font-bold">{t(c.title)}</h3>
                  <p className="mt-1 inline-flex rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-primary">{t(c.usually)}</p>
                  <p className="mt-1.5 text-sm text-muted-foreground">{t(c.note)}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-muted-foreground">
            {t("Typical ranges only, not a checklist for deciding yourself.")}{" "}
            <Link href="/donation-types" className="font-semibold text-primary underline underline-offset-4">
              {t("Compare donation types")}
            </Link>
          </p>
        </section>

        <div className="space-y-3">
          <MoreDetails title="Who sets the rules">
            <p>
              {withParts(
                t(
                  "In India, donor selection follows national guidelines from the {nbtc} and the {naco}, along with the rules of each licensed blood centre. These guidelines are updated from time to time, and centres may apply additional checks.",
                ),
                {
                  nbtc: <strong>{t("National Blood Transfusion Council (NBTC)")}</strong>,
                  naco: <strong>{t("National AIDS Control Organisation (NACO)")}</strong>,
                },
              )}
            </p>
            <p>
              {t(
                "The doctor at the blood centre applies these guidelines to you as an individual, using your answers to the donor questionnaire and a short health check on the day.",
              )}
            </p>
          </MoreDetails>
          <MoreDetails title="Tell the blood centre about">
            <ul>
              {TELL_THE_CENTRE.map((item) => (
                <li key={item}>{t(item)}</li>
              ))}
            </ul>
          </MoreDetails>
          <MoreDetails title="Intervals, deferrals and SDP checks">
            <p>
              {t(
                "Intervals differ by donation type. For whole blood, Indian guidance typically differs by sex, for example 90 days for men and 120 days for women. Apheresis donations such as SDP have their own, shorter intervals set by the apheresis centre.",
              )}
            </p>
            <p>
              {t(
                "Certain medicines, vaccinations, surgeries, dental work, tattoos, piercings and some travel can each mean a waiting (deferral) period. A deferral is often temporary, and the centre can tell you when you may be able to return.",
              )}
            </p>
            <p>
              {t(
                "SDP and other apheresis donations need additional checks, such as a platelet count and vein suitability, which the apheresis centre decides. Your questionnaire answers are confidential to the blood centre.",
              )}
            </p>
          </MoreDetails>
        </div>

        <Notice title="Unsure about something?" icon={MessageCircleQuestion}>
          {t(
            "Ask a licensed blood centre or your own doctor. Rakt Response volunteers can't give medical advice or confirm whether you can donate.",
          )}
        </Notice>

        <div className="surface-tint flex items-center gap-3 p-4 text-sm">
          <HeartPulse className="size-5 shrink-0 text-primary" aria-hidden="true" />
          <p>
            {t("Curious about the day itself?")}{" "}
            <Link href="/donation-process" className="font-semibold text-primary underline underline-offset-4">
              {t("See what happens")}
            </Link>
          </p>
        </div>

        <TopicPills current="/eligibility" />
      </div>

      <CtaBand text="Register in two minutes. The blood centre will always do its own screening on the day." />
    </>
  );
}
