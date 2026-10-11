-- =============================================================================
-- Rakt Response — 0200 coordination functions
-- Donation summaries, verification, blood-request lifecycle, donor matching,
-- the privacy-aware directory, consent-checked contact access and staff roles.
--
-- Every function here is SECURITY DEFINER with an empty search_path and checks
-- authorisation itself. Error messages are written to be safe to show users.
-- Custom SQLSTATE 'RR429' means "rate limited".
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Labels used in notifications
-- -----------------------------------------------------------------------------
create or replace function private.request_type_label(p public.request_type)
returns text language sql immutable set search_path = '' as $$
  select case p
    when 'whole_blood' then 'whole blood'
    when 'sdp' then 'SDP (single donor platelets)'
    else 'apheresis' end;
$$;

create or replace function private.request_status_label(p public.request_status)
returns text language sql immutable set search_path = '' as $$
  select case p
    when 'draft' then 'Draft'
    when 'submitted' then 'Submitted'
    when 'under_verification' then 'Under verification'
    when 'verified' then 'Verified'
    when 'in_coordination' then 'In coordination'
    when 'fulfilled' then 'Fulfilled'
    when 'cancelled' then 'Cancelled'
    when 'expired' then 'Expired'
    when 'rejected' then 'Not verified' end;
$$;

create or replace function private.request_transition_allowed(p_from public.request_status, p_to public.request_status)
returns boolean language sql immutable set search_path = '' as $$
  select case p_from
    when 'draft' then p_to in ('submitted', 'cancelled')
    when 'submitted' then p_to in ('under_verification', 'verified', 'rejected', 'cancelled', 'expired')
    when 'under_verification' then p_to in ('verified', 'rejected', 'cancelled', 'expired')
    when 'verified' then p_to in ('in_coordination', 'fulfilled', 'cancelled', 'expired')
    when 'in_coordination' then p_to in ('verified', 'fulfilled', 'cancelled', 'expired')
    else false end;
$$;

