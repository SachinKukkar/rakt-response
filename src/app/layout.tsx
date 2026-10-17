import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/constants";
import { siteUrl } from "@/lib/env";
import { ServiceWorkerRegister } from "@/components/layout/service-worker-register";
import { LocaleProvider } from "@/i18n/client";
import { HTML_LANG } from "@/i18n/config";
import { getLocale, getT } from "@/i18n/server";
import { SHARE_IMAGE } from "@/lib/metadata";

const sans = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

// Small uppercase labels, times and figures.
const mono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

// Hindi text. Latin glyphs still come from Geist.
const devanagari = Noto_Sans_Devanagari({
  variable: "--font-devanagari",
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const [t, locale] = await Promise.all([getT(), getLocale()]);
  const home = `${SITE.name} — ${t(SITE.tagline)}`;
  const description = t(SITE.description);
  return {
    metadataBase: new URL(siteUrl),
    title: { default: home, template: `%s · ${SITE.name}` },
    description,
    applicationName: SITE.name,
    appleWebApp: { capable: true, title: SITE.name, statusBarStyle: "default" },
    openGraph: { type: "website", siteName: SITE.name, locale: locale === "hi" ? "hi_IN" : "en_IN", title: home, description, images: [SHARE_IMAGE] },
    twitter: { card: "summary_large_image", title: home, description, images: [SHARE_IMAGE.url] },
    // Phone numbers are linked explicitly; don't auto-link reference codes.
    formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = {
  themeColor: "#990000",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  const t = await getT();
  return (
    <html lang={HTML_LANG[locale]} className={`${sans.variable} ${mono.variable} ${devanagari.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <LocaleProvider locale={locale}>
        <a
          href="#main"
          className="sr-only z-[100] rounded-full bg-navy px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          {t("Skip to content")}
        </a>
        {children}
        <ServiceWorkerRegister />
        </LocaleProvider>
      </body>
    </html>
  );
}
