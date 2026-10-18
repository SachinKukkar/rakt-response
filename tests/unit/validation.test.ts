import { describe, expect, it } from "vitest";
import { accountStepSchema, donorStepSchema, historyStepSchema, registrationSchema } from "@/lib/validation/registration";
import {
  adminDonorSchema,
  bloodRequestSchema,
  donationRecordSchema,
  donationReportSchema,
  followUpSchema,
  preferencesSchema,
  profileSchema,
  storySchema,
} from "@/lib/validation/forms";

const validRegistration = {
  account: { full_name: "Asha Fictional", email: "ASHA@Example.test ", password: "safePass1", confirm_password: "safePass1", accept_terms: true },
  donor: {
    is_donor: true,
    blood_group: "O+",
    age_confirmed: true,
    donation_experience: "regular",
    display_name: "",
    phone: "98765 43210",
    preferred_contact_method: "whatsapp",
  },
  location: { state: "Maharashtra", district: "Pune", city: "Pune", locality: "", pincode: "411038", lat: null, lng: null, max_distance_km: null },
  history: { has_donated: false, approx_previous_donations: null, donations: [] },
  consent: { hide_number: false, emergency_alerts: false, show_donation_summary: false },
};

describe("registration", () => {
  it("accepts a complete donor registration and normalises the email", () => {
    const parsed = registrationSchema.parse(validRegistration);
    expect(parsed.account.email).toBe("asha@example.test");
  });

  it("requires accepting terms and a strong-enough password", () => {
    const r = accountStepSchema.safeParse({ ...validRegistration.account, accept_terms: false, password: "short", confirm_password: "short" });
    const paths = r.success ? [] : r.error.issues.map((i) => i.path.join("."));
    expect(paths).toEqual(expect.arrayContaining(["accept_terms", "password"]));
  });

  it("requires matching passwords", () => {
    const r = accountStepSchema.safeParse({ ...validRegistration.account, confirm_password: "different1" });
    expect(r.success).toBe(false);
  });

  it("requires blood group and the age declaration only for donors", () => {
    expect(donorStepSchema.safeParse({ ...validRegistration.donor, blood_group: "", age_confirmed: false }).success).toBe(false);
    expect(
      donorStepSchema.safeParse({ ...validRegistration.donor, is_donor: false, blood_group: "", age_confirmed: false, donation_experience: "" }).success,
    ).toBe(true);
  });

  it("accepts the Bombay blood group (Oh)", () => {
    expect(donorStepSchema.safeParse({ ...validRegistration.donor, blood_group: "Oh" }).success).toBe(true);
    expect(donorStepSchema.safeParse({ ...validRegistration.donor, blood_group: "oh" }).success).toBe(false);
  });

  it("requires a phone number when phone or WhatsApp contact is preferred", () => {
    expect(donorStepSchema.safeParse({ ...validRegistration.donor, phone: "" }).success).toBe(false);
  });

  it("requires an area for donors but not for members", () => {
    const donor = registrationSchema.safeParse({ ...validRegistration, location: { ...validRegistration.location, state: "", district: "", city: "" } });
    expect(donor.success).toBe(false);
    const member = registrationSchema.safeParse({
      ...validRegistration,
      donor: { ...validRegistration.donor, is_donor: false, blood_group: "", age_confirmed: false, donation_experience: "", preferred_contact_method: "email", phone: "" },
      location: { ...validRegistration.location, state: "", district: "", city: "", pincode: "" },
    });
    expect(member.success).toBe(true);
  });

  it("offers donors Call, WhatsApp or Email, not In-app", () => {
    expect(donorStepSchema.safeParse({ ...validRegistration.donor, preferred_contact_method: "in_app" }).success).toBe(false);
    expect(donorStepSchema.safeParse({ ...validRegistration.donor, preferred_contact_method: "email", phone: "" }).success).toBe(true);
  });

  it("flags duplicate history entries and future dates", () => {
    const entry = { donation_type: "sdp", donation_date: "2025-01-01", centre_name: "Centre", city: "", district: "", event_name: "" };
    expect(historyStepSchema.safeParse({ has_donated: true, approx_previous_donations: null, donations: [entry, entry] }).success).toBe(false);
    expect(
      historyStepSchema.safeParse({ has_donated: true, approx_previous_donations: null, donations: [{ ...entry, donation_date: "2999-01-01" }] }).success,
    ).toBe(false);
  });

  it("rejects invalid PIN codes and markup in names", () => {
    expect(registrationSchema.safeParse({ ...validRegistration, location: { ...validRegistration.location, pincode: "011038" } }).success).toBe(false);
    expect(registrationSchema.safeParse({ ...validRegistration, account: { ...validRegistration.account, full_name: "<script>" } }).success).toBe(false);
  });
});

