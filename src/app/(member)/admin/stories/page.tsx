import type { Metadata } from "next";
import Link from "next/link";
import { MessageSquareQuote } from "lucide-react";
import { EmptyState, PageHeader } from "@/components/common/page-parts";
import { Pagination, parsePage } from "@/components/common/pagination";
import { StoryStatusBadge } from "@/components/common/status-badge";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { STORY_TYPE_LABELS, type StoryStatus, type StoryType } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Story moderation" };

const TABS: Record<string, { label: string; statuses: StoryStatus[] }> = {
  review: { label: "To review", statuses: ["submitted", "under_review", "verification_requested"] },
  approved: { label: "Approved", statuses: ["approved"] },
  published: { label: "Published", statuses: ["published"] },
  other: { label: "Rejected / archived", statuses: ["rejected", "unpublished", "archived", "draft"] },
};
const PAGE_SIZE = 20;

export default async function AdminStoriesPage({ searchParams }: PageProps<"/admin/stories">) {
  await requireAdmin();
  const params = await searchParams;
  const tabRaw = Array.isArray(params.tab) ? params.tab[0] : params.tab;
  const tab = tabRaw && tabRaw in TABS ? tabRaw : "review";
  const page = parsePage(params.page);
  const supabase = await createClient();
  const { data, count } = await supabase
    .from("impact_stories")
    .select("id, story_type, title, contributor_name, status, created_at, withdrawn_at, photo_path", { count: "exact" })
    .in("status", TABS[tab].statuses)
    .order("created_at", { ascending: tab === "review" })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  const stories = (data ?? []) as Array<{ id: string; story_type: StoryType; title: string; contributor_name: string; status: StoryStatus; created_at: string; withdrawn_at: string | null; photo_path: string | null }>;

  return (
    <div className="space-y-4">
      <PageHeader eyebrow="Administrator" title="Story moderation" description="Nothing is public until you publish it, and only with the contributor's consent." />
      <nav aria-label="Moderation status" className="-mx-4 overflow-x-auto px-4">
        <ul className="flex w-max gap-2">
          {Object.entries(TABS).map(([key, t]) => (
            <li key={key}>
              <Link
                href={`/admin/stories?tab=${key}`}
                aria-current={key === tab ? "page" : undefined}
                className={cn("inline-flex h-10 items-center rounded-full border px-4 text-sm font-semibold", key === tab ? "border-primary bg-primary text-white" : "bg-white text-navy")}
              >
                {t.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      {stories.length === 0 ? (
        <EmptyState icon={MessageSquareQuote} title="No stories here" />
      ) : (
        <ul className="space-y-2">
          {stories.map((s) => (
            <li key={s.id}>
              <Link href={`/admin/stories/${s.id}`} className="surface flex flex-wrap items-center justify-between gap-2 p-4 hover:border-primary/40">
                <span className="min-w-0">
                  <span className="block font-semibold text-navy">{s.title}</span>
                  <span className="block text-xs text-muted-foreground">
                    {STORY_TYPE_LABELS[s.story_type]} · {s.contributor_name} · {formatDate(s.created_at)}
                    {s.photo_path ? " · has photo" : ""}
                    {s.withdrawn_at ? " · withdrawn" : ""}
                  </span>
                </span>
                <StoryStatusBadge status={s.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Pagination page={page} pageSize={PAGE_SIZE} total={count ?? 0} basePath="/admin/stories" params={{ tab }} />
    </div>
  );
}
