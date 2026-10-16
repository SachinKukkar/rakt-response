import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      {/* The header floats over the page; dark first sections slide under it (.under-header). */}
      <main id="main" className="flex-1 pt-[var(--header-h)]">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
