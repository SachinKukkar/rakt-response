import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard, NotConfiguredNotice } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/auth-forms";
import { getViewer } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { safeNextPath } from "@/lib/redirects";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("Sign in") };
}

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const next = safeNextPath(typeof params.next === "string" ? params.next : undefined, "/dashboard");
  const viewer = await getViewer();
  if (viewer) redirect(viewer.isAdmin && next === "/dashboard" ? "/admin" : next);
  const t = await getT();
  const notice =
    params.error === "link"
      ? t("That link has expired or was already used. Please sign in or request a new link.")
      : params.notice === "confirmed"
        ? t("Your email is confirmed. Please sign in to continue.")
        : params.signed_out
          ? t("You have signed out.")
          : null;
  return (
    <AuthCard
      title={t("Welcome back")}
      description={t("Sign in to manage your donor profile, donation history and requests.")}
      footer={
        <>
          {t("New to Rakt Response?")}{" "}
          <Link href="/register" className="font-semibold text-primary hover:underline">
            {t("Become a donor")}
          </Link>
        </>
      }
    >
      {!isSupabaseConfigured() ? <NotConfiguredNotice /> : null}
      {notice ? (
        <p className="mb-4 rounded-xl bg-secondary px-3.5 py-3 text-sm text-secondary-foreground" role="status">
          {notice}
        </p>
      ) : null}
      <LoginForm next={next} />
    </AuthCard>
  );
}
