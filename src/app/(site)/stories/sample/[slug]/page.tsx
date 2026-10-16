import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Notice, PageHeader } from "@/components/common/page-parts";
import { StoryCover } from "@/components/stories/story-parts";
import { DONATION_TYPE_SHORT, STORY_TYPE_LABELS, bloodGroupName } from "@/lib/constants";
import { SHOW_SAMPLES, findSampleStory } from "@/lib/samples";
import { getLocale, getT } from "@/i18n/server";

async function loadSample(slug: string) {
  return SHOW_SAMPLES ? findSampleStory(slug) : undefined;
}

export async function generateMetadata({ params }: PageProps<"/stories/sample/[slug]">): Promise<Metadata> {
  const [story, t, locale] = await Promise.all([loadSample((await params).slug), getT(), getLocale()]);
  // Samples are placeholders: never offered to search engines.
  return { title: story ? `${story.title[locale]} (${t("Sample")})` : t("Story not found"), robots: { index: false, follow: true } };
}

/** A placeholder story from src/lib/samples.ts, shown with a clear "sample" notice. */
export default async function SampleStoryPage({ params }: PageProps<"/stories/sample/[slug]">) {
  const story = await loadSample((await params).slug);
  if (!story) notFound();
  const [t, locale] = await Promise.all([getT(), getLocale()]);
  const paragraphs = story.body[locale].split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

  return (
    <article className="page-container max-w-3xl py-8 sm:py-12">
      <PageHeader backHref="/stories" backLabel={t("All stories")} eyebrow={t(STORY_TYPE_LABELS[story.story_type])} title={story.title[locale]} />
      <p className="-mt-2 mb-5 text-sm text-muted-foreground">
        {story.display_name} · {story.city}
        {story.donation_type ? ` · ${t(DONATION_TYPE_SHORT[story.donation_type])}` : ""}
        {story.blood_group ? ` · ${t(bloodGroupName(story.blood_group))}` : ""}
      </p>
      <Notice tone="brand" title="Sample story" className="mb-6">
        This is a sample story, written to show how stories will look here. It does not describe a real person or event.
      </Notice>
      <StoryCover type={story.story_type} photo={null} className="mb-7 rounded-3xl" iconClassName="bottom-7 left-7 size-14" />
      <div className="prose-rr text-base leading-8">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      <div className="surface mt-10 flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-2xl font-medium tracking-[-0.03em] text-navy">{t("Have a story of your own?")}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t("Real stories replace these samples once contributors share them with consent.")}</p>
        </div>
        <Button asChild>
          <Link href="/share-your-story">
            <PenLine className="size-4" aria-hidden="true" /> {t("Share your story")}
          </Link>
        </Button>
      </div>
    </article>
  );
}
