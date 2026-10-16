import { cn } from "@/lib/utils";
import { tx } from "@/i18n/tx";

/** "(01) THE DONATION": the numbered label that opens each section. */
export function SectionLabel({ n, children, className }: { n?: number; children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("label-mono opacity-70", className)}>
      {n ? <span className="tabular-nums">({String(n).padStart(2, "0")}) </span> : null}
      {tx(children)}
    </p>
  );
}

/**
 * A headline whose second half is quieter, like "Four parts. One response."
 * `as` picks the heading level; `size` the display scale.
 */
export function Headline({
  as: Tag = "h2",
  size = "lg",
  lead,
  rest,
  id,
  className,
}: {
  as?: "h1" | "h2" | "h3";
  size?: "xl" | "lg" | "md" | "sm";
  lead: React.ReactNode;
  rest?: React.ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <Tag id={id} className={cn(`display-${size}`, className)}>
      {tx(lead)}
      {rest ? (
        <>
          {" "}
          <span className="opacity-45">{tx(rest)}</span>
        </>
      ) : null}
    </Tag>
  );
}

/** A horizontal bar split into ranges, with an optional marker (0–1 along the bar). */
export function RangeBar({
  segments,
  active,
  marker,
  tone = "night",
  className,
}: {
  /** Relative widths of each range. */
  segments: number[];
  /** Index of the highlighted range. */
  active?: number;
  marker?: number | null;
  tone?: "night" | "cream";
  className?: string;
}) {
  const total = segments.reduce((sum, s) => sum + s, 0);
  return (
    <div className={cn("relative flex h-1.5 gap-1", className)} aria-hidden="true">
      {segments.map((s, i) => (
        <span
          key={i}
          style={{ flexGrow: s / total }}
          className={cn(
            "h-full basis-0 rounded-full transition-colors duration-500",
            i === active ? "bg-crimson" : tone === "night" ? "bg-white/14" : "bg-navy/12",
          )}
        />
      ))}
      {marker !== undefined && marker !== null ? (
        <span
          className={cn(
            "absolute top-1/2 h-4 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full ring-3 transition-[left] duration-500",
            tone === "night" ? "bg-cream ring-night" : "bg-night ring-cream",
          )}
          style={{ left: `${Math.min(1, Math.max(0, marker)) * 100}%` }}
        />
      ) : null}
    </div>
  );
}

/**
 * A small frosted data card, as in the hero: a label, a big figure and a range bar.
 * Plain-string labels are translated.
 */
export function DataCard({
  label,
  meta,
  value,
  unit,
  segments,
  active,
  marker,
  footLeft,
  footRight,
  className,
}: {
  label: string;
  meta?: React.ReactNode;
  value: React.ReactNode;
  unit?: string;
  segments?: number[];
  active?: number;
  marker?: number;
  footLeft?: React.ReactNode;
  footRight?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("glass w-64 p-4 text-cream", className)}>
      <div className="flex items-center justify-between gap-3 text-cream/70">
        <span className="label-mono">{tx(label)}</span>
        {meta ? <span className="label-mono text-cream/60">{tx(meta)}</span> : null}
      </div>
      <p className="mt-3 flex items-baseline gap-1.5">
        <span className="text-[2rem] leading-none font-medium tracking-[-0.04em] tabular-nums">{value}</span>
        {unit ? <span className="text-sm text-cream/70">{tx(unit)}</span> : null}
      </p>
      {segments ? <RangeBar segments={segments} active={active} marker={marker} className="mt-4" /> : null}
      {footLeft || footRight ? (
        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="label-mono text-cream/55">{tx(footLeft)}</span>
          <span className="label-mono text-blush">{tx(footRight)}</span>
        </div>
      ) : null}
    </div>
  );
}
