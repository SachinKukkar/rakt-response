"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Controller, useFieldArray, useForm, useWatch, type FieldPath } from "react-hook-form";
import type { z } from "zod";
import { AlertTriangle, ArrowLeft, ArrowRight, Check, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChoiceRow, Field, fieldAria, selectClass } from "@/components/common/form-parts";
import { BloodGroupPicker, ChipChoice } from "@/components/forms/pickers";
import { ApproxLocation } from "@/components/map/approx-location";
import { PasswordInput } from "@/components/auth/auth-forms";
import { registerDonor } from "@/actions/auth";
import {
  CONTACT_METHOD_LABELS,
  DONATION_EXPERIENCE_LABELS,
  DONATION_TYPE_LABELS,
  DONATION_TYPES,
  INDIAN_STATES,
  type ContactMethod,
  type DonationExperience,
  type DonationType,
} from "@/lib/constants";
import { findPossibleDuplicates } from "@/lib/donations";
import { formatDate, todayInIndia } from "@/lib/format";
import {
  accountStepSchema,
  consentStepSchema,
  donorStepSchema,
  historyStepSchema,
  locationStepSchema,
  type RegistrationInput,
} from "@/lib/validation/registration";
import { cn } from "@/lib/utils";

type StepKey = "account" | "donor" | "location" | "history" | "consent" | "review";

const STEP_META: Record<StepKey, { title: string; subtitle: string }> = {
  account: { title: "Create your account", subtitle: "Your login details stay private." },
  donor: { title: "About you as a donor", subtitle: "Only what's needed to coordinate safely." },
  location: { title: "Where are you based?", subtitle: "Area details only — never your exact address." },
  history: { title: "Donation history", subtitle: "Self-reported until a volunteer verifies it." },
  consent: { title: "Availability & consent", subtitle: "You decide who can find and contact you." },
  review: { title: "Review & confirm", subtitle: "Check everything before you register." },
};

const STEP_SCHEMAS: Partial<Record<StepKey, z.ZodType>> = {
  account: accountStepSchema,
  donor: donorStepSchema,
  location: locationStepSchema,
  history: historyStepSchema,
  consent: consentStepSchema,
};

const DEFAULTS: RegistrationInput = {
  account: { full_name: "", email: "", password: "", confirm_password: "", accept_terms: false },
  donor: {
    is_donor: true,
    blood_group: "",
    age_confirmed: false,
    donation_experience: "",
    display_name: "",
    phone: "",
    preferred_contact_method: "in_app",
  },
  location: { state: "", district: "", city: "", locality: "", pincode: "", lat: null, lng: null, max_distance_km: null },
  history: { has_donated: false, approx_previous_donations: null, donations: [] },
  consent: {
    directory_visible: false,
    contact_consent: false,
    open_to_contact: false,
    emergency_alerts: false,
    show_donation_summary: false,
  },
};

