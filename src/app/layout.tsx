import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Noto_Sans_Devanagari, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/constants";
import { siteUrl } from "@/lib/env";
import { ServiceWorkerRegister } from "@/components/layout/service-worker-register";
import { LocaleProvider } from "@/i18n/client";
import { HTML_LANG } from "@/i18n/config";
import { getLocale, getT } from "@/i18n/server";

const sans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

// Hindi text. Latin glyphs still come from Plus Jakarta Sans.
const devanagari = Noto_Sans_Devanagari({
  variable: "--font-devanagari",
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const display = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  appleWebApp: { capable: true, title: SITE.name, statusBarStyle: "default" },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: SITE.name,
    description: SITE.description,
    images: [{ url: "/images/rakt-response-logo.jpeg", width: 640, height: 640, alt: "Rakt Response Team logo" }],
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#C82032",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  const t = await getT();
  return (
    <html lang={HTML_LANG[locale]} className={`${sans.variable} ${devanagari.variable} ${display.variable} h-full`}>
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
