"use server";

import { revalidatePath } from "next/cache";
import { fail, success, validationFailure, type ActionResult } from "@/lib/action-result";
import { requireStaff } from "@/lib/auth";
import { friendlyDbError } from "@/lib/errors";
import { indiaLocalToIso } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { optionalText, placeSchema, urgencySchema, uuidSchema } from "@/lib/validation/common";
import {
  assignmentUpdateSchema,
  contactRequestSchema,
  coordinationSchema,
  followUpSchema,
  internalNoteSchema,
  requestStatusChangeSchema,
} from "@/lib/validation/forms";
import { z } from "zod";
import type { ContactMethod } from "@/lib/constants";

function refreshRequest(id: string) {
  revalidatePath(`/volunteer/requests/${id}`);
  revalidatePath("/volunteer/requests");
  revalidatePath("/volunteer");
  revalidatePath("/blood-requests");
}

export async function setRequestStatus(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireStaff();
  const parsed = requestStatusChangeSchema.safeParse({
    request_id: formData.get("request_id"),
    status: formData.get("status"),
    reason: String(formData.get("reason") ?? ""),
  });
  if (!parsed.success) return validationFailure(parsed.error);
  const supabase = await createClient();
  const { error } = await supabase.rpc("set_request_status", {
    p_request: parsed.data.request_id,
    p_status: parsed.data.status,
    p_reason: parsed.data.reason || null,
  });
  if (error) return fail(friendlyDbError(error));
  refreshRequest(parsed.data.request_id);
  return success("Status updated.");
}

const editRequestSchema = z.object({
  request_id: uuidSchema,
  hospital_name: placeSchema("hospital", 150),
  city: placeSchema("city", 80),
  district: placeSchema("district", 60),
  units_needed: z.number().int().min(1).max(50).nullable(),
  required_by: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/),
  urgency: urgencySchema,
  notes: optionalText(1000),
});

export async function editRequestDetails(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const viewer = await requireStaff();
  const units = String(formData.get("units_needed") ?? "");
  const parsed = editRequestSchema.safeParse({
    request_id: formData.get("request_id"),
    hospital_name: formData.get("hospital_name"),
    city: formData.get("city"),
    district: formData.get("district"),
    units_needed: units ? Number(units) : null,
    required_by: formData.get("required_by"),
    urgency: formData.get("urgency"),
    notes: String(formData.get("notes") ?? ""),
  });
  if (!parsed.success) return validationFailure(parsed.error);
  const v = parsed.data;
  const requiredBy = indiaLocalToIso(v.required_by);
  if (!requiredBy) return fail("Choose a valid date and time.");
  const supabase = await createClient();
  const { error } = await supabase
    .from("blood_requests")
    .update({
      hospital_name: v.hospital_name,
      city: v.city,
      district: v.district,
      units_needed: v.units_needed,
      required_by: requiredBy,
      urgency: v.urgency,
      notes: v.notes || null,
    })
    .eq("id", v.request_id);
  if (error) return fail(friendlyDbError(error));
  await supabase.from("internal_notes").insert({
    subject_type: "blood_request",
    subject_id: v.request_id,
    author_id: viewer.id,
    body: "Request details edited by a Rakt Mitra.",
  });
  refreshRequest(v.request_id);
  return success("Request details saved.");
}

export async function assignRequest(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireStaff();
  const id = uuidSchema.safeParse(formData.get("request_id"));
  const volunteerRaw = String(formData.get("volunteer_id") ?? "");
  const volunteer = volunteerRaw ? uuidSchema.safeParse(volunteerRaw) : null;
  if (!id.success || (volunteer && !volunteer.success)) return fail("Invalid assignment.");
  const supabase = await createClient();
  const { error } = await supabase.rpc("assign_request", { p_request: id.data, p_volunteer: volunteer?.success ? volunteer.data : null });
  if (error) return fail(friendlyDbError(error));
  refreshRequest(id.data);
  revalidatePath("/volunteer/coordination");
  return success(volunteer ? "Rakt Mitra assigned." : "You're now coordinating this request.");
}

