import Link from "next/link";
import { ArrowRight, Check, ChevronDown, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { T } from "@/i18n/client";
import { getT } from "@/i18n/server";
import { tx } from "@/i18n/tx";

/**
 * Building blocks for short, scannable public pages: a bold red hero, a
 * "quick version" summary, swipeable fact tiles and collapsible detail.
 * Keep visible copy short — put depth inside <MoreDetails>.
 *
 * Plain-string props are translated here, so callers pass English.
 */

export function PageHero({
  eyebrow,
  title,
  highlight,
  subtitle,
  chips,
  children,
}: {
  eyebrow?: string;
  title: string;
  /** Part of the title rendered in outline style for emphasis. */
  highlight?: string;
  subtitle?: React.ReactNode;
  chips?: string[];
  children?: React.ReactNode;
}) {
  return (
    <section className="hero-red curve-bottom relative overflow-hidden text-white">
      <DropPattern />
      <div className="page-container relative py-9 sm:py-14">
        {eyebrow ? <p className="mb-3 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-bold tracking-wider uppercase backdrop-blur">{tx(eyebrow)}</p> : null}
        <h1 className="font-display max-w-3xl text-[2.35rem] leading-[1.02] font-extrabold text-white sm:text-6xl">
          {tx(title)}
          {highlight ? (
            <>
              {" "}
              <span className="text-[#ffd5d9]">{tx(highlight)}</span>
            </>
          ) : null}
        </h1>
        {subtitle ? <p className="mt-3 max-w-xl text-base text-white/90 sm:text-lg">{tx(subtitle)}</p> : null}
        {chips?.length ? (
          <ul className="mt-5 flex flex-wrap gap-2">
            {chips.map((chip) => (
              <li key={chip} className="rounded-full border border-white/30 bg-white/10 px-3 py-1.5 text-xs font-semibold backdrop-blur">
                {tx(chip)}
              </li>
            ))}
          </ul>
        ) : null}
        {children ? <div className="mt-6">{children}</div> : null}
      </div>
    </section>
  );
}

/** Decorative floating drops used in red bands. */
export function DropPattern() {
  return (
    <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.13]" preserveAspectRatio="none">
      <defs>
        <pattern id="rr-drops" width="88" height="88" patternUnits="userSpaceOnUse" patternTransform="rotate(-12)">
          <path d="M22 8C22 8 12 20 12 26.5C12 32 16.5 35 22 35C27.5 35 32 32 32 26.5C32 20 22 8 22 8Z" fill="white" />
          <path d="M66 52C66 52 60 59 60 63C60 66.3 62.7 68 66 68C69.3 68 72 66.3 72 63C72 59 66 52 66 52Z" fill="white" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#rr-drops)" />
    </svg>
  );
}

