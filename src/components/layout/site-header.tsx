import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogoLockup } from "@/components/brand/logo";
import { getT } from "@/i18n/server";
import { AccountLink } from "./account-link";
import { HeaderNav } from "./header-nav";
import { LanguageToggle } from "./language-toggle";
import { MobileMenu } from "./mobile-menu";

export async function SiteHeader() {
  const t = await getT();
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-warm/90 backdrop-blur-md supports-[backdrop-filter]:bg-warm/75">
      <div className="page-container flex h-16 items-center justify-between gap-3 xl:h-[4.5rem]">
        <LogoLockup size="sm" priority />
        {/* The full menu needs the room of a laptop screen; smaller screens use the menu button. */}
        <HeaderNav className="hidden items-center gap-0.5 xl:flex" />
        <div className="flex items-center gap-1.5">
          <LanguageToggle className="px-2.5 sm:px-3" />
          <AccountLink className="hidden whitespace-nowrap sm:inline-flex" />
          <Button asChild className="hidden sm:inline-flex">
            <Link href="/register">{t("Become a Donor")}</Link>
          </Button>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
