import type { Metadata } from "next";
import { Input } from "@/components/ui/input";
import { ActionForm } from "@/components/common/action-form";
import { Notice, PageHeader, SectionHeading } from "@/components/common/page-parts";
import { runRetention, updateSettings } from "@/actions/admin";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("Platform settings") };
}

const NUMBER_FIELDS: Array<{ key: string; label: string; min: number; max: number; hint?: string }> = [
  { key: "whole_blood_interval_days", label: "Whole blood interval used for the informational estimate (days)", min: 56, max: 365, hint: "Shown to donors as an estimate only." },
  { key: "anon_request_daily_limit", label: "Requests per anonymous connection per day", min: 1, max: 50 },
  { key: "member_request_daily_limit", label: "Requests per member per day", min: 1, max: 50 },
  { key: "contact_reveal_hourly_limit", label: "Contact views per volunteer per hour", min: 1, max: 200 },
  { key: "contact_request_hourly_limit", label: "Contact requests per volunteer per hour", min: 1, max: 200 },
  { key: "request_alert_max_donors", label: "Max donors alerted per verified request", min: 0, max: 200 },
  { key: "request_expiry_grace_hours", label: "Hours after the needed time before a request expires", min: 1, max: 168 },
  { key: "story_daily_limit", label: "Stories per member per day", min: 1, max: 20 },
];

export default async function AdminSettingsPage() {
  await requireAdmin();
  const t = await getT();
  const supabase = await createClient();
  const { data } = await supabase.from("platform_settings").select("key, value");
  const values = new Map(((data ?? []) as Array<{ key: string; value: unknown }>).map((r) => [r.key, r.value]));
  const text = (k: string) => (typeof values.get(k) === "string" ? (values.get(k) as string) : "");
  const num = (k: string) => (typeof values.get(k) === "number" ? (values.get(k) as number) : "");

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader eyebrow="Administrator" title="Platform settings" description="Changes are audited." />
      <section className="surface p-5" aria-labelledby="org-heading">
        <ActionForm action={updateSettings} label="Save settings" className="space-y-4">
          <SectionHeading id="org-heading" title="Public contact details" as="h3" />
          <label className="block space-y-1 text-sm font-semibold text-navy">
            {t("Contact email")}
            <Input name="org.contact_email" type="email" defaultValue={text("org.contact_email")} />
          </label>
          <label className="block space-y-1 text-sm font-semibold text-navy">
            {t("Helpline number")}
            <Input name="org.contact_phone" type="tel" defaultValue={text("org.contact_phone")} />
          </label>
          <label className="block space-y-1 text-sm font-semibold text-navy">
            {t("WhatsApp number")}
            <Input name="org.whatsapp" type="tel" defaultValue={text("org.whatsapp")} />
          </label>
          <label className="block space-y-1 text-sm font-semibold text-navy">
            {t("Service area")}
            <Input name="org.service_area" defaultValue={text("org.service_area")} placeholder={t("e.g. Pune and Pimpri-Chinchwad")} />
          </label>
          <label className="flex min-h-11 items-center gap-3 text-sm font-medium">
            <input type="checkbox" name="registration_open" defaultChecked={values.get("registration_open") !== false} className="size-5 accent-primary" />
            {t("Accept new registrations")}
          </label>
          <SectionHeading title="Limits & coordination" as="h3" className="pt-2" />
          {NUMBER_FIELDS.map((f) => (
            <label key={f.key} className="block space-y-1 text-sm font-semibold text-navy">
              {t(f.label)}
              <Input name={f.key} type="number" min={f.min} max={f.max} required defaultValue={num(f.key)} />
              {f.hint ? <span className="block text-xs font-normal text-muted-foreground">{t(f.hint)}</span> : null}
            </label>
          ))}
        </ActionForm>
      </section>
      <section className="surface space-y-3 p-5" aria-labelledby="retention-heading">
        <SectionHeading id="retention-heading" title="Data retention" as="h3" />
        <Notice>
          {t("Removes requester phone numbers, emails and notes from requests closed more than 90 days ago. Schedule it with pg_cron for automatic runs (see docs/OPERATIONS.md).")}
        </Notice>
        <ActionForm action={runRetention} label="Run retention clean-up now" variant="outline" confirmText="Remove requester contact details from requests closed over 90 days ago?" />
      </section>
    </div>
  );
}
