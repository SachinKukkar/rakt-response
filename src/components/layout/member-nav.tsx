"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bell,
  ClipboardList,
  Droplet,
  FileClock,
  HandHeart,
  House,
  LayoutGrid,
  LogOut,
  Menu,
  MessageSquareQuote,
  Settings,
  ShieldCheck,
  Tent,
  UserRound,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useT } from "@/i18n/client";
import { cn } from "@/lib/utils";

const ICONS = {
  home: House,
  requests: HandHeart,
  donations: Droplet,
  profile: UserRound,
  volunteer: ShieldCheck,
  admin: LayoutGrid,
  bell: Bell,
  settings: Settings,
  users: Users,
  list: ClipboardList,
  chart: BarChart3,
  audit: FileClock,
  stories: MessageSquareQuote,
  camps: Tent,
} as const;

export type NavIcon = keyof typeof ICONS;
export interface NavItem {
  href: string;
  label: string;
  icon: NavIcon;
  exact?: boolean;
}

function isActive(pathname: string, item: NavItem) {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

/** Pill-style bottom navigation for phones. */
export function BottomNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const t = useT();
  return (
    <nav
      aria-label={t("Primary")}
      className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-white/95 px-2 pt-2 backdrop-blur lg:hidden"
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-between gap-1 rounded-full bg-navy p-1.5 shadow-lg shadow-navy/20">
        {items.map((item) => {
          const Icon = ICONS[item.icon];
          const active = isActive(pathname, item);
          return (
            <li key={item.href} className="min-w-0 flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-12 flex-col items-center justify-center gap-0.5 rounded-full text-[11px] font-semibold transition-colors",
                  active ? "bg-white text-primary" : "text-white/80 hover:text-white",
                )}
              >
                <Icon className="size-5" aria-hidden="true" />
                <span className="truncate">{t(item.label)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

type NavGroup = { title: string; items: NavItem[] };

/** Sidebar navigation for tablets/desktops (also used inside the phone menu). */
export function SideNav({ groups, onNavigate }: { groups: NavGroup[]; onNavigate?: () => void }) {
  const pathname = usePathname();
  const t = useT();
  return (
    <nav aria-label={t("Account")} className="space-y-6">
      {groups.map((group) => (
        <div key={group.title}>
          <p className="mb-2 px-3 text-xs font-bold tracking-wider text-muted-foreground uppercase">{t(group.title)}</p>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const Icon = ICONS[item.icon];
              const active = isActive(pathname, item);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors",
                      active ? "bg-accent font-semibold text-accent-foreground" : "text-foreground/80 hover:bg-muted hover:text-navy",
                    )}
                  >
                    <Icon className="size-4.5" aria-hidden="true" />
                    {t(item.label)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

/**
 * Phone menu for the member area: every page in the account (the bottom bar
 * only fits the main four or five), plus sign out.
 */
export function MemberMenu({ groups }: { groups: NavGroup[] }) {
  const [open, setOpen] = useState(false);
  const t = useT();
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label={t("Open menu")}>
          <Menu className="size-6" aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[86vw] max-w-sm overflow-y-auto bg-warm p-0">
        <SheetHeader className="border-b p-4 pr-14">
          <SheetTitle className="text-base font-extrabold text-navy">{t("Menu")}</SheetTitle>
          <SheetDescription className="text-xs">{t("Every page in your account.")}</SheetDescription>
        </SheetHeader>
        <div className="p-3">
          <SideNav groups={groups} onNavigate={() => setOpen(false)} />
        </div>
        <form action="/auth/signout" method="post" className="mt-auto border-t p-4">
          <Button type="submit" variant="outline" className="w-full" size="lg">
            <LogOut className="size-4" aria-hidden="true" /> {t("Sign out")}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
