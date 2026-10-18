import type { Metadata } from "next";
import Link from "next/link";
import { KeyRound, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ActionForm } from "@/components/common/action-form";
import { Notice, PageHeader, SectionHeading } from "@/components/common/page-parts";
import { PreferencesForm } from "@/components/profile/profile-forms";
import { cancelDeletion, requestDeletion } from "@/actions/profile";
import { requireViewer } from "@/lib/auth";
import { getDonorData } from "@/lib/data/member";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/format";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("Privacy & settings") };
}

// The choices a member makes. The older directory and contact switches follow "Hide my number" now, so they aren't listed.
const CONSENT_LABELS: Record<string, string> = {
  emergency_alerts: "Request alerts",
  terms: "Privacy policy & terms",
  hide_number: "Number hidden from patients",
};

export default async function SettingsPage() {
  const t = await getT();
  const viewer = await requireViewer("/settings");
  const supabase = await createClient();
  const [donor, eventsResult] = await Promise.all([
    getDonorData(viewer.id),
    supabase.from("consent_events").select("consent_type, granted, created_at").eq("profile_id", viewer.id).in("consent_type", Object.keys(CONSENT_LABELS)).order("created_at", { ascending: false }).limit(15),
  ]);
  const prefs = donor.preferences;
  const events = (eventsResult.data ?? []) as Array<{ consent_type: string; granted: boolean; created_at: string }>;
  const deletionRequested = Boolean(viewer.profile?.deletion_requested_at);

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="Privacy & settings" description="Choose how patients and Rakt Mitras can reach you. You can change these any time." />

      <section className="surface p-5" aria-labelledby="consent-heading">
        <SectionHeading id="consent-heading" title="Contact & availability" as="h3" />
        <PreferencesForm
          isDonor={Boolean(viewer.profile?.is_donor)}
          defaults={{
            hide_number: prefs?.hide_number ?? false,
            open_to_contact: prefs?.open_to_contact ?? false,
            emergency_alerts: prefs?.emergency_alerts ?? false,
            show_donation_summary: prefs?.show_donation_summary ?? false,
            show_first_name: prefs?.show_first_name ?? false,
            notify_status_updates: prefs?.notify_status_updates ?? true,
            preferred_contact_method:
              prefs?.preferred_contact_method && prefs.preferred_contact_method !== "in_app" ? prefs.preferred_contact_method : "phone",
            max_distance_km: prefs?.max_distance_km ?? null,
          }}
        />
      </section>

      <section className="surface p-5" aria-labelledby="history-heading">
        <SectionHeading id="history-heading" title="History of your choices" description="A record of the choices you've made." as="h3" />
        {events.length ? (
          <ul className="space-y-1.5 text-sm">
            {events.map((e, i) => (
              <li key={i} className="flex justify-between gap-3 border-b border-border/60 py-1.5 last:border-0">
                <span>
                  {CONSENT_LABELS[e.consent_type] ? t(CONSENT_LABELS[e.consent_type]) : e.consent_type}:{" "}
                  <strong>
                    {e.consent_type === "hide_number" ? (e.granted ? t("on") : t("off")) : e.granted ? t("given") : t("withdrawn / not given")}
                  </strong>
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">{formatDateTime(e.created_at)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">{t("No changes recorded yet.")}</p>
        )}
      </section>

      <section className="surface space-y-3 p-5" aria-labelledby="account-heading">
        <SectionHeading id="account-heading" title="Account" as="h3" />
        <p className="text-sm">
          {t("Signed in as")} <strong>{viewer.email}</strong>
        </p>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/forgot-password">
              <KeyRound className="size-4" aria-hidden="true" /> {t("Change password")}
            </Link>
          </Button>
          <form action="/auth/signout" method="post">
            <Button type="submit" variant="ghost">
              <LogOut className="size-4" aria-hidden="true" /> {t("Sign out")}
            </Button>
          </form>
        </div>
      </section>

      <section className="surface space-y-3 border-destructive/20 p-5" aria-labelledby="delete-heading">
        <SectionHeading id="delete-heading" title="Delete my account" as="h3" />
        {deletionRequested ? (
          <>
            <Notice tone="warning">
              {t(
                "Deletion requested on {date}. You've been removed from the directory and contact lists. An administrator will anonymise your account.",
                { date: formatDateTime(viewer.profile?.deletion_requested_at) },
              )}
            </Notice>
            <ActionForm action={cancelDeletion} label="Cancel deletion request" variant="outline" />
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              {t(
                "We'll immediately remove you from the donor directory and contact lists, then an administrator anonymises your profile, contact details, location and stories. Aggregated, non-identifying donation counts may remain.",
              )}
            </p>
            <ActionForm
              action={requestDeletion}
              label="Request account deletion"
              variant="destructive"
              confirmText="Request deletion of your Rakt Response account?"
            >
              <label htmlFor="reason" className="block text-sm font-semibold text-navy">
                {t("Reason (optional)")}
              </label>
              <Input id="reason" name="reason" maxLength={300} />
              <label htmlFor="confirm" className="block text-sm font-semibold text-navy">
                {t("Type DELETE to confirm")}
              </label>
              <Input id="confirm" name="confirm" autoComplete="off" required />
            </ActionForm>
          </>
        )}
      </section>
    </div>
  );
}
