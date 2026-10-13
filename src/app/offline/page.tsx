import type { Metadata } from "next";
import Link from "next/link";
import { WifiOff } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("You're offline"), robots: { index: false } };
}

export default async function OfflinePage() {
  const t = await getT();
  return (
    <main id="main" className="mx-auto flex min-h-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <Link href="/" className="rounded-full" aria-label={t("Rakt Response home")}>
        <LogoMark size="lg" />
      </Link>
      <WifiOff className="size-8 text-primary" aria-hidden="true" />
      <h1 className="text-2xl font-extrabold">{t("You're offline")}</h1>
      <p className="text-muted-foreground">
        {t(
          "Rakt Response needs a connection to show requests and your profile. If someone needs blood urgently, contact the treating hospital or the nearest licensed blood bank by phone.",
        )}
      </p>
    </main>
  );
}
