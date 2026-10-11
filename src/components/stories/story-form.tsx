"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { Controller, useForm, useWatch, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, CheckCircle2, ImagePlus, Loader2, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChoiceRow, Field, fieldAria, selectClass } from "@/components/common/form-parts";
import { ChipChoice } from "@/components/forms/pickers";
import { submitStory } from "@/actions/stories";
import { resizeImageForUpload } from "@/lib/client-image";
import { BLOOD_GROUPS, DONATION_TYPE_LABELS, DONATION_TYPES, STORY_TYPE_LABELS, type DonationType, type StoryType } from "@/lib/constants";
import { storySchema, type StoryInput } from "@/lib/validation/forms";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n/client";

const STEPS = [
  { title: "About you", fields: ["story_type", "contributor_name", "public_display_name", "follow_up_email", "follow_up_phone", "city"] },
  { title: "Your story", fields: ["title", "body", "experience_period", "donation_type", "blood_group"] },
  { title: "Photo & permissions", fields: ["supporting_details", "consent_contact", "consent_publish", "consent_show_name", "consent_show_photo", "consent_show_personal", "rights_confirmed"] },
  { title: "Preview", fields: [] },
] as const satisfies ReadonlyArray<{ title: string; fields: ReadonlyArray<FieldPath<StoryInput>> }>;

const TYPE_HINTS: Record<StoryType, string> = {
  donor: "Why you donate, what it was like, what you'd tell a first-time donor.",
  attendant: "When blood was needed for someone close to you and how the search went. No patient name or diagnosis needed.",
  recipient: "Your own experience of needing blood, only as much as you're comfortable sharing.",
  volunteer: "Coordinating requests, supporting donors and families, lessons learned.",
  camp: "A donation camp you helped organise: highlights, partners and learnings.",
};

