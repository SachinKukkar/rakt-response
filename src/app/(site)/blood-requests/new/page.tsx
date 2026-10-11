import type { Metadata } from "next";
import { PageHero } from "@/components/learn/learn-parts";
import Link from "next/link";
import { Hospital, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/common/page-parts";
import { BloodRequestForm } from "@/components/requests/request-form";
import { getViewer } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { getLocale, getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: t("Submit a blood request"),
    description: t("Ask Rakt Response volunteers to help find voluntary donors for a hospital requirement."),
  };
}

export default async function NewBloodRequestPage() {
  const t = await getT();
  // Hindi puts the highlighted word first: "डोनर के लिए रिक्वेस्ट करें।"
  const hindi = (await getLocale()) === "hi";
  const viewer = await getViewer();
  // Anonymous submissions need the server-side key for rate-limited RPC access.
  const anonymousAllowed = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const canSubmit = isSupabaseConfigured() && (Boolean(viewer) || anonymousAllowed);

  return (
    <>
      <PageHero
        eyebrow={t("Find blood")}
        title={hindi ? "डोनर के लिए" : "Request"}
        highlight={hindi ? "रिक्वेस्ट करें।" : "donors."}
        subtitle={t("About two minutes. A volunteer verifies every request before any donor is contacted.")}
      />
    <div className="page-container max-w-2xl py-8">
      <Notice tone="warning" icon={Hospital} className="mb-5" title={t("First, contact the hospital blood bank")}>
        {t("They know exactly what is needed and may already have units. Use this form for help finding voluntary donors.")}
      </Notice>
      {canSubmit ? (
        <BloodRequestForm signedIn={Boolean(viewer)} defaultName={viewer?.profile?.full_name} />
      ) : (
        <div className="surface space-y-3 p-5">
          <p className="font-semibold text-navy">{t("Please sign in to submit a request")}</p>
          <p className="text-sm text-muted-foreground">
            {isSupabaseConfigured()
              ? t("Requests from signed-in members help us prevent spam and keep you updated.")
              : t("Requests are not available in this environment because the database is not configured.")}
          </p>
          {isSupabaseConfigured() ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button asChild>
                <Link href="/login?next=/blood-requests/new">
                  <LogIn className="size-4" aria-hidden="true" /> {t("Sign in")}
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/register">{t("Create a free account")}</Link>
              </Button>
            </div>
          ) : null}
        </div>
      )}
    </div>
    </>
  );
}
