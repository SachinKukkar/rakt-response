-- =============================================================================
-- Rakt Response - 1018 patients contact eligible donors directly
--
-- * Every request needs an account. New requests carry the patient's details
--   (name, age, gender, hospital IP/UHID and ward, reason, requester relation)
--   and a phone the donors can call.
-- * Once a volunteer verifies a request, its creator sees donors who can give
--   right now: same blood group and district, available, not hiding their
--   number, no whole-blood donation in the last 90 days and no SDP/apheresis in
--   the last 14 (both admin settings). Contacts open one donor at a time,
--   within limits, and every opening is recorded and logged.
-- * Donors see every open verified request and can join the ones they are
--   eligible for (same group, enough time since their last donation), within
--   limits. Joining shows them the patient and hospital details and, for
--   requests made after this change, the requester's phone.
-- * "Hide my number": hidden donors are never listed to patients. Volunteers
--   can still reach them as before.
-- * Requests made before this change keep the promise they were made: their
--   requester's phone is never shown to donors, and unlisted ones stay unlisted.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- New columns
-- -----------------------------------------------------------------------------
alter table public.donor_preferences
  add column if not exists hide_number boolean not null default false;

alter table public.blood_requests
  add column if not exists patient_name text
    check (patient_name is null or char_length(patient_name) between 2 and 100),
  add column if not exists patient_age integer
    check (patient_age is null or patient_age between 0 and 120),
  add column if not exists patient_gender text
    check (patient_gender is null or patient_gender in ('male', 'female', 'other')),
  add column if not exists hospital_patient_id text
    check (hospital_patient_id is null or char_length(hospital_patient_id) between 1 and 40),
  add column if not exists ward text
    check (ward is null or char_length(ward) between 1 and 60),
  add column if not exists reason text
    check (reason is null or reason in ('surgery', 'accident', 'thalassemia', 'cancer', 'delivery', 'dengue', 'anaemia', 'other')),
  add column if not exists requester_relation text
    check (requester_relation is null or requester_relation in ('self', 'parent', 'child', 'spouse', 'sibling', 'relative', 'friend', 'other')),
  -- Only requests made with the new form tell the requester that donors who
  -- join will see their phone. Older requests stay false.
  add column if not exists share_contact_with_donors boolean not null default false;

alter table public.consent_events drop constraint if exists consent_events_consent_type_check;
alter table public.consent_events add constraint consent_events_consent_type_check
  check (consent_type in ('directory', 'contact', 'emergency_alerts', 'terms', 'hide_number'));

alter table public.donor_preferences alter column preferred_contact_method set default 'phone';

-- Which donor's contact was opened for which request, by whom. One row per
-- pair; repeated opens of the same donor do not count again.
create table if not exists public.donor_disclosures (
  id bigint generated always as identity primary key,
  request_id uuid not null references public.blood_requests (id) on delete cascade,
  donor_id uuid not null references public.profiles (id) on delete cascade,
  requester_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (request_id, donor_id)
);
create index if not exists donor_disclosures_requester_idx on public.donor_disclosures (requester_id, created_at desc);
create index if not exists donor_disclosures_donor_idx on public.donor_disclosures (donor_id, created_at desc);

alter table public.donor_disclosures enable row level security;
create policy donor_disclosures_select on public.donor_disclosures for select to authenticated
  using (donor_id = (select auth.uid()) or requester_id = (select auth.uid()) or (select public.is_admin()));
revoke all on public.donor_disclosures from anon;
revoke insert, update, delete on public.donor_disclosures from authenticated;

insert into public.platform_settings (key, value, is_public, description) values
  ('apheresis_interval_days', '14', true, 'Days after an SDP/apheresis donation before a donor shows as able to give again. The blood centre decides.'),
  ('eligible_donor_list_size', '30', false, 'Donors shown to a patient for one verified request'),
  ('requester_reveal_hourly_limit', '15', false, 'Donor contacts a patient can open per hour'),
  ('requester_reveal_monthly_donors', '40', false, 'Different donors a patient can open in 30 days'),
  ('requester_open_request_limit', '2', false, 'Open requests a member can have at once'),
  ('donor_join_daily_limit', '3', false, 'Requests a donor can join per day'),
  ('donor_open_join_limit', '3', false, 'Open requests a donor can be joined to at once')
