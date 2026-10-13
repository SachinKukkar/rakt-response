import Link from "next/link";
import { ChevronLeft, Info, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { tx } from "@/i18n/tx";

export function PageHeader({
  title,
  description,
  backHref,
  backLabel = "Back",
  actions,
  eyebrow,
  className,
}: {
  title: string;
  description?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
  actions?: React.ReactNode;
  eyebrow?: string;
  className?: string;
}) {
  return (
    <header className={cn("mb-5 space-y-3", className)}>
      {backHref ? (
        <Link
          href={backHref}
          className="-ml-2 inline-flex min-h-10 items-center gap-1 rounded-full px-2 text-sm font-medium text-muted-foreground hover:text-navy"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          {tx(backLabel)}
        </Link>
      ) : null}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0 space-y-1">
          {eyebrow ? <p className="text-xs font-semibold tracking-wider text-primary uppercase">{tx(eyebrow)}</p> : null}
          <h1 className="font-display text-[1.75rem] leading-tight font-extrabold sm:text-4xl">{tx(title)}</h1>
          {description ? <div className="max-w-2xl text-[15px] text-muted-foreground">{tx(description)}</div> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}

export function SectionHeading({
  title,
  description,
  action,
  as: Tag = "h2",
  id,
  className,
}: {
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  as?: "h2" | "h3";
  id?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-3 flex items-end justify-between gap-3", className)}>
      <div className="min-w-0">
        <Tag id={id} className={cn("font-bold", Tag === "h2" ? "text-lg sm:text-xl" : "text-base")}>
          {tx(title)}
        </Tag>
        {description ? <p className="mt-0.5 text-sm text-muted-foreground">{tx(description)}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("surface flex flex-col items-center px-5 py-10 text-center", className)}>
      <span className="mb-3 grid size-14 place-items-center rounded-full bg-accent text-primary">
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <p className="font-semibold text-navy">{tx(title)}</p>
      {description ? <div className="mt-1 max-w-sm text-sm text-muted-foreground">{tx(description)}</div> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
  className,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: LucideIcon;
  tone?: "default" | "brand" | "navy";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4",
        tone === "default" && "surface",
        tone === "brand" && "border-primary/15 bg-accent/70",
        tone === "navy" && "border-navy bg-navy text-white",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className={cn("text-xs font-semibold tracking-wide uppercase", tone === "navy" ? "text-white/75" : "text-muted-foreground")}>
          {tx(label)}
        </p>
        {Icon ? <Icon className={cn("size-4.5", tone === "navy" ? "text-white/80" : "text-primary")} aria-hidden="true" /> : null}
      </div>
      <p className={cn("mt-1.5 text-2xl font-extrabold tabular-nums", tone === "navy" ? "text-white" : "text-navy")}>{value}</p>
      {hint ? <p className={cn("mt-1 text-xs", tone === "navy" ? "text-white/75" : "text-muted-foreground")}>{tx(hint)}</p> : null}
    </div>
  );
}

/** Calm, clearly-worded medical/coordination disclaimer. */
export function Notice({
  title,
  children,
  tone = "info",
  icon: Icon = Info,
  className,
}: {
  title?: string;
  children: React.ReactNode;
  tone?: "info" | "warning" | "brand";
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <div
      role="note"
      className={cn(
        "flex gap-3 rounded-2xl border p-4 text-sm",
        tone === "info" && "border-secondary-foreground/12 bg-secondary text-foreground/85",
        tone === "warning" && "border-warning/25 bg-warning-soft text-foreground/85",
        tone === "brand" && "border-primary/15 bg-accent/70 text-foreground/85",
        className,
      )}
    >
      <Icon
        className={cn("mt-0.5 size-5 shrink-0", tone === "warning" ? "text-warning" : tone === "brand" ? "text-primary" : "text-navy")}
        aria-hidden="true"
      />
      <div className="space-y-1">
        {title ? <p className="font-semibold text-navy">{tx(title)}</p> : null}
        <div className="leading-relaxed">{tx(children)}</div>
      </div>
    </div>
  );
}

export function CardListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="surface flex items-center gap-3 p-4">
          <Skeleton className="size-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function KeyValue({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border/70 py-2.5 text-sm last:border-0">
      <dt className="text-muted-foreground">{tx(label)}</dt>
      <dd className="text-right font-medium text-foreground">{tx(children)}</dd>
    </div>
  );
}
