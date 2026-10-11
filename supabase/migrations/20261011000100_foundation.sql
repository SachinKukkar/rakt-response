-- =============================================================================
-- Rakt Response — 0100 foundation
-- Types, core tables, indexes, helper functions, guard triggers and RLS.
--
-- Security model (summary — see docs/DATABASE.md for the full matrix):
--   * Every table has RLS enabled. Nothing is readable by `anon` except what a
--     policy or a SECURITY DEFINER "public_*" function explicitly exposes.
--   * Roles (volunteer/admin) live in `staff_roles` and can only be changed by
--     SECURITY DEFINER functions that check `is_admin()`. Users can never grant
--     themselves a role; signup metadata is never used for roles.
--   * Privileged columns (verification, status, provenance) are protected by
--     SECURITY INVOKER guard triggers: when the caller is `anon`/`authenticated`
--     they may not change those columns directly. Trusted SECURITY DEFINER RPCs
--     (which run as the table owner) perform their own authorisation checks.
-- =============================================================================

create schema if not exists private;
revoke all on schema private from public;
-- Functions in `private` are internal: never executable by API roles.
alter default privileges in schema private revoke execute on functions from public;

-- -----------------------------------------------------------------------------
-- Enumerated types
-- -----------------------------------------------------------------------------
create type public.blood_group as enum ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');
create type public.donation_type as enum ('whole_blood', 'sdp', 'other_apheresis', 'unknown');
create type public.record_source as enum ('self_reported', 'volunteer_verified', 'admin_verified', 'imported');
create type public.verification_status as enum ('pending', 'verified', 'rejected');
create type public.profile_verification as enum ('unverified', 'pending', 'verified', 'rejected');
create type public.contact_method as enum ('phone', 'whatsapp', 'email', 'in_app');
create type public.donation_experience as enum ('first_time', 'occasional', 'regular');
create type public.staff_role as enum ('volunteer', 'admin');
create type public.request_type as enum ('whole_blood', 'sdp', 'other_apheresis');
create type public.request_urgency as enum ('routine', 'urgent', 'critical');
create type public.request_status as enum (
  'draft', 'submitted', 'under_verification', 'verified', 'in_coordination',
  'fulfilled', 'cancelled', 'expired', 'rejected'
);
create type public.response_status as enum ('interested', 'unavailable', 'declined', 'no_response');
create type public.coordination_outcome as enum ('pending', 'donated', 'did_not_donate', 'not_required', 'unreachable');
create type public.contact_request_status as enum ('pending', 'accepted', 'declined', 'cancelled', 'expired');
create type public.assignment_status as enum ('active', 'completed', 'released');

