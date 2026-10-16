import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Plus } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { BloodGroupChip } from "@/components/common/blood-group-chip";
import { EligibilityExplorer } from "@/components/home/eligibility-explorer";
import { GroupOrbit } from "@/components/home/group-orbit";
import { HomeHero } from "@/components/home/hero";
import { StoryTile } from "@/components/home/story-tile";
import { ArrowLink } from "@/components/site/arrow-link";
import { ContactPeople } from "@/components/site/contact-people";
import { Headline, SectionLabel } from "@/components/site/parts";
import { BLOOD_GROUPS, CORE_TEAM } from "@/lib/constants";
import { getImpactMetrics, listPublishedStories } from "@/lib/data/public";
import { formatNumber, initials } from "@/lib/format";
import { PHOTOS } from "@/lib/photos";
import { HOME_SAMPLE_SLUGS, SAMPLE_STORIES, SAMPLE_TESTIMONIALS, SHOW_SAMPLES } from "@/lib/samples";
import type { ImpactMetrics } from "@/lib/types";
import { getLocale, getT } from "@/i18n/server";
import type { TFunction } from "@/i18n/translate";

// Public statistics and stories are refreshed every 5 minutes.
export const revalidate = 300;

const FACTS = [
  { value: "9", label: "Blood groups", text: "Including the rare Bombay (Oh) group." },
  { value: "₹0", label: "To use Rakt Response", text: "Free for donors, families and volunteers." },
  { value: "10–15", label: "Minutes in the chair", text: "For a whole blood donation." },
  { value: "3", label: "Parts from one donation", text: "Red cells, plasma and platelets." },
];

/** A typical whole blood visit (times vary by centre). */
const VISIT = [
  { at: "0:00", title: "Register and show your ID", takes: "5 min" },
  { at: "0:05", title: "Confidential health questionnaire", takes: "10 min" },
  { at: "0:15", title: "Mini check: haemoglobin, pulse, blood pressure", takes: "10 min" },
  { at: "0:25", title: "The donation, in the chair", takes: "10–15 min" },
  { at: "0:40", title: "Rest, a drink and a snack", takes: "15 min" },
];

const PARTS = [
  {
    title: "Donors",
    note: "Register in 2 minutes",
    items: ["Blood group and broad area", "Contact only with your consent", "You choose who can find you", "Pause any time"],
  },
  {
    title: "Requests",
    note: "Verified first",
    items: ["Checked with the hospital or requester", "Shared only once verified", "Listed publicly only with permission", "Duplicates caught"],
  },
  {
    title: "Volunteers",
    note: "Authorised only",
    items: ["Approved coordinators", "Every number they open is logged", "They call only donors who said yes", "They follow up after the donation"],
  },
  {
    title: "Your record",
    note: "Private by default",
    items: ["Whole blood and SDP history", "Self-reported until verified", "Track the gap between donations", "Share a summary only if you want"],
  },
];

const DONOR_POINTS = ["Register in about two minutes", "Your number is never public", "Only verified requests, near you", "Say no any time", "Keep a record of every donation"];
const REQUEST_POINTS = ["Submit a request in minutes", "A volunteer checks it with the hospital", "Matching donors are contacted with their consent", "Updates as volunteers coordinate"];

const QUESTIONS = [
  {
    q: "Who can see my phone number?",
    a: "No one publicly. An authorised volunteer can view it only while coordinating a verified request, only if you allowed contact — and every access is logged.",
  },
  {
    q: "Does registering mean I'm eligible to donate?",
    a: "No. Eligibility is decided by the blood centre's screening on the day. Rakt Response never makes medical decisions.",
  },
  {
    q: "Is whole blood the same as SDP?",
    a: "No. SDP (single donor platelets) is collected by a machine over a longer session and has different checks and intervals.",
  },
  {
    q: "What is the Bombay (Oh) blood group?",
    a: "A rare blood group, first identified in Bombay (now Mumbai). Routine tests can mistake it for O, and people with it can receive only Oh blood. If you know your group is Oh, please register: you may be one of very few donors who can help.",
  },
  {
    q: "What should I do in an emergency?",
    a: "Contact the treating hospital or the nearest licensed blood bank immediately. You can also submit a request here for volunteer support.",
  },
];

const IMPACT_KEYS: Array<{ key: keyof ImpactMetrics; label: string }> = [
  { key: "registered_donors", label: "Registered donors" },
  { key: "verified_donors", label: "Verified donors" },
  { key: "verified_whole_blood_donations", label: "Verified whole blood donations" },
  { key: "verified_sdp_donations", label: "Verified SDP donations" },
  { key: "requests_coordinated", label: "Requests coordinated" },
  { key: "requests_fulfilled", label: "Requests fulfilled" },
];

