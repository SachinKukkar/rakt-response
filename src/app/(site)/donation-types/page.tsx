import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import Link from "next/link";
import { Fragment } from "react";
import { Clock, Droplet, Droplets, HeartHandshake, Layers, ListChecks, Microscope, Repeat, ShieldPlus, Timer, Workflow, type LucideIcon } from "lucide-react";
import { Notice } from "@/components/common/page-parts";
import { CtaBand, MoreDetails, PageHero, SectionTitle, TileRow, TLDR, TopicPills, type Tile } from "@/components/learn/learn-parts";
import { getT } from "@/i18n/server";
import { cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return pageMetadata(t("Donation types"), t(
      "Whole blood, Single Donor Platelet (SDP), WBC (granulocyte) and other apheresis donations explained: how they differ, how long they take, and why each is as important as the others.",
    ));
}

/** Puts links and bold text into a translated sentence at its {slots}. */
function rich(text: string, slots: Record<string, React.ReactNode>) {
  return text.split(/\{(\w+)\}/).map((part, i) => <Fragment key={i}>{i % 2 ? slots[part] : part}</Fragment>);
}

type Stat = { icon: LucideIcon; label: string; value: string };

/** Cards on a light background use dark text; the red and navy cards use white. */
const onLight = (tone: string) => tone === "light" || tone === "outline";

const TYPES: {
  id: string;
  name: string;
  vibe: string;
  icon: LucideIcon;
  tone: "light" | "red" | "navy" | "outline";
  stats: Stat[];
}[] = [
  {
    id: "whole-blood",
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
    id: "wbc",
    name: "WBC (granulocytes)",
    vibe: "White blood cells for one patient, arranged at short notice.",
    icon: ShieldPlus,
    tone: "navy",
    stats: [
      { icon: Clock, label: "Time", value: "A few hours at the centre" },
      { icon: Workflow, label: "How", value: "Cell separator keeps white cells" },
      { icon: HeartHandshake, label: "Helps", value: "Patients with very low white cells and a serious infection" },
    ],
  },
  {
    id: "other-apheresis",
    name: "Other apheresis",
    vibe: "One component, such as plasma. Only at some centres.",
    icon: Layers,
    tone: "outline",
    stats: [
      { icon: Clock, label: "Time", value: "Longer than whole blood" },
      { icon: Workflow, label: "How", value: "Machine collects one component" },
      { icon: HeartHandshake, label: "Helps", value: "A specific need, e.g. plasma" },
    ],
  },
];

const GOOD_TO_KNOW: Tile[] = [
  { icon: Repeat, title: "Different gaps", text: "Red cells take weeks to rebuild, so whole blood needs the longest gap.", tag: "Intervals" },
  { icon: Microscope, title: "Extra checks for SDP", text: "Usually a platelet count and a vein check. The centre decides.", tag: "Screening" },
  { icon: Timer, title: "WBC can't wait", text: "White cells must be given within about a day, so the centre plans each WBC donation with the donor.", tag: "WBC" },
  { icon: ListChecks, title: "Block your time", text: "Saying yes to SDP or WBC? Keep a few hours free.", tag: "Plan" },
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
        title={t("Whole blood, SDP")}
        highlight={t("and WBC.")}
        subtitle={t("Same you, different ways to give. Each is as important as the others; here's the quick compare.")}
        chips={[
          { icon: Droplet, label: t("Whole blood") },
          { icon: Droplets, label: t("SDP") },
          { icon: ShieldPlus, label: t("WBC") },
        ]}
      />

      <div className="page-container space-y-10 pb-4">
        <TLDR
          items={[
            t("Whole blood: one bag, split into parts later at the blood centre."),
            t("SDP: a machine keeps your platelets and gives the rest back."),
            t("WBC: a machine collects white blood cells for one patient, usually at short notice."),
            t("SDP and WBC take longer and need extra checks."),
            t("Each is as important as the others, and they're not interchangeable. Always check which type a request needs."),
          ]}
        />

        <Notice title={t("Not interchangeable")} tone="brand">
          {t(
            "A whole-blood donation can't meet an SDP or WBC request, and the other way round. Check the type before you respond.",
          )}
        </Notice>

        <section aria-labelledby="compare-heading">
          <SectionTitle kicker={t("Side by side")} title={t("Pick your type")} id="compare-heading" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {TYPES.map((type) => (
              <article
                key={type.id}
                aria-labelledby={`${type.id}-title`}
                className={cn(
                  "flex flex-col rounded-3xl p-5",
                  type.tone === "light" && "surface",
                  type.tone === "outline" && "border border-border",
                  type.tone === "red" && "hero-red text-white",
                  type.tone === "navy" && "bg-navy text-white",
                )}
              >
                <div className="mb-4">
                  <span className={cn("grid size-12 shrink-0 place-items-center rounded-2xl", onLight(type.tone) ? "icon-tile size-12" : "bg-white/15 text-white")}>
                    <type.icon className="size-6" aria-hidden="true" />
                  </span>
                </div>
                <h3 id={`${type.id}-title`} className={cn("text-xl leading-tight font-extrabold", !onLight(type.tone) && "text-white")}>
                  {t(type.name)}
                </h3>
                <p className={cn("mt-1 text-sm", onLight(type.tone) ? "text-muted-foreground" : "text-white/85")}>{t(type.vibe)}</p>
                <dl className="mt-4 space-y-2">
                  {type.stats.map((s) => (
                    <div
                      key={s.label}
                      className={cn(
                        "flex items-start gap-2.5 rounded-2xl px-3 py-2 text-sm",
                        onLight(type.tone) ? "bg-accent" : "bg-white/12",
                      )}
                    >
                      <s.icon className={cn("mt-0.5 size-4 shrink-0", onLight(type.tone) ? "text-primary" : "text-white")} aria-hidden="true" />
                      <div className="min-w-0">
                        <dt className={cn("text-[11px] font-bold tracking-wider uppercase", onLight(type.tone) ? "text-primary" : "text-white/75")}>
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
          <TileRow tiles={localTiles(GOOD_TO_KNOW)} tone="tint" columns={4} />
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
          <MoreDetails title={t("WBC (granulocyte) donation")}>
            <p>
              {t(
                "Granulocytes are white blood cells that fight bacterial and fungal infections. Some patients, often during cancer treatment, have so few that an infection becomes very dangerous. Their doctors may ask for granulocyte (WBC) donations.",
              )}
            </p>
            <p>
              {t(
                "Like SDP, a machine collects them and returns the rest of your blood. The centre may ask you to take a medicine beforehand to raise your white cell count; it explains this and checks that it suits you.",
              )}
            </p>
            <p>
              {t(
                "White cells must be transfused within about a day of collection, so a WBC donation is arranged for one patient at a time, often at short notice. Your blood group usually needs to match the patient's, because the bag also holds some red cells. Only some centres collect WBC.",
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

      <CtaBand text={t("Every request on Rakt Response says which type it needs, and your history keeps whole blood, SDP and WBC donations apart.")} />
    </>
  );
}
