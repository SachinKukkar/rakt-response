import Link from "next/link";
import {
  Ambulance,
  ArrowRight,
  Baby,
  BellRing,
  Check,
  ChevronDown,
  ClipboardCheck,
  Droplet,
  FlaskConical,
  HandHeart,
  HeartPulse,
  Hospital,
  Lock,
  MessageSquareQuote,
  Microscope,
  PenLine,
  RefreshCcw,
  ShieldCheck,
  Stethoscope,
  UserPlus,
  UserRoundCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/brand/logo";
import { BloodGroupChip } from "@/components/common/blood-group-chip";
import { EmptyState, Notice, SampleNote, SectionHeading } from "@/components/common/page-parts";
import { ImpactStats } from "@/components/impact/impact-stats";
import { SampleStoryCard, StoryCard } from "@/components/stories/story-parts";
import { TestimonialsSection } from "@/components/stories/testimonials";
import { BLOOD_GROUPS, SITE } from "@/lib/constants";
import { getImpactMetrics, listPublishedStories } from "@/lib/data/public";
import { HOME_SAMPLE_SLUGS, SAMPLE_STORIES, SHOW_SAMPLES } from "@/lib/samples";
import { getT } from "@/i18n/server";

// Public statistics and stories are refreshed every 5 minutes.
export const revalidate = 300;

/** The eight ABO/Rh groups plus the rare Bombay phenotype (written "Oh" or "hh"). */
const ORBIT_GROUPS = BLOOD_GROUPS;
const COMMON_GROUPS = BLOOD_GROUPS.filter((group) => group !== "Oh");

const STEPS = [
  { icon: UserPlus, title: "Register as a voluntary donor", text: "A short, private sign-up. No medical records needed." },
  { icon: UserRoundCheck, title: "Complete your donor profile", text: "Blood group, broad area and how you'd like to be reached." },
  { icon: ClipboardCheck, title: "Record your history and preferences", text: "Add past whole blood and SDP donations — marked self-reported until verified." },
  { icon: BellRing, title: "Receive relevant requests", text: "Only if you opt in: verified requests for your blood group near you." },
  { icon: HandHeart, title: "Connect through authorised volunteers", text: "Contact happens only with your consent, through approved workflows." },
  { icon: RefreshCcw, title: "Update your history after donating", text: "Keep your record current so volunteers respond faster next time." },
];

const NEED = [
  { icon: Ambulance, title: "Emergency care", text: "Accidents and trauma can need blood quickly, before a patient is stable." },
  { icon: Stethoscope, title: "Surgery", text: "Many operations rely on blood being available in case it is needed." },
  { icon: Baby, title: "Maternal care", text: "Heavy bleeding around childbirth can require urgent transfusion." },
  { icon: Microscope, title: "Cancer treatment", text: "Chemotherapy can lower blood counts; platelets are often needed." },
  { icon: HeartPulse, title: "Ongoing conditions", text: "People with conditions such as thalassaemia may need regular transfusions." },
];

const DONATION_KINDS = [
  {
    icon: Droplet,
    tag: "Most common",
    title: "Whole blood",
    text: "A single donation collected in a bag, usually in about 10–15 minutes. The blood centre can separate it into red cells, plasma and platelets.",
  },
  {
    icon: RefreshCcw,
    tag: "Platelets",
    title: "SDP — single donor platelets",
    text: "A machine collects platelets and returns the rest of your blood. Sessions take longer and need extra checks at an apheresis centre. Often requested for cancer and dengue care.",
    featured: true,
  },
  {
    icon: FlaskConical,
    tag: "Specialised",
    title: "Other apheresis",
    text: "Some centres collect plasma or other specific components by apheresis. Availability and criteria vary by centre.",
  },
];

const BEFORE = [
  "Sleep well and eat a regular meal beforehand.",
  "Drink plenty of water; avoid alcohol the day before.",
  "Carry a photo ID and tell staff about any medicines.",
  "Answer the screening questions honestly — it keeps everyone safe.",
];

const AFTER = [
  "Rest for 10–15 minutes and have the refreshments offered.",
  "Drink extra fluids and avoid heavy exercise for the rest of the day.",
  "If you feel faint, lie down with your legs raised and tell staff.",
  "Contact the blood centre if you feel unwell later.",
];

const FAQ_PREVIEW = [
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
    q: "What should I do in an emergency?",
    a: "Contact the treating hospital or the nearest licensed blood bank immediately. You can also submit a request here for volunteer support.",
  },
];

