"use client";

import { useActionState, useState, useTransition } from "react";
import Image from "next/image";
import { Controller, useForm, useWatch, type FieldPath, type FieldValues, type UseFormSetError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChoiceRow, Field, FormMessage, SubmitButton, fieldAria, selectClass } from "@/components/common/form-parts";
import { BloodGroupPicker } from "@/components/forms/pickers";
import { ApproxLocation } from "@/components/map/approx-location";
import { changeBloodGroup, removeProfilePhoto, updateLocation, updatePreferences, updateProfile, uploadProfilePhoto } from "@/actions/profile";
import { initialActionState, type ActionResult } from "@/lib/action-result";
import { resizeImageForUpload } from "@/lib/client-image";
import {
  CONTACT_METHOD_LABELS,
  DONATION_EXPERIENCE_LABELS,
  INDIAN_STATES,
  type BloodGroup,
  type ContactMethod,
  type DonationExperience,
} from "@/lib/constants";
import { donorLocationSchema, type DonorLocationInput } from "@/lib/validation/registration";
import { preferencesSchema, profileSchema, type PreferencesInput, type ProfileInput } from "@/lib/validation/forms";

function applyFieldErrors<T extends FieldValues>(result: ActionResult<unknown>, setError: UseFormSetError<T>) {
  if (result.ok) return;
  for (const [path, messages] of Object.entries(result.fieldErrors ?? {})) {
    if (messages?.[0]) setError(path as FieldPath<T>, { message: messages[0] });
  }
}

export function ProfileDetailsForm({ defaults, ageConfirmed }: { defaults: ProfileInput; ageConfirmed: boolean }) {
  const form = useForm<ProfileInput>({ resolver: zodResolver(profileSchema), defaultValues: defaults, mode: "onTouched" });
  const { register, control, handleSubmit, setError, formState } = form;
  const errors = formState.errors;
  const [age, setAge] = useState(ageConfirmed);
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();
  const onSubmit = handleSubmit((values) =>
    startTransition(async () => {
      const r = await updateProfile({ ...values, age_confirmed: age });
      setResult(r);
      applyFieldErrors(r, setError);
    }),
  );
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <Field id="full_name" label="Full name" required error={errors.full_name?.message}>
        <Input {...fieldAria("full_name", errors.full_name?.message)} autoComplete="name" {...register("full_name")} />
      </Field>
      <Field id="display_name" label="Display name for volunteers" error={errors.display_name?.message} hint="Optional — shown instead of your full name.">
        <Input {...fieldAria("display_name", errors.display_name?.message, true)} {...register("display_name")} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="phone" label="Mobile number" error={errors.phone?.message} hint="Private. Only shared with consent.">
          <Input {...fieldAria("phone", errors.phone?.message, true)} type="tel" inputMode="tel" autoComplete="tel" {...register("phone")} />
        </Field>
        <Field id="whatsapp" label="WhatsApp number (if different)" error={errors.whatsapp?.message}>
          <Input {...fieldAria("whatsapp", errors.whatsapp?.message)} type="tel" inputMode="tel" {...register("whatsapp")} />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="donation_experience" label="Donation experience">
          <select id="donation_experience" className={selectClass} {...register("donation_experience")}>
            <option value="">Prefer not to say</option>
            {(Object.keys(DONATION_EXPERIENCE_LABELS) as DonationExperience[]).map((k) => (
              <option key={k} value={k}>
                {DONATION_EXPERIENCE_LABELS[k]}
              </option>
            ))}
          </select>
        </Field>
        <Field id="approx_previous_donations" label="Approximate number of past donations" error={errors.approx_previous_donations?.message}>
          <Controller
            control={control}
            name="approx_previous_donations"
            render={({ field }) => (
              <Input
                id="approx_previous_donations"
                type="number"
                inputMode="numeric"
                min={0}
                max={500}
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                onBlur={field.onBlur}
              />
            )}
          />
        </Field>
      </div>
      <ChoiceRow
        id="age_confirmed"
        checked={age}
        onCheckedChange={setAge}
        title="I confirm I am between 18 and 65 years old"
        description="A self-declaration. The blood centre confirms eligibility on the day."
      />
      <FormMessage state={result} />
      <Button type="submit" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
        Save details
      </Button>
    </form>
  );
}

