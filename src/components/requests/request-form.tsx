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
import { LocationPickers } from "@/components/forms/location-pickers";
import { Notice } from "@/components/common/page-parts";
import { submitBloodRequest, type SubmittedRequest } from "@/actions/requests";
import {
  CONTACT_METHOD_LABELS,
  PATIENT_GENDER_LABELS,
  PATIENT_GENDERS,
  REQUEST_REASON_LABELS,
  REQUEST_REASONS,
  REQUEST_TYPE_LABELS,
  REQUESTER_CONTACT_METHODS,
  REQUESTER_RELATION_LABELS,
  REQUESTER_RELATIONS,
  URGENCY_LABELS,
  type PatientGender,
  type RequesterContactMethod,
  type RequestType,
  type Urgency,
} from "@/lib/constants";
import { bloodRequestSchema, type BloodRequestInput } from "@/lib/validation/forms";
import { useT } from "@/i18n/client";

const DEFAULTS: BloodRequestInput = {
  patient_name: "",
  patient_age: null,
  patient_gender: "",
  blood_group: "" as BloodRequestInput["blood_group"],
  request_type: "whole_blood",
  units_needed: null,
  hospital_name: "",
  state: "",
  district: "",
  city: "",
  hospital_patient_id: "",
  ward: "",
  reason: "",
  required_by: "",
  urgency: "urgent",
  requester_name: "",
  requester_relation: "",
  requester_phone: "",
  requester_contact_method: "phone",
  notes: "",
  acknowledge_limits: false,
  website: "",
};

/** datetime-local value in India time, `hours` from now (for min/max hints). */
function localIndiaInput(hours: number): string {
  return new Date(Date.now() + (hours + 5.5) * 3600_000).toISOString().slice(0, 16);
}

/** A number input that stores null while empty. */
function NumberInput({ id, value, onChange, onBlur, error, min, max }: {
  id: string;
  value: number | null;
  onChange: (v: number | null) => void;
  onBlur: () => void;
  error?: string;
  min: number;
  max: number;
}) {
  return (
    <Input
      {...fieldAria(id, error)}
      type="number"
      inputMode="numeric"
      min={min}
      max={max}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
      onBlur={onBlur}
    />
  );
}

