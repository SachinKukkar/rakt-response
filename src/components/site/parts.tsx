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
  handle,
  className,
}: {
  /** Relative widths of each range. */
  segments: number[];
  /** Index of the highlighted range. */
  active?: number;
  marker?: number | null;
  tone?: "night" | "cream";
  /** Draw the marker as a round handle that follows a drag (the bar is a slider). */
  handle?: boolean;
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
            i === active ? (tone === "night" ? "bg-cream" : "bg-crimson") : tone === "night" ? "bg-white/20" : "bg-navy/12",
          )}
        />
      ))}
      {marker !== undefined && marker !== null ? (
        <span
          className={cn(
            "absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full",
            handle
              ? "size-6 bg-cream shadow-[0_2px_10px_rgba(0,0,0,0.3)] transition-[left,box-shadow] duration-75 group-focus-visible:ring-4 group-focus-visible:ring-white/60"
              : cn("h-4 w-1 ring-3 transition-[left] duration-500", tone === "night" ? "bg-navy ring-cream" : "bg-night ring-cream"),
          )}
          style={{ left: `${Math.min(1, Math.max(0, marker)) * 100}%` }}
        />
      ) : null}
    </div>
  );
}
