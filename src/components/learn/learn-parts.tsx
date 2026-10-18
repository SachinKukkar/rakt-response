import Image from "next/image";
import Link from "next/link";
import { Check, CircleCheck, Compass, Droplet, Heart, MessageCircleQuestion, Plus, type LucideIcon } from "lucide-react";
import { ArrowLink } from "@/components/site/arrow-link";
import type { Photo } from "@/lib/photos";
import { cn } from "@/lib/utils";
import { T } from "@/i18n/client";
import { getT } from "@/i18n/server";
import { tx } from "@/i18n/tx";

export interface HeroChip {
  icon: LucideIcon;
  label: string;
}

/**
 * Building blocks for short, scannable public pages: a dark editorial hero,
 * a "quick version" summary, fact tiles and collapsible detail.
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
  photo,
  children,
}: {
  eyebrow?: string;
  title: string;
  /** The quieter second half of the headline. */
  highlight?: string;
  subtitle?: React.ReactNode;
  /** Short facts under the subtitle; give each an icon so it reads at a glance. */
  chips?: Array<string | HeroChip>;
  /** Optional photograph behind the heading, darkened for legibility. */
  photo?: Photo;
  children?: React.ReactNode;
}) {
  return (
    <section className="on-night under-header relative isolate overflow-hidden">
      {photo ? (
        <>
          <Image src={photo.src} alt="" fill priority sizes="100vw" className="-z-20 object-cover" />
          <div aria-hidden="true" className="photo-wash absolute inset-0 -z-10" />
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-night/40" />
        </>
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(60%_80%_at_85%_0%,rgba(226,69,63,0.28)_0%,transparent_60%),radial-gradient(50%_70%_at_0%_100%,rgba(90,9,9,0.55)_0%,transparent_65%)]"
        />
      )}
      <div className="page-container relative pt-14 pb-16 sm:pt-20 sm:pb-24">
        {eyebrow ? <p className="label-mono text-blush">{tx(eyebrow)}</p> : null}
        <h1 className="display-lg mt-5 max-w-4xl">
          {tx(title)}
          {highlight ? (
            <>
              {" "}
              <span className="text-cream/50">{tx(highlight)}</span>
            </>
          ) : null}
        </h1>
        {subtitle ? <p className="mt-6 max-w-2xl text-lg leading-relaxed text-cream/75 sm:text-xl">{tx(subtitle)}</p> : null}
        {chips?.length ? (
          <ul className="mt-8 flex flex-wrap gap-2">
            {chips.map((chip) => {
              const { icon: Icon, label } = typeof chip === "string" ? { icon: null, label: chip } : chip;
              return (
                <li key={label} className="label-mono inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-2.5 text-cream/85 backdrop-blur">
                  {Icon ? <Icon className="size-3.5 text-blush" aria-hidden="true" /> : null}
                  {tx(label)}
                </li>
              );
            })}
          </ul>
        ) : null}
        {children ? <div className="mt-9">{children}</div> : null}
      </div>
    </section>
  );
}

export async function TLDR({ title = "The quick version", items }: { title?: string; items: React.ReactNode[] }) {
  const t = await getT();
  return (
    <section className="reveal mt-10 rounded-[1.5rem] border border-navy/10 bg-paper p-6 sm:mt-14 sm:p-8" aria-label={t(title)}>
      <p className="label-mono text-primary">{t(title)}</p>
      <ul className="mt-5 grid gap-x-10 gap-y-3.5 md:grid-cols-2">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3 text-[16px] leading-snug text-foreground">
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
        "snap-row sm:mx-0 sm:grid sm:gap-4 sm:overflow-visible sm:px-0",
        columns === 2 && "sm:grid-cols-2",
        columns === 3 && "sm:grid-cols-3",
        columns === 4 && "sm:grid-cols-2 lg:grid-cols-4",
      )}
    >
      {tiles.map((tile) => (
        <li
          key={tile.title}
          className={cn(
            "w-[78%] rounded-[1.5rem] p-6 min-[420px]:w-[60%] sm:w-auto",
            tone === "light" && "surface",
            tone === "tint" && "border border-primary/10 bg-accent/70",
            tone === "navy" && "on-night",
          )}
        >
          <div className="mb-6 flex items-center justify-between gap-3">
            <span className={cn("grid size-11 place-items-center rounded-2xl", tone === "navy" ? "bg-white/10 text-cream" : "icon-tile")}>
              <tile.icon className="size-5" aria-hidden="true" />
            </span>
            {tile.tag ? <span className={cn("tag", tone === "navy" && "bg-white/10 text-blush")}>{tx(tile.tag)}</span> : null}
          </div>
          <h3 className={cn("text-xl leading-tight font-medium tracking-[-0.02em]", tone === "navy" && "text-cream")}>{tx(tile.title)}</h3>
          <p className={cn("mt-2 text-[15px] leading-relaxed", tone === "navy" ? "text-cream/70" : "text-muted-foreground")}>{tx(tile.text)}</p>
        </li>
      ))}
    </ul>
  );
}

