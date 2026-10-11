-- =============================================================================
-- Rakt Response - 0900 donor name privacy, admin-only profile photos, data checks
--
-- * Volunteers see a donor's display name. Without one they see a neutral code
--   ("Donor #3F2A") unless the donor chooses to show their first name. Nothing
--   reveals a full name to volunteers; administrators still see full names.
-- * Profile photos: only the donor and administrators can read them.
-- * admin_data_checks(): read-only consistency report for administrators.
-- =============================================================================

alter table public.donor_preferences
  add column if not exists show_first_name boolean not null default false;

-- How a donor is labelled to the person asking. Staff accounts keep their
-- usual name so volunteers recognise each other in notes and assignments.
create or replace function private.donor_label(p_id uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when public.is_admin() then p.full_name
    when p.display_name is not null then p.display_name
    when exists (select 1 from public.staff_roles sr where sr.user_id = p.id and sr.is_active)
      or coalesce(pr.show_first_name, false) then split_part(p.full_name, ' ', 1)
    else 'Donor #' || upper(left(replace(p.id::text, '-', ''), 4))
  end
  from public.profiles p
  left join public.donor_preferences pr on pr.profile_id = p.id
  where p.id = p_id;
$$;

-- Copied from 0200; every volunteer-facing name now goes through donor_label().
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
  select p.id, p.blood_group, private.donor_label(p.id),
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
      or private.donor_label(p.id) ilike '%' || private.like_escape(btrim(p_query)) || '%'
      or l.locality ilike '%' || private.like_escape(btrim(p_query)) || '%'
      or l.city ilike '%' || private.like_escape(btrim(p_query)) || '%'
      or l.pincode = btrim(p_query)
    )
    and (p_donation_type is null or exists (
      select 1 from public.donation_records r
      where r.donor_id = p.id and r.donation_type = p_donation_type and r.verification_status <> 'rejected'));
$$;

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
  select private.donor_label(p.id),
    c.phone, coalesce(c.whatsapp, c.phone),
    case when v_pref.preferred_contact_method = 'email' then c.email end,
    v_pref.preferred_contact_method
  from public.profiles p
  join public.profile_contacts c on c.profile_id = p.id
  where p.id = p_donor;
end;
$$;

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
  select p.id, private.donor_label(p.id), p.blood_group
  from public.profiles p
  where p.id = any(p_ids[1:200]);
end;
$$;

-- Profile photos: owner or administrator only (previously any staff member).
do $migration$
begin
  if to_regclass('storage.objects') is null then
    raise notice 'storage schema not present; skipping';
    return;
  end if;
  execute 'drop policy if exists "profile photos: owner or staff read" on storage.objects';
  execute 'drop policy if exists "profile photos: owner or admin read" on storage.objects';
  execute $p$
    create policy "profile photos: owner or admin read" on storage.objects for select to authenticated
    using (bucket_id = 'profile-photos' and ((storage.foldername(name))[1] = (select auth.uid())::text or (select public.is_admin())))
  $p$;
end;
$migration$;

-- -----------------------------------------------------------------------------
-- Data checks: entries an administrator should look at. Flags, not verdicts.
-- -----------------------------------------------------------------------------
create or replace function public.admin_data_checks()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_interval integer := private.setting_int('whole_blood_interval_days', 90);
  v_checks jsonb;
begin
  if not public.is_admin() then
    raise exception 'Only administrators can run data checks' using errcode = '42501';
  end if;

  with whole_blood as (
    select r.donor_id, r.donation_date,
      lag(r.donation_date) over (partition by r.donor_id order by r.donation_date) as prev_date
    from public.donation_records r
    where r.donation_type = 'whole_blood' and r.verification_status <> 'rejected'
  ), sdp as (
    select r.donor_id, r.donation_date,
      lag(r.donation_date) over (partition by r.donor_id order by r.donation_date) as prev_date
    from public.donation_records r
    where r.donation_type = 'sdp' and r.verification_status <> 'rejected'
  ), flags as (
    select 'whole_blood_too_close' as key, w.donor_id as profile_id,
      format('%s and %s (%s days apart)', w.prev_date, w.donation_date, w.donation_date - w.prev_date) as detail
    from whole_blood w
    where w.prev_date is not null and w.donation_date - w.prev_date < v_interval
    union all
    select 'sdp_too_close', s.donor_id, format('%s and %s', s.prev_date, s.donation_date)
    from sdp s
    where s.prev_date is not null and s.donation_date - s.prev_date < 2
    union all
    select 'many_pending', r.donor_id, format('%s records waiting', count(*))
    from public.donation_records r
    where r.verification_status = 'pending'
    group by r.donor_id
    having count(*) >= 5
    union all
    select 'stale_pending', r.donor_id, format('%s record(s), oldest logged %s', count(*), min(r.created_at)::date)
    from public.donation_records r
    where r.verification_status = 'pending' and r.created_at < now() - interval '30 days'
    group by r.donor_id
    union all
    select 'experience_mismatch', p.id, format('Said "first time" but logged %s earlier donation(s)', count(r.id))
    from public.profiles p
    join public.donation_records r on r.donor_id = p.id and r.verification_status <> 'rejected'
      and r.donation_date < p.created_at::date
    where p.donation_experience = 'first_time'
    group by p.id
    union all
    select 'shared_phone', c.profile_id, format('Same mobile number as %s other account(s)', d.n - 1)
    from public.profile_contacts c
    join (
      select c2.phone, count(*) as n
      from public.profile_contacts c2
      join public.profiles p2 on p2.id = c2.profile_id and p2.is_active
      where c2.phone is not null
      group by c2.phone
      having count(*) > 1
    ) d on d.phone = c.phone
    join public.profiles p on p.id = c.profile_id and p.is_active
    union all
    select 'group_to_confirm', p.id, format('%s, %s verified donation(s)', p.blood_group, count(r.id))
    from public.profiles p
    join public.donation_records r on r.donor_id = p.id and r.verification_status = 'verified'
    where p.is_active and p.blood_group is not null and not p.blood_group_verified
    group by p.id, p.blood_group
    union all
    select 'blood_group_correction', p.id, format('%s to %s', p.blood_group, p.requested_blood_group)
    from public.profiles p
    where p.requested_blood_group is not null and p.is_active
    union all
    select 'missing_area', p.id, 'No state, district or city'
    from public.profiles p
    where p.is_donor and p.is_active
      and not exists (select 1 from public.donor_locations l where l.profile_id = p.id)
    union all
    select 'deletion_overdue', p.id, format('Requested %s', p.deletion_requested_at::date)
    from public.profiles p
    where p.is_active and p.deletion_requested_at < now() - interval '30 days'
  ), numbered as (
    select f.*,
      row_number() over (partition by f.key order by f.profile_id) as rn,
      count(*) over (partition by f.key) as total
    from flags f
  )
  select coalesce(jsonb_agg(jsonb_build_object('key', g.key, 'total', g.total, 'items', g.items)), '[]'::jsonb)
  into v_checks
  from (
    select n.key, max(n.total) as total,
      jsonb_agg(jsonb_build_object('profile_id', n.profile_id, 'name', p.full_name, 'detail', n.detail) order by p.full_name) as items
    from numbered n
    join public.profiles p on p.id = n.profile_id
    where n.rn <= 50
    group by n.key
  ) g;

  return jsonb_build_object('generated_at', now(), 'whole_blood_interval_days', v_interval, 'checks', v_checks);
end;
$$;

revoke execute on all functions in schema private from public;
revoke execute on function public.admin_data_checks() from public, anon;
