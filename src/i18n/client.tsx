"use client";

import { createContext, useContext, useMemo } from "react";
import { DEFAULT_LOCALE, type Locale } from "./config";
import { makeT, type TFunction, type TranslateVars } from "./translate";

const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

export function LocaleProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}

/** `const t = useT();` in client components. */
export function useT(): TFunction {
  const locale = useLocale();
  return useMemo(() => makeT(locale), [locale]);
}

/**
 * Translated text for components that can't await `getT()` (shared, sync
 * server components). Works inside server and client trees alike.
 */
export function T({ children, vars }: { children: string; vars?: TranslateVars }) {
  const t = useT();
  return <>{t(children, vars)}</>;
}
