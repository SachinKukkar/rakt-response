import type { Metadata } from "next";
import { FileClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState, PageHeader } from "@/components/common/page-parts";
import { Pagination, parsePage } from "@/components/common/pagination";
import { Pill } from "@/components/common/status-badge";
import { requireAdmin } from "@/lib/auth";
import { displayNames } from "@/lib/data/staff";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Audit logs" };

const PAGE_SIZE = 30;

interface AuditRow {
  id: number;
  actor_id: string | null;
  actor_role: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export default async function AuditLogsPage({ searchParams }: PageProps<"/admin/audit-logs">) {
  await requireAdmin();
  const params = await searchParams;
  const action = String((Array.isArray(params.action) ? params.action[0] : params.action) ?? "").trim().replace(/[^a-z_.]/g, "").slice(0, 60);
  const page = parsePage(params.page);
  const supabase = await createClient();
  let query = supabase.from("audit_logs").select("*", { count: "exact" });
  if (action) query = query.like("action", `${action}%`);
  const { data, count } = await query.order("created_at", { ascending: false }).range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  const rows = (data ?? []) as AuditRow[];
  const names = await displayNames(rows.map((r) => r.actor_id));

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Administrator"
        title="Audit logs"
        description="Append-only record of privileged actions. Entries store which fields changed, never personal values."
      />
      <form method="get" className="surface flex gap-2 p-3" role="search">
        <label htmlFor="audit-action" className="sr-only">
          Filter by action
        </label>
        <Input id="audit-action" name="action" defaultValue={action} placeholder="e.g. donor_contact, staff_roles, export" />
        <Button type="submit">Filter</Button>
      </form>
      {rows.length === 0 ? (
        <EmptyState icon={FileClock} title="No audit entries" />
      ) : (
        <ul className="space-y-2">
          {rows.map((r) => (
            <li key={r.id} className="surface space-y-1 p-3.5 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-semibold text-navy">{r.action}</code>
                <span className="text-xs text-muted-foreground">{formatDateTime(r.created_at)}</span>
              </div>
              <p className="text-muted-foreground">
                {r.actor_id ? names.get(r.actor_id) ?? "Unknown user" : "System"} {r.actor_role ? <Pill className="ml-1">{r.actor_role}</Pill> : null}
                {r.entity_type ? ` · ${r.entity_type}` : ""}
                {r.entity_id ? ` · ${r.entity_id.slice(0, 8)}…` : ""}
              </p>
              {r.metadata && Object.keys(r.metadata).length ? (
                <details>
                  <summary className="cursor-pointer text-xs text-primary">Details</summary>
                  <pre className="mt-1 overflow-x-auto rounded-lg bg-muted p-2 text-[11px]">{JSON.stringify(r.metadata, null, 2)}</pre>
                </details>
              ) : null}
            </li>
          ))}
        </ul>
      )}
      <Pagination page={page} pageSize={PAGE_SIZE} total={count ?? 0} basePath="/admin/audit-logs" params={{ action: action || undefined }} />
    </div>
  );
}