export function StoryForm({
  defaultName,
  defaultEmail,
  isStaff,
  camps,
}: {
  defaultName: string;
  defaultEmail: string;
  isStaff: boolean;
  camps: Array<{ id: string; name: string; camp_date: string }>;
}) {
  const form = useForm<StoryInput>({
    resolver: zodResolver(storySchema),
    mode: "onTouched",
    defaultValues: {
      story_type: "donor",
      contributor_name: defaultName,
      public_display_name: "",
      follow_up_email: defaultEmail,
      follow_up_phone: "",
      city: "",
      title: "",
      body: "",
      experience_period: "",
      donation_type: "",
      blood_group: "",
      supporting_details: "",
      consent_contact: true,
      consent_publish: false,
      consent_show_name: false,
      consent_show_photo: false,
      consent_show_personal: false,
      rights_confirmed: false,
    },
  });
  const { register, control, trigger, handleSubmit, setValue, setError, formState } = form;
  const errors = formState.errors;
  const [step, setStep] = useState(0);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [processingPhoto, setProcessingPhoto] = useState(false);
  const [campId, setCampId] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();
  const values = useWatch({ control }) as StoryInput;
  const t = useT();

  useEffect(() => () => {
    if (photoUrl) URL.revokeObjectURL(photoUrl);
  }, [photoUrl]);

  async function onPhoto(file: File | undefined) {
    setPhotoError(null);
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      setPhotoError("That photo is very large. Please choose one under 15 MB.");
      return;
    }
    setProcessingPhoto(true);
    try {
      const resized = await resizeImageForUpload(file);
      if (resized.size > 3 * 1024 * 1024) throw new Error("The photo is still too large after resizing.");
      if (photoUrl) URL.revokeObjectURL(photoUrl);
      setPhoto(resized);
      setPhotoUrl(URL.createObjectURL(resized));
    } catch (error) {
      setPhotoError((error as Error).message || "We couldn't use that photo. Try another image.");
    } finally {
      setProcessingPhoto(false);
    }
  }

  function removePhoto() {
    if (photoUrl) URL.revokeObjectURL(photoUrl);
    setPhoto(null);
    setPhotoUrl(null);
    setValue("consent_show_photo", false);
  }

  async function next() {
    const ok = await trigger([...STEPS[step].fields]);
    if (!ok) {
      requestAnimationFrame(() => document.querySelector<HTMLElement>("[aria-invalid='true']")?.focus());
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const onSubmit = handleSubmit(
    (data) => {
      setServerError(null);
      const fd = new FormData();
      fd.set("payload", JSON.stringify({ ...data, consent_show_photo: data.consent_show_photo && Boolean(photo) }));
      if (photo) fd.set("photo", photo);
      if (campId) fd.set("camp_id", campId);
      startTransition(async () => {
        const result = await submitStory(fd);
        if (result.ok) {
          setDone(true);
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }
        setServerError(result.message);
        let target = -1;
        for (const [path, messages] of Object.entries(result.fieldErrors ?? {})) {
          if (!messages?.[0]) continue;
          if (path === "photo") setPhotoError(messages[0]);
          else setError(path as FieldPath<StoryInput>, { message: messages[0] });
          const idx = STEPS.findIndex((s) => (s.fields as readonly string[]).includes(path));
          if (idx >= 0 && (target < 0 || idx < target)) target = idx;
        }
        if (result.fieldErrors?.photo?.length) target = 2;
        if (target >= 0) setStep(target);
      });
    },
    (formErrors) => {
      const idx = STEPS.findIndex((s) => s.fields.some((f) => f in formErrors));
      if (idx >= 0) setStep(idx);
    },
  );

  if (done) {
    return (
      <div className="surface space-y-3 p-5 sm:p-7" role="status">
        <CheckCircle2 className="size-10 text-success" aria-hidden="true" />
        <h2 className="text-xl font-extrabold">{t("Thank you for sharing your story")}</h2>
        <p className="text-sm text-muted-foreground">
          {t(
            "It is private until an administrator reviews it. We may contact you to check details. Nothing is published without your consent, and you can withdraw at any time.",
          )}
        </p>
        <Button asChild>
          <Link href="/share-your-story/submissions">{t("View my stories")}</Link>
        </Button>
      </div>
    );
  }

  const storyType = values.story_type;
  const typeOptions = (Object.keys(STORY_TYPE_LABELS) as StoryType[])
    .filter((type) => type !== "volunteer" || isStaff)
    .map((type) => ({ value: type, label: t(STORY_TYPE_LABELS[type]) }));
  const previewName = values.consent_show_name ? values.public_display_name || values.contributor_name.split(" ")[0] : null;

  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={(e) => {
        if (step === STEPS.length - 1) {
          void onSubmit(e);
        } else {
          e.preventDefault();
          void next();
        }
      }}
    >
      <div className="surface p-4">
        <p className="mb-2 text-xs font-semibold text-muted-foreground">
          {t("Step {step} of {total}: {title}", { step: step + 1, total: STEPS.length, title: t(STEPS[step].title) })}
        </p>
        <div className="flex gap-1.5" aria-hidden="true">
          {STEPS.map((s, i) => (
            <span key={s.title} className={cn("h-1.5 flex-1 rounded-full", i <= step ? "bg-primary" : "bg-muted")} />
          ))}
        </div>
      </div>

      <div className="surface space-y-5 p-5 sm:p-7">
        <h2 className="text-xl font-extrabold">{t(STEPS[step].title)}</h2>

        {step === 0 ? (
          <>
            <div className="space-y-2">
              <p id="st-type" className="text-sm font-semibold text-navy">
                {t("What kind of story is this?")}
              </p>
              <Controller
                control={control}
                name="story_type"
                render={({ field }) => <ChipChoice<StoryType> name="story_type" labelledBy="st-type" value={field.value} onChange={field.onChange} options={typeOptions} />}
              />
              <p className="text-xs text-muted-foreground">{t(TYPE_HINTS[storyType])}</p>
            </div>
            <Field id="contributor_name" label="Your name (private)" required error={errors.contributor_name?.message} hint="Only reviewers see this.">
              <Input {...fieldAria("contributor_name", errors.contributor_name?.message, true)} autoComplete="name" {...register("contributor_name")} />
            </Field>
            <Field id="public_display_name" label="Name to show publicly, if you allow it" error={errors.public_display_name?.message} hint="For example your first name or initials.">
              <Input {...fieldAria("public_display_name", errors.public_display_name?.message, true)} {...register("public_display_name")} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="follow_up_email" label="Email for follow-up (private)" error={errors.follow_up_email?.message}>
                <Input {...fieldAria("follow_up_email", errors.follow_up_email?.message)} type="email" inputMode="email" {...register("follow_up_email")} />
              </Field>
              <Field id="follow_up_phone" label="Phone for follow-up (private)" error={errors.follow_up_phone?.message}>
                <Input {...fieldAria("follow_up_phone", errors.follow_up_phone?.message)} type="tel" inputMode="tel" {...register("follow_up_phone")} />
              </Field>
            </div>
            <Field id="city" label="City or broad area" error={errors.city?.message}>
              <Input {...fieldAria("city", errors.city?.message)} {...register("city")} />
            </Field>
          </>
        ) : null}

        {step === 1 ? (
          <>
            <Field id="title" label="Story title" required error={errors.title?.message}>
              <Input {...fieldAria("title", errors.title?.message)} maxLength={120} {...register("title")} />
            </Field>
            <Field
              id="body"
              label="Your story"
              required
              error={errors.body?.message}
              hint={`${values.body.length}/6000 · ${t("Write in your own words. Please avoid patient names, diagnoses, phone numbers or hospital documents.")}`}
            >
              <Textarea {...fieldAria("body", errors.body?.message, true)} rows={9} maxLength={6000} {...register("body")} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field id="experience_period" label="When (approximate)" error={errors.experience_period?.message}>
                <Input {...fieldAria("experience_period", errors.experience_period?.message)} placeholder={t("e.g. March 2026")} {...register("experience_period")} />
              </Field>
              <Field id="donation_type" label="Donation type, if relevant">
                <select id="donation_type" className={selectClass} {...register("donation_type")}>
                  <option value="">{t("Not applicable")}</option>
                  {DONATION_TYPES.filter((type) => type !== "unknown").map((type) => (
                    <option key={type} value={type}>
                      {t(DONATION_TYPE_LABELS[type as DonationType])}
                    </option>
                  ))}
                </select>
              </Field>
              <Field id="blood_group" label="Blood group (optional)">
                <select id="blood_group" className={selectClass} {...register("blood_group")}>
                  <option value="">{t("Prefer not to say")}</option>
                  {BLOOD_GROUPS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            {storyType === "camp" && camps.length ? (
              <Field id="camp_id" label="Which camp? (optional)">
                <select id="camp_id" className={selectClass} value={campId} onChange={(e) => setCampId(e.target.value)}>
                  <option value="">{t("Not listed")}</option>
                  {camps.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.camp_date})
                    </option>
                  ))}
                </select>
              </Field>
            ) : null}
          </>
        ) : null}

        {step === 2 ? (
          <>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-navy">{t("Photo (optional)")}</p>
              {photoUrl ? (
                <div className="relative w-full max-w-xs overflow-hidden rounded-2xl border">
                  <Image src={photoUrl} alt={t("Selected photo preview")} width={320} height={200} className="h-48 w-full object-cover" unoptimized />
                  <Button type="button" size="icon-sm" variant="secondary" className="absolute top-2 right-2" onClick={removePhoto} aria-label={t("Remove photo")}>
                    <X className="size-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed bg-white p-4 text-center text-sm hover:border-primary/40">
                  {processingPhoto ? <Loader2 className="size-6 animate-spin text-primary" aria-hidden="true" /> : <ImagePlus className="size-6 text-primary" aria-hidden="true" />}
                  <span className="font-semibold text-navy">{processingPhoto ? t("Preparing photo…") : t("Add a photo")}</span>
                  <span className="text-xs text-muted-foreground">
                    {t("JPEG, PNG or WebP. Location data is removed. Only you and reviewers see it unless you allow publication.")}
                  </span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => void onPhoto(e.target.files?.[0])} />
                </label>
              )}
              {photoError ? (
                <p className="text-xs font-medium text-destructive" role="alert">
                  {t(photoError)}
                </p>
              ) : null}
            </div>
            <Field
              id="supporting_details"
              label="Details for our reviewers only (optional)"
              error={errors.supporting_details?.message}
              hint="For example, the approximate date and hospital, or a request reference. Never shown publicly. No medical documents please."
            >
              <Textarea {...fieldAria("supporting_details", errors.supporting_details?.message, true)} rows={3} {...register("supporting_details")} />
            </Field>
            <div className="space-y-2.5">
              <Controller control={control} name="consent_publish" render={({ field }) => (
                <ChoiceRow id="consent_publish" checked={field.value} onCheckedChange={field.onChange} error={errors.consent_publish?.message}
                  title="I consent to Rakt Response publishing this story after review"
                  description="An administrator reviews every story first and may tidy formatting without changing your meaning." />
              )} />
              <Controller control={control} name="consent_show_name" render={({ field }) => (
                <ChoiceRow id="consent_show_name" checked={field.value} onCheckedChange={field.onChange}
                  title="Show my public display name" description="Leave unticked to publish anonymously." />
              )} />
              <Controller control={control} name="consent_show_photo" render={({ field }) => (
                <div className={cn(!photo && "pointer-events-none opacity-50")}>
                  <ChoiceRow id="consent_show_photo" checked={field.value && Boolean(photo)} onCheckedChange={field.onChange}
                    title="Show my photo publicly" description={photo ? "Only after an administrator approves it." : "Add a photo above to enable this."} />
                </div>
              )} />
              <Controller control={control} name="consent_show_personal" render={({ field }) => (
                <ChoiceRow id="consent_show_personal" checked={field.value} onCheckedChange={field.onChange}
                  title="Show my blood group" description="Optional personal detail on the published story." />
              )} />
              <Controller control={control} name="consent_contact" render={({ field }) => (
                <ChoiceRow id="consent_contact" checked={field.value} onCheckedChange={field.onChange}
                  title="You may contact me to verify details" description="Helps us add trust labels such as Experience Reviewed." />
              )} />
              <Controller control={control} name="rights_confirmed" render={({ field }) => (
                <ChoiceRow id="rights_confirmed" checked={field.value} onCheckedChange={field.onChange} error={errors.rights_confirmed?.message}
                  title="I have the right to share this story and photo"
                  description="Including permission from anyone else who appears in the photo or is identifiable in the story." />
              )} />
            </div>
          </>
        ) : null}

        {step === 3 ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{t("This is how your story would appear if approved and published:")}</p>
            <article className="overflow-hidden rounded-2xl border bg-white">
              {values.consent_show_photo && photoUrl ? (
                <Image src={photoUrl} alt="" width={640} height={360} className="aspect-[16/9] w-full object-cover" unoptimized />
              ) : (
                <div className="grid aspect-[16/9] place-items-center bg-accent/60 text-xs text-muted-foreground">{t("No public photo")}</div>
              )}
              <div className="space-y-2 p-4">
                <p className="text-xs font-semibold text-primary">{t(STORY_TYPE_LABELS[storyType])}</p>
                <h3 className="text-lg font-bold">{values.title || t("Your title")}</h3>
                <p className="text-xs text-muted-foreground">
                  {previewName ?? t("Shared anonymously")}
                  {values.city ? ` · ${values.city}` : ""}
                  {values.experience_period ? ` · ${values.experience_period}` : ""}
                  {values.consent_show_personal && values.blood_group ? ` · ${values.blood_group}` : ""}
                </p>
                <p className="text-sm whitespace-pre-line">{values.body}</p>
              </div>
            </article>
            <p className="text-xs text-muted-foreground">
              {photo && !values.consent_show_photo
                ? t("Private and never published: your full name, follow-up contact, reviewer notes and your photo.")
                : t("Private and never published: your full name, follow-up contact, reviewer notes.")}
            </p>
          </div>
        ) : null}

        {serverError ? (
          <p className="rounded-xl border border-destructive/25 bg-destructive/5 px-3.5 py-3 text-sm text-destructive" role="alert">
            {t(serverError)}
          </p>
        ) : null}

        <div className="flex gap-3">
          {step > 0 ? (
            <Button type="button" variant="outline" size="lg" onClick={() => setStep((s) => s - 1)} disabled={pending}>
              <ArrowLeft className="size-4" aria-hidden="true" /> {t("Back")}
            </Button>
          ) : null}
          <Button type="submit" size="lg" className="flex-1" disabled={pending || processingPhoto}>
            {step === STEPS.length - 1 ? (
              pending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" /> {t("Submitting…")}
                </>
              ) : (
                <>
                  <Send className="size-4" aria-hidden="true" /> {t("Submit for review")}
                </>
              )
            ) : (
              <>
                {t("Continue")} <ArrowRight className="size-4" aria-hidden="true" />
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
