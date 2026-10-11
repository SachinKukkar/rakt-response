import { requireAdmin } from "@/lib/auth";

/** Server-side gate for every admin page (RLS and RPC checks apply too). */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return children;
}
