import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import Link from "next/link";
import { Fragment } from "react";
import { BadgeIndianRupee, BookOpen, CircleCheck, CircleX, Handshake, Lock, NotebookPen, ShieldCheck, TriangleAlert, Users } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { Notice } from "@/components/common/page-parts";
import { CtaBand, MoreDetails, PageHero, SectionTitle, TileRow, TLDR, TopicPills, type Tile } from "@/components/learn/learn-parts";
import { getT } from "@/i18n/server";
import { SITE } from "@/lib/constants";
import { PHOTOS } from "@/lib/photos";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return pageMetadata(t("About"), t(
      "Rakt Response is a volunteer community team that helps voluntary blood donors and people seeking blood connect safely, with privacy and consent built in.",
    ));
}

/** Puts links and bold text into a translated sentence at its {slots}. */
function rich(text: string, slots: Record<string, React.ReactNode>) {
  return text.split(/\{(\w+)\}/).map((part, i) => <Fragment key={i}>{i % 2 ? slots[part] : part}</Fragment>);
}

const WHAT_WE_BUILD: Tile[] = [
  { icon: Users, title: "Donor registry", text: "Your blood group, rough area and availability. Private by default.", tag: "Donors" },
  { icon: ShieldCheck, title: "Verified requests", text: "Volunteers check every request with the requester or hospital first.", tag: "Checked" },
  { icon: NotebookPen, title: "Donation history", text: "Log your donations and keep track of the gaps between them.", tag: "Yours" },
  { icon: BookOpen, title: "Blood 101", text: "Plain-language guides to donating. No jargon.", tag: "Learn" },
];

const WE_DO = [
  "Connect voluntary donors and people seeking blood via authorised volunteers",
  "Check requests before showing them as verified",
  "Keep your contact details private, shared only with consent",
  "Share general, responsible info about donating",
];

const WE_DONT = [
  "Store, test or process blood",
  "Reserve or hold blood units",
  "Certify compatibility or medical suitability",
  "Guarantee a donor will be available",
  "Replace hospitals, doctors or licensed blood banks",
];

const STEPS: { title: string; text: string }[] = [
  { title: "You register", text: "Blood group, general area, donation types you're open to." },
  { title: "You stay private", text: "Your profile and number are never listed publicly." },
  { title: "We verify", text: "A volunteer checks each request with the requester or hospital." },
  { title: "You choose", text: "We contact you only if you agreed. Saying no is always fine." },
  { title: "You log it", text: "Add your donation. It stays self-reported until verified." },
];

export default async function AboutPage() {
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
        photo={PHOTOS.handsHeart}
        eyebrow={t("About us")}
        title={t("People helping")}
        highlight={t("people.")}
        subtitle={t("Rakt Response is a volunteer community team. We help donors and people seeking blood find each other, safely.")}
        chips={[
          { icon: Handshake, label: t("Volunteer-run") },
          { icon: Lock, label: t("Privacy first") },
          { icon: BadgeIndianRupee, label: t("Never paid") },
        ]}
      />

      <div className="page-container space-y-10 pb-4">
        <TLDR
          items={[
            t("Every request is checked by a volunteer before it shows as verified."),
            t("We connect people in need with potential blood donors."),
            t("We respect your privacy and handle shared information responsibly."),
            t("Emergency? Go straight to the treating hospital or a licensed blood bank."),
          ]}
        />

        <section aria-labelledby="mission-heading" className="surface-tint flex flex-col items-center gap-5 p-6 text-center sm:flex-row sm:p-8 sm:text-left">
          <div className="rounded-3xl bg-white p-3 shadow-sm">
            <LogoMark size="xl" priority />
          </div>
          <div className="min-w-0 space-y-3">
            <p className="text-xs font-bold tracking-wider text-primary uppercase">{t("Our mission")}</p>
            <h2 id="mission-heading" className="text-2xl leading-tight font-extrabold sm:text-3xl">
              {t("A calmer path to blood. A donor who feels respected.")}
            </h2>
            <p className="text-lg font-bold text-primary">{t(SITE.tagline)}</p>
            {/* The signature tagline closes the mission, a size up so it is remembered. */}
            <p className="text-xl font-semibold tracking-tight text-navy sm:text-2xl">“{t(SITE.signature)}”</p>
          </div>
        </section>

        <section aria-labelledby="build-heading">
          <SectionTitle kicker={t("The platform")} title={t("What we built")} id="build-heading" />
          <TileRow tiles={localTiles(WHAT_WE_BUILD)} columns={4} />
        </section>

        <section aria-labelledby="limits-heading">
          <SectionTitle kicker={t("Straight talk")} title={t("What we do, and don't")} id="limits-heading" />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl bg-success-soft p-5">
              <h3 className="mb-3 text-lg font-bold">{t("We do")}</h3>
              <ul className="space-y-2.5 text-sm">
                {WE_DO.map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <CircleCheck className="mt-0.5 size-5 shrink-0 text-success" aria-hidden="true" />
                    <span>{t(item)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl bg-navy p-5 text-white">
              <h3 className="mb-3 text-lg font-bold text-white">{t("We don't")}</h3>
              <ul className="space-y-2.5 text-sm text-white/85">
                {WE_DONT.map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <CircleX className="mt-0.5 size-5 shrink-0 text-[#ffb3ba]" aria-hidden="true" />
                    <span>{t(item)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <Notice title={t("In an emergency")} tone="warning" icon={TriangleAlert} className="mt-4">
            {t(
              "Contact the treating hospital or the nearest licensed blood bank immediately. Please don't wait for a response on Rakt Response.",
            )}
          </Notice>
        </section>

        <section aria-labelledby="how-heading">
          <SectionTitle kicker={t("How it works")} title={t("Five simple steps")} id="how-heading" />
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {STEPS.map((step, i) => (
              <li key={step.title} className="surface flex gap-3 p-4 lg:flex-col">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-sm font-extrabold text-white">{i + 1}</span>
                <div>
                  <h3 className="font-bold">{t(step.title)}</h3>
                  <p className="mt-0.5 text-sm text-muted-foreground">{t(step.text)}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <div className="space-y-3">
          <MoreDetails title={t("Who we are")}>
            <p>
              {t(
                "Rakt Response is run by a community team of volunteers. We are donors, family members of patients and people who have seen how stressful it can be to look for blood in a hurry. We came together to make that search more organised, more private and more respectful for everyone involved.",
              )}
            </p>
            <p>
              {t(
                "We are not a hospital or a blood bank. Our role is coordination: helping the right people talk to each other, with consent, so that donation can happen at a licensed blood centre.",
              )}
            </p>
          </MoreDetails>
          <MoreDetails title={t("How we report our work and protect your data")}>
            <p>
              {rich(
                t(
                  "We share only figures that have been checked. See {impact}. To learn how we protect your information and how consent works, read our {privacy}.",
                ),
                {
                  impact: <Link href="/impact">{t("Our Impact")}</Link>,
                  privacy: <Link href="/privacy">{t("privacy policy")}</Link>,
                },
              )}
            </p>
          </MoreDetails>
        </div>

        <TopicPills current="/about" />
      </div>

      <CtaBand title={t("Together we can.")} />
    </>
  );
}
