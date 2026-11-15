import type { Metadata } from "next";
import { MemberShell } from "@/components/layout/member-shell";
import { requireViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const viewer = await requireViewer();
  const supabase = await createClient();
  const [{ count }] = await Promise.all([
    supabase.from("notifications").select("id", { count: "exact", head: true }).is("read_at", null),
    supabase.rpc("touch_last_active"),
  ]);
  return (
    <MemberShell viewer={viewer} unread={count ?? 0}>
      {children}
    </MemberShell>
  );
}
