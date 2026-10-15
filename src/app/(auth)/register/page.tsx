import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import Link from "next/link";
import { redirect } from "next/navigation";
import { NotConfiguredNotice } from "@/components/auth/auth-card";
import { RegisterWizard } from "@/components/registration/register-wizard";
import { BLOOD_GROUPS, type BloodGroup } from "@/lib/constants";
import { getViewer } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return pageMetadata(t("Become a donor"), t("Register as a voluntary blood donor with Rakt Response in a few short steps."));
}

export default async function RegisterPage({ searchParams }: PageProps<"/register">) {
  // The homepage pledge ("I'm O+ and I'll answer") can pre-select the blood group.
  const { group } = await searchParams;
  const initialBloodGroup = typeof group === "string" && (BLOOD_GROUPS as readonly string[]).includes(group) ? (group as BloodGroup) : undefined;
  if (await getViewer()) redirect("/dashboard");
  const t = await getT();
  return (
    <div className="space-y-4">
      {!isSupabaseConfigured() ? <NotConfiguredNotice /> : null}
      <RegisterWizard initialBloodGroup={initialBloodGroup} />
      <p className="text-center text-sm text-muted-foreground">
        {t("Already registered?")}{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          {t("Sign in")}
        </Link>
      </p>
    </div>
  );
}
