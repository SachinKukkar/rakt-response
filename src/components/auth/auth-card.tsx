import { cn } from "@/lib/utils";

export function AuthCard({
  title,
  description,
  children,
  footer,
  className,
}: {
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      <section className="surface p-5 sm:p-7">
        <h1 className="font-display text-[1.75rem] leading-tight font-extrabold">{title}</h1>
        {description ? <div className="mt-1 mb-5 text-sm text-muted-foreground">{description}</div> : <div className="mb-5" />}
        {children}
      </section>
      {footer ? <div className="text-center text-sm text-muted-foreground">{footer}</div> : null}
    </div>
  );
}

export function NotConfiguredNotice() {
  return (
    <div className="mb-4 rounded-xl border border-warning/30 bg-warning-soft p-3 text-sm text-foreground/85" role="note">
      The Rakt Response database is not connected in this environment, so accounts cannot be created or used yet. See the
      README for Supabase setup.
    </div>
  );
}
