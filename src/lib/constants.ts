export const SITE = {
  name: "Rakt Response",
  tagline: "We Respond, We Support, We Save Lives.",
  /** Signature tagline; closes the mission on the About page. */
  signature: "A Wish to Bring a Special Smile",
  headline: "Every Donor Matters. Every Response Can Save a Life.",
  description: "Connecting voluntary blood donors with people who need help, one response at a time.",
  /** The logo mark (a drop held in a hand), cut from the supplied logo file. */
  logo: "/brand/logo-mark.png",
  /** The year Rakt Response started. */
  since: 2022,
} as const;

/** Team members visitors can call directly (contact page, homepage and footer). */
export const TEAM_CONTACTS = [
  { name: "Abhilash Singh Rathore", phone: "+917426943985" },
  { name: "Sachin Kukkar", phone: "+918766633316" },
] as const;

/** The volunteers who run Rakt Response. */
export const CORE_TEAM = ["Sachin Kukkar", "Abhilash Singh Rathore", "Priyanka Virwani"] as const;

/**
 * The eight ABO/Rh groups plus the rare Bombay phenotype, written "Oh".
 * Matching is by exact group, so an Oh request only ever reaches Oh donors
 * (people with Oh can receive Oh blood only). Mirrors public.blood_group.
 */
export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Oh"] as const;
export type BloodGroup = (typeof BLOOD_GROUPS)[number];

/** Option text for lists and menus, where a bare "Oh" could be misread. */
export function bloodGroupName(group: BloodGroup): string {
  return group === "Oh" ? "Oh (Bombay)" : group;
}

export const DONATION_TYPES = ["whole_blood", "sdp", "other_apheresis", "unknown"] as const;
export type DonationType = (typeof DONATION_TYPES)[number];

export const DONATION_TYPE_LABELS: Record<DonationType, string> = {
  whole_blood: "Whole blood",
  sdp: "SDP (single donor platelets)",
  other_apheresis: "Other apheresis",
  unknown: "Not sure",
};

export const DONATION_TYPE_SHORT: Record<DonationType, string> = {
  whole_blood: "Whole blood",
  sdp: "SDP",
  other_apheresis: "Apheresis",
  unknown: "Unknown type",
};

export const REQUEST_TYPES = ["whole_blood", "sdp", "other_apheresis"] as const;
export type RequestType = (typeof REQUEST_TYPES)[number];
export const REQUEST_TYPE_LABELS: Record<RequestType, string> = {
  whole_blood: "Whole blood donors",
  sdp: "SDP / platelet donors",
  other_apheresis: "Other apheresis donors",
};

export const URGENCIES = ["routine", "urgent", "critical"] as const;
export type Urgency = (typeof URGENCIES)[number];
export const URGENCY_LABELS: Record<Urgency, string> = {
  routine: "Planned",
  urgent: "Urgent",
  critical: "Emergency",
};

export const REQUEST_STATUSES = [
  "draft",
  "submitted",
  "under_verification",
  "verified",
  "in_coordination",
  "fulfilled",
  "cancelled",
  "expired",
  "rejected",
] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];
export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  under_verification: "Under verification",
  verified: "Verified",
  in_coordination: "In coordination",
  fulfilled: "Fulfilled",
  cancelled: "Cancelled",
  expired: "Expired",
  rejected: "Not verified",
};
export const OPEN_REQUEST_STATUSES: RequestStatus[] = ["submitted", "under_verification", "verified", "in_coordination"];
export const CLOSED_REQUEST_STATUSES: RequestStatus[] = ["fulfilled", "cancelled", "expired", "rejected"];

/** Mirrors private.request_transition_allowed() in the database. */
export const REQUEST_TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  draft: ["submitted", "cancelled"],
  submitted: ["under_verification", "verified", "rejected", "cancelled", "expired"],
  under_verification: ["verified", "rejected", "cancelled", "expired"],
  verified: ["in_coordination", "fulfilled", "cancelled", "expired"],
  in_coordination: ["verified", "fulfilled", "cancelled", "expired"],
  fulfilled: [],
  cancelled: [],
  expired: [],
  rejected: [],
};

export const RESPONSE_STATUSES = ["interested", "unavailable", "declined", "no_response"] as const;
export type ResponseStatus = (typeof RESPONSE_STATUSES)[number];
export const RESPONSE_LABELS: Record<ResponseStatus, string> = {
  interested: "Interested",
  unavailable: "Unavailable",
  declined: "Declined",
  no_response: "No response",
};

