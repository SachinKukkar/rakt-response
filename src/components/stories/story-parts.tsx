import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BadgeCheck, Droplet, FileCheck2, ScanFace } from "lucide-react";
import { publicStoryPhotoUrl } from "@/lib/env";
import { STORY_TYPE_LABELS, TRUST_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import type { StoryCard as StoryCardData } from "@/lib/types";
import { Pill } from "@/components/common/status-badge";

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

export function StoryCard({ story }: { story: StoryCardData }) {
  const photo = publicStoryPhotoUrl(story.photo_path);
  return (
    <article className="surface flex h-full flex-col overflow-hidden">
      <div className="relative aspect-[16/9] bg-accent/60">
        {photo ? (
          <Image src={photo} alt="" fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
        ) : (
          <div className="absolute inset-0 grid place-items-center" aria-hidden="true">
            <svg viewBox="0 0 48 56" className="h-14 w-14 fill-primary/20">
              <path d="M24 2C24 2 4 24.5 4 36.5C4 47.3 13 54 24 54C35 54 44 47.3 44 36.5C44 24.5 24 2 24 2Z" />
            </svg>
          </div>
        )}
        <span className="absolute top-3 left-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-navy shadow-sm">
          {STORY_TYPE_LABELS[story.story_type]}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-base leading-snug font-bold">{story.title}</h3>
        <p className="line-clamp-3 text-sm text-muted-foreground">{story.excerpt}</p>
        <p className="text-xs text-muted-foreground">
          {story.display_name ?? "Shared anonymously"}
          {story.city ? ` · ${story.city}` : ""} · {formatDate(story.published_at)}
        </p>
        <TrustBadges identity={story.identity_verified} experience={story.experience_reviewed} donation={story.donation_verified} />
        <Link
          href={`/stories/${story.slug}`}
          className="mt-auto inline-flex min-h-11 items-center gap-1 self-start text-sm font-semibold text-primary hover:underline"
          aria-label={`Read story: ${story.title}`}
        >
          Read story <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
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
        What do the verification labels mean?
        <span className="text-primary transition-transform group-open:rotate-45" aria-hidden="true">
          +
        </span>
      </summary>
      <ul className="mt-3 space-y-3">
        {items.map((item) => (
          <li key={item.label} className="flex gap-3 text-sm">
            <item.icon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
            <span>
              <span className="font-semibold text-navy">{item.label}: </span>
              <span className="text-muted-foreground">{item.description}</span>
            </span>
          </li>
        ))}
        <li className="text-xs text-muted-foreground">
          A label appears only after an authorised team member has done the check. Submitting a story never earns a label on its
          own.
        </li>
      </ul>
    </details>
  );
}
