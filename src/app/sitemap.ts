import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/env";

const PUBLIC_PATHS = [
  "",
  "/about",
  "/why-donate",
  "/donation-types",
  "/eligibility",
  "/donation-process",
  "/faq",
  "/contact",
  "/privacy",
  "/terms",
  "/blood-requests",
  "/impact",
  "/stories",
  "/share-your-story",
  "/register",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_PATHS.map((path) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: path === "/blood-requests" ? "hourly" : "monthly",
    priority: path === "" ? 1 : 0.6,
  }));
}
