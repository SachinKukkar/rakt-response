"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { fail, success, validationFailure, type ActionResult } from "@/lib/action-result";
import { requireAdmin } from "@/lib/auth";
import { friendlyDbError } from "@/lib/errors";
import { sanitizeImage } from "@/lib/images";
import { normalizePhone } from "@/lib/phone";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { uuidSchema } from "@/lib/validation/common";
import { adminDonorSchema, campSchema, metricSourceSchema, settingsSchema, staffRoleSchema, storyPublicContentSchema } from "@/lib/validation/forms";

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
const bool = (fd: FormData, key: string) => fd.get(key) === "on" || fd.get(key) === "true";
const numOrNull = (fd: FormData, key: string) => (str(fd, key) === "" ? null : Number(str(fd, key)));

// --- Donor profiles ---------------------------------------------------------
export async function verifyProfile(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = uuidSchema.safeParse(fd.get("profile_id"));
  const status = str(fd, "status");
  if (!id.success || !["unverified", "pending", "verified", "rejected"].includes(status)) return fail("Invalid verification.");
  const supabase = await createClient();
  const { error } = await supabase.rpc("verify_profile", {
    p_profile: id.data,
    p_status: status,
    // The form sends a hidden "false" plus the checkbox's "true" when ticked.
    p_blood_group_verified: fd.has("blood_group_verified") ? fd.getAll("blood_group_verified").includes("true") : null,
    p_note: str(fd, "note") || null,
  });
  if (error) return fail(friendlyDbError(error));
  revalidatePath(`/admin/donors/${id.data}`);
  revalidatePath("/admin/donors");
  return success("Verification updated and the donor was notified.");
}

export async function adminUpdateDonor(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const keys = ["profile_id", "full_name", "display_name", "blood_group", "phone", "whatsapp", "state", "district", "city", "locality", "pincode"] as const;
  const parsed = adminDonorSchema.safeParse(Object.fromEntries(keys.map((k) => [k, str(fd, k)])));
  // ActionForm shows one message, so name the first problem directly.
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Please check the details.");
  const v = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: v.full_name,
      display_name: v.display_name || null,
      ...(v.blood_group ? { blood_group: v.blood_group, requested_blood_group: null } : {}),
    })
    .eq("id", v.profile_id);
  if (error) return fail(friendlyDbError(error));
  const { error: contactError } = await supabase
    .from("profile_contacts")
    .update({ phone: normalizePhone(v.phone), whatsapp: normalizePhone(v.whatsapp) })
    .eq("profile_id", v.profile_id);
  if (contactError) return fail(friendlyDbError(contactError));
  if (v.state) {
    const { error: locationError } = await supabase.from("donor_locations").upsert(
      { profile_id: v.profile_id, state: v.state, district: v.district, city: v.city, locality: v.locality || null, pincode: v.pincode || null },
      { onConflict: "profile_id" },
    );
    if (locationError) return fail(friendlyDbError(locationError));
  }
  revalidatePath(`/admin/donors/${v.profile_id}`);
  revalidatePath("/admin/donors");
  return success("Donor details saved.");
}

export async function resolveBloodGroupChange(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = uuidSchema.safeParse(fd.get("profile_id"));
  if (!id.success) return fail("Invalid profile.");
  const supabase = await createClient();
  const { error } = await supabase.rpc("resolve_blood_group_change", { p_profile: id.data, p_approve: fd.get("approve") === "true" });
  if (error) return fail(friendlyDbError(error));
  revalidatePath(`/admin/donors/${id.data}`);
  return success("Blood group correction resolved.");
}

export async function setProfileActive(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = uuidSchema.safeParse(fd.get("profile_id"));
  if (!id.success) return fail("Invalid profile.");
  const active = fd.get("active") === "true";
  const supabase = await createClient();
  const { error } = await supabase.rpc("set_profile_active", { p_profile: id.data, p_active: active, p_reason: str(fd, "reason") || null });
  if (error) return fail(friendlyDbError(error));
  revalidatePath(`/admin/donors/${id.data}`);
  return success(active ? "Account reactivated." : "Account deactivated and removed from the directory.");
}

/**
 * Processes a deletion request: anonymises the profile in the database, deletes
 * stored photos, and — when the service role key is configured — blocks future
 * sign-in (or deletes the login entirely if requested).
 */
