"use client";

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
  MessageSquareQuote,
  Settings,
  ShieldCheck,
  Tent,
  UserRound,
  Users,
} from "lucide-react";
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

/** Sidebar navigation for tablets/desktops. */
export function SideNav({ groups }: { groups: Array<{ title: string; items: NavItem[] }> }) {
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
