"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, FormMessage, SubmitButton, fieldAria } from "@/components/common/form-parts";
import { initialActionState } from "@/lib/action-result";
import { requestPasswordReset, resendVerification, signIn, updatePassword } from "@/actions/auth";

export function PasswordInput({
  id,
  name,
  autoComplete,
  error,
  hint,
  ...rest
}: { id: string; name: string; autoComplete: string; error?: string | string[]; hint?: boolean } & Omit<
  React.ComponentProps<typeof Input>,
  "type" | "id" | "name"
>) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input
        {...fieldAria(id, error, hint)}
        {...rest}
        name={name}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        className="pr-12"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute top-0 right-0 text-muted-foreground"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
      >
        {visible ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
      </Button>
    </div>
  );
}

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState(signIn, initialActionState);
  const errors = state.ok ? undefined : state.fieldErrors;
  return (
    <form action={action} className="space-y-4" noValidate>
      <input type="hidden" name="next" value={next ?? ""} />
      <Field id="email" label="Email" error={errors?.email}>
        <Input {...fieldAria("email", errors?.email)} name="email" type="email" autoComplete="email" inputMode="email" required />
      </Field>
      <Field id="password" label="Password" error={errors?.password}>
        <PasswordInput id="password" name="password" autoComplete="current-password" error={errors?.password} required />
      </Field>
      <div className="flex justify-end">
        <Link href="/forgot-password" className="text-sm font-semibold text-primary hover:underline">
          Forgot password?
        </Link>
      </div>
      <FormMessage state={state} />
      <SubmitButton className="w-full" size="lg" pendingText="Signing in…">
        Sign in
      </SubmitButton>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action] = useActionState(requestPasswordReset, initialActionState);
  const errors = state.ok ? undefined : state.fieldErrors;
  return (
    <form action={action} className="space-y-4" noValidate>
      <Field id="email" label="Email" error={errors?.email} hint="We'll email you a secure link to choose a new password.">
        <Input {...fieldAria("email", errors?.email, true)} name="email" type="email" autoComplete="email" inputMode="email" required />
      </Field>
      <FormMessage state={state} />
      <SubmitButton className="w-full" size="lg" pendingText="Sending…">
        Send reset link
      </SubmitButton>
    </form>
  );
}

export function ResendVerificationForm() {
  const [state, action] = useActionState(resendVerification, initialActionState);
  const errors = state.ok ? undefined : state.fieldErrors;
  return (
    <form action={action} className="space-y-3" noValidate>
      <Field id="email" label="Didn't get the email? Enter your address to resend it" error={errors?.email}>
        <Input {...fieldAria("email", errors?.email)} name="email" type="email" autoComplete="email" inputMode="email" required />
      </Field>
      <FormMessage state={state} />
      <SubmitButton variant="outline" className="w-full" pendingText="Sending…">
        Resend verification email
      </SubmitButton>
    </form>
  );
}

export function ResetPasswordForm() {
  const [state, action] = useActionState(updatePassword, initialActionState);
  const errors = state.ok ? undefined : state.fieldErrors;
  return (
    <form action={action} className="space-y-4" noValidate>
      <Field id="password" label="New password" error={errors?.password} hint="At least 8 characters, with a letter and a number.">
        <PasswordInput id="password" name="password" autoComplete="new-password" error={errors?.password} hint required />
      </Field>
      <Field id="confirm_password" label="Confirm new password" error={errors?.confirm_password}>
        <PasswordInput id="confirm_password" name="confirm_password" autoComplete="new-password" error={errors?.confirm_password} required />
      </Field>
      <FormMessage state={state} />
      <SubmitButton className="w-full" size="lg" pendingText="Updating…">
        Update password
      </SubmitButton>
    </form>
  );
}
