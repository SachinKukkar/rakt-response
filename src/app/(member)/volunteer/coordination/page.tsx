import type { Metadata } from "next";
import Link from "next/link";
import { HandHeart, HeartHandshake } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ActionForm } from "@/components/common/action-form";
import { EmptyState, PageHeader, SectionHeading } from "@/components/common/page-parts";
import { RequestStatusBadge } from "@/components/common/status-badge";
import { selectClass } from "@/components/common/form-parts";
import { DonorContactPanel } from "@/components/volunteer/coordination-forms";
import { completeDonationFollowUp, updateAssignment } from "@/actions/volunteer";
import { requireStaff } from "@/lib/auth";
import { displayNames } from "@/lib/data/staff";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatDateTime, relativeTime } from "@/lib/format";
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
  // Donors who gave blood and haven't been followed up yet, for every request (any Rakt Mitra can do it).
  const { data: followUpData } = await supabase
    .from("request_responses")
    .select("request_id, donor_id, donated_on, follow_up_due_at, donation_record_id")
    .eq("outcome", "donated")
    .is("followed_up_at", null)
    .order("follow_up_due_at", { ascending: true })
    .limit(50);
  const followUps = (followUpData ?? []) as Array<{ request_id: string; donor_id: string; donated_on: string | null; follow_up_due_at: string | null; donation_record_id: string | null }>;
  // The last few done, so whoever marks one sees it land.
  const { data: doneData } = await supabase
    .from("request_responses")
    .select("request_id, donor_id, followed_up_at, followed_up_by")
    .eq("outcome", "donated")
    .not("followed_up_at", "is", null)
    .order("followed_up_at", { ascending: false })
    .limit(5);
  const done = (doneData ?? []) as Array<{ request_id: string; donor_id: string; followed_up_at: string; followed_up_by: string | null }>;
  const donorNames = await displayNames([...followUps.map((f) => f.donor_id), ...done.flatMap((d) => [d.donor_id, d.followed_up_by])]);
  const ids = [...new Set([...assignments.map((a) => a.request_id), ...followUps.map((f) => f.request_id), ...done.map((d) => d.request_id)])];
  const { data: reqData } = ids.length
    ? await supabase.from("blood_requests").select("id, reference_code, blood_group, hospital_name, status, required_by").in("id", ids)
    : { data: [] };
  const requests = new Map(((reqData ?? []) as Array<{ id: string; reference_code: string; blood_group: string; hospital_name: string; status: RequestStatus; required_by: string }>).map((r) => [r.id, r]));
  const active = assignments.filter((a) => a.status === "active");
  const past = assignments.filter((a) => a.status !== "active");

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Rakt Mitra" title="My coordination" description="Requests you're coordinating, with follow-up reminders." />
      <section aria-labelledby="after-donation-heading">
        <SectionHeading
          id="after-donation-heading"
          title="Follow up after donation"
          description="Donors who gave blood for a request. Call or message them: thank them and ask how they feel. Then mark it done. Their contact opens for this (logged) even after the request closes."
        />
        {followUps.length === 0 ? (
          <EmptyState icon={HeartHandshake} title="No donors waiting for a follow-up" description="When a donor tells us they gave blood, or you record it, they appear here." />
        ) : (
          <ul className="space-y-3">
            {followUps.map((f) => {
              const r = requests.get(f.request_id);
              return (
                <li key={`${f.request_id}-${f.donor_id}`} className="surface space-y-3 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-bold text-navy">{donorNames.get(f.donor_id) ?? t("Donor")}</p>
                    <Link href={`/volunteer/requests/${f.request_id}`} className="text-sm font-semibold text-primary hover:underline">
                      {r ? `${r.reference_code} · ${r.hospital_name}` : t("Request")}
                    </Link>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {f.donated_on ? t("Donated on {date}", { date: formatDate(f.donated_on) }) : t("Donated")}
                    {" · "}
                    {f.donation_record_id ? t("Reported by the donor") : t("Recorded by a Rakt Mitra")}
                  </p>
                  {r ? (
                    <DonorContactPanel donorId={f.donor_id} requestId={f.request_id} referenceCode={r.reference_code} canReveal canAsk={false} contactRequestStatus={null} />
                  ) : null}
                  <ActionForm
                    action={completeDonationFollowUp}
                    fields={{ request_id: f.request_id, donor_id: f.donor_id }}
                    label="Mark followed up"
                    size="sm"
                    hideAfterSuccess
                  >
                    <label className="block space-y-1 text-xs font-semibold text-navy">
                      <span className="block">{t("Note for the team (optional)")}</span>
                      <Textarea name="note" rows={2} maxLength={500} placeholder={t("e.g. Feeling fine, thanked them.")} />
                    </label>
                  </ActionForm>
                </li>
              );
            })}
          </ul>
        )}
        {done.length ? (
          <div className="mt-4">
            <h3 className="mb-2 text-sm font-bold text-navy">{t("Followed up recently")}</h3>
            <ul className="space-y-1.5 text-sm">
              {done.map((d) => (
                <li key={`${d.request_id}-${d.donor_id}`} className="flex flex-wrap justify-between gap-2 border-b border-border/60 py-2">
                  <span>
                    {donorNames.get(d.donor_id) ?? t("Donor")} · {requests.get(d.request_id)?.reference_code ?? t("Request")}
                  </span>
                  <span className="text-muted-foreground">
                    {t("by {name}, {when}", { name: (d.followed_up_by && donorNames.get(d.followed_up_by)) || t("Rakt Mitra"), when: relativeTime(d.followed_up_at) })}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>
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
                        <option value="released">{t("Release to another Rakt Mitra")}</option>
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
