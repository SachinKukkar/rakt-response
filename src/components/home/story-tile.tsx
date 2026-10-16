import Image from "next/image";
import Link from "next/link";
import { StoryCover } from "@/components/stories/story-parts";
import { publicStoryPhotoUrl } from "@/lib/env";
import { STORY_TYPE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import type { Photo } from "@/lib/photos";
import type { SampleStory } from "@/lib/samples";
import type { StoryCard } from "@/lib/types";
import { getLocale, getT } from "@/i18n/server";

type TileStory = { kind: "real"; story: StoryCard } | { kind: "sample"; story: SampleStory; photo?: Photo };

/** An editorial story card: a large photograph (or drawn cover), then the words. The whole tile is the link. */
export async function StoryTile({ story: item }: { story: TileStory }) {
  const [t, locale] = await Promise.all([getT(), getLocale()]);
  const sample = item.kind === "sample";
  const story = item.story;
  const title = sample ? item.story.title[locale] : item.story.title;
  const excerpt = sample ? item.story.excerpt[locale] : item.story.excerpt;
  const href = sample ? `/stories/sample/${story.slug}` : `/stories/${story.slug}`;
  const photo = sample ? item.photo : null;
  const realPhoto = !sample ? publicStoryPhotoUrl(item.story.photo_path) : null;
  const byline = sample
    ? `${item.story.display_name} · ${item.story.city}`
    : `${item.story.display_name ?? t("Shared anonymously")}${item.story.city ? ` · ${item.story.city}` : ""} · ${formatDate(item.story.published_at)}`;

  return (
    <article className="reveal group relative">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-night">
        {photo ? (
          <Image
            src={photo.src}
            alt=""
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <StoryCover type={story.story_type} photo={realPhoto} className="absolute inset-0 aspect-auto" sizes="(min-width: 768px) 33vw, 100vw" />
        )}
        <span className="label-mono absolute top-4 left-4 rounded-full bg-night/75 px-3 py-2 text-cream backdrop-blur">{t(STORY_TYPE_LABELS[story.story_type])}</span>
        {sample ? <span className="label-mono absolute top-4 right-4 rounded-full bg-cream px-3 py-2 text-night">{t("Sample")}</span> : null}
      </div>
      <p className="label-mono mt-5 text-muted-foreground">{byline}</p>
      <h3 className="mt-3 text-[1.45rem] leading-tight font-medium tracking-[-0.03em]">
        <Link href={href} className="after:absolute after:inset-0 after:content-[''] group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
          {title}
        </Link>
      </h3>
      <p className="mt-2.5 line-clamp-3 text-[15px] leading-relaxed text-muted-foreground">{excerpt}</p>
    </article>
  );
}
