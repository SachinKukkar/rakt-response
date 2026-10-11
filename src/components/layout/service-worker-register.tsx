"use client";

import { useEffect } from "react";

/** Registers the minimal offline service worker in production only. */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
      // Installability is optional; the site works without the worker.
    });
  }, []);
  return null;
}
