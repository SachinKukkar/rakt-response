import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Staff areas are deliberately not listed here (that would advertise them);
        // member pages also send noindex.
        disallow: ["/dashboard", "/profile", "/donations", "/requests", "/notifications", "/settings", "/api", "/auth", "/share-your-story/submissions"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
