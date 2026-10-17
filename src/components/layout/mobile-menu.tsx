"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, X } from "lucide-react";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { LogoLockup } from "@/components/brand/logo";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n/client";
import { AccountLink } from "./account-link";
import { LanguageToggle } from "./language-toggle";
import { MORE_LINKS, PUBLIC_NAV } from "./nav-config";

/** The "Menu" pill and the full-screen menu it opens (below desktop width). */
export function MobileMenu({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const t = useT();
  const close = () => setOpen(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className={cn("press inline-flex h-12 items-center rounded-full px-4 text-sm font-medium xl:hidden", className)}
          aria-label={t("Open menu")}
        >
          {t("Menu")}
        </button>
      </SheetTrigger>
      <SheetContent side="top" showCloseButton={false} className="h-dvh max-h-dvh gap-0 overflow-y-auto border-0 bg-cream p-0 text-navy">
        <div className="wide flex h-[var(--header-h)] shrink-0 items-center justify-between">
          <div onClick={close}>
            <LogoLockup tone="maroon" wordmarkHeight={12} />
          </div>
          <SheetClose asChild>
            <button type="button" className="press inline-flex h-12 items-center gap-2 rounded-full border border-navy/15 px-4 text-sm font-medium">
              <X className="size-4" aria-hidden="true" />
              {t("Close")}
            </button>
          </SheetClose>
        </div>
        <SheetTitle className="sr-only">{t("Menu")}</SheetTitle>
        <SheetDescription className="sr-only">{t("All pages of Rakt Response")}</SheetDescription>
        <nav className="wide flex-1 pt-4 pb-6" aria-label={t("Main")}>
          <ul className="divide-y divide-navy/10 border-y border-navy/10">
            {PUBLIC_NAV.map((item, i) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={close}
                  aria-current={pathname === item.href ? "page" : undefined}
                  className="group flex min-h-16 items-center gap-4 py-3"
                >
                  <span className="label-mono w-7 text-navy/45 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  <span className="display-sm flex-1">{t(item.label)}</span>
                  <ArrowRight className="size-5 text-primary transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
          <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-1">
            {MORE_LINKS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} onClick={close} className="flex min-h-11 items-center text-[15px] text-navy/75 hover:text-navy">
                  {t(item.label)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="wide safe-bottom grid shrink-0 gap-2.5 border-t border-navy/10 pt-4 pb-6">
          <Link
            href="/register"
            onClick={close}
            className="press inline-flex h-14 items-center justify-between rounded-full bg-primary pr-2 pl-6 text-base font-medium text-white"
          >
            {t("Become a Donor")}
            <span className="grid size-10 place-items-center rounded-full bg-white text-primary" aria-hidden="true">
              <ArrowRight className="size-4" />
            </span>
          </Link>
          <Link
            href="/blood-requests/new"
            onClick={close}
            className="press inline-flex h-14 items-center justify-center rounded-full border border-navy/20 text-base font-medium"
          >
            {t("Request blood")}
          </Link>
          <div className="flex items-center justify-between gap-2 pt-1">
            <div onClick={close}>
              <AccountLink variant="menu" className="text-navy hover:bg-navy/5" />
            </div>
            <LanguageToggle tone="light" className="h-11" />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
