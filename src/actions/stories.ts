"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { fail, success, validationFailure, type ActionResult } from "@/lib/action-result";
import { getViewer } from "@/lib/auth";
import { friendlyDbError } from "@/lib/errors";
import { sanitizeImage } from "@/lib/images";
import { normalizePhone } from "@/lib/phone";
import { createClient } from "@/lib/supabase/server";
import { uuidSchema } from "@/lib/validation/common";
import { storySchema } from "@/lib/validation/forms";

/** Contributor submits a story (optionally with a photo kept private until approved). */
export async function submitStory(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const viewer = await getViewer();
  if (!viewer) return fail("Please sign in to share your story.");

  let payload: unknown;
  try {
    payload = JSON.parse(String(formData.get("payload") ?? "{}"));
  } catch {
    return fail("Your story could not be read. Please try again.");
  }
  const parsed = storySchema.safeParse(payload);
  if (!parsed.success) return validationFailure(parsed.error);
  const v = parsed.data;
  const campId = String(formData.get("camp_id") ?? "");
  const campParsed = campId ? uuidSchema.safeParse(campId) : null;
  if (campParsed && !campParsed.success) return fail("Invalid camp selection.");

  const supabase = await createClient();
  let photoPath: string | null = null;
  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    let clean;
    try {
      clean = sanitizeImage(new Uint8Array(await photo.arrayBuffer()));
    } catch (error) {
      return fail((error as Error).message, { photo: [(error as Error).message] });
    }
    photoPath = `${viewer.id}/${randomUUID()}.${clean.extension}`;
    const { error: uploadError } = await supabase.storage
      .from("story-uploads")
      .upload(photoPath, clean.bytes, { contentType: clean.contentType, upsert: false, cacheControl: "0" });
    if (uploadError) {
      return fail("We couldn't upload your photo right now. You can submit without it and add one later by contacting us.");
    }
  }

  const { data, error } = await supabase.rpc("submit_story", {
    p_story_type: v.story_type,
    p_contributor_name: v.contributor_name,
    p_public_display_name: v.public_display_name || null,
    p_follow_up_email: v.follow_up_email || null,
    p_follow_up_phone: normalizePhone(v.follow_up_phone),
    p_city: v.city || null,
    p_title: v.title,
    p_body: v.body,
    p_experience_period: v.experience_period || null,
    p_donation_type: v.donation_type || null,
    p_blood_group: v.blood_group || null,
    p_camp_id: campParsed?.success ? campParsed.data : null,
    p_supporting_details: v.supporting_details || null,
    p_photo_path: photoPath,
    p_consent_contact: v.consent_contact,
    p_consent_publish: v.consent_publish,
    p_consent_show_name: v.consent_show_name,
    p_consent_show_photo: v.consent_show_photo && Boolean(photoPath),
    p_consent_show_personal: v.consent_show_personal,
    p_rights_confirmed: v.rights_confirmed,
  });
  if (error) {
    if (photoPath) await supabase.storage.from("story-uploads").remove([photoPath]);
    return fail(friendlyDbError(error, "We could not submit your story. Please try again."));
  }
  revalidatePath("/share-your-story/submissions");
  return success("Thank you for sharing. Our team will review your story before anything is published.", { id: String(data) });
}

export async function withdrawStory(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const id = uuidSchema.safeParse(formData.get("story_id"));
  if (!id.success) return fail("Invalid story.");
  const reason = String(formData.get("reason") ?? "").slice(0, 500);
  const supabase = await createClient();
  const { data: story } = await supabase.from("impact_stories").select("public_photo_path").eq("id", id.data).maybeSingle();
  // Remove the public photo first (allowed for the story's contributor by storage policy).
  let cleanupNeeded = false;
  if (story?.public_photo_path) {
    const { error } = await supabase.storage.from("story-public").remove([story.public_photo_path]);
    cleanupNeeded = Boolean(error);
  }
  const { error } = await supabase.rpc("request_story_withdrawal", {
    p_story: id.data,
    p_reason: reason || null,
    p_photo_cleanup_needed: cleanupNeeded,
  });
  if (error) return fail(friendlyDbError(error));
  revalidatePath("/share-your-story/submissions");
  revalidatePath("/stories");
  revalidatePath("/impact");
  revalidatePath("/");
  return success("Your story has been withdrawn and is no longer public.");
}

export async function requestStoryCorrection(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const id = uuidSchema.safeParse(formData.get("story_id"));
  const details = String(formData.get("details") ?? "").trim();
  if (!id.success) return fail("Invalid story.");
  if (details.length < 5) return fail("Please describe the correction.", { details: ["Please describe the correction"] });
  const supabase = await createClient();
  const { error } = await supabase.rpc("request_story_correction", { p_story: id.data, p_details: details.slice(0, 1000) });
  if (error) return fail(friendlyDbError(error));
  return success("Thanks — a reviewer will look at your correction request.");
}

export async function updateStoryConsents(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const id = uuidSchema.safeParse(formData.get("story_id"));
  if (!id.success) return fail("Invalid story.");
  const supabase = await createClient();
  const { error } = await supabase.rpc("update_story_consents", {
    p_story: id.data,
    p_show_name: formData.get("show_name") === "on",
    p_show_photo: formData.get("show_photo") === "on",
    p_show_personal: formData.get("show_personal") === "on",
    p_contact: formData.get("contact") === "on",
  });
  if (error) return fail(friendlyDbError(error));
  revalidatePath("/share-your-story/submissions");
  revalidatePath("/stories");
  return success("Your choices were saved. Anything you turned off is hidden immediately.");
}
