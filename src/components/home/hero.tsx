import Image from "next/image";
import { ArrowLink } from "@/components/site/arrow-link";
import { PHOTOS } from "@/lib/photos";
import { getT } from "@/i18n/server";

const STEPS = ["Register", "Volunteer checks", "You say yes", "Donate, log it"];

/**
 * The photo melting into the brand red, a two-part headline and the four steps.
 * Laptops: photo on the right, words on the red at the left. Phones and tablets:
 * photo on top, words on the red below it.
 */
export async function HomeHero() {
  const t = await getT();
  return (
    <section className="on-night under-header relative isolate overflow-hidden" aria-labelledby="hero-heading">
      <div className="absolute inset-x-0 top-0 -z-10 h-[52svh] lg:inset-y-0 lg:right-0 lg:left-auto lg:h-auto lg:w-[60%]">
        <Image
          src={PHOTOS.hero.src}
          alt={t(PHOTOS.hero.alt)}
          fill
          priority
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="object-cover object-[96%_30%] lg:object-[86%_50%]"
        />
        <div aria-hidden="true" className="hero-shade absolute inset-0" />
      </div>

      {/* Phones: the words start just above the bottom of the photo, where it has already turned red. */}
      <div className="wide relative flex flex-col pt-[calc(52svh-var(--header-h)-3rem)] pb-36 sm:pb-40 lg:min-h-[calc(100svh-var(--header-h))] lg:justify-end lg:pt-8 lg:pb-28">
        <h1 id="hero-heading">
          <span className="display-xl hero-xl block max-w-[12ch]">{t("Every donor matters.")}</span>
          {/* One cream card, the line set in two: full width on phones, as wide as its words on bigger screens. */}
          <span className="display-lg hero-lg mt-4 block w-full rounded-[1.25rem] bg-cream px-4 pt-2 pb-3 text-primary sm:w-fit sm:px-6 sm:pb-4">
            <span className="block">{t("Every response")}</span> <span className="block">{t("can save a life.")}</span>
          </span>
        </h1>
        <div className="mt-8 max-w-xl space-y-7">
          <p className="text-lg leading-snug font-medium sm:text-[1.35rem]">
            {t("Connecting voluntary blood donors with people who need help, one response at a time.")}{" "}
            <span className="text-cream/80">{t("Free, private and checked by volunteers.")}</span>
          </p>
          <div className="flex flex-wrap gap-2.5">
            <ArrowLink href="/register">{t("Become a Donor")}</ArrowLink>
            <ArrowLink href="/blood-requests" tone="ghost">
              {t("Find Blood")}
            </ArrowLink>
          </div>
        </div>
      </div>

      {/* The four steps, filling one after another. */}
      <ol className="wide absolute inset-x-0 bottom-0 grid grid-cols-2 gap-x-4 gap-y-4 pb-7 md:grid-cols-4" aria-label={t("How it works in four steps")}>
        {STEPS.map((step, i) => (
          <li key={step} className="min-w-0">
            <p className="label-mono truncate">
              <span className="text-cream tabular-nums">{String(i + 1).padStart(2, "0")}</span> <span className="text-cream/60">{t(step)}</span>
            </p>
            <span className="mt-3 block h-0.5 overflow-hidden rounded-full bg-white/20">
              <span className="step-bar block h-full bg-cream" style={{ animationName: `step-${i + 1}` }} />
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
