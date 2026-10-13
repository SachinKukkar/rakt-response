import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import Link from "next/link";
import { Fragment } from "react";
import { Clock, Droplet, Droplets, HeartHandshake, Layers, ListChecks, Microscope, Repeat, Workflow, type LucideIcon } from "lucide-react";
import { Notice } from "@/components/common/page-parts";
import { CtaBand, MoreDetails, PageHero, SectionTitle, TileRow, TLDR, TopicPills, type Tile } from "@/components/learn/learn-parts";
import { getT } from "@/i18n/server";
import { cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return pageMetadata(t("Donation types"), t(
      "Whole blood, Single Donor Platelet (SDP) and other apheresis donations explained: how they differ, how long they take, and why they are not interchangeable.",
    ));
}

/** Puts links and bold text into a translated sentence at its {slots}. */
function rich(text: string, slots: Record<string, React.ReactNode>) {
  return text.split(/\{(\w+)\}/).map((part, i) => <Fragment key={i}>{i % 2 ? slots[part] : part}</Fragment>);
}

type Stat = { icon: LucideIcon; label: string; value: string };

const TYPES: {
  id: string;
  emoji: string;
  name: string;
  vibe: string;
  icon: LucideIcon;
  tone: "light" | "red" | "navy";
  stats: Stat[];
}[] = [
  {
    id: "whole-blood",
    emoji: "🩸",
    name: "Whole blood",
    vibe: "The classic. Most donors start here.",
    icon: Droplet,
    tone: "light",
    stats: [
      { icon: Clock, label: "Time", value: "~10–15 min collection" },
      { icon: Workflow, label: "How", value: "One needle, one sterile bag" },
      { icon: HeartHandshake, label: "Helps", value: "Split into red cells, plasma, sometimes platelets" },
    ],
  },
  {
    id: "sdp",
    emoji: "🩹",
    name: "SDP (Single Donor Platelets)",
    vibe: "Platelets only. A machine returns the rest to you.",
    icon: Droplets,
    tone: "red",
    stats: [
      { icon: Clock, label: "Time", value: "~60–90+ min on the machine" },
      { icon: Workflow, label: "How", value: "Cell separator keeps platelets" },
      { icon: HeartHandshake, label: "Helps", value: "Often patients with very low platelets" },
    ],
  },
  {
    id: "other-apheresis",
    emoji: "💧",
    name: "Other apheresis",
    vibe: "One component, such as plasma. Only at some centres.",
    icon: Layers,
    tone: "navy",
    stats: [
      { icon: Clock, label: "Time", value: "Longer than whole blood" },
      { icon: Workflow, label: "How", value: "Machine collects one component" },
      { icon: HeartHandshake, label: "Helps", value: "A specific need, e.g. plasma" },
    ],
  },
];

const GOOD_TO_KNOW: Tile[] = [
  { icon: Repeat, title: "Different gaps", text: "Red cells take weeks to rebuild, so whole blood needs the longest gap.", tag: "⏳ Intervals" },
  { icon: Microscope, title: "Extra checks for SDP", text: "Usually a platelet count and a vein check. The centre decides.", tag: "🔬 Screening" },
  { icon: ListChecks, title: "Block your time", text: "Saying yes to SDP? Keep a few hours free.", tag: "🗓️ Plan" },
];

