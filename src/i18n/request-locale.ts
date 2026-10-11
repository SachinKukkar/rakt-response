import { cache } from "react";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from "./config";

/**
 * Per-request holder so sync helpers (date and number formatting) can follow
 * the visitor's language on the server. `getLocale()` fills it; React's
 * `cache` scopes it to one server render, so requests never share it.
 */
const store = cache((): { locale: Locale | null } => ({ locale: null }));

export function rememberRequestLocale(locale: Locale) {
  store().locale = locale;
}

/** Best-effort current language for formatting (server render or browser). */
export function currentLocale(): Locale {
  if (typeof document !== "undefined") {
    const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${LOCALE_COOKIE}=(\\w+)`));
    return isLocale(match?.[1]) ? match[1] : DEFAULT_LOCALE;
  }
  try {
    return store().locale ?? DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}
