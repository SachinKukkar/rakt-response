"use client";

import { useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ActionResult } from "@/lib/action-result";
import { tx } from "@/i18n/tx";

/** Label + control + help text + error, wired up for screen readers. */
export function Field({
  id,
  label,
  hint,
  error,
  required,
  children,
  className,
}: {
  id: string;
  label: React.ReactNode;
  hint?: React.ReactNode;
  error?: string | string[];
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const message = Array.isArray(error) ? error[0] : error;
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="block text-sm font-semibold text-navy">
        {tx(label)}
        {required ? (
          <span className="text-primary" aria-hidden="true">
            {" "}
            *
          </span>
        ) : null}
      </label>
      {children}
      {hint && !message ? (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {tx(hint)}
        </p>
      ) : null}
      {message ? (
        <p id={`${id}-error`} className="flex items-start gap-1 text-xs font-medium text-destructive" role="alert">
          <AlertCircle className="mt-px size-3.5 shrink-0" aria-hidden="true" />
          {tx(message)}
        </p>
      ) : null}
    </div>
  );
}

/** aria props for a control rendered inside <Field>. */
export function fieldAria(id: string, error?: string | string[], hint?: boolean) {
  const hasError = Boolean(Array.isArray(error) ? error.length : error);
  return {
    id,
    "aria-invalid": hasError || undefined,
    "aria-describedby": hasError ? `${id}-error` : hint ? `${id}-hint` : undefined,
  } as const;
}

export function SubmitButton({
  children,
  pendingText = "Saving…",
  className,
  variant,
  size,
  disabled,
}: {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || disabled} className={className} variant={variant} size={size} aria-busy={pending}>
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          {tx(pendingText)}
        </>
      ) : (
        tx(children)
      )}
    </Button>
  );
}

export function FormMessage({ state, className }: { state: ActionResult<unknown> | null | undefined; className?: string }) {
  if (!state || !state.message) return null;
  return (
    <div
      role={state.ok ? "status" : "alert"}
      className={cn(
        "flex items-start gap-2 rounded-xl border px-3.5 py-3 text-sm",
        state.ok ? "border-success/25 bg-success-soft text-success" : "border-destructive/25 bg-destructive/5 text-destructive",
        className,
      )}
    >
      {state.ok ? <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" /> : <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />}
      <span>{tx(state.message)}</span>
    </div>
  );
}

/** A large, tappable checkbox row with title and explanation. */
export function ChoiceRow({
  id,
  title,
  description,
  checked,
  onCheckedChange,
  name,
  defaultChecked,
  error,
}: {
  id: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  name?: string;
  defaultChecked?: boolean;
  error?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className={cn(
          "flex cursor-pointer items-start gap-3 rounded-2xl border bg-white p-3.5 transition-colors hover:border-primary/40 has-checked:border-primary/50 has-checked:bg-accent/40",
          error && "border-destructive/50",
        )}
      >
        <input
          id={id}
          name={name}
          type="checkbox"
          className="mt-0.5 size-5 shrink-0 accent-primary"
          checked={checked}
          defaultChecked={defaultChecked}
          onChange={onCheckedChange ? (e) => onCheckedChange(e.target.checked) : undefined}
          aria-describedby={description ? `${id}-desc` : undefined}
          aria-invalid={error ? true : undefined}
        />
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-navy">{tx(title)}</span>
          {description ? (
            <span id={`${id}-desc`} className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
              {tx(description)}
            </span>
          ) : null}
        </span>
      </label>
      {error ? (
        <p className="mt-1 text-xs font-medium text-destructive" role="alert">
          {tx(error)}
        </p>
      ) : null}
    </div>
  );
}

export const selectClass =
  "h-11 w-full rounded-xl border border-input bg-white px-3 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 aria-invalid:border-destructive disabled:opacity-60";
