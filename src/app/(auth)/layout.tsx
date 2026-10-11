import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { SITE } from "@/lib/constants";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-warm">
      <div className="brand-band relative overflow-hidden pb-24 text-white">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 pt-4">
          <Link
            href="/"
            className="-ml-2 inline-flex min-h-11 items-center gap-1 rounded-full px-2 text-sm font-medium text-white/90 hover:text-white"
          >
            <ChevronLeft className="size-4" aria-hidden="true" /> Home
          </Link>
        </div>
        <div className="mx-auto flex max-w-lg flex-col items-center px-4 pt-2 text-center">
          <LogoMark size="lg" priority className="shadow-lg shadow-black/20 ring-4 ring-white/30" />
          <p className="mt-3 text-xl font-extrabold tracking-tight">Rakt Response</p>
          <p className="text-sm text-white/85">{SITE.tagline}</p>
        </div>
        <svg aria-hidden="true" viewBox="0 0 400 40" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-10 w-full fill-warm">
          <path d="M0 40 C 120 0, 280 0, 400 40 Z" />
        </svg>
      </div>
      <main id="main" className="relative z-10 mx-auto -mt-20 w-full max-w-lg flex-1 px-4 pb-12">
        {children}
      </main>
    </div>
  );
}
