import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ActionForm } from "@/components/common/action-form";
import { KeyValue, Notice, PageHeader, SectionHeading } from "@/components/common/page-parts";
import { Pill, StoryStatusBadge } from "@/components/common/status-badge";
import { selectClass } from "@/components/common/form-parts";
import { TrustBadges } from "@/components/stories/story-parts";
import { EmailLink, PhoneLink } from "@/components/common/contact-link";
import { addInternalNote } from "@/actions/volunteer";
import { publishStoryPhoto, removeStoryPhoto, setStoryStatus, setStoryVerification, updateStoryContent } from "@/actions/admin";
import { requireAdmin } from "@/lib/auth";
import { displayNames } from "@/lib/data/staff";
import { createClient } from "@/lib/supabase/server";
import { publicStoryPhotoUrl } from "@/lib/env";
import { DONATION_TYPE_LABELS, STORY_STATUS_LABELS, STORY_TRANSITIONS, STORY_TYPE_LABELS } from "@/lib/constants";
import { formatDate, formatDateTime } from "@/lib/format";
import { uuidSchema } from "@/lib/validation/common";
import type { StoryRow } from "@/lib/types";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("Review story") };
}

export default async function AdminStoryPage({ params }: PageProps<"/admin/stories/[id]">) {
  await requireAdmin();
  const t = await getT();
  const { id } = await params;
  if (!uuidSchema.safeParse(id).success) notFound();
  const supabase = await createClient();
  const { data } = await supabase.from("impact_stories").select("*").eq("id", id).maybeSingle();
  const story = data as StoryRow | null;
  if (!story) notFound();
  const [eventsResult, notesResult, consentResult, recordsResult, privatePhoto] = await Promise.all([
    supabase.from("story_verification_events").select("*").eq("story_id", id).order("created_at", { ascending: false }),
    supabase.from("internal_notes").select("id, author_id, body, created_at").eq("subject_type", "story").eq("subject_id", id).order("created_at", { ascending: false }),
    supabase.from("story_consents").select("*").eq("story_id", id).order("created_at", { ascending: false }).limit(5),
    story.contributor_id
      ? supabase.from("donation_records").select("id, donation_type, donation_date, centre_name").eq("donor_id", story.contributor_id).eq("verification_status", "verified")
      : Promise.resolve({ data: [] }),
    story.photo_path ? supabase.storage.from("story-uploads").createSignedUrl(story.photo_path, 600) : Promise.resolve({ data: null }),
  ]);
  const events = (eventsResult.data ?? []) as Array<{ id: number; actor_id: string | null; event_type: string; from_status: string | null; to_status: string | null; reason: string | null; is_internal: boolean; created_at: string }>;
  const notes = (notesResult.data ?? []) as Array<{ id: string; author_id: string; body: string; created_at: string }>;
  const consents = (consentResult.data ?? []) as Array<{ id: number; consent_publish: boolean; consent_show_name: boolean; consent_show_photo: boolean; consent_show_personal_details: boolean; created_at: string }>;
  const verifiedRecords = (recordsResult.data ?? []) as Array<{ id: string; donation_type: keyof typeof DONATION_TYPE_LABELS; donation_date: string; centre_name: string }>;
  const names = await displayNames([...events.map((e) => e.actor_id), ...notes.map((n) => n.author_id)]);
  const privateUrl = privatePhoto.data && "signedUrl" in privatePhoto.data ? privatePhoto.data.signedUrl : null;
  const publicUrl = publicStoryPhotoUrl(story.public_photo_path);
  const transitions = STORY_TRANSITIONS[story.status];
  const corrections = events.filter((e) => e.event_type === "correction_requested");

  return (
    <div className="space-y-6">
      <PageHeader backHref="/admin/stories" backLabel="Stories" eyebrow={STORY_TYPE_LABELS[story.story_type]} title={story.public_title ?? story.title} />
      <div className="flex flex-wrap items-center gap-2">
        <StoryStatusBadge status={story.status} />
        <TrustBadges identity={story.identity_verified} experience={story.experience_reviewed} donation={story.donation_verified} />
        {story.status === "published" && story.slug ? (
          <Link href={`/stories/${story.slug}`} className="text-sm font-semibold text-primary underline">
            {t("View public page")}
          </Link>
        ) : null}
      </div>
      {story.withdrawn_at ? (
        <Notice tone="warning" title="Withdrawn by the contributor">
          {formatDateTime(story.withdrawn_at)}. {t("It cannot be republished.")} {story.public_photo_path ? t("A public photo reference remains — remove it below.") : ""}
        </Notice>
      ) : null}
      {corrections.length ? (
        <Notice title="Correction requested">
          <ul className="list-disc pl-5">
            {corrections.map((c) => (
              <li key={c.id}>
                {formatDate(c.created_at)}: {c.reason}
              </li>
            ))}
          </ul>
        </Notice>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="surface p-4" aria-labelledby="private-heading">
          <SectionHeading id="private-heading" title="Contributor (private)" as="h3" />
          <dl>
            <KeyValue label="Name">{story.contributor_name}</KeyValue>
            <KeyValue label="Preferred public name">{story.public_display_name ?? "—"}</KeyValue>
            <KeyValue label="Email">{story.follow_up_email ? <EmailLink email={story.follow_up_email} icon={false} /> : "—"}</KeyValue>
            <KeyValue label="Phone">{story.follow_up_phone ? <PhoneLink phone={story.follow_up_phone} icon={false} /> : "—"}</KeyValue>
            <KeyValue label="May contact to verify">{story.consent_contact_for_verification ? "Yes" : "No"}</KeyValue>
            <KeyValue label="Submitted">{formatDateTime(story.created_at)}</KeyValue>
          </dl>
          {story.private_supporting_details ? <p className="mt-3 rounded-xl bg-muted p-3 text-sm">{t("Supporting details:")} {story.private_supporting_details}</p> : null}
        </section>
        <section className="surface p-4" aria-labelledby="consent-heading">
          <SectionHeading id="consent-heading" title="Current consent" as="h3" />
          <div className="flex flex-wrap gap-1.5">
            <Pill tone={story.consent_publish ? "success" : "danger"}>{t("Publish: {value}", { value: story.consent_publish ? t("yes") : t("no") })}</Pill>
            <Pill tone={story.consent_show_name ? "success" : "neutral"}>{t("Name: {value}", { value: story.consent_show_name ? t("yes") : t("no") })}</Pill>
            <Pill tone={story.consent_show_photo ? "success" : "neutral"}>{t("Photo: {value}", { value: story.consent_show_photo ? t("yes") : t("no") })}</Pill>
            <Pill tone={story.consent_show_personal_details ? "success" : "neutral"}>{t("Blood group: {value}", { value: story.consent_show_personal_details ? t("yes") : t("no") })}</Pill>
          </div>
          <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
            {consents.map((c) => (
              <li key={c.id}>
                {formatDateTime(c.created_at)} —{" "}
                {t("publish {publish}, name {name}, photo {photo}, personal {personal}", {
                  publish: c.consent_publish ? "✓" : "✗",
                  name: c.consent_show_name ? "✓" : "✗",
                  photo: c.consent_show_photo ? "✓" : "✗",
                  personal: c.consent_show_personal_details ? "✓" : "✗",
                })}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="surface p-4" aria-labelledby="original-heading">
        <SectionHeading id="original-heading" title="Original submission" description="Preserved exactly as submitted." as="h3" />
        <p className="font-semibold text-navy">{story.title}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {story.city ?? t("No city")} · {story.experience_period ?? t("No period")}
          {story.donation_type ? ` · ${t(DONATION_TYPE_LABELS[story.donation_type])}` : ""}
          {story.blood_group ? ` · ${story.blood_group}` : ""}
        </p>
        <p className="mt-3 text-sm whitespace-pre-line">{story.body}</p>
      </section>

      {!story.withdrawn_at ? (
        <>
          <section className="surface p-4" aria-labelledby="status-heading">
            <SectionHeading id="status-heading" title="Decision" as="h3" />
            {transitions.length ? (
              <ActionForm action={setStoryStatus} fields={{ story_id: story.id }} label="Apply decision" className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1 text-sm font-semibold text-navy">
                  {t("Move to")}
                  <select name="status" className={selectClass}>
                    {transitions.map((s) => (
                      <option key={s} value={s}>
                        {t(STORY_STATUS_LABELS[s])}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1 text-sm font-semibold text-navy">
                  {t("Reason (required to reject, request info, unpublish or archive)")}
                  <Input name="reason" maxLength={500} />
                </label>
              </ActionForm>
            ) : (
              <p className="text-sm text-muted-foreground">{t("No further moderation steps.")}</p>
            )}
          </section>

          <section className="surface p-4" aria-labelledby="public-heading">
            <SectionHeading id="public-heading" title="Public presentation" description="Edit formatting without changing the contributor's meaning. Only consented details can be shown." as="h3" />
            <ActionForm action={updateStoryContent} fields={{ story_id: story.id }} label="Save presentation" className="space-y-3">
              <label className="block space-y-1 text-sm font-semibold text-navy">
                {t("Public title")}
                <Input name="public_title" defaultValue={story.public_title ?? story.title} maxLength={120} />
              </label>
              <label className="block space-y-1 text-sm font-semibold text-navy">
                {t("Short excerpt (for cards)")}
                <Input name="public_excerpt" defaultValue={story.public_excerpt ?? ""} maxLength={240} />
              </label>
              <label className="block space-y-1 text-sm font-semibold text-navy">
                {t("Public story text")}
                <Textarea name="public_body" defaultValue={story.public_body ?? story.body} rows={10} maxLength={6000} />
              </label>
              <label className="block space-y-1 text-sm font-semibold text-navy">
                {t("Public display name")}
                <Input name="public_display_name" defaultValue={story.public_display_name ?? ""} maxLength={60} />
              </label>
              <fieldset className="grid gap-1 text-sm sm:grid-cols-2">
                <legend className="mb-1 font-semibold text-navy">{t("Show publicly")}</legend>
                <label className={`flex min-h-11 items-center gap-2 ${!story.consent_show_name ? "opacity-50" : ""}`}>
                  <input type="checkbox" name="show_name" defaultChecked={story.show_name} disabled={!story.consent_show_name} className="size-5 accent-primary" /> {t("Display name")}
                </label>
                <label className={`flex min-h-11 items-center gap-2 ${!story.consent_show_photo ? "opacity-50" : ""}`}>
                  <input type="checkbox" name="show_photo" defaultChecked={story.show_photo} disabled={!story.consent_show_photo} className="size-5 accent-primary" /> {t("Photo")}
                </label>
                <label className={`flex min-h-11 items-center gap-2 ${!story.consent_show_personal_details ? "opacity-50" : ""}`}>
                  <input type="checkbox" name="show_personal" defaultChecked={story.show_personal_details} disabled={!story.consent_show_personal_details} className="size-5 accent-primary" /> {t("Blood group")}
                </label>
                <label className="flex min-h-11 items-center gap-2">
                  <input type="checkbox" name="show_city" defaultChecked={story.show_city} className="size-5 accent-primary" /> {t("City")}
                </label>
              </fieldset>
            </ActionForm>
          </section>

          <section className="surface space-y-3 p-4" aria-labelledby="photo-heading">
            <SectionHeading id="photo-heading" title="Photo" as="h3" />
            {privateUrl ? (
              <div className="flex flex-wrap items-start gap-4">
                <figure>
                  <Image src={privateUrl} alt={t("Private upload")} width={240} height={160} className="h-40 w-60 rounded-xl object-cover" unoptimized />
                  <figcaption className="mt-1 text-xs text-muted-foreground">{t("Private upload (link expires in 10 minutes)")}</figcaption>
                </figure>
                {publicUrl ? (
                  <figure>
                    <Image src={publicUrl} alt={t("Published copy")} width={240} height={160} className="h-40 w-60 rounded-xl object-cover" unoptimized />
                    <figcaption className="mt-1 text-xs text-muted-foreground">{t("Public copy")}</figcaption>
                  </figure>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t("No photo was uploaded.")}</p>
            )}
            <div className="flex flex-wrap gap-2">
              {story.photo_path && story.consent_show_photo ? (
                <ActionForm action={publishStoryPhoto} fields={{ story_id: story.id }} label={publicUrl ? "Replace public copy" : "Approve photo for publication"} size="sm" variant="outline" />
              ) : story.photo_path ? (
                <p className="text-xs text-muted-foreground">{t("The contributor did not consent to a public photo.")}</p>
              ) : null}
              {story.public_photo_path ? <ActionForm action={removeStoryPhoto} fields={{ story_id: story.id }} label="Remove public photo" size="sm" variant="ghost" /> : null}
            </div>
          </section>

          <section className="surface p-4" aria-labelledby="labels-heading">
            <SectionHeading id="labels-heading" title="Verification labels" description="Only award a label after doing the check it describes." as="h3" />
            <ActionForm action={setStoryVerification} fields={{ story_id: story.id }} label="Save labels" className="space-y-2">
              <label className="flex min-h-11 items-center gap-2 text-sm">
                <input type="checkbox" name="identity_verified" defaultChecked={story.identity_verified} className="size-5 accent-primary" /> {t("Identity Verified — I checked who the contributor is")}
              </label>
              <label className="flex min-h-11 items-center gap-2 text-sm">
                <input type="checkbox" name="experience_reviewed" defaultChecked={story.experience_reviewed} className="size-5 accent-primary" /> {t("Experience Reviewed — checked for consistency and supporting details")}
              </label>
              <label className="flex min-h-11 items-center gap-2 text-sm">
                <input type="checkbox" name="donation_verified" defaultChecked={story.donation_verified} className="size-5 accent-primary" /> {t("Donation Verified — matched to a verified record")}
              </label>
              <label className="block space-y-1 text-sm font-semibold text-navy">
                {t("Verified donation record")}
                <select name="donation_record_id" defaultValue={story.donation_record_id ?? ""} className={selectClass}>
                  <option value="">{t("None")}</option>
                  {verifiedRecords.map((r) => (
                    <option key={r.id} value={r.id}>
                      {t(DONATION_TYPE_LABELS[r.donation_type])} · {formatDate(r.donation_date)} · {r.centre_name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-1 text-sm font-semibold text-navy">
                {t("How was this checked? (internal)")}
                <Input name="note" maxLength={300} />
              </label>
            </ActionForm>
          </section>
        </>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="surface p-4" aria-labelledby="trail-heading">
          <SectionHeading id="trail-heading" title="Moderation trail" as="h3" />
          <ol className="space-y-2 text-sm">
            {events.map((e) => (
              <li key={e.id} className="border-l-2 border-primary/30 pl-3">
                <p className="font-medium">
                  {e.event_type.replaceAll("_", " ")}
                  {e.to_status ? ` → ${e.to_status.replaceAll("_", " ")}` : ""}
                  {e.is_internal ? "" : t(" (visible to contributor)")}
                </p>
                {e.reason ? <p className="text-muted-foreground">{e.reason}</p> : null}
                <p className="text-xs text-muted-foreground">
                  {formatDateTime(e.created_at)} · {e.actor_id ? names.get(e.actor_id) ?? t("Team member") : t("System")}
                </p>
              </li>
            ))}
          </ol>
        </section>
        <section className="surface space-y-3 p-4" aria-labelledby="notes-heading">
          <SectionHeading id="notes-heading" title="Internal notes" as="h3" />
          <ActionForm action={addInternalNote} fields={{ subject_type: "story", subject_id: story.id }} label="Add note" size="sm" variant="outline">
            <Textarea name="body" rows={2} maxLength={2000} required aria-label={t("Note")} />
          </ActionForm>
          <ul className="space-y-2 text-sm">
            {notes.map((n) => (
              <li key={n.id} className="rounded-xl bg-muted p-3">
                <p className="whitespace-pre-line">{n.body}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {names.get(n.author_id) ?? t("Admin")} · {formatDateTime(n.created_at)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
