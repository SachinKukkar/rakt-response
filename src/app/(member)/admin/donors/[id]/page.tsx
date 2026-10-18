import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ActionForm } from "@/components/common/action-form";
import { BloodGroupChip } from "@/components/common/blood-group-chip";
import { KeyValue, Notice, PageHeader, SectionHeading } from "@/components/common/page-parts";
import { Pill, ProfileVerificationBadge, VerificationBadge } from "@/components/common/status-badge";
import { selectClass } from "@/components/common/form-parts";
import { LocationFields } from "@/components/forms/location-pickers";
import { EmailLink, PhoneLink, WhatsAppLink } from "@/components/common/contact-link";
import { deleteDonation } from "@/actions/donations";
import { addInternalNote } from "@/actions/volunteer";
import { adminUpdateDonor, processDeletion, resolveBloodGroupChange, setProfileActive, verifyProfile } from "@/actions/admin";
import { requireAdmin } from "@/lib/auth";
import { getDonationRecords, getDonorData } from "@/lib/data/member";
import { displayNames } from "@/lib/data/staff";
import { createClient } from "@/lib/supabase/server";
import { BLOOD_GROUPS, bloodGroupName, CONTACT_METHOD_LABELS, DONATION_TYPE_LABELS, PROFILE_VERIFICATION_LABELS, type ProfileVerification } from "@/lib/constants";
import { formatDate, formatDateTime } from "@/lib/format";
import { uuidSchema } from "@/lib/validation/common";
import type { ProfileRow, StaffRoleRow } from "@/lib/types";
import { getT } from "@/i18n/server";

// A donor's recorded choices. The directory and contact switches are older; they now follow "Hide my number".
const CHOICE_LABELS: Record<string, string> = {
  hide_number: "Number hidden from patients",
  emergency_alerts: "Request alerts",
  terms: "Privacy policy & terms",
  directory: "Rakt Mitra directory",
  contact: "Direct contact by Rakt Mitras",
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("Donor record") };
}

