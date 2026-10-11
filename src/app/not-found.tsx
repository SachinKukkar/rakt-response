import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/brand/logo";

export default function NotFound() {
  return (
    <main id="main" className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <LogoMark size="lg" />
      <p className="text-sm font-bold tracking-wider text-primary uppercase">Page not found</p>
      <h1 className="text-2xl font-extrabold">We couldn&apos;t find that page</h1>
      <p className="text-muted-foreground">It may have moved, or the link may be incomplete.</p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button asChild>
          <Link href="/">Go home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/blood-requests">Find blood</Link>
        </Button>
      </div>
    </main>
  );
}
