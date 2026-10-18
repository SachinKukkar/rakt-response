import { Activity, BadgeCheck, Droplet, HandHeart, HeartPulse, Users } from "lucide-react";
import { formatDate, formatNumber } from "@/lib/format";
import type { ImpactMetrics } from "@/lib/types";
import { Notice } from "@/components/common/page-parts";
import { getT } from "@/i18n/server";

export interface MetricDefinition {
  key: keyof ImpactMetrics;
  label: string;
  definition: string;
  icon: typeof Users;
}

export const HOME_METRICS: MetricDefinition[] = [
  { key: "registered_donors", label: "Registered donors", icon: Users, definition: "Active donor accounts with a confirmed email address." },
  { key: "verified_donors", label: "Verified donors", icon: BadgeCheck, definition: "Registered donors who confirmed their email address." },
  { key: "verified_whole_blood_donations", label: "Verified whole blood donations", icon: Droplet, definition: "Whole blood donation records verified by an authorised Rakt Mitra or administrator." },
  { key: "verified_sdp_donations", label: "Verified SDP donations", icon: HeartPulse, definition: "Single donor platelet donation records that have been verified." },
  { key: "requests_coordinated", label: "Requests coordinated", icon: HandHeart, definition: "Verified requests that Rakt Mitras actively coordinated with potential donors." },
  { key: "requests_fulfilled", label: "Requests fulfilled", icon: Activity, definition: "Requests closed as fulfilled with a confirmation note — not just a donor contacted or interested." },
];

export async function ImpactStats({ metrics, items = HOME_METRICS, showDefinitions = false }: { metrics: ImpactMetrics | null; items?: MetricDefinition[]; showDefinitions?: boolean }) {
  const t = await getT();
  if (!metrics) {
    return (
      <Notice title="Live figures are not available right now">
        {t(
          "Our community statistics are calculated live from verified records. They will appear here when the database is reachable. We never show estimated or placeholder numbers.",
        )}
      </Notice>
    );
  }
  const allZero = items.every((item) => Number(metrics[item.key] ?? 0) === 0);
  return (
    <div className="space-y-3">
      <dl className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item.key} className="surface reveal p-4 sm:p-5">
            <dt className="flex items-start justify-between gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              <span>{t(item.label)}</span>
              <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-accent text-primary">
                <item.icon className="size-4" aria-hidden="true" />
              </span>
            </dt>
            <dd className="mt-3 text-4xl font-medium tracking-[-0.04em] text-navy tabular-nums sm:text-5xl">{formatNumber(Number(metrics[item.key] ?? 0))}</dd>
            {showDefinitions ? <dd className="mt-1 text-xs leading-relaxed text-muted-foreground">{t(item.definition)}</dd> : null}
          </div>
        ))}
      </dl>
      <p className="text-xs text-muted-foreground">
        {allZero
          ? t("We're just getting started — these figures are live and will grow as records are verified.")
          : metrics.period_start
            ? t("Live figures from verified platform records since {since}. Updated {updated}.", {
                since: formatDate(metrics.period_start),
                updated: formatDate(metrics.generated_at, { hour: "numeric", minute: "2-digit" }),
              })
            : t("Live figures from verified platform records. Updated {updated}.", {
                updated: formatDate(metrics.generated_at, { hour: "numeric", minute: "2-digit" }),
              })}
      </p>
    </div>
  );
}
