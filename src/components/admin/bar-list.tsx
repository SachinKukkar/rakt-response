import { formatNumber } from "@/lib/format";
import { getT } from "@/i18n/server";

/** Lightweight horizontal bar chart (no chart library), readable on phones. */
export async function BarList({
  items,
  label,
  emptyText = "No data yet.",
}: {
  items: Array<{ label: string; value: number }>;
  label: string;
  emptyText?: string;
}) {
  const t = await getT();
  const max = Math.max(1, ...items.map((i) => i.value));
  if (!items.length || items.every((i) => i.value === 0)) return <p className="text-sm text-muted-foreground">{t(emptyText)}</p>;
  return (
    <ul className="space-y-2" aria-label={t(label)}>
      {items.map((item) => (
        <li key={item.label} className="grid grid-cols-[5.5rem_1fr_auto] items-center gap-2 text-sm">
          <span className="truncate text-muted-foreground" title={item.label}>
            {item.label}
          </span>
          <span className="h-3 rounded-full bg-muted" aria-hidden="true">
            <span className="block h-3 rounded-full bg-primary" style={{ width: `${(item.value / max) * 100}%` }} />
          </span>
          <span className="w-10 text-right font-semibold text-navy tabular-nums">{formatNumber(item.value)}</span>
        </li>
      ))}
    </ul>
  );
}

/** Monthly column chart with a two-series option. */
export async function MonthlyColumns({
  data,
  series,
  label,
}: {
  data: Array<Record<string, number | string>>;
  series: Array<{ key: string; name: string; className: string }>;
  label: string;
}) {
  const t = await getT();
  const max = Math.max(1, ...data.flatMap((d) => series.map((s) => Number(d[s.key] ?? 0))));
  const total = data.reduce((sum, d) => sum + series.reduce((s2, s) => s2 + Number(d[s.key] ?? 0), 0), 0);
  return (
    <figure>
      <div className="flex h-36 items-end gap-1" role="img" aria-label={t("{label}: {total} in the last 12 months", { label: t(label), total })}>
        {data.map((d) => (
          <div key={String(d.month)} className="flex h-full flex-1 items-end justify-center gap-px" title={`${d.month}: ${series.map((s) => `${s.name} ${d[s.key]}`).join(", ")}`}>
            {series.map((s) => (
              <span key={s.key} className={`w-full max-w-4 rounded-t ${s.className}`} style={{ height: `${(Number(d[s.key] ?? 0) / max) * 100}%`, minHeight: Number(d[s.key]) ? 3 : 0 }} />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-1 flex gap-1 text-[10px] text-muted-foreground" aria-hidden="true">
        {data.map((d) => (
          <span key={String(d.month)} className="flex-1 text-center">
            {String(d.month).slice(5)}
          </span>
        ))}
      </div>
      {series.length > 1 ? (
        <figcaption className="mt-2 flex gap-4 text-xs text-muted-foreground">
          {series.map((s) => (
            <span key={s.key} className="flex items-center gap-1.5">
              <span className={`size-2.5 rounded-sm ${s.className}`} aria-hidden="true" />
              {s.name}
            </span>
          ))}
        </figcaption>
      ) : null}
      <table className="sr-only">
        <caption>{t(label)}</caption>
        <thead>
          <tr>
            <th>{t("Month")}</th>
            {series.map((s) => (
              <th key={s.key}>{s.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={String(d.month)}>
              <td>{String(d.month)}</td>
              {series.map((s) => (
                <td key={s.key}>{String(d[s.key] ?? 0)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