export function RegisterWizard() {
  const router = useRouter();
  const form = useForm<RegistrationInput>({ defaultValues: DEFAULTS, mode: "onTouched" });
  const { register, control, setError, clearErrors, getValues, setValue, formState } = form;
  const errors = formState.errors;
  const donations = useFieldArray({ control, name: "history.donations" });
  const [stepIndex, setStepIndex] = useState(0);
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const isDonor = useWatch({ control, name: "donor.is_donor" });
  const steps: StepKey[] = useMemo(
    () => (isDonor ? ["account", "donor", "location", "history", "consent", "review"] : ["account", "donor", "location", "review"]),
    [isDonor],
  );
  const step = steps[Math.min(stepIndex, steps.length - 1)];
  const meta = STEP_META[step];

  function validateStep(key: StepKey): boolean {
    const schema = STEP_SCHEMAS[key];
    if (!schema) return true;
    clearErrors(key as FieldPath<RegistrationInput>);
    const result = schema.safeParse(getValues(key as keyof RegistrationInput));
    if (result.success) return true;
    const seen = new Set<string>();
    for (const issue of result.error.issues) {
      const path = [key, ...issue.path.map(String)].join(".");
      if (seen.has(path)) continue; // show the first problem for each field
      seen.add(path);
      setError(path as FieldPath<RegistrationInput>, { type: "validate", message: issue.message });
    }
    return false;
  }

  function validateDonorLocation(): boolean {
    if (!getValues("donor.is_donor")) return true;
    const loc = getValues("location");
    let ok = true;
    if (!loc.state) {
      setError("location.state", { message: "Choose your state" });
      ok = false;
    }
    if (loc.district.trim().length < 2) {
      setError("location.district", { message: "Enter your district" });
      ok = false;
    }
    if (loc.city.trim().length < 2) {
      setError("location.city", { message: "Enter your city or town" });
      ok = false;
    }
    return ok;
  }

  function next() {
    setServerError(null);
    const valid = validateStep(step) && (step !== "location" || validateDonorLocation());
    if (!valid) {
      requestAnimationFrame(() => document.querySelector<HTMLElement>("[aria-invalid='true']")?.focus());
      return;
    }
    setStepIndex((i) => Math.min(i + 1, steps.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function back() {
    setServerError(null);
    setStepIndex((i) => Math.max(i - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goTo(key: StepKey) {
    const index = steps.indexOf(key);
    if (index >= 0) setStepIndex(index);
  }

  function submit() {
    setServerError(null);
    for (const key of steps) {
      if (!validateStep(key)) {
        goTo(key);
        return;
      }
    }
    if (!validateDonorLocation()) {
      goTo("location");
      return;
    }
    const values = getValues();
    if (!values.history.has_donated) values.history.donations = [];
    startTransition(async () => {
      const result = await registerDonor(values);
      if (result.ok) {
        router.push(result.data?.signedIn ? "/dashboard?welcome=1" : "/verify-email");
        return;
      }
      setServerError(result.message);
      if (result.fieldErrors) {
        let firstStep: StepKey | null = null;
        for (const [path, messages] of Object.entries(result.fieldErrors)) {
          if (!messages?.length) continue;
          setError(path as FieldPath<RegistrationInput>, { message: messages[0] });
          const stepKey = path.split(".")[0] as StepKey;
          if (!firstStep && steps.includes(stepKey)) firstStep = stepKey;
        }
        if (firstStep) goTo(firstStep);
      }
    });
  }

  const e = (path: string): string | undefined => {
    const parts = path.split(".");
    let node: unknown = errors;
    for (const part of parts) node = (node as Record<string, unknown> | undefined)?.[part];
    return (node as { message?: string } | undefined)?.message;
  };

  const contactConsent = useWatch({ control, name: "consent.contact_consent" });
  const lat = useWatch({ control, name: "location.lat" });
  const lng = useWatch({ control, name: "location.lng" });
  const coords = lat !== null && lng !== null ? { lat, lng } : null;
  const entries = useWatch({ control, name: "history.donations" });
  const hasDonated = useWatch({ control, name: "history.has_donated" });

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="surface p-4">
        <div className="mb-2 flex items-center justify-between text-xs font-semibold text-muted-foreground">
          <span>
            Step {stepIndex + 1} of {steps.length}
          </span>
          <span>{meta.subtitle}</span>
        </div>
        <ol className="flex gap-1.5" aria-label="Registration progress">
          {steps.map((key, i) => (
            <li key={key} className="flex-1">
              <span
                className={cn("block h-1.5 rounded-full transition-colors", i <= stepIndex ? "bg-primary" : "bg-muted")}
                aria-hidden="true"
              />
              <span className="sr-only">
                {STEP_META[key].title}
                {i < stepIndex ? " (completed)" : i === stepIndex ? " (current)" : ""}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <form
        className="surface space-y-5 p-5 sm:p-7"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          if (step === "review") submit();
          else next();
        }}
      >
        <h1 className="text-2xl font-extrabold" tabIndex={-1}>
          {meta.title}
        </h1>

        {step === "account" ? (
          <div className="space-y-4">
            <Field id="full_name" label="Full name" required error={e("account.full_name")}>
              <Input {...fieldAria("full_name", e("account.full_name"))} autoComplete="name" {...register("account.full_name")} />
            </Field>
            <Field id="email" label="Email" required error={e("account.email")} hint="Used to sign in and confirm your account.">
              <Input
                {...fieldAria("email", e("account.email"), true)}
                type="email"
                inputMode="email"
                autoComplete="email"
                {...register("account.email")}
              />
            </Field>
            <Field id="password" label="Password" required error={e("account.password")} hint="At least 8 characters, with a letter and a number.">
              <PasswordInput id="password" autoComplete="new-password" error={e("account.password")} hint {...register("account.password")} />
            </Field>
            <Field id="confirm_password" label="Confirm password" required error={e("account.confirm_password")}>
              <PasswordInput
                id="confirm_password"
                autoComplete="new-password"
                error={e("account.confirm_password")}
                {...register("account.confirm_password")}
              />
            </Field>
            <Controller
              control={control}
              name="account.accept_terms"
              render={({ field }) => (
                <ChoiceRow
                  id="accept_terms"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  error={e("account.accept_terms")}
                  title={
                    <>
                      I have read and accept the{" "}
                      <Link href="/privacy" target="_blank" className="text-primary underline">
                        privacy policy
                      </Link>{" "}
                      and{" "}
                      <Link href="/terms" target="_blank" className="text-primary underline">
                        terms of use
                      </Link>
                    </>
                  }
                  description="Directory visibility and contact permissions are separate choices you'll make later."
                />
              )}
            />
          </div>
        ) : null}

        {step === "donor" ? (
          <div className="space-y-5">
            <div className="space-y-2">
              <p id="donor-intent" className="text-sm font-semibold text-navy">
                Why are you joining?
              </p>
              <Controller
                control={control}
                name="donor.is_donor"
                render={({ field }) => (
                  <ChipChoice
                    name="is_donor"
                    labelledBy="donor-intent"
                    value={field.value ? "donor" : "member"}
                    onChange={(v) => field.onChange(v === "donor")}
                    options={[
                      { value: "donor", label: "I want to register as a voluntary donor" },
                      { value: "member", label: "I want to request blood or share a story", description: "You can become a donor later." },
                    ]}
                  />
                )}
              />
            </div>
            {isDonor ? (
              <>
                <div className="space-y-2">
                  <p id="bg-label" className="text-sm font-semibold text-navy">
                    Blood group <span className="text-primary">*</span>
                  </p>
                  <Controller
                    control={control}
                    name="donor.blood_group"
                    render={({ field }) => (
                      <BloodGroupPicker name="blood_group" labelledBy="bg-label" value={field.value} onChange={field.onChange} error={e("donor.blood_group")} />
                    )}
                  />
                  <p className="text-xs text-muted-foreground">
                    If you are unsure, you can find it on a previous donor card or blood test report. A blood centre will always
                    test again before any transfusion.
                  </p>
                </div>
                <Controller
                  control={control}
                  name="donor.age_confirmed"
                  render={({ field }) => (
                    <ChoiceRow
                      id="age_confirmed"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      error={e("donor.age_confirmed")}
                      title="I confirm I am between 18 and 65 years old"
                      description="We don't ask for your date of birth. Final eligibility is always decided at the blood centre."
                    />
                  )}
                />
                <div className="space-y-2">
                  <p id="exp-label" className="text-sm font-semibold text-navy">
                    Donation experience <span className="text-primary">*</span>
                  </p>
                  <Controller
                    control={control}
                    name="donor.donation_experience"
                    render={({ field }) => (
                      <ChipChoice<DonationExperience>
                        name="donation_experience"
                        labelledBy="exp-label"
                        columns={1}
                        value={field.value}
                        onChange={field.onChange}
                        options={(Object.keys(DONATION_EXPERIENCE_LABELS) as DonationExperience[]).map((value) => ({
                          value,
                          label: DONATION_EXPERIENCE_LABELS[value],
                        }))}
                      />
                    )}
                  />
                  {e("donor.donation_experience") ? <p className="text-xs font-medium text-destructive">{e("donor.donation_experience")}</p> : null}
                </div>
              </>
            ) : null}
            <Field id="display_name" label="Preferred display name" error={e("donor.display_name")} hint="Shown to volunteers instead of your full name. Optional.">
              <Input {...fieldAria("display_name", e("donor.display_name"), true)} autoComplete="nickname" {...register("donor.display_name")} />
            </Field>
            <Field
              id="phone"
              label="Mobile number"
              error={e("donor.phone")}
              hint="Kept private. Shared with an authorised volunteer only if you allow contact."
            >
              <Input {...fieldAria("phone", e("donor.phone"), true)} type="tel" inputMode="tel" autoComplete="tel" placeholder="98765 43210" {...register("donor.phone")} />
            </Field>
            <Field id="preferred_contact_method" label="Preferred contact method" error={e("donor.preferred_contact_method")}>
              <select {...fieldAria("preferred_contact_method", e("donor.preferred_contact_method"))} className={selectClass} {...register("donor.preferred_contact_method")}>
                {(Object.keys(CONTACT_METHOD_LABELS) as ContactMethod[]).map((m) => (
                  <option key={m} value={m}>
                    {CONTACT_METHOD_LABELS[m]}
                  </option>
                ))}
              </select>
            </Field>
            <p className="text-xs text-muted-foreground">
              You can add a profile photo later from your profile. We don&apos;t ask for medical history.
            </p>
          </div>
        ) : null}

        {step === "location" ? (
          <div className="space-y-4">
            {!isDonor ? <p className="text-sm text-muted-foreground">Optional for members who are not registering as donors.</p> : null}
            <Field id="state" label="State / union territory" required={isDonor} error={e("location.state")}>
              <select {...fieldAria("state", e("location.state"))} className={selectClass} autoComplete="address-level1" {...register("location.state")}>
                <option value="">Select…</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="district" label="District" required={isDonor} error={e("location.district")}>
                <Input {...fieldAria("district", e("location.district"))} {...register("location.district")} />
              </Field>
              <Field id="city" label="City / town" required={isDonor} error={e("location.city")}>
                <Input {...fieldAria("city", e("location.city"))} autoComplete="address-level2" {...register("location.city")} />
              </Field>
              <Field id="locality" label="Locality / area" error={e("location.locality")} hint="Neighbourhood only — not your street address.">
                <Input {...fieldAria("locality", e("location.locality"), true)} {...register("location.locality")} />
              </Field>
              <Field id="pincode" label="PIN code" error={e("location.pincode")}>
                <Input {...fieldAria("pincode", e("location.pincode"))} inputMode="numeric" maxLength={6} autoComplete="postal-code" {...register("location.pincode")} />
              </Field>
            </div>
            {isDonor ? (
              <>
                <ApproxLocation
                  value={coords}
                  onChange={(value) => {
                    setValue("location.lat", value?.lat ?? null);
                    setValue("location.lng", value?.lng ?? null);
                  }}
                />
                <Field id="max_distance_km" label="How far could you travel to donate? (optional)" error={e("location.max_distance_km")}>
                  <Controller
                    control={control}
                    name="location.max_distance_km"
                    render={({ field }) => (
                      <select
                        id="max_distance_km"
                        className={selectClass}
                        value={field.value ?? ""}
                        onChange={(ev) => field.onChange(ev.target.value ? Number(ev.target.value) : null)}
                      >
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
              </>
            ) : null}
          </div>
        ) : null}

        {step === "history" ? (
          <div className="space-y-4">
            <Controller
              control={control}
              name="history.has_donated"
              render={({ field }) => (
                <ChipChoice
                  name="has_donated"
                  value={field.value ? "yes" : "no"}
                  onChange={(v) => {
                    field.onChange(v === "yes");
                    if (v === "yes" && donations.fields.length === 0) {
                      donations.append({ donation_type: "whole_blood", donation_date: "", centre_name: "", city: "", district: "", event_name: "" });
                    }
                  }}
                  options={[
                    { value: "no", label: "I haven't donated before" },
                    { value: "yes", label: "I have donated before" },
                  ]}
                />
              )}
            />
            {hasDonated ? (
              <>
                <Field id="approx_previous_donations" label="Roughly how many times have you donated? (optional)" error={e("history.approx_previous_donations")}>
                  <Controller
                    control={control}
                    name="history.approx_previous_donations"
                    render={({ field }) => (
                      <Input
                        id="approx_previous_donations"
                        type="number"
                        inputMode="numeric"
                        min={0}
                        max={500}
                        value={field.value ?? ""}
                        onChange={(ev) => field.onChange(ev.target.value === "" ? null : Number(ev.target.value))}
                      />
                    )}
                  />
                </Field>
                <p className="text-sm text-muted-foreground">
                  Add the donations you remember. Whole blood and SDP are recorded separately. Entries stay marked as
                  self-reported until verified.
                </p>
                <ul className="space-y-3">
                  {donations.fields.map((item, index) => {
                    const entry = entries[index];
                    const dupes =
                      entry?.donation_date && entry.donation_type
                        ? findPossibleDuplicates(
                            entries.filter((_, i) => i !== index).map((d, i) => ({ ...d, id: String(i) })),
                            { donation_type: entry.donation_type, donation_date: entry.donation_date },
                          )
                        : [];
                    return (
                      <li key={item.id} className="rounded-2xl border bg-white p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <p className="text-sm font-bold text-navy">Donation {index + 1}</p>
                          <Button type="button" variant="ghost" size="icon-sm" onClick={() => donations.remove(index)} aria-label={`Remove donation ${index + 1}`}>
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Field id={`d-type-${index}`} label="Type" error={e(`history.donations.${index}.donation_type`)}>
                            <select id={`d-type-${index}`} className={selectClass} {...register(`history.donations.${index}.donation_type` as const)}>
                              {DONATION_TYPES.map((t) => (
                                <option key={t} value={t}>
                                  {DONATION_TYPE_LABELS[t as DonationType]}
                                </option>
                              ))}
                            </select>
                          </Field>
                          <Field id={`d-date-${index}`} label="Date (approximate is fine)" error={e(`history.donations.${index}.donation_date`)}>
                            <Input
                              {...fieldAria(`d-date-${index}`, e(`history.donations.${index}.donation_date`))}
                              type="date"
                              max={todayInIndia()}
                              {...register(`history.donations.${index}.donation_date` as const)}
                            />
                          </Field>
                          <Field id={`d-centre-${index}`} label="Hospital / blood bank / centre" className="sm:col-span-2" error={e(`history.donations.${index}.centre_name`)}>
                            <Input {...fieldAria(`d-centre-${index}`, e(`history.donations.${index}.centre_name`))} {...register(`history.donations.${index}.centre_name` as const)} />
                          </Field>
                          <Field id={`d-city-${index}`} label="City">
                            <Input id={`d-city-${index}`} {...register(`history.donations.${index}.city` as const)} />
                          </Field>
                          <Field id={`d-district-${index}`} label="District">
                            <Input id={`d-district-${index}`} {...register(`history.donations.${index}.district` as const)} />
                          </Field>
                          <Field id={`d-event-${index}`} label="Camp / event name (optional)" className="sm:col-span-2">
                            <Input id={`d-event-${index}`} {...register(`history.donations.${index}.event_name` as const)} />
                          </Field>
                        </div>
                        {dupes.length ? (
                          <p className="mt-3 flex items-start gap-2 rounded-xl bg-warning-soft p-2.5 text-xs text-warning">
                            <AlertTriangle className="mt-px size-4 shrink-0" aria-hidden="true" />
                            This is within a week of another {DONATION_TYPE_LABELS[entry.donation_type].toLowerCase()} entry. Please check
                            it isn&apos;t the same donation entered twice.
                          </p>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
                {donations.fields.length < 20 ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => donations.append({ donation_type: "whole_blood", donation_date: "", centre_name: "", city: "", district: "", event_name: "" })}
                  >
                    <Plus className="size-4" aria-hidden="true" /> Add another donation
                  </Button>
                ) : null}
              </>
            ) : null}
          </div>
        ) : null}

        {step === "consent" ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Each permission is separate and optional. You can change any of them at any time from Privacy &amp; settings.
            </p>
            <Controller
              control={control}
              name="consent.directory_visible"
              render={({ field }) => (
                <ChoiceRow
                  id="directory_visible"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  title="Show me in the volunteer donor directory"
                  description="Authorised volunteers can see your display name, blood group and broad area (city/locality). Never your phone, email or address. Not visible to the public."
                />
              )}
            />
            <Controller
              control={control}
              name="consent.contact_consent"
              render={({ field }) => (
                <ChoiceRow
                  id="contact_consent"
                  checked={field.value}
                  onCheckedChange={(v) => {
                    field.onChange(v);
                    if (!v) setValue("consent.open_to_contact", false);
                  }}
                  title="Allow authorised volunteers to contact me about blood requests"
                  description="Your number is revealed only to a volunteer coordinating a verified request, and every access is logged."
                />
              )}
            />
            <Controller
              control={control}
              name="consent.open_to_contact"
              render={({ field }) => (
                <div className={cn(!contactConsent && "pointer-events-none opacity-50")} aria-disabled={!contactConsent}>
                  <ChoiceRow
                    id="open_to_contact"
                    checked={field.value && contactConsent}
                    onCheckedChange={field.onChange}
                    error={e("consent.open_to_contact")}
                    title="I'm currently open to being contacted"
                    description="Turn this off any time you can't donate (travel, illness, recent donation)."
                  />
                </div>
              )}
            />
            <Controller
              control={control}
              name="consent.emergency_alerts"
              render={({ field }) => (
                <ChoiceRow
                  id="emergency_alerts"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  title="Send me in-app alerts for verified requests near me"
                  description="Only verified requests matching your blood group and district. No SMS or bulk messages."
                />
              )}
            />
            <Controller
              control={control}
              name="consent.show_donation_summary"
              render={({ field }) => (
                <ChoiceRow
                  id="show_donation_summary"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  title="Show my verified donation summary to volunteers"
                  description="Last verified whole blood / SDP dates and counts. Helps volunteers, but is never a medical eligibility decision."
                />
              )}
            />
          </div>
        ) : null}

        {step === "review" ? <ReviewSummary values={getValues()} isDonor={isDonor} onEdit={goTo} /> : null}

        {serverError ? (
          <p className="rounded-xl border border-destructive/25 bg-destructive/5 px-3.5 py-3 text-sm text-destructive" role="alert">
            {serverError}
          </p>
        ) : null}

        <div className="sticky bottom-3 z-10 flex gap-3 pt-2">
          {stepIndex > 0 ? (
            <Button type="button" variant="outline" size="lg" onClick={back} disabled={pending} className="bg-white">
              <ArrowLeft className="size-4" aria-hidden="true" /> Back
            </Button>
          ) : null}
          <Button type="submit" size="lg" className="flex-1" disabled={pending}>
            {step === "review" ? (
              pending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Creating your account…
                </>
              ) : (
                <>
                  <Check className="size-4" aria-hidden="true" /> Register
                </>
              )
            ) : (
              <>
                Continue <ArrowRight className="size-4" aria-hidden="true" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

function ReviewSummary({ values, isDonor, onEdit }: { values: RegistrationInput; isDonor: boolean; onEdit: (step: StepKey) => void }) {
  const yesNo = (v: boolean) => (v ? "Yes" : "No");
  const sections: Array<{ step: StepKey; title: string; rows: Array<[string, string]> }> = [
    {
      step: "account",
      title: "Account",
      rows: [
        ["Name", values.account.full_name],
        ["Email", values.account.email],
      ],
    },
    {
      step: "donor",
      title: "Donor details",
      rows: isDonor
        ? [
            ["Registering as", "Voluntary donor"],
            ["Blood group", values.donor.blood_group || "—"],
            ["Display name", values.donor.display_name || "—"],
            ["Mobile", values.donor.phone || "—"],
            ["Preferred contact", CONTACT_METHOD_LABELS[values.donor.preferred_contact_method]],
          ]
        : [["Registering as", "Member (requests and stories)"]],
    },
    {
      step: "location",
      title: "Area",
      rows: [
        ["State", values.location.state || "—"],
        ["District / city", [values.location.district, values.location.city].filter(Boolean).join(", ") || "—"],
        ["Locality / PIN", [values.location.locality, values.location.pincode].filter(Boolean).join(" · ") || "—"],
        ["Approximate map location", values.location.lat !== null ? "Added (rounded to ~1 km)" : "Not added"],
      ],
    },
  ];
  if (isDonor) {
    sections.push(
      {
        step: "history",
        title: "Donation history (self-reported)",
        rows: values.history.has_donated
          ? values.history.donations.map((d, i) => [`#${i + 1} ${DONATION_TYPE_LABELS[d.donation_type]}`, `${formatDate(d.donation_date)} · ${d.centre_name}`])
          : [["History", "No previous donations"]],
      },
      {
        step: "consent",
        title: "Your permissions",
        rows: [
          ["Visible in volunteer directory", yesNo(values.consent.directory_visible)],
          ["Volunteers may contact me", yesNo(values.consent.contact_consent)],
          ["Currently open to contact", yesNo(values.consent.contact_consent && values.consent.open_to_contact)],
          ["In-app request alerts", yesNo(values.consent.emergency_alerts)],
          ["Share verified donation summary", yesNo(values.consent.show_donation_summary)],
        ],
      },
    );
  }
  return (
    <div className="space-y-3">
      {sections.map((section) => (
        <section key={section.step} className="rounded-2xl border bg-white p-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-bold">{section.title}</h2>
            <Button type="button" variant="ghost" size="sm" onClick={() => onEdit(section.step)}>
              <Pencil className="size-3.5" aria-hidden="true" /> Edit
            </Button>
          </div>
          <dl className="space-y-1.5 text-sm">
            {section.rows.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="text-right font-medium break-words">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
      <p className="text-xs text-muted-foreground">
        Registering does not make you medically eligible to donate. Blood centres screen every donor at the time of donation.
      </p>
    </div>
  );
}
