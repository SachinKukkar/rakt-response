"use client";

import { cn } from "@/lib/utils";
import { BLOOD_GROUPS, type BloodGroup } from "@/lib/constants";

/** Accessible radio group of blood-group drops (tap-friendly grid). */
export function BloodGroupPicker({
  name,
  value,
  onChange,
  error,
  labelledBy,
  allowAny,
}: {
  name: string;
  value: string;
  onChange: (value: BloodGroup | "") => void;
  error?: string;
  labelledBy?: string;
  allowAny?: boolean;
}) {
  return (
    <div>
      <div role="radiogroup" aria-labelledby={labelledBy} aria-invalid={error ? true : undefined} className="grid grid-cols-4 gap-2">
        {allowAny ? (
          <label className="col-span-4 flex min-h-11 cursor-pointer items-center justify-center rounded-xl border bg-white text-sm font-semibold has-checked:border-primary has-checked:bg-accent has-checked:text-primary">
            <input type="radio" name={name} value="" checked={value === ""} onChange={() => onChange("")} className="sr-only" />
            Any blood group
          </label>
        ) : null}
        {BLOOD_GROUPS.map((group) => (
          <label
            key={group}
            className={cn(
              "relative flex h-14 cursor-pointer items-center justify-center rounded-2xl border-2 bg-white text-lg font-extrabold text-primary transition-all",
              "hover:border-primary/40 has-checked:border-primary has-checked:bg-primary has-checked:text-white has-checked:shadow-md has-checked:shadow-primary/25",
              "has-focus-visible:ring-3 has-focus-visible:ring-ring/40",
            )}
          >
            <input
              type="radio"
              name={name}
              value={group}
              checked={value === group}
              onChange={() => onChange(group)}
              className="sr-only"
            />
            {group}
          </label>
        ))}
      </div>
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Generic segmented single-choice control rendered as large chips. */
export function ChipChoice<T extends string>({
  name,
  options,
  value,
  onChange,
  labelledBy,
  columns = 2,
}: {
  name: string;
  options: Array<{ value: T; label: string; description?: string }>;
  value: T | "";
  onChange: (value: T) => void;
  labelledBy?: string;
  columns?: 1 | 2 | 3;
}) {
  return (
    <div
      role="radiogroup"
      aria-labelledby={labelledBy}
      className={cn("grid gap-2", columns === 1 && "grid-cols-1", columns === 2 && "grid-cols-1 min-[380px]:grid-cols-2", columns === 3 && "grid-cols-3")}
    >
      {options.map((option) => (
        <label
          key={option.value}
          className="flex min-h-12 cursor-pointer flex-col justify-center rounded-xl border bg-white px-3.5 py-2.5 text-sm transition-colors hover:border-primary/40 has-checked:border-primary has-checked:bg-accent/60 has-focus-visible:ring-3 has-focus-visible:ring-ring/40"
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="sr-only"
          />
          <span className="font-semibold text-navy">{option.label}</span>
          {option.description ? <span className="mt-0.5 text-xs text-muted-foreground">{option.description}</span> : null}
        </label>
      ))}
    </div>
  );
}
