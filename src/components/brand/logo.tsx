"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SITE } from "@/lib/constants";
import { useT } from "@/i18n/client";

const SIZES = { xs: 36, sm: 44, md: 56, lg: 96, xl: 160 } as const;

interface LogoProps {
  size?: keyof typeof SIZES;
  className?: string;
  priority?: boolean;
}

/**
 * The supplied Rakt Response Team logo, always shown at its original square
 * proportions (never stretched or redrawn).
 */
export function LogoMark({ size = "sm", className, priority }: LogoProps) {
  const px = SIZES[size];
  const t = useT();
  return (
    <Image
      src={SITE.logo}
      alt={t("Rakt Response Team logo")}
      width={px}
      height={px}
      priority={priority}
      sizes={`${px}px`}
      className={cn("shrink-0 rounded-full bg-white object-contain", className)}
      style={{ width: px, height: px }}
    />
  );
}

export function LogoLockup({
  size = "sm",
  href = "/",
  priority,
  className,
  tone = "default",
}: LogoProps & { href?: string; tone?: "default" | "light" }) {
  const t = useT();
  return (
    <Link href={href} className={cn("flex min-h-11 items-center gap-2.5 rounded-full", className)} aria-label={t("Rakt Response home")}>
      <LogoMark size={size} priority={priority} className="ring-1 ring-black/5" />
      <span className="flex flex-col leading-none">
        <span className={cn("text-[17px] font-extrabold tracking-tight", tone === "light" ? "text-white" : "text-navy")}>
          <span className={tone === "light" ? "text-white" : "text-primary"}>Rakt</span> Response
        </span>
        <span className={cn("mt-1 hidden text-[10.5px] font-medium tracking-wide sm:block", tone === "light" ? "text-white/80" : "text-muted-foreground")}>
          {t("We Respond · We Support · We Save Lives")}
        </span>
      </span>
    </Link>
  );
}
