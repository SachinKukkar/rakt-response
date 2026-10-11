import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CtaBand, LEARN_TOPICS, PageHero, SectionTitle, TLDR } from "@/components/learn/learn-parts";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: t("Learn"),
    description: t(
      "Blood 101 from Rakt Response: why donating matters, whole blood vs SDP, general eligibility information, what happens on the day, and FAQs.",
    ),
  };
}

const TEASERS: Record<(typeof LEARN_TOPICS)[number]["href"], { title: string; teaser: string }> = {
  "/why-donate": { title: "Why donate", teaser: "One donation, three superpowers." },
  "/donation-types": { title: "Whole blood vs SDP", teaser: "Same you, different ways to give." },
  "/eligibility": { title: "Can I donate?", teaser: "What blood centres usually check." },
  "/donation-process": { title: "What happens", teaser: "From the night before to the snack after." },
  "/faq": { title: "FAQ", teaser: "Safety, privacy, requests. Short answers." },
};

const CARDS: { href: string; emoji: string; title: string; teaser: string }[] = [
  ...LEARN_TOPICS.map((t) => ({ href: t.href, emoji: t.emoji, ...TEASERS[t.href] })),
  { href: "/about", emoji: "🤝", title: "About us", teaser: "Who we are, and what we don't do." },
  { href: "/impact", emoji: "📈", title: "Our impact", teaser: "Only checked figures. No hype." },
];

export default async function LearnPage() {
  const t = await getT();
  return (
    <>
      <PageHero
        eyebrow="Learn"
        title="Blood"
        highlight="101."
        subtitle="Everything you wanted to know about donating, in bite-size bits. No lecture, promise."
        chips={["⏱️ 2-min reads", "📱 Made for phones"]}
      />

      <div className="page-container space-y-10 pb-4">
        <TLDR
          items={[
            "Blood can't be manufactured. It comes from people like you.",
            "Whole blood and SDP are different, and not interchangeable.",
            "The blood centre decides who can donate, every time.",
          ]}
        />

        <section aria-labelledby="topics-heading">
          <SectionTitle kicker="Pick a topic" title="Start anywhere" id="topics-heading" />
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CARDS.map((card) => (
              <li key={card.href}>
                <Link
                  href={card.href}
                  className="press lift surface group flex min-h-24 items-center gap-4 p-5 hover:border-primary/30"
                >
                  <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-accent text-3xl" aria-hidden="true">
                    {card.emoji}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-lg leading-tight font-extrabold text-navy">{t(card.title)}</span>
                    <span className="mt-1 block text-sm text-muted-foreground">{t(card.teaser)}</span>
                  </span>
                  <ArrowRight
                    className="size-5 shrink-0 text-primary transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <CtaBand />
    </>
  );
}