export default async function AdminDonorPage({ params, searchParams }: PageProps<"/admin/donors/[id]">) {
  const viewer = await requireAdmin();
  const t = await getT();
  const [{ id }, query] = await Promise.all([params, searchParams]);
  if (!uuidSchema.safeParse(id).success) notFound();
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
  const profile = data as ProfileRow | null;
  if (!profile) notFound();
  const [donor, records, notesResult, consentResult, roleResult, photoResult] = await Promise.all([
    getDonorData(id),
    getDonationRecords(id, 50),
    supabase.from("internal_notes").select("id, author_id, body, created_at").eq("subject_type", "profile").eq("subject_id", id).order("created_at", { ascending: false }),
    supabase.from("consent_events").select("consent_type, granted, created_at").eq("profile_id", id).order("created_at", { ascending: false }).limit(10),
    supabase.from("staff_roles").select("*").eq("user_id", id).maybeSingle(),
    // Profile photos are visible to the donor and administrators only.
    profile.photo_path ? supabase.storage.from("profile-photos").createSignedUrl(profile.photo_path, 600) : null,
  ]);
  const photoUrl = photoResult?.data?.signedUrl ?? null;
  const notes = (notesResult.data ?? []) as Array<{ id: string; author_id: string; body: string; created_at: string }>;
  const consents = (consentResult.data ?? []) as Array<{ consent_type: string; granted: boolean; created_at: string }>;
  const role = roleResult.data as StaffRoleRow | null;
  const names = await displayNames(notes.map((n) => n.author_id));
  const self = id === viewer.id;

  return (
    <div className="space-y-6">
      <PageHeader backHref="/admin/donors" backLabel="Donors" eyebrow="Donor record" title={profile.full_name} />
      {query.saved || query.removed ? (
        <p className="flex items-start gap-2 rounded-xl border border-success/25 bg-success-soft px-3.5 py-3 text-sm text-success" role="status">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {query.removed ? t("Record removed.") : t("Changes saved.")}
        </p>
      ) : null}
      <section className="surface flex flex-wrap items-center gap-4 p-4">
        {photoUrl ? (
          <Image src={photoUrl} alt={t("Photo of {name}", { name: profile.full_name })} width={64} height={64} className="size-16 rounded-full object-cover" unoptimized />
        ) : null}
        {profile.blood_group ? <BloodGroupChip group={profile.blood_group} size="lg" /> : null}
        <div className="flex-1 space-y-1">
          <div className="flex flex-wrap gap-1.5">
            <ProfileVerificationBadge status={profile.verification_status} />
            {profile.blood_group_verified ? <Pill tone="success">Blood group verified</Pill> : <Pill>Blood group self-declared</Pill>}
            {role?.is_active ? <Pill tone="info">{role.role}</Pill> : null}
            {!profile.is_active ? <Pill tone="danger">Inactive</Pill> : null}
          </div>
          {profile.bio ? <p className="text-sm italic">“{profile.bio}”</p> : null}
          <p className="text-sm text-muted-foreground">
            {profile.display_name ? t("Display name “{name}” · ", { name: profile.display_name }) : ""}
            {t("Joined {date}", { date: formatDate(profile.created_at) })} · {t("active {date}", { date: formatDate(profile.last_active_at) })}
          </p>
        </div>
      </section>

      {profile.deletion_requested_at && profile.is_active ? (
        <Notice tone="warning" title={t("Deletion requested {time}", { time: formatDateTime(profile.deletion_requested_at) })}>
          Process it below. The member has already been removed from discovery.
        </Notice>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="surface p-4" aria-labelledby="contact-heading">
          <SectionHeading id="contact-heading" title="Contact & area (private)" as="h3" />
          <dl>
            <KeyValue label="Email">{donor.contacts?.email ? <EmailLink email={donor.contacts.email} icon={false} /> : "—"}</KeyValue>
            <KeyValue label="Mobile">{donor.contacts?.phone ? <PhoneLink phone={donor.contacts.phone} icon={false} /> : "—"}</KeyValue>
            {donor.contacts?.whatsapp || donor.contacts?.phone ? (
              <KeyValue label="WhatsApp">
                <WhatsAppLink phone={donor.contacts.whatsapp ?? donor.contacts.phone!} />
              </KeyValue>
            ) : null}
            <KeyValue label="Preferred">{donor.preferences ? CONTACT_METHOD_LABELS[donor.preferences.preferred_contact_method] : "—"}</KeyValue>
            <KeyValue label="Area">{donor.location ? `${donor.location.locality ? `${donor.location.locality}, ` : ""}${donor.location.city}, ${donor.location.district}, ${donor.location.state}` : "—"}</KeyValue>
            <KeyValue label="PIN">{donor.location?.pincode ?? "—"}</KeyValue>
            <KeyValue label="Age declaration">{profile.age_confirmed ? "Confirmed 18–65" : "Not confirmed"}</KeyValue>
          </dl>
        </section>
        <section className="surface p-4" aria-labelledby="consent-heading">
          <SectionHeading id="consent-heading" title="Contact choices" as="h3" />
          <dl>
            <KeyValue label="Hidden from patients">{donor.preferences?.hide_number ? "Yes" : "No"}</KeyValue>
            <KeyValue label="Open to contact">{donor.preferences?.open_to_contact ? "Yes" : "No"}</KeyValue>
            <KeyValue label="Alerts">{donor.preferences?.emergency_alerts ? "On" : "Off"}</KeyValue>
            <KeyValue label="Rakt Mitras">{donor.preferences?.contact_consent ? "Contact directly" : "Ask first"}</KeyValue>
            <KeyValue label="Directory">{donor.preferences?.directory_visible ? "Visible" : "Hidden"}</KeyValue>
          </dl>
          <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
            {consents.map((c, i) => (
              <li key={i}>
                {formatDateTime(c.created_at)} — {CHOICE_LABELS[c.consent_type] ? t(CHOICE_LABELS[c.consent_type]) : c.consent_type}:{" "}
                {c.consent_type === "hide_number" ? (c.granted ? t("on") : t("off")) : c.granted ? t("given") : t("withdrawn")}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <details className="surface p-4">
        <summary className="flex min-h-10 cursor-pointer items-center font-bold text-navy">{t("Edit donor details")}</summary>
        <ActionForm action={adminUpdateDonor} fields={{ profile_id: profile.id }} label="Save details" className="mt-3 grid gap-3 sm:grid-cols-2">
          {(
            [
              ["full_name", "Full name", profile.full_name, 100],
              ["display_name", "Display name", profile.display_name ?? "", 60],
              ["phone", "Mobile", donor.contacts?.phone ?? "", 20],
              ["whatsapp", "WhatsApp", donor.contacts?.whatsapp ?? "", 20],
            ] as const
          ).map(([name, label, value, max]) => (
            <label key={name} className="space-y-1 text-sm font-semibold text-navy">
              {t(label)}
              <Input name={name} defaultValue={value} maxLength={max} required={name === "full_name"} />
            </label>
          ))}
          <label className="space-y-1 text-sm font-semibold text-navy">
            {t("Blood group")}
            <select name="blood_group" defaultValue={profile.blood_group ?? ""} className={selectClass}>
              <option value="">{t("Not known")}</option>
              {BLOOD_GROUPS.map((g) => (
                <option key={g} value={g}>
                  {t(bloodGroupName(g))}
                </option>
              ))}
            </select>
          </label>
          <LocationFields
            className="sm:col-span-2"
            idPrefix="edit-"
            labels={{ city: "City / town" }}
            names={{ state: "state", district: "district", city: "city" }}
            defaults={{ state: donor.location?.state ?? "", district: donor.location?.district ?? "", city: donor.location?.city ?? "" }}
          />
          {(
            [
              ["locality", "Locality", donor.location?.locality ?? "", 120],
              ["pincode", "PIN code", donor.location?.pincode ?? "", 6],
            ] as const
          ).map(([name, label, value, max]) => (
            <label key={name} className="space-y-1 text-sm font-semibold text-navy">
              {t(label)}
              <Input name={name} defaultValue={value} maxLength={max} />
            </label>
          ))}
          <p className="text-xs text-muted-foreground sm:col-span-2">
            {t("Changes are recorded in the audit log. To mark the blood group as document-checked, use Verification below.")}
          </p>
        </ActionForm>
      </details>

      {!self ? (
        <section className="surface space-y-4 p-4" aria-labelledby="verify-heading">
          <SectionHeading id="verify-heading" title="Verification" description="Profiles verify automatically when the donor confirms their email. Use this to put a profile on hold or mark the blood group document-checked. It is not a medical eligibility decision." as="h3" />
          <ActionForm action={verifyProfile} fields={{ profile_id: profile.id }} label="Save verification" className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-sm font-semibold text-navy">
              {t("Profile status")}
              <select name="status" defaultValue={profile.verification_status} className={selectClass}>
                {(Object.keys(PROFILE_VERIFICATION_LABELS) as ProfileVerification[]).map((s) => (
                  <option key={s} value={s}>
                    {t(PROFILE_VERIFICATION_LABELS[s])}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex min-h-11 items-center gap-3 self-end text-sm font-medium">
              <input type="hidden" name="blood_group_verified" value="false" />
              <input type="checkbox" name="blood_group_verified" value="true" defaultChecked={profile.blood_group_verified} className="size-5 accent-primary" />
              {t("Blood group confirmed from a reliable document")}
            </label>
            <label className="space-y-1 text-sm font-semibold text-navy sm:col-span-2">
              {t("Internal note (evidence checked)")}
              <Input name="note" maxLength={500} />
            </label>
          </ActionForm>
          {profile.requested_blood_group ? (
            <div className="rounded-xl bg-warning-soft p-3">
              <p className="mb-2 text-sm">
                {t("Requested correction:")} <strong>{profile.blood_group}</strong> → <strong>{profile.requested_blood_group}</strong>
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
        <SectionHeading id="records-heading" title="Donation records" description="Verify from the donation queue. Edit or delete any record here." as="h3" />
        {records.length ? (
          <ul className="space-y-1.5 text-sm">
            {records.map((r) => (
              <li key={r.id} className="space-y-2 border-b border-border/60 py-2.5 last:border-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span>
                    {t(DONATION_TYPE_LABELS[r.donation_type])} · {formatDate(r.donation_date)} · {r.centre_name}
                  </span>
                  <VerificationBadge status={r.verification_status} source={r.record_source} />
                </div>
                <div className="flex flex-wrap items-start gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/donations/${r.id}/edit?from=${encodeURIComponent(`/admin/donors/${profile.id}`)}`}>
                      <Pencil className="size-3.5" aria-hidden="true" /> {t("Edit")}
                    </Link>
                  </Button>
                  <ActionForm
                    action={deleteDonation}
                    fields={{ record_id: r.id, return_to: `/admin/donors/${profile.id}` }}
                    label="Delete"
                    variant="ghost"
                    size="sm"
                    confirmText="Delete this donation record permanently?"
                    hideAfterSuccess
                  />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">{t("No records.")}</p>
        )}
      </section>

      <section className="surface space-y-3 p-4" aria-labelledby="notes-heading">
        <SectionHeading id="notes-heading" title="Internal notes" as="h3" />
        <ActionForm action={addInternalNote} fields={{ subject_type: "profile", subject_id: profile.id }} label="Add note" size="sm" variant="outline">
          <Textarea name="body" rows={2} maxLength={2000} required aria-label={t("Note")} />
        </ActionForm>
        <ul className="space-y-2 text-sm">
          {notes.map((n) => (
            <li key={n.id} className="rounded-xl bg-muted p-3">
              <p className="whitespace-pre-line">{n.body}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {names.get(n.author_id) ?? t("Admin")} · {formatDateTime(n.created_at)}
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
            <Input name="reason" placeholder={t("Reason (recorded internally)")} maxLength={300} aria-label={t("Reason")} />
          </ActionForm>
          {profile.is_active ? (
            <details className="rounded-xl border p-3">
              <summary className="flex min-h-10 cursor-pointer items-center text-sm font-semibold text-destructive">{t("Process deletion / anonymise")}</summary>
              <ActionForm action={processDeletion} fields={{ profile_id: profile.id }} label="Anonymise account" variant="destructive" className="mt-3">
                <p className="text-sm text-muted-foreground">
                  {t("Removes name, contact details, location, photos and story content; withdraws published stories; keeps anonymous donation counts. With the service role configured, sign-in is blocked too.")}
                </p>
                <label className="flex min-h-11 items-center gap-3 text-sm">
                  <input type="checkbox" name="hard_delete" className="size-5 accent-primary" /> {t("Permanently delete the login and all records instead")}
                </label>
                <label className="block space-y-1 text-sm font-semibold text-navy">
                  {t("Type ANONYMISE to confirm")}
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
