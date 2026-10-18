"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { fail, success, validationFailure, type ActionResult } from "@/lib/action-result";
import { requireViewer } from "@/lib/auth";
import { findPossibleDuplicates, type DonationLike } from "@/lib/donations";
import { friendlyDbError } from "@/lib/errors";
import { safeNextPath } from "@/lib/redirects";
import { createClient } from "@/lib/supabase/server";
import { uuidSchema } from "@/lib/validation/common";
import { donationRecordSchema, type DonationRecordInput } from "@/lib/validation/forms";

export interface AddDonationResult {
  needsDuplicateConfirmation?: boolean;
  duplicates?: Array<{ donation_date: string; centre_name: string }>;
}

export async function addDonation(input: DonationRecordInput): Promise<ActionResult<AddDonationResult>> {
  const viewer = await requireViewer("/donations/new");
  if (!viewer.profile?.is_donor) return fail("Complete your donor profile (blood group) before recording donations.");
  const parsed = donationRecordSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);
  const v = parsed.data;
  const supabase = await createClient();

  const allowed = await supabase.rpc("hit_rate_limit", { p_bucket: "donation_record", p_limit: 30, p_window_seconds: 86400 });
  if (allowed.data === false) return fail("You've added many records today. Please try again tomorrow.");

  const { data: existing } = await supabase
    .from("donation_records")
    .select("id, donation_type, donation_date, centre_name, verification_status")
    .eq("donor_id", viewer.id);
  const dupes = findPossibleDuplicates((existing ?? []) as Array<DonationLike & { centre_name: string }>, v);
  if (dupes.length && !v.confirm_duplicate) {
    return success("Possible duplicate", {
      needsDuplicateConfirmation: true,
      duplicates: dupes.map((d) => ({ donation_date: d.donation_date, centre_name: d.centre_name })),
    });
  }

  const { error } = await supabase.from("donation_records").insert({
    donor_id: viewer.id,
    donation_type: v.donation_type,
    donation_date: v.donation_date,
    centre_name: v.centre_name,
    city: v.city || null,
    district: v.district || null,
    event_name: v.event_name || null,
  });
  if (error) {
    if (error.code === "23505") return fail("You already have a record of this type on this date.");
    return fail(friendlyDbError(error));
  }
  revalidatePath("/donations");
  revalidatePath("/dashboard");
  return success("Donation recorded. It will show as self-reported until a Rakt Mitra verifies it.", {});
}

/** Pages that show donation records or figures counted from them. */
function refreshDonationPages(donorId?: string | null) {
  for (const path of ["/donations", "/dashboard", "/volunteer/donations", "/admin/donations", "/impact", "/"]) revalidatePath(path);
  if (donorId) revalidatePath(`/admin/donors/${donorId}`);
}

/**
 * Edits a donation record. Who may edit is decided by the database: donors
 * their own records (a checked record goes back to pending), volunteers who
 * verify donations and administrators any record (its status is kept).
 */
export async function updateDonation(recordId: string, input: DonationRecordInput): Promise<ActionResult<{ recheck: boolean }>> {
  await requireViewer();
  const id = uuidSchema.safeParse(recordId);
  if (!id.success) return fail("Invalid record.");
  const parsed = donationRecordSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);
  const v = parsed.data;
  const supabase = await createClient();

  const { data: before } = await supabase.from("donation_records").select("verification_status").eq("id", id.data).maybeSingle();
  if (!before) return fail("You can't edit this record.");
  const { data: after, error } = await supabase
    .from("donation_records")
    .update({
      donation_type: v.donation_type,
      donation_date: v.donation_date,
      centre_name: v.centre_name,
      city: v.city || null,
      district: v.district || null,
      event_name: v.event_name || null,
    })
    .eq("id", id.data)
    .select("donor_id, verification_status")
    .maybeSingle();
  if (error) {
    if (error.code === "23505") return fail("There is already a record of this type on this date.");
    return fail(friendlyDbError(error));
  }
  if (!after) return fail("You can't edit this record.");
  refreshDonationPages(after.donor_id as string);
  const recheck = before.verification_status !== "pending" && after.verification_status === "pending";
  return success(recheck ? "Changes saved. The record will be checked again by a Rakt Mitra." : "Changes saved.", { recheck });
}

/** Removes a donation record: donors their own (any status), administrators any. */
export async function deleteDonation(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireViewer();
  const id = uuidSchema.safeParse(formData.get("record_id"));
  if (!id.success) return fail("Invalid record.");
  const supabase = await createClient();
  const { data: record } = await supabase.from("donation_records").select("donor_id").eq("id", id.data).maybeSingle();
  const { error, count } = await supabase.from("donation_records").delete({ count: "exact" }).eq("id", id.data);
  if (error) return fail(friendlyDbError(error));
  if (!count) return fail("You can't remove this record.");
  refreshDonationPages(record?.donor_id as string | undefined);
  // The removed row disappears from the list, so say so at the top of the page instead.
  const returnTo = formData.get("return_to");
  if (typeof returnTo === "string" && returnTo) {
    const next = new URL(safeNextPath(returnTo, "/donations"), "http://localhost");
    next.searchParams.set("removed", "1");
    redirect(next.pathname + next.search);
  }
  return success("Record removed.");
}
