"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n/client";

/**
 * The Rakt Response mark: a blood drop whose base turns into a reply bubble's
 * tail — rakt (blood) + response (an answer). One flat shape, drawn by hand;
 * it is also the page motif (photo masks, button corners, bullets).
 */
export const MARK_PATH =
  "M50 4 C50 4 12 44 12 76 A38 38 0 0 0 15.56 92.06 L9 112 L28.20 107.13 A38 38 0 0 0 88 76 C88 44 50 4 50 4 Z";
export const MARK_VIEWBOX = "6 2 86 114";

const SIZES = { xs: 30, sm: 36, md: 48, lg: 88, xl: 150 } as const;

interface LogoProps {
  size?: keyof typeof SIZES;
  className?: string;
  /** Kept for API compatibility with the old raster logo. */
  priority?: boolean;
  /** "brand" = red mark; "light" = white mark for red or dark grounds. */
  tone?: "brand" | "light";
}

/** The mark on its own (height in px from `size`). */
export function LogoMark({ size = "sm", className, tone = "brand" }: LogoProps) {
  const t = useT();
  const h = SIZES[size];
  return (
    <svg
      viewBox={MARK_VIEWBOX}
      width={Math.round(h * (86 / 114))}
      height={h}
      role="img"
      aria-label={t("Rakt Response logo")}
      className={cn("shrink-0", className)}
    >
      <path d={MARK_PATH} fill={tone === "light" ? "#ffffff" : "var(--primary)"} />
    </svg>
  );
}

/** Mark + wordmark ("Rakt" in red, "Response" in navy), linking home. */
export function LogoLockup({
  size = "sm",
  href = "/",
  className,
  tone = "default",
}: Omit<LogoProps, "tone"> & { href?: string; tone?: "default" | "light" }) {
  const t = useT();
  const light = tone === "light";
  return (
    <Link href={href} className={cn("flex min-h-11 items-center gap-2.5 rounded-full", className)} aria-label={t("Rakt Response home")}>
      <LogoMark size={size} tone={light ? "light" : "brand"} />
      <span className="flex flex-col leading-none">
        <span className={cn("font-display text-[19px] font-semibold tracking-[-0.02em] whitespace-nowrap", light ? "text-white" : "text-navy")}>
          <span className={light ? "text-white" : "text-primary"}>Rakt</span> Response
        </span>
      </span>
    </Link>
  );
}
