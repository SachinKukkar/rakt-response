"use server";

import { revalidatePath } from "next/cache";
import { fail, success, validationFailure, type ActionResult } from "@/lib/action-result";
import { getViewer } from "@/lib/auth";
import type { DonorContactMethod } from "@/lib/constants";
import { isSupabaseConfigured } from "@/lib/env";
import { friendlyDbError } from "@/lib/errors";
import { indiaLocalToIso } from "@/lib/format";
import { normalizePhone } from "@/lib/phone";
import { createClient } from "@/lib/supabase/server";
import { uuidSchema } from "@/lib/validation/common";
import { bloodRequestSchema, donationReportSchema, type BloodRequestInput } from "@/lib/validation/forms";

export interface SubmittedRequest {
  requestId: string;
  referenceCode: string;
  possibleDuplicate: boolean;
}

export async function submitBloodRequest(input: BloodRequestInput): Promise<ActionResult<SubmittedRequest>> {
  if (!isSupabaseConfigured()) return fail("Requests cannot be submitted yet: the database is not configured.");
  if (!(await getViewer())) return fail("Please sign in to submit a request");
  const parsed = bloodRequestSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);
  const v = parsed.data;
  if (v.website) return fail("Your request could not be submitted."); // honeypot tripped

  const requiredBy = indiaLocalToIso(v.required_by);
  if (!requiredBy) return fail("Please choose a valid date and time.", { required_by: ["Choose the date and time"] });

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_blood_request", {
    p_patient_name: v.patient_name,
    p_patient_age: v.patient_age,
    p_patient_gender: v.patient_gender,
    p_blood_group: v.blood_group,
    p_request_type: v.request_type,
    p_units: v.units_needed,
    p_hospital: v.hospital_name,
    p_state: v.state || null,
    p_district: v.district,
    p_city: v.city,
    p_hospital_patient_id: v.hospital_patient_id || null,
    p_ward: v.ward || null,
    p_reason: v.reason || null,
    p_required_by: requiredBy,
    p_urgency: v.urgency,
    p_requester_name: v.requester_name,
    p_requester_relation: v.requester_relation,
    p_requester_phone: normalizePhone(v.requester_phone),
    p_contact_method: v.requester_contact_method,
    p_notes: v.notes || null,
  });
  if (error) return fail(friendlyDbError(error, "We could not submit your request. Please try again."));
  const row = (Array.isArray(data) ? data[0] : data) as
    | { request_id: string; reference_code: string; possible_duplicate_of: string | null }
    | undefined;
  if (!row) return fail("We could not submit your request. Please try again.");
  revalidatePath("/requests");
  return success("Request submitted.", {
    requestId: row.request_id,
    referenceCode: row.reference_code,
    possibleDuplicate: Boolean(row.possible_duplicate_of),
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
  revalidatePath(`/requests/${id.data}`);
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
  revalidatePath(`/requests/${id.data}`);
  revalidatePath("/dashboard");
  return success(
    response === "interested"
      ? "Thank you for joining. Open the request to see the patient's details and contact the family."
      : "Thanks for letting us know.",
  );
}

/** "I donated" (with the day) or "I didn't donate", for a request the donor joined. */
export async function reportMyDonation(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const donated = formData.get("donated") === "true";
  const parsed = donationReportSchema.safeParse({
    request_id: formData.get("request_id"),
    donated,
    donation_date: donated ? String(formData.get("donation_date") ?? "") : null,
  });
  if (!parsed.success) return validationFailure(parsed.error);
  const supabase = await createClient();
  const { error } = await supabase.rpc("report_my_donation", {
    p_request: parsed.data.request_id,
    p_donated: parsed.data.donated,
    p_date: parsed.data.donation_date,
  });
  if (error) return fail(friendlyDbError(error));
  revalidatePath(`/requests/${parsed.data.request_id}`);
  revalidatePath("/requests");
  revalidatePath("/dashboard");
  revalidatePath("/donations");
  return success(donated ? "Thank you for donating. It's now in your donation record." : "Thanks for letting us know.");
}

export async function respondToContactRequest(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const id = uuidSchema.safeParse(formData.get("contact_request_id"));
  const accept = formData.get("accept") === "true";
  if (!id.success) return fail("Invalid contact request.");
  const supabase = await createClient();
  const { error } = await supabase.rpc("respond_to_contact_request", { p_contact_request: id.data, p_accept: accept });
  if (error) return fail(friendlyDbError(error));
  revalidatePath("/requests");
  return success(accept ? "Thank you. The Rakt Mitra can now see your contact details for this request." : "Declined. Your details were not shared.");
}

export interface RevealedDonorContact {
  channel: DonorContactMethod;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
}

/** Opens one eligible donor's contact for the patient's own verified request (limited and logged). */
export async function revealDonorToRequester(requestId: string, donorId: string): Promise<ActionResult<RevealedDonorContact>> {
  const request = uuidSchema.safeParse(requestId);
  const donor = uuidSchema.safeParse(donorId);
  if (!request.success || !donor.success) return fail("Invalid request.");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("reveal_donor_contact_to_requester", { p_request: request.data, p_donor: donor.data });
  if (error) return fail(friendlyDbError(error));
  const row = (Array.isArray(data) ? data[0] : data) as RevealedDonorContact | undefined;
  if (!row) return fail("This donor is not available for your request");
  return success("Contact shown.", row);
}