export default async function HomePage() {
  const [metrics, stories, t] = await Promise.all([getImpactMetrics(), listPublishedStories(null, 3), getT()]);
  const realStories = stories?.stories ?? [];
  // Sample stories stand in only while nothing real has been published.
  const sampleStories = realStories.length === 0 && SHOW_SAMPLES ? SAMPLE_STORIES.filter((story) => HOME_SAMPLE_SLUGS.includes(story.slug)) : [];

  return (
    <>
      {/* 1. Hero */}
      <section className="hero-glow overflow-hidden">
        <div className="page-container grid items-center gap-8 py-10 sm:py-14 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
          <div className="space-y-5">
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white px-3 py-1 text-xs font-semibold text-primary shadow-sm">
              <ShieldCheck className="size-3.5" aria-hidden="true" /> Rakt Response Team · {t("Voluntary blood donors")}
            </p>
            <h1 className="text-[2rem] leading-[1.1] font-extrabold sm:text-5xl">
              {t("Every Donor Matters.")} <span className="text-primary">{t("Every Response")}</span> {t("Can Save a Life.")}
            </h1>
            <p className="max-w-xl text-base text-muted-foreground sm:text-lg">{t(SITE.description)}</p>
            <div className="flex flex-col gap-3 min-[380px]:flex-row">
              <Button asChild size="lg">
                <Link href="/register">
                  {t("Become a Donor")} <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-navy/20 bg-white">
                <Link href="/blood-requests">{t("Find Blood")}</Link>
              </Button>
            </div>
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <Lock className="size-4 text-navy" aria-hidden="true" /> {t("Private by default")}
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-navy" aria-hidden="true" /> {t("Requests verified by volunteers")}
              </li>
              <li className="flex items-center gap-1.5">
                <HandHeart className="size-4 text-navy" aria-hidden="true" /> {t("Free & voluntary")}
              </li>
            </ul>
          </div>
          <div className="relative mx-auto grid size-72 place-items-center sm:size-96" aria-hidden="true">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent to-white shadow-inner" />
            <div className="absolute inset-6 rounded-full border-2 border-dashed border-primary/15" />
            <LogoMark size="xl" priority className="relative shadow-xl shadow-primary/15" />
            {/* The drops orbit the logo; each counter-rotates so its label stays upright. */}
            <div className="animate-orbit absolute inset-0 [--orbit-r:122px] sm:[--orbit-r:166px]">
              {ORBIT_GROUPS.map((group, i) => {
                const angle = (360 / ORBIT_GROUPS.length) * i;
                return (
                  <div
                    key={group}
                    className="absolute top-1/2 left-1/2 -mt-[18px] -ml-[18px]"
                    style={{ transform: `rotate(${angle}deg) translateY(calc(var(--orbit-r) * -1)) rotate(${-angle}deg)` }}
                  >
                    <div className="animate-orbit-reverse">
                      <BloodGroupChip group={group} size="sm" tone={i % 2 ? "outline" : "solid"} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 2. How it works */}
      <section className="section" aria-labelledby="how-heading">
        <div className="page-container">
          <SectionHeading
            size="lg"
            id="how-heading"
            title="How Rakt Response works"
            description="Simple steps, with you in control of your information."
          />
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {STEPS.map((step, i) => (
              <li key={step.title} className="surface reveal flex flex-col gap-4 p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <span className="icon-tile">
                    <step.icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="font-display text-[2rem] leading-none font-extrabold text-primary/20 tabular-nums" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-primary">{t("Step {n}", { n: i + 1 })}</p>
                  <h3 className="mt-1 text-[17px] leading-snug font-bold">{t(step.title)}</h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-muted-foreground">{t(step.text)}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 3. Why it matters */}
      <section className="section section-paper" aria-labelledby="why-heading">
        <div className="page-container">
          <SectionHeading
            size="lg"
            id="why-heading"
            title="Why blood donation matters"
            description="Blood and its components cannot be manufactured. Hospitals rely on voluntary donors."
            action={
              <Link href="/why-donate" className="hidden min-h-11 shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline sm:inline-flex">
                {t("Learn more")} <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            }
          />
          <ul className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:gap-4 lg:grid-cols-5">
            {NEED.map((item) => (
              <li key={item.title} className="surface reveal p-5">
                <span className="grid size-11 place-items-center rounded-2xl bg-accent text-primary">
                  <item.icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-base font-bold">{t(item.title)}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{t(item.text)}</p>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-xs text-muted-foreground">
            {t("Whether, when and what to transfuse is always decided by the treating doctors and licensed blood banks.")}
          </p>
          <Link href="/why-donate" className="mt-3 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-primary sm:hidden">
            {t("Learn why donation matters")} <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* 4. Types of donation */}
      <section className="section" aria-labelledby="types-heading">
        <div className="page-container">
          <SectionHeading
            size="lg"
            id="types-heading"
            title="Types of donation"
            description="Different procedures, different checks and intervals — they are not interchangeable."
          />
          <div className="grid gap-4 md:grid-cols-3">
            {DONATION_KINDS.map((kind) => (
              <article key={kind.title} className={`surface reveal flex flex-col p-6 ${kind.featured ? "ring-1 ring-primary/25" : ""}`}>
                <div className="flex items-center justify-between gap-3">
                  <span className="icon-tile">
                    <kind.icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="tag">{t(kind.tag)}</span>
                </div>
                <h3 className="mt-5 text-lg font-bold">{t(kind.title)}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{t(kind.text)}</p>
              </article>
            ))}
          </div>
          <Link href="/donation-types" className="mt-5 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-primary hover:underline">
            {t("Compare donation types")} <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* 5. Blood groups */}
      <section className="section section-paper" aria-labelledby="groups-heading">
        <div className="page-container grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-14">
          <div>
            <h2 id="groups-heading" className="font-display text-[1.75rem] leading-[1.1] font-extrabold sm:text-[2.4rem]">
              {t("Blood groups")}
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground sm:text-base">
              {t("Knowing your group helps volunteers reach the right donors faster. Compatibility depends on more than the ABO and Rh group: hospitals always cross-match in the laboratory before a transfusion. Transfusion decisions belong to qualified healthcare professionals and licensed blood banks.")}
            </p>
          </div>
          <ul className="grid grid-cols-4 gap-3" aria-label={t("Blood groups, including the rare Bombay group")}>
            {COMMON_GROUPS.map((group) => (
              <li key={group} className="surface reveal grid place-items-center py-5">
                <BloodGroupChip group={group} size="md" />
              </li>
            ))}
            <li className="surface reveal col-span-4 flex items-center gap-4 p-4 sm:p-5">
              <BloodGroupChip group="Oh" size="lg" />
              <div className="min-w-0">
                <p className="font-bold text-navy">{t("Bombay blood group (Oh)")}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                  {t("Rare, and easily mistaken for O in routine tests. People with Oh can receive only Oh blood, so every Oh donor counts.")}
                </p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* 6. Community impact */}
      <section className="section" aria-labelledby="impact-heading">
        <div className="page-container">
          <SectionHeading
            size="lg"
            id="impact-heading"
            title="Community impact"
            description="Calculated live from platform records. Unverified data is never counted as verified."
            action={
              <Link href="/impact" className="inline-flex min-h-11 shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline">
                {t("Our Impact")} <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            }
          />
          <ImpactStats metrics={metrics} />
        </div>
      </section>

      {/* 7. What people say */}
      <TestimonialsSection className="section-paper" />

      {/* 8. Stories */}
      <section className="section" aria-labelledby="stories-heading">
        <div className="page-container">
          <SectionHeading
            size="lg"
            id="stories-heading"
            title="Stories from our community"
            description={sampleStories.length ? "Donors, families and volunteers, in their own words." : "Real experiences, published only with each contributor's consent."}
            action={
              <Link href="/stories" className="inline-flex min-h-11 shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline">
                {t("All stories")} <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            }
          />
          {realStories.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {realStories.map((story) => (
                <StoryCard key={story.slug} story={story} />
              ))}
            </div>
          ) : sampleStories.length === 0 ? (
            <EmptyState
              icon={MessageSquareQuote}
              title="No stories published yet"
              description="Stories appear here after contributors share them and our team reviews them with their consent."
              action={
                <Button asChild variant="outline">
                  <Link href="/share-your-story">{t("Share your story")}</Link>
                </Button>
              }
            />
          ) : (
            <>
              <ul className="snap-row lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-5 lg:overflow-visible lg:px-0">
                {sampleStories.map((story) => (
                  <li key={story.slug} className="w-[86%] min-[480px]:w-[62%] sm:w-[46%] lg:w-auto">
                    <SampleStoryCard story={story} />
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <SampleNote>Sample stories, shown until real ones are published.</SampleNote>
                <Button asChild variant="outline" className="border-navy/20 bg-white">
                  <Link href="/share-your-story">
                    <PenLine className="size-4" aria-hidden="true" /> {t("Share your story")}
                  </Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* 9. Preparation & aftercare */}
      <section className="section section-paper" aria-labelledby="prep-heading">
        <div className="page-container">
          <SectionHeading size="lg" id="prep-heading" title="Preparing to donate & aftercare" />
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { title: "Before you donate", items: BEFORE },
              { title: "After you donate", items: AFTER },
            ].map((list) => (
              <div key={list.title} className="surface reveal p-6">
                <h3 className="text-lg font-bold">{t(list.title)}</h3>
                <ul className="mt-4 space-y-3">
                  {list.items.map((item) => (
                    <li key={item} className="flex gap-3 text-[15px] leading-snug text-foreground/85">
                      <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-accent text-primary">
                        <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
                      </span>
                      {t(item)}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <Link href="/donation-process" className="mt-5 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-primary hover:underline">
            {t("What to expect at the centre")} <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* 10. FAQ preview */}
      <section className="section" aria-labelledby="faq-heading">
        <div className="page-container">
          <SectionHeading
            size="lg"
            id="faq-heading"
            title="Frequently asked questions"
            action={
              <Link href="/faq" className="inline-flex min-h-11 shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline">
                {t("All FAQs")} <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            }
          />
          <div className="grid gap-3 md:grid-cols-2 md:items-start">
            {FAQ_PREVIEW.map((item) => (
              <details key={item.q} className="surface group overflow-hidden">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-5 py-3 font-semibold text-navy [&::-webkit-details-marker]:hidden">
                  {t(item.q)}
                  <ChevronDown className="size-5 shrink-0 text-primary transition-transform group-open:rotate-180" aria-hidden="true" />
                </summary>
                <p className="border-t border-border/70 px-5 pt-3 pb-5 text-[15px] leading-relaxed text-muted-foreground">{t(item.a)}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 11. Call to action */}
      <section className="page-container pb-14 sm:pb-20">
        <div className="brand-band relative overflow-hidden rounded-[2rem] p-7 text-white sm:p-12">
          <svg viewBox="0 0 48 56" aria-hidden="true" className="pointer-events-none absolute -right-10 -bottom-24 h-80 fill-white/[0.07] sm:h-[26rem]">
            <path d="M24 2C24 2 4 24.5 4 36.5C4 47.3 13 54 24 54C35 54 44 47.3 44 36.5C44 24.5 24 2 24 2Z" />
          </svg>
          <div className="relative grid items-center gap-6 md:grid-cols-[1fr_auto]">
            <div>
              <p className="text-sm font-semibold text-white/85">{t(SITE.supporting)}</p>
              <h2 className="font-display mt-2 text-[1.85rem] leading-tight font-extrabold text-white sm:text-[2.6rem]">{t("Be the response someone is waiting for.")}</h2>
              <p className="mt-3 max-w-xl text-white/85 sm:text-lg">
                {t("Join our community of voluntary donors. Your details stay private, and you choose when you can be contacted.")}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
              <Button asChild size="lg" className="bg-white text-primary shadow-lg shadow-black/10 hover:bg-white/90">
                <Link href="/register">
                  {t("Become a Donor")} <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white">
                <Link href="/contact">{t("Contact the team")}</Link>
              </Button>
            </div>
          </div>
        </div>
        <Notice tone="warning" icon={Hospital} className="mt-4" title="In a medical emergency">
          {t("Contact the treating hospital or the nearest licensed blood bank immediately. Rakt Response helps coordinate voluntary donors but cannot reserve blood units or guarantee availability.")}
        </Notice>
      </section>
    </>
  );
}