export async function processDeletion(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = uuidSchema.safeParse(fd.get("profile_id"));
  if (!id.success) return fail("Invalid profile.");
  if (str(fd, "confirm") !== "ANONYMISE") return fail("Type ANONYMISE to confirm.");
  const hardDelete = bool(fd, "hard_delete");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("anonymize_account", { p_profile: id.data });
  if (error) return fail(friendlyDbError(error));
  const paths = (data ?? {}) as { profile_photo?: string | null; story_photos?: string[]; public_story_photos?: string[] };
  if (paths.profile_photo) await supabase.storage.from("profile-photos").remove([paths.profile_photo]);
  if (paths.story_photos?.length) await supabase.storage.from("story-uploads").remove(paths.story_photos);
  if (paths.public_story_photos?.length) await supabase.storage.from("story-public").remove(paths.public_story_photos);

  const admin = createAdminClient();
  let note = "Profile anonymised and photos removed.";
  if (admin) {
    if (hardDelete) {
      const { error: delError } = await admin.auth.admin.deleteUser(id.data);
      note = delError ? `${note} The login could not be deleted automatically.` : "Account and all associated records were permanently deleted.";
    } else {
      const { error: banError } = await admin.auth.admin.updateUserById(id.data, {
        email: `deleted-${id.data}@deleted.invalid`,
        email_confirm: true,
        ban_duration: "876000h",
        user_metadata: { full_name: "Deleted member" },
      });
      note = banError ? `${note} Sign-in could not be blocked automatically.` : `${note} Sign-in has been blocked and the email removed.`;
    }
  } else {
    note = `${note} Configure SUPABASE_SERVICE_ROLE_KEY to also remove the login automatically, or delete the user in the Supabase dashboard.`;
  }
  revalidatePath("/admin/donors");
  revalidatePath("/");
  return success(note);
}

// --- Roles ---------------------------------------------------------------------
export async function grantRole(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = staffRoleSchema.safeParse({
    user_id: fd.get("user_id"),
    role: fd.get("role"),
    can_verify_donations: bool(fd, "can_verify_donations"),
    can_verify_requests: bool(fd, "can_verify_requests"),
    can_export: bool(fd, "can_export"),
  });
  if (!parsed.success) return validationFailure(parsed.error);
  const supabase = await createClient();
  const { error } = await supabase.rpc("grant_staff_role", {
    p_user: parsed.data.user_id,
    p_role: parsed.data.role,
    p_can_verify_donations: parsed.data.can_verify_donations,
    p_can_verify_requests: parsed.data.can_verify_requests,
    p_can_export: parsed.data.can_export,
  });
  if (error) return fail(friendlyDbError(error));
  revalidatePath("/admin/users");
  revalidatePath("/admin/volunteers");
  return success("Role saved.");
}

export async function revokeRole(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = uuidSchema.safeParse(fd.get("user_id"));
  if (!id.success) return fail("Invalid user.");
  const supabase = await createClient();
  const { error } = await supabase.rpc("revoke_staff_role", { p_user: id.data });
  if (error) return fail(friendlyDbError(error));
  revalidatePath("/admin/users");
  revalidatePath("/admin/volunteers");
  return success("Role removed. Active assignments were released.");
}

// --- Settings -----------------------------------------------------------------
export async function updateSettings(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = settingsSchema.safeParse({
    "org.contact_email": str(fd, "org.contact_email"),
    "org.contact_phone": str(fd, "org.contact_phone"),
    "org.whatsapp": str(fd, "org.whatsapp"),
    "org.service_area": str(fd, "org.service_area"),
    registration_open: bool(fd, "registration_open"),
    whole_blood_interval_days: Number(str(fd, "whole_blood_interval_days")),
    anon_request_daily_limit: Number(str(fd, "anon_request_daily_limit")),
    member_request_daily_limit: Number(str(fd, "member_request_daily_limit")),
    contact_reveal_hourly_limit: Number(str(fd, "contact_reveal_hourly_limit")),
    contact_request_hourly_limit: Number(str(fd, "contact_request_hourly_limit")),
    request_alert_max_donors: Number(str(fd, "request_alert_max_donors")),
    request_expiry_grace_hours: Number(str(fd, "request_expiry_grace_hours")),
    story_daily_limit: Number(str(fd, "story_daily_limit")),
  });
  if (!parsed.success) return validationFailure(parsed.error);
  const viewer = await requireAdmin();
  const values: Record<string, unknown> = {
    ...parsed.data,
    "org.contact_phone": normalizePhone(parsed.data["org.contact_phone"]) ?? "",
    "org.whatsapp": normalizePhone(parsed.data["org.whatsapp"]) ?? "",
  };
  const supabase = await createClient();
  for (const [key, value] of Object.entries(values)) {
    const { error } = await supabase.from("platform_settings").update({ value, updated_by: viewer.id }).eq("key", key);
    if (error) return fail(friendlyDbError(error));
  }
  revalidatePath("/admin/settings");
  revalidatePath("/contact");
  return success("Settings saved.");
}

