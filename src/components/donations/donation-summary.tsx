import { CalendarCheck2, Info } from "lucide-react";
import type { DonationSummary } from "@/lib/donations";
import { informationalWholeBloodEstimate } from "@/lib/donations";
import { formatDate, formatNumber } from "@/lib/format";
import { getT } from "@/i18n/server";
import type { TFunction } from "@/i18n/translate";

function Row({ t, label, reported, verified }: { t: TFunction; label: string; reported: string | null; verified: string | null }) {
  return (
    <div className="surface p-4">
      <p className="text-xs font-bold tracking-wide text-primary uppercase">{t(label)}</p>
      <dl className="mt-2 space-y-1.5 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">{t("Last reported")}</dt>
          <dd className="font-semibold text-navy">{reported ? formatDate(reported) : t("None")}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">{t("Last verified")}</dt>
          <dd className="font-semibold text-navy">{verified ? formatDate(verified) : t("None yet")}</dd>
        </div>
      </dl>
    </div>
  );
}

/** Keeps whole blood and SDP, reported and verified, strictly separate. */
export async function DonationSummaryCards({ summary, intervalDays }: { summary: DonationSummary; intervalDays?: number }) {
  const t = await getT();
  const estimate = intervalDays ? informationalWholeBloodEstimate(summary.last_reported_whole_blood, intervalDays) : null;
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Row t={t} label="Whole blood" reported={summary.last_reported_whole_blood} verified={summary.last_verified_whole_blood} />
        <Row t={t} label="SDP (platelets)" reported={summary.last_reported_sdp} verified={summary.last_verified_sdp} />
      </div>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl bg-success-soft p-3">
          <dt className="text-xs text-success">{t("Verified whole blood")}</dt>
          <dd className="text-xl font-extrabold text-navy">{formatNumber(summary.verified_whole_blood_count)}</dd>
        </div>
        <div className="rounded-2xl bg-success-soft p-3">
          <dt className="text-xs text-success">{t("Verified SDP")}</dt>
          <dd className="text-xl font-extrabold text-navy">{formatNumber(summary.verified_sdp_count)}</dd>
        </div>
        <div className="rounded-2xl bg-muted p-3">
          <dt className="text-xs text-muted-foreground">{t("Other verified apheresis")}</dt>
          <dd className="text-xl font-extrabold text-navy">{formatNumber(summary.verified_other_apheresis_count)}</dd>
        </div>
        <div className="rounded-2xl bg-warning-soft p-3">
          <dt className="text-xs text-warning">{t("Awaiting verification")}</dt>
          <dd className="text-xl font-extrabold text-navy">{formatNumber(summary.pending_count)}</dd>
        </div>
      </dl>
      {estimate ? (
        <p className="flex items-start gap-2 rounded-xl bg-secondary p-3 text-xs text-secondary-foreground">
          <CalendarCheck2 className="mt-px size-4 shrink-0" aria-hidden="true" />
          <span>
            <strong>{t("Informational estimate only:")}</strong>{" "}
            {t(
              "based on a {days}-day minimum interval after your last reported whole blood donation, a blood centre might next see you from around {date}. Intervals differ by sex and circumstances, and the blood centre's screening always decides. No estimate is given for SDP.",
              { days: intervalDays, date: formatDate(estimate) },
            )}
          </span>
        </p>
      ) : (
        <p className="flex items-start gap-2 text-xs text-muted-foreground">
          <Info className="mt-px size-4 shrink-0" aria-hidden="true" />
          {t("Totals count verified records only. Self-reported records are shown separately until reviewed.")}
        </p>
      )}
    </div>
  );
}
