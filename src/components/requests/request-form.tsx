"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Controller, useForm, useWatch, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChoiceRow, Field, fieldAria, selectClass } from "@/components/common/form-parts";
import { BloodGroupPicker, ChipChoice } from "@/components/forms/pickers";
import { Notice } from "@/components/common/page-parts";
import { submitBloodRequest, type SubmittedRequest } from "@/actions/requests";
import { CONTACT_METHOD_LABELS, INDIAN_STATES, REQUEST_TYPE_LABELS, URGENCY_LABELS, type ContactMethod, type RequestType, type Urgency } from "@/lib/constants";
import { bloodRequestSchema, type BloodRequestInput } from "@/lib/validation/forms";
import { useT } from "@/i18n/client";

const DEFAULTS: BloodRequestInput = {
  requester_name: "",
  requester_phone: "",
  requester_email: "",
  requester_contact_method: "phone",
  blood_group: "" as BloodRequestInput["blood_group"],
  request_type: "whole_blood",
  units_needed: null,
  hospital_name: "",
  state: "",
  district: "",
  city: "",
  required_by: "",
  urgency: "urgent",
  notes: "",
  public_listing_consent: false,
  acknowledge_limits: false,
  website: "",
};

/** datetime-local value in India time, `hours` from now (for min/max hints). */
function localIndiaInput(hours: number): string {
  return new Date(Date.now() + (hours + 5.5) * 3600_000).toISOString().slice(0, 16);
}