/** Photographs for the three sample stories on the homepage. */
const SAMPLE_PHOTOS: Record<string, (typeof PHOTOS)[keyof typeof PHOTOS]> = {
  "the-call-i-almost-missed": PHOTOS.donorChair,
  "two-nights-at-the-hospital": PHOTOS.bloodBag,
  "verifying-my-first-request": PHOTOS.handsHeart,
};

export default async function HomePage() {
  const [metrics, stories, t, locale] = await Promise.all([getImpactMetrics(), listPublishedStories(null, 3), getT(), getLocale()]);
  const realStories = stories?.stories ?? [];
  // Sample stories stand in only while nothing real has been published.
  const sampleStories = realStories.length === 0 && SHOW_SAMPLES ? SAMPLE_STORIES.filter((story) => HOME_SAMPLE_SLUGS.includes(story.slug)) : [];
  const quote = t(
    "No family should have to make fifty calls at night to find a donor. So we built a calmer way: requests checked by volunteers, and donors who already said yes.",
  );

  return (
    <>
      <HomeHero />

      {/* Facts */}
      <section className="on-night" aria-label={t("Facts about donating")}>
        <ul className="wide grid grid-cols-2 gap-x-6 gap-y-12 border-t border-white/10 pt-14 pb-20 lg:grid-cols-4 lg:pt-20 lg:pb-28">
          {FACTS.map((fact) => (
            <li key={fact.label} className="reveal min-w-0">
              <p className="display-lg tabular-nums">{fact.value}</p>
              <p className="label-mono mt-4 text-blush">{t(fact.label)}</p>
              <p className="mt-2.5 max-w-[16rem] text-[15px] leading-snug text-cream/62">{t(fact.text)}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* (01) The donation, step by step */}
      <section className="on-night pb-24 sm:pb-32" aria-labelledby="visit-heading">
        <div className="wide grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionLabel n={1}>The donation</SectionLabel>
            <Headline id="visit-heading" className="mt-5" lead="One visit, about an hour," rest="step by step." />
            <p className="mt-6 max-w-md text-[17px] leading-relaxed text-cream/65">
              {t("Eat a light meal, drink water and carry a photo ID. Most of the visit is checks and rest; the donation itself takes about 10–15 minutes.")}
            </p>
            <p className="display-lg mt-10 flex items-center gap-4 text-crimson tabular-nums">
              0:00 <ArrowRight className="size-8 text-cream/40" aria-hidden="true" /> 1:00
            </p>
            <p className="label-mono mt-4 text-cream/50">{t("A typical whole blood visit")}</p>
          </div>
          <div>
            <ol className="border-t border-white/10">
              {VISIT.map((step) => (
                <li key={step.at} className="reveal grid grid-cols-[3.5rem_1fr] items-baseline gap-x-4 gap-y-1 border-b border-white/10 py-5 sm:grid-cols-[4.5rem_1fr_auto] sm:py-6">
                  <span className="label-mono text-cream/60 tabular-nums">{step.at}</span>
                  <span className="text-lg leading-snug font-medium sm:text-[1.4rem]">{t(step.title)}</span>
                  <span className="label-mono col-start-2 text-cream/50 sm:col-start-auto sm:text-right">{t(step.takes)}</span>
                </li>
              ))}
            </ol>
            <div className="reveal mt-4 flex flex-col gap-2 rounded-[1.25rem] bg-primary px-6 py-5 text-white sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xl font-medium sm:text-2xl">{t("You leave in about an hour")}</p>
              <p className="label-mono text-white/85">{t("Then log it in your profile")}</p>
            </div>
            <p className="label-mono mt-5 text-cream/45">{t("Times are typical and vary by centre.")}</p>
          </div>
        </div>
      </section>

      {/* (02) How it works */}
      <section className="on-cream section" aria-labelledby="parts-heading">
        <div className="wide">
          <SectionLabel n={2}>How it works</SectionLabel>
          <div className="mt-5 flex flex-wrap items-end justify-between gap-6">
            <Headline id="parts-heading" lead="Four parts." rest="One response." />
            <ArrowLink href="/about" tone="night">
              {t("How we work")}
            </ArrowLink>
          </div>
          <ol className="mt-14 border-t border-navy/12">
            {PARTS.map((part, i) => (
              <li key={part.title} className="reveal grid gap-x-8 gap-y-4 border-b border-navy/12 py-8 md:grid-cols-[3rem_16rem_1fr] md:py-10">
                <span className="label-mono pt-2 text-navy/45 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="text-2xl font-medium tracking-[-0.03em] sm:text-[1.75rem]">{t(part.title)}</h3>
                  <p className="label-mono mt-3 text-primary">{t(part.note)}</p>
                </div>
                <ul className="grid gap-x-8 gap-y-3 pt-1 sm:grid-cols-2">
                  {part.items.map((item) => (
                    <li key={item} className="flex gap-3 text-[16px] leading-snug text-navy/80">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                      {t(item)}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* (03) Can I donate? */}
      <section className="on-cream pb-24 sm:pb-32" aria-labelledby="check-heading">
        <div className="wide grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <SectionLabel n={3}>Can I donate?</SectionLabel>
            <Headline id="check-heading" className="mt-5" lead="Pick a check." rest="See where you sit." />
            <p className="mt-6 max-w-md text-[17px] leading-relaxed text-muted-foreground">
              {t("Blood centres look at a few simple things before every donation. Here are the usual ranges in India, the same ones on our eligibility page.")}
            </p>
          </div>
          <EligibilityExplorer className="reveal" />
        </div>
      </section>

      {/* (04) Blood groups */}
      <section className="on-night section" aria-labelledby="groups-heading">
        <div className="wide">
          <div className="photo-panel px-6 py-12 sm:px-12 sm:py-16 lg:px-16">
            <Image src={PHOTOS.redCells.src} alt="" fill sizes="(min-width: 1400px) 1336px, 100vw" className="-z-10 object-cover" />
            <div aria-hidden="true" className="photo-wash absolute inset-0 -z-10" />
            <div aria-hidden="true" className="absolute inset-0 -z-10 bg-night/35" />
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <SectionLabel n={4}>Blood groups</SectionLabel>
                <Headline id="groups-heading" className="mt-5" lead="Nine blood groups." rest="One community." />
                <p className="mt-6 max-w-md text-[17px] leading-relaxed text-cream/75">
                  {t("Register yours once. Volunteers reach the right donors faster, and your number stays private.")}
                </p>
                <ul className="mt-8 flex flex-wrap gap-2" aria-label={t("Blood groups, including the rare Bombay group")}>
                  {BLOOD_GROUPS.map((group) => (
                    <li key={group}>
                      <BloodGroupChip group={group} size="md" tone={group === "Oh" ? "outline" : "solid"} />
                    </li>
                  ))}
                </ul>
                <div className="glass mt-8 max-w-md p-5">
                  <p className="flex items-center justify-between gap-3">
                    <span className="text-lg font-medium">{t("Bombay blood group (Oh)")}</span>
                    <span className="label-mono text-blush">{t("Rare")}</span>
                  </p>
                  <p className="mt-2 text-[15px] leading-relaxed text-cream/75">
                    {t("Rare, and easily mistaken for O in routine tests. People with Oh can receive only Oh blood, so every Oh donor counts.")}
                  </p>
                </div>
                <ul className="label-mono mt-8 space-y-2.5 text-cream/80">
                  <li>→ {t("Requests matched to the exact group")}</li>
                  <li>→ {t("Hospitals cross-match before every transfusion")}</li>
                </ul>
              </div>
              <GroupOrbit />
            </div>
          </div>
        </div>
      </section>

      {/* (05) Who we are */}
      <section className="on-cream section" aria-labelledby="team-heading">
        <div className="wide">
          <SectionLabel n={5}>Who we are</SectionLabel>
          <blockquote className="display-md mt-8 max-w-5xl text-navy">
            <p>
              “
              {quote.split(" ").map((word, i, words) => (
                <span key={i} className="ink-word">
                  {word}
                  {i < words.length - 1 ? " " : ""}
                </span>
              ))}
              ”
            </p>
          </blockquote>
          <div className="mt-8 flex items-center gap-4">
            <span className="grid size-14 place-items-center rounded-full bg-night">
              <LogoMark size="xs" />
            </span>
            <div>
              <p className="text-lg font-medium">{t("Rakt Response Team")}</p>
              <p className="label-mono mt-1.5 text-muted-foreground">{t("Volunteers · India · Since 2026")}</p>
            </div>
          </div>
          <h2 id="team-heading" className="sr-only">
            {t("The team")}
          </h2>
          <ul className="mt-14 grid gap-4 sm:mt-16 sm:grid-cols-3">
            {CORE_TEAM.map((name, i) => (
              <li key={name} className="reveal flex items-center gap-4 sm:block">
                <div
                  className={`relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-[1.25rem] sm:aspect-[4/3] sm:size-auto sm:rounded-[1.5rem] ${i === 1 ? "cover-red" : "cover-navy"}`}
                >
                  <span className="text-3xl leading-none font-medium tracking-[-0.06em] text-cream/95 sm:text-[5.5rem]" aria-hidden="true">
                    {initials(name)}
                  </span>
                </div>
                <div>
                  <p className="text-xl font-medium tracking-[-0.02em] sm:mt-4">{name}</p>
                  <p className="label-mono mt-2 text-muted-foreground">{t("Core team · Volunteer")}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* (06) Two ways to help */}
      <section className="on-night section" aria-labelledby="help-heading">
        <div className="wide">
          <SectionLabel n={6}>Two ways to help</SectionLabel>
          <Headline id="help-heading" className="mt-5" lead="Give blood." rest="Or ask for it." />
          <div className="mt-12 grid gap-4 lg:grid-cols-2">
            <article className="reveal flex flex-col rounded-[1.75rem] border border-white/12 p-7 sm:p-9">
              <h3 className="text-2xl font-medium sm:text-3xl">{t("Become a donor")}</h3>
              <p className="mt-3 text-cream/65">{t("For anyone aged 18–65 who wants to help.")}</p>
              <p className="mt-8 flex items-baseline gap-3 border-b border-white/10 pb-8">
                <span className="display-lg">{t("Free")}</span>
                <span className="label-mono text-cream/55">{t("Always")}</span>
              </p>
              <ul className="mt-7 space-y-3.5">
                {DONOR_POINTS.map((point) => (
                  <li key={point} className="flex gap-3 text-[16px]">
                    <Check className="mt-0.5 size-4 shrink-0 text-blush" aria-hidden="true" />
                    {t(point)}
                  </li>
                ))}
              </ul>
              <ArrowLink href="/register" tone="cream" className="mt-10 self-start">
                {t("Become a Donor")}
              </ArrowLink>
            </article>
            <article className="reveal flex flex-col rounded-[1.75rem] bg-primary p-7 text-white sm:p-9">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h3 className="text-2xl font-medium text-white sm:text-3xl">{t("Need blood?")}</h3>
                <span className="label-mono rounded-full bg-night px-3 py-2 text-cream">{t("Emergency? Call the hospital first")}</span>
              </div>
              <p className="mt-3 text-white/80">{t("For patients' families and hospitals.")}</p>
              <p className="mt-8 flex items-baseline gap-3 border-b border-white/20 pb-8">
                <span className="display-lg">{t("Free")}</span>
                <span className="label-mono text-white/70">{t("Always")}</span>
              </p>
              <ul className="mt-7 space-y-3.5">
                {REQUEST_POINTS.map((point) => (
                  <li key={point} className="flex gap-3 text-[16px]">
                    <Check className="mt-0.5 size-4 shrink-0 text-white" aria-hidden="true" />
                    {t(point)}
                  </li>
                ))}
              </ul>
              <ArrowLink href="/blood-requests/new" tone="night" className="mt-10 self-start">
                {t("Request blood")}
              </ArrowLink>
            </article>
          </div>

          {SHOW_SAMPLES ? (
            <div className="mt-16 border-t border-white/10 pt-12">
              <ul className="grid gap-10 md:grid-cols-3 md:gap-8">
                {SAMPLE_TESTIMONIALS.map((item) => (
                  <li key={item.name} className="reveal">
                    <figure>
                      <figcaption className="flex items-center gap-3">
                        <span className="label-mono grid size-9 shrink-0 place-items-center rounded-full bg-white/10 text-cream" aria-hidden="true">
                          {initials(item.name)}
                        </span>
                        <span className="label-mono text-cream/60">
                          {item.name} · {item.role[locale]} · {item.city}
                        </span>
                      </figcaption>
                      <blockquote className="mt-5 text-xl leading-snug font-medium tracking-[-0.02em]">{item.quote[locale]}</blockquote>
                      <p className="label-mono mt-4 text-blush">{t("Sample")}</p>
                    </figure>
                  </li>
                ))}
              </ul>
              <p className="mt-10 text-sm text-cream/50">{t("These are sample quotes. Real ones will replace them as people share their experiences.")}</p>
            </div>
          ) : null}

          <ImpactStrip metrics={metrics} t={t} />
        </div>
      </section>

      {/* (07) Stories */}
      <section className="on-cream section" aria-labelledby="stories-heading">
        <div className="wide">
          <SectionLabel n={7}>Stories</SectionLabel>
          <div className="mt-5 flex flex-wrap items-end justify-between gap-6">
            <Headline id="stories-heading" lead="Stories from our community." rest="In their own words." />
            <ArrowLink href="/stories" tone="night">
              {t("All stories")}
            </ArrowLink>
          </div>
          <div className="mt-14 grid gap-x-6 gap-y-12 md:grid-cols-3">
            {realStories.length
              ? realStories.map((story) => <StoryTile key={story.slug} story={{ kind: "real", story }} />)
              : sampleStories.map((story) => <StoryTile key={story.slug} story={{ kind: "sample", story, photo: SAMPLE_PHOTOS[story.slug] }} />)}
          </div>
          {realStories.length === 0 ? (
            <div className="mt-12 flex flex-col gap-5 border-t border-navy/12 pt-8 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                {sampleStories.length ? t("Sample stories, shown until real ones are published.") : t("No stories published yet")}
              </p>
              <ArrowLink href="/share-your-story" tone="line">
                {t("Share your story")}
              </ArrowLink>
            </div>
          ) : null}
        </div>
      </section>

      {/* (08) Questions */}
      <section className="on-cream pb-24 sm:pb-32" aria-labelledby="faq-heading">
        <div className="wide grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionLabel n={8}>Questions</SectionLabel>
            <Headline id="faq-heading" className="mt-5" size="md" lead="Asked before every first donation." />
            <p className="mt-5 max-w-sm text-[17px] leading-relaxed text-muted-foreground">{t("Anything else? Ask us. A volunteer replies, usually within a day.")}</p>
            <div className="mt-8 flex flex-wrap gap-2.5">
              <ArrowLink href="/contact" tone="night">
                {t("Ask a question")}
              </ArrowLink>
              <ArrowLink href="/faq" tone="line" arrow={false}>
                {t("All FAQs")}
              </ArrowLink>
            </div>
          </div>
          <div className="border-t border-navy/12">
            {QUESTIONS.map((item) => (
              <details key={item.q} className="group border-b border-navy/12">
                <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 text-lg font-medium sm:text-xl [&::-webkit-details-marker]:hidden">
                  {t(item.q)}
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-navy/6 transition-transform duration-300 group-open:rotate-45" aria-hidden="true">
                    <Plus className="size-4" />
                  </span>
                </summary>
                <p className="max-w-2xl pb-6 text-[16px] leading-relaxed text-muted-foreground">{t(item.a)}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* (09) Talk to us */}
      <section className="on-night pt-24 sm:pt-32" aria-labelledby="talk-heading">
        <div className="wide">
          <div className="photo-panel px-6 py-12 sm:px-12 sm:py-16 lg:px-16 lg:py-20">
            <Image src={PHOTOS.holdingHand.src} alt="" fill sizes="(min-width: 1400px) 1336px, 100vw" className="-z-10 object-cover object-[60%_50%]" />
            <div aria-hidden="true" className="photo-wash absolute inset-0 -z-10" />
            <div className="max-w-2xl">
              <SectionLabel n={9}>Talk to us</SectionLabel>
              <Headline id="talk-heading" className="mt-5" lead="Talk to a person." rest="Not a form." />
              <p className="mt-6 max-w-lg text-[17px] leading-relaxed text-cream/75">
                {t("Call or message the team. For anything urgent, call the hospital first.")}
              </p>
              <ContactPeople className="mt-9" />
              <p className="label-mono mt-8 text-cream/60">{t("In an emergency call 112, or go to the nearest hospital")}</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/** Live figures from verified records, or a plain note when they can't be read. */
function ImpactStrip({ metrics, t }: { metrics: ImpactMetrics | null; t: TFunction }) {
  return (
    <div className="mt-16 rounded-[1.75rem] border border-white/12 p-6 sm:p-9">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="label-mono text-blush">{t("Live from our records")}</p>
        <Link href="/impact" className="label-mono inline-flex min-h-11 items-center gap-1.5 text-cream/70 hover:text-cream">
          {t("Our Impact")} <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>
      {metrics ? (
        <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
          {IMPACT_KEYS.map(({ key, label }) => (
            <li key={key}>
              <p className="text-4xl font-medium tracking-[-0.04em] tabular-nums">{formatNumber(Number(metrics[key] ?? 0))}</p>
              <p className="label-mono mt-3 leading-snug text-cream/55">{t(label)}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 text-cream/70">{t("Live figures are not available right now")}</p>
      )}
      <p className="mt-8 text-sm text-cream/50">{t("Counted live from verified records. Never estimated.")}</p>
    </div>
  );
}