export function BloodGroupForm({
  current,
  verified,
  requested,
}: {
  current: BloodGroup | null;
  verified: boolean;
  requested: BloodGroup | null;
}) {
  const [state, action] = useActionState(changeBloodGroup, initialActionState);
  const [value, setValue] = useState<BloodGroup | "">(current ?? "");
  return (
    <form action={action} className="space-y-3">
      <p id="bg-edit" className="text-sm text-muted-foreground">
        {verified
          ? "Your blood group has been verified. If it's wrong, choose the correct group to request a review."
          : "Choose your blood group. If you're unsure, check a previous donor card or lab report."}
      </p>
      {requested ? (
        <p className="rounded-xl bg-warning-soft p-3 text-sm text-warning">Correction to {requested} is waiting for review.</p>
      ) : null}
      <BloodGroupPicker name="blood_group" labelledBy="bg-edit" value={value} onChange={setValue} />
      <FormMessage state={state} />
      <SubmitButton disabled={!value || (value === current && !requested)}>{verified ? "Request correction" : "Save blood group"}</SubmitButton>
    </form>
  );
}

export function LocationForm({ defaults }: { defaults: DonorLocationInput }) {
  const form = useForm<DonorLocationInput>({ resolver: zodResolver(donorLocationSchema), defaultValues: defaults, mode: "onTouched" });
  const { register, control, handleSubmit, setError, setValue, formState } = form;
  const errors = formState.errors;
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();
  const lat = useWatch({ control, name: "lat" });
  const lng = useWatch({ control, name: "lng" });
  const onSubmit = handleSubmit((values) =>
    startTransition(async () => {
      const r = await updateLocation(values);
      setResult(r);
      applyFieldErrors(r, setError);
    }),
  );
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <Field id="state" label="State / union territory" required error={errors.state?.message}>
        <select {...fieldAria("state", errors.state?.message)} className={selectClass} {...register("state")}>
          <option value="">Select…</option>
          {INDIAN_STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="district" label="District" required error={errors.district?.message}>
          <Input {...fieldAria("district", errors.district?.message)} {...register("district")} />
        </Field>
        <Field id="city" label="City / town" required error={errors.city?.message}>
          <Input {...fieldAria("city", errors.city?.message)} {...register("city")} />
        </Field>
        <Field id="locality" label="Locality / area" error={errors.locality?.message}>
          <Input {...fieldAria("locality", errors.locality?.message)} {...register("locality")} />
        </Field>
        <Field id="pincode" label="PIN code" error={errors.pincode?.message}>
          <Input {...fieldAria("pincode", errors.pincode?.message)} inputMode="numeric" maxLength={6} {...register("pincode")} />
        </Field>
      </div>
      <ApproxLocation
        value={lat !== null && lng !== null ? { lat, lng } : null}
        onChange={(v) => {
          setValue("lat", v?.lat ?? null);
          setValue("lng", v?.lng ?? null);
        }}
      />
      <FormMessage state={result} />
      <Button type="submit" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
        Save area
      </Button>
    </form>
  );
}

