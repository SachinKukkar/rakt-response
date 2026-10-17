import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

function supabaseOrigin(): string {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").origin;
  } catch {
    return "";
  }
}

const supabase = supabaseOrigin();
const supabaseWs = supabase.replace(/^http/, "ws");

// Pages are mostly statically rendered, so a nonce-based CSP is not used;
// inline scripts are limited to the framework's own bootstrap.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${supabase} https://*.tile.openstreetmap.org https://tile.openstreetmap.org`.trim(),
  "font-src 'self' data:",
  `connect-src 'self' ${supabase} ${supabaseWs}`.trim(),
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "manifest-src 'self'",
  "worker-src 'self'",
  isDev ? "" : "upgrade-insecure-requests",
]
  .filter(Boolean)
  .join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self), payment=(), usb=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  ...(isDev ? [] : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }]),
];

const nextConfig: NextConfig = {
  // Authenticated pages render per request; public pages are static/ISR.
  cacheComponents: false,
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: {
    serverActions: {
      // Story photos are resized in the browser before upload; this leaves headroom.
      bodySizeLimit: "4mb",
      // Dev only: a VS Code dev tunnel rewrites the browser's Origin to localhost:3000 but
      // forwards the tunnel's own host, so without this every action through it is refused.
      ...(isDev ? { allowedOrigins: ["localhost:3000"] } : {}),
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: supabase
      ? [{ protocol: new URL(supabase).protocol.replace(":", "") as "https" | "http", hostname: new URL(supabase).hostname, pathname: "/storage/v1/object/public/story-public/**" }]
      : [],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

export default nextConfig;
