import { LogoLockup } from "@/components/brand/logo";
import { ArrowLink } from "@/components/site/arrow-link";
import { getT } from "@/i18n/server";
import { AccountLink } from "./account-link";
import { HeaderNav } from "./header-nav";
import { LanguageToggle } from "./language-toggle";
import { MobileMenu } from "./mobile-menu";

/** Light frosted pill: readable over the photo, the red sections and cream alike, and the red logo shows. */
const PILL = "border border-navy/10 bg-cream/90 text-navy shadow-[0_8px_24px_-14px_rgba(29,11,14,0.35)] backdrop-blur-xl";

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
          <LogoLockup tone="maroon" priority wordmarkHeight={12} className="min-h-0" />
        </div>
        <HeaderNav className={`pointer-events-auto hidden h-12 items-center gap-0.5 rounded-full px-1.5 xl:flex ${PILL}`} />
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2">
          <LanguageToggle tone="light" className={`h-12 px-3.5 font-medium ${PILL} hover:bg-white`} />
          <AccountLink variant="pill" className={`hidden h-12 px-4 font-medium lg:inline-flex ${PILL} hover:bg-white`} />
          <ArrowLink href="/register" className="hidden sm:inline-flex">
            {t("Become a Donor")}
          </ArrowLink>
          <MobileMenu className={PILL} />
        </div>
      </div>
    </header>
  );
}
