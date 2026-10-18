import { z } from "zod";
import {
  bloodGroupSchema,
  displayNameSchema,
  donationTypeSchema,
  donorContactMethodSchema,
  experienceSchema,
  isoDateSchema,
  nameSchema,
  optionalEmailSchema,
  optionalPhoneSchema,
  optionalText,
  phoneSchema,
  pincodeSchema,
  placeSchema,
  requesterContactMethodSchema,
  requestTypeSchema,
  stateSchema,
  urgencySchema,
  uuidSchema,
} from "./common";
import { PATIENT_GENDERS, REQUEST_REASONS, REQUESTER_RELATIONS, STORY_TYPES } from "@/lib/constants";
import { todayInIndia } from "@/lib/format";

// --- Profile -----------------------------------------------------------------
export const profileSchema = z.object({
  full_name: nameSchema,
  display_name: displayNameSchema,
  donation_experience: z.union([experienceSchema, z.literal("")]),
  approx_previous_donations: z.number().int().min(0).max(500).nullable(),
  phone: optionalPhoneSchema,
  whatsapp: optionalPhoneSchema,
  bio: optionalText(280, "Please keep this under 280 characters"),
});
export type ProfileInput = z.infer<typeof profileSchema>;

export const bloodGroupChangeSchema = z.object({ blood_group: bloodGroupSchema });

export const preferencesSchema = z.object({
  hide_number: z.boolean(),
  open_to_contact: z.boolean(),
  emergency_alerts: z.boolean(),
  show_donation_summary: z.boolean(),
  show_first_name: z.boolean(),
  notify_status_updates: z.boolean(),
  preferred_contact_method: donorContactMethodSchema,
  max_distance_km: z.number().int().min(1).max(500).nullable(),
});
export type PreferencesInput = z.infer<typeof preferencesSchema>;

// --- Donation records --------------------------------------------------------
export const donationRecordSchema = z.object({
  donation_type: donationTypeSchema,
  donation_date: isoDateSchema
    .refine((d) => d <= todayInIndia(), "The date cannot be in the future")
    .refine((d) => d >= "1950-01-01", "Check the year"),
  centre_name: placeSchema("hospital, blood bank or centre", 150),
  city: optionalText(80),
  district: optionalText(60),
  event_name: optionalText(120),
  confirm_duplicate: z.boolean().optional(),
});
export type DonationRecordInput = z.infer<typeof donationRecordSchema>;

// --- Blood requests ----------------------------------------------------------
export const bloodRequestSchema = z.object({
  patient_name: z.string().trim().min(2, "Enter the patient's name").max(100, "Please keep the name under 100 characters"),
  patient_age: z
    .number({ error: "Enter the patient's age" })
    .int("Enter the age in years")
    .min(0, "Enter the age in years")
    .max(120, "Enter the age in years")
    .nullable()
    .refine((v): boolean => v !== null, "Enter the patient's age"),
  patient_gender: z.union([z.enum(PATIENT_GENDERS), z.literal("")]).refine((v): boolean => v !== "", "Choose one"),
  blood_group: bloodGroupSchema,
  request_type: requestTypeSchema,
  units_needed: z
    .number({ error: "How many units are needed?" })
    .int()
    .min(1, "At least 1")
    .max(50, "Contact the blood bank for larger requirements")
    .nullable()
    .refine((v): boolean => v !== null, "How many units are needed?"),
  hospital_name: placeSchema("hospital or blood bank", 150),
  state: z.union([stateSchema, z.literal("")]),
  district: placeSchema("district", 60),
  city: placeSchema("city", 80),
  hospital_patient_id: optionalText(40),
  ward: optionalText(60),
  reason: z.union([z.enum(REQUEST_REASONS), z.literal("")]),
  required_by: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Choose the date and time"),
  urgency: urgencySchema,
  requester_name: nameSchema,
  requester_relation: z.union([z.enum(REQUESTER_RELATIONS), z.literal("")]).refine((v): boolean => v !== "", "Choose your relation to the patient"),
  requester_phone: phoneSchema,
  requester_contact_method: requesterContactMethodSchema,
  notes: optionalText(1000),
  acknowledge_limits: z.boolean().refine((v) => v, "Please confirm you have read how Rakt Response can help"),
  website: z.string().max(0, "Leave this field empty").optional(), // honeypot
});
export type BloodRequestInput = z.infer<typeof bloodRequestSchema>;

