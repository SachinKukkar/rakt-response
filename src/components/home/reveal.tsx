"use client";

import { useEffect } from "react";

/**
 * Marks [data-rise] elements as shown when they scroll into view, so each
 * section's heading, text and picture rise in turn (CSS in globals.css).
 * Content is visible without this script, and anything already on screen
 * when the page loads is shown at once (no flicker); only content further
 * down gets the entrance.
 */
export function RevealOnScroll() {
  useEffect(() => {
    const items = Array.from(document.querySelectorAll<HTMLElement>("[data-rise]"));
    const fold = window.innerHeight * 0.92;
    for (const el of items) if (el.getBoundingClientRect().top < fold) el.setAttribute("data-shown", "");
    document.documentElement.classList.add("js-rise");
    if (!("IntersectionObserver" in window)) {
      items.forEach((el) => el.setAttribute("data-shown", ""));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-shown", "");
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    items.filter((el) => !el.hasAttribute("data-shown")).forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}
