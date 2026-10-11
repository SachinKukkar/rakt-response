import type { Metadata } from "next";
import Link from "next/link";
import { MessageSquareQuote, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, PageHeader } from "@/components/common/page-parts";
import { StoryStatusBadge } from "@/components/common/status-badge";
import { TrustBadges } from "@/components/stories/story-parts";
import { StoryConsentForm, StoryCorrectionForm, StoryWithdrawForm } from "@/components/stories/my-story-actions";
import { requireViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { STORY_TYPE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import type { StoryRow } from "@/lib/types";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("My stories") };
}

interface StoryEvent {
  story_id: string;
  event_type: string;
  to_status: string | null;
  reason: string | null;
  created_at: string;
}

export default async function MyStoriesPage() {
  const t = await getT();
  const viewer = await requireViewer("/share-your-story/submissions");
  const supabase = await createClient();
  const { data } = await supabase
    .from("impact_stories")
    .select("*")
    .eq("contributor_id", viewer.id)
    .order("created_at", { ascending: false });
  const stories = (data ?? []) as StoryRow[];
  const { data: eventData } = stories.length
    ? await supabase
        .from("story_verification_events")
        .select("story_id, event_type, to_status, reason, created_at")
        .in("story_id", stories.map((s) => s.id))
        .order("created_at", { ascending: false })
    : { data: [] };
  const events = (eventData ?? []) as StoryEvent[];

  return (
    <div>
      <PageHeader
        title="My stories"
        description="Track review, change what is shown, request corrections or withdraw a story at any time."
        actions={
          <Button asChild>
            <Link href="/share-your-story">
              <PenLine className="size-4" aria-hidden="true" /> {t("Share a story")}
            </Link>
          </Button>
        }
      />
      {stories.length === 0 ? (
        <EmptyState icon={MessageSquareQuote} title="You haven't shared a story yet" description="Your experience could encourage someone to donate for the first time." />
      ) : (
        <ul className="space-y-4">
          {stories.map((story) => {
            const storyEvents = events.filter((e) => e.story_id === story.id).slice(0, 5);
            const withdrawn = Boolean(story.withdrawn_at);
            return (
              <li key={story.id} className="surface space-y-3 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <StoryStatusBadge status={story.status} />
                  <span className="text-xs text-muted-foreground">
                    {t(STORY_TYPE_LABELS[story.story_type])} · {t("submitted {date}", { date: formatDate(story.created_at) })}
                  </span>
                </div>
                <h2 className="text-base font-bold">{story.public_title ?? story.title}</h2>
                <TrustBadges identity={story.identity_verified} experience={story.experience_reviewed} donation={story.donation_verified} />
                {story.status === "published" && story.slug && !withdrawn ? (
                  <Link href={`/stories/${story.slug}`} className="inline-flex min-h-11 items-center text-sm font-semibold text-primary underline">
                    {t("View published story")}
                  </Link>
                ) : null}
                {withdrawn ? <p className="text-sm text-muted-foreground">{t("Withdrawn on {date}. It is not public.", { date: formatDate(story.withdrawn_at) })}</p> : null}
                {storyEvents.length ? (
                  <div>
                    <p className="text-xs font-semibold text-navy">{t("Updates")}</p>
                    <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
                      {storyEvents.map((e, i) => (
                        <li key={i}>
                          {formatDate(e.created_at)} — {t(e.event_type.replaceAll("_", " "))}
                          {e.reason ? `: ${e.reason}` : ""}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {!withdrawn ? (
                  <details className="rounded-xl border bg-white p-3">
                    <summary className="flex min-h-10 cursor-pointer items-center text-sm font-semibold text-navy">
                      {t("Manage this story")}
                    </summary>
                    <div className="mt-3 grid gap-5 md:grid-cols-3">
                      <StoryConsentForm
                        storyId={story.id}
                        showName={story.consent_show_name}
                        showPhoto={story.consent_show_photo}
                        showPersonal={story.consent_show_personal_details}
                        contact={story.consent_contact_for_verification}
                        hasPhoto={Boolean(story.photo_path)}
                      />
                      <StoryCorrectionForm storyId={story.id} />
                      <StoryWithdrawForm storyId={story.id} />
                    </div>
                  </details>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
