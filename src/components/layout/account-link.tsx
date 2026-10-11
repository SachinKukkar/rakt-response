"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { LayoutDashboard, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Public pages are static, so the header cannot know the session on the
 * server. This reads only whether a Supabase auth cookie exists (no token
 * contents) to choose between "Sign in" and "Dashboard". Access control
 * happens on the server; this is purely a navigation hint.
 */
function hasSessionCookie(): boolean {
  return document.cookie.split(";").some((c) => /^\s*sb-[^=]+-auth-token(\.\d+)?=/.test(c));
}

const subscribe = () => () => {};

export function AccountLink({ className, variant = "pill" }: { className?: string; variant?: "pill" | "menu" }) {
  const signedIn = useSyncExternalStore(subscribe, hasSessionCookie, () => false);
  const href = signedIn ? "/dashboard" : "/login";
  const label = signedIn ? "Dashboard" : "Sign in";
  const Icon = signedIn ? LayoutDashboard : LogIn;
  return (
    <Link
      href={href}
      className={cn(
        variant === "pill"
          ? "inline-flex h-11 items-center gap-2 rounded-full border border-navy/15 bg-white px-4 text-sm font-semibold text-navy hover:border-navy/40"
          : "flex min-h-12 items-center gap-3 rounded-xl px-3 font-semibold text-navy hover:bg-muted",
        className,
      )}
    >
      <Icon className="size-4" aria-hidden="true" />
      {label}
    </Link>
  );
}
