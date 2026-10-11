"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

/** Generic error boundary — never shows internal error details to users. */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="main" className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <p className="text-sm font-bold tracking-wider text-primary uppercase">Something went wrong</p>
      <h1 className="text-2xl font-extrabold">We couldn&apos;t load this page</h1>
      <p className="text-muted-foreground">
        Please try again. If someone needs blood urgently, contact the treating hospital or the nearest licensed blood bank directly.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button onClick={() => reset()}>Try again</Button>
        <Button asChild variant="outline">
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </main>
  );
}
