"use server";

import { revalidatePath } from "next/cache";
import { fail, success, validationFailure, type ActionResult } from "@/lib/action-result";
import { getViewer } from "@/lib/auth";
import { anonymousClientKey } from "@/lib/client-key";
import { isSupabaseConfigured } from "@/lib/env";
import { friendlyDbError } from "@/lib/errors";
import { indiaLocalToIso } from "@/lib/format";
import { normalizePhone } from "@/lib/phone";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { uuidSchema } from "@/lib/validation/common";
import { bloodRequestSchema, type BloodRequestInput } from "@/lib/validation/forms";

export interface SubmittedRequest {
  referenceCode: string;
  possibleDuplicate: boolean;
  signedIn: boolean;
}

export async function submitBloodRequest(input: BloodRequestInput): Promise<ActionResult<SubmittedRequest>> {
  if (!isSupabaseConfigured()) return fail("Requests cannot be submitted yet: the database is not configured.");
  const parsed = bloodRequestSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);
  const v = parsed.data;
  if (v.website) return fail("Your request could not be submitted."); // honeypot tripped

  const requiredBy = indiaLocalToIso(v.required_by);
  if (!requiredBy) return fail("Please choose a valid date and time.", { required_by: ["Choose the date and time"] });

  const viewer = await getViewer();
  const args = {
    p_requester_name: v.requester_name,
    p_requester_phone: normalizePhone(v.requester_phone),
    p_requester_email: v.requester_email || null,
    p_contact_method: v.requester_contact_method,
    p_blood_group: v.blood_group,
    p_request_type: v.request_type,
    p_units: v.units_needed,
    p_hospital: v.hospital_name,
    p_state: v.state || null,
    p_district: v.district,
    p_city: v.city,
    p_required_by: requiredBy,
    p_urgency: v.urgency,
    p_notes: v.notes || null,
    p_public_listing: v.public_listing_consent,
  };

  let client;
  let clientKey: string | null = null;
  if (viewer) {
    client = await createClient();
  } else {
    client = createAdminClient();
    if (!client) {
      return fail("Please sign in to submit a request. For emergencies, contact the hospital blood bank directly.");
    }
    clientKey = await anonymousClientKey("blood-request");
  }

  const { data, error } = await client.rpc("submit_blood_request", { ...args, p_client_key: clientKey });
  if (error) return fail(friendlyDbError(error, "We could not submit your request. Please try again."));
  const row = (Array.isArray(data) ? data[0] : data) as { reference_code: string; possible_duplicate_of: string | null } | undefined;
  if (!row) return fail("We could not submit your request. Please try again.");
  revalidatePath("/requests");
  return success("Request submitted.", {
    referenceCode: row.reference_code,
    possibleDuplicate: Boolean(row.possible_duplicate_of),
    signedIn: Boolean(viewer),
  });
}

export async function cancelMyRequest(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const id = uuidSchema.safeParse(formData.get("request_id"));
  if (!id.success) return fail("Invalid request.");
  const reason = String(formData.get("reason") ?? "").slice(0, 300);
  const supabase = await createClient();
  const { error } = await supabase.rpc("cancel_my_blood_request", { p_request: id.data, p_reason: reason || "Cancelled by requester" });
  if (error) return fail(friendlyDbError(error));
  revalidatePath("/requests");
  return success("Your request was cancelled. Thank you for letting us know.");
}

export async function respondToRequest(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const id = uuidSchema.safeParse(formData.get("request_id"));
  const response = String(formData.get("response") ?? "");
  if (!id.success || !["interested", "unavailable", "declined"].includes(response)) return fail("Invalid response.");
  const supabase = await createClient();
  const { error } = await supabase.rpc("respond_to_blood_request", { p_request: id.data, p_response: response });
  if (error) return fail(friendlyDbError(error));
  revalidatePath("/requests");
  return success(
    response === "interested"
      ? "Thank you. A volunteer will be in touch if your help is needed. Please don't go to the hospital until they confirm."
      : "Thanks for letting us know.",
  );
}

export async function respondToContactRequest(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const id = uuidSchema.safeParse(formData.get("contact_request_id"));
  const accept = formData.get("accept") === "true";
  if (!id.success) return fail("Invalid contact request.");
  const supabase = await createClient();
  const { error } = await supabase.rpc("respond_to_contact_request", { p_contact_request: id.data, p_accept: accept });
  if (error) return fail(friendlyDbError(error));
  revalidatePath("/requests");
  return success(accept ? "Thank you. The volunteer can now see your contact details for this request." : "Declined. Your details were not shared.");
}
