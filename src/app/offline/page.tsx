import type { Metadata } from "next";
import { WifiOff } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";

export const metadata: Metadata = { title: "You're offline", robots: { index: false } };

export default function OfflinePage() {
  return (
    <main id="main" className="mx-auto flex min-h-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <LogoMark size="lg" />
      <WifiOff className="size-8 text-primary" aria-hidden="true" />
      <h1 className="text-2xl font-extrabold">You&apos;re offline</h1>
      <p className="text-muted-foreground">
        Rakt Response needs a connection to show requests and your profile. If someone needs blood urgently, contact the treating
        hospital or the nearest licensed blood bank by phone.
      </p>
    </main>
  );
}
