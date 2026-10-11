import type { Metadata } from "next";
import { PageHero } from "@/components/learn/learn-parts";
import Link from "next/link";
import { Eye, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/common/page-parts";
import { StoryForm } from "@/components/stories/story-form";
import { getViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: t("Share your story"),
    description: t(
      "Share your experience as a donor, family member, volunteer or camp organiser. Nothing is published without review and your consent.",
    ),
  };
}

export default async function ShareYourStoryPage() {
  const t = await getT();
  const viewer = await getViewer();
  let camps: Array<{ id: string; name: string; camp_date: string }> = [];
  if (viewer) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("camp_records")
      .select("id, name, camp_date")
      .eq("is_public", true)
      .order("camp_date", { ascending: false })
      .limit(30);
    camps = (data ?? []) as typeof camps;
  }

  return (
    <>
      <PageHero
        eyebrow={t("Share your story")}
        title={t("Your story could be")}
        highlight={t("someone's first push.")}
        subtitle={t("Donated? Needed blood? Volunteered? Tell it your way — you choose what's shown.")}
      />
    <div className="page-container max-w-2xl py-8">
      <ul className="mb-5 grid gap-2 sm:grid-cols-3">
        <li className="surface-tint flex items-start gap-2 p-3 text-sm">
          <Lock className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" /> {t("Private until an administrator approves it")}
        </li>
        <li className="surface-tint flex items-start gap-2 p-3 text-sm">
          <Eye className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" /> {t("You choose your name, photo and details")}
        </li>
        <li className="surface-tint flex items-start gap-2 p-3 text-sm">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" /> {t("Withdraw or correct it any time")}
        </li>
      </ul>
      {viewer ? (
        <>
          <StoryForm
            defaultName={viewer.profile?.full_name ?? ""}
            defaultEmail={viewer.email ?? ""}
            isStaff={viewer.isStaff}
            camps={camps}
          />
          <p className="mt-4 text-center text-sm">
            <Link href="/share-your-story/submissions" className="font-semibold text-primary hover:underline">
              {t("View stories you've shared")}
            </Link>
          </p>
        </>
      ) : (
        <div className="surface space-y-3 p-5">
          <p className="font-semibold text-navy">{t("Sign in to share your story")}</p>
          <p className="text-sm text-muted-foreground">
            {t(
              "An account lets you see the review status, change what is shown, request corrections and withdraw your story whenever you like. You don't need to be a donor — family members and volunteers are welcome.",
            )}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild>
              <Link href="/login?next=/share-your-story">{t("Sign in")}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/register">{t("Create a free account")}</Link>
            </Button>
          </div>
        </div>
      )}
      <Notice className="mt-6">
        {t(
          "Please don't include a patient's full name, diagnosis, phone number, address or hospital documents. Stories are personal experiences and are never presented as medical advice.",
        )}
      </Notice>
    </div>
    </>
  );
}
