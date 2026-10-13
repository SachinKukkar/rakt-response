"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { LogoMark } from "@/components/brand/logo";
import { useT } from "@/i18n/client";
import { AccountLink } from "./account-link";
import { MORE_LINKS, PUBLIC_NAV } from "./nav-config";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const t = useT();
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label={t("Open menu")}>
          <Menu className="size-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[86vw] max-w-sm overflow-y-auto bg-warm p-0">
        <SheetHeader className="flex-row items-center gap-3 border-b p-4 pr-14">
          <Link href="/" onClick={() => setOpen(false)} className="shrink-0 rounded-full" aria-label={t("Rakt Response home")}>
            <LogoMark size="sm" />
          </Link>
          <div>
            <SheetTitle className="text-base font-extrabold text-navy">
              <span className="text-primary">Rakt</span> Response
            </SheetTitle>
            <SheetDescription className="text-xs">{t("We Respond, We Support, We Save Lives.")}</SheetDescription>
          </div>
        </SheetHeader>
        <nav className="flex flex-col gap-1 p-3" aria-label={t("Main")}>
          {[...PUBLIC_NAV, ...MORE_LINKS].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex min-h-12 items-center rounded-xl px-3 font-medium text-foreground hover:bg-muted"
            >
              {t(item.label)}
            </Link>
          ))}
        </nav>
        <div className="mt-auto space-y-2 border-t p-4">
          <Button asChild className="w-full" size="lg">
            <Link href="/register" onClick={() => setOpen(false)}>
              {t("Become a Donor")}
            </Link>
          </Button>
          <div onClick={() => setOpen(false)}>
            <AccountLink variant="menu" />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
