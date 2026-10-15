import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Hospital, Phone } from "lucide-react";
import { MARK_PATH, MARK_VIEWBOX } from "@/components/brand/logo";
import { BloodMatch } from "@/components/home/blood-match";
import { HowItWorks, type Stage } from "@/components/home/how-it-works";
import { ListenButton } from "@/components/home/listen-button";
import { RevealOnScroll } from "@/components/home/reveal";
import { MATCH_GROUPS } from "@/lib/blood-compat";
import { getImpactMetrics, getPublicSettings, listPublishedStories } from "@/lib/data/public";
import { telLink } from "@/lib/contact-links";
import { formatNumber } from "@/lib/format";
import { publicStoryPhotoUrl } from "@/lib/env";
import { getT } from "@/i18n/server";

// Public statistics and stories are refreshed every 5 minutes.
export const revalidate = 300;

/*
 * One motif: the logo's drop-bubble (blood + reply). It is the hero's giant
 * shape, the mask of the hero photograph, the corner of every button and
 * photo frame ("bubble"), and the closing band in the footer.
 * Photographs: real blood donation camps in India from Wikimedia Commons,
 * credited in the footer; they show the world of donation, not our own camps.
 */

const STAGES = [
  { name: "You ask", text: "Fill in a short form or call us. Your request stays private.", photo: "/images/world/camp-registration.jpg", alt: "Volunteers registering donors at a blood donation camp" },
  { name: "We check", text: "A volunteer confirms the need with the hospital before any donor is contacted.", photo: "/images/world/camp-volunteers.jpg", alt: "Volunteers at a blood donation camp" },
  { name: "Donors hear", text: "Donors nearby with the right blood group get a message, only if they agreed to be contacted.", photo: "/images/world/camp-howrah.jpg", alt: "Donors at a blood donation camp" },
  { name: "A donor says yes", text: "Their number is shared only with their consent, and every view is logged.", photo: "/images/world/donor-howrah.jpg", alt: "A donor giving blood at a camp" },
  { name: "Blood is given", text: "At the hospital or a licensed blood bank, where doctors check and cross-match.", photo: "/images/world/donor-care.jpg", alt: "A donor resting while giving blood" },
];