export function BloodRequestForm({ defaultName }: { defaultName?: string }) {
  const t = useT();
  const form = useForm<BloodRequestInput>({
    resolver: zodResolver(bloodRequestSchema),
    defaultValues: { ...DEFAULTS, requester_name: defaultName ?? "" },
    mode: "onTouched",
  });
  const { register, control, handleSubmit, setError, setValue, formState } = form;
  const errors = formState.errors;
  const [pending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<SubmittedRequest | null>(null);
  const requestType = useWatch({ control, name: "request_type" });
  const [locState, locDistrict, locCity] = useWatch({ control, name: ["state", "district", "city"] });

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
              "It looks like a request for the same blood group at this hospital was submitted recently. Rakt Mitras will check both so donors aren't contacted twice.",
            )}
          </Notice>
        ) : null}
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
          <li>{t("A Rakt Mitra will check the request with the hospital.")}</li>
          <li>{t("Once it is verified, your request page shows donors who can give now, and you can contact them directly.")}</li>
          <li>{t("Keep in touch with the hospital blood bank — they decide what is needed and when.")}</li>
        </ul>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild>
            <Link href={`/requests/${submitted.requestId}`}>{t("Open my request")}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/blood-requests">{t("Back to blood requests")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="surface space-y-6 p-5 sm:p-7">
      {/* Honeypot: invisible to people, tempting to bots. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>

      <fieldset className="space-y-4">
        <legend className="mb-1 text-base font-bold text-navy">{t("Patient")}</legend>
        <Field id="patient_name" label="Patient's full name" required error={errors.patient_name?.message} hint="As on the hospital's blood request form.">
          <Input {...fieldAria("patient_name", errors.patient_name?.message, true)} autoComplete="off" {...register("patient_name")} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="patient_age" label="Age (years)" required error={errors.patient_age?.message}>
            <Controller
              control={control}
              name="patient_age"
              render={({ field }) => (
                <NumberInput id="patient_age" value={field.value} onChange={field.onChange} onBlur={field.onBlur} error={errors.patient_age?.message} min={0} max={120} />
              )}
            />
          </Field>
          <div className="space-y-2">
            <p id="rq-gender" className="text-sm font-semibold text-navy">
              {t("Gender")} <span className="text-primary">*</span>
            </p>
            <Controller
              control={control}
              name="patient_gender"
              render={({ field }) => (
                <ChipChoice<PatientGender>
                  name="patient_gender"
                  labelledBy="rq-gender"
                  columns={3}
                  value={field.value}
                  onChange={field.onChange}
                  options={PATIENT_GENDERS.map((g) => ({ value: g, label: t(PATIENT_GENDER_LABELS[g]) }))}
                />
              )}
            />
            {errors.patient_gender?.message ? (
              <p className="text-sm text-destructive" role="alert">
                {t(errors.patient_gender.message)}
              </p>
            ) : null}
          </div>
        </div>
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
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="mb-1 text-base font-bold text-navy">{t("What is needed")}</legend>
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
                  { value: "other_apheresis", label: t(REQUEST_TYPE_LABELS.other_apheresis), description: t("White blood cells (granulocytes), or another component such as plasma, collected by a machine as the hospital advises.") },
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
          <Field id="units_needed" label="Units / donors needed" required error={errors.units_needed?.message}>
            <Controller
              control={control}
              name="units_needed"
              render={({ field }) => (
                <NumberInput id="units_needed" value={field.value} onChange={field.onChange} onBlur={field.onBlur} error={errors.units_needed?.message} min={1} max={50} />
              )}
            />
          </Field>
          <Field id="reason" label="Reason (optional)" error={errors.reason?.message}>
            <select id="reason" className={selectClass} {...register("reason")}>
              <option value="">{t("Choose")}</option>
              {REQUEST_REASONS.map((r) => (
                <option key={r} value={r}>
                  {t(REQUEST_REASON_LABELS[r])}
                </option>
              ))}
            </select>
          </Field>
        </div>
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
        <Field id="required_by" label="Needed by (date and time)" required error={errors.required_by?.message} hint="India time.">
          <Input {...fieldAria("required_by", errors.required_by?.message, true)} type="datetime-local" min={localIndiaInput(0)} max={localIndiaInput(60 * 24)} {...register("required_by")} />
        </Field>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="mb-1 text-base font-bold text-navy">{t("Hospital")}</legend>
        <Field id="hospital_name" label="Hospital or blood bank" required error={errors.hospital_name?.message}>
          <Input {...fieldAria("hospital_name", errors.hospital_name?.message)} {...register("hospital_name")} />
        </Field>
        <LocationPickers
          required={{ district: true, city: true }}
          labels={{ city: "City / town" }}
          values={{ state: locState ?? "", district: locDistrict ?? "", city: locCity ?? "" }}
          onChange={(field, value) => setValue(field as "state" | "district" | "city", value, { shouldDirty: true, shouldValidate: formState.isSubmitted })}
          errors={{ state: errors.state?.message, district: errors.district?.message, city: errors.city?.message }}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="hospital_patient_id" label="Patient's IP / UHID number (optional)" error={errors.hospital_patient_id?.message} hint="Donors give this at the blood bank.">
            <Input {...fieldAria("hospital_patient_id", errors.hospital_patient_id?.message, true)} autoComplete="off" {...register("hospital_patient_id")} />
          </Field>
          <Field id="ward" label="Ward or bed (optional)" error={errors.ward?.message}>
            <Input {...fieldAria("ward", errors.ward?.message)} autoComplete="off" {...register("ward")} />
          </Field>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="mb-1 text-base font-bold text-navy">{t("Your details")}</legend>
        <p className="text-xs text-muted-foreground">
          {t("Rakt Mitras see all these details to verify the request. Donors who offer to help see the patient's name, the hospital, and your name and number, so they can reach you.")}
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="requester_name" label="Your name" required error={errors.requester_name?.message}>
            <Input {...fieldAria("requester_name", errors.requester_name?.message)} autoComplete="name" {...register("requester_name")} />
          </Field>
          <Field id="requester_relation" label="Your relation to the patient" required error={errors.requester_relation?.message}>
            <select className={selectClass} {...fieldAria("requester_relation", errors.requester_relation?.message)} {...register("requester_relation")}>
              <option value="">{t("Choose")}</option>
              {REQUESTER_RELATIONS.map((r) => (
                <option key={r} value={r}>
                  {t(REQUESTER_RELATION_LABELS[r])}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="requester_phone" label="Your phone" required error={errors.requester_phone?.message}>
            <Input {...fieldAria("requester_phone", errors.requester_phone?.message)} type="tel" inputMode="tel" autoComplete="tel" {...register("requester_phone")} />
          </Field>
          <div className="space-y-2">
            <p id="rq-method" className="text-sm font-semibold text-navy">
              {t("Donors can reach you by")} <span className="text-primary">*</span>
            </p>
            <Controller
              control={control}
              name="requester_contact_method"
              render={({ field }) => (
                <ChipChoice<RequesterContactMethod>
                  name="requester_contact_method"
                  labelledBy="rq-method"
                  columns={2}
                  value={field.value}
                  onChange={field.onChange}
                  options={REQUESTER_CONTACT_METHODS.map((m) => ({ value: m, label: t(CONTACT_METHOD_LABELS[m]) }))}
                />
              )}
            />
          </div>
        </div>
        <Field id="notes" label="Anything Rakt Mitras should know? (optional)" error={errors.notes?.message}>
          <Textarea {...fieldAria("notes", errors.notes?.message)} rows={3} {...register("notes")} />
        </Field>
      </fieldset>

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
