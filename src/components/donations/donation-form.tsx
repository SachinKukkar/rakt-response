"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, fieldAria } from "@/components/common/form-parts";
import { ChipChoice } from "@/components/forms/pickers";
import { addDonation } from "@/actions/donations";
import { DONATION_TYPE_LABELS, DONATION_TYPES, type DonationType } from "@/lib/constants";
import { formatDate, todayInIndia } from "@/lib/format";
import { donationRecordSchema, type DonationRecordInput } from "@/lib/validation/forms";

export function DonationForm() {
  const router = useRouter();
  const form = useForm<DonationRecordInput>({
    resolver: zodResolver(donationRecordSchema),
    defaultValues: { donation_type: "whole_blood", donation_date: "", centre_name: "", city: "", district: "", event_name: "", confirm_duplicate: false },
    mode: "onTouched",
  });
  const { register, control, handleSubmit, setError, setValue, formState } = form;
  const errors = formState.errors;
  const [pending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [duplicates, setDuplicates] = useState<Array<{ donation_date: string; centre_name: string }> | null>(null);

  const onSubmit = handleSubmit((values) => {
    setServerError(null);
    startTransition(async () => {
      const result = await addDonation(values);
      if (result.ok && result.data?.needsDuplicateConfirmation) {
        setDuplicates(result.data.duplicates ?? []);
        setValue("confirm_duplicate", true);
        return;
      }
      if (result.ok) {
        router.push("/donations");
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
          Donation type
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
              options={DONATION_TYPES.map((t) => ({ value: t, label: DONATION_TYPE_LABELS[t] }))}
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
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="city" label="City" error={errors.city?.message}>
          <Input {...fieldAria("city", errors.city?.message)} {...register("city")} />
        </Field>
        <Field id="district" label="District" error={errors.district?.message}>
          <Input {...fieldAria("district", errors.district?.message)} {...register("district")} />
        </Field>
      </div>
      <Field id="event_name" label="Camp or event name (optional)" error={errors.event_name?.message}>
        <Input {...fieldAria("event_name", errors.event_name?.message)} {...register("event_name")} />
      </Field>

      {duplicates ? (
        <div className="space-y-2 rounded-2xl border border-warning/30 bg-warning-soft p-4 text-sm" role="alert">
          <p className="flex items-center gap-2 font-semibold text-warning">
            <AlertTriangle className="size-4" aria-hidden="true" /> This might be a duplicate
          </p>
          <p>You already have a record of the same type close to this date:</p>
          <ul className="list-disc pl-5">
            {duplicates.map((d) => (
              <li key={`${d.donation_date}-${d.centre_name}`}>
                {formatDate(d.donation_date)} · {d.centre_name}
              </li>
            ))}
          </ul>
          <p>If this is a separate donation, submit again to confirm.</p>
        </div>
      ) : null}

      {serverError ? (
        <p className="rounded-xl border border-destructive/25 bg-destructive/5 px-3.5 py-3 text-sm text-destructive" role="alert">
          {serverError}
        </p>
      ) : null}

      <p className="text-xs text-muted-foreground">
        This record will be marked <strong>self-reported</strong> until an authorised volunteer verifies it. Recording a donation does not
        determine when you can donate again.
      </p>
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
        {duplicates ? "Yes, save it as a separate donation" : pending ? "Saving…" : "Save donation"}
      </Button>
    </form>
  );
}