describe("blood requests", () => {
  const request = {
    patient_name: "Patient Fictional",
    patient_age: 54,
    patient_gender: "male",
    blood_group: "B+",
    request_type: "sdp",
    units_needed: 1,
    hospital_name: "Fictional Hospital",
    state: "",
    district: "Pune",
    city: "Pune",
    hospital_patient_id: "",
    ward: "",
    reason: "",
    required_by: "2026-10-12T10:30",
    urgency: "urgent",
    requester_name: "Requester Fictional",
    requester_relation: "child",
    requester_phone: "9876543210",
    requester_contact_method: "phone",
    notes: "",
    acknowledge_limits: true,
    website: "",
  };

  it("accepts a valid SDP request", () => {
    expect(bloodRequestSchema.safeParse(request).success).toBe(true);
  });

  it("accepts a request for the Bombay blood group (Oh)", () => {
    expect(bloodRequestSchema.safeParse({ ...request, blood_group: "Oh", request_type: "whole_blood" }).success).toBe(true);
  });

  it("requires acknowledging what the platform cannot guarantee", () => {
    expect(bloodRequestSchema.safeParse({ ...request, acknowledge_limits: false }).success).toBe(false);
  });

  it("requires the patient's details, the units and the requester's relation", () => {
    for (const missing of [{ patient_name: "" }, { patient_age: null }, { patient_gender: "" }, { units_needed: null }, { requester_relation: "" }]) {
      expect(bloodRequestSchema.safeParse({ ...request, ...missing }).success).toBe(false);
    }
  });

  it("requires a phone donors can call, by call or WhatsApp only", () => {
    expect(bloodRequestSchema.safeParse({ ...request, requester_phone: "" }).success).toBe(false);
    expect(bloodRequestSchema.safeParse({ ...request, requester_contact_method: "email" }).success).toBe(false);
    expect(bloodRequestSchema.safeParse({ ...request, requester_contact_method: "whatsapp" }).success).toBe(true);
  });

  it("trips the spam honeypot", () => {
    expect(bloodRequestSchema.safeParse({ ...request, website: "http://spam.example" }).success).toBe(false);
  });
});

describe("other forms", () => {
  it("a donation report needs a day, not in the future, only when the donor says they donated", () => {
    const id = "00000000-0000-4000-8000-000000000000";
    expect(donationReportSchema.safeParse({ request_id: id, donated: true, donation_date: "2026-10-18" }).success).toBe(true);
    expect(donationReportSchema.safeParse({ request_id: id, donated: true, donation_date: null }).success).toBe(false);
    expect(donationReportSchema.safeParse({ request_id: id, donated: true, donation_date: "2999-01-01" }).success).toBe(false);
    expect(donationReportSchema.safeParse({ request_id: id, donated: false, donation_date: null }).success).toBe(true);
  });

  it("a follow-up note stays short", () => {
    const ids = { request_id: "00000000-0000-4000-8000-000000000000", donor_id: "00000000-0000-4000-8000-000000000001" };
    expect(followUpSchema.safeParse({ ...ids, note: "" }).success).toBe(true);
    expect(followUpSchema.safeParse({ ...ids, note: "x".repeat(501) }).success).toBe(false);
  });

  it("donation records cannot be in the future", () => {
    expect(
      donationRecordSchema.safeParse({ donation_type: "whole_blood", donation_date: "2999-01-01", centre_name: "Centre", city: "", district: "", event_name: "" })
        .success,
    ).toBe(false);
  });

  it("preferences take Hide my number and a donor channel, not In-app", () => {
    const prefs = {
      hide_number: true,
      open_to_contact: true,
      emergency_alerts: false,
      show_donation_summary: false,
      show_first_name: false,
      notify_status_updates: true,
      preferred_contact_method: "whatsapp",
      max_distance_km: null,
    };
    expect(preferencesSchema.safeParse(prefs).success).toBe(true);
    expect(preferencesSchema.safeParse({ ...prefs, preferred_contact_method: "in_app" }).success).toBe(false);
  });

  it("stories need publish consent, rights confirmation and a private follow-up contact", () => {
    const story = {
      story_type: "attendant",
      contributor_name: "Family Member",
      public_display_name: "",
      follow_up_email: "family@example.test",
      follow_up_phone: "",
      city: "Pune",
      title: "When we needed platelets",
      body: "A".repeat(100),
      experience_period: "",
      donation_type: "",
      blood_group: "",
      supporting_details: "",
      consent_contact: true,
      consent_publish: true,
      consent_show_name: false,
      consent_show_photo: false,
      consent_show_personal: false,
      rights_confirmed: true,
    };
    expect(storySchema.safeParse(story).success).toBe(true);
    expect(storySchema.safeParse({ ...story, consent_publish: false }).success).toBe(false);
    expect(storySchema.safeParse({ ...story, rights_confirmed: false }).success).toBe(false);
    expect(storySchema.safeParse({ ...story, follow_up_email: "" }).success).toBe(false);
  });
});

describe("profile and admin edits", () => {
  const profile = { full_name: "Fictional Donor", display_name: "", donation_experience: "" as const, approx_previous_donations: null, phone: "", whatsapp: "" };

  it("accepts an optional bio up to 280 characters", () => {
    expect(profileSchema.safeParse({ ...profile, bio: "" }).success).toBe(true);
    expect(profileSchema.safeParse({ ...profile, bio: "x".repeat(280) }).success).toBe(true);
    expect(profileSchema.safeParse({ ...profile, bio: "x".repeat(281) }).success).toBe(false);
  });

  const admin = {
    profile_id: "00000000-0000-4000-8000-000000000001",
    full_name: "Fictional Donor",
    display_name: "",
    blood_group: "O-",
    phone: "",
    whatsapp: "",
    state: "Maharashtra",
    district: "Pune",
    city: "Pune",
    locality: "",
    pincode: "411001",
  };

  it("lets administrators correct details", () => {
    expect(adminDonorSchema.safeParse(admin).success).toBe(true);
    expect(adminDonorSchema.safeParse({ ...admin, state: "", district: "", city: "", blood_group: "" }).success).toBe(true);
  });

  it("requires the area fields together and a valid blood group", () => {
    expect(adminDonorSchema.safeParse({ ...admin, city: "" }).success).toBe(false);
    expect(adminDonorSchema.safeParse({ ...admin, blood_group: "Z+" }).success).toBe(false);
    expect(adminDonorSchema.safeParse({ ...admin, blood_group: "Oh" }).success).toBe(true);
  });
});