on conflict (key) do nothing;

-- -----------------------------------------------------------------------------
-- Preferences: keep the old switches in step with "Hide my number" and log it
-- -----------------------------------------------------------------------------
create or replace function private.stamp_consents()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  -- Showing the number again means volunteers can find and reach the donor too.
  if tg_op = 'UPDATE' and old.hide_number and not new.hide_number then
    new.directory_visible := true;
    new.contact_consent := true;
  end if;
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
      (new.profile_id, 'emergency_alerts', new.emergency_alerts),
      (new.profile_id, 'hide_number', new.hide_number);
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
  if new.hide_number is distinct from old.hide_number then
    insert into public.consent_events (profile_id, consent_type, granted) values (new.profile_id, 'hide_number', new.hide_number);
  end if;
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Existing donors. "In-app" becomes Call (volunteers could already see their
-- number). Donors who had said no to the directory or to being contacted, or
-- who cannot be reached on their channel, start with their number hidden.
-- -----------------------------------------------------------------------------
update public.donor_preferences set preferred_contact_method = 'phone'
where preferred_contact_method = 'in_app';

update public.donor_preferences pr set hide_number = true
where not pr.hide_number
  and (
    not pr.directory_visible
    or not pr.contact_consent
    or not exists (
      select 1 from public.profile_contacts c
      where c.profile_id = pr.profile_id
        and case when pr.preferred_contact_method = 'email' then c.email is not null
                 else coalesce(c.phone, c.whatsapp) is not null end
    )
  );

-- -----------------------------------------------------------------------------
-- Signup: new donors get "Hide my number" from the form and a real channel.
-- Same as 0700 apart from the contact method and hide_number.
-- -----------------------------------------------------------------------------
create or replace function private.create_member_from_metadata(p_id uuid, p_email text, m jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
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
  v_directory boolean;
  v_contact boolean;
  v_hide boolean;
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
  begin v_method := coalesce((prefs ->> 'preferred_contact_method')::public.contact_method, 'phone'); exception when others then v_method := 'phone'; end;
  if v_method = 'in_app' then v_method := 'phone'; end if;
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
    p_id, v_name, v_display, v_is_donor, v_bg, private.jbool(m, 'age_confirmed', false), v_exp,
    v_approx, case when private.jbool(m, 'terms_accepted', false) then now() end
  );

  insert into public.profile_contacts (profile_id, email, phone, whatsapp)
  values (p_id, p_email, v_phone, v_whatsapp);

  begin
    v_dist := (prefs ->> 'max_distance_km')::integer;
    if v_dist not between 1 and 500 then v_dist := null; end if;
  exception when others then v_dist := null; end;

  v_directory := v_is_donor and private.jbool(prefs, 'directory_visible', false);
  v_contact := v_is_donor and private.jbool(prefs, 'contact_consent', false);
  -- Forms that predate the switch: hidden unless the donor agreed to be found
  -- and contacted. Either way, a donor who can't be reached on their channel is hidden.
  v_hide := private.jbool(prefs, 'hide_number', not (v_directory and v_contact))
    or case when v_method = 'email' then p_email is null else coalesce(v_phone, v_whatsapp) is null end;

  insert into public.donor_preferences (
    profile_id, directory_visible, contact_consent, emergency_alerts, open_to_contact,
    show_donation_summary, preferred_contact_method, max_distance_km, hide_number
  ) values (
    p_id,
    v_directory,
    v_contact,
    v_is_donor and private.jbool(prefs, 'emergency_alerts', false),
    v_is_donor and private.jbool(prefs, 'open_to_contact', false),
    v_is_donor and private.jbool(prefs, 'show_donation_summary', false),
    v_method,
    v_dist,
    v_is_donor and v_hide
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
        p_id,
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
          p_id,
          (d ->> 'donation_type')::public.donation_type,
          (d ->> 'donation_date')::date,
          private.jtext(d, 'centre_name', 150),
          private.jtext(d, 'city', 80),
          private.jtext(d, 'district', 60),
          private.jtext(d, 'event_name', 120),
          'self_reported', 'pending', p_id
        );
      exception when others then
        null; -- skip invalid or duplicate entries
      end;
    end loop;
  end if;

  if private.jbool(m, 'terms_accepted', false) then
    insert into public.consent_events (profile_id, consent_type, granted) values (p_id, 'terms', true);
  end if;

  return;
