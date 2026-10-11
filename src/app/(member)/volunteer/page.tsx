import type { Metadata } from "next";
import Link from "next/link";
import { AlarmClock, ClipboardCheck, Droplet, HandHeart, ShieldAlert, Siren, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActionForm } from "@/components/common/action-form";
import { EmptyState, PageHeader, SectionHeading, StatCard } from "@/components/common/page-parts";
import { RequestCard } from "@/components/requests/request-card";
import { runCoordinationHousekeeping } from "@/actions/volunteer";
import { requireStaff } from "@/lib/auth";
import { displayNames } from "@/lib/data/staff";
import { createClient } from "@/lib/supabase/server";
import { RESPONSE_LABELS, type ResponseStatus } from "@/lib/constants";
import { formatDateTime, formatNumber, relativeTime } from "@/lib/format";
import { getT } from "@/i18n/server";
import type { BloodRequestRow, RequestEventRow } from "@/lib/types";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("Volunteer") };
}

interface Overview {
  awaiting_verification: number;
  urgent_awaiting_verification: number;
  active_requests: number;
  my_assignments: number;
  follow_ups_due: number;
  interested_responses_7d: number;
  pending_donation_records: number;
}

const REQUEST_COLUMNS = "id, reference_code, blood_group, request_type, units_needed, hospital_name, city, district, required_by, urgency, status, created_at";

