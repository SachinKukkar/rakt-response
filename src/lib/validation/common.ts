import { z } from "zod";
import {
  BLOOD_GROUPS,
  CONTACT_METHODS,
  DONATION_EXPERIENCE,
  DONATION_TYPES,
  DONOR_CONTACT_METHODS,
  INDIAN_STATES,
  REQUEST_TYPES,
  REQUESTER_CONTACT_METHODS,
  URGENCIES,
} from "@/lib/constants";
import { normalizePhone } from "@/lib/phone";

export const bloodGroupSchema = z.enum(BLOOD_GROUPS, { error: "Choose a blood group" });
export const donationTypeSchema = z.enum(DONATION_TYPES, { error: "Choose a donation type" });
export const requestTypeSchema = z.enum(REQUEST_TYPES, { error: "Choose what kind of donor is needed" });
export const urgencySchema = z.enum(URGENCIES, { error: "Choose the urgency" });
export const contactMethodSchema = z.enum(CONTACT_METHODS, { error: "Choose a contact method" });
export const donorContactMethodSchema = z.enum(DONOR_CONTACT_METHODS, { error: "Choose how patients can reach you" });
export const requesterContactMethodSchema = z.enum(REQUESTER_CONTACT_METHODS, { error: "Choose how donors can reach you" });
export const experienceSchema = z.enum(DONATION_EXPERIENCE, { error: "Choose one option" });
export const stateSchema = z.enum(INDIAN_STATES, { error: "Choose a state or union territory" });

export const uuidSchema = z.uuid("Invalid reference");

export const nameSchema = z
  .string()
  .trim()
  .min(2, "Please enter at least 2 characters")
  .max(100, "Please keep this under 100 characters")
  .regex(/^[^<>{}\\]*$/, "Please remove special characters such as < or >");

export const optionalText = (max: number, message = `Please keep this under ${max} characters`) =>
  z.string().trim().max(max, message);

export const displayNameSchema = optionalText(60).refine((v) => v === "" || v.length >= 2, "Use at least 2 characters or leave blank");

export const emailSchema = z.string().trim().toLowerCase().max(254).pipe(z.email("Enter a valid email address"));

export const optionalEmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(254)
  .refine((v) => v === "" || z.email().safeParse(v).success, "Enter a valid email address");

export const phoneSchema = z
  .string()
  .trim()
  .refine((v) => normalizePhone(v) !== null, "Enter a valid mobile number, e.g. 98765 43210");

export const optionalPhoneSchema = z
  .string()
  .trim()
  .refine((v) => v === "" || normalizePhone(v) !== null, "Enter a valid mobile number, e.g. 98765 43210");

export const pincodeSchema = z
  .string()
  .trim()
  .refine((v) => v === "" || /^[1-9]\d{5}$/.test(v), "PIN codes have 6 digits and do not start with 0");

export const placeSchema = (label: string, max = 80) =>
  z
    .string()
    .trim()
    .min(2, `Enter the ${label}`)
    .max(max, `Please keep the ${label} under ${max} characters`);

export const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date");

export const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters")
  .max(72, "Use at most 72 characters")
  .refine((v) => /[A-Za-z]/.test(v) && /\d/.test(v), "Include at least one letter and one number");

export const coordinatesSchema = z
  .object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  })
  .nullable();
