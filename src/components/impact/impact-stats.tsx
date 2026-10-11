import { Activity, BadgeCheck, Droplet, HandHeart, HeartPulse, Users } from "lucide-react";
import { formatDate, formatNumber } from "@/lib/format";
import type { ImpactMetrics } from "@/lib/types";
import { Notice } from "@/components/common/page-parts";

export interface MetricDefinition {
  key: keyof ImpactMetrics;
  label: string;
  definition: string;
  icon: typeof Users;
}

export const HOME_METRICS: MetricDefinition[] = [
  { key: "registered_donors", label: "Registered donors", icon: Users, definition: "Active donor accounts with a confirmed email address." },
  { key: "verified_donors", label: "Verified donors", icon: BadgeCheck, definition: "Donor profiles checked by a Rakt Response administrator." },
  { key: "verified_whole_blood_donations", label: "Verified whole blood donations", icon: Droplet, definition: "Whole blood donation records verified by an authorised volunteer or administrator." },
  { key: "verified_sdp_donations", label: "Verified SDP donations", icon: HeartPulse, definition: "Single donor platelet donation records that have been verified." },
  { key: "requests_coordinated", label: "Requests coordinated", icon: HandHeart, definition: "Verified requests that volunteers actively coordinated with potential donors." },
  { key: "requests_fulfilled", label: "Requests fulfilled", icon: Activity, definition: "Requests closed as fulfilled with a confirmation note — not just a donor contacted or interested." },
];

export function ImpactStats({ metrics, items = HOME_METRICS, showDefinitions = false }: { metrics: ImpactMetrics | null; items?: MetricDefinition[]; showDefinitions?: boolean }) {
  if (!metrics) {
    return (
      <Notice title="Live figures are not available right now">
        Our community statistics are calculated live from verified records. They will appear here when the database is reachable.
        We never show estimated or placeholder numbers.
      </Notice>
    );
  }
  const allZero = items.every((item) => Number(metrics[item.key] ?? 0) === 0);
  return (
    <div className="space-y-3">
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item.key} className="surface p-4">
            <dt className="flex items-start justify-between gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              <span>{item.label}</span>
              <item.icon className="size-4 shrink-0 text-primary" aria-hidden="true" />
            </dt>
            <dd className="mt-1.5 text-2xl font-extrabold text-navy tabular-nums sm:text-3xl">{formatNumber(Number(metrics[item.key] ?? 0))}</dd>
            {showDefinitions ? <dd className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.definition}</dd> : null}
          </div>
        ))}
      </dl>
      <p className="text-xs text-muted-foreground">
        {allZero
          ? "We're just getting started — these figures are live and will grow as records are verified."
          : `Live figures from verified platform records${metrics.period_start ? ` since ${formatDate(metrics.period_start)}` : ""}. Updated ${formatDate(metrics.generated_at, { hour: "numeric", minute: "2-digit" })}.`}
      </p>
    </div>
  );
}