export async function runRetention(): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("purge_closed_request_contacts", { p_days: 90 });
  if (error) return fail(friendlyDbError(error));
  return success(`Removed requester contact details from ${data ?? 0} closed request(s) older than 90 days.`);
}

// --- Stories ---------------------------------------------------------------------
function refreshStory(id: string) {
  revalidatePath(`/admin/stories/${id}`);
  revalidatePath("/admin/stories");
  revalidatePath("/stories");
  revalidatePath("/impact");
  revalidatePath("/");
}

export async function setStoryStatus(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = uuidSchema.safeParse(fd.get("story_id"));
  if (!id.success) return fail("Invalid story.");
  const status = str(fd, "status");
  const supabase = await createClient();
  if (status === "unpublished" || status === "archived") {
    // Remove public photo access together with the story.
    const { data } = await supabase.from("impact_stories").select("public_photo_path").eq("id", id.data).maybeSingle();
    if (data?.public_photo_path) {
      await supabase.storage.from("story-public").remove([data.public_photo_path]);
      await supabase.rpc("set_story_public_photo", { p_story: id.data, p_public_path: null });
    }
  }
  const { error } = await supabase.rpc("set_story_status", { p_story: id.data, p_status: status, p_reason: str(fd, "reason") || null });
  if (error) return fail(friendlyDbError(error));
  refreshStory(id.data);
  return success("Story status updated.");
}

export async function updateStoryContent(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = storyPublicContentSchema.safeParse({
    story_id: fd.get("story_id"),
    public_title: str(fd, "public_title"),
    public_body: str(fd, "public_body"),
    public_excerpt: str(fd, "public_excerpt"),
    public_display_name: str(fd, "public_display_name"),
    show_name: bool(fd, "show_name"),
    show_photo: bool(fd, "show_photo"),
    show_personal: bool(fd, "show_personal"),
    show_city: bool(fd, "show_city"),
  });
  if (!parsed.success) return validationFailure(parsed.error);
  const v = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.rpc("update_story_public_content", {
    p_story: v.story_id,
    p_public_title: v.public_title || null,
    p_public_body: v.public_body || null,
    p_public_excerpt: v.public_excerpt || null,
    p_public_display_name: v.public_display_name || null,
    p_show_name: v.show_name,
    p_show_photo: v.show_photo,
    p_show_personal: v.show_personal,
    p_show_city: v.show_city,
  });
  if (error) return fail(friendlyDbError(error));
  refreshStory(v.story_id);
  return success("Public presentation saved. The original submission is unchanged.");
}

export async function setStoryVerification(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = uuidSchema.safeParse(fd.get("story_id"));
  if (!id.success) return fail("Invalid story.");
  const recordRaw = str(fd, "donation_record_id");
  const record = recordRaw ? uuidSchema.safeParse(recordRaw) : null;
  if (record && !record.success) return fail("Invalid donation record.");
  const supabase = await createClient();
  const { error } = await supabase.rpc("set_story_verification", {
    p_story: id.data,
    p_identity_verified: bool(fd, "identity_verified"),
    p_experience_reviewed: bool(fd, "experience_reviewed"),
    p_donation_verified: bool(fd, "donation_verified"),
    p_donation_record: record?.success ? record.data : null,
    p_note: str(fd, "note") || null,
  });
  if (error) return fail(friendlyDbError(error));
  refreshStory(id.data);
  return success("Verification labels updated.");
}

/** Copies an approved photo from the private bucket to the public bucket under a random name. */
export async function publishStoryPhoto(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = uuidSchema.safeParse(fd.get("story_id"));
  if (!id.success) return fail("Invalid story.");
  const supabase = await createClient();
  const { data: story } = await supabase
    .from("impact_stories")
    .select("photo_path, public_photo_path, consent_show_photo, withdrawn_at")
    .eq("id", id.data)
    .maybeSingle();
  if (!story?.photo_path || !story.consent_show_photo || story.withdrawn_at) return fail("This story has no photo the contributor agreed to publish.");
  const { data: blob, error: downloadError } = await supabase.storage.from("story-uploads").download(story.photo_path);
  if (downloadError || !blob) return fail("The private photo could not be read.");
  let clean;
  try {
    clean = sanitizeImage(new Uint8Array(await blob.arrayBuffer()));
  } catch (error) {
    return fail((error as Error).message);
  }
  const publicName = `${randomUUID()}.${clean.extension}`;
  const { error: uploadError } = await supabase.storage
    .from("story-public")
    .upload(publicName, clean.bytes, { contentType: clean.contentType, upsert: false, cacheControl: "3600" });
  if (uploadError) return fail("The photo could not be published to public storage.");
  const { error } = await supabase.rpc("set_story_public_photo", { p_story: id.data, p_public_path: publicName });
  if (error) {
    await supabase.storage.from("story-public").remove([publicName]);
    return fail(friendlyDbError(error));
  }
  if (story.public_photo_path) await supabase.storage.from("story-public").remove([story.public_photo_path]);
  refreshStory(id.data);
  return success("Photo approved for publication. Turn on “Show photo” to display it.");
}