export default async function DonationTypesPage() {
  const t = await getT();
  const localTiles = (tiles: Tile[]): Tile[] =>
    tiles.map((tile) => ({
      ...tile,
      title: t(tile.title),
      text: typeof tile.text === "string" ? t(tile.text) : tile.text,
      tag: tile.tag ? t(tile.tag) : undefined,
    }));
  return (
    <>
      <PageHero
        eyebrow={t("Donation types")}
        title={t("Whole blood vs")}
        highlight={t("SDP.")}
        subtitle={t("Same you, different ways to give. Here's the quick compare.")}
        chips={[t("🩸 Whole blood"), t("🩹 SDP"), t("💧 Apheresis")]}
      />

      <div className="page-container space-y-10 pb-4">
        <TLDR
          items={[
            t("Whole blood: one bag, split into parts later at the blood centre."),
            t("SDP: a machine keeps your platelets and gives the rest back."),
            t("SDP takes much longer and needs extra checks."),
            t("They're not interchangeable. Always check which type a request needs."),
          ]}
        />

        <Notice title={t("Not interchangeable")} tone="brand">
          {t(
            "A whole-blood donation can't meet an SDP request, and a whole-blood request isn't a platelet request. Check the type before you respond.",
          )}
        </Notice>

        <section aria-labelledby="compare-heading">
          <SectionTitle kicker={t("Side by side")} title={t("Pick your type")} id="compare-heading" />
          <div className="grid gap-4 lg:grid-cols-3">
            {TYPES.map((type) => (
              <article
                key={type.id}
                aria-labelledby={`${type.id}-title`}
                className={cn(
                  "flex flex-col rounded-3xl p-5",
                  type.tone === "light" && "surface",
                  type.tone === "red" && "hero-red text-white",
                  type.tone === "navy" && "bg-navy text-white",
                )}
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <span
                    className={cn(
                      "grid size-12 shrink-0 place-items-center rounded-2xl",
                      type.tone === "light" ? "bg-primary text-white" : "bg-white/15 text-white",
                    )}
                  >
                    <type.icon className="size-6" aria-hidden="true" />
                  </span>
                  <span className="text-2xl" aria-hidden="true">
                    {type.emoji}
                  </span>
                </div>
                <h3 id={`${type.id}-title`} className={cn("text-xl leading-tight font-extrabold", type.tone !== "light" && "text-white")}>
                  {t(type.name)}
                </h3>
                <p className={cn("mt-1 text-sm", type.tone === "light" ? "text-muted-foreground" : "text-white/85")}>{t(type.vibe)}</p>
                <dl className="mt-4 space-y-2">
                  {type.stats.map((s) => (
                    <div
                      key={s.label}
                      className={cn(
                        "flex items-start gap-2.5 rounded-2xl px-3 py-2 text-sm",
                        type.tone === "light" ? "bg-accent" : "bg-white/12",
                      )}
                    >
                      <s.icon className={cn("mt-0.5 size-4 shrink-0", type.tone === "light" ? "text-primary" : "text-white")} aria-hidden="true" />
                      <div className="min-w-0">
                        <dt className={cn("text-[11px] font-bold tracking-wider uppercase", type.tone === "light" ? "text-primary" : "text-white/75")}>
                          {t(s.label)}
                        </dt>
                        <dd className="font-semibold">{t(s.value)}</dd>
                      </div>
                    </div>
                  ))}
                </dl>
              </article>
            ))}
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            {t("Rough guide only. Exact times, amounts and gaps depend on the centre and national guidelines.")}
          </p>
        </section>

        <section aria-labelledby="know-heading">
          <SectionTitle kicker={t("Good to know")} title={t("Before you say yes")} id="know-heading" />
          <TileRow tiles={localTiles(GOOD_TO_KNOW)} tone="tint" />
        </section>

        <div className="space-y-3">
          <MoreDetails title={t("How whole blood and apheresis differ")}>
            <p>
              {rich(
                t(
                  "In a {term}, blood flows through one needle into a sterile, single-use bag, typically around 350–450 ml depending on the bag used and your weight. It is usually separated at the blood centre into red cells, plasma and sometimes platelets.",
                ),
                { term: <strong>{t("whole-blood donation")}</strong> },
              )}
            </p>
            <p>
              {rich(
                t(
                  "In an {term}, a machine separates your blood during the donation, keeps one component (such as platelets or plasma) and returns the rest to you through the same or a second needle. Because it collects a larger amount of one component from a single person, one SDP donation can provide a platelet dose that would otherwise need to be pooled from several whole-blood donations. This can mean fewer donor exposures for the patient.",
                ),
                { term: <strong>{t("apheresis donation")}</strong> },
              )}
            </p>
          </MoreDetails>
          <MoreDetails title={t("Intervals and extra checks")}>
            <p>
              {t(
                "Your body replaces components at different speeds. Red cells take weeks to rebuild, so whole-blood donations have the longest interval. Platelets and plasma are replaced faster, so apheresis intervals are shorter, within limits set by the centre and national guidelines.",
              )}
            </p>
            <p>
              {t(
                "Whole blood involves standard screening: questionnaire, haemoglobin, weight, pulse, blood pressure and temperature. Apheresis centres usually also check your platelet count and whether your veins suit the machine. Some people who can give whole blood may not be suitable for SDP, and the apheresis centre makes that decision. Other apheresis donations may need additional tests depending on the component.",
              )}
            </p>
          </MoreDetails>
        </div>

        <Notice>
          {rich(
            t(
              "General information, not medical advice. Rakt Response doesn't decide who can donate; the blood or apheresis centre's doctor does, every time. See {link}.",
            ),
            {
              link: (
                <Link href="/eligibility" className="font-medium text-primary underline underline-offset-4">
                  {t("general eligibility info")}
                </Link>
              ),
            },
          )}
        </Notice>

        <TopicPills current="/donation-types" />
      </div>

      <CtaBand text={t("Every request on Rakt Response says which type it needs, and your history logs whole blood and SDP separately.")} />
    </>
  );
}
