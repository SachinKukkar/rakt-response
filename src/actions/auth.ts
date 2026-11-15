"use server";

import { redirect } from "next/navigation";
import { fail, success, validationFailure, type ActionResult } from "@/lib/action-result";
import { isSupabaseConfigured, siteUrl } from "@/lib/env";
import { normalizePhone } from "@/lib/phone";
import { safeNextPath } from "@/lib/redirects";
import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import {
  forgotPasswordSchema,
  loginSchema,
  registrationSchema,
  resetPasswordSchema,
  type RegistrationInput,
} from "@/lib/validation/registration";

const NOT_CONFIGURED = "Accounts are not available yet: the Rakt Response database has not been configured.";

export async function signIn(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  if (!isSupabaseConfigured()) return fail(NOT_CONFIGURED);
  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return validationFailure(parsed.error);
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    if (/not confirmed/i.test(error.message)) {
      return fail("Please confirm your email address first. Check your inbox for the verification link.", { _unconfirmed: ["1"] });
    }
    if (error.status === 429) return fail("Too many sign-in attempts. Please wait a few minutes and try again.");
    // Same message for unknown email and wrong password (prevents account enumeration).
    return fail("The email or password is incorrect.");
  }
  const requested = String(formData.get("next") ?? "");
  if ((!requested || requested === "/dashboard") && data.user) {
    // Same login for everyone; administrators go straight to their hub.
    const { data: role } = await supabase.from("staff_roles").select("role").eq("user_id", data.user.id).eq("is_active", true).maybeSingle();
    if (role?.role === "admin") redirect("/admin");
  }
  redirect(safeNextPath(requested, "/dashboard"));
}

/** Builds the signup metadata consumed by the database bootstrap trigger. */
function toSignupMetadata(input: RegistrationInput) {
  const { account, donor, location, history, consent } = input;
  const isDonor = donor.is_donor;
  return {
    full_name: account.full_name,
    display_name: donor.display_name || undefined,
    is_donor: isDonor,
    blood_group: isDonor ? donor.blood_group : undefined,
    age_confirmed: isDonor ? donor.age_confirmed : false,
    donation_experience: isDonor ? donor.donation_experience || undefined : undefined,
    approx_previous_donations: isDonor && history.has_donated ? history.approx_previous_donations ?? undefined : undefined,
    phone: normalizePhone(donor.phone) ?? undefined,
    terms_accepted: account.accept_terms,
    location: location.state
      ? {
          state: location.state,
          district: location.district,
          city: location.city,
          locality: location.locality || undefined,
          pincode: location.pincode || undefined,
          lat: location.lat ?? undefined,
          lng: location.lng ?? undefined,
        }
      : undefined,
    preferences: {
      directory_visible: isDonor && consent.directory_visible,
      contact_consent: isDonor && consent.contact_consent,
      open_to_contact: isDonor && consent.contact_consent && consent.open_to_contact,
      emergency_alerts: isDonor && consent.emergency_alerts,
      show_donation_summary: isDonor && consent.show_donation_summary,
      preferred_contact_method: donor.preferred_contact_method,
      max_distance_km: location.max_distance_km ?? undefined,
    },
    donations:
      isDonor && history.has_donated
        ? history.donations.map((d) => ({
            donation_type: d.donation_type,
            donation_date: d.donation_date,
            centre_name: d.centre_name,
            city: d.city || undefined,
            district: d.district || undefined,
            event_name: d.event_name || undefined,
          }))
        : [],
  };
}

export async function registerDonor(input: RegistrationInput): Promise<ActionResult<{ signedIn: boolean }>> {
  if (!isSupabaseConfigured()) return fail(NOT_CONFIGURED);
  const parsed = registrationSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);

  const publicClient = createPublicClient();
  const { data: setting } = (await publicClient?.from("platform_settings").select("value").eq("key", "registration_open").maybeSingle()) ?? {
    data: null,
  };
  if (setting && setting.value === false) {
    return fail("New registrations are paused at the moment. Please check back soon.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.account.email,
    password: parsed.data.account.password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent("/dashboard?welcome=1")}`,
      data: toSignupMetadata(parsed.data),
    },
  });
  if (error) {
    console.error("[auth] sign-up failed", { status: error.status, code: error.code });
    if (error.status === 429) return fail("Too many sign-up attempts. Please wait a while and try again.");
    if (/password/i.test(error.message)) return fail("Please choose a stronger password.");
    return fail("We could not create your account. Please check your details and try again.");
  }
  // Supabase returns a user with no identities when the email already exists
  // (to avoid enumeration). Show the same neutral confirmation either way.
  if (data.session) {
    return success("Your account is ready.", { signedIn: true });
  }
  return success("Check your email to confirm your account.", { signedIn: false });
}

export async function requestPasswordReset(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  if (!isSupabaseConfigured()) return fail(NOT_CONFIGURED);
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return validationFailure(parsed.error);
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
  });
  if (error?.status === 429) return fail("Too many reset requests. Please wait a while and try again.");
  // Logged server-side only (never shown) so SMTP problems are diagnosable in hosting logs.
  if (error) console.error("[auth] password reset email failed", { status: error.status, code: error.code });
  // Always the same response, whether or not the account exists.
  return success("If an account exists for that email, a password reset link is on its way. It may take a few minutes.");
}

export async function resendVerification(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  if (!isSupabaseConfigured()) return fail(NOT_CONFIGURED);
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return validationFailure(parsed.error);
  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: parsed.data.email,
    options: { emailRedirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent("/dashboard?welcome=1")}` },
  });
  if (error?.status === 429) return fail("Please wait a little before requesting another email.");
  if (error) console.error("[auth] verification email resend failed", { status: error.status, code: error.code });
  return success("If that email is waiting for confirmation, we have sent a new link.");
}

export async function updatePassword(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  if (!isSupabaseConfigured()) return fail(NOT_CONFIGURED);
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirm_password: formData.get("confirm_password"),
  });
  if (!parsed.success) return validationFailure(parsed.error);
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims) return fail("Your reset link has expired. Please request a new one.");
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return fail("We could not update your password. Please choose a different password and try again.");
  redirect("/dashboard?notice=password-updated");
}
