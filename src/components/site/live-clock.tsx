"use client";

import { useSyncExternalStore } from "react";

const format = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Kolkata" });

function subscribe(onChange: () => void) {
  const timer = window.setInterval(onChange, 15_000);
  return () => window.clearInterval(timer);
}

/** The current time in India (IST), refreshed every few seconds. Empty until hydrated. */
export function LiveClock({ className }: { className?: string }) {
  const time = useSyncExternalStore(subscribe, () => format.format(new Date()), () => "");
  return (
    <span className={className} suppressHydrationWarning>
      <span className="opacity-60">IST </span>
      <span className="tabular-nums">{time || "--:--"}</span>
    </span>
  );
}