export async function TLDR({ title = "The quick version", items }: { title?: string; items: React.ReactNode[] }) {
  const t = await getT();
  return (
    <section className="surface relative -mt-8 overflow-hidden p-5 sm:p-6" aria-label={t(title)}>
      <p className="sticker mb-3">⚡ {t(title)}</p>
      <ul className="space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3 text-[15px] leading-snug text-foreground">
            <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary text-white">
              <Check className="size-3.5" aria-hidden="true" strokeWidth={3} />
            </span>
            <span>{typeof item === "string" ? t(item) : item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export interface Tile {
  icon: LucideIcon;
  title: string;
  text: React.ReactNode;
  tag?: string;
}

/** Swipeable on phones, grid on larger screens. */
export function TileRow({ tiles, tone = "light", columns = 3 }: { tiles: Tile[]; tone?: "light" | "tint" | "navy"; columns?: 2 | 3 | 4 }) {
  return (
    <ul
      className={cn(
        "snap-row sm:mx-0 sm:grid sm:overflow-visible sm:px-0",
        columns === 2 && "sm:grid-cols-2",
        columns === 3 && "sm:grid-cols-3",
        columns === 4 && "sm:grid-cols-2 lg:grid-cols-4",
      )}
    >
      {tiles.map((tile) => (
        <li
          key={tile.title}
          className={cn(
            "w-[72%] rounded-3xl p-5 min-[420px]:w-[58%] sm:w-auto",
            tone === "light" && "surface",
            tone === "tint" && "border border-primary/10 bg-accent",
            tone === "navy" && "bg-navy text-white",
          )}
        >
          <div className="mb-4 flex items-center justify-between">
            <span className={cn("grid size-11 place-items-center rounded-2xl", tone === "navy" ? "bg-white/10 text-white" : "bg-primary text-white")}>
              <tile.icon className="size-5" aria-hidden="true" />
            </span>
            {tile.tag ? (
              <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-bold", tone === "navy" ? "bg-white/15" : "bg-white text-primary")}>{tx(tile.tag)}</span>
            ) : null}
          </div>
          <h3 className={cn("font-display text-lg leading-tight font-bold", tone === "navy" && "text-white")}>{tx(tile.title)}</h3>
          <p className={cn("mt-1.5 text-sm leading-relaxed", tone === "navy" ? "text-white/80" : "text-muted-foreground")}>{tx(tile.text)}</p>
        </li>
      ))}
    </ul>
  );
}

export function SectionTitle({ kicker, title, action, id }: { kicker?: string; title: string; action?: React.ReactNode; id?: string }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div>
        {kicker ? <p className="text-xs font-bold tracking-wider text-primary uppercase">{tx(kicker)}</p> : null}
        <h2 id={id} className="font-display text-2xl leading-tight font-extrabold sm:text-3xl">
          {tx(title)}
        </h2>
      </div>
      {action}
    </div>
  );
}

/** Collapsible detail for readers who want more. */
export function MoreDetails({ title, children, defaultOpen }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  return (
    <details className="surface group overflow-hidden" open={defaultOpen}>
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-5 py-3 font-bold text-navy [&::-webkit-details-marker]:hidden">
        {tx(title)}
        <ChevronDown className="size-5 shrink-0 text-primary transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="prose-rr border-t border-border/70 px-5 pt-1 pb-5 text-[15px]">{children}</div>
    </details>
  );
}

export const LEARN_TOPICS = [
  { href: "/why-donate", label: "Why donate", emoji: "💗" },
  { href: "/donation-types", label: "Whole blood vs SDP", emoji: "🩸" },
  { href: "/eligibility", label: "Can I donate?", emoji: "✅" },
  { href: "/donation-process", label: "What happens", emoji: "🧭" },
  { href: "/faq", label: "FAQ", emoji: "💬" },
] as const;

export async function TopicPills({ current }: { current?: string }) {
  const t = await getT();
  return (
    <nav aria-label={t("More topics")} className="snap-row sm:mx-0 sm:flex-wrap sm:px-0">
      {LEARN_TOPICS.filter((topic) => topic.href !== current).map((topic) => (
        <Link key={topic.href} href={topic.href} className="press inline-flex h-11 items-center gap-2 rounded-full border bg-white px-4 text-sm font-semibold whitespace-nowrap text-navy hover:border-primary/40">
          <span aria-hidden="true">{topic.emoji}</span>
          {t(topic.label)}
        </Link>
      ))}
    </nav>
  );
}

/** The closing call-to-action used on every public page. */
export function CtaBand({ title = "Ready to be someone's hero?", text = "Join in two minutes. Your details stay private until you say otherwise." }: { title?: string; text?: string }) {
  return (
    <section className="page-container py-10">
      <div className="relative overflow-hidden rounded-[2rem] bg-navy p-6 text-white sm:p-10">
        <div className="absolute -top-16 -right-10 size-48 rounded-full bg-primary/40 blur-3xl" aria-hidden="true" />
        <div className="relative grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2 className="font-display text-3xl leading-tight font-extrabold text-white sm:text-4xl">{tx(title)}</h2>
            <p className="mt-2 max-w-lg text-white/80">{tx(text)}</p>
          </div>
          <div className="flex flex-col gap-2.5 sm:flex-row md:flex-col">
            <Button asChild size="lg" className="press">
              <Link href="/register">
                <T>Become a Donor</T> <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="press border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white">
              <Link href="/blood-requests">
                <T>Find Blood</T>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
