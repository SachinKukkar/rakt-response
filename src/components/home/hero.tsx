import Image from "next/image";
import { ArrowLink } from "@/components/site/arrow-link";
import { DataCard } from "@/components/site/parts";
import { PHOTOS } from "@/lib/photos";
import { getT } from "@/i18n/server";

const STEPS = ["Register", "Volunteer checks", "You say yes", "Donate, log it"];

/** Full-bleed photograph, a two-part headline, floating data cards and the four steps. */
export async function HomeHero() {
  const t = await getT();
  return (
    <section className="on-night under-header relative isolate overflow-hidden" aria-labelledby="hero-heading">
      <Image
        src={PHOTOS.hero.src}
        alt={t(PHOTOS.hero.alt)}
        fill
        priority
        sizes="100vw"
        className="animate-settle -z-20 object-cover object-[24%_45%] sm:object-[45%_50%] lg:object-[60%_50%]"
      />
      {/* Shade only where the words sit, so white text reads and the photo stays bright. */}
      <div aria-hidden="true" className="hero-shade absolute inset-0 -z-10" />

      {/* Floating cards: facts about the two most common donations. */}
      <div aria-hidden="true" className="pointer-events-none absolute top-[calc(var(--header-h)+2.5rem)] right-8 hidden xl:[@media(min-height:740px)]:block">
        <DataCard
          className="animate-float relative right-[19.5rem] w-72"
          label="Whole blood"
          meta="In the chair"
          value="10–15"
          unit="min"
          segments={[1, 2, 1]}
          active={1}
          marker={0.5}
          footLeft="One needle"
          footRight="Sterile kit"
        />
        <DataCard
          className="animate-float absolute top-[-1.5rem] right-0 w-72 [animation-delay:-3s]"
          label="SDP"
          meta="On the machine"
          value="60–90"
          unit="min"
          segments={[1, 2, 1]}
          active={1}
          marker={0.58}
          footLeft="Extra checks"
          footRight="Platelets only"
        />
      </div>

      <div className="wide relative flex min-h-[calc(100svh-var(--header-h))] flex-col justify-end pt-16 pb-36 sm:pb-40">
        <h1 id="hero-heading">
          <span className="display-xl animate-lift block max-w-[12ch] [--d:80]">{t("Every donor matters.")}</span>
          <span className="display-lg animate-lift mt-4 inline-block rounded-[1.25rem] bg-primary px-4 pt-2 pb-3 text-white [--d:260] sm:px-6 sm:pb-4">
            {t("Every response can save a life.")}
          </span>
        </h1>
        <div className="animate-lift mt-8 grid gap-7 [--d:440] lg:grid-cols-[1fr_auto] lg:items-end">
          <p className="max-w-xl text-lg leading-snug font-medium sm:text-[1.35rem]">
            {t("Connecting voluntary blood donors with people who need help, one response at a time.")}{" "}
            <span className="text-cream/55">{t("Free, private and checked by volunteers.")}</span>
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
            <span className="mt-3 block h-0.5 overflow-hidden rounded-full bg-white/15">
              <span className="step-bar block h-full bg-cream" style={{ animationName: `step-${i + 1}` }} />
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
