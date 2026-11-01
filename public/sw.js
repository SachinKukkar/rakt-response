/*
 * Rakt Response service worker — deliberately minimal.
 *
 * Caches ONLY immutable build assets, public images/icons and an offline
 * fallback page. It never caches HTML of private pages, API responses,
 * Supabase requests or anything sent with credentials, so private donor
 * information is never stored on the device by the worker.
 */
// Bump to replace cached logos and icons (rr-v2: the round badge logo).
const VERSION = "rr-v2";
const STATIC_CACHE = `${VERSION}-static`;
const OFFLINE_URL = "/offline";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll([OFFLINE_URL, "/brand/logo.png", "/icons/icon-192.png"]))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => !key.startsWith(VERSION)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

function isCacheableAsset(url) {
  return (
    url.origin === self.location.origin &&
    (url.pathname.startsWith("/_next/static/") ||
      url.pathname.startsWith("/images/") ||
      url.pathname.startsWith("/icons/") ||
      url.pathname.startsWith("/brand/"))
  );
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  // Page navigations: always go to the network; show the offline page if it fails.
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
    return;
  }

  if (!isCacheableAsset(url)) return; // everything else: browser default, never cached here

  event.respondWith(
    caches.open(STATIC_CACHE).then(async (cache) => {
      const cached = await cache.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      if (response.ok && response.type === "basic") cache.put(request, response.clone());
      return response;
    }),
  );
});
