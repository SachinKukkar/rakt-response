import { LogoLockup } from "@/components/brand/logo";
import { ArrowLink } from "@/components/site/arrow-link";
import { getT } from "@/i18n/server";
import { AccountLink } from "./account-link";
import { HeaderNav } from "./header-nav";
import { LanguageToggle } from "./language-toggle";
import { MobileMenu } from "./mobile-menu";

/** Frosted pill, readable over photographs, dark sections and cream sections alike. */
const PILL = "border border-white/12 bg-night/75 text-cream shadow-[0_8px_24px_-12px_rgba(18,4,7,0.5)] backdrop-blur-xl";

/**
 * Floating header: the page scrolls underneath it. Gaps between the pills let
 * clicks through to the page.
 */
export async function SiteHeader() {
  const t = await getT();
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40">
      <div className="wide flex h-[var(--header-h)] items-center justify-between gap-2">
        <div className={`pointer-events-auto flex h-12 items-center rounded-full pr-4 pl-2.5 ${PILL}`}>
          <LogoLockup priority wordmarkHeight={12} className="min-h-0" />
        </div>
        <HeaderNav className={`pointer-events-auto hidden h-12 items-center gap-0.5 rounded-full px-1.5 xl:flex ${PILL}`} />
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2">
          <LanguageToggle tone="dark" className={`h-12 px-3.5 font-medium ${PILL} hover:bg-[rgba(30,10,14,0.8)]`} />
          <AccountLink variant="pill" className={`hidden h-12 px-4 font-medium lg:inline-flex ${PILL} hover:border-white/25`} />
          <ArrowLink href="/register" className="hidden sm:inline-flex">
            {t("Become a Donor")}
          </ArrowLink>
          <MobileMenu className={PILL} />
        </div>
      </div>
    </header>
  );
}
