import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActionForm } from "@/components/common/action-form";
import { EmptyState, PageHeader } from "@/components/common/page-parts";
import { Pill } from "@/components/common/status-badge";
import { RoleForm } from "@/components/admin/role-form";
import { revokeRole } from "@/actions/admin";
import { requireAdmin } from "@/lib/auth";
import { displayNames } from "@/lib/data/staff";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";
import type { StaffRoleRow } from "@/lib/types";

export const metadata: Metadata = { title: "Volunteers" };

export default async function AdminVolunteersPage() {
  const viewer = await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase.from("staff_roles").select("*, granted_at").order("is_active", { ascending: false }).order("role");
  const staff = (data ?? []) as Array<StaffRoleRow & { granted_at: string }>;
  const names = await displayNames(staff.map((s) => s.user_id));
  const { data: loads } = await supabase.from("volunteer_assignments").select("volunteer_id").eq("status", "active");
  const load = new Map<string, number>();
  for (const row of (loads ?? []) as Array<{ volunteer_id: string }>) load.set(row.volunteer_id, (load.get(row.volunteer_id) ?? 0) + 1);

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Administrator"
        title="Volunteers & administrators"
        actions={
          <Button asChild variant="outline">
            <Link href="/admin/users">Add someone</Link>
          </Button>
        }
      />
      {staff.length === 0 ? (
        <EmptyState icon={ShieldCheck} title="No staff yet" />
      ) : (
        <ul className="space-y-3">
          {staff.map((s) => (
            <li key={s.user_id} className="surface space-y-3 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-navy">{names.get(s.user_id) ?? "Team member"}</p>
                  <p className="text-xs text-muted-foreground">
                    Since {formatDate(s.granted_at)} · {load.get(s.user_id) ?? 0} active assignment(s)
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Pill tone={s.is_active ? "info" : "neutral"}>{s.is_active ? s.role : `${s.role} (revoked)`}</Pill>
                  {s.role === "volunteer" && s.is_active ? (
                    <>
                      {s.can_verify_requests ? <Pill tone="success">Verifies requests</Pill> : null}
                      {s.can_verify_donations ? <Pill tone="success">Verifies donations</Pill> : null}
                    </>
                  ) : null}
                </div>
              </div>
              {s.user_id !== viewer.id ? (
                <details>
                  <summary className="flex min-h-10 cursor-pointer items-center text-sm font-semibold text-primary">Edit access</summary>
                  <div className="mt-2 space-y-3">
                    <RoleForm userId={s.user_id} current={s.is_active ? s : null} />
                    {s.is_active ? (
                      <ActionForm action={revokeRole} fields={{ user_id: s.user_id }} label="Revoke all staff access" variant="destructive" size="sm" confirmText="Revoke this person's staff access?" />
                    ) : null}
                  </div>
                </details>
              ) : (
                <p className="text-xs text-muted-foreground">This is you. Another administrator must change your role.</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