export default async function VolunteerOverviewPage() {
  const viewer = await requireStaff();
  const t = await getT();
  const supabase = await createClient();
  // Housekeeping is cheap and idempotent; running it here avoids needing a scheduler.
  await Promise.all([supabase.rpc("expire_stale_requests"), supabase.rpc("generate_follow_up_reminders")]);

  const [overviewResult, urgentResult, assignmentsResult, responsesResult, eventsResult] = await Promise.all([
    supabase.rpc("get_volunteer_overview"),
    supabase
      .from("blood_requests")
      .select(REQUEST_COLUMNS)
      .in("status", ["submitted", "under_verification"])
      .order("urgency", { ascending: false })
      .order("required_by", { ascending: true })
      .limit(4),
    supabase
      .from("volunteer_assignments")
      .select("id, request_id, follow_up_at, status")
      .eq("volunteer_id", viewer.id)
      .eq("status", "active")
      .order("follow_up_at", { ascending: true, nullsFirst: false })
      .limit(5),
    supabase
      .from("request_responses")
      .select("request_id, donor_id, response, responded_at")
      .eq("response", "interested")
      .order("responded_at", { ascending: false })
      .limit(5),
    supabase.from("request_events").select("id, request_id, actor_id, event_type, from_status, to_status, note, created_at").order("created_at", { ascending: false }).limit(8),
  ]);
  const overview = (overviewResult.data ?? {}) as Partial<Overview>;
  const urgent = (urgentResult.data ?? []) as BloodRequestRow[];
  const assignments = (assignmentsResult.data ?? []) as Array<{ id: string; request_id: string; follow_up_at: string | null }>;
  const responses = (responsesResult.data ?? []) as Array<{ request_id: string; donor_id: string; response: ResponseStatus; responded_at: string | null }>;
  const events = (eventsResult.data ?? []) as RequestEventRow[];
  const requestIds = [...new Set([...assignments.map((a) => a.request_id), ...responses.map((r) => r.request_id), ...events.map((e) => e.request_id)])];
  const { data: refs } = requestIds.length
    ? await supabase.from("blood_requests").select("id, reference_code, blood_group, hospital_name").in("id", requestIds)
    : { data: [] };
  const refMap = new Map(((refs ?? []) as Array<{ id: string; reference_code: string; blood_group: string; hospital_name: string }>).map((r) => [r.id, r]));
  const names = await displayNames([...responses.map((r) => r.donor_id), ...events.map((e) => e.actor_id)]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Volunteer"
        title="Coordination overview"
        description="Verify requests, coordinate with consenting donors and follow up."
        actions={
          <Button asChild variant="outline">
            <Link href="/volunteer/donors">
              <Users className="size-4" aria-hidden="true" /> {t("Donor directory")}
            </Link>
          </Button>
        }
      />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label={t("Summary")}>
        <StatCard label="Awaiting verification" value={formatNumber(overview.awaiting_verification)} icon={ClipboardCheck} tone="brand" />
        <StatCard label="Urgent, unverified" value={formatNumber(overview.urgent_awaiting_verification)} icon={Siren} />
        <StatCard label="Active requests" value={formatNumber(overview.active_requests)} icon={HandHeart} />
        <StatCard label="Follow-ups due (mine)" value={formatNumber(overview.follow_ups_due)} icon={AlarmClock} />
        <StatCard label="My assignments" value={formatNumber(overview.my_assignments)} icon={ShieldAlert} />
        <StatCard label="Donors interested (7 days)" value={formatNumber(overview.interested_responses_7d)} icon={Users} />
        <StatCard label="Donation records to review" value={formatNumber(overview.pending_donation_records)} icon={Droplet} />
      </section>

      <section aria-labelledby="urgent-heading">
        <SectionHeading
          id="urgent-heading"
          title="Waiting for verification"
          action={
            <Link href="/volunteer/requests?tab=verify" className="shrink-0 text-sm font-semibold text-primary hover:underline">
              {t("All")}
            </Link>
          }
        />
        {urgent.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {urgent.map((r) => (
              <RequestCard key={r.id} request={r} href={`/volunteer/requests/${r.id}`} />
            ))}
          </div>
        ) : (
          <EmptyState icon={ClipboardCheck} title="Nothing waiting for verification" />
        )}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="surface p-4" aria-labelledby="mine-heading">
          <SectionHeading
            id="mine-heading"
            title="My assignments"
            as="h3"
            action={
              <Link href="/volunteer/coordination" className="text-sm font-semibold text-primary hover:underline">
                {t("Manage")}
              </Link>
            }
          />
          {assignments.length ? (
            <ul className="space-y-2 text-sm">
              {assignments.map((a) => {
                const ref = refMap.get(a.request_id);
                const due = a.follow_up_at && new Date(a.follow_up_at) <= new Date();
                return (
                  <li key={a.id}>
                    <Link href={`/volunteer/requests/${a.request_id}`} className="flex min-h-11 items-center justify-between gap-2 rounded-xl px-2 hover:bg-muted">
                      <span className="min-w-0 truncate">
                        <strong className="text-navy">{ref?.reference_code}</strong> · {ref?.blood_group} · {ref?.hospital_name}
                      </span>
                      {a.follow_up_at ? (
                        <span className={due ? "shrink-0 text-xs font-semibold text-primary" : "shrink-0 text-xs text-muted-foreground"}>
                          {due ? t("Follow up now") : t("Follow up {when}", { when: relativeTime(a.follow_up_at) })}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">{t("You aren't coordinating any requests. Take one from the queue.")}</p>
          )}
        </section>

        <section className="surface p-4" aria-labelledby="responses-heading">
          <SectionHeading id="responses-heading" title="Recent donor interest" as="h3" />
          {responses.length ? (
            <ul className="space-y-2 text-sm">
              {responses.map((r) => (
                <li key={`${r.request_id}-${r.donor_id}`}>
                  <Link href={`/volunteer/requests/${r.request_id}`} className="flex min-h-11 items-center justify-between gap-2 rounded-xl px-2 hover:bg-muted">
                    <span className="min-w-0 truncate">
                      {names.get(r.donor_id) ?? t("Donor")} — {t(RESPONSE_LABELS[r.response])} · {refMap.get(r.request_id)?.reference_code}
                    </span>
                    {r.responded_at ? <span className="shrink-0 text-xs text-muted-foreground">{relativeTime(r.responded_at)}</span> : null}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">{t("No recent responses.")}</p>
          )}
        </section>
      </div>

      <section className="surface p-4" aria-labelledby="activity-heading">
        <SectionHeading id="activity-heading" title="Recent coordination activity" as="h3" />
        {events.length ? (
          <ul className="space-y-1.5 text-sm">
            {events.map((e) => (
              <li key={e.id} className="flex flex-wrap justify-between gap-x-3 border-b border-border/60 py-1.5 last:border-0">
                <span>
                  <Link href={`/volunteer/requests/${e.request_id}`} className="font-semibold text-navy hover:underline">
                    {refMap.get(e.request_id)?.reference_code ?? t("Request")}
                  </Link>{" "}
                  · {t(e.event_type.replaceAll("_", " "))}
                  {e.to_status ? ` → ${t(e.to_status.replaceAll("_", " "))}` : ""}
                  {e.actor_id ? ` · ${names.get(e.actor_id) ?? t("someone")}` : ""}
                </span>
                <span className="text-xs text-muted-foreground">{formatDateTime(e.created_at)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">{t("No activity yet.")}</p>
        )}
      </section>

      <ActionForm action={runCoordinationHousekeeping} label="Run expiry & reminders now" variant="ghost" size="sm" />
    </div>
  );
}
