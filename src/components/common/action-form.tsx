"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormMessage, SubmitButton } from "@/components/common/form-parts";
import { initialActionState, type ActionResult } from "@/lib/action-result";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n/client";

type ServerAction = (prev: ActionResult, formData: FormData) => Promise<ActionResult>;

/**
 * A small form that posts hidden fields to a server action and shows the
 * result inline. Works without JavaScript for the submission itself.
 */
export function ActionForm({
  action,
  fields = {},
  label,
  pendingText,
  variant = "default",
  size = "default",
  confirmText,
  className,
  buttonClassName,
  children,
  hideAfterSuccess,
}: {
  action: ServerAction;
  fields?: Record<string, string>;
  label: React.ReactNode;
  pendingText?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
  confirmText?: string;
  className?: string;
  buttonClassName?: string;
  children?: React.ReactNode;
  hideAfterSuccess?: boolean;
}) {
  const [state, formAction] = useActionState(action, initialActionState);
  const t = useT();
  if (hideAfterSuccess && state.ok) return <FormMessage state={state} className={className} />;
  return (
    <form
      action={formAction}
      className={cn("space-y-2", className)}
      onSubmit={(event) => {
        if (confirmText && !window.confirm(t(confirmText))) event.preventDefault();
      }}
    >
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      {children}
      <SubmitButton variant={variant} size={size} pendingText={pendingText ?? "Working…"} className={buttonClassName}>
        {label}
      </SubmitButton>
      <FormMessage state={state} />
    </form>
  );
}
