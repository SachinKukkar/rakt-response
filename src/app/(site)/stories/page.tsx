import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/learn/learn-parts";
import Link from "next/link";
import { MessageSquareQuote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, Notice, SampleNote } from "@/components/common/page-parts";
import { Pagination, parsePage } from "@/components/common/pagination";
import { SampleStoryCard, StoryCard, TrustLabelGuide } from "@/components/stories/story-parts";
import { listPublishedStories } from "@/lib/data/public";
import { STORY_CATEGORIES, type StoryCategory, type StoryType } from "@/lib/constants";
import { SAMPLE_STORIES, SHOW_SAMPLES, type SampleStory } from "@/lib/samples";
import { cn } from "@/lib/utils";
import { PHOTOS } from "@/lib/photos";
import { ArrowLink } from "@/components/site/arrow-link";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return pageMetadata(t("Stories"), t("Experiences shared by donors, patients' families, volunteers and camp organisers — published with consent."));
}

const PAGE_SIZE = 9;

export default async function StoriesPage({ searchParams }: PageProps<"/stories">) {
  const t = await getT();
  const params = await searchParams;
  const raw = Array.isArray(params.category) ? params.category[0] : params.category;
  const category = raw && raw in STORY_CATEGORIES ? (raw as StoryCategory) : null;
  const page = parsePage(params.page);
  const result = await listPublishedStories(category ? STORY_CATEGORIES[category].types : null, PAGE_SIZE, (page - 1) * PAGE_SIZE);

  // Sample stories stand in only while nothing real has been published at all.
  let samples: SampleStory[] = [];
  if (SHOW_SAMPLES && result && result.stories.length === 0 && page === 1) {
    const anything = category ? await listPublishedStories(null, 1) : result;
    if (anything && anything.stories.length === 0) {
      const types: readonly StoryType[] | null = category ? STORY_CATEGORIES[category].types : null;
      samples = SAMPLE_STORIES.filter((story) => !types || types.includes(story.story_type));
    }
  }

  const tabs: Array<{ key: StoryCategory | null; label: string }> = [
    { key: null, label: "All" },
    ...(Object.keys(STORY_CATEGORIES) as StoryCategory[]).map((key) => ({ key, label: STORY_CATEGORIES[key].label })),
  ];

  return (
    <>
      <PageHero
        photo={PHOTOS.donorChair}
        eyebrow={t("Stories")}
        title={t("Stories that")}
        highlight={t("kept us going.")}
        subtitle={t("Donors, families and volunteers — in their own words, published only with their consent.")}
        chips={[t("Reviewed before publishing"), t("Withdraw any time")]}
      >
        <ArrowLink href="/share-your-story" size="lg">
          {t("Share your story")}
        </ArrowLink>
      </PageHero>
    <div className="page-container py-8">
      <nav aria-label={t("Story categories")} className="-mx-4 mb-5 overflow-x-auto px-4">
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
                  {t(tab.label)}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {result === null ? (
        <Notice title={t("Stories are unavailable right now")}>{t("Please try again in a little while.")}</Notice>
      ) : samples.length ? (
        <>
          <SampleNote className="mb-5">Sample stories, shown until real ones are published.</SampleNote>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {samples.map((story) => (
              <SampleStoryCard key={story.slug} story={story} />
            ))}
          </div>
        </>
      ) : result.stories.length === 0 ? (
        <EmptyState
          icon={MessageSquareQuote}
          title={
            category
              ? t("No {category} published yet", { category: t(STORY_CATEGORIES[category].label).toLowerCase() })
              : t("No stories published yet")
          }
          description={t("Stories appear here after contributors share them and our team reviews them with their consent.")}
          action={
            <Button asChild variant="outline">
              <Link href="/share-your-story">{t("Share your experience")}</Link>
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
    </>
  );
}
