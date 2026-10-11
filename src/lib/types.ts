import type {
  BloodGroup,
  ContactMethod,
  DonationExperience,
  DonationType,
  Outcome,
  ProfileVerification,
  RecordSource,
  RequestStatus,
  RequestType,
  ResponseStatus,
  StoryStatus,
  StoryType,
  Urgency,
  VerificationStatus,
} from "@/lib/constants";

/* Row shapes for the columns the app selects. Generate full types with
 * `supabase gen types typescript` once a project is linked (see README). */

export interface ProfileRow {
  id: string;
  full_name: string;
  display_name: string | null;
  bio: string | null;
  is_donor: boolean;
  blood_group: BloodGroup | null;
  blood_group_verified: boolean;
  requested_blood_group: BloodGroup | null;
  age_confirmed: boolean;
  donation_experience: DonationExperience | null;
  approx_previous_donations: number | null;
  verification_status: ProfileVerification;
  verified_at: string | null;
  photo_path: string | null;
  is_active: boolean;
  deletion_requested_at: string | null;
  last_active_at: string;
  created_at: string;
}

export interface StaffRoleRow {
  user_id: string;
  role: "volunteer" | "admin";
  can_verify_donations: boolean;
  can_verify_requests: boolean;
  can_export: boolean;
  is_active: boolean;
}

export interface PreferencesRow {
  profile_id: string;
  directory_visible: boolean;
  directory_consent_at: string | null;
  contact_consent: boolean;
  contact_consent_at: string | null;
  emergency_alerts: boolean;
  emergency_consent_at: string | null;
  open_to_contact: boolean;
  show_donation_summary: boolean;
  show_first_name: boolean;
  preferred_contact_method: ContactMethod;
  max_distance_km: number | null;
  notify_status_updates: boolean;
}

export interface LocationRow {
  profile_id: string;
  state: string;
  district: string;
  city: string;
  locality: string | null;
  pincode: string | null;
  approx_lat: number | null;
  approx_lng: number | null;
}

export interface ContactsRow {
  profile_id: string;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
}

export interface DonationRecordRow {
  id: string;
  donor_id: string;
  donation_type: DonationType;
  donation_date: string;
  centre_name: string;
  city: string | null;
  district: string | null;
  event_name: string | null;
  record_source: RecordSource;
  verification_status: VerificationStatus;
  verified_at: string | null;
  review_reason: string | null;
  created_at: string;
}

export interface BloodRequestRow {
  id: string;
  reference_code: string;
  created_by: string | null;
  requester_name: string;
  requester_phone: string | null;
  requester_email: string | null;
  requester_contact_method: ContactMethod;
  blood_group: BloodGroup;
  request_type: RequestType;
  units_needed: number | null;
  hospital_name: string;
  state: string | null;
  district: string;
  city: string;
  required_by: string;
  urgency: Urgency;
  notes: string | null;
  public_listing_consent: boolean;
  status: RequestStatus;
  verified_at: string | null;
  closed_at: string | null;
  closure_reason: string | null;
  possible_duplicate_of: string | null;
  created_at: string;
  updated_at: string;
}

export interface PublicRequestRow {
  id: string;
  reference_code: string;
  blood_group: BloodGroup;
  request_type: RequestType;
  units_needed: number | null;
  hospital_name: string;
  city: string;
  district: string;
  required_by: string;
  urgency: Urgency;
  status: RequestStatus;
  verified_at: string | null;
  total_count?: number;
}

export interface RequestEventRow {
  id: number;
  request_id: string;
  actor_id: string | null;
  event_type: string;
  from_status: RequestStatus | null;
  to_status: RequestStatus | null;
  note: string | null;
  created_at: string;
}

export interface DirectoryDonor {
  donor_id: string;
  display_name: string;
  blood_group: BloodGroup;
  state: string;
  district: string;
  city: string;
  locality: string | null;
  verification_status: ProfileVerification;
  open_to_contact: boolean;
  contact_consent: boolean;
  show_donation_summary: boolean;
  last_verified_whole_blood: string | null;
  last_verified_sdp: string | null;
  verified_whole_blood_count: number | null;
  verified_sdp_count: number | null;
  has_sdp_history: boolean | null;
  last_active_at: string;
  distance_km: number | null;
  total_count: number;
}

export interface MatchedDonor {
  donor_id: string;
  display_name: string;
  blood_group: BloodGroup;
  city: string;
  locality: string | null;
  verification_status: ProfileVerification;
  open_to_contact: boolean;
  contact_consent: boolean;
  has_sdp_history: boolean;
  last_verified_sdp: string | null;
  last_verified_whole_blood: string | null;
  last_active_at: string;
  response: ResponseStatus | null;
  outcome: Outcome | null;
  contact_attempts: number;
  contact_request_status: "pending" | "accepted" | "declined" | "cancelled" | "expired" | null;
  total_count: number;
}

export interface NotificationRow {
  id: string;
  kind: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
}

export interface StoryCard {
  slug: string;
  story_type: StoryType;
  title: string;
  excerpt: string;
  display_name: string | null;
  city: string | null;
  photo_path: string | null;
  identity_verified: boolean;
  experience_reviewed: boolean;
  donation_verified: boolean;
  donation_type: DonationType | null;
  published_at: string;
  total_count?: number;
}

export interface StoryRow {
  id: string;
  slug: string | null;
  story_type: StoryType;
  contributor_id: string | null;
  contributor_name: string;
  follow_up_email: string | null;
  follow_up_phone: string | null;
  private_supporting_details: string | null;
  photo_path: string | null;
  public_display_name: string | null;
  city: string | null;
  title: string;
  body: string;
  experience_period: string | null;
  donation_type: DonationType | null;
  blood_group: BloodGroup | null;
  camp_id: string | null;
  consent_contact_for_verification: boolean;
  consent_publish: boolean;
  consent_show_name: boolean;
  consent_show_photo: boolean;
  consent_show_personal_details: boolean;
  public_title: string | null;
  public_body: string | null;
  public_excerpt: string | null;
  public_photo_path: string | null;
  show_name: boolean;
  show_photo: boolean;
  show_personal_details: boolean;
  show_city: boolean;
  identity_verified: boolean;
  experience_reviewed: boolean;
  donation_verified: boolean;
  donation_record_id: string | null;
  status: StoryStatus;
  reviewed_at: string | null;
  decision_reason: string | null;
  published_at: string | null;
  withdrawn_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ImpactMetrics {
  generated_at: string;
  period_start: string | null;
  registered_donors: number;
  verified_donors: number;
  verified_whole_blood_donations: number;
  verified_sdp_donations: number;
  self_reported_donations: number;
  requests_received: number;
  requests_verified: number;
  requests_coordinated: number;
  requests_fulfilled: number;
  camps_completed: number;
  camp_verified_donors: number | null;
  stories_published: number;
  median_hours_to_coordination: number | null;
  coordination_sample_size: number;
  manual_sources: Array<{
    label: string;
    value: number;
    unit: string | null;
    period_start: string | null;
    period_end: string | null;
    source: string;
    verified_at: string;
  }>;
}
