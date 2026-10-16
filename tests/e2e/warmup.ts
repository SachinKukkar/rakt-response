import type { FullConfig } from "@playwright/test";

/**
 * Runs once after the server starts, before any test. The first request for each
 * size of the large homepage photo makes the server encode it (slow), which can
 * push the first phone tests past their time limit. Asking for those sizes here
 * means the tests get them ready-made.
 */
export default async function warmup(config: FullConfig) {
  const baseURL = config.projects[0]?.use.baseURL;
  if (!baseURL) return;
  const html = await fetch(baseURL)
    .then((r) => r.text())
    .catch(() => "");
  const photos = new Set<string>();
  for (const match of html.matchAll(/\/_next\/image\?url=[^"\s,]+/g)) {
    const path = match[0].replace(/&amp;/g, "&");
    // The widths the test phones and desktop pick (1080, 1200, 1920).
    if (/[?&]w=(1080|1200|1920)\b/.test(path)) photos.add(path);
  }
  await Promise.all(
    [...photos].map((path) =>
      fetch(new URL(path, baseURL), { headers: { accept: "image/avif,image/webp,*/*" } })
        .then((r) => r.arrayBuffer())
        .catch(() => undefined),
    ),
  );
}
