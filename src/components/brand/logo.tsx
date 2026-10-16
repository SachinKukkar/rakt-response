"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SITE } from "@/lib/constants";
import { useT } from "@/i18n/client";

/*
 * The supplied Rakt Response logo, cut out of the supplied file
 * (public/brand/logo-original-supplied.png) without redrawing it:
 *   logo-mark.png              the drop held in a hand                         978 × 1074
 *   logo-wordmark(-cream).png  "RAKT RESPONSE" in maroon, or cream on dark    2367 × 240
 *   logo-full.png              mark, wordmark and "SINCE 2026"                2367 × 1614
 */
const MARK = { w: 978, h: 1074 };
const WORDMARK = { w: 2367, h: 240 };
const FULL = { w: 2367, h: 1614 };

/** Heights of the mark in CSS pixels. */
const SIZES = { xs: 30, sm: 38, md: 52, lg: 84, xl: 150 } as const;

export function LogoMark({ size = "sm", className, priority }: { size?: keyof typeof SIZES; className?: string; priority?: boolean }) {
  const t = useT();
  const height = SIZES[size];
  const width = Math.round((height * MARK.w) / MARK.h);
  return (
    <Image
      src={SITE.logo}
      alt={t("Rakt Response logo")}
      width={width}
      height={height}
      priority={priority}
      sizes={`${width}px`}
      className={cn("shrink-0 object-contain", className)}
      style={{ width, height }}
    />
  );
}

/** "RAKT RESPONSE" from the logo. Decorative: pair it with an accessible name. */
export function LogoWordmark({ tone = "maroon", height = 13, className }: { tone?: "maroon" | "cream"; height?: number; className?: string }) {
  const width = Math.round((height * WORDMARK.w) / WORDMARK.h);
  return (
    <Image
      src={tone === "cream" ? "/brand/logo-wordmark-cream.png" : "/brand/logo-wordmark.png"}
      alt=""
      aria-hidden="true"
      width={width}
      height={height}
      sizes={`${width}px`}
      className={cn("shrink-0", className)}
      style={{ width, height }}
    />
  );
}

/** Mark and wordmark side by side, linking home. */
export function LogoLockup({
  href = "/",
  tone = "cream",
  size = "xs",
  wordmarkHeight = 12,
  priority,
  className,
}: {
  href?: string;
  tone?: "maroon" | "cream";
  size?: keyof typeof SIZES;
  wordmarkHeight?: number;
  priority?: boolean;
  className?: string;
}) {
  const t = useT();
  return (
    <Link href={href} className={cn("flex min-h-11 items-center gap-2.5", className)} aria-label={t("Rakt Response home")}>
      <LogoMark size={size} priority={priority} />
      <LogoWordmark tone={tone} height={wordmarkHeight} />
    </Link>
  );
}

/** The complete logo as supplied: mark, wordmark and "SINCE 2026". */
export function LogoFull({ width = 280, priority, className }: { width?: number; priority?: boolean; className?: string }) {
  const t = useT();
  const height = Math.round((width * FULL.h) / FULL.w);
  return (
    <Image
      src="/brand/logo-full.png"
      alt={t("Rakt Response, since 2026")}
      width={width}
      height={height}
      priority={priority}
      sizes={`${width}px`}
      className={cn("shrink-0", className)}
      style={{ width, height }}
    />
  );
}
