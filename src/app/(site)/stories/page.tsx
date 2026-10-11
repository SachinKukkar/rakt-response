import type { Metadata } from "next";
import Link from "next/link";
import { MessageSquareQuote, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, Notice, PageHeader } from "@/components/common/page-parts";
import { Pagination, parsePage } from "@/components/common/pagination";
import { StoryCard, TrustLabelGuide } from "@/components/stories/story-parts";
import { listPublishedStories } from "@/lib/data/public";
import { STORY_CATEGORIES, type StoryCategory } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Stories",
  description: "Experiences shared by donors, patients' families, volunteers and camp organisers — published with consent.",
};

const PAGE_SIZE = 9;

export default async function StoriesPage({ searchParams }: PageProps<"/stories">) {
  const params = await searchParams;
  const raw = Array.isArray(params.category) ? params.category[0] : params.category;
  const category = raw && raw in STORY_CATEGORIES ? (raw as StoryCategory) : null;
  const page = parsePage(params.page);
  const result = await listPublishedStories(category ? STORY_CATEGORIES[category].types : null, PAGE_SIZE, (page - 1) * PAGE_SIZE);

  const tabs: Array<{ key: StoryCategory | null; label: string }> = [
    { key: null, label: "All" },
    ...(Object.keys(STORY_CATEGORIES) as StoryCategory[]).map((key) => ({ key, label: STORY_CATEGORIES[key].label })),
  ];

  return (
    <div className="page-container py-8 sm:py-12">
      <PageHeader
        eyebrow="Our Impact"
        title="Stories"
        description="Real experiences from our community. Every story is reviewed and published only with the contributor's permission."
        actions={
          <Button asChild variant="outline">
            <Link href="/share-your-story">
              <PenLine className="size-4" aria-hidden="true" /> Share your story
            </Link>
          </Button>
        }
      />
      <nav aria-label="Story categories" className="-mx-4 mb-5 overflow-x-auto px-4">
        <ul className="flex w-max gap-2">
          {tabs.map((tab) => {
            const active = tab.key === category;
            return (
              <li key={tab.label}>
                <Link
                  href={tab.key ? `/stories?category=${tab.key}` : "/stories"}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex h-10 items-center rounded-full border px-4 text-sm font-semibold whitespace-nowrap",
                    active ? "border-primary bg-primary text-white" : "bg-white text-navy hover:border-primary/40",
                  )}
                >
                  {tab.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {result === null ? (
        <Notice title="Stories are unavailable right now">Please try again in a little while.</Notice>
      ) : result.stories.length === 0 ? (
        <EmptyState
          icon={MessageSquareQuote}
          title={category ? `No ${STORY_CATEGORIES[category].label.toLowerCase()} published yet` : "No stories published yet"}
          description="We never publish example or invented stories. Real experiences will appear here after review."
          action={
            <Button asChild variant="outline">
              <Link href="/share-your-story">Share your experience</Link>
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {result.stories.map((story) => (
              <StoryCard key={story.slug} story={story} />
            ))}
          </div>
          <Pagination page={page} pageSize={PAGE_SIZE} total={result.total} basePath="/stories" params={{ category: category ?? undefined }} />
        </>
      )}
      <div className="mt-8">
        <TrustLabelGuide />
      </div>
    </div>
  );
}