end;
$$;

-- -----------------------------------------------------------------------------
-- Eligibility
-- -----------------------------------------------------------------------------
-- Today's date in India, which is where donation dates are recorded.
create or replace function private.today_ist()
returns date
language sql
stable
set search_path = ''
as $$
  select (now() at time zone 'Asia/Kolkata')::date;
$$;

-- The first date a donor shows as able to give again, from their latest
-- donations that were not rejected (self-reported ones count). Null when no
-- donation is recorded. Informational only: the blood centre decides.
create or replace function private.donor_eligible_from(p_donor uuid)
returns date
language sql
stable
security definer
set search_path = ''
as $$
  select greatest(
    (select max(r.donation_date) from public.donation_records r
      where r.donor_id = p_donor and r.verification_status <> 'rejected'
        and r.donation_type in ('whole_blood', 'unknown'))
      + private.setting_int('whole_blood_interval_days', 90),
    (select max(r.donation_date) from public.donation_records r
      where r.donor_id = p_donor and r.verification_status <> 'rejected'
        and r.donation_type in ('sdp', 'other_apheresis'))
      + private.setting_int('apheresis_interval_days', 14)
  );
$$;

create or replace function private.donor_can_give_now(p_donor uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(private.donor_eligible_from(p_donor) <= private.today_ist(), true);
$$;

-- The signed-in donor's own next date, by the same rule (null: they can give now).
create or replace function public.my_next_eligible_date()
returns date
language sql
stable
security definer
set search_path = ''
as $$
  select case when private.donor_eligible_from(auth.uid()) > private.today_ist()
    then private.donor_eligible_from(auth.uid()) end
  where auth.uid() is not null;
$$;

-- How a donor is named to a patient: their display name, else their first name.
create or replace function private.donor_label_for_patient(p_id uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(p.display_name, split_part(p.full_name, ' ', 1))
  from public.profiles p where p.id = p_id;
$$;

-- The detail a patient may use to reach a donor on the donor's own channel.
create or replace function private.donor_channel_detail(p_donor uuid)
returns table (channel public.contact_method, phone text, whatsapp text, email text)
language sql
stable
security definer
set search_path = ''
as $$
  select pr.preferred_contact_method,
    case when pr.preferred_contact_method = 'phone' then coalesce(c.phone, c.whatsapp) end,
    case when pr.preferred_contact_method = 'whatsapp' then coalesce(c.whatsapp, c.phone) end,
    case when pr.preferred_contact_method = 'email' then c.email end
  from public.donor_preferences pr
  join public.profile_contacts c on c.profile_id = pr.profile_id
  where pr.profile_id = p_donor;
$$;

-- -----------------------------------------------------------------------------
-- Requests: account required, patient details, limits
-- -----------------------------------------------------------------------------
create or replace function public.create_blood_request(
  p_patient_name text,
  p_patient_age integer,
  p_patient_gender text,
  p_blood_group public.blood_group,
  p_request_type public.request_type,
  p_units integer,
  p_hospital text,
  p_state text,
  p_district text,
  p_city text,
  p_hospital_patient_id text,
  p_ward text,
  p_reason text,
  p_required_by timestamptz,
  p_urgency public.request_urgency,
  p_requester_name text,
  p_requester_relation text,
  p_requester_phone text,
  p_contact_method public.contact_method,
  p_notes text
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
    raise exception 'Please sign in to submit a request' using errcode = '42501';
  end if;
  if (select count(*) from public.blood_requests br
      where br.created_by = v_uid and br.status in ('submitted', 'under_verification', 'verified', 'in_coordination'))
     >= private.setting_int('requester_open_request_limit', 2) then
    raise exception 'You already have open requests. Close one, or contact a volunteer, before adding another.'
      using errcode = 'RR429';
  end if;
  if not private.rate_limit_hit('request:' || v_uid::text, private.setting_int('member_request_daily_limit', 5), 86400) then
    raise exception 'You have submitted several requests today. Please contact a volunteer for further help.'
      using errcode = 'RR429';
  end if;

  if char_length(btrim(coalesce(p_patient_name, ''))) not between 2 and 100
     or p_patient_age is null or p_patient_age not between 0 and 120
     or coalesce(p_patient_gender, '') not in ('male', 'female', 'other')
     or p_units is null or p_units not between 1 and 50
     or coalesce(p_requester_relation, '') not in ('self', 'parent', 'child', 'spouse', 'sibling', 'relative', 'friend', 'other')
     or (p_reason is not null and p_reason not in ('surgery', 'accident', 'thalassemia', 'cancer', 'delivery', 'dengue', 'anaemia', 'other'))
     or coalesce(p_requester_phone, '') !~ '^\+[1-9][0-9]{7,14}$'
     or coalesce(p_contact_method, 'phone') not in ('phone', 'whatsapp') then
    raise exception 'Some of the details are not valid. Please check the form and try again.' using errcode = '22023';
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
    created_by, requester_name, requester_phone, requester_contact_method, requester_relation,
    patient_name, patient_age, patient_gender, hospital_patient_id, ward, reason,
    blood_group, request_type, units_needed, hospital_name, state, district, city,
    required_by, urgency, notes, public_listing_consent, share_contact_with_donors, status, possible_duplicate_of
  ) values (
    v_uid, btrim(p_requester_name), btrim(p_requester_phone), coalesce(p_contact_method, 'phone'), p_requester_relation,
    btrim(p_patient_name), p_patient_age, p_patient_gender, nullif(btrim(p_hospital_patient_id), ''), nullif(btrim(p_ward), ''), p_reason,
    p_blood_group, coalesce(p_request_type, 'whole_blood'), p_units, btrim(p_hospital), nullif(btrim(p_state), ''),
    btrim(p_district), btrim(p_city), p_required_by, coalesce(p_urgency, 'urgent'), nullif(btrim(p_notes), ''),
    true, true, 'submitted', v_dup
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
    jsonb_build_object('anonymous', false, 'possible_duplicate', v_dup is not null, 'request_type', v_row.request_type));

  return query select v_row.id, v_row.reference_code, v_dup;
end;
$$;

-- The old entry point stays for one release (old pages may still call it
-- while a deploy rolls out) but no longer accepts requests without an account.
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
    raise exception 'Please sign in to submit a request' using errcode = '42501';
  end if;
  if not private.rate_limit_hit('request:' || v_uid::text, private.setting_int('member_request_daily_limit', 5), 86400) then
    raise exception 'You have submitted several requests today. Please contact a volunteer for further help.'
      using errcode = 'RR429';
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
    required_by, urgency, notes, public_listing_consent, status, possible_duplicate_of
  ) values (
    v_uid, btrim(p_requester_name), nullif(btrim(p_requester_phone), ''), nullif(lower(btrim(p_requester_email)), ''),
    coalesce(p_contact_method, 'phone'), p_blood_group, coalesce(p_request_type, 'whole_blood'), p_units,
    btrim(p_hospital), nullif(btrim(p_state), ''), btrim(p_district), btrim(p_city),
    p_required_by, coalesce(p_urgency, 'urgent'), nullif(btrim(p_notes), ''), coalesce(p_public_listing, false),
    'submitted', v_dup
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
    jsonb_build_object('anonymous', false, 'possible_duplicate', v_dup is not null, 'request_type', v_row.request_type));

  return query select v_row.id, v_row.reference_code, v_dup;
end;
$$;

-- Requesters can't move a request to another place, date or patient after
-- submitting it: the donor list and the verification depend on them.
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
  if not public.is_staff()
     and (new.blood_group is distinct from old.blood_group
          or new.request_type is distinct from old.request_type
          or new.hospital_name is distinct from old.hospital_name
          or new.state is distinct from old.state
          or new.district is distinct from old.district
          or new.city is distinct from old.city
          or new.required_by is distinct from old.required_by
          or new.units_needed is distinct from old.units_needed
          or new.patient_name is distinct from old.patient_name
          or new.patient_age is distinct from old.patient_age
          or new.patient_gender is distinct from old.patient_gender
          or new.hospital_patient_id is distinct from old.hospital_patient_id
          or new.public_listing_consent is distinct from old.public_listing_consent
          or new.share_contact_with_donors is distinct from old.share_contact_with_donors) then
    raise exception 'Only a volunteer can change these details. Please contact a volunteer.'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Patient side
-- -----------------------------------------------------------------------------
-- Donors for the caller's own verified request: those who joined first, then
-- donors who can give right now nearby. Contact details appear only for donors
-- whose contact the caller already opened.
create or replace function public.list_eligible_donors_for_my_request(p_request uuid)
returns table (
  donor_id uuid,
  label text,
  blood_group public.blood_group,
  city text,
  locality text,
  channel public.contact_method,
  joined boolean,
  hidden boolean,
  contact_opened boolean,
  phone text,
  whatsapp text,
  email text
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
  if auth.uid() is null then
    raise exception 'Sign in required' using errcode = '42501';
  end if;
  select * into v_req from public.blood_requests where id = p_request;
  if not found or v_req.created_by is distinct from auth.uid() then
    raise exception 'This request is not yours' using errcode = '42501';
  end if;
  if v_req.status not in ('verified', 'in_coordination') then
    return;
  end if;

  return query
  with joined as (
    select rr.donor_id
    from public.request_responses rr
    join public.profiles p on p.id = rr.donor_id and p.is_active and p.deletion_requested_at is null
    where rr.request_id = p_request and rr.response = 'interested'
  ),
  nearby as (
    select p.id as donor_id
    from public.profiles p
    join public.donor_preferences pr on pr.profile_id = p.id
    join public.donor_locations l on l.profile_id = p.id
    join auth.users u on u.id = p.id
    where p.is_donor and p.is_active and p.deletion_requested_at is null and u.email_confirmed_at is not null
      and p.id is distinct from v_req.created_by
      and p.blood_group = v_req.blood_group
      and l.district_norm = v_req.district_norm
      and pr.open_to_contact and not pr.hide_number
      and private.donor_can_give_now(p.id)
      and exists (select 1 from private.donor_channel_detail(p.id) d
                  where coalesce(d.phone, d.whatsapp, d.email) is not null)
      and not exists (select 1 from public.request_responses rr
                      where rr.request_id = p_request and rr.donor_id = p.id and rr.response in ('unavailable', 'declined'))
      and not exists (select 1 from joined j where j.donor_id = p.id)
    order by p.last_active_at desc nulls last
    limit private.setting_int('eligible_donor_list_size', 30)
  ),
  listed as (
    select j.donor_id, true as joined from joined j
    union all
    select n.donor_id, false from nearby n
  )
  select ls.donor_id,
    private.donor_label_for_patient(ls.donor_id),
    p.blood_group,
    l.city,
    l.locality,
    pr.preferred_contact_method,
    ls.joined,
    pr.hide_number,
    ds.id is not null,
    case when ds.id is not null and not pr.hide_number then d.phone end,
    case when ds.id is not null and not pr.hide_number then d.whatsapp end,
    case when ds.id is not null and not pr.hide_number then d.email end
  from listed ls
  join public.profiles p on p.id = ls.donor_id
  join public.donor_preferences pr on pr.profile_id = ls.donor_id
  left join public.donor_locations l on l.profile_id = ls.donor_id
  left join public.donor_disclosures ds on ds.request_id = p_request and ds.donor_id = ls.donor_id
  left join lateral private.donor_channel_detail(ls.donor_id) d on true
  order by ls.joined desc, p.last_active_at desc nulls last;
end;
$$;

-- Opens one donor's contact for the caller's verified request. Counts against
-- the hourly and 30-day limits the first time only, and is recorded and logged.
create or replace function public.reveal_donor_contact_to_requester(p_request uuid, p_donor uuid)
returns table (channel public.contact_method, phone text, whatsapp text, email text)
language plpgsql
volatile
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Sign in required' using errcode = '42501';
  end if;
  if not exists (
    select 1 from public.list_eligible_donors_for_my_request(p_request) e
    where e.donor_id = p_donor and not e.hidden
  ) then
    raise exception 'This donor is not available for your request' using errcode = 'P0002';
  end if;

  if not exists (select 1 from public.donor_disclosures ds where ds.request_id = p_request and ds.donor_id = p_donor) then
    if (select count(distinct ds.donor_id) from public.donor_disclosures ds
        where ds.requester_id = v_uid and ds.created_at > now() - interval '30 days')
       >= private.setting_int('requester_reveal_monthly_donors', 40) then
      raise exception 'You have opened many donor contacts this month. Please contact a volunteer for more help.'
        using errcode = 'RR429';
    end if;
    if not private.rate_limit_hit('requester_reveal:' || v_uid::text, private.setting_int('requester_reveal_hourly_limit', 15), 3600) then
      raise exception 'You have opened many donor contacts in the last hour. Please try again later.'
        using errcode = 'RR429';
    end if;
    insert into public.donor_disclosures (request_id, donor_id, requester_id) values (p_request, p_donor, v_uid);
    perform private.write_audit('donor_contact.revealed_to_requester', 'profiles', p_donor::text,
      jsonb_build_object('request_id', p_request));
  end if;

  return query select d.channel, d.phone, d.whatsapp, d.email from private.donor_channel_detail(p_donor) d;
end;
$$;

-- -----------------------------------------------------------------------------
-- Donor side
-- -----------------------------------------------------------------------------
-- Every open verified request (not the caller's own), the caller's blood group
-- first, with whether they can join it now and, if not, why. Reason codes:
-- 'joined', 'not_donor', 'other_group', 'too_soon' (see eligible_from).
create or replace function public.list_open_requests_for_donor()
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
  matches_group boolean,
  can_join boolean,
  reason text,
  eligible_from date
)
language sql
stable
security definer
set search_path = ''
as $$
  with me as (
    select p.id, p.blood_group, (p.is_donor and p.is_active and p.deletion_requested_at is null) as donor,
      private.donor_eligible_from(p.id) as eligible_from
    from public.profiles p
    where p.id = auth.uid()
  )
  select br.id, br.reference_code, br.blood_group, br.request_type, br.units_needed, br.hospital_name,
    br.city, br.district, br.required_by, br.urgency, br.status, br.verified_at,
    rr.response,
    br.blood_group = me.blood_group,
    me.donor and br.blood_group = me.blood_group
      and coalesce(me.eligible_from <= private.today_ist(), true)
      and rr.response is distinct from 'interested',
    case
      when rr.response = 'interested' then 'joined'
      when not me.donor then 'not_donor'
      when br.blood_group is distinct from me.blood_group then 'other_group'
      when me.eligible_from > private.today_ist() then 'too_soon'
    end,
    case when me.eligible_from > private.today_ist() then me.eligible_from end
  from public.blood_requests br
  cross join me
  left join public.request_responses rr on rr.request_id = br.id and rr.donor_id = me.id
  where br.status in ('verified', 'in_coordination')
    and br.required_by > now() - interval '6 hours'
    and br.created_by is distinct from me.id
  order by (br.blood_group = me.blood_group) desc,
    case br.urgency when 'critical' then 0 when 'urgent' then 1 else 2 end,
    br.required_by
  limit 100;
$$;

-- A donor's answer to a request. Joining ("interested") needs the same blood
-- group and enough time since the last donation, within daily and open limits;
-- the patient and assigned volunteers are told.
create or replace function public.respond_to_blood_request(p_request uuid, p_response public.response_status)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_req public.blood_requests;
  v_me public.profiles;
  v_previous public.response_status;
begin
  if auth.uid() is null then
    raise exception 'Sign in required' using errcode = '42501';
  end if;
  if p_response = 'no_response' then
    raise exception 'Choose a response' using errcode = '22023';
  end if;
  select * into v_me from public.profiles where id = auth.uid() and is_donor and is_active;
  if not found then
    raise exception 'Complete your donor profile to respond to requests' using errcode = '42501';
  end if;
  select * into v_req from public.blood_requests where id = p_request;
  if not found or v_req.status not in ('verified', 'in_coordination') then
    raise exception 'This request is not open for responses' using errcode = '22023';
  end if;
  if v_req.created_by = auth.uid() then
    raise exception 'You cannot join your own request' using errcode = '22023';
  end if;
  select rr.response into v_previous from public.request_responses rr
  where rr.request_id = p_request and rr.donor_id = auth.uid();

  if p_response = 'interested' and v_previous is distinct from 'interested' then
    if v_me.blood_group is distinct from v_req.blood_group then
      raise exception 'This request needs a different blood group' using errcode = '22023';
    end if;
    if not private.donor_can_give_now(auth.uid()) then
      raise exception 'Your last donation was too recent to join this request' using errcode = '22023';
    end if;
    if (select count(*) from public.request_responses rr
        join public.blood_requests b on b.id = rr.request_id
        where rr.donor_id = auth.uid() and rr.response = 'interested'
          and b.status in ('verified', 'in_coordination'))
       >= private.setting_int('donor_open_join_limit', 3) then
      raise exception 'You have joined several open requests. Finish or leave one before joining another.'
        using errcode = 'RR429';
    end if;
    if not private.rate_limit_hit('donor_join:' || auth.uid()::text, private.setting_int('donor_join_daily_limit', 3), 86400) then
      raise exception 'You have joined several requests today. Please try again tomorrow.'
        using errcode = 'RR429';
    end if;
  end if;

  insert into public.request_responses as rr (request_id, donor_id, response, responded_at)
  values (p_request, auth.uid(), p_response, now())
  on conflict (request_id, donor_id) do update set response = excluded.response, responded_at = now();
  insert into public.request_events (request_id, actor_id, event_type, note)
  values (p_request, auth.uid(), 'donor_responded', 'Donor response: ' || p_response::text);

  if p_response = 'interested' and v_previous is distinct from 'interested' then
    perform private.write_audit('blood_request.donor_joined', 'blood_requests', p_request::text,
      jsonb_build_object('donor_id', auth.uid()));
    perform private.notify(v_req.created_by, 'request_update',
      'A donor is ready to give for ' || v_req.reference_code,
      'Open your request to see them. The blood centre will check their eligibility.',
      '/requests/' || p_request::text);
    insert into public.notifications (user_id, kind, title, body, link)
    select va.volunteer_id, 'contact_response', 'A donor is interested in ' || v_req.reference_code,
      'Check the request page to coordinate. Interest is not a confirmed donation.',
      '/volunteer/requests/' || p_request::text
    from public.volunteer_assignments va where va.request_id = p_request and va.status = 'active';
  end if;
end;
$$;

-- Alerts go only to donors who can give now. Otherwise as in 0200.
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
      and private.donor_can_give_now(p.id)
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

-- As in 0200, except the requester's notification opens their request page,
-- where the donor list appears once it is verified.
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
      when 'verified' then 'A volunteer verified your request. Open it to see donors who can give now, and keep in touch with the hospital blood bank.'
      when 'in_coordination' then 'Volunteers are coordinating with potential donors.'
      when 'rejected' then 'We could not verify this request. ' || coalesce(v_reason, '')
      else coalesce(v_reason, null) end,
    '/requests/' || p_request::text);

  perform private.write_audit('blood_request.status_changed', 'blood_requests', p_request::text,
    jsonb_build_object('from', v_old.status, 'to', p_status, 'donors_alerted', v_alerted));
  return p_status;
end;
$$;

-- What a donor who joined an open request needs at the blood bank: the patient
-- and hospital details, and the requester's phone for requests made after
-- this change.
create or replace function public.get_request_details_for_donor(p_request uuid)
returns table (
  reference_code text,
  blood_group public.blood_group,
  request_type public.request_type,
  units_needed integer,
  patient_name text,
  patient_age integer,
  hospital_name text,
  hospital_patient_id text,
  ward text,
  city text,
  district text,
  required_by timestamptz,
  requester_name text,
  requester_relation text,
  requester_phone text,
  requester_contact_method public.contact_method
)
language sql
stable
security definer
set search_path = ''
as $$
  select br.reference_code, br.blood_group, br.request_type, br.units_needed,
    br.patient_name, br.patient_age, br.hospital_name, br.hospital_patient_id, br.ward,
    br.city, br.district, br.required_by,
    br.requester_name, br.requester_relation,
    case when br.share_contact_with_donors then br.requester_phone end,
    case when br.share_contact_with_donors then br.requester_contact_method end
  from public.blood_requests br
  join public.request_responses rr on rr.request_id = br.id and rr.donor_id = auth.uid() and rr.response = 'interested'
  where br.id = p_request
    and br.status in ('verified', 'in_coordination');
$$;

-- -----------------------------------------------------------------------------
-- Retention: also clear patient details from long-closed requests.
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
    submitter_key_hash = null,
    patient_name = null,
    patient_age = null,
    patient_gender = null,
    hospital_patient_id = null,
    ward = null
  where status in ('fulfilled', 'cancelled', 'expired', 'rejected')
    and closed_at < now() - make_interval(days => p_days)
    and (requester_phone is not null or requester_email is not null or notes is not null or submitter_key_hash is not null
         or patient_name is not null or patient_age is not null or hospital_patient_id is not null or ward is not null);
  get diagnostics v_count = row_count;
  perform private.write_audit('retention.request_contacts_purged', 'blood_requests', null,
    jsonb_build_object('rows', v_count, 'older_than_days', p_days));
  return v_count;
end;
$$;

-- -----------------------------------------------------------------------------
-- Function privileges: signed-in members only.
-- -----------------------------------------------------------------------------
revoke execute on all functions in schema private from public;
revoke execute on function public.create_blood_request(text, integer, text, public.blood_group, public.request_type, integer, text, text, text, text, text, text, text, timestamptz, public.request_urgency, text, text, text, public.contact_method, text) from public, anon;
revoke execute on function public.list_eligible_donors_for_my_request(uuid) from public, anon;
revoke execute on function public.reveal_donor_contact_to_requester(uuid, uuid) from public, anon;
revoke execute on function public.list_open_requests_for_donor() from public, anon;
revoke execute on function public.my_next_eligible_date() from public, anon;
grant execute on function public.my_next_eligible_date() to authenticated;
revoke execute on function public.get_request_details_for_donor(uuid) from public, anon;
revoke execute on function public.respond_to_blood_request(uuid, public.response_status) from public, anon;
revoke execute on function public.submit_blood_request(text, text, text, public.contact_method, public.blood_group, public.request_type, integer, text, text, text, text, timestamptz, public.request_urgency, text, boolean, text) from public, anon;
revoke execute on function public.purge_closed_request_contacts(integer) from public, anon;
grant execute on function public.create_blood_request(text, integer, text, public.blood_group, public.request_type, integer, text, text, text, text, text, text, text, timestamptz, public.request_urgency, text, text, text, public.contact_method, text) to authenticated;
grant execute on function public.list_eligible_donors_for_my_request(uuid) to authenticated;
grant execute on function public.reveal_donor_contact_to_requester(uuid, uuid) to authenticated;
grant execute on function public.list_open_requests_for_donor() to authenticated;
grant execute on function public.get_request_details_for_donor(uuid) to authenticated;
grant execute on function public.respond_to_blood_request(uuid, public.response_status) to authenticated;
grant execute on function public.submit_blood_request(text, text, text, public.contact_method, public.blood_group, public.request_type, integer, text, text, text, text, timestamptz, public.request_urgency, text, boolean, text) to authenticated;
grant execute on function public.purge_closed_request_contacts(integer) to authenticated;
