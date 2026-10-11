import type { Metadata } from "next";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ActionForm } from "@/components/common/action-form";
import { Notice, PageHeader, SectionHeading } from "@/components/common/page-parts";
import { Pill } from "@/components/common/status-badge";
import { selectClass } from "@/components/common/form-parts";
import { deleteCamp, deleteMetricSource, saveCamp, saveMetricSource } from "@/actions/admin";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { INDIAN_STATES } from "@/lib/constants";
import { formatDate, formatNumber, todayInIndia } from "@/lib/format";

export const metadata: Metadata = { title: "Camps & impact data" };

interface Camp {
  id: string;
  name: string;
  camp_date: string;
  state: string | null;
  district: string;
  city: string;
  venue_area: string | null;
  organizing_partners: string | null;
  partners_confirmed: boolean;
  status: "planned" | "completed" | "cancelled";
  registrations_count: number | null;
  verified_donor_count: number | null;
  verified_units_collected: number | null;
  volunteer_count: number | null;
  highlights: string | null;
  learnings: string | null;
  data_source: string | null;
  data_verified_at: string | null;
  is_public: boolean;
}

function CampFields({ camp }: { camp?: Camp }) {
  const field = "space-y-1 text-sm font-semibold text-navy";
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {camp ? <input type="hidden" name="camp_id" value={camp.id} /> : null}
      <label className={`${field} sm:col-span-2`}>
        Camp name
        <Input name="name" defaultValue={camp?.name} required maxLength={150} />
      </label>
      <label className={field}>
        Date
        <Input name="camp_date" type="date" defaultValue={camp?.camp_date} required />
      </label>
      <label className={field}>
        Status
        <select name="status" defaultValue={camp?.status ?? "planned"} className={selectClass}>
          <option value="planned">Planned</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </label>
      <label className={field}>
        City
        <Input name="city" defaultValue={camp?.city} required />
      </label>
      <label className={field}>
        District
        <Input name="district" defaultValue={camp?.district} required />
      </label>
      <label className={field}>
        State
        <select name="state" defaultValue={camp?.state ?? ""} className={selectClass}>
          <option value="">—</option>
          {INDIAN_STATES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>
      <label className={field}>
        Broad venue area
        <Input name="venue_area" defaultValue={camp?.venue_area ?? ""} />
      </label>
      <label className={`${field} sm:col-span-2`}>
        Organising partners
        <Input name="organizing_partners" defaultValue={camp?.organizing_partners ?? ""} />
      </label>
      <label className="flex min-h-11 items-center gap-2 text-sm sm:col-span-2">
        <input type="checkbox" name="partners_confirmed" defaultChecked={camp?.partners_confirmed} className="size-5 accent-primary" /> Partners confirmed they may be named publicly
      </label>
      <label className={field}>
        Registrations (not donations)
        <Input name="registrations_count" type="number" min={0} defaultValue={camp?.registrations_count ?? ""} />
      </label>
      <label className={field}>
        Volunteers
        <Input name="volunteer_count" type="number" min={0} defaultValue={camp?.volunteer_count ?? ""} />
      </label>
      <label className={field}>
        Verified donors
        <Input name="verified_donor_count" type="number" min={0} defaultValue={camp?.verified_donor_count ?? ""} />
      </label>
      <label className={field}>
        Verified units collected
        <Input name="verified_units_collected" type="number" min={0} defaultValue={camp?.verified_units_collected ?? ""} />
      </label>
      <label className={`${field} sm:col-span-2`}>
        Source of verified figures (required if any are entered)
        <Input name="data_source" defaultValue={camp?.data_source ?? ""} placeholder="e.g. Collection sheet signed by the blood centre" />
      </label>
      <label className={`${field} sm:col-span-2`}>
        Highlights
        <Textarea name="highlights" defaultValue={camp?.highlights ?? ""} rows={2} />
      </label>
      <label className={`${field} sm:col-span-2`}>
        Learnings & next steps
        <Textarea name="learnings" defaultValue={camp?.learnings ?? ""} rows={2} />
      </label>
      <label className="flex min-h-11 items-center gap-2 text-sm sm:col-span-2">
        <input type="checkbox" name="is_public" defaultChecked={camp?.is_public} className="size-5 accent-primary" /> Show on Our Impact
      </label>
    </div>
  );
}