export function PhotoForm({ photoUrl }: { photoUrl: string | null }) {
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();
  async function onFile(file: File | undefined) {
    if (!file) return;
    setResult(null);
    let resized: File;
    try {
      resized = await resizeImageForUpload(file, 800, 0.85);
    } catch (error) {
      setResult({ ok: false, message: (error as Error).message });
      return;
    }
    const fd = new FormData();
    fd.set("photo", resized);
    startTransition(async () => setResult(await uploadProfilePhoto(initialActionState, fd)));
  }
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="grid size-20 place-items-center overflow-hidden rounded-full bg-accent">
        {photoUrl ? (
          <Image src={photoUrl} alt="Your profile photo" width={80} height={80} className="size-20 object-cover" unoptimized />
        ) : (
          <Camera className="size-7 text-primary" aria-hidden="true" />
        )}
      </div>
      <div className="space-y-2">
        <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border bg-white px-4 text-sm font-semibold text-navy hover:border-primary/40 has-focus-visible:ring-3 has-focus-visible:ring-ring/40">
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Camera className="size-4" aria-hidden="true" />}
          {photoUrl ? "Change photo" : "Add photo"}
          <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => void onFile(e.target.files?.[0])} disabled={pending} />
        </label>
        {photoUrl ? (
          <Button type="button" variant="ghost" size="sm" disabled={pending} onClick={() => startTransition(async () => setResult(await removeProfilePhoto()))}>
            <Trash2 className="size-4" aria-hidden="true" /> Remove
          </Button>
        ) : null}
        <p className="text-xs text-muted-foreground">Optional. Visible only to you and authorised volunteers. Location data is removed.</p>
        <FormMessage state={result} />
      </div>
    </div>
  );
}

export function PreferencesForm({ defaults, isDonor }: { defaults: PreferencesInput; isDonor: boolean }) {
  const form = useForm<PreferencesInput>({ resolver: zodResolver(preferencesSchema), defaultValues: defaults });
  const { control, register, handleSubmit, setError, setValue, formState } = form;
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();
  const contact = useWatch({ control, name: "contact_consent" });
  const onSubmit = handleSubmit((values) =>
    startTransition(async () => {
      const r = await updatePreferences(values);
      setResult(r);
      applyFieldErrors(r, setError);
    }),
  );
  const toggle = (name: keyof PreferencesInput, title: string, description: string, disabled = false) => (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className={disabled ? "pointer-events-none opacity-50" : undefined} aria-disabled={disabled || undefined}>
          <ChoiceRow
            id={`pref-${name}`}
            checked={Boolean(field.value) && !disabled}
            onCheckedChange={(v) => {
              field.onChange(v);
              if (name === "contact_consent" && !v) setValue("open_to_contact", false);
            }}
            error={formState.errors[name]?.message as string | undefined}
            title={title}
            description={description}
          />
        </div>
      )}
    />
  );
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-3">
      {isDonor ? (
        <>
          {toggle("directory_visible", "Visible in the volunteer donor directory", "Authorised volunteers see your display name, blood group and broad area. Never public.")}
          {toggle("contact_consent", "Volunteers may contact me about verified requests", "Your number is revealed only for a verified request; every access is logged.")}
          {toggle("open_to_contact", "I'm currently open to contact", "Turn off while travelling, unwell or after a recent donation.", !contact)}
          {toggle("emergency_alerts", "In-app alerts for verified requests near me", "Matching blood group and district only. No SMS or bulk messages.")}
          {toggle("show_donation_summary", "Share my verified donation summary with volunteers", "Last verified whole blood / SDP dates and counts.")}
        </>
      ) : (
        <p className="rounded-xl bg-secondary p-3 text-sm text-secondary-foreground">
          Directory and contact options become available once you add a blood group to your profile.
        </p>
      )}
      {toggle("notify_status_updates", "Notify me about updates to my requests and records", "In-app notifications only.")}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="preferred_contact_method" label="Preferred contact method">
          <select id="preferred_contact_method" className={selectClass} {...register("preferred_contact_method")}>
            {(Object.keys(CONTACT_METHOD_LABELS) as ContactMethod[]).map((m) => (
              <option key={m} value={m}>
                {CONTACT_METHOD_LABELS[m]}
              </option>
            ))}
          </select>
        </Field>
        <Field id="max_distance_km" label="How far could you travel?">
          <Controller
            control={control}
            name="max_distance_km"
            render={({ field }) => (
              <select id="max_distance_km" className={selectClass} value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}>
                <option value="">No preference</option>
                {[5, 10, 25, 50, 100].map((km) => (
                  <option key={km} value={km}>
                    Up to {km} km
                  </option>
                ))}
              </select>
            )}
          />
        </Field>
      </div>
      <FormMessage state={result} />
      <Button type="submit" disabled={pending} size="lg" className="w-full sm:w-auto">
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
        Save my choices
      </Button>
    </form>
  );
}