-- -----------------------------------------------------------------------------
-- Generic helpers
-- -----------------------------------------------------------------------------
create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Escapes LIKE/ILIKE wildcards in user supplied search text.
create or replace function private.like_escape(p text)
returns text
language sql
immutable
set search_path = ''
as $$
  select replace(replace(replace(coalesce(p, ''), '\', '\\'), '%', '\%'), '_', '\_');
$$;

-- -----------------------------------------------------------------------------
-- profiles — one row per auth user. Private by default.
-- -----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null check (char_length(full_name) between 2 and 100),
  display_name text check (display_name is null or char_length(display_name) between 2 and 60),
  is_donor boolean not null default true,
  blood_group public.blood_group,
  blood_group_verified boolean not null default false,
  requested_blood_group public.blood_group,
  age_confirmed boolean not null default false,
  donation_experience public.donation_experience,
  approx_previous_donations integer check (approx_previous_donations between 0 and 500),
  verification_status public.profile_verification not null default 'unverified',
  verified_by uuid references auth.users (id) on delete set null,
  verified_at timestamptz,
  photo_path text check (photo_path is null or char_length(photo_path) <= 300),
  is_active boolean not null default true,
  deletion_requested_at timestamptz,
  terms_accepted_at timestamptz,
  last_active_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_donor_needs_group check (not is_donor or blood_group is not null),
  constraint profiles_verified_has_timestamp check (verification_status <> 'verified' or verified_at is not null)
);

comment on table public.profiles is 'Donor/member profile. Readable only by the owner and active staff. Directory exposure happens through search_donors().';

create index profiles_blood_group_idx on public.profiles (blood_group) where is_donor and is_active;
create index profiles_verification_idx on public.profiles (verification_status);
create index profiles_last_active_idx on public.profiles (last_active_at desc);
create index profiles_created_idx on public.profiles (created_at);

create trigger profiles_updated_at before update on public.profiles
  for each row execute function private.set_updated_at();

-- -----------------------------------------------------------------------------
-- staff_roles — volunteers and administrators. Donor is the default role.
-- -----------------------------------------------------------------------------
create table public.staff_roles (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  role public.staff_role not null,
  can_verify_donations boolean not null default false,
  can_verify_requests boolean not null default true,
  can_export boolean not null default false,
  is_active boolean not null default true,
  granted_by uuid references auth.users (id) on delete set null,
  granted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index staff_roles_role_idx on public.staff_roles (role) where is_active;
create trigger staff_roles_updated_at before update on public.staff_roles
  for each row execute function private.set_updated_at();

-- Role helpers. SECURITY DEFINER so they can read staff_roles regardless of
-- the caller's RLS visibility; they only ever answer about auth.uid().
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.staff_roles sr
    where sr.user_id = (select auth.uid()) and sr.is_active
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.staff_roles sr
    where sr.user_id = (select auth.uid()) and sr.is_active and sr.role = 'admin'
  );
$$;

create or replace function public.staff_can(p_permission text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.staff_roles sr
    where sr.user_id = (select auth.uid())
      and sr.is_active
      and (
        sr.role = 'admin'
        or (p_permission = 'verify_donations' and sr.can_verify_donations)
        or (p_permission = 'verify_requests' and sr.can_verify_requests)
        or (p_permission = 'export' and sr.can_export)
        or (p_permission = 'coordinate')
      )
  );
$$;

-- -----------------------------------------------------------------------------
-- profile_contacts — private contact data, separate from the profile.
-- Readable by the owner and administrators. Volunteers only receive contact
-- details through reveal_donor_contact(), which checks consent and logs access.
-- -----------------------------------------------------------------------------
create table public.profile_contacts (
  profile_id uuid primary key references public.profiles (id) on delete cascade,
  email text check (email is null or char_length(email) <= 254),
  phone text check (phone is null or phone ~ '^\+[1-9][0-9]{7,14}$'),
  whatsapp text check (whatsapp is null or whatsapp ~ '^\+[1-9][0-9]{7,14}$'),
  updated_at timestamptz not null default now()
);

create trigger profile_contacts_updated_at before update on public.profile_contacts
  for each row execute function private.set_updated_at();

-- -----------------------------------------------------------------------------
-- donor_preferences — consent and availability. Private by default.
-- -----------------------------------------------------------------------------
create table public.donor_preferences (
  profile_id uuid primary key references public.profiles (id) on delete cascade,
  directory_visible boolean not null default false,
  directory_consent_at timestamptz,
  contact_consent boolean not null default false,
  contact_consent_at timestamptz,
  emergency_alerts boolean not null default false,
  emergency_consent_at timestamptz,
  open_to_contact boolean not null default false,
  show_donation_summary boolean not null default false,
  preferred_contact_method public.contact_method not null default 'in_app',
  max_distance_km integer check (max_distance_km between 1 and 500),
  notify_status_updates boolean not null default true,
  updated_at timestamptz not null default now()
);

create index donor_prefs_directory_idx on public.donor_preferences (directory_visible, open_to_contact);
create index donor_prefs_alerts_idx on public.donor_preferences (emergency_alerts) where emergency_alerts;

create trigger donor_preferences_updated_at before update on public.donor_preferences
  for each row execute function private.set_updated_at();

-- Consent history (append only).
create table public.consent_events (
  id bigint generated always as identity primary key,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  consent_type text not null check (consent_type in ('directory', 'contact', 'emergency_alerts', 'terms')),
  granted boolean not null,
  created_at timestamptz not null default now()
);
create index consent_events_profile_idx on public.consent_events (profile_id, created_at desc);

create or replace function private.stamp_consents()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' or new.directory_visible is distinct from old.directory_visible then
    new.directory_consent_at := case when new.directory_visible then now() else null end;
  end if;
  if tg_op = 'INSERT' or new.contact_consent is distinct from old.contact_consent then
    new.contact_consent_at := case when new.contact_consent then now() else null end;
  end if;
  if tg_op = 'INSERT' or new.emergency_alerts is distinct from old.emergency_alerts then
    new.emergency_consent_at := case when new.emergency_alerts then now() else null end;
  end if;
  -- Without contact consent a donor cannot be "open to contact".
  if not new.contact_consent then
    new.open_to_contact := false;
  end if;
  return new;
end;
$$;

create trigger donor_preferences_stamp before insert or update on public.donor_preferences
  for each row execute function private.stamp_consents();

create or replace function private.log_consent_events()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.consent_events (profile_id, consent_type, granted) values
      (new.profile_id, 'directory', new.directory_visible),
      (new.profile_id, 'contact', new.contact_consent),
      (new.profile_id, 'emergency_alerts', new.emergency_alerts);
    return new;
  end if;
  if new.directory_visible is distinct from old.directory_visible then
    insert into public.consent_events (profile_id, consent_type, granted) values (new.profile_id, 'directory', new.directory_visible);
  end if;
  if new.contact_consent is distinct from old.contact_consent then
    insert into public.consent_events (profile_id, consent_type, granted) values (new.profile_id, 'contact', new.contact_consent);
  end if;
  if new.emergency_alerts is distinct from old.emergency_alerts then
    insert into public.consent_events (profile_id, consent_type, granted) values (new.profile_id, 'emergency_alerts', new.emergency_alerts);
  end if;
  return new;
end;
$$;

create trigger donor_preferences_consent_log after insert or update on public.donor_preferences
  for each row execute function private.log_consent_events();

-- -----------------------------------------------------------------------------
-- donor_locations — structured, low-precision location.
-- Coordinates are optional and rounded to 2 decimals (~1 km).
-- -----------------------------------------------------------------------------
create table public.donor_locations (
  profile_id uuid primary key references public.profiles (id) on delete cascade,
  state text not null check (char_length(state) between 2 and 60),
  district text not null check (char_length(district) between 2 and 60),
  city text not null check (char_length(city) between 2 and 80),
  locality text check (locality is null or char_length(locality) between 2 and 100),
  pincode text check (pincode is null or pincode ~ '^[1-9][0-9]{5}$'),
  approx_lat numeric(5, 2) check (approx_lat between -90 and 90),
  approx_lng numeric(6, 2) check (approx_lng between -180 and 180),
  state_norm text generated always as (lower(btrim(state))) stored,
  district_norm text generated always as (lower(btrim(district))) stored,
  city_norm text generated always as (lower(btrim(city))) stored,
  updated_at timestamptz not null default now(),
  constraint donor_locations_coords_pair check ((approx_lat is null) = (approx_lng is null))
);

create index donor_locations_district_idx on public.donor_locations (district_norm);
create index donor_locations_city_idx on public.donor_locations (city_norm);
create index donor_locations_state_idx on public.donor_locations (state_norm);
create index donor_locations_pincode_idx on public.donor_locations (pincode);

create or replace function private.round_location()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.approx_lat is not null then new.approx_lat := round(new.approx_lat, 2); end if;
  if new.approx_lng is not null then new.approx_lng := round(new.approx_lng, 2); end if;
  new.state := btrim(new.state);
  new.district := btrim(new.district);
  new.city := btrim(new.city);
  new.locality := nullif(btrim(new.locality), '');
  return new;
end;
$$;

create trigger donor_locations_round before insert or update on public.donor_locations
  for each row execute function private.round_location();
create trigger donor_locations_updated_at before update on public.donor_locations
  for each row execute function private.set_updated_at();

-- -----------------------------------------------------------------------------
-- donation_records — history, kept separate from the profile.
-- -----------------------------------------------------------------------------
create table public.donation_records (
  id uuid primary key default gen_random_uuid(),
  donor_id uuid not null references public.profiles (id) on delete cascade,
  donation_type public.donation_type not null,
  donation_date date not null,
  centre_name text not null check (char_length(centre_name) between 2 and 150),
  city text check (city is null or char_length(city) between 2 and 80),
  district text check (district is null or char_length(district) between 2 and 60),
  event_name text check (event_name is null or char_length(event_name) between 2 and 120),
  record_source public.record_source not null default 'self_reported',
  verification_status public.verification_status not null default 'pending',
  verified_by uuid references auth.users (id) on delete set null,
  verified_at timestamptz,
  review_reason text check (review_reason is null or char_length(review_reason) <= 300),
  provenance text check (provenance is null or char_length(provenance) <= 300),
  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint donation_records_imported_has_provenance check (record_source <> 'imported' or provenance is not null),
  constraint donation_records_verified_has_reviewer check (verification_status = 'pending' or verified_at is not null)
);

-- Exact duplicates (same donor, type and date) are rejected outright.
create unique index donation_records_no_exact_dup
  on public.donation_records (donor_id, donation_type, donation_date)
  where verification_status <> 'rejected';
create index donation_records_donor_idx on public.donation_records (donor_id, donation_date desc);
create index donation_records_type_idx on public.donation_records (donation_type, verification_status);
create index donation_records_pending_idx on public.donation_records (created_at) where verification_status = 'pending';

create trigger donation_records_updated_at before update on public.donation_records
  for each row execute function private.set_updated_at();

create or replace function private.guard_donation_record()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.donation_date > current_date then
    raise exception 'Donation date cannot be in the future' using errcode = '22023';
  end if;
  if new.donation_date < date '1950-01-01' then
    raise exception 'Donation date is not plausible' using errcode = '22023';
  end if;

  if current_user not in ('anon', 'authenticated') then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if public.is_admin() then
      return new;
    end if;
    -- Donors may only add self-reported, unverified records for themselves.
    new.record_source := 'self_reported';
    new.verification_status := 'pending';
    new.verified_by := null;
    new.verified_at := null;
    new.review_reason := null;
    new.provenance := null;
    new.created_by := auth.uid();
    return new;
  end if;

  -- UPDATE by an end user: verification fields are only changed through
  -- verify_donation_record(). Admins may correct details directly.
  if new.donor_id is distinct from old.donor_id
     or new.record_source is distinct from old.record_source
     or new.verification_status is distinct from old.verification_status
     or new.verified_by is distinct from old.verified_by
     or new.verified_at is distinct from old.verified_at
     or new.review_reason is distinct from old.review_reason
     or new.created_by is distinct from old.created_by
     or new.created_at is distinct from old.created_at then
    raise exception 'Verification and provenance fields can only be changed by an authorised reviewer'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger donation_records_guard before insert or update on public.donation_records
  for each row execute function private.guard_donation_record();

-- -----------------------------------------------------------------------------
-- blood_requests — request lifecycle. Requester contact details are private.
-- -----------------------------------------------------------------------------
create table public.blood_requests (
  id uuid primary key default gen_random_uuid(),
  reference_code text not null unique default (
    'RR-' || to_char(now() at time zone 'Asia/Kolkata', 'YYMMDD') || '-' || upper(substr(md5(gen_random_uuid()::text), 1, 5))
  ),
  created_by uuid references auth.users (id) on delete set null,
  requester_name text not null check (char_length(requester_name) between 2 and 100),
  requester_phone text check (requester_phone is null or requester_phone ~ '^\+[1-9][0-9]{7,14}$'),
  requester_email text check (requester_email is null or char_length(requester_email) <= 254),
  requester_contact_method public.contact_method not null default 'phone',
  blood_group public.blood_group not null,
  request_type public.request_type not null default 'whole_blood',
  units_needed integer check (units_needed between 1 and 50),
  hospital_name text not null check (char_length(hospital_name) between 2 and 150),
  state text check (state is null or char_length(state) between 2 and 60),
  district text not null check (char_length(district) between 2 and 60),
  city text not null check (char_length(city) between 2 and 80),
  district_norm text generated always as (lower(btrim(district))) stored,
  required_by timestamptz not null,
  urgency public.request_urgency not null default 'urgent',
  notes text check (notes is null or char_length(notes) <= 1000),
  public_listing_consent boolean not null default false,
  status public.request_status not null default 'submitted',
  verified_by uuid references auth.users (id) on delete set null,
  verified_at timestamptz,
  closed_at timestamptz,
  closure_reason text check (closure_reason is null or char_length(closure_reason) <= 500),
  possible_duplicate_of uuid references public.blood_requests (id) on delete set null,
  submitter_key_hash text check (submitter_key_hash is null or char_length(submitter_key_hash) <= 128),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Open requests need a way to reach the requester; closed requests may have
  -- contact details purged by the retention job.
  constraint blood_requests_contact_present check (
    status in ('fulfilled', 'cancelled', 'expired', 'rejected')
    or requester_phone is not null or requester_email is not null or created_by is not null
  )
);

create index blood_requests_status_idx on public.blood_requests (status, required_by);
create index blood_requests_group_idx on public.blood_requests (blood_group, district_norm);
create index blood_requests_type_idx on public.blood_requests (request_type);
create index blood_requests_creator_idx on public.blood_requests (created_by);
create index blood_requests_created_idx on public.blood_requests (created_at desc);

create trigger blood_requests_updated_at before update on public.blood_requests
  for each row execute function private.set_updated_at();

create or replace function private.guard_blood_request()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user not in ('anon', 'authenticated') then
    return new;
  end if;
  -- Lifecycle and verification fields only change through set_request_status().
  if new.status is distinct from old.status
     or new.verified_by is distinct from old.verified_by
     or new.verified_at is distinct from old.verified_at
     or new.closed_at is distinct from old.closed_at
     or new.created_by is distinct from old.created_by
     or new.reference_code is distinct from old.reference_code
     or new.possible_duplicate_of is distinct from old.possible_duplicate_of
     or new.submitter_key_hash is distinct from old.submitter_key_hash
     or new.created_at is distinct from old.created_at then
    raise exception 'Request status and verification can only be changed through the coordination workflow'
      using errcode = '42501';
  end if;
  -- Requesters cannot change the clinical essentials once a volunteer is reviewing.
  if not public.is_staff()
     and old.status not in ('draft', 'submitted')
     and (new.blood_group is distinct from old.blood_group
          or new.request_type is distinct from old.request_type
          or new.hospital_name is distinct from old.hospital_name) then
    raise exception 'This request is already being reviewed. Please contact a volunteer to change it.'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger blood_requests_guard before update on public.blood_requests
  for each row execute function private.guard_blood_request();

-- Request history.
create table public.request_events (
  id bigint generated always as identity primary key,
  request_id uuid not null references public.blood_requests (id) on delete cascade,
  actor_id uuid references auth.users (id) on delete set null,
  event_type text not null check (event_type in (
    'created', 'status_changed', 'assigned', 'assignment_updated', 'donor_contacted',
    'contact_requested', 'donor_responded', 'outcome_recorded', 'edited', 'duplicate_flagged'
  )),
  from_status public.request_status,
  to_status public.request_status,
  note text check (note is null or char_length(note) <= 500),
  created_at timestamptz not null default now()
);
create index request_events_request_idx on public.request_events (request_id, created_at desc);
create index request_events_to_status_idx on public.request_events (to_status) where to_status is not null;

-- -----------------------------------------------------------------------------
-- request_responses — donor responses and coordination outcomes per request.
-- -----------------------------------------------------------------------------
create table public.request_responses (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.blood_requests (id) on delete cascade,
  donor_id uuid not null references public.profiles (id) on delete cascade,
  response public.response_status not null default 'no_response',
  outcome public.coordination_outcome not null default 'pending',
  contact_attempts integer not null default 0 check (contact_attempts between 0 and 100),
  last_contacted_at timestamptz,
  last_contacted_by uuid references auth.users (id) on delete set null,
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (request_id, donor_id)
);
create index request_responses_donor_idx on public.request_responses (donor_id, created_at desc);
create index request_responses_response_idx on public.request_responses (response, updated_at desc);

create trigger request_responses_updated_at before update on public.request_responses
  for each row execute function private.set_updated_at();

-- -----------------------------------------------------------------------------
-- contact_requests — consent-based request asking a donor to share contact
-- details for a specific blood request.
-- -----------------------------------------------------------------------------
create table public.contact_requests (
  id uuid primary key default gen_random_uuid(),
  donor_id uuid not null references public.profiles (id) on delete cascade,
  blood_request_id uuid not null references public.blood_requests (id) on delete cascade,
  requested_by uuid not null references auth.users (id) on delete cascade,
  message text check (message is null or char_length(message) <= 500),
  status public.contact_request_status not null default 'pending',
  responded_at timestamptz,
  expires_at timestamptz not null default (now() + interval '48 hours'),
  created_at timestamptz not null default now()
);
create unique index contact_requests_one_pending
  on public.contact_requests (donor_id, blood_request_id) where status = 'pending';
create index contact_requests_donor_idx on public.contact_requests (donor_id, created_at desc);
create index contact_requests_requested_by_idx on public.contact_requests (requested_by, created_at desc);

-- -----------------------------------------------------------------------------
-- notifications — in-app notifications (no external delivery required).
-- -----------------------------------------------------------------------------
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null check (kind in (
    'profile_verification', 'donation_verification', 'request_alert', 'request_update',
    'contact_request', 'contact_response', 'follow_up', 'story_update', 'system'
  )),
  title text not null check (char_length(title) between 1 and 140),
  body text check (body is null or char_length(body) <= 600),
  link text check (link is null or (link ~ '^/[A-Za-z0-9/_?=&.%-]*$' and char_length(link) <= 300)),
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_user_idx on public.notifications (user_id, created_at desc);
create index notifications_unread_idx on public.notifications (user_id) where read_at is null;

create or replace function private.guard_notification()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user in ('anon', 'authenticated') and (
       new.user_id is distinct from old.user_id or new.kind is distinct from old.kind
       or new.title is distinct from old.title or new.body is distinct from old.body
       or new.link is distinct from old.link or new.created_at is distinct from old.created_at) then
    raise exception 'Only the read status of a notification can be changed' using errcode = '42501';
  end if;
  return new;
end;
$$;
create trigger notifications_guard before update on public.notifications
  for each row execute function private.guard_notification();

-- -----------------------------------------------------------------------------
-- volunteer_assignments
-- -----------------------------------------------------------------------------
create table public.volunteer_assignments (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.blood_requests (id) on delete cascade,
  volunteer_id uuid not null references public.profiles (id) on delete cascade,
  assigned_by uuid references auth.users (id) on delete set null,
  status public.assignment_status not null default 'active',
  follow_up_at timestamptz,
  follow_up_reminded_at timestamptz,
  notes text check (notes is null or char_length(notes) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index volunteer_assignments_one_active
  on public.volunteer_assignments (request_id, volunteer_id) where status = 'active';
create index volunteer_assignments_volunteer_idx on public.volunteer_assignments (volunteer_id, status);
create index volunteer_assignments_follow_up_idx on public.volunteer_assignments (follow_up_at) where status = 'active';

create trigger volunteer_assignments_updated_at before update on public.volunteer_assignments
  for each row execute function private.set_updated_at();

-- -----------------------------------------------------------------------------
-- internal_notes — staff-only notes about any record (never shown publicly).
-- -----------------------------------------------------------------------------
create table public.internal_notes (
  id uuid primary key default gen_random_uuid(),
  subject_type text not null check (subject_type in ('profile', 'donation_record', 'blood_request', 'story', 'camp')),
  subject_id uuid not null,
  author_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index internal_notes_subject_idx on public.internal_notes (subject_type, subject_id, created_at desc);

-- -----------------------------------------------------------------------------
-- audit_logs — append-only. Metadata must never contain contact details.
-- -----------------------------------------------------------------------------
create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users (id) on delete set null,
  actor_role text,
  action text not null check (char_length(action) between 3 and 80),
  entity_type text check (entity_type is null or char_length(entity_type) <= 60),
  entity_id text check (entity_id is null or char_length(entity_id) <= 80),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index audit_logs_created_idx on public.audit_logs (created_at desc);
create index audit_logs_action_idx on public.audit_logs (action, created_at desc);
create index audit_logs_entity_idx on public.audit_logs (entity_type, entity_id);

create or replace function private.block_audit_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if coalesce(current_setting('rr.audit_purge', true), '') = 'on' and tg_op = 'DELETE' then
    return old;
  end if;
  raise exception 'Audit logs are append-only' using errcode = '42501';
end;
$$;
create trigger audit_logs_immutable before update or delete on public.audit_logs
  for each row execute function private.block_audit_mutation();

create or replace function private.write_audit(
  p_action text,
  p_entity_type text default null,
  p_entity_id text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.audit_logs (actor_id, actor_role, action, entity_type, entity_id, metadata)
  values (
    auth.uid(),
    coalesce(
      (select sr.role::text from public.staff_roles sr where sr.user_id = auth.uid() and sr.is_active),
      case when auth.uid() is null then coalesce(nullif(auth.role(), ''), 'system') else 'donor' end
    ),
    p_action, p_entity_type, p_entity_id, coalesce(p_metadata, '{}'::jsonb)
  );
$$;

-- Retention: deletes audit entries older than the given age (default 3 years).
create or replace function private.purge_audit_logs(p_older_than interval default interval '3 years')
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  perform set_config('rr.audit_purge', 'on', true);
  delete from public.audit_logs where created_at < now() - p_older_than;
  get diagnostics v_count = row_count;
  perform set_config('rr.audit_purge', 'off', true);
  perform private.write_audit('audit.purged', 'audit_logs', null, jsonb_build_object('deleted', v_count));
  return v_count;
end;
$$;

-- Generic row-change audit trigger: records which columns changed, never values
-- (values may contain personal data). Status-like columns are recorded explicitly.
create or replace function private.audit_row_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_old jsonb := case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else '{}'::jsonb end;
  v_new jsonb := case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else '{}'::jsonb end;
  v_changed text[];
  v_meta jsonb := '{}'::jsonb;
  v_id text;
  k text;
begin
  v_id := coalesce(v_new ->> 'id', v_old ->> 'id', v_new ->> 'user_id', v_old ->> 'user_id', v_new ->> 'key', v_old ->> 'key');
  if tg_op = 'UPDATE' then
    select array_agg(key order by key) into v_changed
    from jsonb_each(v_new) n
    where n.key not in ('updated_at') and n.value is distinct from (v_old -> n.key);
    if v_changed is null then
      return new;
    end if;
    v_meta := jsonb_build_object('changed', to_jsonb(v_changed));
  end if;
  foreach k in array array['status', 'verification_status', 'role', 'is_active', 'record_source'] loop
    if v_new ? k or v_old ? k then
      v_meta := v_meta || jsonb_build_object(
        k, jsonb_build_object('from', v_old -> k, 'to', v_new -> k)
      );
    end if;
  end loop;
  perform private.write_audit(tg_table_name || '.' || lower(tg_op), tg_table_name, v_id, v_meta);
  return coalesce(new, old);
end;
$$;

create trigger staff_roles_audit after insert or update or delete on public.staff_roles
  for each row execute function private.audit_row_change();

-- -----------------------------------------------------------------------------
-- platform_settings
-- -----------------------------------------------------------------------------
create table public.platform_settings (
  key text primary key check (key ~ '^[a-z0-9_.]{3,60}$'),
  value jsonb not null,
  is_public boolean not null default false,
  description text check (description is null or char_length(description) <= 300),
  updated_by uuid references auth.users (id) on delete set null,
  updated_at timestamptz not null default now()
);
create trigger platform_settings_updated_at before update on public.platform_settings
  for each row execute function private.set_updated_at();
create trigger platform_settings_audit after insert or update or delete on public.platform_settings
  for each row execute function private.audit_row_change();

create or replace function private.setting_int(p_key text, p_default integer)
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select case when jsonb_typeof(ps.value) = 'number' then (ps.value)::text::integer end
     from public.platform_settings ps where ps.key = p_key),
    p_default
  );
$$;

-- -----------------------------------------------------------------------------
-- rate_limits — fixed-window counters (only touched by SECURITY DEFINER code).
-- -----------------------------------------------------------------------------
create table public.rate_limits (
  key text not null check (char_length(key) <= 200),
  window_start timestamptz not null,
  count integer not null default 0,
  primary key (key, window_start)
);

create or replace function private.rate_limit_hit(p_key text, p_limit integer, p_window_seconds integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_window timestamptz;
  v_count integer;
begin
  if p_limit < 1 or p_window_seconds < 1 then
    raise exception 'Invalid rate limit' using errcode = '22023';
  end if;
  v_window := to_timestamp(floor(extract(epoch from clock_timestamp()) / p_window_seconds) * p_window_seconds);
  insert into public.rate_limits as rl (key, window_start, count)
  values (p_key, v_window, 1)
  on conflict (key, window_start) do update set count = rl.count + 1
  returning rl.count into v_count;
  if random() < 0.02 then
    delete from public.rate_limits where window_start < now() - interval '2 days';
  end if;
  return v_count <= p_limit;
end;
$$;

-- For signed-in users (key is always bound to auth.uid()).
create or replace function public.hit_rate_limit(p_bucket text, p_limit integer, p_window_seconds integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Sign in required' using errcode = '42501';
  end if;
  if p_bucket !~ '^[a-z_]{3,40}$' then
    raise exception 'Invalid bucket' using errcode = '22023';
  end if;
  return private.rate_limit_hit(p_bucket || ':' || auth.uid()::text, p_limit, p_window_seconds);
end;
$$;

-- For the server (service role) to limit anonymous traffic by hashed client key.
create or replace function public.consume_rate_limit(p_key text, p_limit integer, p_window_seconds integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Not authorised' using errcode = '42501';
  end if;
  return private.rate_limit_hit('anon:' || p_key, p_limit, p_window_seconds);
end;
$$;

-- -----------------------------------------------------------------------------
-- Notification helpers
-- -----------------------------------------------------------------------------
create or replace function private.notify(
  p_user uuid, p_kind text, p_title text, p_body text default null, p_link text default null
)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.notifications (user_id, kind, title, body, link)
  select p_user, p_kind, left(p_title, 140), left(p_body, 600), p_link
  where p_user is not null and exists (select 1 from public.profiles p where p.id = p_user);
$$;

create or replace function private.notify_admins(p_kind text, p_title text, p_body text default null, p_link text default null)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.notifications (user_id, kind, title, body, link)
  select sr.user_id, p_kind, left(p_title, 140), left(p_body, 600), p_link
  from public.staff_roles sr where sr.role = 'admin' and sr.is_active;
$$;

-- -----------------------------------------------------------------------------
-- Profile guard
-- -----------------------------------------------------------------------------
create or replace function private.guard_profile()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user not in ('anon', 'authenticated') then
    return new;
  end if;
  if new.id is distinct from old.id or new.created_at is distinct from old.created_at then
    raise exception 'Profile identity cannot be changed' using errcode = '42501';
  end if;
  if public.is_admin() then
    return new;
  end if;
  if new.verification_status is distinct from old.verification_status
     or new.verified_by is distinct from old.verified_by
     or new.verified_at is distinct from old.verified_at
     or new.blood_group_verified is distinct from old.blood_group_verified
     or new.is_active is distinct from old.is_active
     or new.deletion_requested_at is distinct from old.deletion_requested_at
     or new.terms_accepted_at is distinct from old.terms_accepted_at then
    raise exception 'You cannot change protected profile fields' using errcode = '42501';
  end if;
  if old.blood_group_verified and new.blood_group is distinct from old.blood_group then
    raise exception 'Your blood group has been verified. Please request a correction instead.'
      using errcode = '42501';
  end if;
  return new;
end;
$$;
create trigger profiles_guard before update on public.profiles
  for each row execute function private.guard_profile();

create or replace function private.guard_profile_contacts()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user in ('anon', 'authenticated') and not public.is_admin()
     and (new.email is distinct from old.email or new.profile_id is distinct from old.profile_id) then
    raise exception 'Your account email is managed through account settings' using errcode = '42501';
  end if;
  return new;
end;
$$;
create trigger profile_contacts_guard before update on public.profile_contacts
  for each row execute function private.guard_profile_contacts();

-- Audit verification-relevant changes on profiles.
create or replace function private.audit_profile_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.verification_status is distinct from old.verification_status
     or new.is_active is distinct from old.is_active
     or new.blood_group_verified is distinct from old.blood_group_verified
     or (old.blood_group_verified and new.blood_group is distinct from old.blood_group)
     or new.deletion_requested_at is distinct from old.deletion_requested_at then
    perform private.write_audit('profiles.update', 'profiles', new.id::text, jsonb_build_object(
      'verification_status', jsonb_build_object('from', old.verification_status, 'to', new.verification_status),
      'is_active', jsonb_build_object('from', old.is_active, 'to', new.is_active),
      'blood_group_verified', jsonb_build_object('from', old.blood_group_verified, 'to', new.blood_group_verified),
      'deletion_requested', new.deletion_requested_at is not null
    ));
  end if;
  return new;
end;
$$;
create trigger profiles_audit after update on public.profiles
  for each row execute function private.audit_profile_change();

-- -----------------------------------------------------------------------------
-- New-user bootstrap: creates profile, contacts, preferences, location and
-- self-reported history from validated signup metadata. Roles are NEVER read
-- from metadata. Invalid optional fields are dropped instead of failing signup.
-- -----------------------------------------------------------------------------
create or replace function private.jbool(p jsonb, p_key text, p_default boolean)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select case when jsonb_typeof(p -> p_key) = 'boolean' then (p ->> p_key)::boolean else p_default end;
$$;

create or replace function private.jtext(p jsonb, p_key text, p_max integer)
returns text
language sql
immutable
set search_path = ''
as $$
  select nullif(left(btrim(case when jsonb_typeof(p -> p_key) = 'string' then p ->> p_key end), p_max), '');
$$;

-- Signup metadata ends up in the user's JWT (user_metadata). To keep phone
-- numbers, location and history out of tokens and cookies, the BEFORE trigger
-- stashes the full payload in a transaction-local setting and keeps only the
-- name in auth.users; the AFTER trigger reads the stash to build the profile.
create or replace function private.stash_signup_metadata()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  m jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  perform set_config('rr.signup_' || replace(new.id::text, '-', ''), m::text, true);
  new.raw_user_meta_data := jsonb_strip_nulls(jsonb_build_object(
    'full_name', private.jtext(m, 'full_name', 100),
    'display_name', private.jtext(m, 'display_name', 60)
  ));
  return new;
end;
$$;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  m jsonb := coalesce(
    nullif(current_setting('rr.signup_' || replace(new.id::text, '-', ''), true), '')::jsonb,
    new.raw_user_meta_data,
    '{}'::jsonb
  );
  loc jsonb := case when jsonb_typeof(m -> 'location') = 'object' then m -> 'location' else '{}'::jsonb end;
  prefs jsonb := case when jsonb_typeof(m -> 'preferences') = 'object' then m -> 'preferences' else '{}'::jsonb end;
  v_name text;
  v_display text;
  v_bg public.blood_group;
  v_is_donor boolean;
  v_exp public.donation_experience;
  v_method public.contact_method;
  v_phone text;
  v_whatsapp text;
  v_approx integer;
  v_lat numeric;
  v_lng numeric;
  v_dist integer;
  d jsonb;
  v_i integer := 0;
begin
  v_name := private.jtext(m, 'full_name', 100);
  if v_name is null or char_length(v_name) < 2 then
    v_name := 'Rakt Response member';
  end if;
  v_display := private.jtext(m, 'display_name', 60);
  if v_display is not null and char_length(v_display) < 2 then v_display := null; end if;

  begin v_bg := (m ->> 'blood_group')::public.blood_group; exception when others then v_bg := null; end;
  v_is_donor := private.jbool(m, 'is_donor', true) and v_bg is not null;
  begin v_exp := (m ->> 'donation_experience')::public.donation_experience; exception when others then v_exp := null; end;
  begin v_method := coalesce((prefs ->> 'preferred_contact_method')::public.contact_method, 'in_app'); exception when others then v_method := 'in_app'; end;
  begin
    v_approx := (m ->> 'approx_previous_donations')::integer;
    if v_approx not between 0 and 500 then v_approx := null; end if;
  exception when others then v_approx := null; end;

  v_phone := private.jtext(m, 'phone', 16);
  if v_phone !~ '^\+[1-9][0-9]{7,14}$' then v_phone := null; end if;
  v_whatsapp := private.jtext(m, 'whatsapp', 16);
  if v_whatsapp !~ '^\+[1-9][0-9]{7,14}$' then v_whatsapp := null; end if;

  insert into public.profiles (
    id, full_name, display_name, is_donor, blood_group, age_confirmed, donation_experience,
    approx_previous_donations, terms_accepted_at
  ) values (
    new.id, v_name, v_display, v_is_donor, v_bg, private.jbool(m, 'age_confirmed', false), v_exp,
    v_approx, case when private.jbool(m, 'terms_accepted', false) then now() end
  );

  insert into public.profile_contacts (profile_id, email, phone, whatsapp)
  values (new.id, new.email, v_phone, v_whatsapp);

  begin
    v_dist := (prefs ->> 'max_distance_km')::integer;
    if v_dist not between 1 and 500 then v_dist := null; end if;
  exception when others then v_dist := null; end;

  insert into public.donor_preferences (
    profile_id, directory_visible, contact_consent, emergency_alerts, open_to_contact,
    show_donation_summary, preferred_contact_method, max_distance_km
  ) values (
    new.id,
    v_is_donor and private.jbool(prefs, 'directory_visible', false),
    v_is_donor and private.jbool(prefs, 'contact_consent', false),
    v_is_donor and private.jbool(prefs, 'emergency_alerts', false),
    v_is_donor and private.jbool(prefs, 'open_to_contact', false),
    v_is_donor and private.jbool(prefs, 'show_donation_summary', false),
    v_method,
    v_dist
  );

  if private.jtext(loc, 'state', 60) is not null
     and private.jtext(loc, 'district', 60) is not null
     and private.jtext(loc, 'city', 80) is not null then
    begin
      begin
        v_lat := (loc ->> 'lat')::numeric;
        v_lng := (loc ->> 'lng')::numeric;
        if v_lat not between -90 and 90 or v_lng not between -180 and 180 then v_lat := null; v_lng := null; end if;
      exception when others then v_lat := null; v_lng := null; end;
      if v_lat is null or v_lng is null then v_lat := null; v_lng := null; end if;
      insert into public.donor_locations (profile_id, state, district, city, locality, pincode, approx_lat, approx_lng)
      values (
        new.id,
        private.jtext(loc, 'state', 60),
        private.jtext(loc, 'district', 60),
        private.jtext(loc, 'city', 80),
        private.jtext(loc, 'locality', 100),
        case when private.jtext(loc, 'pincode', 6) ~ '^[1-9][0-9]{5}$' then private.jtext(loc, 'pincode', 6) end,
        v_lat, v_lng
      );
    exception when others then
      null; -- location can be added later from the profile
    end;
  end if;

  if v_is_donor and jsonb_typeof(m -> 'donations') = 'array' then
    for d in select value from jsonb_array_elements(m -> 'donations') loop
      v_i := v_i + 1;
      exit when v_i > 20;
      begin
        insert into public.donation_records (
          donor_id, donation_type, donation_date, centre_name, city, district, event_name,
          record_source, verification_status, created_by
        ) values (
          new.id,
          (d ->> 'donation_type')::public.donation_type,
          (d ->> 'donation_date')::date,
          private.jtext(d, 'centre_name', 150),
          private.jtext(d, 'city', 80),
          private.jtext(d, 'district', 60),
          private.jtext(d, 'event_name', 120),
          'self_reported', 'pending', new.id
        );
      exception when others then
        null; -- skip invalid or duplicate entries
      end;
    end loop;
  end if;

  if private.jbool(m, 'terms_accepted', false) then
    insert into public.consent_events (profile_id, consent_type, granted) values (new.id, 'terms', true);
  end if;

  return new;
end;
$$;

create trigger before_auth_user_created
  before insert on auth.users
  for each row execute function private.stash_signup_metadata();

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

create or replace function private.handle_user_email_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email is distinct from old.email then
    update public.profile_contacts set email = new.email where profile_id = new.id;
  end if;
  return new;
end;
$$;

create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row execute function private.handle_user_email_change();

-- =============================================================================
-- Row Level Security
-- =============================================================================
alter table public.profiles enable row level security;
alter table public.staff_roles enable row level security;
alter table public.profile_contacts enable row level security;
alter table public.donor_preferences enable row level security;
alter table public.consent_events enable row level security;
alter table public.donor_locations enable row level security;
alter table public.donation_records enable row level security;
alter table public.blood_requests enable row level security;
alter table public.request_events enable row level security;
alter table public.request_responses enable row level security;
alter table public.contact_requests enable row level security;
alter table public.notifications enable row level security;
alter table public.volunteer_assignments enable row level security;
alter table public.internal_notes enable row level security;
alter table public.audit_logs enable row level security;
alter table public.platform_settings enable row level security;
alter table public.rate_limits enable row level security;

-- profiles: owner or admin. Volunteers see donors only through the directory
-- functions (which honour directory consent) and staff_profile_labels().
create policy profiles_select on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));
create policy profiles_update on public.profiles for update to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()))
  with check (id = (select auth.uid()) or (select public.is_admin()));

-- staff_roles: own row (to know your permissions) or admins.
create policy staff_roles_select on public.staff_roles for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

-- profile_contacts: owner or admin. Volunteers use reveal_donor_contact().
create policy profile_contacts_select on public.profile_contacts for select to authenticated
  using (profile_id = (select auth.uid()) or (select public.is_admin()));
create policy profile_contacts_update on public.profile_contacts for update to authenticated
  using (profile_id = (select auth.uid()) or (select public.is_admin()))
  with check (profile_id = (select auth.uid()) or (select public.is_admin()));

-- donor_preferences
create policy donor_preferences_select on public.donor_preferences for select to authenticated
  using (profile_id = (select auth.uid()) or (select public.is_admin()));
create policy donor_preferences_insert on public.donor_preferences for insert to authenticated
  with check (profile_id = (select auth.uid()));
create policy donor_preferences_update on public.donor_preferences for update to authenticated
  using (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));

-- consent_events: owner or admin, read only.
create policy consent_events_select on public.consent_events for select to authenticated
  using (profile_id = (select auth.uid()) or (select public.is_admin()));

-- donor_locations
create policy donor_locations_select on public.donor_locations for select to authenticated
  using (profile_id = (select auth.uid()) or (select public.is_admin()));
create policy donor_locations_insert on public.donor_locations for insert to authenticated
  with check (profile_id = (select auth.uid()));
create policy donor_locations_update on public.donor_locations for update to authenticated
  using (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));

-- donation_records
-- donation_records: owner, admins, and volunteers allowed to verify donations.
create policy donation_records_select on public.donation_records for select to authenticated
  using (donor_id = (select auth.uid()) or (select public.staff_can('verify_donations')));
create policy donation_records_insert on public.donation_records for insert to authenticated
  with check (donor_id = (select auth.uid()) or (select public.is_admin()));
create policy donation_records_update on public.donation_records for update to authenticated
  using ((donor_id = (select auth.uid()) and verification_status = 'pending') or (select public.is_admin()))
  with check ((donor_id = (select auth.uid()) and verification_status = 'pending') or (select public.is_admin()));
create policy donation_records_delete on public.donation_records for delete to authenticated
  using ((donor_id = (select auth.uid()) and verification_status = 'pending') or (select public.is_admin()));

-- blood_requests: creator or staff. Public listing goes through list_public_blood_requests().
create policy blood_requests_select on public.blood_requests for select to authenticated
  using (created_by = (select auth.uid()) or (select public.is_staff()));
create policy blood_requests_update on public.blood_requests for update to authenticated
  using (
    (created_by = (select auth.uid()) and status in ('draft', 'submitted', 'under_verification', 'verified', 'in_coordination'))
    or (select public.is_staff())
  )
  with check (
    (created_by = (select auth.uid()) and status in ('draft', 'submitted', 'under_verification', 'verified', 'in_coordination'))
    or (select public.is_staff())
  );

-- request_events: staff or the request creator.
create policy request_events_select on public.request_events for select to authenticated
  using (
    (select public.is_staff())
    or exists (select 1 from public.blood_requests br where br.id = request_id and br.created_by = (select auth.uid()))
  );

-- request_responses: the donor or staff. Changes go through RPCs.
create policy request_responses_select on public.request_responses for select to authenticated
  using (donor_id = (select auth.uid()) or (select public.is_staff()));

-- contact_requests
create policy contact_requests_select on public.contact_requests for select to authenticated
  using (donor_id = (select auth.uid()) or requested_by = (select auth.uid()) or (select public.is_staff()));

-- notifications: own only.
create policy notifications_select on public.notifications for select to authenticated
  using (user_id = (select auth.uid()));
create policy notifications_update on public.notifications for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy notifications_delete on public.notifications for delete to authenticated
  using (user_id = (select auth.uid()));

-- volunteer_assignments: staff read. Writes via RPC.
create policy volunteer_assignments_select on public.volunteer_assignments for select to authenticated
  using ((select public.is_staff()));

-- internal_notes: staff only, append only.
create policy internal_notes_select on public.internal_notes for select to authenticated
  using ((select public.is_staff()));
create policy internal_notes_insert on public.internal_notes for insert to authenticated
  with check ((select public.is_staff()) and author_id = (select auth.uid()));

-- audit_logs: administrators read only.
create policy audit_logs_select on public.audit_logs for select to authenticated
  using ((select public.is_admin()));

-- platform_settings: public keys for everyone, all keys for admins; admins update.
create policy platform_settings_select_public on public.platform_settings for select to anon, authenticated
  using (is_public or (select public.is_admin()));
create policy platform_settings_update on public.platform_settings for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- rate_limits: no policies (SECURITY DEFINER functions only).

-- -----------------------------------------------------------------------------
-- Table privileges. Supabase grants broad defaults; tighten them explicitly.
-- -----------------------------------------------------------------------------
revoke all on all tables in schema public from anon;
grant select on public.platform_settings to anon;

revoke insert, update, delete on public.audit_logs, public.consent_events, public.request_events,
  public.rate_limits, public.staff_roles, public.volunteer_assignments, public.request_responses,
  public.contact_requests from authenticated;
revoke all on public.rate_limits from authenticated;
revoke insert, delete on public.profiles, public.profile_contacts from authenticated;
revoke insert, delete on public.blood_requests from authenticated;
revoke insert on public.notifications from authenticated;
revoke delete on public.donor_preferences, public.donor_locations, public.platform_settings from authenticated;
revoke insert on public.platform_settings from authenticated;
revoke update, delete on public.internal_notes from authenticated;

revoke execute on all functions in schema private from public;