export default async function AdminCampsPage() {
  await requireAdmin();
  const supabase = await createClient();
  const [campsResult, metricsResult] = await Promise.all([
    supabase.from("camp_records").select("*").order("camp_date", { ascending: false }).limit(100),
    supabase.from("impact_metrics_sources").select("*").order("verified_at", { ascending: false }),
  ]);
  const camps = (campsResult.data ?? []) as Camp[];
  const metrics = (metricsResult.data ?? []) as Array<{ id: string; label: string; value: number; unit: string | null; source_description: string; verified_at: string; is_public: boolean; period_start: string | null; period_end: string | null }>;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Administrator" title="Camps & impact data" description="Record camps and documented figures. Never count registrations or attendance as donations." />

      <section className="surface p-4" aria-labelledby="new-camp">
        <SectionHeading id="new-camp" title="Add a camp" as="h3" />
        <ActionForm action={saveCamp} label="Add camp" className="space-y-3">
          <CampFields />
        </ActionForm>
      </section>

      <section aria-labelledby="camps-heading">
        <SectionHeading id="camps-heading" title="Camps" />
        {camps.length ? (
          <ul className="space-y-3">
            {camps.map((c) => (
              <li key={c.id} className="surface p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-navy">{c.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(c.camp_date)} · {c.city}, {c.district}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <Pill tone={c.status === "completed" ? "success" : "neutral"}>{c.status}</Pill>
                    {c.is_public ? <Pill tone="info">Public</Pill> : <Pill>Private</Pill>}
                    {c.data_verified_at ? <Pill tone="success">Figures verified {formatDate(c.data_verified_at)}</Pill> : null}
                  </div>
                </div>
                <details className="mt-2">
                  <summary className="flex min-h-10 cursor-pointer items-center text-sm font-semibold text-primary">Edit</summary>
                  <ActionForm action={saveCamp} label="Save camp" className="mt-2 space-y-3">
                    <CampFields camp={c} />
                  </ActionForm>
                  <ActionForm action={deleteCamp} fields={{ camp_id: c.id }} label="Delete camp" variant="ghost" size="sm" confirmText="Delete this camp record?" className="mt-2" />
                </details>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No camps recorded yet.</p>
        )}
      </section>

      <section className="surface space-y-4 p-4" aria-labelledby="metrics-heading">
        <SectionHeading id="metrics-heading" title="Documented figures" description="For impact figures that cannot be derived from platform records. Each needs a source and verification date." as="h3" />
        <Notice>Shown on Our Impact with an &ldquo;Impact Data Verified&rdquo; label. Only add figures you can document.</Notice>
        <ActionForm action={saveMetricSource} label="Add figure" className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-sm font-semibold text-navy">
            Label
            <Input name="label" required maxLength={120} placeholder="Units collected with partner blood centre" />
          </label>
          <label className="space-y-1 text-sm font-semibold text-navy">
            Key
            <Input name="metric_key" required pattern="[a-z0-9_]{3,60}" placeholder="partner_units_2026" />
          </label>
          <label className="space-y-1 text-sm font-semibold text-navy">
            Value
            <Input name="value" type="number" min={0} step="any" required />
          </label>
          <label className="space-y-1 text-sm font-semibold text-navy">
            Unit
            <Input name="unit" maxLength={30} placeholder="units" />
          </label>
          <label className="space-y-1 text-sm font-semibold text-navy">
            Period start
            <Input name="period_start" type="date" />
          </label>
          <label className="space-y-1 text-sm font-semibold text-navy">
            Period end
            <Input name="period_end" type="date" />
          </label>
          <label className="space-y-1 text-sm font-semibold text-navy sm:col-span-2">
            Source
            <Input name="source_description" required maxLength={500} placeholder="Annual letter from partner blood centre, ref. …" />
          </label>
          <label className="space-y-1 text-sm font-semibold text-navy">
            Verified on
            <Input name="verified_at" type="date" defaultValue={todayInIndia()} required />
          </label>
          <label className="flex min-h-11 items-center gap-2 self-end text-sm">
            <input type="checkbox" name="is_public" className="size-5 accent-primary" /> Publish on Our Impact
          </label>
        </ActionForm>
        {metrics.length ? (
          <ul className="space-y-2 text-sm">
            {metrics.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-muted p-3">
                <span>
                  <strong className="text-navy">
                    {formatNumber(Number(m.value))} {m.unit}
                  </strong>{" "}
                  {m.label} · {m.source_description} · verified {formatDate(m.verified_at)} {m.is_public ? "· public" : "· private"}
                </span>
                <ActionForm action={deleteMetricSource} fields={{ metric_id: m.id }} label="Remove" size="sm" variant="ghost" confirmText="Remove this figure?" />
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  );
}