export async function removeStoryPhoto(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = uuidSchema.safeParse(fd.get("story_id"));
  if (!id.success) return fail("Invalid story.");
  const supabase = await createClient();
  const { data: story } = await supabase.from("impact_stories").select("public_photo_path").eq("id", id.data).maybeSingle();
  if (story?.public_photo_path) await supabase.storage.from("story-public").remove([story.public_photo_path]);
  const { error } = await supabase.rpc("set_story_public_photo", { p_story: id.data, p_public_path: null });
  if (error) return fail(friendlyDbError(error));
  refreshStory(id.data);
  return success("Public photo removed.");
}

// --- Camps and manual metric sources ------------------------------------------
export async function saveCamp(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const viewer = await requireAdmin();
  const parsed = campSchema.safeParse({
    name: str(fd, "name"),
    camp_date: str(fd, "camp_date"),
    state: str(fd, "state"),
    district: str(fd, "district"),
    city: str(fd, "city"),
    venue_area: str(fd, "venue_area"),
    organizing_partners: str(fd, "organizing_partners"),
    partners_confirmed: bool(fd, "partners_confirmed"),
    status: str(fd, "status"),
    registrations_count: numOrNull(fd, "registrations_count"),
    verified_donor_count: numOrNull(fd, "verified_donor_count"),
    verified_units_collected: numOrNull(fd, "verified_units_collected"),
    volunteer_count: numOrNull(fd, "volunteer_count"),
    highlights: str(fd, "highlights"),
    learnings: str(fd, "learnings"),
    data_source: str(fd, "data_source"),
    is_public: bool(fd, "is_public"),
  });
  if (!parsed.success) return validationFailure(parsed.error);
  const v = parsed.data;
  const hasVerified = v.verified_donor_count !== null || v.verified_units_collected !== null;
  const row = {
    ...v,
    state: v.state || null,
    venue_area: v.venue_area || null,
    organizing_partners: v.organizing_partners || null,
    highlights: v.highlights || null,
    learnings: v.learnings || null,
    data_source: v.data_source || null,
    data_verified_by: hasVerified ? viewer.id : null,
    data_verified_at: hasVerified ? new Date().toISOString() : null,
  };
  const idRaw = str(fd, "camp_id");
  const supabase = await createClient();
  const { error } = idRaw
    ? await supabase.from("camp_records").update(row).eq("id", idRaw)
    : await supabase.from("camp_records").insert(row);
  if (error) return fail(friendlyDbError(error));
  revalidatePath("/admin/camps");
  revalidatePath("/impact");
  return success(idRaw ? "Camp updated." : "Camp added.");
}

export async function deleteCamp(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = uuidSchema.safeParse(fd.get("camp_id"));
  if (!id.success) return fail("Invalid camp.");
  const supabase = await createClient();
  const { error } = await supabase.from("camp_records").delete().eq("id", id.data);
  if (error) return fail(friendlyDbError(error));
  revalidatePath("/admin/camps");
  revalidatePath("/impact");
  return success("Camp removed.");
}

export async function saveMetricSource(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const viewer = await requireAdmin();
  const parsed = metricSourceSchema.safeParse({
    metric_key: str(fd, "metric_key"),
    label: str(fd, "label"),
    value: Number(str(fd, "value")),
    unit: str(fd, "unit"),
    period_start: str(fd, "period_start"),
    period_end: str(fd, "period_end"),
    source_description: str(fd, "source_description"),
    verified_at: str(fd, "verified_at"),
    is_public: bool(fd, "is_public"),
  });
  if (!parsed.success) return validationFailure(parsed.error);
  const v = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.from("impact_metrics_sources").insert({
    ...v,
    unit: v.unit || null,
    period_start: v.period_start || null,
    period_end: v.period_end || null,
    verified_by: viewer.id,
  });
  if (error) return fail(friendlyDbError(error));
  revalidatePath("/admin/camps");
  revalidatePath("/impact");
  return success("Documented figure added.");
}

export async function deleteMetricSource(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = uuidSchema.safeParse(fd.get("metric_id"));
  if (!id.success) return fail("Invalid figure.");
  const supabase = await createClient();
  const { error } = await supabase.from("impact_metrics_sources").delete().eq("id", id.data);
  if (error) return fail(friendlyDbError(error));
  revalidatePath("/admin/camps");
  revalidatePath("/impact");
  return success("Figure removed.");
}
