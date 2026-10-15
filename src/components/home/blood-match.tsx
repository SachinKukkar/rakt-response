"use client";

import { useState } from "react";
import { MARK_PATH, MARK_VIEWBOX } from "@/components/brand/logo";
import { MATCH_GROUPS, bloodMatch, type MatchGroup } from "@/lib/blood-compat";
import { useT } from "@/i18n/client";
import { cn } from "@/lib/utils";

const label = (g: MatchGroup) => g.replace("-", "−");

/**
 * Tap your blood group: the drop shows it and lists who you can give red cells
 * to and receive them from. A general guide only; the note says so.
 */
export function BloodMatch() {
  const t = useT();
  const [group, setGroup] = useState<MatchGroup>("O-");
  const match = bloodMatch(group);
  const everyone = match.givesTo.length === 8;

  return (
    <div className="grid items-center gap-8 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-12">
      {/* The drop with the chosen group: first on phones. */}
      <div className="relative mx-auto w-[min(86vw,30rem)] md:order-2 md:w-full md:max-w-[34rem]">
        <svg viewBox={MARK_VIEWBOX} className="block w-full" aria-hidden="true">
          <path d={MARK_PATH} className={cn("transition-[fill] duration-300", group === "Oh" ? "fill-navy" : "fill-primary")} />
        </svg>
        <p
          key={group}
          className="match-swap absolute inset-x-0 top-[52%] -translate-y-1/2 text-center text-[length:var(--step-display)] leading-none font-semibold tracking-[-0.05em] text-white"
          aria-live="polite"
        >
          {label(group)}
        </p>
      </div>

      <div className="md:order-1">
        <h2 className="text-[length:var(--step-head)] leading-[1] font-semibold tracking-[-0.04em]">{t("Tap your blood group")}</h2>
        <ul className="mt-6 grid max-w-[30rem] grid-cols-3 gap-2">
          {MATCH_GROUPS.map((g) => (
            <li key={g} className="shrink-0">
              <button
                type="button"
                onClick={() => setGroup(g)}
                aria-pressed={group === g}
                className={cn(
                  "bubble press flex min-h-16 w-full flex-col items-center justify-center text-[length:var(--step-lead)] leading-[1.1] font-semibold tracking-[-0.02em] transition-colors",
                  group === g ? "bg-primary text-white" : "bg-muted text-navy hover:bg-navy-soft",
                )}
              >
                {label(g)}
                {g === "Oh" ? <span className="text-[length:var(--step-small)] font-medium tracking-normal">{t("Bombay")}</span> : null}
              </button>
            </li>
          ))}
        </ul>

        <dl key={group} className="match-swap mt-8 grid gap-4 text-[length:var(--step-body)] leading-[1.5] text-navy">
          <div>
            <dt className="font-semibold">{t("You can give red cells to")}</dt>
            <dd>{everyone ? t("Everyone (all 8 groups)") : match.givesTo.map(label).join(", ")}</dd>
          </div>
          <div>
            <dt className="font-semibold">{t("You can receive red cells from")}</dt>
            <dd>{match.receivesFrom.length === 8 ? t("Everyone (all 8 groups)") : match.receivesFrom.map(label).join(", ")}</dd>
          </div>
        </dl>
        {group === "Oh" ? (
          <p className="match-swap mt-4 max-w-[52ch] text-[length:var(--step-body)] leading-[1.5] text-navy">
            {t("Bombay (Oh) was first described in Bombay in 1952. It is very rare, so every Oh donor matters.")}
          </p>
        ) : null}
        <p className="mt-5 max-w-[52ch] text-[length:var(--step-small)] leading-[1.5] text-muted-foreground">
          {t("A general guide for red cells. The blood bank always tests and cross-matches before any transfusion.")}
        </p>
      </div>
    </div>
  );
}
