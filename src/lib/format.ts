import { HTML_LANG } from "@/i18n/config";
import { currentLocale } from "@/i18n/request-locale";

const IST = "Asia/Kolkata";
/** Dates and relative times follow the visitor's language (en-IN or hi-IN). */
const lang = () => HTML_LANG[currentLocale()];

function toDate(value: string | Date): Date {
  if (value instanceof Date) return value;
  // Plain dates (YYYY-MM-DD) are calendar dates in India, not UTC midnight.
  return new Date(value.length === 10 ? `${value}T00:00:00+05:30` : value);
}

export function formatDate(value: string | Date | null | undefined, options: Intl.DateTimeFormatOptions = {}): string {
  if (!value) return "—";
  const date = toDate(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(lang(), { day: "numeric", month: "short", year: "numeric", timeZone: IST, ...options }).format(date);
}

export function formatDateTime(value: string | Date | null | undefined): string {
  return formatDate(value, { hour: "numeric", minute: "2-digit", hour12: true });
}

export function formatNumber(value: number | null | undefined): string {
  return new Intl.NumberFormat("en-IN").format(value ?? 0);
}

/** "in 3 hours", "2 days ago" — for request deadlines and activity. */
export function relativeTime(value: string | Date, now: Date = new Date()): string {
  const date = toDate(value);
  const diffMs = date.getTime() - now.getTime();
  const abs = Math.abs(diffMs);
  const rtf = new Intl.RelativeTimeFormat(lang(), { numeric: "auto" });
  if (abs < 60 * 60_000) return rtf.format(Math.round(diffMs / 60_000), "minute");
  if (abs < 48 * 3_600_000) return rtf.format(Math.round(diffMs / 3_600_000), "hour");
  const days = Math.round(diffMs / 86_400_000);
  if (abs < 60 * 86_400_000) return rtf.format(days, "day");
  return rtf.format(Math.round(days / 30), "month");
}

/** Today's date in India as YYYY-MM-DD (for date input max values). */
export function todayInIndia(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: IST }).format(now);
}

/** Converts a datetime-local value (interpreted as India time) to ISO. */
export function indiaLocalToIso(local: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(local)) return null;
  const date = new Date(`${local}:00+05:30`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function initials(name: string | null | undefined): string {
  if (!name) return "RR";
  const result = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
  return result || "RR";
}
