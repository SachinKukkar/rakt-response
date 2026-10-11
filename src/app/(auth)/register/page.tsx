import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { NotConfiguredNotice } from "@/components/auth/auth-card";
import { RegisterWizard } from "@/components/registration/register-wizard";
import { getViewer } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata: Metadata = {
  title: "Become a donor",
  description: "Register as a voluntary blood donor with Rakt Response in a few short steps.",
};

export default async function RegisterPage() {
  if (await getViewer()) redirect("/dashboard");
  return (
    <div className="space-y-4">
      {!isSupabaseConfigured() ? <NotConfiguredNotice /> : null}
      <RegisterWizard />
      <p className="text-center text-sm text-muted-foreground">
        Already registered?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
