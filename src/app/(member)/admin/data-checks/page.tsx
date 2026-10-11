import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { EmptyState, Notice, PageHeader } from "@/components/common/page-parts";
import { Pill } from "@/components/common/status-badge";
import { getDataChecks } from "@/lib/data/admin";
import { formatDateTime, formatNumber } from "@/lib/format";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("Data checks") };
}

type Severity = "review" | "follow_up";

/** What each check means and what to do about it. Order = display order. */
const CHECKS: Array<{ key: string; title: string; why: string; todo: string; severity: Severity }> = [
  {
    key: "whole_blood_too_close",
    title: "Whole blood donations too close together",
    why: "Two whole blood records for the same donor closer than the interval set in Settings.",
    todo: "Check with the donor or blood centre; one date may be wrong or a duplicate.",
    severity: "review",
  },
  {
    key: "sdp_too_close",
    title: "SDP donations less than 2 days apart",
    why: "Platelet donations logged within 48 hours of each other.",
    todo: "Usually a typing mistake. Correct or reject the extra record.",
    severity: "review",
  },
  {
    key: "shared_phone",
    title: "Same mobile number on more than one account",
    why: "Could be a duplicate account, a family sharing a phone, or a typo.",
    todo: "Contact the donors and deactivate any duplicate account.",
    severity: "review",
  },
  {
    key: "experience_mismatch",
    title: "Said “first time” but logged earlier donations",
    why: "The registration answer doesn't match the donation history entered.",
    todo: "Confirm with the donor and update their profile.",
    severity: "review",
  },
  {
    key: "many_pending",
    title: "Five or more unverified donation records",
    why: "A large self-reported history is worth checking before it is relied on.",
    todo: "Ask for certificates or blood centre records, then verify or reject.",
    severity: "review",
  },
  {
    key: "stale_pending",
    title: "Records waiting over 30 days",
    why: "Self-reported donations nobody has reviewed yet.",
    todo: "Review them in the donation queue.",
    severity: "follow_up",
  },
  {
    key: "blood_group_correction",
    title: "Blood group correction requested",
    why: "The donor asked to change a blood group that was already checked.",
    todo: "Ask for a document (donor card or lab report) before approving.",
    severity: "follow_up",
  },
  {
    key: "group_to_confirm",
    title: "Blood group not yet document-checked",
    why: "These donors have verified donations but their blood group is still self-declared.",
    todo: "Their donor card from the blood centre usually shows the group. Mark it checked on their record.",
    severity: "follow_up",
  },
  {
    key: "missing_area",
    title: "Donors with no area",
    why: "Without a state, district and city they can't be matched to nearby requests.",
    todo: "Remind them to add their area, or add it from their record.",
    severity: "follow_up",
  },
  {
    key: "deletion_overdue",
    title: "Deletion requests older than 30 days",
    why: "Donors asked for their data to be removed.",
    todo: "Process the deletion from their record.",
    severity: "review",
  },
];

export default async function DataChecksPage() {
  const report = await getDataChecks();
  const t = await getT();
  if (!report) return <Notice tone="warning">Data checks could not be loaded. Please try again.</Notice>;
  const byKey = new Map(report.checks.map((c) => [c.key, c]));
  const flagged = CHECKS.filter((c) => byKey.has(c.key));
  const clear = CHECKS.filter((c) => !byKey.has(c.key));

  return (
    <div className="space-y-6">
      <PageHeader
        backHref="/admin"
        backLabel="Administration"
        eyebrow="Administrator"
        title="Data checks"
        description={t("Entries that look inconsistent and are worth a second look. These are prompts, not verdicts. Checked {time}.", { time: formatDateTime(report.generated_at) })}
      />

      {flagged.length === 0 ? (
        <EmptyState icon={ShieldCheck} title="Nothing to review" description="No inconsistencies found in donor profiles or donation records." />
      ) : (
        <div className="space-y-4">
          {flagged.map((meta) => {
            const check = byKey.get(meta.key)!;
            return (
              <section key={meta.key} className="surface p-4" aria-labelledby={`${meta.key}-heading`}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h2 id={`${meta.key}-heading`} className="font-bold text-navy">
                    {t(meta.title)}
                  </h2>
                  <Pill tone={meta.severity === "review" ? "warning" : "info"}>
                    {formatNumber(check.total)} {meta.severity === "review" ? t("to review") : t("to follow up")}
                  </Pill>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {meta.key === "whole_blood_too_close"
                    ? t("Two whole blood records for the same donor less than {days} days apart (the interval in Settings).", { days: report.whole_blood_interval_days })
                    : t(meta.why)}{" "}
                  <span className="font-medium text-foreground">{t(meta.todo)}</span>
                </p>
                <ul className="mt-3 divide-y divide-border">
                  {check.items.map((item, i) => (
                    <li key={`${item.profile_id}-${i}`}>
                      <Link
                        href={`/admin/donors/${item.profile_id}`}
                        className="flex min-h-12 items-center justify-between gap-3 py-2 hover:text-primary"
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold">{item.name}</span>
                          <span className="block text-xs text-muted-foreground">{item.detail}</span>
                        </span>
                        <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
                {check.total > check.items.length ? (
                  <p className="mt-2 text-xs text-muted-foreground">{t("Showing the first {shown} of {total}.", { shown: check.items.length, total: formatNumber(check.total) })}</p>
                ) : null}
              </section>
            );
          })}
        </div>
      )}

      {clear.length ? (
        <section aria-labelledby="clear-heading">
          <h2 id="clear-heading" className="mb-2 text-sm font-bold text-navy">
            {t("All clear")}
          </h2>
          <ul className="flex flex-wrap gap-2">
            {clear.map((c) => (
              <li key={c.key}>
                <Pill tone="success">{t(c.title)}</Pill>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
