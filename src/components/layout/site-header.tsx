import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogoLockup } from "@/components/brand/logo";
import { AccountLink } from "./account-link";
import { MobileMenu } from "./mobile-menu";
import { PUBLIC_NAV } from "./nav-config";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-warm/90 backdrop-blur supports-[backdrop-filter]:bg-warm/80">
      <div className="page-container flex h-16 items-center justify-between gap-3">
        <LogoLockup size="sm" priority />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {PUBLIC_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-muted hover:text-navy"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1.5">
          <AccountLink className="hidden sm:inline-flex" />
          <Button asChild className="hidden sm:inline-flex">
            <Link href="/register">Become a Donor</Link>
          </Button>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
