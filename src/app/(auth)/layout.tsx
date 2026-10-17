import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { LogoMark, LogoWordmark } from "@/components/brand/logo";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { SITE } from "@/lib/constants";
import { getT } from "@/i18n/server";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const t = await getT();
  return (
    <div className="flex min-h-full flex-1 flex-col bg-cream">
      <div className="brand-band relative overflow-hidden pb-28 text-cream">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 pt-4">
          <Link href="/" className="-ml-2 inline-flex min-h-11 items-center gap-1 rounded-full px-3 text-sm font-medium text-cream/80 hover:text-cream">
            <ChevronLeft className="size-4" aria-hidden="true" /> {t("Home")}
          </Link>
          <LanguageToggle tone="dark" className="h-11 border-white/20" />
        </div>
        <div className="mx-auto flex max-w-lg flex-col items-center px-4 pt-3 text-center">
          <Link href="/" className="flex flex-col items-center gap-4 rounded-3xl" aria-label={t("Rakt Response home")}>
            {/* Cream disc so the red mark stands out on the red band. */}
            <span className="grid size-28 place-items-center rounded-full bg-cream shadow-lg shadow-black/15">
              <LogoMark size="lg" priority />
            </span>
            <LogoWordmark tone="cream" height={17} />
          </Link>
          <p className="label-mono mt-4 text-cream/60">{t(SITE.tagline)}</p>
        </div>
      </div>
      <main id="main" className="relative z-10 mx-auto -mt-20 w-full max-w-lg flex-1 px-4 pb-12">
        {children}
      </main>
    </div>
  );
}
