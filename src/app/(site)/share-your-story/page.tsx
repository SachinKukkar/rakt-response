import type { Metadata } from "next";
import Link from "next/link";
import { Eye, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Notice, PageHeader } from "@/components/common/page-parts";
import { StoryForm } from "@/components/stories/story-form";
import { getViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Share your story",
  description: "Share your experience as a donor, family member, volunteer or camp organiser. Nothing is published without review and your consent.",
};

export default async function ShareYourStoryPage() {
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
    <div className="page-container max-w-2xl py-8 sm:py-12">
      <PageHeader
        eyebrow="Our Impact"
        title="Share your story"
        description="Your experience can encourage someone to donate for the first time. Share it in your own words — you stay in control."
      />
      <ul className="mb-5 grid gap-2 sm:grid-cols-3">
        <li className="surface-tint flex items-start gap-2 p-3 text-sm">
          <Lock className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" /> Private until an administrator approves it
        </li>
        <li className="surface-tint flex items-start gap-2 p-3 text-sm">
          <Eye className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" /> You choose your name, photo and details
        </li>
        <li className="surface-tint flex items-start gap-2 p-3 text-sm">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" /> Withdraw or correct it any time
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
              View stories you&apos;ve shared
            </Link>
          </p>
        </>
      ) : (
        <div className="surface space-y-3 p-5">
          <p className="font-semibold text-navy">Sign in to share your story</p>
          <p className="text-sm text-muted-foreground">
            An account lets you see the review status, change what is shown, request corrections and withdraw your story whenever you
            like. You don&apos;t need to be a donor — family members and volunteers are welcome.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild>
              <Link href="/login?next=/share-your-story">Sign in</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/register">Create a free account</Link>
            </Button>
          </div>
        </div>
      )}
      <Notice className="mt-6">
        Please don&apos;t include a patient&apos;s full name, diagnosis, phone number, address or hospital documents. Stories are
        personal experiences and are never presented as medical advice.
      </Notice>
    </div>
  );
}