export async function updateAssignment(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireStaff();
  const parsed = assignmentUpdateSchema.safeParse({
    assignment_id: formData.get("assignment_id"),
    status: formData.get("status"),
    follow_up_at: String(formData.get("follow_up_at") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  });
  if (!parsed.success) return validationFailure(parsed.error);
  const followUp = parsed.data.follow_up_at ? indiaLocalToIso(parsed.data.follow_up_at) : null;
  const supabase = await createClient();
  const { error } = await supabase.rpc("update_assignment", {
    p_assignment: parsed.data.assignment_id,
    p_status: parsed.data.status,
    p_follow_up_at: followUp,
    p_notes: parsed.data.notes || null,
  });
  if (error) return fail(friendlyDbError(error));
  revalidatePath("/volunteer/coordination");
  revalidatePath("/volunteer");
  return success(parsed.data.status === "active" ? "Assignment updated." : "Assignment closed.");
}

export async function recordCoordination(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireStaff();
  const response = String(formData.get("response") ?? "");
  const outcome = String(formData.get("outcome") ?? "");
  const parsed = coordinationSchema.safeParse({
    request_id: formData.get("request_id"),
    donor_id: formData.get("donor_id"),
    response: response || null,
    outcome: outcome || null,
    attempted: formData.get("attempted") === "true",
  });
  if (!parsed.success) return validationFailure(parsed.error);
  const supabase = await createClient();
  const { error } = await supabase.rpc("record_coordination", {
    p_request: parsed.data.request_id,
    p_donor: parsed.data.donor_id,
    p_response: parsed.data.response,
    p_outcome: parsed.data.outcome,
    p_attempted: parsed.data.attempted,
  });
  if (error) return fail(friendlyDbError(error));
  refreshRequest(parsed.data.request_id);
  return success(parsed.data.attempted ? "Contact attempt logged." : "Coordination updated.");
}

/** Marks a donor's after-donation follow-up as done, with an optional note for the team. */
export async function completeDonationFollowUp(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireStaff();
  const parsed = followUpSchema.safeParse({
    request_id: formData.get("request_id"),
    donor_id: formData.get("donor_id"),
    note: String(formData.get("note") ?? ""),
  });
  if (!parsed.success) return validationFailure(parsed.error);
  const supabase = await createClient();
  const { error } = await supabase.rpc("complete_donation_follow_up", {
    p_request: parsed.data.request_id,
    p_donor: parsed.data.donor_id,
    p_note: parsed.data.note || null,
  });
  if (error) return fail(friendlyDbError(error));
  refreshRequest(parsed.data.request_id);
  revalidatePath("/volunteer/coordination");
  return success("Follow-up recorded. Thank you.");
}

export interface RevealedContact {
  displayName: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  preferred: ContactMethod;
}

/**
 * Returns a donor's contact details to an authorised volunteer, for one
 * verified request, after the database checks consent, role and rate limits
 * and writes an audit entry. Nothing is cached.
 */
export async function revealDonorContact(donorId: string, requestId: string): Promise<ActionResult<RevealedContact>> {
  await requireStaff();
  const donor = uuidSchema.safeParse(donorId);
  const request = uuidSchema.safeParse(requestId);
  if (!donor.success || !request.success) return fail("Invalid request.");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("reveal_donor_contact", { p_donor: donor.data, p_request: request.data });
  if (error) return fail(friendlyDbError(error));
  const row = (Array.isArray(data) ? data[0] : data) as
    | { display_name: string; phone: string | null; whatsapp: string | null; email: string | null; preferred_contact_method: ContactMethod }
    | undefined;
  if (!row) return fail("Contact details are not available.");
  return success(undefined, {
    displayName: row.display_name,
    phone: row.phone,
    whatsapp: row.whatsapp,
    email: row.email,
    preferred: row.preferred_contact_method,
  });
}

export async function sendContactRequest(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireStaff();
  const parsed = contactRequestSchema.safeParse({
    donor_id: formData.get("donor_id"),
    request_id: formData.get("request_id"),
    message: String(formData.get("message") ?? ""),
  });
  if (!parsed.success) return validationFailure(parsed.error);
  const supabase = await createClient();
  const { error } = await supabase.rpc("create_contact_request", {
    p_donor: parsed.data.donor_id,
    p_request: parsed.data.request_id,
    p_message: parsed.data.message || null,
  });
  if (error) return fail(friendlyDbError(error));
  refreshRequest(parsed.data.request_id);
  return success("Contact request sent. The donor decides whether to share their details.");
}

export async function verifyDonationRecord(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireStaff();
  const id = uuidSchema.safeParse(formData.get("record_id"));
  const status = String(formData.get("status") ?? "");
  if (!id.success || !["verified", "rejected"].includes(status)) return fail("Invalid review.");
  const reason = String(formData.get("reason") ?? "").trim().slice(0, 300);
  const supabase = await createClient();
  const { error } = await supabase.rpc("verify_donation_record", { p_record: id.data, p_status: status, p_reason: reason || null });
  if (error) return fail(friendlyDbError(error));
  revalidatePath("/volunteer/donations");
  revalidatePath("/admin/donations");
  return success(status === "verified" ? "Record verified." : "Record marked as not verified.");
}

export async function addInternalNote(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const viewer = await requireStaff();
  const parsed = internalNoteSchema.safeParse({
    subject_type: formData.get("subject_type"),
    subject_id: formData.get("subject_id"),
    body: String(formData.get("body") ?? ""),
  });
  if (!parsed.success) return validationFailure(parsed.error);
  const supabase = await createClient();
  const { error } = await supabase.from("internal_notes").insert({ ...parsed.data, author_id: viewer.id });
  if (error) return fail(friendlyDbError(error));
  if (parsed.data.subject_type === "blood_request") revalidatePath(`/volunteer/requests/${parsed.data.subject_id}`);
  if (parsed.data.subject_type === "profile") revalidatePath(`/admin/donors/${parsed.data.subject_id}`);
  if (parsed.data.subject_type === "story") revalidatePath(`/admin/stories/${parsed.data.subject_id}`);
  return success("Note added.");
}

/** Housekeeping that would otherwise need a scheduler (also safe to run via pg_cron). */
export async function runCoordinationHousekeeping(): Promise<ActionResult> {
  await requireStaff();
  const supabase = await createClient();
  const [expired, reminders] = await Promise.all([supabase.rpc("expire_stale_requests"), supabase.rpc("generate_follow_up_reminders")]);
  if (expired.error || reminders.error) return fail(friendlyDbError(expired.error ?? reminders.error));
  revalidatePath("/volunteer");
  return success(`Expired ${expired.data ?? 0} stale request(s); sent ${reminders.data ?? 0} follow-up reminder(s).`);
}