export const OUTCOMES = ["pending", "donated", "did_not_donate", "not_required", "unreachable"] as const;
export type Outcome = (typeof OUTCOMES)[number];
export const OUTCOME_LABELS: Record<Outcome, string> = {
  pending: "Pending",
  donated: "Donated (confirmed)",
  did_not_donate: "Did not donate",
  not_required: "No longer required",
  unreachable: "Unreachable",
};

export const CONTACT_METHODS = ["phone", "whatsapp", "email", "in_app"] as const;
export type ContactMethod = (typeof CONTACT_METHODS)[number];
export const CONTACT_METHOD_LABELS: Record<ContactMethod, string> = {
  phone: "Phone call",
  whatsapp: "WhatsApp",
  email: "Email",
  in_app: "In-app only",
};

export const DONATION_EXPERIENCE = ["first_time", "occasional", "regular"] as const;
export type DonationExperience = (typeof DONATION_EXPERIENCE)[number];
export const DONATION_EXPERIENCE_LABELS: Record<DonationExperience, string> = {
  first_time: "I haven't donated yet",
  occasional: "I have donated once or a few times",
  regular: "I donate regularly",
};

export const RECORD_SOURCE_LABELS = {
  self_reported: "Self-reported",
  volunteer_verified: "Volunteer-verified",
  admin_verified: "Administrator-verified",
  imported: "Imported",
} as const;
export type RecordSource = keyof typeof RECORD_SOURCE_LABELS;

export const VERIFICATION_LABELS = {
  pending: "Pending review",
  verified: "Verified",
  rejected: "Not verified",
} as const;
export type VerificationStatus = keyof typeof VERIFICATION_LABELS;

export const PROFILE_VERIFICATION_LABELS = {
  unverified: "Not yet verified",
  pending: "Verification in progress",
  verified: "Verified donor",
  rejected: "Verification unsuccessful",
} as const;
export type ProfileVerification = keyof typeof PROFILE_VERIFICATION_LABELS;

export const STORY_TYPES = ["donor", "attendant", "recipient", "volunteer", "camp"] as const;
export type StoryType = (typeof STORY_TYPES)[number];
export const STORY_TYPE_LABELS: Record<StoryType, string> = {
  donor: "Donor story",
  attendant: "Patient attendant / family",
  recipient: "Recipient",
  volunteer: "Volunteer experience",
  camp: "Donation camp",
};

/** Public filter categories on /stories. */
export const STORY_CATEGORIES = {
  donors: { label: "Donor stories", types: ["donor"] },
  hope: { label: "Stories of Hope", types: ["attendant", "recipient"] },
  volunteers: { label: "Volunteer stories", types: ["volunteer"] },
  camps: { label: "Donation camps", types: ["camp"] },
} as const satisfies Record<string, { label: string; types: StoryType[] }>;
export type StoryCategory = keyof typeof STORY_CATEGORIES;

export const STORY_STATUSES = [
  "draft",
  "submitted",
  "under_review",
  "verification_requested",
  "approved",
  "rejected",
  "published",
  "unpublished",
  "archived",
] as const;
export type StoryStatus = (typeof STORY_STATUSES)[number];
export const STORY_STATUS_LABELS: Record<StoryStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  under_review: "Under review",
  verification_requested: "More information requested",
  approved: "Approved",
  rejected: "Not approved",
  published: "Published",
  unpublished: "Unpublished",
  archived: "Archived",
};
/** Mirrors private.story_transition_allowed(). */
export const STORY_TRANSITIONS: Record<StoryStatus, StoryStatus[]> = {
  draft: ["submitted", "archived"],
  submitted: ["under_review", "rejected", "archived"],
  under_review: ["verification_requested", "approved", "rejected", "archived"],
  verification_requested: ["under_review", "approved", "rejected", "archived"],
  approved: ["published", "under_review", "rejected", "archived"],
  published: ["unpublished"],
  unpublished: ["published", "under_review", "archived"],
  rejected: ["under_review", "archived"],
  archived: [],
};

export const TRUST_LABELS = {
  identity_verified: {
    label: "Identity Verified",
    description: "An authorised team member checked who the contributor is. This does not by itself confirm every detail of the story.",
  },
  experience_reviewed: {
    label: "Experience Reviewed",
    description: "An authorised reviewer checked the story for consistency and supporting details.",
  },
  donation_verified: {
    label: "Donation Verified",
    description: "The specific donation mentioned was matched to a verified donation record.",
  },
  impact_verified: {
    label: "Impact Data Verified",
    description: "The figure has a documented source and a recorded verification date.",
  },
} as const;

export const INDIAN_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
] as const;

export const PAGE_SIZE = 20;
