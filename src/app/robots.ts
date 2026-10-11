import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/profile", "/donations", "/requests", "/notifications", "/settings", "/volunteer", "/admin", "/api", "/auth", "/share-your-story/submissions"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
