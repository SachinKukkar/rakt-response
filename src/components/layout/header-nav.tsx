"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n/client";
import { PUBLIC_NAV } from "./nav-config";

/** Desktop navigation; the page you are on is marked with a red underline. */
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
              "relative rounded-full px-3 py-2 text-sm whitespace-nowrap transition-colors",
              active ? "font-semibold text-navy" : "font-medium text-foreground/75 hover:bg-muted hover:text-navy",
            )}
          >
            {t(item.label)}
            {active ? <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-primary" aria-hidden="true" /> : null}
          </Link>
        );
      })}
    </nav>
  );
}