const QUESTIONS = [
  {
    q: "Does it cost anything?",
    a: "No. Rakt Response is free and run by volunteers. Hospitals and blood banks may charge their usual processing fees.",
  },
  {
    q: "Who can see my phone number?",
    a: "No one publicly. An authorised volunteer can view it only while coordinating a verified request, only if you allowed contact — and every access is logged.",
  },
  {
    q: "Does registering mean I'm eligible to donate?",
    a: "No. Eligibility is decided by the blood centre's screening on the day. Rakt Response never makes medical decisions.",
  },
  {
    q: "How often can I give blood?",
    a: "For whole blood, usually a gap of at least three months, and longer for some people. The blood bank decides on the day.",
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

/** About 25 words: a story excerpt set large must stay a short statement. */
function shortQuote(text: string): string {
  if (text.length <= 160) return text;
  return `${text.slice(0, 157).replace(/\s+\S*$/, "")}…`;
}

export default async function HomePage() {
  const [metrics, stories, settings, t] = await Promise.all([getImpactMetrics(), listPublishedStories(null, 1), getPublicSettings(), getT()]);
  const story = stories?.stories[0] ?? null;
  const storyPhoto = story ? publicStoryPhotoUrl(story.photo_path) : null;
  const stages: Stage[] = STAGES.map((s) => ({ ...s, name: t(s.name), text: t(s.text), alt: t(s.alt) }));
  const heroText = `${t("Blood, answered.")} ${t("Volunteers check every blood request, then reach donors near you who have agreed to help.")} ${t("Tap “I need blood” if someone needs blood. Tap “I want to donate” to join as a donor.")}`;

  return (
    <div className="font-display text-[length:var(--step-body)] text-navy">
      <RevealOnScroll />

      {/* Hero: the mark at enormous scale, a real camp photograph inside it. */}
      <section className="relative overflow-hidden" aria-labelledby="hero-heading">
        <div className="page-container relative z-10 grid gap-8 pt-10 pb-6 md:min-h-[calc(100svh-5rem)] md:grid-cols-12 md:content-center md:py-16">
          <div className="hero-in flex flex-col gap-7 md:col-span-7">
            <h1 id="hero-heading" className="text-[length:var(--step-display)] leading-[0.92] font-semibold tracking-[-0.045em]">
              {t("Blood, answered.")}
            </h1>
            <p className="max-w-[34ch] text-[length:var(--step-lead)] leading-[1.35]">
              {t("Volunteers check every blood request, then reach donors near you who have agreed to help.")}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/blood-requests/new"
                className="bubble press inline-flex min-h-16 items-center justify-center gap-3 bg-primary px-7 text-[length:var(--step-body)] font-semibold text-white transition-[background-color] hover:bg-[#a51a29]"
              >
                <Hospital className="size-6" aria-hidden="true" /> {t("I need blood")}
              </Link>
              <Link
                href="/register"
                className="bubble press inline-flex min-h-16 items-center justify-center gap-3 bg-navy px-7 text-[length:var(--step-body)] font-semibold text-white transition-[background-color] hover:bg-[#0f2140]"
              >
                <svg viewBox={MARK_VIEWBOX} className="h-6 w-auto" aria-hidden="true">
                  <path d={MARK_PATH} fill="#ffffff" />
                </svg>
                {t("I want to donate")}
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <ListenButton text={heroText} />
              {settings.contactPhone ? (
                <a href={telLink(settings.contactPhone)} className="bubble press inline-flex min-h-12 items-center gap-2 bg-muted px-5 font-medium hover:bg-navy-soft">
                  <Phone className="size-5" aria-hidden="true" /> {t("Call us")}
                </a>
              ) : null}
            </div>
          </div>
        </div>
        {/* The giant drop enters from the right, cropped by the screen. */}
        <div
          className="pointer-events-none relative mx-auto -mt-4 w-[104vw] max-w-none translate-x-[10vw] md:absolute md:top-[-4vh] md:right-[-7vw] md:mt-0 md:h-[92vh] md:w-auto md:translate-x-0 md:aspect-[86/114]"
          aria-hidden="true"
        >
          <svg viewBox={MARK_VIEWBOX} className="absolute inset-0 h-full w-full">
            <path d={MARK_PATH} className="fill-primary" />
          </svg>
          <div className="drop-mask absolute inset-[7%] overflow-hidden max-md:relative max-md:aspect-[86/114]">
            <Image
              src="/images/world/camp-hall.jpg"
              alt=""
              fill
              priority
              sizes="(min-width: 768px) 60vw, 100vw"
              className="animate-drift object-cover object-[40%_50%]"
            />
          </div>
        </div>
      </section>

      {/* How a request is answered */}
      <section className="page-container py-24 md:py-36" aria-labelledby="how-heading">
        <div className="grid gap-6 md:grid-cols-12 md:gap-8">
          <h2 id="how-heading" data-rise className="text-[length:var(--step-head)] leading-[1] font-semibold tracking-[-0.04em] md:col-span-12 lg:col-span-5">
            {t("How a request is answered")}
          </h2>
          <p data-rise style={{ "--d": "80ms" } as React.CSSProperties} className="max-w-[46ch] self-end text-[length:var(--step-lead)] leading-[1.4] md:col-span-12 lg:col-span-6 lg:col-start-7">
            {t("Five steps, all by volunteers, all free. You can stop at any time.")}
          </p>
        </div>
        <div data-rise style={{ "--d": "160ms" } as React.CSSProperties} className="mt-12 md:mt-16">
          <HowItWorks stages={stages} />
        </div>
      </section>

      {/* The band that splits the page: the promise, in the brand red. */}
      <section className="bg-primary text-white" aria-labelledby="promise-heading">
        <div className="page-container grid items-center gap-10 py-20 md:grid-cols-12 md:py-28">
          <div className="md:col-span-7">
            <h2 id="promise-heading" data-rise className="text-[length:var(--step-head)] leading-[1] font-semibold tracking-[-0.04em] text-white">
              {t("Every request is checked first.")}
            </h2>
            <p data-rise style={{ "--d": "80ms" } as React.CSSProperties} className="mt-6 max-w-[46ch] text-[length:var(--step-lead)] leading-[1.4]">
              {t("No donor is contacted until a volunteer confirms the need with the hospital, and no number is shared without the donor's yes.")}
            </p>
            <Link
              href="/about"
              data-rise
              style={{ "--d": "160ms" } as React.CSSProperties}
              className="press mt-8 inline-flex min-h-12 items-center gap-2 text-[length:var(--step-body)] font-semibold underline-offset-4 hover:underline"
            >
              {t("How we work")} <ArrowRight className="size-5" aria-hidden="true" />
            </Link>
          </div>
          <div data-rise style={{ "--d": "120ms" } as React.CSSProperties} className="relative aspect-[4/3] overflow-hidden bubble md:col-span-5">
            <Image src="/images/world/camp-registration.jpg" alt={t("Volunteers registering donors at a blood donation camp")} fill sizes="(min-width: 768px) 40vw, 90vw" className="object-cover" />
          </div>
        </div>
      </section>

      {/* The live thing: tap a blood group. */}
      <section className="page-container py-24 md:py-36" aria-label={t("Blood group match")}>
        <div data-rise>
          <BloodMatch />
        </div>
      </section>

      {/* Numbers from the records, on stepped tiles. */}
      {metrics ? (
        <section className="page-container pb-24 md:pb-36" aria-labelledby="numbers-heading">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-12 md:items-start">
            <div data-rise className="bubble col-span-2 flex min-h-[56vw] flex-col justify-between bg-primary p-7 text-white md:col-span-6 md:min-h-[70vh]">
              <p className="text-[length:var(--step-display)] leading-[0.9] font-semibold tracking-[-0.05em]">{formatNumber(metrics.registered_donors)}</p>
              <p className="max-w-[24ch] text-[length:var(--step-body)]">{t("donors have registered")}</p>
            </div>
            <div className="col-span-2 grid grid-cols-2 gap-2 md:col-span-6 md:grid-cols-6">
              <h2 id="numbers-heading" className="col-span-2 pt-2 pb-4 text-[length:var(--step-lead)] leading-[1.1] font-semibold tracking-[-0.02em] md:col-span-6 md:pt-[6vh] md:pb-8">
                {t("From our records, counted live")}
              </h2>
              <div data-rise style={{ "--d": "80ms" } as React.CSSProperties} className="bubble flex min-h-44 flex-col justify-between bg-navy p-6 text-white md:col-span-3 md:min-h-[44vh]">
                <p className="text-[length:var(--step-head)] leading-[0.9] font-semibold tracking-[-0.05em]">{formatNumber(metrics.verified_donors)}</p>
                <p className="text-[length:var(--step-body)]">{t("verified donors")}</p>
              </div>
              <div data-rise style={{ "--d": "160ms" } as React.CSSProperties} className="bubble mt-8 flex min-h-44 flex-col justify-between bg-muted p-6 md:col-span-3 md:mt-[12vh] md:min-h-[34vh]">
                <p className="text-[length:var(--step-head)] leading-[0.9] font-semibold tracking-[-0.05em]">{formatNumber(metrics.requests_fulfilled)}</p>
                <p className="text-[length:var(--step-body)]">{t("requests fulfilled")}</p>
              </div>
            </div>
          </div>
          <p className="mt-6 max-w-[60ch] text-[length:var(--step-small)] text-muted-foreground">{t("Nothing here is estimated. Unverified records are never counted as verified.")}</p>
        </section>
      ) : null}

      {/* A real story, or an invitation to share one. */}
      <section className="bg-muted py-24 md:py-36" aria-labelledby="story-heading">
        <div className="page-container grid gap-10 md:grid-cols-12">
          <div data-rise className="relative aspect-[3/4] w-[72%] overflow-hidden bubble md:col-span-4 md:col-start-2 md:w-full">
            <Image
              src={storyPhoto ?? "/images/world/donor-care.jpg"}
              alt={storyPhoto ? t("Photo shared by the contributor") : t("A donor resting while giving blood")}
              fill
              sizes="(min-width: 768px) 33vw, 72vw"
              className="object-cover"
            />
          </div>
          <div className="md:col-span-6 md:col-start-7 md:pt-28">
            {story ? (
              <>
                <h2 id="story-heading" className="sr-only">
                  {t("A story from our community")}
                </h2>
                <blockquote data-rise className="max-w-[30ch] text-[length:var(--step-lead)] leading-[1.3] font-medium tracking-[-0.01em]">
                  “{shortQuote(story.excerpt)}”
                </blockquote>
                <p data-rise style={{ "--d": "80ms" } as React.CSSProperties} className="mt-8 text-[length:var(--step-body)]">
                  {story.display_name ?? t("Shared with consent")}
                  {story.city ? `, ${story.city}` : ""}
                </p>
                <Link href={`/stories/${story.slug}`} className="press mt-6 inline-flex min-h-12 items-center gap-2 text-[length:var(--step-body)] font-semibold text-primary underline-offset-4 hover:underline">
                  {t("Read the story")} <ArrowRight className="size-5" aria-hidden="true" />
                </Link>
                <div className="relative mt-16 ml-auto aspect-square w-[44%] overflow-hidden bubble md:w-[36%]">
                  <Image src="/images/world/camp-howrah.jpg" alt={t("Donors at a blood donation camp")} fill sizes="(min-width: 768px) 16vw, 44vw" className="object-cover" />
                </div>
              </>
            ) : (
              <>
                <h2 id="story-heading" data-rise className="max-w-[18ch] text-[length:var(--step-head)] leading-[1] font-semibold tracking-[-0.04em]">
                  {t("Your story could help someone decide.")}
                </h2>
                <Link href="/share-your-story" className="bubble press mt-8 inline-flex min-h-14 items-center gap-2 bg-navy px-6 text-[length:var(--step-body)] font-semibold text-white hover:bg-[#0f2140]">
                  {t("Share your story")} <ArrowRight className="size-5" aria-hidden="true" />
                </Link>
                <div className="relative mt-16 ml-auto aspect-square w-[44%] overflow-hidden bubble md:w-[36%]">
                  <Image src="/images/world/camp-howrah.jpg" alt={t("Donors at a blood donation camp")} fill sizes="(min-width: 768px) 16vw, 44vw" className="object-cover" />
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Questions, with the heading held in place while the answers scroll. */}
      <section className="page-container py-24 md:py-36" aria-labelledby="faq-heading">
        <div className="grid gap-8 md:grid-cols-12">
          <div className="md:col-span-12 lg:col-span-4">
            <h2 id="faq-heading" className="text-[length:var(--step-head)] leading-[1] font-semibold tracking-[-0.04em] lg:sticky lg:top-28">
              {t("Questions people ask")}
            </h2>
          </div>
          <div className="flex flex-col gap-2 md:col-span-12 lg:col-span-8">
            {QUESTIONS.map((item, i) => (
              <details key={item.q} name="home-faq" data-rise style={{ "--d": `${i * 60}ms` } as React.CSSProperties} className="group bubble bg-muted transition-colors open:bg-primary open:text-white">
                <summary className="flex min-h-[4.5rem] cursor-pointer list-none items-center justify-between gap-4 px-6 py-4 text-[length:var(--step-body)] font-semibold">
                  {t(item.q)}
                  <span className="relative size-4 shrink-0" aria-hidden="true">
                    <span className="absolute top-[6.5px] left-0 h-[3px] w-4 bg-current" />
                    <span className="absolute top-[6.5px] left-0 h-[3px] w-4 rotate-90 bg-current transition-transform group-open:rotate-0" />
                  </span>
                </summary>
                <p className="max-w-[52ch] px-6 pb-6 text-[length:var(--step-body)] leading-[1.55]">{t(item.a)}</p>
              </details>
            ))}
            <Link href="/faq" className="press mt-4 inline-flex min-h-12 items-center gap-2 text-[length:var(--step-body)] font-semibold text-primary underline-offset-4 hover:underline">
              {t("All questions")} <ArrowRight className="size-5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* The close: a sentence with a blank. */}
      <section className="page-container pb-24 md:pb-36" aria-labelledby="pledge-heading">
        <h2 id="pledge-heading" className="sr-only">
          {t("Become a donor")}
        </h2>
        <form action="/register" method="get" className="text-[length:var(--step-head)] leading-[1.1] font-semibold tracking-[-0.04em]">
          <span data-rise className="block">
            {t("I'm")}{" "}
            <label className="sr-only" htmlFor="pledge-group">
              {t("Your blood group")}
            </label>
            <select
              id="pledge-group"
              name="group"
              defaultValue="O+"
              className="bubble inline-block h-[1.1em] w-[2.6em] cursor-pointer appearance-none bg-muted px-[0.2em] text-center align-baseline text-primary"
            >
              {MATCH_GROUPS.map((g) => (
                <option key={g} value={g}>
                  {g.replace("-", "−")}
                </option>
              ))}
            </select>
          </span>
          <span data-rise style={{ "--d": "80ms" } as React.CSSProperties} className="block">
            {t("and I'll")}{" "}
            <button type="submit" className="bubble press bg-primary px-[0.3em] text-white hover:bg-[#a51a29]">
              {t("answer.")}
            </button>
          </span>
        </form>
        <p className="mt-6 max-w-[56ch] text-[length:var(--step-body)]">{t("Next is a short sign-up. Your details stay private, and you choose when you can be contacted.")}</p>
      </section>
    </div>
  );
}
