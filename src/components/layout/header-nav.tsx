"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n/client";
import { PUBLIC_NAV } from "./nav-config";

/** Desktop navigation in the header's centre pill; the current page is marked. */
export function HeaderNav({ className }: { className?: string }) {
  const pathname = usePathname();
  const t = useT();
  return (
    <nav className={className} aria-label={t("Main")}>
      {PUBLIC_NAV.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative inline-flex h-9 items-center rounded-full px-3.5 text-sm font-medium whitespace-nowrap transition-colors duration-200",
              active ? "bg-white/10 text-cream" : "text-cream/70 hover:bg-white/5 hover:text-cream",
            )}
          >
            {active ? <span className="mr-2 size-1.5 rounded-full bg-crimson" aria-hidden="true" /> : null}
            {t(item.label)}
          </Link>
        );
      })}
    </nav>
  );
}
