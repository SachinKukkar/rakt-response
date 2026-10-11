"use server";

import { cookies } from "next/headers";
import { LOCALE_COOKIE, isLocale, type Locale } from "@/i18n/config";

/** Remembers the visitor's language for a year. No account needed. */
export async function setLocale(locale: Locale): Promise<void> {
  if (!isLocale(locale)) return;
  (await cookies()).set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
  });
}
