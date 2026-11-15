"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SITE } from "@/lib/constants";
import { useT } from "@/i18n/client";

/*
 * The supplied Rakt Response logo: the round "Rakt Response Team" badge.
 * public/brand/logo.png is cut out of assets/brand/logo-supplied.svg without
 * redrawing it (scripts/generate-icons.mjs, `npm run icons`).
 */

/** Diameters of the badge in CSS pixels. */
const SIZES = { xs: 36, sm: 40, md: 52, lg: 84, xl: 150 } as const;

/**
 * The badge. `size` is a preset or a diameter in px; with `fill` it fills its
 * parent (which must be positioned and sized), `size` then only guides `sizes`.
 */
export function LogoMark({
  size = "sm",
  fill,
  unoptimized,
  className,
  priority,
}: {
  size?: keyof typeof SIZES | number;
  fill?: boolean;
  /** Load /brand/logo.png directly (the offline page, where the worker has it cached). */
  unoptimized?: boolean;
  className?: string;
  priority?: boolean;
}) {
  const t = useT();
  const side = typeof size === "number" ? size : SIZES[size];
  if (fill) {
    return (
      <Image src={SITE.logo} alt={t("Rakt Response logo")} fill priority={priority} sizes={`${side}px`} className={cn("rounded-full object-contain", className)} />
    );
  }
  return (
    <Image
      src={SITE.logo}
      alt={t("Rakt Response logo")}
      width={side}
      height={side}
      priority={priority}
      unoptimized={unoptimized}
      sizes={`${side}px`}
      className={cn("shrink-0 rounded-full object-contain", className)}
      style={{ width: side, height: side }}
    />
  );
}

/**
 * The name beside the badge, set in the site's type (the badge's own lettering is
 * too small to read at header sizes). Decorative: pair it with an accessible name.
 * `height` is the height of the capital letters in CSS pixels.
 */
export function LogoWordmark({ tone = "maroon", height = 13, className }: { tone?: "maroon" | "cream"; height?: number; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "shrink-0 leading-none font-extrabold tracking-[0.06em] whitespace-nowrap uppercase",
        tone === "cream" ? "text-cream" : "text-night",
        className,
      )}
      style={{ fontSize: Math.round(height * 1.38) }}
    >
      {SITE.name}
    </span>
  );
}

/**
 * Badge and name side by side, linking home. `compact` keeps it narrow on phones
 * (smaller name; badge alone below 380 px) so the floating header fits.
 */
export function LogoLockup({
  href = "/",
  tone = "cream",
  size = "xs",
  wordmarkHeight = 12,
  compact,
  priority,
  className,
}: {
  href?: string;
  tone?: "maroon" | "cream";
  size?: keyof typeof SIZES;
  wordmarkHeight?: number;
  compact?: boolean;
  priority?: boolean;
  className?: string;
}) {
  const t = useT();
  return (
    <Link href={href} className={cn("flex min-h-11 items-center gap-2.5", className)} aria-label={t("Rakt Response home")}>
      <LogoMark size={size} priority={priority} />
      <LogoWordmark
        tone={tone}
        height={wordmarkHeight}
        className={compact ? "max-sm:!text-[13px] max-sm:!tracking-[0.04em] max-[379px]:hidden" : undefined}
      />
    </Link>
  );
}