export const requestStatusChangeSchema = z.object({
  request_id: uuidSchema,
  status: z.enum(["under_verification", "verified", "in_coordination", "fulfilled", "cancelled", "expired", "rejected"]),
  reason: optionalText(500),
});

export const coordinationSchema = z.object({
  request_id: uuidSchema,
  donor_id: uuidSchema,
  response: z.enum(["interested", "unavailable", "declined", "no_response"]).nullable(),
  outcome: z.enum(["pending", "donated", "did_not_donate", "not_required", "unreachable"]).nullable(),
  attempted: z.boolean(),
});

export const contactRequestSchema = z.object({
  donor_id: uuidSchema,
  request_id: uuidSchema,
  message: optionalText(500),
});

export const assignmentUpdateSchema = z.object({
  assignment_id: uuidSchema,
  status: z.enum(["active", "completed", "released"]),
  follow_up_at: z.string().regex(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})?$/),
  notes: optionalText(1000),
});

export const internalNoteSchema = z.object({
  subject_type: z.enum(["profile", "donation_record", "blood_request", "story", "camp"]),
  subject_id: uuidSchema,
  body: z.string().trim().min(1, "Write a note").max(2000),
});

// --- Stories -----------------------------------------------------------------
export const storySchema = z
  .object({
    story_type: z.enum(STORY_TYPES, { error: "Choose the kind of story" }),
    contributor_name: nameSchema,
    public_display_name: displayNameSchema,
    follow_up_email: optionalEmailSchema,
    follow_up_phone: optionalPhoneSchema,
    city: optionalText(80),
    title: z.string().trim().min(5, "Use at least 5 characters").max(120, "Keep the title under 120 characters"),
    body: z.string().trim().min(80, "Please write at least 80 characters").max(6000, "Please keep the story under 6000 characters"),
    experience_period: optionalText(60),
    donation_type: z.union([donationTypeSchema, z.literal("")]),
    blood_group: z.union([bloodGroupSchema, z.literal("")]),
    supporting_details: optionalText(2000),
    consent_contact: z.boolean(),
    consent_publish: z.boolean().refine((v) => v, "Consent to publish is required to submit a story"),
    consent_show_name: z.boolean(),
    consent_show_photo: z.boolean(),
    consent_show_personal: z.boolean(),
    rights_confirmed: z.boolean().refine((v) => v, "Please confirm you have the right to share this content"),
  })
  .superRefine((v, ctx) => {
    if (!v.follow_up_email && !v.follow_up_phone) {
      ctx.addIssue({ code: "custom", path: ["follow_up_email"], message: "Share an email or phone so a reviewer can follow up privately" });
    }
  });
export type StoryInput = z.infer<typeof storySchema>;

export const storyPublicContentSchema = z.object({
  story_id: uuidSchema,
  public_title: optionalText(120),
  public_body: optionalText(6000),
  public_excerpt: optionalText(240),
  public_display_name: displayNameSchema,
  show_name: z.boolean(),
  show_photo: z.boolean(),
  show_personal: z.boolean(),
  show_city: z.boolean(),
});

