import type { Metadata } from "next";
import Link from "next/link";
import { HandHeart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ActionForm } from "@/components/common/action-form";
import { EmptyState, PageHeader, SectionHeading } from "@/components/common/page-parts";
import { RequestStatusBadge } from "@/components/common/status-badge";
import { selectClass } from "@/components/common/form-parts";
import { updateAssignment } from "@/actions/volunteer";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime, relativeTime } from "@/lib/format";
import type { RequestStatus } from "@/lib/constants";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("My coordination") };
}

function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  return new Date(new Date(iso).getTime() + 5.5 * 3600_000).toISOString().slice(0, 16);
}

export default async function CoordinationPage() {
  const viewer = await requireStaff();
  const t = await getT();
  const supabase = await createClient();
  const { data } = await supabase
    .from("volunteer_assignments")
    .select("id, request_id, status, follow_up_at, notes, created_at, updated_at")
    .eq("volunteer_id", viewer.id)
    .order("status")
    .order("follow_up_at", { ascending: true, nullsFirst: false })
    .limit(50);
  const assignments = (data ?? []) as Array<{ id: string; request_id: string; status: string; follow_up_at: string | null; notes: string | null; updated_at: string }>;
  const ids = [...new Set(assignments.map((a) => a.request_id))];
  const { data: reqData } = ids.length
    ? await supabase.from("blood_requests").select("id, reference_code, blood_group, hospital_name, status, required_by").in("id", ids)
    : { data: [] };
  const requests = new Map(((reqData ?? []) as Array<{ id: string; reference_code: string; blood_group: string; hospital_name: string; status: RequestStatus; required_by: string }>).map((r) => [r.id, r]));
  const active = assignments.filter((a) => a.status === "active");
  const past = assignments.filter((a) => a.status !== "active");

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Volunteer" title="My coordination" description="Requests you're coordinating, with follow-up reminders." />
      <section aria-labelledby="active-heading">
        <SectionHeading id="active-heading" title="Active" />
        {active.length === 0 ? (
          <EmptyState icon={HandHeart} title="No active assignments" description="Take a request from the queue to start coordinating." />
        ) : (
          <ul className="space-y-3">
            {active.map((a) => {
              const r = requests.get(a.request_id);
              const due = a.follow_up_at && new Date(a.follow_up_at) <= new Date();
              return (
                <li key={a.id} className="surface space-y-3 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Link href={`/volunteer/requests/${a.request_id}`} className="font-bold text-navy hover:underline">
                      {r?.reference_code} · {r?.blood_group} · {r?.hospital_name}
                    </Link>
                    {r ? <RequestStatusBadge status={r.status} /> : null}
                  </div>
                  {r ? <p className="text-sm text-muted-foreground">{t("Needed by {date}", { date: formatDateTime(r.required_by) })}</p> : null}
                  {a.follow_up_at ? (
                    <p className={due ? "text-sm font-semibold text-primary" : "text-sm text-muted-foreground"}>
                      {due ? t("Follow-up due now") : t("Follow up {when}", { when: relativeTime(a.follow_up_at) })}
                    </p>
                  ) : null}
                  <ActionForm action={updateAssignment} fields={{ assignment_id: a.id }} label="Save" size="sm" className="grid gap-2 sm:grid-cols-[1fr_1fr] sm:items-end">
                    <label className="space-y-1 text-xs font-semibold text-navy">
                      {t("Status")}
                      <select name="status" defaultValue="active" className={selectClass}>
                        <option value="active">{t("Still coordinating")}</option>
                        <option value="completed">{t("Completed")}</option>
                        <option value="released">{t("Release to another volunteer")}</option>
                      </select>
                    </label>
                    <label className="space-y-1 text-xs font-semibold text-navy">
                      {t("Next follow-up (India time)")}
                      <Input name="follow_up_at" type="datetime-local" defaultValue={toLocalInput(a.follow_up_at)} />
                    </label>
                    <label className="space-y-1 text-xs font-semibold text-navy sm:col-span-2">
                      {t("Notes for yourself")}
                      <Textarea name="notes" rows={2} defaultValue={a.notes ?? ""} maxLength={1000} />
                    </label>
                  </ActionForm>
                </li>
              );
            })}
          </ul>
        )}
      </section>
      {past.length ? (
        <section aria-labelledby="past-heading">
          <SectionHeading id="past-heading" title="Completed or released" />
          <ul className="space-y-1.5 text-sm">
            {past.map((a) => {
              const r = requests.get(a.request_id);
              return (
                <li key={a.id} className="flex justify-between gap-2 border-b border-border/60 py-2">
                  <Link href={`/volunteer/requests/${a.request_id}`} className="font-medium text-navy hover:underline">
                    {r?.reference_code ?? t("Request")}
                  </Link>
                  <span className="text-muted-foreground">
                    {t(a.status)} · {formatDateTime(a.updated_at)}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
