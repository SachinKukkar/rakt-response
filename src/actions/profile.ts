"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { fail, success, validationFailure, type ActionResult } from "@/lib/action-result";
import { requireViewer } from "@/lib/auth";
import { friendlyDbError } from "@/lib/errors";
import { sanitizeImage } from "@/lib/images";
import { normalizePhone } from "@/lib/phone";
import { isSupabaseConfigured, siteUrl } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { donorLocationSchema, type DonorLocationInput } from "@/lib/validation/registration";
import { bloodGroupChangeSchema, preferencesSchema, profileSchema, type PreferencesInput, type ProfileInput } from "@/lib/validation/forms";

function refreshMemberPages() {
  revalidatePath("/dashboard");
  revalidatePath("/profile");
  revalidatePath("/settings");
}

export async function updateProfile(input: ProfileInput & { age_confirmed?: boolean }): Promise<ActionResult> {
  const viewer = await requireViewer();
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);
  const v = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: v.full_name,
      display_name: v.display_name || null,
      bio: v.bio || null,
      donation_experience: v.donation_experience || null,
      approx_previous_donations: v.approx_previous_donations,
      ...(typeof input.age_confirmed === "boolean" ? { age_confirmed: input.age_confirmed } : {}),
    })
    .eq("id", viewer.id);
  if (error) return fail(friendlyDbError(error));
  const { error: contactError } = await supabase
    .from("profile_contacts")
    .update({ phone: normalizePhone(v.phone), whatsapp: normalizePhone(v.whatsapp) })
    .eq("profile_id", viewer.id);
  if (contactError) return fail(friendlyDbError(contactError));
  refreshMemberPages();
  return success("Profile updated.");
}

/** Signed-in resend: a pending email change, or (rarely) an unconfirmed signup. */
export async function resendMyVerification(): Promise<ActionResult> {
  if (!isSupabaseConfigured()) return fail("This feature is not configured.");
  await requireViewer();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  const user = data.user;
  if (error || !user?.email) return fail("Please sign in again and retry.");
  if (!user.new_email && user.email_confirmed_at) return success("Your email is already verified.");
  const emailRedirectTo = `${siteUrl}/auth/callback?next=${encodeURIComponent("/profile")}`;
  const { error: resendError } = user.new_email
    ? await supabase.auth.resend({ type: "email_change", email: user.new_email, options: { emailRedirectTo } })
    : await supabase.auth.resend({ type: "signup", email: user.email, options: { emailRedirectTo } });
  if (resendError?.status === 429) return fail("Please wait a little before requesting another email.");
  if (resendError) {
    console.error("[auth] verification email resend failed", { status: resendError.status, code: resendError.code });
    return fail("We couldn't send the email right now. Please try again in a few minutes.");
  }
  return success(`We've sent a new verification link to ${user.new_email ?? user.email}.`);
}

export async function updateLocation(input: DonorLocationInput): Promise<ActionResult> {
  const viewer = await requireViewer();
  const parsed = donorLocationSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);
  const v = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.from("donor_locations").upsert(
    {
      profile_id: viewer.id,
      state: v.state,
      district: v.district,
      city: v.city,
      locality: v.locality || null,
      pincode: v.pincode || null,
      approx_lat: v.lat,
      approx_lng: v.lng,
    },
    { onConflict: "profile_id" },
  );
  if (error) return fail(friendlyDbError(error));
  if (v.max_distance_km !== undefined) {
    await supabase.from("donor_preferences").update({ max_distance_km: v.max_distance_km }).eq("profile_id", viewer.id);
  }
  refreshMemberPages();
  return success("Location updated.");
}

export async function updatePreferences(input: PreferencesInput): Promise<ActionResult> {
  const viewer = await requireViewer();
  const parsed = preferencesSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);
  const v = parsed.data;
  const isDonor = Boolean(viewer.profile?.is_donor);
  const supabase = await createClient();
  const { error } = await supabase.from("donor_preferences").upsert(
    {
      profile_id: viewer.id,
      directory_visible: isDonor && v.directory_visible,
      contact_consent: isDonor && v.contact_consent,
      open_to_contact: isDonor && v.contact_consent && v.open_to_contact,
      emergency_alerts: isDonor && v.emergency_alerts,
      show_donation_summary: isDonor && v.show_donation_summary,
      show_first_name: v.show_first_name,
      notify_status_updates: v.notify_status_updates,
      preferred_contact_method: v.preferred_contact_method,
      max_distance_km: v.max_distance_km,
    },
    { onConflict: "profile_id" },
  );
  if (error) return fail(friendlyDbError(error));
  refreshMemberPages();
  return success("Your choices were saved.");
}

