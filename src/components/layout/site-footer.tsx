import Link from "next/link";
import { LogoMark } from "@/components/brand/logo";
import { SITE } from "@/lib/constants";
import { MORE_LINKS, PUBLIC_NAV } from "./nav-config";

export function SiteFooter() {
  return (
    <footer className="mt-16 bg-navy text-white">
      <div className="page-container grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3 sm:col-span-2">
          <div className="flex items-center gap-3">
            <LogoMark size="md" />
            <div>
              <p className="text-lg font-extrabold">Rakt Response</p>
              <p className="text-sm text-white/75">{SITE.tagline}</p>
            </div>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-white/75">{SITE.description}</p>
          <p className="max-w-md text-xs leading-relaxed text-white/60">
            Rakt Response is a volunteer coordination platform. It does not store blood, certify compatibility or replace a
            hospital or licensed blood bank. In an emergency, contact the treating hospital or the nearest licensed blood bank
            immediately.
          </p>
        </div>
        <nav aria-label="Learn">
          <p className="mb-3 text-sm font-bold">Learn</p>
          <ul className="space-y-1 text-sm text-white/80">
            {PUBLIC_NAV.map((item) => (
              <li key={item.href}>
                <Link className="inline-flex min-h-9 items-center hover:text-white" href={item.href}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="More">
          <p className="mb-3 text-sm font-bold">More</p>
          <ul className="space-y-1 text-sm text-white/80">
            {MORE_LINKS.map((item) => (
              <li key={item.href}>
                <Link className="inline-flex min-h-9 items-center hover:text-white" href={item.href}>
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link className="inline-flex min-h-9 items-center hover:text-white" href="/share-your-story">
                Share your story
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-white/10">
        <div className="page-container flex flex-col gap-1 py-4 text-xs text-white/60 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Rakt Response Team. {SITE.supporting}</p>
          <p>Built by volunteers, for voluntary donors.</p>
        </div>
      </div>
    </footer>
  );
}
