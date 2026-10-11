import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { ForgotPasswordForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = { title: "Reset your password" };

export default async function ForgotPasswordPage({ searchParams }: PageProps<"/forgot-password">) {
  const { error } = await searchParams;
  return (
    <AuthCard
      title="Forgot your password?"
      description="Enter the email you registered with and we'll send you a reset link."
      footer={
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Back to sign in
        </Link>
      }
    >
      {error === "device" ? (
        <p className="mb-4 rounded-xl bg-secondary px-3.5 py-3 text-sm text-secondary-foreground" role="status">
          Reset links must be opened on the same phone or browser where you requested them. Request a new link below and open it
          on this device.
        </p>
      ) : null}
      <ForgotPasswordForm />
    </AuthCard>
  );
}
