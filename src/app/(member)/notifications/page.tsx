import type { Metadata } from "next";
import Link from "next/link";
import { Bell, BellOff } from "lucide-react";
import { ActionForm } from "@/components/common/action-form";
import { EmptyState, PageHeader } from "@/components/common/page-parts";
import { Pagination, parsePage } from "@/components/common/pagination";
import { clearReadNotifications, markNotificationsRead } from "@/actions/profile";
import { requireViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/format";
import type { NotificationRow } from "@/lib/types";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Notifications" };

const PAGE_SIZE = 20;

export default async function NotificationsPage({ searchParams }: PageProps<"/notifications">) {
  await requireViewer("/notifications");
  const page = parsePage((await searchParams).page);
  const supabase = await createClient();
  const { data, count } = await supabase
    .from("notifications")
    .select("id, kind, title, body, link, read_at, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  const items = (data ?? []) as NotificationRow[];
  const unread = items.some((n) => !n.read_at);

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="In-app updates about your profile, donations and requests. We never send bulk SMS or WhatsApp messages."
        actions={
          <div className="flex gap-2">
            {unread ? <ActionForm action={markNotificationsRead} label="Mark all read" variant="outline" size="sm" /> : null}
            <ActionForm action={clearReadNotifications} label="Clear read" variant="ghost" size="sm" />
          </div>
        }
      />
      {items.length === 0 ? (
        <EmptyState icon={BellOff} title="You're all caught up" description="Updates about verification, requests and your stories will appear here." />
      ) : (
        <ul className="space-y-2">
          {items.map((n) => (
            <li key={n.id} className={cn("surface flex gap-3 p-4", !n.read_at && "border-primary/25 bg-accent/30")}>
              <Bell className={cn("mt-0.5 size-5 shrink-0", n.read_at ? "text-muted-foreground" : "text-primary")} aria-hidden="true" />
              <div className="min-w-0 flex-1 space-y-1">
                <p className="font-semibold text-navy">
                  {!n.read_at ? <span className="sr-only">Unread: </span> : null}
                  {n.title}
                </p>
                {n.body ? <p className="text-sm text-muted-foreground">{n.body}</p> : null}
                <p className="text-xs text-muted-foreground">{formatDateTime(n.created_at)}</p>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  {n.link ? (
                    <Link href={n.link} className="inline-flex min-h-10 items-center text-sm font-semibold text-primary underline">
                      Open
                    </Link>
                  ) : null}
                  {!n.read_at ? <ActionForm action={markNotificationsRead} fields={{ id: n.id }} label="Mark read" variant="ghost" size="sm" hideAfterSuccess /> : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Pagination page={page} pageSize={PAGE_SIZE} total={count ?? 0} basePath="/notifications" />
    </div>
  );
}
