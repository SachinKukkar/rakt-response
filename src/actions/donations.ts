"use server";

import { revalidatePath } from "next/cache";
import { fail, success, validationFailure, type ActionResult } from "@/lib/action-result";
import { requireViewer } from "@/lib/auth";
import { findPossibleDuplicates, type DonationLike } from "@/lib/donations";
import { friendlyDbError } from "@/lib/errors";
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
  return success("Donation recorded. It will show as self-reported until a volunteer verifies it.", {});
}

export async function deleteDonation(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const viewer = await requireViewer();
  const id = uuidSchema.safeParse(formData.get("record_id"));
  if (!id.success) return fail("Invalid record.");
  const supabase = await createClient();
  const { error, count } = await supabase
    .from("donation_records")
    .delete({ count: "exact" })
    .eq("id", id.data)
    .eq("donor_id", viewer.id)
    .eq("verification_status", "pending");
  if (error) return fail(friendlyDbError(error));
  if (!count) return fail("Only your own records that are still pending review can be removed.");
  revalidatePath("/donations");
  revalidatePath("/dashboard");
  return success("Record removed.");
}
