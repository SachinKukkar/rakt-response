import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ActionForm } from "@/components/common/action-form";
import { BloodGroupChip } from "@/components/common/blood-group-chip";
import { KeyValue, Notice, PageHeader, SectionHeading } from "@/components/common/page-parts";
import { Pill, ProfileVerificationBadge, VerificationBadge } from "@/components/common/status-badge";
import { selectClass } from "@/components/common/form-parts";
import { addInternalNote } from "@/actions/volunteer";
import { processDeletion, resolveBloodGroupChange, setProfileActive, verifyProfile } from "@/actions/admin";
import { requireAdmin } from "@/lib/auth";
import { getDonationRecords, getDonorData } from "@/lib/data/member";
import { displayNames } from "@/lib/data/staff";
import { createClient } from "@/lib/supabase/server";
import { CONTACT_METHOD_LABELS, DONATION_TYPE_LABELS, PROFILE_VERIFICATION_LABELS, type ProfileVerification } from "@/lib/constants";
import { formatDate, formatDateTime } from "@/lib/format";
import { formatPhone } from "@/lib/phone";
import { uuidSchema } from "@/lib/validation/common";
import type { ProfileRow, StaffRoleRow } from "@/lib/types";

export const metadata: Metadata = { title: "Donor record" };

export default async function AdminDonorPage({ params }: PageProps<"/admin/donors/[id]">) {
  const viewer = await requireAdmin();
  const { id } = await params;
  if (!uuidSchema.safeParse(id).success) notFound();
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
  const profile = data as ProfileRow | null;
  if (!profile) notFound();
  const [donor, records, notesResult, consentResult, roleResult] = await Promise.all([
    getDonorData(id),
    getDonationRecords(id, 50),
    supabase.from("internal_notes").select("id, author_id, body, created_at").eq("subject_type", "profile").eq("subject_id", id).order("created_at", { ascending: false }),
    supabase.from("consent_events").select("consent_type, granted, created_at").eq("profile_id", id).order("created_at", { ascending: false }).limit(10),
    supabase.from("staff_roles").select("*").eq("user_id", id).maybeSingle(),
  ]);
  const notes = (notesResult.data ?? []) as Array<{ id: string; author_id: string; body: string; created_at: string }>;
  const consents = (consentResult.data ?? []) as Array<{ consent_type: string; granted: boolean; created_at: string }>;
  const role = roleResult.data as StaffRoleRow | null;
  const names = await displayNames(notes.map((n) => n.author_id));
  const self = id === viewer.id;

  return (
    <div className="space-y-6">
      <PageHeader backHref="/admin/donors" backLabel="Donors" eyebrow="Donor record" title={profile.full_name} />
      <section className="surface flex flex-wrap items-center gap-4 p-4">
        {profile.blood_group ? <BloodGroupChip group={profile.blood_group} size="lg" /> : null}
        <div className="flex-1 space-y-1">
          <div className="flex flex-wrap gap-1.5">
            <ProfileVerificationBadge status={profile.verification_status} />
            {profile.blood_group_verified ? <Pill tone="success">Blood group verified</Pill> : <Pill>Blood group self-declared</Pill>}
            {role?.is_active ? <Pill tone="info">{role.role}</Pill> : null}
            {!profile.is_active ? <Pill tone="danger">Inactive</Pill> : null}
          </div>
          <p className="text-sm text-muted-foreground">
            {profile.display_name ? `Display name “${profile.display_name}” · ` : ""}Joined {formatDate(profile.created_at)} · active {formatDate(profile.last_active_at)}
          </p>
        </div>
      </section>

      {profile.deletion_requested_at && profile.is_active ? (
        <Notice tone="warning" title={`Deletion requested ${formatDateTime(profile.deletion_requested_at)}`}>
          Process it below. The member has already been removed from discovery.
        </Notice>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="surface p-4" aria-labelledby="contact-heading">
          <SectionHeading id="contact-heading" title="Contact & area (private)" as="h3" />
          <dl>
            <KeyValue label="Email">{donor.contacts?.email ?? "—"}</KeyValue>
            <KeyValue label="Mobile">{donor.contacts?.phone ? formatPhone(donor.contacts.phone) : "—"}</KeyValue>
            <KeyValue label="Preferred">{donor.preferences ? CONTACT_METHOD_LABELS[donor.preferences.preferred_contact_method] : "—"}</KeyValue>
            <KeyValue label="Area">{donor.location ? `${donor.location.locality ? `${donor.location.locality}, ` : ""}${donor.location.city}, ${donor.location.district}, ${donor.location.state}` : "—"}</KeyValue>
            <KeyValue label="PIN">{donor.location?.pincode ?? "—"}</KeyValue>
            <KeyValue label="Age declaration">{profile.age_confirmed ? "Confirmed 18–65" : "Not confirmed"}</KeyValue>
          </dl>
        </section>
        <section className="surface p-4" aria-labelledby="consent-heading">
          <SectionHeading id="consent-heading" title="Consent" as="h3" />
          <dl>
            <KeyValue label="Directory">{donor.preferences?.directory_visible ? "Visible" : "Hidden"}</KeyValue>
            <KeyValue label="Contact consent">{donor.preferences?.contact_consent ? "Given" : "Not given"}</KeyValue>
            <KeyValue label="Open to contact">{donor.preferences?.open_to_contact ? "Yes" : "No"}</KeyValue>
            <KeyValue label="Alerts">{donor.preferences?.emergency_alerts ? "On" : "Off"}</KeyValue>
          </dl>
          <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
            {consents.map((c, i) => (
              <li key={i}>
                {formatDateTime(c.created_at)} — {c.consent_type}: {c.granted ? "given" : "withdrawn"}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {!self ? (
        <section className="surface space-y-4 p-4" aria-labelledby="verify-heading">
          <SectionHeading id="verify-heading" title="Verification" description="Confirms identity details with proportionate evidence. It is not a medical eligibility decision." as="h3" />
          <ActionForm action={verifyProfile} fields={{ profile_id: profile.id }} label="Save verification" className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-sm font-semibold text-navy">
              Profile status
              <select name="status" defaultValue={profile.verification_status} className={selectClass}>
                {(Object.keys(PROFILE_VERIFICATION_LABELS) as ProfileVerification[]).map((s) => (
                  <option key={s} value={s}>
                    {PROFILE_VERIFICATION_LABELS[s]}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex min-h-11 items-center gap-3 self-end text-sm font-medium">
              <input type="hidden" name="blood_group_verified" value="false" />
              <input type="checkbox" name="blood_group_verified" value="true" defaultChecked={profile.blood_group_verified} className="size-5 accent-primary" />
              Blood group confirmed from a reliable document
            </label>
            <label className="space-y-1 text-sm font-semibold text-navy sm:col-span-2">
              Internal note (evidence checked)
              <Input name="note" maxLength={500} />
            </label>
          </ActionForm>
          {profile.requested_blood_group ? (
            <div className="rounded-xl bg-warning-soft p-3">
              <p className="mb-2 text-sm">
                Requested correction: <strong>{profile.blood_group}</strong> → <strong>{profile.requested_blood_group}</strong>
              </p>
              <div className="flex flex-wrap gap-2">
                <ActionForm action={resolveBloodGroupChange} fields={{ profile_id: profile.id, approve: "true" }} label="Approve correction" size="sm" />
                <ActionForm action={resolveBloodGroupChange} fields={{ profile_id: profile.id, approve: "false" }} label="Decline" size="sm" variant="outline" />
              </div>
            </div>
          ) : null}
        </section>
      ) : (
        <Notice>You can&apos;t verify or deactivate your own account.</Notice>
      )}

      <section className="surface p-4" aria-labelledby="records-heading">
        <SectionHeading id="records-heading" title="Donation records" description="Verify from the donation queue." as="h3" />
        {records.length ? (
          <ul className="space-y-1.5 text-sm">
            {records.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 py-2 last:border-0">
                <span>
                  {DONATION_TYPE_LABELS[r.donation_type]} · {formatDate(r.donation_date)} · {r.centre_name}
                </span>
                <VerificationBadge status={r.verification_status} source={r.record_source} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No records.</p>
        )}
      </section>

      <section className="surface space-y-3 p-4" aria-labelledby="notes-heading">
        <SectionHeading id="notes-heading" title="Internal notes" as="h3" />
        <ActionForm action={addInternalNote} fields={{ subject_type: "profile", subject_id: profile.id }} label="Add note" size="sm" variant="outline">
          <Textarea name="body" rows={2} maxLength={2000} required aria-label="Note" />
        </ActionForm>
        <ul className="space-y-2 text-sm">
          {notes.map((n) => (
            <li key={n.id} className="rounded-xl bg-muted p-3">
              <p className="whitespace-pre-line">{n.body}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {names.get(n.author_id) ?? "Admin"} · {formatDateTime(n.created_at)}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {!self ? (
        <section className="surface space-y-4 border-destructive/20 p-4" aria-labelledby="account-heading">
          <SectionHeading id="account-heading" title="Account status" as="h3" />
          <ActionForm
            action={setProfileActive}
            fields={{ profile_id: profile.id, active: profile.is_active ? "false" : "true" }}
            label={profile.is_active ? "Deactivate account" : "Reactivate account"}
            variant={profile.is_active ? "destructive" : "outline"}
            confirmText={profile.is_active ? "Deactivate this account? It will be hidden from the directory." : undefined}
          >
            <Input name="reason" placeholder="Reason (recorded internally)" maxLength={300} aria-label="Reason" />
          </ActionForm>
          {profile.is_active ? (
            <details className="rounded-xl border p-3">
              <summary className="flex min-h-10 cursor-pointer items-center text-sm font-semibold text-destructive">Process deletion / anonymise</summary>
              <ActionForm action={processDeletion} fields={{ profile_id: profile.id }} label="Anonymise account" variant="destructive" className="mt-3">
                <p className="text-sm text-muted-foreground">
                  Removes name, contact details, location, photos and story content; withdraws published stories; keeps anonymous donation
                  counts. With the service role configured, sign-in is blocked too.
                </p>
                <label className="flex min-h-11 items-center gap-3 text-sm">
                  <input type="checkbox" name="hard_delete" className="size-5 accent-primary" /> Permanently delete the login and all records instead
                </label>
                <label className="block space-y-1 text-sm font-semibold text-navy">
                  Type ANONYMISE to confirm
                  <Input name="confirm" autoComplete="off" required />
                </label>
              </ActionForm>
            </details>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
