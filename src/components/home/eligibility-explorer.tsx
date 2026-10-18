"use client";

import { useId, useRef, useState } from "react";
import { RangeBar } from "@/components/site/parts";
import { ArrowLink } from "@/components/site/arrow-link";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n/client";

/**
 * "Pick a check, see where you sit": the usual ranges the site already
 * publishes on /eligibility (age 18–65, weight 45–50 kg+, 90/120 days between
 * whole blood donations). Never a yes or no: the blood centre decides.
 */
interface Check {
  key: string;
  tab: string;
  unit: string;
  min: number;
  max: number;
  start: number;
  /** Upper bounds of each range, in order; the last range runs to `max`. */
  bounds: number[];
  labels: string[];
  verdicts: string[];
  /** Index of the range shown in red as "usual". */
  usual: number;
  note: string;
}

const CHECKS: Check[] = [
  {
    key: "age",
    tab: "Age",
    unit: "years",
    min: 14,
    max: 75,
    start: 25,
    bounds: [18, 66],
    labels: ["Under 18", "Usual 18–65", "Over 65"],
    verdicts: ["Usually too young to donate", "Within the usual range", "Ask the blood centre"],
    usual: 1,
    note: "First-timers near the top end may get extra checks.",
  },
  {
    key: "weight",
    tab: "Weight",
    unit: "kg",
    min: 35,
    max: 100,
    start: 60,
    bounds: [45, 50],
    labels: ["Under 45", "45–50 depends", "50 kg+"],
    verdicts: ["Usually below the minimum", "Depends on the centre and bag size", "Usually enough for whole blood"],
    usual: 2,
    note: "Larger collections may need a higher minimum.",
  },
  {
    key: "gap",
    tab: "Since last donation",
    unit: "days",
    min: 0,
    max: 180,
    start: 120,
    bounds: [90, 120],
    labels: ["Under 90", "90+ men", "120+ women"],
    verdicts: ["Usually too soon for whole blood", "Usually long enough for men; women usually wait 120 days", "Usually long enough for whole blood"],
    usual: 2,
    note: "Typically men / women. SDP has its own, shorter gap.",
  },
];

/** How far each key moves the slider. */
const KEY_STEPS: Record<string, number> = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: 10, PageDown: -10 };

function rangeOf(check: Check, value: number): number {
  const i = check.bounds.findIndex((bound) => value < bound);
  return i === -1 ? check.bounds.length : i;
}

export function EligibilityExplorer({ className }: { className?: string }) {
  const t = useT();
  const id = useId();
  const [active, setActive] = useState(0);
  const [values, setValues] = useState(() => CHECKS.map((check) => check.start));
  const check = CHECKS[active];
  const value = values[active];
  const range = rangeOf(check, value);
  const span = check.max - check.min;
  const segments = [check.bounds[0] - check.min, ...check.bounds.slice(1).map((b, i) => b - check.bounds[i]), check.max - check.bounds[check.bounds.length - 1]];
  const sliderRef = useRef<HTMLDivElement>(null);

  const setValue = (next: number) =>
    setValues((prev) => prev.map((v, i) => (i === active ? Math.min(check.max, Math.max(check.min, Math.round(next))) : v)));
  // Where along the bar the finger or pointer is, as a value.
  const valueAt = (clientX: number) => {
    const rect = sliderRef.current?.getBoundingClientRect();
    return rect && rect.width ? check.min + ((clientX - rect.left) / rect.width) * span : value;
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key in KEY_STEPS) setValue(value + KEY_STEPS[e.key]);
    else if (e.key === "Home") setValue(check.min);
    else if (e.key === "End") setValue(check.max);
    else return;
    e.preventDefault();
  };

  return (
    <div className={cn("min-w-0", className)}>
      <div role="tablist" aria-label={t("Eligibility checks")} className="snap-row mb-3 sm:mx-0 sm:flex-wrap sm:px-0">
        {CHECKS.map((c, i) => (
          <button
            key={c.key}
            type="button"
            role="tab"
            id={`${id}-tab-${c.key}`}
            aria-selected={i === active}
            aria-controls={`${id}-panel`}
            onClick={() => setActive(i)}
            className={cn(
              "press h-10 rounded-full px-4 text-sm font-medium whitespace-nowrap transition-colors duration-300",
              i === active ? "bg-night text-cream" : "bg-navy/6 text-navy hover:bg-navy/10",
            )}
          >
            {t(c.tab)}
          </button>
        ))}
      </div>

      <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${check.key}`} className="on-night rounded-[1.75rem] p-6 sm:p-9">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xl font-medium sm:text-2xl">{t(check.tab)}</p>
          <p className="label-mono text-cream/55">{t("Usual ranges in India")}</p>
        </div>
        <p className="mt-6 flex items-baseline gap-2" aria-live="polite">
          <span className="text-[4.5rem] leading-none font-medium tracking-[-0.05em] tabular-nums sm:text-[6rem]">{value}</span>
          <span className="text-lg text-cream/70">{t(check.unit)}</span>
        </p>

        {/* The bar itself is the slider: drag or tap anywhere on it, or use the arrow keys. */}
        <div
          ref={sliderRef}
          role="slider"
          tabIndex={0}
          aria-label={t(check.tab)}
          aria-valuemin={check.min}
          aria-valuemax={check.max}
          aria-valuenow={value}
          aria-valuetext={`${value} ${t(check.unit)}: ${t(check.verdicts[range])}`}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            setValue(valueAt(e.clientX));
          }}
          onPointerMove={(e) => {
            if (e.currentTarget.hasPointerCapture(e.pointerId)) setValue(valueAt(e.clientX));
          }}
          onKeyDown={onKeyDown}
          className="group mt-3 cursor-pointer touch-pan-y py-5 outline-none select-none"
        >
          <RangeBar segments={segments} active={check.usual} marker={(value - check.min) / span} handle />
        </div>
        <div className="-mt-2 flex justify-between gap-2" aria-hidden="true">
          {check.labels.map((label, i) => (
            <span
              key={label}
              style={{ flexGrow: segments[i] }}
              className={cn("label-mono basis-0 text-[10px] sm:text-[11px]", i === check.usual ? "text-blush" : "text-cream/45", i === range && "text-cream")}
            >
              {t(label)}
            </span>
          ))}
        </div>

        <p className="mt-8 text-lg font-medium sm:text-xl">{t(check.verdicts[range])}</p>
        <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-cream/65">{t(check.note)}</p>

        <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="label-mono text-cream/55">{t("The blood centre's doctor decides, every time.")}</p>
          <ArrowLink href="/eligibility" tone="cream">
            {t("Full eligibility guide")}
          </ArrowLink>
        </div>
      </div>
    </div>
  );
}