export function SectionTitle({ kicker, title, action, id }: { kicker?: string; title: string; action?: React.ReactNode; id?: string }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {kicker ? <p className="label-mono text-primary">{tx(kicker)}</p> : null}
        <h2 id={id} className="display-md mt-4">
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
    <details className="group border-b border-navy/12 first:border-t" open={defaultOpen}>
      <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 text-lg font-medium text-navy sm:text-xl [&::-webkit-details-marker]:hidden">
        {tx(title)}
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-navy/6 transition-transform duration-300 group-open:rotate-45" aria-hidden="true">
          <Plus className="size-4" />
        </span>
      </summary>
      <div className="prose-rr max-w-3xl pb-6">{children}</div>
    </details>
  );
}

export const LEARN_TOPICS: ReadonlyArray<{ href: string; label: string; icon: LucideIcon }> = [
  { href: "/why-donate", label: "Why donate", icon: Heart },
  { href: "/donation-types", label: "Whole blood vs SDP", icon: Droplet },
  { href: "/eligibility", label: "Can I donate?", icon: CircleCheck },
  { href: "/donation-process", label: "What happens", icon: Compass },
  { href: "/faq", label: "FAQ", icon: MessageCircleQuestion },
];

export async function TopicPills({ current }: { current?: string }) {
  const t = await getT();
  return (
    <nav aria-label={t("More topics")} className="snap-row sm:mx-0 sm:flex-wrap sm:px-0">
      {LEARN_TOPICS.filter((topic) => topic.href !== current).map((topic) => (
        <Link
          key={topic.href}
          href={topic.href}
          className="press inline-flex h-12 items-center gap-2 rounded-full border border-navy/15 px-5 text-[15px] font-medium whitespace-nowrap text-navy transition-colors hover:bg-navy/5"
        >
          <topic.icon className="size-4 text-primary" aria-hidden="true" />
          {t(topic.label)}
        </Link>
      ))}
    </nav>
  );
}

/** The closing call-to-action used on every public page. */
export function CtaBand({ title = "Ready to be someone's hero?", text = "Join in two minutes. Hide your number any time." }: { title?: string; text?: string }) {
  return (
    <section className="page-container py-14 sm:py-20">
      <div className="on-night relative isolate overflow-hidden rounded-[1.75rem] px-7 py-12 sm:px-12 sm:py-16">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(55%_90%_at_100%_0%,rgba(226,69,63,0.35)_0%,transparent_60%),radial-gradient(40%_80%_at_0%_100%,rgba(90,9,9,0.6)_0%,transparent_60%)]"
        />
        <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <h2 className="display-md max-w-2xl">{tx(title)}</h2>
            <p className="mt-4 max-w-lg text-lg text-cream/70">{tx(text)}</p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <ArrowLink href="/register">
              <T>Become a Donor</T>
            </ArrowLink>
            <ArrowLink href="/blood-requests" tone="ghost">
              <T>Find Blood</T>
            </ArrowLink>
          </div>
        </div>
      </div>
    </section>
  );
}
