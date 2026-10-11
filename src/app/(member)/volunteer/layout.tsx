import { requireStaff } from "@/lib/auth";

/** Server-side gate for every volunteer page (RLS and RPC checks apply too). */
export default async function VolunteerLayout({ children }: { children: React.ReactNode }) {
  await requireStaff();
  return children;
}
