import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { ResetPasswordForm } from "@/components/auth/auth-forms";
import { getViewer } from "@/lib/auth";

export const metadata: Metadata = { title: "Choose a new password" };

export default async function ResetPasswordPage() {
  const viewer = await getViewer();
  if (!viewer) {
    return (
      <AuthCard title="Link expired" description="Password reset links can only be used once and expire after a short time.">
        <Link href="/forgot-password" className="font-semibold text-primary hover:underline">
          Request a new reset link
        </Link>
      </AuthCard>
    );
  }
  return (
    <AuthCard title="Choose a new password" description="You're signed in from your reset link. Pick a new password below.">
      <ResetPasswordForm />
    </AuthCard>
  );
}
