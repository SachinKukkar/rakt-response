import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BadgeCheck, Droplet, FileCheck2, HeartHandshake, HeartPulse, ScanFace, Tent, Users, type LucideIcon } from "lucide-react";
import { publicStoryPhotoUrl } from "@/lib/env";
import { STORY_TYPE_LABELS, TRUST_LABELS, type StoryType } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import type { StoryCard as StoryCardData } from "@/lib/types";
import type { SampleStory } from "@/lib/samples";
import { cn } from "@/lib/utils";
import { Pill } from "@/components/common/status-badge";
import { T } from "@/i18n/client";
import { getLocale, getT } from "@/i18n/server";

export function TrustBadges({
  identity,
  experience,
  donation,
}: {
  identity: boolean;
  experience: boolean;
  donation: boolean;
}) {
  if (!identity && !experience && !donation) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {identity ? (
        <Pill tone="success" icon={ScanFace}>
          {TRUST_LABELS.identity_verified.label}
        </Pill>
      ) : null}
      {experience ? (
        <Pill tone="info" icon={FileCheck2}>
          {TRUST_LABELS.experience_reviewed.label}
        </Pill>
      ) : null}
      {donation ? (
        <Pill tone="brand" icon={Droplet}>
          {TRUST_LABELS.donation_verified.label}
        </Pill>
      ) : null}
    </div>
  );
}

const DROP_PATH = "M24 2C24 2 4 24.5 4 36.5C4 47.3 13 54 24 54C35 54 44 47.3 44 36.5C44 24.5 24 2 24 2Z";

const COVERS: Record<StoryType, { className: string; icon: LucideIcon }> = {
  donor: { className: "cover-red", icon: Droplet },
  attendant: { className: "cover-navy", icon: HeartHandshake },
  recipient: { className: "cover-navy", icon: HeartPulse },
  volunteer: { className: "cover-mix", icon: Users },
  camp: { className: "cover-red", icon: Tent },
};

/** The contributor's photo, or a cover drawn in the brand colours when there is none. */
export function StoryCover({
  type,
  photo,
  sizes,
  priority,
  className,
  iconClassName,
}: {
  type: StoryType;
  photo: string | null;
  sizes?: string;
  priority?: boolean;
  className?: string;
  iconClassName?: string;
}) {
  const cover = COVERS[type];
  return (
    <div className={cn("relative aspect-[16/9] overflow-hidden bg-muted", !photo && cover.className, className)}>
      {photo ? (
        <Image src={photo} alt="" fill sizes={sizes} priority={priority} className="object-cover" />
      ) : (
        <div className="absolute inset-0" aria-hidden="true">
          <svg viewBox="0 0 48 56" className="absolute -right-[6%] -bottom-[38%] h-[140%] fill-white/10">
            <path d={DROP_PATH} />
          </svg>
          <svg viewBox="0 0 48 56" className="absolute top-[18%] right-[38%] h-[15%] fill-white/15">
            <path d={DROP_PATH} />
          </svg>
          <cover.icon className={cn("absolute bottom-5 left-5 size-11 text-white", iconClassName)} strokeWidth={1.6} />
        </div>
      )}
    </div>
  );
}

/** Shared card layout. The whole card is one large tap target. */
function StoryCardFrame({
  href,
  ariaLabel,
  type,
  typeLabel,
  photo,
  sampleLabel,
  title,
  excerpt,
  meta,
  badges,
  readLabel,
}: {
  href: string;
  ariaLabel: string;
  type: StoryType;
  typeLabel: string;
  photo: string | null;
  sampleLabel?: string;
  title: string;
  excerpt: string;
  meta: React.ReactNode;
  badges?: React.ReactNode;
  readLabel: string;
}) {
  return (
    <article className="surface lift group relative flex h-full flex-col overflow-hidden">
      <div className="relative">
        <StoryCover type={type} photo={photo} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
        <span className="absolute top-3 left-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-navy shadow-sm">{typeLabel}</span>
        {sampleLabel ? (
          <span className="absolute top-3 right-3 rounded-full bg-navy/85 px-2.5 py-1 text-[11px] font-bold tracking-wide text-white uppercase">
            {sampleLabel}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="text-xl leading-snug font-medium tracking-[-0.02em]">{title}</h3>
        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{excerpt}</p>
        <p className="text-xs text-muted-foreground">{meta}</p>
        {badges}
        <Link
          href={href}
          className="mt-auto inline-flex min-h-11 items-center gap-1 self-start pt-1 text-sm font-semibold text-primary after:absolute after:inset-0 after:content-[''] group-hover:underline"
          aria-label={ariaLabel}
        >
          {readLabel} <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

export async function StoryCard({ story }: { story: StoryCardData }) {
  const t = await getT();
  return (
    <StoryCardFrame
      href={`/stories/${story.slug}`}
      ariaLabel={t("Read story: {title}", { title: story.title })}
      type={story.story_type}
      typeLabel={t(STORY_TYPE_LABELS[story.story_type])}
      photo={publicStoryPhotoUrl(story.photo_path)}
      title={story.title}
      excerpt={story.excerpt}
      meta={
        <>
          {story.display_name ?? t("Shared anonymously")}
          {story.city ? ` · ${story.city}` : ""} · {formatDate(story.published_at)}
        </>
      }
      badges={<TrustBadges identity={story.identity_verified} experience={story.experience_reviewed} donation={story.donation_verified} />}
      readLabel={t("Read story")}
    />
  );
}

/** A placeholder story, always labelled "Sample" (see src/lib/samples.ts). */
export async function SampleStoryCard({ story }: { story: SampleStory }) {
  const [t, locale] = await Promise.all([getT(), getLocale()]);
  const title = story.title[locale];
  return (
    <StoryCardFrame
      href={`/stories/sample/${story.slug}`}
      ariaLabel={t("Read sample story: {title}", { title })}
      type={story.story_type}
      typeLabel={t(STORY_TYPE_LABELS[story.story_type])}
      photo={null}
      sampleLabel={t("Sample")}
      title={title}
      excerpt={story.excerpt[locale]}
      meta={`${story.display_name} · ${story.city}`}
      readLabel={t("Read story")}
    />
  );
}

/** Small accessible explanation of what each trust label means. */
export function TrustLabelGuide() {
  const items = [
    { icon: ScanFace, ...TRUST_LABELS.identity_verified },
    { icon: FileCheck2, ...TRUST_LABELS.experience_reviewed },
    { icon: Droplet, ...TRUST_LABELS.donation_verified },
    { icon: BadgeCheck, ...TRUST_LABELS.impact_verified },
  ];
  return (
    <details className="surface group p-4">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 font-semibold text-navy">
        <T>What do the verification labels mean?</T>
        <span className="text-primary transition-transform group-open:rotate-45" aria-hidden="true">
          +
        </span>
      </summary>
      <ul className="mt-3 space-y-3">
        {items.map((item) => (
          <li key={item.label} className="flex gap-3 text-sm">
            <item.icon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
            <span>
              <span className="font-semibold text-navy">
                <T>{item.label}</T>:{" "}
              </span>
              <span className="text-muted-foreground">
                <T>{item.description}</T>
              </span>
            </span>
          </li>
        ))}
        <li className="text-xs text-muted-foreground">
          <T>A label appears only after an authorised team member has done the check. Submitting a story never earns a label on its own.</T>
        </li>
      </ul>
    </details>
  );
}