// --- Admin -------------------------------------------------------------------
export const campSchema = z
  .object({
    name: z.string().trim().min(3).max(150),
    camp_date: isoDateSchema,
    state: z.union([stateSchema, z.literal("")]),
    district: placeSchema("district", 60),
    city: placeSchema("city", 80),
    venue_area: optionalText(120),
    organizing_partners: optionalText(300),
    partners_confirmed: z.boolean(),
    status: z.enum(["planned", "completed", "cancelled"]),
    registrations_count: z.number().int().min(0).nullable(),
    verified_donor_count: z.number().int().min(0).nullable(),
    verified_units_collected: z.number().int().min(0).nullable(),
    volunteer_count: z.number().int().min(0).nullable(),
    highlights: optionalText(2000),
    learnings: optionalText(2000),
    data_source: optionalText(300),
    is_public: z.boolean(),
  })
  .superRefine((v, ctx) => {
    const hasVerified = v.verified_donor_count !== null || v.verified_units_collected !== null;
    if (hasVerified && v.status !== "completed") {
      ctx.addIssue({ code: "custom", path: ["status"], message: "Verified figures can only be recorded for completed camps" });
    }
    if (hasVerified && v.data_source.length < 5) {
      ctx.addIssue({ code: "custom", path: ["data_source"], message: "Document where the verified figures come from" });
    }
  });

export const metricSourceSchema = z
  .object({
    metric_key: z.string().regex(/^[a-z0-9_]{3,60}$/, "Use lowercase letters, numbers and underscores"),
    label: z.string().trim().min(3).max(120),
    value: z.number().min(0),
    unit: optionalText(30),
    period_start: z.union([isoDateSchema, z.literal("")]),
    period_end: z.union([isoDateSchema, z.literal("")]),
    source_description: z.string().trim().min(5, "Describe the source").max(500),
    verified_at: isoDateSchema,
    is_public: z.boolean(),
  })
  .refine((v) => !v.period_start || !v.period_end || v.period_start <= v.period_end, {
    message: "The period end must be after the start",
    path: ["period_end"],
  });

/** Administrator corrections to a donor's record. Area fields are all-or-nothing. */
export const adminDonorSchema = z
  .object({
    profile_id: uuidSchema,
    full_name: nameSchema,
    display_name: displayNameSchema,
    blood_group: z.union([bloodGroupSchema, z.literal("")]),
    phone: optionalPhoneSchema,
    whatsapp: optionalPhoneSchema,
    state: z.union([stateSchema, z.literal("")]),
    district: optionalText(80),
    city: optionalText(80),
    locality: optionalText(120),
    pincode: pincodeSchema,
  })
  .refine((v) => (v.state === "") === (v.district === "") && (v.state === "") === (v.city === ""), {
    message: "Fill in state, district and city together",
    path: ["city"],
  });
export type AdminDonorInput = z.infer<typeof adminDonorSchema>;

export const staffRoleSchema = z.object({
  user_id: uuidSchema,
  role: z.enum(["volunteer", "admin"]),
  can_verify_donations: z.boolean(),
  can_verify_requests: z.boolean(),
  can_export: z.boolean(),
});

export const settingsSchema = z.object({
  "org.contact_email": optionalEmailSchema,
  "org.contact_phone": optionalPhoneSchema,
  "org.whatsapp": optionalPhoneSchema,
  "org.service_area": optionalText(200),
  registration_open: z.boolean(),
  whole_blood_interval_days: z.number().int().min(56).max(365),
  apheresis_interval_days: z.number().int().min(2).max(90),
  eligible_donor_list_size: z.number().int().min(5).max(100),
  requester_reveal_hourly_limit: z.number().int().min(1).max(100),
  requester_reveal_monthly_donors: z.number().int().min(1).max(500),
  requester_open_request_limit: z.number().int().min(1).max(20),
  donor_join_daily_limit: z.number().int().min(1).max(20),
  donor_open_join_limit: z.number().int().min(1).max(20),
  member_request_daily_limit: z.number().int().min(1).max(50),
  contact_reveal_hourly_limit: z.number().int().min(1).max(200),
  contact_request_hourly_limit: z.number().int().min(1).max(200),
  request_alert_max_donors: z.number().int().min(0).max(200),
  request_expiry_grace_hours: z.number().int().min(1).max(168),
  story_daily_limit: z.number().int().min(1).max(20),
});
export type SettingsInput = z.infer<typeof settingsSchema>;
