"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, fieldAria } from "@/components/common/form-parts";
import { ChipChoice } from "@/components/forms/pickers";
import { LocationPickers } from "@/components/forms/location-pickers";
import { addDonation, updateDonation } from "@/actions/donations";
import { DONATION_TYPE_LABELS, DONATION_TYPES, type DonationType, type VerificationStatus } from "@/lib/constants";
import { formatDate, todayInIndia } from "@/lib/format";
import { donationRecordSchema, type DonationRecordInput } from "@/lib/validation/forms";
import { useT } from "@/i18n/client";

/** An existing record being edited (owner, verifying volunteer or administrator). */
export interface EditableDonation {
  id: string;
  values: DonationRecordInput;
  status: VerificationStatus;
  isOwner: boolean;
}

/** Adds a new donation, or edits one when `record` is given; `returnTo` is where to go after saving. */
export function DonationForm({ record, returnTo = "/donations" }: { record?: EditableDonation; returnTo?: string } = {}) {
  const t = useT();
  const router = useRouter();
  const editing = Boolean(record);
  const form = useForm<DonationRecordInput>({
    resolver: zodResolver(donationRecordSchema),
    defaultValues: record?.values ?? { donation_type: "whole_blood", donation_date: "", centre_name: "", city: "", district: "", event_name: "", confirm_duplicate: false },
    mode: "onTouched",
  });
  const { register, control, handleSubmit, setError, setValue, formState } = form;
  const [district, city] = useWatch({ control, name: ["district", "city"] });
  const errors = formState.errors;
  const [pending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [duplicates, setDuplicates] = useState<Array<{ donation_date: string; centre_name: string }> | null>(null);

  const [selfReportedBefore, selfReportedAfter] = t(
    "This record will be marked {status} until an authorised Rakt Mitra verifies it. Recording a donation does not determine when you can donate again.",
  ).split("{status}");

  const onSubmit = handleSubmit((values) => {
    setServerError(null);
    startTransition(async () => {
      if (record) {
        const updated = await updateDonation(record.id, values);
        if (updated.ok) {
          const next = new URL(returnTo, window.location.origin);
          next.searchParams.set("saved", updated.data?.recheck ? "recheck" : "edited");
          router.push(next.pathname + next.search);
          router.refresh();
          return;
        }
        setServerError(updated.message);
        for (const [path, messages] of Object.entries(updated.fieldErrors ?? {})) {
          if (messages?.[0]) setError(path as FieldPath<DonationRecordInput>, { message: messages[0] });
        }
        return;
      }
      const result = await addDonation(values);
      if (result.ok && result.data?.needsDuplicateConfirmation) {
        setDuplicates(result.data.duplicates ?? []);
        setValue("confirm_duplicate", true);
        return;
      }
      if (result.ok) {
        router.push("/donations?saved=1");
        router.refresh();
        return;
      }
      setServerError(result.message);
      for (const [path, messages] of Object.entries(result.fieldErrors ?? {})) {
        if (messages?.[0]) setError(path as FieldPath<DonationRecordInput>, { message: messages[0] });
      }
    });
  });

  return (
    <form onSubmit={onSubmit} noValidate className="surface space-y-5 p-5 sm:p-7">
      <div className="space-y-2">
        <p id="dn-type" className="text-sm font-semibold text-navy">
          {t("Donation type")}
        </p>
        <Controller
          control={control}
          name="donation_type"
          render={({ field }) => (
            <ChipChoice<DonationType>
              name="donation_type"
              labelledBy="dn-type"
              value={field.value}
              onChange={(v) => {
                field.onChange(v);
                setDuplicates(null);
                setValue("confirm_duplicate", false);
              }}
              options={DONATION_TYPES.map((type) => ({ value: type, label: t(DONATION_TYPE_LABELS[type]) }))}
            />
          )}
        />
      </div>
      <Field id="donation_date" label="Date of donation" required error={errors.donation_date?.message}>
        <Input
          {...fieldAria("donation_date", errors.donation_date?.message)}
          type="date"
          max={todayInIndia()}
          {...register("donation_date", {
            onChange: () => {
              setDuplicates(null);
              setValue("confirm_duplicate", false);
            },
          })}
        />
      </Field>
      <Field id="centre_name" label="Hospital, blood bank or donation centre" required error={errors.centre_name?.message}>
        <Input {...fieldAria("centre_name", errors.centre_name?.message)} {...register("centre_name")} />
      </Field>
      {/* No state is stored for a donation: the district search covers all of India. */}
      <LocationPickers
        labels={{ city: "City / town" }}
        values={{ district: district ?? "", city: city ?? "" }}
        onChange={(field, value) => setValue(field as "district" | "city", value, { shouldDirty: true })}
        errors={{ district: errors.district?.message, city: errors.city?.message }}
      />
      <Field id="event_name" label="Camp or event name (optional)" error={errors.event_name?.message}>
        <Input {...fieldAria("event_name", errors.event_name?.message)} {...register("event_name")} />
      </Field>

      {duplicates ? (
        <div className="space-y-2 rounded-2xl border border-warning/30 bg-warning-soft p-4 text-sm" role="alert">
          <p className="flex items-center gap-2 font-semibold text-warning">
            <AlertTriangle className="size-4" aria-hidden="true" /> {t("This might be a duplicate")}
          </p>
          <p>{t("You already have a record of the same type close to this date:")}</p>
          <ul className="list-disc pl-5">
            {duplicates.map((d) => (
              <li key={`${d.donation_date}-${d.centre_name}`}>
                {formatDate(d.donation_date)} · {d.centre_name}
              </li>
            ))}
          </ul>
          <p>{t("If this is a separate donation, submit again to confirm.")}</p>
        </div>
      ) : null}

      {serverError ? (
        <p className="rounded-xl border border-destructive/25 bg-destructive/5 px-3.5 py-3 text-sm text-destructive" role="alert">
          {t(serverError)}
        </p>
      ) : null}

      {!record ? (
        <p className="text-xs text-muted-foreground">
          {selfReportedBefore}
          <strong>{t("self-reported")}</strong>
          {selfReportedAfter}
        </p>
      ) : record.isOwner && record.status !== "pending" ? (
        <p className="rounded-xl border border-warning/30 bg-warning-soft px-3.5 py-3 text-sm" role="note">
          {t("This record has already been checked. If you save changes, it goes back to self-reported until a Rakt Mitra checks it again.")}
        </p>
      ) : !record.isOwner ? (
        <p className="text-xs text-muted-foreground">{t("Your correction keeps the record's verification status. Every change is logged.")}</p>
      ) : null}
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
        {editing ? (pending ? t("Saving…") : t("Save changes")) : duplicates ? t("Yes, save it as a separate donation") : pending ? t("Saving…") : t("Save donation")}
      </Button>
    </form>
  );
}
