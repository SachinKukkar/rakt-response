import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { ResetPasswordForm } from "@/components/auth/auth-forms";
import { getViewer } from "@/lib/auth";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("Choose a new password") };
}

export default async function ResetPasswordPage() {
  const viewer = await getViewer();
  const t = await getT();
  if (!viewer) {
    return (
      <AuthCard title={t("Link expired")} description={t("Password reset links can only be used once and expire after a short time.")}>
        <Link href="/forgot-password" className="font-semibold text-primary hover:underline">
          {t("Request a new reset link")}
        </Link>
      </AuthCard>
    );
  }
  return (
    <AuthCard title={t("Choose a new password")} description={t("You're signed in from your reset link. Pick a new password below.")}>
      <ResetPasswordForm />
    </AuthCard>
  );
}
