"use client";

import { cn } from "@/lib/utils";
import type { BloodGroup } from "@/lib/constants";
import { useT } from "@/i18n/client";

const SIZE = {
  sm: "size-9 text-[11px]",
  md: "size-12 text-sm",
  lg: "size-16 text-lg",
} as const;

/** Blood-group label inside a drop shape. Purely presentational. */
export function BloodGroupChip({
  group,
  size = "md",
  tone = "solid",
  label,
  className,
}: {
  group: BloodGroup | string;
  size?: keyof typeof SIZE;
  /** "light" and "ghost" are for red backgrounds. */
  tone?: "solid" | "soft" | "outline" | "light" | "ghost";
  /** Accessible name override (e.g. "Bombay blood group (Oh)"). */
  label?: string;
  className?: string;
}) {
  const t = useT();
  return (
    <span
      className={cn("relative inline-grid shrink-0 place-items-center font-extrabold", SIZE[size], className)}
      aria-label={label ? t(label) : group === "Oh" ? t("Bombay blood group (Oh)") : t("Blood group {group}", { group })}
      role="img"
    >
      <svg viewBox="0 0 48 56" aria-hidden="true" className="absolute inset-0 size-full">
        <path
          d="M24 2C24 2 4 24.5 4 36.5C4 47.3 13 54 24 54C35 54 44 47.3 44 36.5C44 24.5 24 2 24 2Z"
          className={cn(
            tone === "solid" && "fill-primary",
            tone === "soft" && "fill-accent stroke-primary/25",
            tone === "outline" && "fill-white stroke-primary",
            tone === "light" && "fill-cream",
            tone === "ghost" && "fill-white/10 stroke-cream",
          )}
          strokeWidth={tone === "solid" || tone === "light" ? 0 : 2}
        />
      </svg>
      <span className={cn("relative mt-[18%]", tone === "solid" ? "text-white" : tone === "ghost" ? "text-cream" : "text-primary")}>{group}</span>
    </span>
  );
}
