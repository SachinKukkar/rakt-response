import { z } from "zod";
import {
  bloodGroupSchema,
  donorContactMethodSchema,
  displayNameSchema,
  donationTypeSchema,
  emailSchema,
  experienceSchema,
  isoDateSchema,
  nameSchema,
  optionalPhoneSchema,
  optionalText,
  passwordSchema,
  pincodeSchema,
  placeSchema,
  stateSchema,
} from "./common";
import { todayInIndia } from "@/lib/format";

/* Each wizard step has its own schema so the UI can validate one step at a
 * time; `registrationSchema` combines them (plus cross-field rules) and is
 * what the server action enforces. */

export const accountStepSchema = z
  .object({
    full_name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirm_password: z.string(),
    accept_terms: z.boolean().refine((v) => v, "You need to accept the privacy policy and terms to continue"),
  })
  .refine((v) => v.password === v.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export const donorStepSchema = z
  .object({
    is_donor: z.boolean(),
    blood_group: z.union([bloodGroupSchema, z.literal("")]),
    age_confirmed: z.boolean(),
    donation_experience: z.union([experienceSchema, z.literal("")]),
    display_name: displayNameSchema,
    phone: optionalPhoneSchema,
    preferred_contact_method: donorContactMethodSchema,
  })
  .superRefine((v, ctx) => {
    if (!v.is_donor) return;
    if (!v.blood_group) ctx.addIssue({ code: "custom", path: ["blood_group"], message: "Choose your blood group" });
    if (!v.age_confirmed) {
      ctx.addIssue({ code: "custom", path: ["age_confirmed"], message: "Please confirm the age declaration to register as a donor" });
    }
    if (!v.donation_experience) ctx.addIssue({ code: "custom", path: ["donation_experience"], message: "Choose one option" });
    if ((v.preferred_contact_method === "phone" || v.preferred_contact_method === "whatsapp") && !v.phone) {
      ctx.addIssue({ code: "custom", path: ["phone"], message: "Add a mobile number for phone or WhatsApp contact" });
    }
  });

export const locationStepSchema = z.object({
  state: z.union([stateSchema, z.literal("")]),
  district: optionalText(60),
  city: optionalText(80),
  locality: optionalText(100),
  pincode: pincodeSchema,
  lat: z.number().min(-90).max(90).nullable(),
  lng: z.number().min(-180).max(180).nullable(),
  max_distance_km: z.number().int().min(1).max(500).nullable(),
});

export const historyEntrySchema = z.object({
  donation_type: donationTypeSchema,
  donation_date: isoDateSchema.refine((d) => d <= todayInIndia(), "The date cannot be in the future").refine((d) => d >= "1950-01-01", "Check the year"),
  centre_name: placeSchema("hospital, blood bank or centre", 150),
  city: optionalText(80),
  district: optionalText(60),
  event_name: optionalText(120),
});

export const historyStepSchema = z
  .object({
    has_donated: z.boolean(),
    approx_previous_donations: z.number().int().min(0).max(500).nullable(),
    donations: z.array(historyEntrySchema).max(20, "You can add up to 20 records now and more later"),
  })
  .superRefine((v, ctx) => {
    const seen = new Set<string>();
    v.donations.forEach((d, i) => {
      const key = `${d.donation_type}:${d.donation_date}`;
      if (seen.has(key)) {
        ctx.addIssue({ code: "custom", path: ["donations", i, "donation_date"], message: "This looks like a duplicate of another entry" });
      }
      seen.add(key);
    });
  });

export const consentStepSchema = z.object({
  /** Hidden donors are never listed to patients; volunteers can still reach them. */
  hide_number: z.boolean(),
  emergency_alerts: z.boolean(),
  show_donation_summary: z.boolean(),
});

export const registrationSchema = z
  .object({
    account: accountStepSchema,
    donor: donorStepSchema,
    location: locationStepSchema,
    history: historyStepSchema,
    consent: consentStepSchema,
  })
  .superRefine((v, ctx) => {
    if (!v.donor.is_donor) return;
    if (!v.location.state) ctx.addIssue({ code: "custom", path: ["location", "state"], message: "Choose your state" });
    if (v.location.district.length < 2) ctx.addIssue({ code: "custom", path: ["location", "district"], message: "Enter your district" });
    if (v.location.city.length < 2) ctx.addIssue({ code: "custom", path: ["location", "city"], message: "Enter your city or town" });
  });

export type RegistrationInput = z.infer<typeof registrationSchema>;

/** Location rules for a donor (used outside the wizard, e.g. profile edit). */
export const donorLocationSchema = z.object({
  state: stateSchema,
  district: placeSchema("district", 60),
  city: placeSchema("city or town", 80),
  locality: optionalText(100),
  pincode: pincodeSchema,
  lat: z.number().min(-90).max(90).nullable(),
  lng: z.number().min(-180).max(180).nullable(),
  max_distance_km: z.number().int().min(1).max(500).nullable(),
});
export type DonorLocationInput = z.infer<typeof donorLocationSchema>;

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password").max(72),
});

export const forgotPasswordSchema = z.object({ email: emailSchema });

export const resetPasswordSchema = z
  .object({ password: passwordSchema, confirm_password: z.string() })
  .refine((v) => v.password === v.confirm_password, { message: "Passwords do not match", path: ["confirm_password"] });
