import Link from "next/link";
import { LogoLockup } from "@/components/brand/logo";
import { getT } from "@/i18n/server";
import { AccountLink } from "./account-link";
import { LanguageToggle } from "./language-toggle";
import { MobileMenu } from "./mobile-menu";
import { HEADER_NAV } from "./nav-config";

/** A plain bar: the mark and name, a few links, the language and one action. */
export async function SiteHeader() {
  const t = await getT();
  return (
    <header className="sticky top-0 z-40 bg-warm">
      <div className="page-container flex h-16 items-center justify-between gap-3 md:h-20">
        <LogoLockup size="sm" priority />
        <nav className="hidden items-center gap-1 lg:flex" aria-label={t("Main")}>
          {HEADER_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="press rounded-full px-3 py-2 font-display text-[1rem] font-medium whitespace-nowrap text-navy underline-offset-4 hover:underline"
            >
              {t(item.label)}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1.5">
          <LanguageToggle className="px-2.5 sm:px-3" />
          <AccountLink className="hidden sm:inline-flex" />
          <Link
            href="/register"
            className="bubble press hidden min-h-11 items-center bg-primary px-5 font-display text-[1rem] font-semibold whitespace-nowrap text-white hover:bg-[#a51a29] sm:inline-flex"
          >
            {t("Become a Donor")}
          </Link>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
