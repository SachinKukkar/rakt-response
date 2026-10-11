import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Tent } from "lucide-react";
import { Notice, PageHeader } from "@/components/common/page-parts";
import { TrustBadges, TrustLabelGuide } from "@/components/stories/story-parts";
import { createPublicClient } from "@/lib/supabase/public";
import { publicStoryPhotoUrl } from "@/lib/env";
import { DONATION_TYPE_SHORT, STORY_TYPE_LABELS, type BloodGroup, type DonationType, type StoryType } from "@/lib/constants";
import { formatDate, formatNumber } from "@/lib/format";

export const revalidate = 300;

interface PublishedStory {
  slug: string;
  story_type: StoryType;
  title: string;
  body: string;
  display_name: string | null;
  city: string | null;
  photo_path: string | null;
  experience_period: string | null;
  donation_type: DonationType | null;
  blood_group: BloodGroup | null;
  identity_verified: boolean;
  experience_reviewed: boolean;
  donation_verified: boolean;
  verification_updated_at: string | null;
  published_at: string;
  camp_name: string | null;
  camp_date: string | null;
  camp_city: string | null;
  camp_district: string | null;
  camp_partners: string | null;
  camp_verified_donors: number | null;
  camp_verified_units: number | null;
  camp_data_verified_at: string | null;
}

async function loadStory(slug: string): Promise<PublishedStory | null> {
  if (!/^[a-z0-9-]{3,90}$/.test(slug)) return null;
  const client = createPublicClient();
  if (!client) return null;
  const { data } = await client.rpc("get_published_story", { p_slug: slug });
  return (Array.isArray(data) ? data[0] : null) as PublishedStory | null;
}

export async function generateMetadata({ params }: PageProps<"/stories/[slug]">): Promise<Metadata> {
  const story = await loadStory((await params).slug);
  return story ? { title: story.title, description: story.body.slice(0, 150) } : { title: "Story not found" };
}

export default async function StoryPage({ params }: PageProps<"/stories/[slug]">) {
  const story = await loadStory((await params).slug);
  if (!story) notFound();
  const photo = publicStoryPhotoUrl(story.photo_path);
  const paragraphs = story.body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

  return (
    <article className="page-container max-w-3xl py-8 sm:py-12">
      <PageHeader backHref="/stories" backLabel="All stories" eyebrow={STORY_TYPE_LABELS[story.story_type]} title={story.title} />
      <p className="-mt-2 mb-4 text-sm text-muted-foreground">
        {story.display_name ?? "Shared anonymously"}
        {story.city ? ` · ${story.city}` : ""}
        {story.experience_period ? ` · ${story.experience_period}` : ""}
        {story.donation_type ? ` · ${DONATION_TYPE_SHORT[story.donation_type]}` : ""}
        {story.blood_group ? ` · ${story.blood_group}` : ""} · Published {formatDate(story.published_at)}
      </p>
      <div className="mb-5">
        <TrustBadges identity={story.identity_verified} experience={story.experience_reviewed} donation={story.donation_verified} />
      </div>
      {photo ? (
        <div className="relative mb-6 aspect-[16/10] overflow-hidden rounded-2xl bg-muted">
          <Image src={photo} alt="Photo shared by the contributor" fill sizes="(min-width: 768px) 720px, 100vw" className="object-cover" priority />
        </div>
      ) : null}
      <div className="prose-rr">
        {paragraphs.map((p, i) => (
          <p key={i} className="whitespace-pre-line">
            {p}
          </p>
        ))}
      </div>

      {story.camp_name ? (
        <aside className="surface mt-6 p-4" aria-label="Camp details">
          <p className="flex items-center gap-2 font-semibold text-navy">
            <Tent className="size-5 text-primary" aria-hidden="true" /> {story.camp_name}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatDate(story.camp_date)} · {story.camp_city}, {story.camp_district}
            {story.camp_partners ? ` · With ${story.camp_partners}` : ""}
          </p>
          {story.camp_data_verified_at ? (
            <p className="mt-2 text-sm">
              {story.camp_verified_donors !== null ? `${formatNumber(story.camp_verified_donors)} verified donors. ` : ""}
              {story.camp_verified_units !== null ? `${formatNumber(story.camp_verified_units)} verified units collected. ` : ""}
              <span className="text-xs text-muted-foreground">Verified {formatDate(story.camp_data_verified_at)}.</span>
            </p>
          ) : null}
        </aside>
      ) : null}

      <div className="mt-8 space-y-4">
        <Notice>
          This is a personal experience shared with consent. It is not medical advice, and it does not mean Rakt Response supplied
          blood or guaranteed an outcome. {story.verification_updated_at ? `Labels last reviewed ${formatDate(story.verification_updated_at)}.` : ""}
        </Notice>
        <TrustLabelGuide />
        <p className="text-sm text-muted-foreground">
          Is something in this story inaccurate? <Link href="/contact" className="font-semibold text-primary underline">Let us know</Link>.
        </p>
      </div>
    </article>
  );
}
