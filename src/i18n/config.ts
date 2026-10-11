export const LOCALES = ["en", "hi"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
/** Cookie that remembers the visitor's language (no account needed). */
export const LOCALE_COOKIE = "rr_lang";

export const isLocale = (value: unknown): value is Locale => value === "en" || value === "hi";

/** BCP 47 tags for <html lang> and Intl formatting. */
export const HTML_LANG: Record<Locale, string> = { en: "en-IN", hi: "hi-IN" };
