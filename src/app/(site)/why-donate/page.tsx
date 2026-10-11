import type { Metadata } from "next";
import Link from "next/link";
import { Fragment } from "react";
import {
  Ambulance,
  Baby,
  Droplet,
  FlaskConical,
  HandHeart,
  HeartPulse,
  Hospital,
  Hourglass,
  Repeat,
  Ribbon,
  Shield,
  Stethoscope,
  Wind,
} from "lucide-react";
import { Notice } from "@/components/common/page-parts";
import { CtaBand, MoreDetails, PageHero, SectionTitle, TileRow, TLDR, TopicPills, type Tile } from "@/components/learn/learn-parts";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: t("Why donate"),
    description: t(
      "Why voluntary blood donation matters: how red cells, platelets and plasma support patients, and why regular voluntary donors are important.",
    ),
  };
}

/** Puts links and bold text into a translated sentence at its {slots}. */
function rich(text: string, slots: Record<string, React.ReactNode>) {
  return text.split(/\{(\w+)\}/).map((part, i) => <Fragment key={i}>{i % 2 ? slots[part] : part}</Fragment>);
}

const COMPONENTS: Tile[] = [
  { icon: Wind, title: "Red cells", text: "Carry oxygen. Often used after injury, surgery, childbirth or severe anaemia.", tag: "🫁 Oxygen" },
  { icon: Shield, title: "Platelets", text: "Help blood clot. Often needed when counts drop, like in some cancer care or severe dengue.", tag: "🩹 Clotting" },
  { icon: Droplet, title: "Plasma", text: "The liquid part, full of clotting proteins. Some medicines are made from it.", tag: "💧 Proteins" },
];

const NEEDS: Tile[] = [
  { icon: Ambulance, title: "Emergencies", text: "Road accidents and trauma." },
  { icon: Hospital, title: "Surgery", text: "Some planned and emergency operations." },
  { icon: Baby, title: "Mothers", text: "Heavy bleeding around childbirth." },
  { icon: Ribbon, title: "Cancer care", text: "Treatments that lower blood counts." },
  { icon: Repeat, title: "Regular transfusions", text: "Conditions like thalassaemia." },
  { icon: Stethoscope, title: "And more", text: "Some newborns, burns, clotting disorders." },
];

const WHY_YOU: Tile[] = [
  { icon: HandHeart, title: "Voluntary is safest", text: "Free, unpaid donors are recognised as the safest source of blood.", tag: "Fact" },
  { icon: FlaskConical, title: "Can't be made", text: "There's no lab-made substitute for blood in routine care.", tag: "Fact" },
  { icon: Hourglass, title: "It doesn't keep", text: "Platelets last days, red cells weeks. Steady donors matter.", tag: "Fact" },
];

export default async function WhyDonatePage() {
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
        eyebrow={t("Why donate")}
        title={t("Your blood,")}
        highlight={t("someone's big day.")}
        subtitle={t("Around 15 minutes in the chair. One needle. A big deal for someone you may never meet.")}
        chips={[t("🩸 Red cells"), t("🩹 Platelets"), t("💧 Plasma")]}
      />

      <div className="page-container space-y-10 pb-4">
        <TLDR
          items={[
            t("One donation is usually split into parts, so it can help in different ways."),
            t("Blood can't be manufactured. Every unit comes from a person who chose to give."),
            t("Platelets last only days, so steady, regular donors matter most."),
            t("Doctors decide who needs blood. The blood centre decides who can donate."),
          ]}
        />

        <section aria-labelledby="parts-heading">
          <SectionTitle kicker={t("One donation")} title={t("Three superpowers")} id="parts-heading" />
          <TileRow tiles={localTiles(COMPONENTS)} tone="tint" />
          <p className="mt-3 text-sm text-muted-foreground">
            {t("Some parts can be collected directly by a machine.")}{" "}
            <Link href="/donation-types" className="font-semibold text-primary underline underline-offset-4">
              {t("Whole blood vs SDP")}
            </Link>
          </p>
        </section>

        <section aria-labelledby="who-heading">
          <SectionTitle kicker={t("Real people")} title={t("Who it helps")} id="who-heading" />
          <ul className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {localTiles(NEEDS).map((need) => (
              <li key={need.title} className="surface p-4">
                <need.icon className="mb-2 size-5 text-primary" aria-hidden="true" />
                <h3 className="leading-tight font-bold">{need.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{need.text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="why-heading">
          <SectionTitle kicker={t("Why regulars rock")} title={t("Why it has to be you")} id="why-heading" />
          <TileRow tiles={localTiles(WHY_YOU)} tone="navy" />
        </section>

        <div className="space-y-3">
          <MoreDetails title={t("More on blood components")}>
            <p>
              {rich(
                t(
                  "Blood centres usually separate donated whole blood into components, so that each patient can receive the part they need. {redCells} carry oxygen around the body. {platelets} help blood to clot and stop bleeding; they are often needed by people whose platelet count is low, as decided by their doctors. {plasma} may be used for some bleeding and clotting problems, and certain medicines are made from donated plasma.",
                ),
                {
                  redCells: <strong>{t("Red cells")}</strong>,
                  platelets: <strong>{t("Platelets")}</strong>,
                  plasma: <strong>{t("Plasma")}</strong>,
                },
              )}
            </p>
          </MoreDetails>
          <MoreDetails title={t("Why voluntary, regular donors matter")}>
            <p>
              {t(
                "Health authorities, including the World Health Organization and India's national blood transfusion guidelines, recognise regular voluntary, non-remunerated donors as the safest source of blood. People who donate freely, without payment or pressure, have every reason to answer health questions honestly.",
              )}
            </p>
            <p>
              {t(
                "Donated components have limited shelf lives. Red cells can be stored for some weeks, but platelets last only a few days. That is why steady, regular donation matters more than one-off drives.",
              )}
            </p>
          </MoreDetails>
        </div>

        <Notice title={t("Medical decisions stay with professionals")} icon={HeartPulse}>
          {rich(
            t(
              "General information, not medical advice. The blood centre's doctor decides whether you can donate, and a patient's treating doctors decide whether they need a transfusion. See {link}.",
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

        <TopicPills current="/why-donate" />
      </div>

      <CtaBand />
    </>
  );
}
