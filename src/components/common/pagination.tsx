import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { getT } from "@/i18n/server";

/** Server-rendered prev/next pagination that preserves other query params. */
export async function Pagination({
  page,
  pageSize,
  total,
  basePath,
  params = {},
}: {
  page: number;
  pageSize: number;
  total: number;
  basePath: string;
  params?: Record<string, string | undefined>;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;
  const t = await getT();
  const href = (p: number) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) q.set(k, v);
    if (p > 1) q.set("page", String(p));
    const s = q.toString();
    return s ? `${basePath}?${s}` : basePath;
  };
  const linkClass = "inline-flex h-11 items-center gap-1 rounded-full border bg-white px-4 text-sm font-semibold text-navy hover:border-primary/40";
  return (
    <nav className="mt-6 flex items-center justify-between gap-3" aria-label={t("Pagination")}>
      {page > 1 ? (
        <Link href={href(page - 1)} className={linkClass} rel="prev">
          <ChevronLeft className="size-4" aria-hidden="true" /> {t("Previous")}
        </Link>
      ) : (
        <span className={cn(linkClass, "pointer-events-none opacity-40")} aria-hidden="true">
          <ChevronLeft className="size-4" /> {t("Previous")}
        </span>
      )}
      <span className="text-sm text-muted-foreground">
        {t("Page {page} of {pages}", { page, pages })}
      </span>
      {page < pages ? (
        <Link href={href(page + 1)} className={linkClass} rel="next">
          {t("Next")} <ChevronRight className="size-4" aria-hidden="true" />
        </Link>
      ) : (
        <span className={cn(linkClass, "pointer-events-none opacity-40")} aria-hidden="true">
          {t("Next")} <ChevronRight className="size-4" />
        </span>
      )}
    </nav>
  );
}

export function parsePage(value: string | string[] | undefined): number {
  const n = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(n) && n > 0 && n < 10_000 ? n : 1;
}
