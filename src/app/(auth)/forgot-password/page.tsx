import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { ForgotPasswordForm } from "@/components/auth/auth-forms";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("Reset your password") };
}

export default async function ForgotPasswordPage({ searchParams }: PageProps<"/forgot-password">) {
  const { error } = await searchParams;
  const t = await getT();
  return (
    <AuthCard
      title={t("Forgot your password?")}
      description={t("Enter the email you registered with and we'll send you a reset link.")}
      footer={
        <Link href="/login" className="font-semibold text-primary hover:underline">
          {t("Back to sign in")}
        </Link>
      }
    >
      {error === "device" ? (
        <p className="mb-4 rounded-xl bg-secondary px-3.5 py-3 text-sm text-secondary-foreground" role="status">
          {t(
            "Reset links must be opened on the same phone or browser where you requested them. Request a new link below and open it on this device.",
          )}
        </p>
      ) : null}
      <ForgotPasswordForm />
    </AuthCard>
  );
}
