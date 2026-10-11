import type { Locale } from "./config";
import { HINDI, MESSAGE_TEMPLATES } from "./catalog";

export type TranslateVars = Record<string, string | number | null | undefined>;
export type TFunction = (text: string, vars?: TranslateVars) => string;

/** Replaces {name} placeholders. */
function fill(template: string, vars?: TranslateVars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (vars[key] === undefined || vars[key] === null ? match : String(vars[key])));
}

/*
 * Messages built on the server with values already inside them (for example
 * "We've sent a new verification link to a@b.in.") still translate when the
 * catalog has a matching template ("... link to {email}.").
 */
let patterns: Array<{ regex: RegExp; keys: string[]; hindi: string }> | null = null;
function templatePatterns() {
  if (patterns) return patterns;
  patterns = [];
  for (const [english, hindi] of Object.entries(MESSAGE_TEMPLATES)) {
    if (!english.includes("{")) continue;
    const keys: string[] = [];
    const source = english
      .split(/(\{\w+\})/)
      .map((part) => {
        const m = /^\{(\w+)\}$/.exec(part);
        if (m) {
          keys.push(m[1]);
          return "(.+?)";
        }
        return part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      })
      .join("");
    patterns.push({ regex: new RegExp(`^${source}$`), keys, hindi });
  }
  return patterns;
}

/**
 * Translates an English UI string. English is the source of truth: anything
 * missing from the Hindi catalog is shown in English rather than breaking.
 */
export function translate(locale: Locale, text: string, vars?: TranslateVars): string {
  if (locale === "en" || !text) return fill(text, vars);
  const exact = HINDI[text];
  if (exact !== undefined) return fill(exact, vars);
  if (!vars) {
    for (const p of templatePatterns()) {
      const m = p.regex.exec(text);
      if (m) return fill(p.hindi, Object.fromEntries(p.keys.map((k, i) => [k, m[i + 1]])));
    }
  }
  return fill(text, vars);
}

export const makeT =
  (locale: Locale): TFunction =>
  (text, vars) =>
    translate(locale, text, vars);
