"use client";

import { useActionState, useState } from "react";
import { FormMessage, SubmitButton, selectClass } from "@/components/common/form-parts";
import { grantRole } from "@/actions/admin";
import { initialActionState } from "@/lib/action-result";

export function RoleForm({
  userId,
  current,
}: {
  userId: string;
  current?: { role: "volunteer" | "admin"; can_verify_donations: boolean; can_verify_requests: boolean; can_export: boolean } | null;
}) {
  const [state, action] = useActionState(grantRole, initialActionState);
  const [role, setRole] = useState<"volunteer" | "admin">(current?.role ?? "volunteer");
  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="user_id" value={userId} />
      <div className="grid gap-2 sm:grid-cols-[10rem_1fr]">
        <label className="space-y-1 text-xs font-semibold text-navy">
          Role
          <select name="role" value={role} onChange={(e) => setRole(e.target.value as "volunteer" | "admin")} className={selectClass}>
            <option value="volunteer">Volunteer</option>
            <option value="admin">Administrator</option>
          </select>
        </label>
        <fieldset className="flex flex-wrap items-end gap-x-4 text-sm" disabled={role === "admin"}>
          <legend className="sr-only">Volunteer permissions</legend>
          <label className="flex min-h-11 items-center gap-2">
            <input type="checkbox" name="can_verify_requests" defaultChecked={current?.can_verify_requests ?? true} className="size-5 accent-primary" />
            Verify requests
          </label>
          <label className="flex min-h-11 items-center gap-2">
            <input type="checkbox" name="can_verify_donations" defaultChecked={current?.can_verify_donations ?? false} className="size-5 accent-primary" />
            Verify donations
          </label>
        </fieldset>
      </div>
      {role === "admin" ? <p className="text-xs text-muted-foreground">Administrators have every permission, including role management.</p> : null}
      <FormMessage state={state} />
      <SubmitButton size="sm">{current ? "Update role" : "Grant role"}</SubmitButton>
    </form>
  );
}
