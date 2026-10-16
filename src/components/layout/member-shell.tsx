import Link from "next/link";
import { Bell, LogOut } from "lucide-react";
import { LogoMark, LogoWordmark } from "@/components/brand/logo";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { getT } from "@/i18n/server";
import { Button } from "@/components/ui/button";
import type { Viewer } from "@/lib/auth";
import { BottomNav, MemberMenu, SideNav, type NavItem } from "./member-nav";

function bottomItems(viewer: Viewer): NavItem[] {
  const items: NavItem[] = [{ href: "/dashboard", label: "Home", icon: "home" }];
  if (viewer.isAdmin) {
    // Admins are donors first: their own donor tabs, plus one Admin hub.
    items.push(
      { href: "/requests", label: "Requests", icon: "requests" },
      { href: "/donations", label: "Donations", icon: "donations" },
      { href: "/admin", label: "Admin", icon: "admin" },
    );
  } else if (viewer.isStaff) {
    items.push(
      { href: "/requests", label: "Requests", icon: "requests" },
      { href: "/volunteer", label: "Volunteer", icon: "volunteer" },
      { href: "/donations", label: "Donations", icon: "donations" },
    );
  } else {
    items.push(
      { href: "/requests", label: "Requests", icon: "requests" },
      { href: "/donations", label: "Donations", icon: "donations" },
    );
  }
  items.push({ href: "/profile", label: "Profile", icon: "profile" });
  return items;
}

function sideGroups(viewer: Viewer) {
  const groups: Array<{ title: string; items: NavItem[] }> = [
    {
      title: "My account",
      items: [
        { href: "/dashboard", label: "Dashboard", icon: "home" },
        { href: "/requests", label: "Requests", icon: "requests" },
        { href: "/donations", label: "Donation history", icon: "donations" },
        { href: "/notifications", label: "Notifications", icon: "bell" },
        { href: "/profile", label: "Profile", icon: "profile" },
        { href: "/settings", label: "Privacy & settings", icon: "settings" },
        { href: "/share-your-story/submissions", label: "My stories", icon: "stories" },
      ],
    },
  ];
  if (viewer.isStaff && !viewer.isAdmin) {
    groups.push({
      title: "Volunteer",
      items: [
        { href: "/volunteer", label: "Overview", icon: "volunteer", exact: true },
        { href: "/volunteer/requests", label: "Requests", icon: "list" },
        { href: "/volunteer/donors", label: "Donor directory", icon: "users" },
        { href: "/volunteer/coordination", label: "My coordination", icon: "requests" },
        { href: "/volunteer/donations", label: "Donation records", icon: "donations" },
      ],
    });
  }
  if (viewer.isAdmin) {
    groups.push({
      title: "Administration",
      items: [
        { href: "/admin", label: "Overview", icon: "admin", exact: true },
        { href: "/admin/donors", label: "Donors", icon: "users" },
        { href: "/admin/requests", label: "Requests", icon: "list" },
        { href: "/volunteer/requests", label: "Coordinate requests", icon: "requests" },
        { href: "/volunteer/donors", label: "Donor directory", icon: "users" },
        { href: "/admin/donations", label: "Donations", icon: "donations" },
        { href: "/admin/data-checks", label: "Data checks", icon: "audit" },
        { href: "/admin/users", label: "Users & roles", icon: "profile" },
        { href: "/admin/volunteers", label: "Volunteers", icon: "volunteer" },
        { href: "/admin/stories", label: "Stories", icon: "stories" },
        { href: "/admin/camps", label: "Camps & impact data", icon: "camps" },
        { href: "/admin/analytics", label: "Analytics", icon: "chart" },
        { href: "/admin/audit-logs", label: "Audit logs", icon: "audit" },
        { href: "/admin/settings", label: "Settings", icon: "settings" },
      ],
    });
  }
  return groups;
}

export async function MemberShell({ viewer, unread, children }: { viewer: Viewer; unread: number; children: React.ReactNode }) {
  const t = await getT();
  const name = viewer.profile?.display_name || viewer.profile?.full_name?.split(" ")[0] || t("there");
  return (
    <div className="flex min-h-full flex-1 flex-col bg-warm">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-cream/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/dashboard" className="flex min-h-11 items-center gap-2.5" aria-label={t("Rakt Response dashboard")}>
            <LogoMark size="xs" priority />
            <span className="leading-tight">
              <LogoWordmark height={11} className="block" />
              <span className="mt-1.5 block max-w-[11rem] truncate text-xs text-muted-foreground">{t("Hello, {name}", { name })}</span>
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <LanguageToggle compact className="px-2.5" />
            <Button asChild variant="ghost" size="icon" className="relative" aria-label={unread ? t("Notifications, {count} unread", { count: unread }) : t("Notifications")}>
              <Link href="/notifications">
                <Bell className="size-5.5" />
                {unread > 0 ? (
                  <span className="absolute top-1.5 right-1.5 grid min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
                    {unread > 9 ? "9+" : unread}
                  </span>
                ) : null}
              </Link>
            </Button>
            {/* On phones, sign out lives in the menu so the header fits. */}
            <form action="/auth/signout" method="post" className="hidden lg:block">
              <Button type="submit" variant="ghost" size="icon" aria-label={t("Sign out")}>
                <LogOut className="size-5" />
              </Button>
            </form>
            <MemberMenu groups={sideGroups(viewer)} />
          </div>
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-8 px-4 pt-5 pb-32 sm:px-6 lg:pb-12">
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-24">
            <SideNav groups={sideGroups(viewer)} />
          </div>
        </aside>
        <main id="main" className="min-w-0 flex-1">
          {children}
        </main>
      </div>
      <BottomNav items={bottomItems(viewer)} />
    </div>
  );
}