/** One-tap availability switch used on the dashboard. */
export async function setAvailability(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const viewer = await requireViewer();
  const open = formData.get("open") === "true";
  const supabase = await createClient();
  const { data: prefs } = await supabase.from("donor_preferences").select("contact_consent").eq("profile_id", viewer.id).maybeSingle();
  if (open && !prefs?.contact_consent) {
    return fail("To be open to contact, first allow volunteers to contact you in Privacy & settings.");
  }
  const { error } = await supabase.from("donor_preferences").update({ open_to_contact: open }).eq("profile_id", viewer.id);
  if (error) return fail(friendlyDbError(error));
  refreshMemberPages();
  return success(open ? "You're marked as open to contact." : "You're marked as unavailable. Volunteers won't contact you.");
}

export async function changeBloodGroup(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const viewer = await requireViewer();
  const parsed = bloodGroupChangeSchema.safeParse({ blood_group: formData.get("blood_group") });
  if (!parsed.success) return validationFailure(parsed.error);
  const supabase = await createClient();
  const { error } = await supabase.rpc("request_blood_group_change", { p_group: parsed.data.blood_group });
  if (error) return fail(friendlyDbError(error));
  refreshMemberPages();
  return success(
    viewer.profile?.blood_group_verified
      ? "Correction requested. An administrator will review it; your verified blood group stays until then."
      : "Blood group updated.",
  );
}

export async function uploadProfilePhoto(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const viewer = await requireViewer();
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) return fail("Choose a photo to upload.");
  let clean;
  try {
    clean = sanitizeImage(new Uint8Array(await file.arrayBuffer()), 2 * 1024 * 1024);
  } catch (error) {
    return fail((error as Error).message);
  }
  const supabase = await createClient();
  const path = `${viewer.id}/${randomUUID()}.${clean.extension}`;
  const { error: uploadError } = await supabase.storage
    .from("profile-photos")
    .upload(path, clean.bytes, { contentType: clean.contentType, upsert: false, cacheControl: "0" });
  if (uploadError) return fail("Photo uploads are unavailable right now. Please try again later.");
  const previous = viewer.profile?.photo_path;
  const { error } = await supabase.from("profiles").update({ photo_path: path }).eq("id", viewer.id);
  if (error) {
    await supabase.storage.from("profile-photos").remove([path]);
    return fail(friendlyDbError(error));
  }
  if (previous) await supabase.storage.from("profile-photos").remove([previous]);
  refreshMemberPages();
  return success("Profile photo updated.");
}

export async function removeProfilePhoto(): Promise<ActionResult> {
  const viewer = await requireViewer();
  const supabase = await createClient();
  const previous = viewer.profile?.photo_path;
  const { error } = await supabase.from("profiles").update({ photo_path: null }).eq("id", viewer.id);
  if (error) return fail(friendlyDbError(error));
  if (previous) await supabase.storage.from("profile-photos").remove([previous]);
  refreshMemberPages();
  return success("Photo removed.");
}

export async function requestDeletion(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireViewer();
  if (formData.get("confirm") !== "DELETE") return fail('Type DELETE in capitals to confirm.', { confirm: ["Type DELETE to confirm"] });
  const supabase = await createClient();
  const { error } = await supabase.rpc("request_account_deletion", { p_reason: String(formData.get("reason") ?? "").slice(0, 300) || null });
  if (error) return fail(friendlyDbError(error));
  refreshMemberPages();
  return success("Deletion requested. You've been removed from the donor directory and contact lists. An administrator will complete the request.");
}

export async function cancelDeletion(): Promise<ActionResult> {
  await requireViewer();
  const supabase = await createClient();
  const { error } = await supabase.rpc("cancel_account_deletion");
  if (error) return fail(friendlyDbError(error));
  refreshMemberPages();
  return success("Deletion request cancelled. Review your privacy choices to rejoin the directory.");
}

export async function markNotificationsRead(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const viewer = await requireViewer();
  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  let query = supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("user_id", viewer.id).is("read_at", null);
  if (id) query = query.eq("id", id);
  const { error } = await query;
  if (error) return fail(friendlyDbError(error));
  revalidatePath("/notifications");
  revalidatePath("/dashboard");
  return success(id ? "Marked as read." : "All notifications marked as read.");
}

export async function clearReadNotifications(): Promise<ActionResult> {
  const viewer = await requireViewer();
  const supabase = await createClient();
  const { error } = await supabase.from("notifications").delete().eq("user_id", viewer.id).not("read_at", "is", null);
  if (error) return fail(friendlyDbError(error));
  revalidatePath("/notifications");
  return success("Cleared read notifications.");
}