export function BloodRequestForm({ signedIn, defaultName }: { signedIn: boolean; defaultName?: string }) {
  const t = useT();
  const form = useForm<BloodRequestInput>({
    resolver: zodResolver(bloodRequestSchema),
    defaultValues: { ...DEFAULTS, requester_name: defaultName ?? "" },
    mode: "onTouched",
  });
  const { register, control, handleSubmit, setError, formState } = form;
  const errors = formState.errors;
  const [pending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<SubmittedRequest | null>(null);
  const requestType = useWatch({ control, name: "request_type" });

  const onSubmit = handleSubmit(
    (values) => {
      setServerError(null);
      startTransition(async () => {
        const result = await submitBloodRequest(values);
        if (result.ok && result.data) {
          setSubmitted(result.data);
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }
        if (!result.ok) {
          setServerError(result.message);
          for (const [path, messages] of Object.entries(result.fieldErrors ?? {})) {
            if (messages?.[0]) setError(path as FieldPath<BloodRequestInput>, { message: messages[0] });
          }
        }
      });
    },
    () => requestAnimationFrame(() => document.querySelector<HTMLElement>("[aria-invalid='true']")?.focus()),
  );

  if (submitted) {
    return (
      <div className="surface space-y-4 p-5 sm:p-7" role="status">
        <CheckCircle2 className="size-10 text-success" aria-hidden="true" />
        <h2 className="text-xl font-extrabold">{t("Request received")}</h2>
        <p className="text-sm">
          {t("Your reference is")} <strong className="text-navy">{submitted.referenceCode}</strong>. {t("Please note it down.")}
        </p>
        {submitted.possibleDuplicate ? (
          <Notice tone="warning" title={t("A similar request is already open")}>
            {t(
              "It looks like a request for the same blood group at this hospital was submitted recently. Volunteers will check both so donors aren't contacted twice.",
            )}
          </Notice>
        ) : null}
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
          <li>{t("A volunteer will verify the request with you or the hospital before contacting donors.")}</li>
          <li>{t("Until it is verified it is not shown publicly or sent to donors.")}</li>
          <li>{t("Keep in touch with the hospital blood bank — they decide what is needed and when.")}</li>
        </ul>
        <div className="flex flex-col gap-2 sm:flex-row">
          {submitted.signedIn ? (
            <Button asChild>
              <Link href="/requests">{t("Track in My requests")}</Link>
            </Button>
          ) : null}
          <Button asChild variant="outline">
            <Link href="/blood-requests">{t("Back to blood requests")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="surface space-y-5 p-5 sm:p-7">
      {/* Honeypot: invisible to people, tempting to bots. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>

      <fieldset className="space-y-4">
        <legend className="mb-1 text-base font-bold text-navy">{t("What is needed")}</legend>
        <div className="space-y-2">
          <p id="rq-bg" className="text-sm font-semibold text-navy">
            {t("Blood group")} <span className="text-primary">*</span>
          </p>
          <Controller
            control={control}
            name="blood_group"
            render={({ field }) => (
              <BloodGroupPicker name="blood_group" labelledBy="rq-bg" value={field.value ?? ""} onChange={(v) => field.onChange(v)} error={errors.blood_group?.message} />
            )}
          />
        </div>
        <div className="space-y-2">
          <p id="rq-type" className="text-sm font-semibold text-navy">
            {t("Type of donor needed")} <span className="text-primary">*</span>
          </p>
          <Controller
            control={control}
            name="request_type"
            render={({ field }) => (
              <ChipChoice<RequestType>
                name="request_type"
                labelledBy="rq-type"
                columns={1}
                value={field.value}
                onChange={field.onChange}
                options={[
                  { value: "whole_blood", label: t(REQUEST_TYPE_LABELS.whole_blood), description: t("Standard blood donation (the hospital may separate components).") },
                  { value: "sdp", label: t(REQUEST_TYPE_LABELS.sdp), description: t("Single donor platelets collected by apheresis at the hospital's platelet unit.") },
                  { value: "other_apheresis", label: t(REQUEST_TYPE_LABELS.other_apheresis), description: t("Another specific apheresis component, as advised by the hospital.") },
                ]}
              />
            )}
          />
          {requestType === "sdp" ? (
            <p className="rounded-xl bg-secondary p-3 text-xs text-secondary-foreground">
              {t(
                "SDP donors need additional screening at the apheresis centre (for example a platelet count). The hospital decides suitability and timing — we only help find willing donors.",
              )}
            </p>
          ) : null}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="units_needed" label="Units / donors needed (if known)" error={errors.units_needed?.message}>
            <Controller
              control={control}
              name="units_needed"
              render={({ field }) => (
                <Input
                  {...fieldAria("units_needed", errors.units_needed?.message)}
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={50}
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                  onBlur={field.onBlur}
                />
              )}
            />
          </Field>
          <div className="space-y-2">
            <p id="rq-urgency" className="text-sm font-semibold text-navy">
              {t("Urgency")} <span className="text-primary">*</span>
            </p>
            <Controller
              control={control}
              name="urgency"
              render={({ field }) => (
                <ChipChoice<Urgency>
                  name="urgency"
                  labelledBy="rq-urgency"
                  columns={3}
                  value={field.value}
                  onChange={field.onChange}
                  options={(Object.keys(URGENCY_LABELS) as Urgency[]).map((u) => ({ value: u, label: t(URGENCY_LABELS[u]) }))}
                />
              )}
            />
          </div>
        </div>
        <Field id="required_by" label="Needed by (date and time)" required error={errors.required_by?.message} hint="India time.">
          <Input {...fieldAria("required_by", errors.required_by?.message, true)} type="datetime-local" min={localIndiaInput(0)} max={localIndiaInput(60 * 24)} {...register("required_by")} />
        </Field>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="mb-1 text-base font-bold text-navy">{t("Where")}</legend>
        <Field id="hospital_name" label="Hospital or blood bank" required error={errors.hospital_name?.message}>
          <Input {...fieldAria("hospital_name", errors.hospital_name?.message)} {...register("hospital_name")} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field id="city" label="City" required error={errors.city?.message}>
            <Input {...fieldAria("city", errors.city?.message)} {...register("city")} />
          </Field>
          <Field id="district" label="District" required error={errors.district?.message}>
            <Input {...fieldAria("district", errors.district?.message)} {...register("district")} />
          </Field>
          <Field id="state" label="State" error={errors.state?.message}>
            <select id="state" className={selectClass} {...register("state")}>
              <option value="">{t("Select…")}</option>
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>
                  {t(s)}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="mb-1 text-base font-bold text-navy">{t("How volunteers can reach you")}</legend>
        <p className="text-xs text-muted-foreground">{t("Kept private — only authorised volunteers see these details.")}</p>
        <Field id="requester_name" label="Your name" required error={errors.requester_name?.message}>
          <Input {...fieldAria("requester_name", errors.requester_name?.message)} autoComplete="name" {...register("requester_name")} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="requester_phone" label="Phone" error={errors.requester_phone?.message}>
            <Input {...fieldAria("requester_phone", errors.requester_phone?.message)} type="tel" inputMode="tel" autoComplete="tel" {...register("requester_phone")} />
          </Field>
          <Field id="requester_email" label="Email" error={errors.requester_email?.message}>
            <Input {...fieldAria("requester_email", errors.requester_email?.message)} type="email" inputMode="email" autoComplete="email" {...register("requester_email")} />
          </Field>
        </div>
        <Field id="requester_contact_method" label="Best way to reach you">
          <select id="requester_contact_method" className={selectClass} {...register("requester_contact_method")}>
            {(["phone", "whatsapp", "email"] as ContactMethod[]).concat(signedIn ? ["in_app"] : []).map((m) => (
              <option key={m} value={m}>
                {t(CONTACT_METHOD_LABELS[m])}
              </option>
            ))}
          </select>
        </Field>
        <Field id="notes" label="Anything volunteers should know? (optional)" error={errors.notes?.message} hint="Please don't include the patient's name, diagnosis or medical documents.">
          <Textarea {...fieldAria("notes", errors.notes?.message, true)} rows={3} {...register("notes")} />
        </Field>
      </fieldset>

      <div className="space-y-3">
        <Controller
          control={control}
          name="public_listing_consent"
          render={({ field }) => (
            <ChoiceRow
              id="public_listing_consent"
              checked={field.value}
              onCheckedChange={field.onChange}
              title="List this request publicly once it is verified"
              description="Only the blood group, donor type, hospital, city, time needed and urgency are shown — never your name or contact details."
            />
          )}
        />
        <Controller
          control={control}
          name="acknowledge_limits"
          render={({ field }) => (
            <ChoiceRow
              id="acknowledge_limits"
              checked={field.value}
              onCheckedChange={field.onChange}
              error={errors.acknowledge_limits?.message}
              title="I understand Rakt Response helps find voluntary donors but cannot guarantee availability, reserve blood or decide compatibility"
              description="I will stay in contact with the hospital or licensed blood bank."
            />
          )}
        />
      </div>

      {serverError ? (
        <p className="rounded-xl border border-destructive/25 bg-destructive/5 px-3.5 py-3 text-sm text-destructive" role="alert">
          {t(serverError)}
        </p>
      ) : null}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Send className="size-4" aria-hidden="true" />}
        {pending ? t("Submitting…") : t("Submit request for verification")}
      </Button>
    </form>
  );
}