-- -----------------------------------------------------------------------------
-- Donation summary — SECURITY INVOKER, so RLS decides whose records are counted.
-- Reported and verified figures are kept separate on purpose.
-- -----------------------------------------------------------------------------
create or replace function public.donation_summary(p_donor uuid)
returns table (
  last_reported_whole_blood date,
  last_verified_whole_blood date,
  last_reported_sdp date,
  last_verified_sdp date,
  verified_whole_blood_count integer,
  verified_sdp_count integer,
  verified_other_apheresis_count integer,
  reported_whole_blood_count integer,
  reported_sdp_count integer,
  pending_count integer
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    max(r.donation_date) filter (where r.donation_type = 'whole_blood' and r.verification_status <> 'rejected'),
    max(r.donation_date) filter (where r.donation_type = 'whole_blood' and r.verification_status = 'verified'),
    max(r.donation_date) filter (where r.donation_type = 'sdp' and r.verification_status <> 'rejected'),
    max(r.donation_date) filter (where r.donation_type = 'sdp' and r.verification_status = 'verified'),
    (count(*) filter (where r.donation_type = 'whole_blood' and r.verification_status = 'verified'))::integer,
    (count(*) filter (where r.donation_type = 'sdp' and r.verification_status = 'verified'))::integer,
    (count(*) filter (where r.donation_type = 'other_apheresis' and r.verification_status = 'verified'))::integer,
    (count(*) filter (where r.donation_type = 'whole_blood' and r.verification_status <> 'rejected'))::integer,
    (count(*) filter (where r.donation_type = 'sdp' and r.verification_status <> 'rejected'))::integer,
    (count(*) filter (where r.verification_status = 'pending'))::integer
  from public.donation_records r
  where r.donor_id = p_donor;
$$;

-- -----------------------------------------------------------------------------
-- Activity
-- -----------------------------------------------------------------------------
create or replace function public.touch_last_active()
returns void
language sql
security definer
set search_path = ''
as $$
  update public.profiles set last_active_at = now()
  where id = auth.uid() and last_active_at < now() - interval '6 hours';
$$;

-- -----------------------------------------------------------------------------
-- Donation verification
-- -----------------------------------------------------------------------------
create or replace function public.verify_donation_record(
  p_record uuid,
  p_status public.verification_status,
  p_reason text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_rec public.donation_records;
  v_reason text := nullif(btrim(p_reason), '');
begin
  if not public.staff_can('verify_donations') then
    raise exception 'You are not authorised to verify donation records' using errcode = '42501';
  end if;
  if p_status = 'pending' then
    raise exception 'Choose verified or rejected' using errcode = '22023';
  end if;
  select * into v_rec from public.donation_records where id = p_record for update;
  if not found then
    raise exception 'Donation record not found' using errcode = 'P0002';
  end if;
  if v_rec.donor_id = auth.uid() then
    raise exception 'You cannot verify your own donation records' using errcode = '42501';
  end if;
  if p_status = 'rejected' and v_reason is null then
    raise exception 'Please give a short reason when rejecting a record' using errcode = '22023';
  end if;

  update public.donation_records set
    verification_status = p_status,
    verified_by = auth.uid(),
    verified_at = now(),
    review_reason = left(v_reason, 300),
    record_source = case
      when p_status = 'verified' and record_source <> 'imported' then
        case when public.is_admin() then 'admin_verified'::public.record_source else 'volunteer_verified'::public.record_source end
      else record_source end
  where id = p_record;

  perform private.notify(
    v_rec.donor_id, 'donation_verification',
    case when p_status = 'verified' then 'A donation record was verified' else 'A donation record could not be verified' end,
    'Your ' || case v_rec.donation_type when 'sdp' then 'SDP' when 'whole_blood' then 'whole blood' else 'donation' end
      || ' record dated ' || to_char(v_rec.donation_date, 'DD Mon YYYY') || ' was reviewed.'
      || coalesce(' Reason: ' || v_reason, ''),
    '/donations'
  );
  perform private.write_audit('donation_record.' || p_status::text, 'donation_records', p_record::text,
    jsonb_build_object('donation_type', v_rec.donation_type));
end;
$$;

-- -----------------------------------------------------------------------------
-- Profile verification and blood-group corrections (administrators)
-- -----------------------------------------------------------------------------
create or replace function public.verify_profile(
  p_profile uuid,
  p_status public.profile_verification,
  p_blood_group_verified boolean default null,
  p_note text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_note text := nullif(btrim(p_note), '');
begin
  if not public.is_admin() then
    raise exception 'Only administrators can verify donor profiles' using errcode = '42501';
  end if;
  if p_profile = auth.uid() then
    raise exception 'You cannot verify your own profile' using errcode = '42501';
  end if;
  update public.profiles set
    verification_status = p_status,
    verified_by = case when p_status = 'verified' then auth.uid() else null end,
    verified_at = case when p_status = 'verified' then now() else null end,
    blood_group_verified = coalesce(p_blood_group_verified, blood_group_verified)
  where id = p_profile;
  if not found then
    raise exception 'Profile not found' using errcode = 'P0002';
  end if;
  if v_note is not null then
    insert into public.internal_notes (subject_type, subject_id, author_id, body)
    values ('profile', p_profile, auth.uid(), left(v_note, 2000));
  end if;
  perform private.notify(p_profile, 'profile_verification',
    case p_status
      when 'verified' then 'Your donor profile is verified'
      when 'rejected' then 'Your donor profile could not be verified'
      when 'pending' then 'Your donor profile is being reviewed'
      else 'Your profile verification status changed' end,
    'Verification confirms the details you shared with our team. It is not a medical eligibility decision.',
    '/profile');
end;
$$;

create or replace function public.request_blood_group_change(p_group public.blood_group)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile public.profiles;
begin
  select * into v_profile from public.profiles where id = auth.uid() for update;
  if not found then
    raise exception 'Sign in required' using errcode = '42501';
  end if;
  if not public.hit_rate_limit('blood_group_change', 3, 86400) then
    raise exception 'Too many change requests today. Please try again tomorrow.' using errcode = 'RR429';
  end if;
  if not v_profile.blood_group_verified then
    update public.profiles set blood_group = p_group, is_donor = true where id = auth.uid();
    return;
  end if;
  update public.profiles set requested_blood_group = p_group where id = auth.uid();
  perform private.notify_admins('system', 'Blood group correction requested',
    'A donor with a verified blood group asked for a correction. Review it in the donor admin area.',
    '/admin/donors?filter=blood_group_change');
  perform private.write_audit('profiles.blood_group_change_requested', 'profiles', auth.uid()::text, '{}'::jsonb);
end;
$$;

create or replace function public.resolve_blood_group_change(p_profile uuid, p_approve boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile public.profiles;
begin
  if not public.is_admin() then
    raise exception 'Only administrators can resolve blood group corrections' using errcode = '42501';
  end if;
  select * into v_profile from public.profiles where id = p_profile for update;
  if not found or v_profile.requested_blood_group is null then
    raise exception 'There is no pending blood group correction for this profile' using errcode = 'P0002';
  end if;
  update public.profiles set
    blood_group = case when p_approve then requested_blood_group else blood_group end,
    blood_group_verified = case when p_approve then true else blood_group_verified end,
    requested_blood_group = null
  where id = p_profile;
  perform private.notify(p_profile, 'profile_verification',
    case when p_approve then 'Your blood group correction was approved' else 'Your blood group correction was not approved' end,
    case when p_approve then null else 'Please contact the Rakt Response team if you believe this is a mistake.' end,
    '/profile');
  perform private.write_audit('profiles.blood_group_change_' || case when p_approve then 'approved' else 'declined' end,
    'profiles', p_profile::text, '{}'::jsonb);
end;
$$;

-- -----------------------------------------------------------------------------
-- Account deletion requests
-- -----------------------------------------------------------------------------
create or replace function public.request_account_deletion(p_reason text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Sign in required' using errcode = '42501';
  end if;
  update public.profiles set deletion_requested_at = coalesce(deletion_requested_at, now())
  where id = auth.uid();
  -- Withdraw from discovery immediately; processing happens afterwards.
  update public.donor_preferences set
    directory_visible = false, contact_consent = false, emergency_alerts = false, open_to_contact = false
  where profile_id = auth.uid();
  perform private.notify_admins('system', 'Account deletion requested',
    'A member asked for their account to be deleted. Process it from the donor admin area.',
    '/admin/donors?filter=deletion');
  perform private.write_audit('profiles.deletion_requested', 'profiles', auth.uid()::text,
    jsonb_build_object('reason_given', nullif(btrim(p_reason), '') is not null));
end;
$$;

create or replace function public.cancel_account_deletion()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles set deletion_requested_at = null
  where id = auth.uid() and is_active and deletion_requested_at is not null;
  if not found then
    raise exception 'There is no pending deletion request to cancel' using errcode = 'P0002';
  end if;
  perform private.write_audit('profiles.deletion_cancelled', 'profiles', auth.uid()::text, '{}'::jsonb);
end;
$$;

create or replace function public.set_profile_active(p_profile uuid, p_active boolean, p_reason text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Only administrators can change account status' using errcode = '42501';
  end if;
  if p_profile = auth.uid() then
    raise exception 'You cannot deactivate your own account here' using errcode = '42501';
  end if;
  update public.profiles set is_active = p_active where id = p_profile;
  if not found then
    raise exception 'Profile not found' using errcode = 'P0002';
  end if;
  if not p_active then
    update public.donor_preferences set directory_visible = false, open_to_contact = false
    where profile_id = p_profile;
  end if;
  if nullif(btrim(p_reason), '') is not null then
    insert into public.internal_notes (subject_type, subject_id, author_id, body)
    values ('profile', p_profile, auth.uid(), left('Account ' || case when p_active then 'reactivated' else 'deactivated' end || ': ' || btrim(p_reason), 2000));
  end if;
end;
$$;

-- -----------------------------------------------------------------------------
-- Staff roles
-- -----------------------------------------------------------------------------
create or replace function public.grant_staff_role(
  p_user uuid,
  p_role public.staff_role,
  p_can_verify_donations boolean default false,
  p_can_verify_requests boolean default true,
  p_can_export boolean default false
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Only administrators can manage roles' using errcode = '42501';
  end if;
  if p_user = auth.uid() then
    raise exception 'You cannot change your own role' using errcode = '42501';
  end if;
  if not exists (select 1 from public.profiles p where p.id = p_user and p.is_active and p.deletion_requested_at is null) then
    raise exception 'This account is not active' using errcode = 'P0002';
  end if;
  insert into public.staff_roles (user_id, role, can_verify_donations, can_verify_requests, can_export, is_active, granted_by)
  values (p_user, p_role, p_can_verify_donations, p_can_verify_requests, p_can_export, true, auth.uid())
  on conflict (user_id) do update set
    role = excluded.role,
    can_verify_donations = excluded.can_verify_donations,
    can_verify_requests = excluded.can_verify_requests,
    can_export = excluded.can_export,
    is_active = true,
    granted_by = excluded.granted_by,
    granted_at = now();
  perform private.notify(p_user, 'system',
    case p_role when 'admin' then 'You are now a Rakt Response administrator' else 'You are now a Rakt Response volunteer' end,
    'Please handle donor information only for legitimate coordination and follow the team privacy guidelines.',
    case p_role when 'admin' then '/admin' else '/volunteer' end);
end;
$$;

create or replace function public.revoke_staff_role(p_user uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Only administrators can manage roles' using errcode = '42501';
  end if;
  if p_user = auth.uid() then
    raise exception 'You cannot change your own role' using errcode = '42501';
  end if;
  update public.staff_roles set is_active = false where user_id = p_user and is_active;
  if not found then
    raise exception 'This person does not have an active staff role' using errcode = 'P0002';
  end if;
  update public.volunteer_assignments set status = 'released'
  where volunteer_id = p_user and status = 'active';
end;
$$;

-- First administrator. Only the service role (server-side script) or a database
-- owner session (Supabase SQL editor) can run it, and only while no admin exists.
create or replace function public.bootstrap_first_admin(p_email text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid;
begin
  if coalesce(auth.role(), '') <> 'service_role' and session_user not in ('postgres', 'supabase_admin') then
    raise exception 'Not authorised' using errcode = '42501';
  end if;
  if exists (select 1 from public.staff_roles where role = 'admin' and is_active) then
    raise exception 'An administrator already exists. Use the admin panel to grant roles.' using errcode = '42501';
  end if;
  select u.id into v_user from auth.users u where lower(u.email) = lower(btrim(p_email));
  if v_user is null then
    raise exception 'No account found for that email. Register first, then run the bootstrap.' using errcode = 'P0002';
  end if;
  if not exists (select 1 from auth.users u where u.id = v_user and u.email_confirmed_at is not null) then
    raise exception 'Confirm the email address before making this account an administrator.' using errcode = '42501';
  end if;
  insert into public.staff_roles (user_id, role, can_verify_donations, can_verify_requests, can_export, is_active)
  values (v_user, 'admin', true, true, true, true)
  on conflict (user_id) do update set role = 'admin', is_active = true,
    can_verify_donations = true, can_verify_requests = true, can_export = true;
  perform private.write_audit('staff.bootstrap_admin', 'staff_roles', v_user::text, '{}'::jsonb);
  return v_user;
end;
$$;

-- -----------------------------------------------------------------------------
-- Blood requests
-- -----------------------------------------------------------------------------
create or replace function private.notify_request_reviewers(p_request uuid, p_title text, p_body text)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.notifications (user_id, kind, title, body, link)
  select sr.user_id, 'request_update', left(p_title, 140), left(p_body, 600), '/volunteer/requests/' || p_request::text
  from public.staff_roles sr
  where sr.is_active and (sr.role = 'admin' or sr.can_verify_requests)
  limit 50;
$$;

create or replace function public.submit_blood_request(
  p_requester_name text,
  p_requester_phone text,
  p_requester_email text,
  p_contact_method public.contact_method,
  p_blood_group public.blood_group,
  p_request_type public.request_type,
  p_units integer,
  p_hospital text,
  p_state text,
  p_district text,
  p_city text,
  p_required_by timestamptz,
  p_urgency public.request_urgency,
  p_notes text,
  p_public_listing boolean,
  p_client_key text default null
)
returns table (request_id uuid, reference_code text, possible_duplicate_of uuid)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_dup uuid;
  v_row public.blood_requests;
begin
  if v_uid is null then
    if coalesce(auth.role(), '') <> 'service_role' or nullif(btrim(p_client_key), '') is null then
      raise exception 'Please sign in to submit a request' using errcode = '42501';
    end if;
    if not private.rate_limit_hit('anon:request:' || left(p_client_key, 100),
        private.setting_int('anon_request_daily_limit', 3), 86400) then
      raise exception 'Too many requests from this connection today. For emergencies, contact the hospital blood bank directly.'
        using errcode = 'RR429';
    end if;
    if nullif(btrim(p_requester_phone), '') is null and nullif(btrim(p_requester_email), '') is null then
      raise exception 'Please share a phone number or email so a volunteer can reach you' using errcode = '22023';
    end if;
  else
    if not private.rate_limit_hit('request:' || v_uid::text, private.setting_int('member_request_daily_limit', 5), 86400) then
      raise exception 'You have submitted several requests today. Please contact a volunteer for further help.'
        using errcode = 'RR429';
    end if;
  end if;

  if p_required_by < now() - interval '1 hour' then
    raise exception 'The required date and time must not be in the past' using errcode = '22023';
  end if;
  if p_required_by > now() + interval '60 days' then
    raise exception 'Requests can be planned at most 60 days ahead' using errcode = '22023';
  end if;

  select br.id into v_dup
  from public.blood_requests br
  where br.blood_group = p_blood_group
    and br.request_type = p_request_type
    and lower(btrim(br.hospital_name)) = lower(btrim(p_hospital))
    and br.district_norm = lower(btrim(p_district))
    and br.status in ('submitted', 'under_verification', 'verified', 'in_coordination')
    and br.created_at > now() - interval '72 hours'
  order by br.created_at desc
  limit 1;

  insert into public.blood_requests (
    created_by, requester_name, requester_phone, requester_email, requester_contact_method,
    blood_group, request_type, units_needed, hospital_name, state, district, city,
    required_by, urgency, notes, public_listing_consent, status, possible_duplicate_of, submitter_key_hash
  ) values (
    v_uid, btrim(p_requester_name), nullif(btrim(p_requester_phone), ''), nullif(lower(btrim(p_requester_email)), ''),
    coalesce(p_contact_method, 'phone'), p_blood_group, coalesce(p_request_type, 'whole_blood'), p_units,
    btrim(p_hospital), nullif(btrim(p_state), ''), btrim(p_district), btrim(p_city),
    p_required_by, coalesce(p_urgency, 'urgent'), nullif(btrim(p_notes), ''), coalesce(p_public_listing, false),
    'submitted', v_dup, case when v_uid is null then left(p_client_key, 128) end
  )
  returning * into v_row;

  insert into public.request_events (request_id, actor_id, event_type, to_status)
  values (v_row.id, v_uid, 'created', 'submitted');
  if v_dup is not null then
    insert into public.request_events (request_id, actor_id, event_type, note)
    values (v_row.id, v_uid, 'duplicate_flagged', 'Possible duplicate of an open request at the same hospital');
  end if;

  perform private.notify_request_reviewers(v_row.id,
    'New ' || p_blood_group::text || ' ' || private.request_type_label(v_row.request_type) || ' request',
    'Needs verification: ' || v_row.hospital_name || ', ' || v_row.city
      || case when v_dup is not null then '. Possible duplicate — please check.' else '.' end);
  perform private.write_audit('blood_request.submitted', 'blood_requests', v_row.id::text,
    jsonb_build_object('anonymous', v_uid is null, 'possible_duplicate', v_dup is not null, 'request_type', v_row.request_type));

  return query select v_row.id, v_row.reference_code, v_dup;
end;
$$;

-- Alerts opted-in donors (same blood group and district) when a request is
-- verified. In-app only, capped, and never sent to donors who have not opted in.
create or replace function private.alert_matching_donors(p_request uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  with req as (
    select * from public.blood_requests where id = p_request
  ), targets as (
    select p.id as donor_id, req.id as request_id, req.blood_group, req.request_type, req.city, req.hospital_name, req.required_by
    from req
    join public.profiles p on p.blood_group = req.blood_group and p.is_donor and p.is_active and p.deletion_requested_at is null
    join public.donor_preferences pr on pr.profile_id = p.id and pr.emergency_alerts and pr.open_to_contact
    join public.donor_locations l on l.profile_id = p.id and l.district_norm = req.district_norm
    join auth.users u on u.id = p.id and u.email_confirmed_at is not null
    where p.id is distinct from req.created_by
    order by
      (req.request_type = 'sdp' and exists (
        select 1 from public.donation_records r
        where r.donor_id = p.id and r.donation_type = 'sdp' and r.verification_status <> 'rejected')) desc,
      (p.verification_status = 'verified') desc,
      p.last_active_at desc
    limit private.setting_int('request_alert_max_donors', 25)
  ), responses as (
    insert into public.request_responses (request_id, donor_id)
    select t.request_id, t.donor_id from targets t
    on conflict (request_id, donor_id) do nothing
  )
  insert into public.notifications (user_id, kind, title, body, link)
  select t.donor_id, 'request_alert',
    left('Verified ' || t.blood_group::text || ' ' || private.request_type_label(t.request_type) || ' request in ' || t.city, 140),
    left('Needed by ' || to_char(t.required_by at time zone 'Asia/Kolkata', 'DD Mon, HH24:MI') || ' at ' || t.hospital_name
      || '. Respond only if you are currently able to donate — the blood centre will confirm your eligibility.', 600),
    '/requests'
  from targets t;
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

create or replace function public.set_request_status(
  p_request uuid,
  p_status public.request_status,
  p_reason text default null
)
returns public.request_status
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_old public.blood_requests;
  v_reason text := nullif(btrim(p_reason), '');
  v_alerted integer := 0;
begin
  if not public.is_staff() then
    raise exception 'Only authorised volunteers can update request status' using errcode = '42501';
  end if;
  select * into v_old from public.blood_requests where id = p_request for update;
  if not found then
    raise exception 'Request not found' using errcode = 'P0002';
  end if;
  if v_old.status = p_status then
    return p_status;
  end if;
  if not private.request_transition_allowed(v_old.status, p_status) then
    raise exception 'A request cannot move from "%" to "%"',
      private.request_status_label(v_old.status), private.request_status_label(p_status) using errcode = '22023';
  end if;
  if p_status in ('under_verification', 'verified', 'rejected') and not public.staff_can('verify_requests') then
    raise exception 'You are not authorised to verify requests' using errcode = '42501';
  end if;
  if p_status in ('rejected', 'cancelled', 'fulfilled') and v_reason is null then
    raise exception 'Please record a short reason or confirmation note' using errcode = '22023';
  end if;

  update public.blood_requests set
    status = p_status,
    verified_by = case when p_status = 'verified' and verified_at is null then auth.uid() else verified_by end,
    verified_at = case when p_status = 'verified' and verified_at is null then now() else verified_at end,
    closed_at = case when p_status in ('fulfilled', 'cancelled', 'expired', 'rejected') then now() else null end,
    closure_reason = case when p_status in ('fulfilled', 'cancelled', 'expired', 'rejected') then left(v_reason, 500) else closure_reason end
  where id = p_request;

  insert into public.request_events (request_id, actor_id, event_type, from_status, to_status, note)
  values (p_request, auth.uid(), 'status_changed', v_old.status, p_status, left(v_reason, 500));

  if p_status in ('fulfilled', 'cancelled', 'expired', 'rejected') then
    update public.volunteer_assignments set status = 'completed' where request_id = p_request and status = 'active';
    update public.contact_requests set status = 'expired' where blood_request_id = p_request and status = 'pending';
  end if;

  if p_status = 'verified' and v_old.verified_at is null then
    v_alerted := private.alert_matching_donors(p_request);
  end if;

  perform private.notify(v_old.created_by, 'request_update',
    'Request ' || v_old.reference_code || ': ' || private.request_status_label(p_status),
    case p_status
      when 'verified' then 'A volunteer verified your request and is looking for donors. Keep in touch with the hospital blood bank.'
      when 'in_coordination' then 'Volunteers are coordinating with potential donors.'
      when 'rejected' then 'We could not verify this request. ' || coalesce(v_reason, '')
      else coalesce(v_reason, null) end,
    '/requests');

  perform private.write_audit('blood_request.status_changed', 'blood_requests', p_request::text,
    jsonb_build_object('from', v_old.status, 'to', p_status, 'donors_alerted', v_alerted));
  return p_status;
end;
$$;

create or replace function public.cancel_my_blood_request(p_request uuid, p_reason text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_old public.blood_requests;
begin
  select * into v_old from public.blood_requests where id = p_request for update;
  if not found or v_old.created_by is distinct from auth.uid() then
    raise exception 'Request not found' using errcode = 'P0002';
  end if;
  if v_old.status in ('fulfilled', 'cancelled', 'expired', 'rejected') then
    raise exception 'This request is already closed' using errcode = '22023';
  end if;
  update public.blood_requests set status = 'cancelled', closed_at = now(),
    closure_reason = left(coalesce(nullif(btrim(p_reason), ''), 'Cancelled by requester'), 500)
  where id = p_request;
  insert into public.request_events (request_id, actor_id, event_type, from_status, to_status, note)
  values (p_request, auth.uid(), 'status_changed', v_old.status, 'cancelled', 'Cancelled by requester');
  update public.volunteer_assignments set status = 'completed' where request_id = p_request and status = 'active';
  update public.contact_requests set status = 'cancelled' where blood_request_id = p_request and status = 'pending';
  perform private.write_audit('blood_request.cancelled_by_requester', 'blood_requests', p_request::text, '{}'::jsonb);
end;
$$;

create or replace function public.expire_stale_requests()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  if not (public.is_staff() or coalesce(auth.role(), '') = 'service_role' or (auth.uid() is null and session_user in ('postgres', 'supabase_admin'))) then
    raise exception 'Not authorised' using errcode = '42501';
  end if;
  with expired as (
    update public.blood_requests br set status = 'expired', closed_at = now(),
      closure_reason = 'Expired automatically after the required time passed'
    where br.status in ('draft', 'submitted', 'under_verification', 'verified', 'in_coordination')
      and br.required_by < now() - make_interval(hours => private.setting_int('request_expiry_grace_hours', 12))
    returning br.id
  ), events as (
    insert into public.request_events (request_id, event_type, to_status, note)
    select e.id, 'status_changed', 'expired', 'Expired automatically' from expired e
  ), assignments as (
    update public.volunteer_assignments va set status = 'completed'
    where va.status = 'active' and va.request_id in (select e.id from expired e)
  )
  select count(*) into v_count from expired;
  if v_count > 0 then
    perform private.write_audit('blood_request.auto_expired', 'blood_requests', null, jsonb_build_object('count', v_count));
  end if;
  return v_count;
end;
$$;

-- -----------------------------------------------------------------------------
-- Assignments and coordination outcomes
-- -----------------------------------------------------------------------------
create or replace function public.assign_request(p_request uuid, p_volunteer uuid default null)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_vol uuid := coalesce(p_volunteer, auth.uid());
  v_id uuid;
  v_req public.blood_requests;
begin
  if not public.is_staff() then
    raise exception 'Only authorised volunteers can take assignments' using errcode = '42501';
  end if;
  if v_vol <> auth.uid() and not public.is_admin() then
    raise exception 'Only administrators can assign other volunteers' using errcode = '42501';
  end if;
  if not exists (select 1 from public.staff_roles sr where sr.user_id = v_vol and sr.is_active) then
    raise exception 'That person is not an active volunteer' using errcode = '22023';
  end if;
  select * into v_req from public.blood_requests where id = p_request;
  if not found then
    raise exception 'Request not found' using errcode = 'P0002';
  end if;
  if v_req.status in ('fulfilled', 'cancelled', 'expired', 'rejected') then
    raise exception 'This request is closed' using errcode = '22023';
  end if;
  select va.id into v_id from public.volunteer_assignments va
  where va.request_id = p_request and va.volunteer_id = v_vol and va.status = 'active';
  if v_id is not null then
    return v_id;
  end if;
  insert into public.volunteer_assignments (request_id, volunteer_id, assigned_by, follow_up_at)
  values (p_request, v_vol, auth.uid(), now() + interval '4 hours')
  returning id into v_id;
  insert into public.request_events (request_id, actor_id, event_type, note)
  values (p_request, auth.uid(), 'assigned', case when v_vol = auth.uid() then 'Volunteer took the request' else 'Volunteer assigned by an administrator' end);
  if v_vol <> auth.uid() then
    perform private.notify(v_vol, 'request_update', 'You were assigned request ' || v_req.reference_code,
      v_req.blood_group::text || ' ' || private.request_type_label(v_req.request_type) || ' at ' || v_req.hospital_name,
      '/volunteer/requests/' || p_request::text);
  end if;
  return v_id;
end;
$$;

create or replace function public.update_assignment(
  p_assignment uuid,
  p_status public.assignment_status,
  p_follow_up_at timestamptz default null,
  p_notes text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_a public.volunteer_assignments;
begin
  if not public.is_staff() then
    raise exception 'Not authorised' using errcode = '42501';
  end if;
  select * into v_a from public.volunteer_assignments where id = p_assignment for update;
  if not found then
    raise exception 'Assignment not found' using errcode = 'P0002';
  end if;
  if v_a.volunteer_id <> auth.uid() and not public.is_admin() then
    raise exception 'You can only update your own assignments' using errcode = '42501';
  end if;
  update public.volunteer_assignments set
    status = p_status,
    follow_up_at = case when p_status = 'active' then p_follow_up_at else null end,
    follow_up_reminded_at = case when p_follow_up_at is distinct from v_a.follow_up_at then null else follow_up_reminded_at end,
    notes = coalesce(nullif(btrim(p_notes), ''), notes)
  where id = p_assignment;
  insert into public.request_events (request_id, actor_id, event_type, note)
  values (v_a.request_id, auth.uid(), 'assignment_updated', 'Assignment ' || p_status::text);
end;
$$;

create or replace function public.record_coordination(
  p_request uuid,
  p_donor uuid,
  p_response public.response_status default null,
  p_outcome public.coordination_outcome default null,
  p_attempted boolean default false
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_staff() then
    raise exception 'Only authorised volunteers can record coordination' using errcode = '42501';
  end if;
  if not exists (select 1 from public.blood_requests where id = p_request) then
    raise exception 'Request not found' using errcode = 'P0002';
  end if;
  if not exists (select 1 from public.profiles where id = p_donor and is_donor) then
    raise exception 'Donor not found' using errcode = 'P0002';
  end if;
  insert into public.request_responses as rr (
    request_id, donor_id, response, outcome, contact_attempts, last_contacted_at, last_contacted_by, responded_at
  ) values (
    p_request, p_donor, coalesce(p_response, 'no_response'), coalesce(p_outcome, 'pending'),
    case when p_attempted then 1 else 0 end,
    case when p_attempted then now() end,
    case when p_attempted then auth.uid() end,
    case when p_response is not null and p_response <> 'no_response' then now() end
  )
  on conflict (request_id, donor_id) do update set
    response = coalesce(p_response, rr.response),
    outcome = coalesce(p_outcome, rr.outcome),
    contact_attempts = least(rr.contact_attempts + case when p_attempted then 1 else 0 end, 100),
    last_contacted_at = case when p_attempted then now() else rr.last_contacted_at end,
    last_contacted_by = case when p_attempted then auth.uid() else rr.last_contacted_by end,
    responded_at = case when p_response is not null and p_response <> 'no_response' then now() else rr.responded_at end;
  insert into public.request_events (request_id, actor_id, event_type, note)
  values (p_request, auth.uid(),
    case when p_outcome is not null then 'outcome_recorded' when p_attempted then 'donor_contacted' else 'donor_responded' end,
    concat_ws('; ',
      case when p_attempted then 'Contact attempt logged' end,
      case when p_response is not null then 'Response: ' || p_response::text end,
      case when p_outcome is not null then 'Outcome: ' || p_outcome::text end));
end;
$$;

create or replace function public.generate_follow_up_reminders()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  if not (public.is_staff() or coalesce(auth.role(), '') = 'service_role' or (auth.uid() is null and session_user in ('postgres', 'supabase_admin'))) then
    raise exception 'Not authorised' using errcode = '42501';
  end if;
  with due as (
    update public.volunteer_assignments va set follow_up_reminded_at = now()
    where va.status = 'active' and va.follow_up_at is not null and va.follow_up_at <= now()
      and va.follow_up_reminded_at is null
    returning va.volunteer_id, va.request_id
  )
  insert into public.notifications (user_id, kind, title, body, link)
  select d.volunteer_id, 'follow_up', 'Follow-up due: ' || br.reference_code,
    'Check in on the ' || br.blood_group::text || ' request at ' || br.hospital_name || '.',
    '/volunteer/requests/' || br.id::text
  from due d join public.blood_requests br on br.id = d.request_id;
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- -----------------------------------------------------------------------------
-- Donor directory (staff only). Only donors who opted into directory
-- visibility, have confirmed email and an active account are ever returned.
-- Contact details are NEVER returned here.
-- -----------------------------------------------------------------------------
create or replace function private.directory_candidates(
  p_state text,
  p_district text,
  p_city text,
  p_locality text,
  p_pincode text,
  p_donation_type public.donation_type,
  p_verified_only boolean,
  p_open_only boolean,
  p_active_within_days integer,
  p_query text
)
returns table (
  profile_id uuid,
  blood_group public.blood_group,
  display_name text,
  state text,
  district text,
  city text,
  locality text,
  approx_lat numeric,
  approx_lng numeric,
  verification_status public.profile_verification,
  open_to_contact boolean,
  contact_consent boolean,
  show_donation_summary boolean,
  last_active_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select p.id, p.blood_group, coalesce(p.display_name, split_part(p.full_name, ' ', 1)),
    l.state, l.district, l.city, l.locality, l.approx_lat, l.approx_lng,
    p.verification_status, pr.open_to_contact, pr.contact_consent, pr.show_donation_summary, p.last_active_at
  from public.profiles p
  join public.donor_preferences pr on pr.profile_id = p.id
  join public.donor_locations l on l.profile_id = p.id
  join auth.users u on u.id = p.id
  where p.is_donor and p.is_active and p.deletion_requested_at is null
    and pr.directory_visible and u.email_confirmed_at is not null
    and (nullif(btrim(p_state), '') is null or l.state_norm = lower(btrim(p_state)))
    and (nullif(btrim(p_district), '') is null or l.district_norm = lower(btrim(p_district)))
    and (nullif(btrim(p_city), '') is null or l.city_norm = lower(btrim(p_city)))
    and (nullif(btrim(p_locality), '') is null or l.locality ilike '%' || private.like_escape(btrim(p_locality)) || '%')
    and (nullif(btrim(p_pincode), '') is null or l.pincode = btrim(p_pincode))
    and (not coalesce(p_verified_only, false) or p.verification_status = 'verified')
    and (not coalesce(p_open_only, false) or pr.open_to_contact)
    and (p_active_within_days is null or p.last_active_at >= now() - make_interval(days => p_active_within_days))
    and (
      nullif(btrim(p_query), '') is null
      or coalesce(p.display_name, p.full_name) ilike '%' || private.like_escape(btrim(p_query)) || '%'
      or l.locality ilike '%' || private.like_escape(btrim(p_query)) || '%'
      or l.city ilike '%' || private.like_escape(btrim(p_query)) || '%'
      or l.pincode = btrim(p_query)
    )
    and (p_donation_type is null or exists (
      select 1 from public.donation_records r
      where r.donor_id = p.id and r.donation_type = p_donation_type and r.verification_status <> 'rejected'));
$$;

create or replace function public.search_donors(
  p_blood_groups public.blood_group[] default null,
  p_state text default null,
  p_district text default null,
  p_city text default null,
  p_locality text default null,
  p_pincode text default null,
  p_donation_type public.donation_type default null,
  p_verified_only boolean default false,
  p_open_only boolean default false,
  p_active_within_days integer default null,
  p_query text default null,
  p_near_lat numeric default null,
  p_near_lng numeric default null,
  p_radius_km integer default null,
  p_sort text default 'relevance',
  p_limit integer default 20,
  p_offset integer default 0
)
returns table (
  donor_id uuid,
  display_name text,
  blood_group public.blood_group,
  state text,
  district text,
  city text,
  locality text,
  verification_status public.profile_verification,
  open_to_contact boolean,
  contact_consent boolean,
  show_donation_summary boolean,
  last_verified_whole_blood date,
  last_verified_sdp date,
  verified_whole_blood_count integer,
  verified_sdp_count integer,
  has_sdp_history boolean,
  last_active_at timestamptz,
  distance_km numeric,
  total_count bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  v_limit integer := least(greatest(coalesce(p_limit, 20), 1), 50);
  v_offset integer := greatest(coalesce(p_offset, 0), 0);
begin
  if not public.is_staff() then
    raise exception 'Only authorised volunteers can search the donor directory' using errcode = '42501';
  end if;
  return query
  with c as (
    select dc.*,
      case when p_near_lat is not null and p_near_lng is not null and dc.approx_lat is not null then
        round((6371 * 2 * asin(sqrt(
          power(sin(radians((dc.approx_lat - p_near_lat)::double precision) / 2), 2)
          + cos(radians(p_near_lat::double precision)) * cos(radians(dc.approx_lat::double precision))
          * power(sin(radians((dc.approx_lng - p_near_lng)::double precision) / 2), 2)
        )))::numeric, 1)
      end as dist
    from private.directory_candidates(p_state, p_district, p_city, p_locality, p_pincode, p_donation_type,
      p_verified_only, p_open_only, p_active_within_days, p_query) dc
    where (p_blood_groups is null or cardinality(p_blood_groups) = 0 or dc.blood_group = any(p_blood_groups))
  ), filtered as (
    select * from c where p_radius_km is null or (c.dist is not null and c.dist <= p_radius_km)
  )
  select f.profile_id, f.display_name, f.blood_group, f.state, f.district, f.city, f.locality,
    f.verification_status, f.open_to_contact, f.contact_consent, f.show_donation_summary,
    case when f.show_donation_summary then s.last_wb end,
    case when f.show_donation_summary then s.last_sdp end,
    case when f.show_donation_summary then s.wb_count end,
    case when f.show_donation_summary then s.sdp_count end,
    s.has_sdp,
    f.last_active_at, f.dist,
    count(*) over ()
  from filtered f
  left join lateral (
    select
      max(r.donation_date) filter (where r.donation_type = 'whole_blood' and r.verification_status = 'verified') as last_wb,
      max(r.donation_date) filter (where r.donation_type = 'sdp' and r.verification_status = 'verified') as last_sdp,
      (count(*) filter (where r.donation_type = 'whole_blood' and r.verification_status = 'verified'))::integer as wb_count,
      (count(*) filter (where r.donation_type = 'sdp' and r.verification_status = 'verified'))::integer as sdp_count,
      bool_or(r.donation_type = 'sdp' and r.verification_status <> 'rejected') as has_sdp
    from public.donation_records r where r.donor_id = f.profile_id
  ) s on true
  order by
    case when p_sort = 'distance' then f.dist end asc nulls last,
    case when p_sort = 'recent' then f.last_active_at end desc,
    case when p_sort = 'locality' then f.city end asc,
    case when p_sort = 'locality' then f.locality end asc nulls last,
    ((f.verification_status = 'verified')::integer * 2 + f.open_to_contact::integer * 2
      + (f.last_active_at > now() - interval '90 days')::integer) desc,
    f.last_active_at desc,
    f.profile_id
  limit v_limit offset v_offset;
end;
$$;

create or replace function public.search_donor_facets(
  p_state text default null,
  p_district text default null,
  p_city text default null,
  p_locality text default null,
  p_pincode text default null,
  p_donation_type public.donation_type default null,
  p_verified_only boolean default false,
  p_open_only boolean default false,
  p_active_within_days integer default null,
  p_query text default null
)
returns table (blood_group public.blood_group, donor_count integer)
language plpgsql
stable
security definer
set search_path = ''
as $$
#variable_conflict use_column
begin
  if not public.is_staff() then
    raise exception 'Only authorised volunteers can search the donor directory' using errcode = '42501';
  end if;
  return query
  select dc.blood_group, count(*)::integer
  from private.directory_candidates(p_state, p_district, p_city, p_locality, p_pincode, p_donation_type,
    p_verified_only, p_open_only, p_active_within_days, p_query) dc
  group by dc.blood_group
  order by dc.blood_group;
end;
$$;

-- Donors who match a request: same blood group, same district, directory
-- visible. Compatibility beyond an exact group match is a clinical decision
-- and is deliberately not inferred here.
create or replace function public.match_donors_for_request(
  p_request uuid,
  p_limit integer default 20,
  p_offset integer default 0
)
returns table (
  donor_id uuid,
  display_name text,
  blood_group public.blood_group,
  city text,
  locality text,
  verification_status public.profile_verification,
  open_to_contact boolean,
  contact_consent boolean,
  has_sdp_history boolean,
  last_verified_sdp date,
  last_verified_whole_blood date,
  last_active_at timestamptz,
  response public.response_status,
  outcome public.coordination_outcome,
  contact_attempts integer,
  contact_request_status public.contact_request_status,
  total_count bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  v_req public.blood_requests;
begin
  if not public.is_staff() then
    raise exception 'Only authorised volunteers can match donors' using errcode = '42501';
  end if;
  select * into v_req from public.blood_requests where id = p_request;
  if not found then
    raise exception 'Request not found' using errcode = 'P0002';
  end if;
  return query
  select dc.profile_id, dc.display_name, dc.blood_group, dc.city, dc.locality, dc.verification_status,
    dc.open_to_contact, dc.contact_consent,
    coalesce(s.has_sdp, false),
    case when dc.show_donation_summary then s.last_sdp end,
    case when dc.show_donation_summary then s.last_wb end,
    dc.last_active_at,
    rr.response, rr.outcome, coalesce(rr.contact_attempts, 0),
    cr.status,
    count(*) over ()
  from private.directory_candidates(null, v_req.district, null, null, null, null, false, false, null, null) dc
  left join lateral (
    select
      bool_or(r.donation_type = 'sdp' and r.verification_status <> 'rejected') as has_sdp,
      max(r.donation_date) filter (where r.donation_type = 'sdp' and r.verification_status = 'verified') as last_sdp,
      max(r.donation_date) filter (where r.donation_type = 'whole_blood' and r.verification_status = 'verified') as last_wb
    from public.donation_records r where r.donor_id = dc.profile_id
  ) s on true
  left join public.request_responses rr on rr.request_id = p_request and rr.donor_id = dc.profile_id
  left join lateral (
    select c.status from public.contact_requests c
    where c.blood_request_id = p_request and c.donor_id = dc.profile_id
    order by c.created_at desc limit 1
  ) cr on true
  where dc.blood_group = v_req.blood_group
    and dc.profile_id is distinct from v_req.created_by
  order by
    (rr.response = 'interested') desc nulls last,
    (rr.response in ('declined', 'unavailable')) asc nulls first,
    (v_req.request_type = 'sdp' and coalesce(s.has_sdp, false)) desc,
    (dc.verification_status = 'verified') desc,
    dc.open_to_contact desc,
    dc.last_active_at desc
  limit least(greatest(coalesce(p_limit, 20), 1), 50) offset greatest(coalesce(p_offset, 0), 0);
end;
$$;

-- -----------------------------------------------------------------------------
-- Consent-checked contact access
-- -----------------------------------------------------------------------------
create or replace function public.reveal_donor_contact(p_donor uuid, p_request uuid)
returns table (
  display_name text,
  phone text,
  whatsapp text,
  email text,
  preferred_contact_method public.contact_method
)
language plpgsql
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  v_req public.blood_requests;
  v_pref public.donor_preferences;
  v_accepted boolean;
begin
  if not public.is_staff() then
    raise exception 'Only authorised volunteers can access donor contact details' using errcode = '42501';
  end if;
  select * into v_req from public.blood_requests where id = p_request;
  if not found or v_req.status not in ('verified', 'in_coordination') then
    raise exception 'Contact details can only be accessed for a verified, active blood request' using errcode = '42501';
  end if;
  if not exists (
    select 1 from public.profiles p join auth.users u on u.id = p.id
    where p.id = p_donor and p.is_donor and p.is_active and p.deletion_requested_at is null and u.email_confirmed_at is not null
  ) then
    raise exception 'This donor is not available' using errcode = 'P0002';
  end if;
  select * into v_pref from public.donor_preferences where profile_id = p_donor;
  v_accepted := exists (
    select 1 from public.contact_requests c
    where c.donor_id = p_donor and c.blood_request_id = p_request and c.status = 'accepted'
  );
  if not (v_accepted or (v_pref.contact_consent and v_pref.open_to_contact)) then
    raise exception 'This donor has not agreed to be contacted directly. Send a contact request instead.'
      using errcode = '42501';
  end if;
  if not private.rate_limit_hit('reveal:' || auth.uid()::text, private.setting_int('contact_reveal_hourly_limit', 20), 3600) then
    raise exception 'You have reached the hourly limit for viewing contact details. Please try again later.'
      using errcode = 'RR429';
  end if;

  insert into public.request_responses (request_id, donor_id)
  values (p_request, p_donor)
  on conflict (request_id, donor_id) do nothing;

  perform private.write_audit('donor_contact.revealed', 'profiles', p_donor::text,
    jsonb_build_object('request_id', p_request, 'basis', case when v_accepted then 'contact_request_accepted' else 'standing_consent' end));

  return query
  select coalesce(p.display_name, split_part(p.full_name, ' ', 1)),
    c.phone, coalesce(c.whatsapp, c.phone),
    case when v_pref.preferred_contact_method = 'email' then c.email end,
    v_pref.preferred_contact_method
  from public.profiles p
  join public.profile_contacts c on c.profile_id = p.id
  where p.id = p_donor;
end;
$$;

create or replace function public.create_contact_request(p_donor uuid, p_request uuid, p_message text default null)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_req public.blood_requests;
  v_id uuid;
begin
  if not public.is_staff() then
    raise exception 'Only authorised volunteers can send contact requests' using errcode = '42501';
  end if;
  select * into v_req from public.blood_requests where id = p_request;
  if not found or v_req.status not in ('verified', 'in_coordination') then
    raise exception 'Contact requests can only be sent for a verified, active blood request' using errcode = '42501';
  end if;
  if not exists (
    select 1 from public.profiles p join public.donor_preferences pr on pr.profile_id = p.id
    where p.id = p_donor and p.is_donor and p.is_active and p.deletion_requested_at is null and pr.directory_visible
  ) then
    raise exception 'This donor is not available in the directory' using errcode = 'P0002';
  end if;
  if exists (select 1 from public.contact_requests c where c.donor_id = p_donor and c.blood_request_id = p_request and c.status = 'pending') then
    raise exception 'A contact request is already waiting for this donor' using errcode = '23505';
  end if;
  if exists (select 1 from public.contact_requests c where c.donor_id = p_donor and c.blood_request_id = p_request and c.status = 'declined') then
    raise exception 'This donor declined to share contact details for this request' using errcode = '42501';
  end if;
  if not private.rate_limit_hit('contact_request:' || auth.uid()::text, private.setting_int('contact_request_hourly_limit', 30), 3600) then
    raise exception 'You have sent many contact requests in the last hour. Please try again later.' using errcode = 'RR429';
  end if;

  insert into public.contact_requests (donor_id, blood_request_id, requested_by, message)
  values (p_donor, p_request, auth.uid(), nullif(left(btrim(p_message), 500), ''))
  returning id into v_id;

  insert into public.request_responses (request_id, donor_id) values (p_request, p_donor)
  on conflict (request_id, donor_id) do nothing;
  insert into public.request_events (request_id, actor_id, event_type, note)
  values (p_request, auth.uid(), 'contact_requested', 'Contact request sent to a donor');

  perform private.notify(p_donor, 'contact_request',
    'Can a volunteer contact you about a ' || v_req.blood_group::text || ' request?',
    'A verified ' || private.request_type_label(v_req.request_type) || ' request at ' || v_req.hospital_name || ', ' || v_req.city
      || '. Accept only if you are willing to be contacted — you can decline without giving a reason.',
    '/requests');
  perform private.write_audit('contact_request.created', 'contact_requests', v_id::text,
    jsonb_build_object('request_id', p_request));
  return v_id;
end;
$$;

create or replace function public.respond_to_contact_request(p_contact_request uuid, p_accept boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_cr public.contact_requests;
  v_ref text;
begin
  select * into v_cr from public.contact_requests where id = p_contact_request for update;
  if not found or v_cr.donor_id is distinct from auth.uid() then
    raise exception 'Contact request not found' using errcode = 'P0002';
  end if;
  if v_cr.status <> 'pending' then
    raise exception 'This contact request is no longer open' using errcode = '22023';
  end if;
  if v_cr.expires_at < now() then
    update public.contact_requests set status = 'expired' where id = p_contact_request;
    raise exception 'This contact request has expired' using errcode = '22023';
  end if;
  update public.contact_requests set status = case when p_accept then 'accepted'::public.contact_request_status else 'declined'::public.contact_request_status end,
    responded_at = now()
  where id = p_contact_request;
  insert into public.request_responses as rr (request_id, donor_id, response, responded_at)
  values (v_cr.blood_request_id, v_cr.donor_id, case when p_accept then 'interested'::public.response_status else 'declined'::public.response_status end, now())
  on conflict (request_id, donor_id) do update set response = excluded.response, responded_at = now();
  insert into public.request_events (request_id, actor_id, event_type, note)
  values (v_cr.blood_request_id, auth.uid(), 'donor_responded',
    case when p_accept then 'Donor accepted a contact request' else 'Donor declined a contact request' end);
  select reference_code into v_ref from public.blood_requests where id = v_cr.blood_request_id;
  perform private.notify(v_cr.requested_by, 'contact_response',
    case when p_accept then 'A donor accepted your contact request' else 'A donor declined your contact request' end,
    'Request ' || v_ref || case when p_accept then '. You can now view their contact details from the request page.' else '.' end,
    '/volunteer/requests/' || v_cr.blood_request_id::text);
end;
$$;

create or replace function public.respond_to_blood_request(p_request uuid, p_response public.response_status)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_req public.blood_requests;
begin
  if auth.uid() is null then
    raise exception 'Sign in required' using errcode = '42501';
  end if;
  if p_response = 'no_response' then
    raise exception 'Choose a response' using errcode = '22023';
  end if;
  if not exists (select 1 from public.profiles where id = auth.uid() and is_donor and is_active) then
    raise exception 'Complete your donor profile to respond to requests' using errcode = '42501';
  end if;
  select * into v_req from public.blood_requests where id = p_request;
  if not found or v_req.status not in ('verified', 'in_coordination') then
    raise exception 'This request is not open for responses' using errcode = '22023';
  end if;
  insert into public.request_responses as rr (request_id, donor_id, response, responded_at)
  values (p_request, auth.uid(), p_response, now())
  on conflict (request_id, donor_id) do update set response = excluded.response, responded_at = now();
  insert into public.request_events (request_id, actor_id, event_type, note)
  values (p_request, auth.uid(), 'donor_responded', 'Donor response: ' || p_response::text);
  if p_response = 'interested' then
    insert into public.notifications (user_id, kind, title, body, link)
    select va.volunteer_id, 'contact_response', 'A donor is interested in ' || v_req.reference_code,
      'Check the request page to coordinate. Interest is not a confirmed donation.',
      '/volunteer/requests/' || p_request::text
    from public.volunteer_assignments va where va.request_id = p_request and va.status = 'active';
  end if;
end;
$$;

-- -----------------------------------------------------------------------------
-- Public request listing (no requester details are ever returned)
-- -----------------------------------------------------------------------------
create or replace function public.list_public_blood_requests(
  p_blood_group public.blood_group default null,
  p_district text default null,
  p_request_type public.request_type default null,
  p_limit integer default 20,
  p_offset integer default 0
)
returns table (
  id uuid,
  reference_code text,
  blood_group public.blood_group,
  request_type public.request_type,
  units_needed integer,
  hospital_name text,
  city text,
  district text,
  required_by timestamptz,
  urgency public.request_urgency,
  status public.request_status,
  verified_at timestamptz,
  total_count bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  select br.id, br.reference_code, br.blood_group, br.request_type, br.units_needed, br.hospital_name,
    br.city, br.district, br.required_by, br.urgency, br.status, br.verified_at, count(*) over ()
  from public.blood_requests br
  where br.status in ('verified', 'in_coordination')
    and br.public_listing_consent
    and br.required_by > now() - interval '6 hours'
    and (p_blood_group is null or br.blood_group = p_blood_group)
    and (nullif(btrim(p_district), '') is null or br.district_norm = lower(btrim(p_district)))
    and (p_request_type is null or br.request_type = p_request_type)
  order by
    case br.urgency when 'critical' then 0 when 'urgent' then 1 else 2 end,
    br.required_by asc
  limit least(greatest(coalesce(p_limit, 20), 1), 50) offset greatest(coalesce(p_offset, 0), 0);
$$;

create or replace function public.get_public_blood_request(p_id uuid)
returns table (
  id uuid,
  reference_code text,
  blood_group public.blood_group,
  request_type public.request_type,
  units_needed integer,
  hospital_name text,
  city text,
  district text,
  required_by timestamptz,
  urgency public.request_urgency,
  status public.request_status,
  verified_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select br.id, br.reference_code, br.blood_group, br.request_type, br.units_needed, br.hospital_name,
    br.city, br.district, br.required_by, br.urgency, br.status, br.verified_at
  from public.blood_requests br
  where br.id = p_id
    and br.public_listing_consent
    and br.status in ('verified', 'in_coordination', 'fulfilled', 'expired', 'cancelled');
$$;

-- Requests relevant to the signed-in donor: ones they were alerted about or
-- asked to share contact for, plus publicly listed verified requests for their
-- blood group in their district. Requester details are never returned.
create or replace function public.list_my_request_matches()
returns table (
  request_id uuid,
  reference_code text,
  blood_group public.blood_group,
  request_type public.request_type,
  units_needed integer,
  hospital_name text,
  city text,
  district text,
  required_by timestamptz,
  urgency public.request_urgency,
  status public.request_status,
  verified_at timestamptz,
  my_response public.response_status,
  contact_request_id uuid,
  contact_request_status public.contact_request_status,
  contact_request_message text,
  contact_request_expires_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  with me as (
    select p.id, p.blood_group, l.district_norm
    from public.profiles p
    left join public.donor_locations l on l.profile_id = p.id
    where p.id = auth.uid() and p.is_donor and p.is_active
  )
  select br.id, br.reference_code, br.blood_group, br.request_type, br.units_needed, br.hospital_name,
    br.city, br.district, br.required_by, br.urgency, br.status, br.verified_at,
    rr.response, cr.id, cr.status, cr.message, cr.expires_at
  from public.blood_requests br
  cross join me
  left join public.request_responses rr on rr.request_id = br.id and rr.donor_id = me.id
  left join lateral (
    select c.id, c.status, c.message, c.expires_at from public.contact_requests c
    where c.blood_request_id = br.id and c.donor_id = me.id
    order by c.created_at desc limit 1
  ) cr on true
  where br.status in ('verified', 'in_coordination')
    and br.required_by > now() - interval '6 hours'
    and br.created_by is distinct from me.id
    and (
      rr.id is not null
      or cr.id is not null
      or (br.public_listing_consent and br.blood_group = me.blood_group and br.district_norm = me.district_norm)
    )
  order by (cr.status = 'pending') desc nulls last,
    case br.urgency when 'critical' then 0 when 'urgent' then 1 else 2 end,
    br.required_by
  limit 50;
$$;

-- Minimal labels (display name + blood group) for people a volunteer is already
-- working with: donors on requests, record owners, fellow staff, note authors.
create or replace function public.staff_profile_labels(p_ids uuid[])
returns table (id uuid, label text, blood_group public.blood_group)
language plpgsql
stable
security definer
set search_path = ''
as $$
#variable_conflict use_column
begin
  if not public.is_staff() then
    raise exception 'Not authorised' using errcode = '42501';
  end if;
  return query
  select p.id, coalesce(p.display_name, split_part(p.full_name, ' ', 1)), p.blood_group
  from public.profiles p
  where p.id = any(p_ids[1:200]);
end;
$$;

-- -----------------------------------------------------------------------------
-- Staff overview and administrator analytics
-- -----------------------------------------------------------------------------
create or replace function public.get_volunteer_overview()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_staff() then
    raise exception 'Not authorised' using errcode = '42501';
  end if;
  return jsonb_build_object(
    'awaiting_verification', (select count(*) from public.blood_requests where status in ('submitted', 'under_verification')),
    'urgent_awaiting_verification', (select count(*) from public.blood_requests where status in ('submitted', 'under_verification') and urgency in ('urgent', 'critical')),
    'active_requests', (select count(*) from public.blood_requests where status in ('verified', 'in_coordination')),
    'my_assignments', (select count(*) from public.volunteer_assignments where volunteer_id = auth.uid() and status = 'active'),
    'follow_ups_due', (select count(*) from public.volunteer_assignments where volunteer_id = auth.uid() and status = 'active' and follow_up_at <= now()),
    'interested_responses_7d', (select count(*) from public.request_responses where response = 'interested' and responded_at > now() - interval '7 days'),
    'pending_donation_records', (select count(*) from public.donation_records where verification_status = 'pending')
  );
end;
$$;

create or replace function public.get_admin_analytics()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Only administrators can view analytics' using errcode = '42501';
  end if;
  return jsonb_build_object(
    'generated_at', now(),
    'donors', jsonb_build_object(
      'registered', (select count(*) from public.profiles p join auth.users u on u.id = p.id
                     where p.is_donor and p.is_active and p.deletion_requested_at is null and u.email_confirmed_at is not null),
      'unconfirmed_email', (select count(*) from public.profiles p join auth.users u on u.id = p.id where u.email_confirmed_at is null),
      'verified', (select count(*) from public.profiles where is_donor and is_active and verification_status = 'verified'),
      'pending_verification', (select count(*) from public.profiles where is_donor and is_active and verification_status in ('unverified', 'pending')),
      'directory_visible', (select count(*) from public.donor_preferences pr join public.profiles p on p.id = pr.profile_id
                            where pr.directory_visible and p.is_active),
      'deletion_requests', (select count(*) from public.profiles where deletion_requested_at is not null and is_active),
      'blood_group_changes', (select count(*) from public.profiles where requested_blood_group is not null)
    ),
    'by_blood_group', coalesce((
      select jsonb_agg(jsonb_build_object('blood_group', g.bg, 'count', g.n) order by g.bg)
      from (select p.blood_group as bg, count(*) as n from public.profiles p
            where p.is_donor and p.is_active and p.blood_group is not null group by p.blood_group) g
    ), '[]'::jsonb),
    'by_district', coalesce((
      select jsonb_agg(jsonb_build_object('district', d.district, 'count', d.n) order by d.n desc)
      from (select initcap(l.district_norm) as district, count(*) as n
            from public.donor_locations l join public.profiles p on p.id = l.profile_id
            where p.is_donor and p.is_active group by l.district_norm order by count(*) desc limit 15) d
    ), '[]'::jsonb),
    'donations', jsonb_build_object(
      'verified_whole_blood', (select count(*) from public.donation_records where donation_type = 'whole_blood' and verification_status = 'verified'),
      'verified_sdp', (select count(*) from public.donation_records where donation_type = 'sdp' and verification_status = 'verified'),
      'verified_other_apheresis', (select count(*) from public.donation_records where donation_type = 'other_apheresis' and verification_status = 'verified'),
      'pending', (select count(*) from public.donation_records where verification_status = 'pending'),
      'rejected', (select count(*) from public.donation_records where verification_status = 'rejected')
    ),
    'requests', jsonb_build_object(
      'awaiting_verification', (select count(*) from public.blood_requests where status in ('submitted', 'under_verification')),
      'active', (select count(*) from public.blood_requests where status in ('verified', 'in_coordination')),
      'fulfilled', (select count(*) from public.blood_requests where status = 'fulfilled'),
      'by_status', coalesce((
        select jsonb_object_agg(s.status, s.n) from (select status::text as status, count(*) as n from public.blood_requests group by status) s
      ), '{}'::jsonb)
    ),
    'monthly_registrations', coalesce((
      select jsonb_agg(jsonb_build_object('month', to_char(m.month, 'YYYY-MM'), 'count', coalesce(r.n, 0)) order by m.month)
      from generate_series(date_trunc('month', now()) - interval '11 months', date_trunc('month', now()), interval '1 month') m(month)
      left join (select date_trunc('month', created_at) as month, count(*) as n from public.profiles where is_donor group by 1) r on r.month = m.month
    ), '[]'::jsonb),
    'monthly_verified_donations', coalesce((
      select jsonb_agg(jsonb_build_object('month', to_char(m.month, 'YYYY-MM'),
        'whole_blood', coalesce(r.wb, 0), 'sdp', coalesce(r.sdp, 0)) order by m.month)
      from generate_series(date_trunc('month', now()) - interval '11 months', date_trunc('month', now()), interval '1 month') m(month)
      left join (
        select date_trunc('month', donation_date::timestamptz) as month,
          count(*) filter (where donation_type = 'whole_blood') as wb,
          count(*) filter (where donation_type = 'sdp') as sdp
        from public.donation_records where verification_status = 'verified' group by 1
      ) r on r.month = m.month
    ), '[]'::jsonb)
  );
end;
$$;

-- Staff can record export/report events (actions are restricted to a namespace).
create or replace function public.log_audit_event(
  p_action text,
  p_entity_type text default null,
  p_entity_id text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_staff() then
    raise exception 'Not authorised' using errcode = '42501';
  end if;
  if p_action !~ '^(export|report|staff)\.[a-z_.]{2,60}$' then
    raise exception 'Invalid audit action' using errcode = '22023';
  end if;
  perform private.write_audit(p_action, p_entity_type, p_entity_id, coalesce(p_metadata, '{}'::jsonb));
end;
$$;

-- Audit verification changes made directly by administrators.
create trigger donation_records_audit after update of verification_status, record_source on public.donation_records
  for each row execute function private.audit_row_change();

-- -----------------------------------------------------------------------------
-- Retention: remove requester contact details from requests closed more than
-- p_days ago (default 90). Callable by admins, the service role or pg_cron.
-- -----------------------------------------------------------------------------
create or replace function public.purge_closed_request_contacts(p_days integer default 90)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  if not (public.is_admin() or coalesce(auth.role(), '') = 'service_role' or (auth.uid() is null and session_user in ('postgres', 'supabase_admin'))) then
    raise exception 'Not authorised' using errcode = '42501';
  end if;
  if p_days < 7 then
    raise exception 'Keep closed-request contacts for at least 7 days' using errcode = '22023';
  end if;
  update public.blood_requests set
    requester_phone = null,
    requester_email = null,
    notes = null,
    submitter_key_hash = null
  where status in ('fulfilled', 'cancelled', 'expired', 'rejected')
    and closed_at < now() - make_interval(days => p_days)
    and (requester_phone is not null or requester_email is not null or notes is not null or submitter_key_hash is not null);
  get diagnostics v_count = row_count;
  perform private.write_audit('retention.request_contacts_purged', 'blood_requests', null,
    jsonb_build_object('rows', v_count, 'older_than_days', p_days));
  return v_count;
end;
$$;

-- -----------------------------------------------------------------------------
-- Function privileges
-- -----------------------------------------------------------------------------
revoke execute on all functions in schema private from public;
revoke execute on all functions in schema public from public, anon;
grant execute on function public.is_staff(), public.is_admin(), public.staff_can(text) to anon;
grant execute on function public.list_public_blood_requests(public.blood_group, text, public.request_type, integer, integer) to anon;
grant execute on function public.get_public_blood_request(uuid) to anon;
revoke execute on function public.consume_rate_limit(text, integer, integer) from authenticated;
revoke execute on function public.bootstrap_first_admin(text) from authenticated;
revoke execute on function public.expire_stale_requests() from anon;
