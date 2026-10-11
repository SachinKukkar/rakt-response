import Link from "next/link";
import {
  Ambulance,
  ArrowRight,
  Baby,
  BellRing,
  ClipboardCheck,
  HandHeart,
  HeartPulse,
  Hospital,
  Lock,
  MessageSquareQuote,
  Microscope,
  RefreshCcw,
  ShieldCheck,
  Stethoscope,
  UserPlus,
  UserRoundCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/brand/logo";
import { BloodGroupChip } from "@/components/common/blood-group-chip";
import { EmptyState, Notice, SectionHeading } from "@/components/common/page-parts";
import { ImpactStats } from "@/components/impact/impact-stats";
import { StoryCard } from "@/components/stories/story-parts";
import { BLOOD_GROUPS, SITE } from "@/lib/constants";
import { getImpactMetrics, listPublishedStories } from "@/lib/data/public";

// Public statistics and stories are refreshed every 5 minutes.
export const revalidate = 300;

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
  const [metrics, stories] = await Promise.all([getImpactMetrics(), listPublishedStories(null, 3)]);

  return (
    <>
      {/* 1. Hero */}
      <section className="hero-glow overflow-hidden">
        <div className="page-container grid items-center gap-8 py-10 sm:py-14 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
          <div className="space-y-5">
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white px-3 py-1 text-xs font-semibold text-primary shadow-sm">
              <ShieldCheck className="size-3.5" aria-hidden="true" /> Rakt Response Team · Voluntary blood donors
            </p>
            <h1 className="text-[2rem] leading-[1.1] font-extrabold sm:text-5xl">
              Every Donor Matters. <span className="text-primary">Every Response</span> Can Save a Life.
            </h1>
            <p className="max-w-xl text-base text-muted-foreground sm:text-lg">{SITE.description}</p>
            <div className="flex flex-col gap-3 min-[380px]:flex-row">
              <Button asChild size="lg">
                <Link href="/register">
                  Become a Donor <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-navy/20 bg-white">
                <Link href="/blood-requests">Find Blood</Link>
              </Button>
            </div>
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <Lock className="size-4 text-navy" aria-hidden="true" /> Private by default
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-navy" aria-hidden="true" /> Requests verified by volunteers
              </li>
              <li className="flex items-center gap-1.5">
                <HandHeart className="size-4 text-navy" aria-hidden="true" /> Free & voluntary
              </li>
            </ul>
          </div>
          <div className="relative mx-auto grid size-72 place-items-center sm:size-96" aria-hidden="true">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent to-white shadow-inner" />
            <div className="absolute inset-6 rounded-full border-2 border-dashed border-primary/15" />
            <LogoMark size="xl" priority className="relative shadow-xl shadow-primary/15" />
            {/* The drops orbit the logo; each counter-rotates so its label stays upright. */}
            <div className="animate-orbit absolute inset-0 [--orbit-r:122px] sm:[--orbit-r:166px]">
              {(["A+", "O-", "AB-", "B+"] as const).map((group, i) => (
                <div
                  key={group}
                  className="absolute top-1/2 left-1/2 -mt-[18px] -ml-[18px]"
                  style={{ transform: `rotate(${i * 90 - 45}deg) translateY(calc(var(--orbit-r) * -1)) rotate(${45 - i * 90}deg)` }}
                >
                  <div className="animate-orbit-reverse">
                    <BloodGroupChip group={group} size="sm" tone={i % 2 ? "outline" : "solid"} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. How it works */}
      <section className="page-container py-10 sm:py-14" aria-labelledby="how-heading">
        <SectionHeading
          id="how-heading" title="How Rakt Response works" description="Simple steps, with you in control of your information." />
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className="surface flex gap-3 p-3.5 sm:p-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-accent text-primary sm:size-11">
                <step.icon className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-bold text-primary">Step {i + 1}</p>
                <p className="font-semibold text-navy">{step.title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* 3. Why it matters */}
      <section className="bg-white py-10 sm:py-14" aria-labelledby="why-heading">
        <div className="page-container">
          <SectionHeading
          id="why-heading"
            title="Why blood donation matters"
            description="Blood and its components cannot be manufactured. Hospitals rely on voluntary donors."
            action={
              <Link href="/why-donate" className="hidden shrink-0 text-sm font-semibold text-primary hover:underline sm:inline">
                Learn more
              </Link>
            }
          />
          <ul className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-5">
            {NEED.map((item) => (
              <li key={item.title} className="surface-tint p-4">
                <item.icon className="mb-2 size-6 text-primary" aria-hidden="true" />
                <p className="font-semibold text-navy">{item.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.text}</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">
            Whether, when and what to transfuse is always decided by the treating doctors and licensed blood banks.
          </p>
          <Link href="/why-donate" className="mt-3 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-primary sm:hidden">
            Learn why donation matters <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* 4. Types of donation */}
      <section className="page-container py-10 sm:py-14" aria-labelledby="types-heading">
        <h2 id="types-heading" className="mb-1 text-lg font-bold sm:text-xl">
          Types of donation
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">Different procedures, different checks and intervals — they are not interchangeable.</p>
        <div className="grid gap-3 md:grid-cols-3">
          <article className="surface p-5">
            <p className="text-xs font-bold tracking-wide text-primary uppercase">Most common</p>
            <h3 className="mt-1 text-lg font-bold">Whole blood</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              A single donation collected in a bag, usually in about 10–15 minutes. The blood centre can separate it into red cells,
              plasma and platelets.
            </p>
          </article>
          <article className="surface border-primary/20 p-5">
            <p className="text-xs font-bold tracking-wide text-primary uppercase">Platelets</p>
            <h3 className="mt-1 text-lg font-bold">SDP — single donor platelets</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              A machine collects platelets and returns the rest of your blood. Sessions take longer and need extra checks at an
              apheresis centre. Often requested for cancer and dengue care.
            </p>
          </article>
          <article className="surface p-5">
            <p className="text-xs font-bold tracking-wide text-primary uppercase">Specialised</p>
            <h3 className="mt-1 text-lg font-bold">Other apheresis</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Some centres collect plasma or other specific components by apheresis. Availability and criteria vary by centre.
            </p>
          </article>
        </div>
        <Link href="/donation-types" className="mt-4 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-primary hover:underline">
          Compare donation types <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </section>

      {/* 5. Blood groups */}
      <section className="bg-white py-10 sm:py-14" aria-labelledby="groups-heading">
        <div className="page-container grid gap-6 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 id="groups-heading" className="text-lg font-bold sm:text-xl">
              Blood groups
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Knowing your group helps volunteers reach the right donors faster. Compatibility depends on more than the ABO and Rh
              group: hospitals always cross-match in the laboratory before a transfusion. Transfusion decisions belong to qualified
              healthcare professionals and licensed blood banks.
            </p>
          </div>
          <ul className="grid grid-cols-4 gap-3" aria-label="The eight main blood groups">
            {BLOOD_GROUPS.map((group) => (
              <li key={group} className="surface grid place-items-center py-4">
                <BloodGroupChip group={group} size="md" />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 6. Community impact */}
      <section className="page-container py-10 sm:py-14" aria-labelledby="impact-heading">
        <SectionHeading
          id="impact-heading"
          title="Community impact"
          description="Calculated live from platform records. Unverified data is never counted as verified."
          action={
            <Link href="/impact" className="shrink-0 text-sm font-semibold text-primary hover:underline">
              Our Impact
            </Link>
          }
        />
        <ImpactStats metrics={metrics} />
      </section>

      {/* 7. Stories */}
      <section className="bg-white py-10 sm:py-14" aria-labelledby="stories-heading">
        <div className="page-container">
          <SectionHeading
          id="stories-heading"
            title="Stories from our community"
            description="Real experiences, published only with each contributor's consent."
            action={
              <Link href="/stories" className="shrink-0 text-sm font-semibold text-primary hover:underline">
                All stories
              </Link>
            }
          />
          {stories && stories.stories.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {stories.stories.map((story) => (
                <StoryCard key={story.slug} story={story} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={MessageSquareQuote}
              title="No stories published yet"
              description="Stories appear here after contributors share them and our team reviews them with their consent."
              action={
                <Button asChild variant="outline">
                  <Link href="/share-your-story">Share your story</Link>
                </Button>
              }
            />
          )}
        </div>
      </section>

      {/* 8. Preparation & aftercare */}
      <section className="page-container py-10 sm:py-14" aria-labelledby="prep-heading">
        <h2 id="prep-heading" className="mb-4 text-lg font-bold sm:text-xl">
          Preparing to donate &amp; aftercare
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="surface p-5">
            <h3 className="font-bold">Before you donate</h3>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
              <li>Sleep well and eat a regular meal beforehand.</li>
              <li>Drink plenty of water; avoid alcohol the day before.</li>
              <li>Carry a photo ID and tell staff about any medicines.</li>
              <li>Answer the screening questions honestly — it keeps everyone safe.</li>
            </ul>
          </div>
          <div className="surface p-5">
            <h3 className="font-bold">After you donate</h3>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
              <li>Rest for 10–15 minutes and have the refreshments offered.</li>
              <li>Drink extra fluids and avoid heavy exercise for the rest of the day.</li>
              <li>If you feel faint, lie down with your legs raised and tell staff.</li>
              <li>Contact the blood centre if you feel unwell later.</li>
            </ul>
          </div>
        </div>
        <Link href="/donation-process" className="mt-4 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-primary hover:underline">
          What to expect at the centre <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </section>

      {/* 9. FAQ preview */}
      <section className="bg-white py-10 sm:py-14" aria-labelledby="faq-heading">
        <div className="page-container">
          <SectionHeading
          id="faq-heading"
            title="Frequently asked questions"
            action={
              <Link href="/faq" className="shrink-0 text-sm font-semibold text-primary hover:underline">
                All FAQs
              </Link>
            }
          />
          <div className="grid gap-3 md:grid-cols-2">
            {FAQ_PREVIEW.map((item) => (
              <details key={item.q} className="surface group p-4">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 font-semibold text-navy">
                  {item.q}
                  <span className="text-xl text-primary transition-transform group-open:rotate-45" aria-hidden="true">
                    +
                  </span>
                </summary>
                <p className="mt-2 text-sm text-muted-foreground">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Call to action */}
      <section className="page-container py-10 sm:py-14">
        <div className="brand-band overflow-hidden rounded-3xl p-6 text-white sm:p-10">
          <div className="grid items-center gap-6 md:grid-cols-[1fr_auto]">
            <div>
              <p className="text-sm font-semibold text-white/85">{SITE.supporting}</p>
              <h2 className="mt-1 text-2xl font-extrabold text-white sm:text-3xl">Be the response someone is waiting for.</h2>
              <p className="mt-2 max-w-xl text-white/85">
                Join our community of voluntary donors. Your details stay private, and you choose when you can be contacted.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
                <Link href="/register">Become a Donor</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white">
                <Link href="/contact">Contact the team</Link>
              </Button>
            </div>
          </div>
        </div>
        <Notice tone="warning" icon={Hospital} className="mt-4" title="In a medical emergency">
          Contact the treating hospital or the nearest licensed blood bank immediately. Rakt Response helps coordinate voluntary donors
          but cannot reserve blood units or guarantee availability.
        </Notice>
      </section>
    </>
  );
}
