import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from "./config";
import { rememberRequestLocale } from "./request-locale";
import { makeT, type TFunction } from "./translate";

/** The visitor's chosen language, from the language cookie. */
export const getLocale = cache(async (): Promise<Locale> => {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  const locale = isLocale(value) ? value : DEFAULT_LOCALE;
  rememberRequestLocale(locale);
  return locale;
});

/** `const t = await getT();` in server components, server actions and route handlers. */
export async function getT(): Promise<TFunction> {
  return makeT(await getLocale());
}
