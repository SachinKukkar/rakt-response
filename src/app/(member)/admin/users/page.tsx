import type { Metadata } from "next";
import Link from "next/link";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState, Notice, PageHeader } from "@/components/common/page-parts";
import { Pagination, parsePage } from "@/components/common/pagination";
import { Pill } from "@/components/common/status-badge";
import { RoleForm } from "@/components/admin/role-form";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";
import type { StaffRoleRow } from "@/lib/types";

export const metadata: Metadata = { title: "Users & roles" };

const PAGE_SIZE = 20;

export default async function AdminUsersPage({ searchParams }: PageProps<"/admin/users">) {
  const viewer = await requireAdmin();
  const params = await searchParams;
  const q = String((Array.isArray(params.q) ? params.q[0] : params.q) ?? "").trim().slice(0, 80).replace(/[%_,()]/g, "");
  const page = parsePage(params.page);
  const supabase = await createClient();

  // Search by name, or by exact email via the private contacts table (admins only).
  let ids: string[] | null = null;
  if (q.includes("@")) {
    const { data } = await supabase.from("profile_contacts").select("profile_id").ilike("email", q);
    ids = ((data ?? []) as Array<{ profile_id: string }>).map((r) => r.profile_id);
  }
  let query = supabase.from("profiles").select("id, full_name, display_name, is_donor, is_active, created_at", { count: "exact" });
  if (ids) query = query.in("id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
  else if (q) query = query.ilike("full_name", `%${q}%`);
  const { data, count } = await query.order("created_at", { ascending: false }).range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  const users = (data ?? []) as Array<{ id: string; full_name: string; display_name: string | null; is_donor: boolean; is_active: boolean; created_at: string }>;
  const { data: roleData } = users.length ? await supabase.from("staff_roles").select("*").in("user_id", users.map((u) => u.id)) : { data: [] };
  const roles = new Map(((roleData ?? []) as StaffRoleRow[]).map((r) => [r.user_id, r]));

  return (
    <div className="space-y-4">
      <PageHeader eyebrow="Administrator" title="Users & roles" description="Grant volunteer or administrator access with the least privilege needed. You can't change your own role." />
      <Notice>Roles are stored server-side and checked by the database on every action. Signup details can never grant a role.</Notice>
      <form method="get" className="surface flex gap-2 p-3" role="search">
        <label htmlFor="user-q" className="sr-only">
          Search by name or exact email
        </label>
        <Input id="user-q" name="q" defaultValue={q} placeholder="Name or exact email" />
        <Button type="submit">Search</Button>
      </form>
      {users.length === 0 ? (
        <EmptyState icon={Users} title="No users found" />
      ) : (
        <ul className="space-y-3">
          {users.map((u) => {
            const role = roles.get(u.id);
            const activeRole = role?.is_active ? role : null;
            return (
              <li key={u.id} className="surface space-y-3 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <Link href={`/admin/donors/${u.id}`} className="font-semibold text-navy hover:underline">
                      {u.full_name}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {u.is_donor ? "Donor" : "Member"} · joined {formatDate(u.created_at)}
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    {activeRole ? <Pill tone="info">{activeRole.role}</Pill> : <Pill>Donor / member</Pill>}
                    {!u.is_active ? <Pill tone="danger">Inactive</Pill> : null}
                  </div>
                </div>
                {u.id === viewer.id ? (
                  <p className="text-xs text-muted-foreground">This is you.</p>
                ) : u.is_active ? (
                  <details>
                    <summary className="flex min-h-10 cursor-pointer items-center text-sm font-semibold text-primary">
                      {activeRole ? "Change role" : "Make volunteer or admin"}
                    </summary>
                    <div className="mt-2">
                      <RoleForm userId={u.id} current={activeRole} />
                    </div>
                  </details>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
      <Pagination page={page} pageSize={PAGE_SIZE} total={count ?? 0} basePath="/admin/users" params={{ q: q || undefined }} />
    </div>
  );
}
