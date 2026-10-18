import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { AuthCard } from "@/components/auth/auth-card";
import { ResendVerificationForm } from "@/components/auth/auth-forms";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return pageMetadata(t("Confirm your email"), t("Confirm your email address to finish registering as a Rakt Response donor."));
}

export default async function VerifyEmailPage() {
  const t = await getT();
  return (
    <AuthCard
      title={t("Check your inbox")}
      footer={
        <Link href="/login" className="font-semibold text-primary hover:underline">
          {t("Go to sign in")}
        </Link>
      }
    >
      <div className="mb-5 flex items-start gap-3">
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-accent text-primary">
          <MailCheck className="size-6" aria-hidden="true" />
        </span>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            {t(
              "We sent a confirmation link to the email address you registered with. Open it on this phone or any device to activate your account.",
            )}
          </p>
          <p>
            {t(
              "Patients and Rakt Mitras can't see you until you confirm your email. Emails can take a few minutes — please also check spam or promotions folders.",
            )}
          </p>
        </div>
      </div>
      <ResendVerificationForm />
    </AuthCard>
  );
}
