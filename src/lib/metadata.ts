import type { Metadata } from "next";
import { SITE } from "@/lib/constants";

/**
 * The card shown when a link is shared (1200×630, ~120 KB, under WhatsApp's 300 KB limit;
 * `npm run share-card` rebuilds it). Bump `v` when it changes so apps fetch the new one.
 */
export const SHARE_IMAGE = {
  url: "/images/share-card.jpg?v=2",
  width: 1200,
  height: 630,
  alt: `${SITE.name} — ${SITE.tagline}`,
};

/**
 * A page's <title> and meta description, mirrored into its share preview
 * (WhatsApp, Facebook, X). Pass already-translated strings.
 */
export function pageMetadata(title: string, description?: string, extra: Metadata = {}): Metadata {
  const shareTitle = `${title} · ${SITE.name}`;
  return {
    title,
    ...(description ? { description } : {}),
    openGraph: { type: "website", siteName: SITE.name, title: shareTitle, images: [SHARE_IMAGE], ...(description ? { description } : {}) },
    twitter: { card: "summary_large_image", title: shareTitle, images: [SHARE_IMAGE.url], ...(description ? { description } : {}) },
    ...extra,
  };
}
