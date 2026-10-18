-- Follow up after donation.
--
-- A donor who joined a request tells us they donated with one tap: the donation goes into
-- their record as self-reported (pending), which also moves the date they can give again.
-- Whenever a donor's outcome becomes "donated" (their own report, or a Rakt Mitra recording
-- it), the Rakt Mitras on the request get a follow-up: check on the donor and thank them,
-- then mark it done. For a few days they may open that donor's contact for this, even after
-- the request has closed; every opening is logged as before.
--
-- The site calls volunteers "Rakt Mitra"; the database keeps the word "volunteer".

-- -----------------------------------------------------------------------------
-- Columns and settings
-- -----------------------------------------------------------------------------
alter table public.request_responses
  add column donated_on date,
  add column donation_record_id uuid references public.donation_records (id) on delete set null,
  add column follow_up_due_at timestamptz,
  add column followed_up_at timestamptz,
  add column followed_up_by uuid references auth.users (id) on delete set null;

create index request_responses_follow_up_idx on public.request_responses (follow_up_due_at)
  where outcome = 'donated' and followed_up_at is null;

insert into public.platform_settings (key, value, is_public, description) values
  ('donation_report_days', '14', false, 'Days after a request closes in which a donor can still tell us they donated'),
  ('donation_follow_up_days', '14', false, 'Days a Rakt Mitra can open a donor''s contact to follow up after their donation')
on conflict (key) do nothing;

-- -----------------------------------------------------------------------------
-- Donation dates are checked against the India date, not the server's (UTC) date,
-- so a donation made this evening can be recorded after midnight. (Inline, not
-- private.today_ist(): this trigger runs as the signed-in member.) Otherwise copied
-- from 20261016000100.
-- -----------------------------------------------------------------------------
create or replace function private.guard_donation_record()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.donation_date > (now() at time zone 'Asia/Kolkata')::date then
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
  -- verify_donation_record(), never directly.
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

  -- A donor correcting their own checked record sends it back for checking.
  -- (Staff correcting someone else's record keep its status; that is audited.)
  if old.verification_status <> 'pending'
     and old.donor_id = auth.uid()
     and not public.is_admin()
     and (new.donation_type, new.donation_date, new.centre_name, new.city, new.district, new.event_name)
         is distinct from (old.donation_type, old.donation_date, old.centre_name, old.city, old.district, old.event_name) then
    new.verification_status := 'pending';
    new.record_source := 'self_reported';
    new.verified_by := null;
    new.verified_at := null;
    new.review_reason := null;
    new.provenance := null;
  end if;
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Helpers
-- -----------------------------------------------------------------------------

-- A donor can tell us about a donation from when the request was made until a few
-- days after it was needed or closed.
create or replace function private.donation_report_open(p_req public.blood_requests)
returns boolean
language sql
stable
set search_path = ''
as $$
  select p_req.status <> 'rejected'
    and private.today_ist() <= (greatest(p_req.required_by, coalesce(p_req.closed_at, p_req.required_by)) at time zone 'Asia/Kolkata')::date
      + private.setting_int('donation_report_days', 14);
$$;

-- Tells the Rakt Mitras coordinating a request that a donor gave blood; if nobody is
-- coordinating it, those who verify requests.
create or replace function private.notify_donation_follow_up(p_request uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_title text;
  v_body constant text := 'A donor gave blood for this request. Check on them and thank them, then mark it done.';
  v_count integer;
begin
  select left('Follow up after donation: ' || reference_code, 140) into v_title from public.blood_requests where id = p_request;
  insert into public.notifications (user_id, kind, title, body, link)
  select distinct va.volunteer_id, 'follow_up', v_title, v_body, '/volunteer/coordination'
  from public.volunteer_assignments va
  join public.staff_roles sr on sr.user_id = va.volunteer_id and sr.is_active
  where va.request_id = p_request and va.status = 'active';
  get diagnostics v_count = row_count;
  if v_count = 0 then
    insert into public.notifications (user_id, kind, title, body, link)
    select sr.user_id, 'follow_up', v_title, v_body, '/volunteer/coordination'
    from public.staff_roles sr
    where sr.is_active and (sr.role = 'admin' or sr.can_verify_requests)
    limit 50;
  end if;
end;
$$;

-- When a donor's outcome becomes "donated", a follow-up is due. Correcting the outcome
-- away from "donated" clears it. (Fields only: an upsert runs the BEFORE INSERT trigger
-- even when it ends up updating, so messages are sent from the AFTER trigger below.)
create or replace function private.on_donation_outcome()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.outcome = 'donated' and (tg_op = 'INSERT' or old.outcome is distinct from 'donated') then
    new.donated_on := coalesce(new.donated_on, (now() at time zone 'Asia/Kolkata')::date);
    new.follow_up_due_at := now();
    new.followed_up_at := null;
    new.followed_up_by := null;
  elsif tg_op = 'UPDATE' and old.outcome = 'donated' and new.outcome is distinct from 'donated' then
    new.donated_on := null;
    new.follow_up_due_at := null;
  end if;
  return new;
end;
$$;

-- ...then the Rakt Mitras are told and the donor is thanked (and asked to add the
-- donation to their record if a Rakt Mitra recorded it).
create or replace function private.notify_donation_outcome()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_code text;
begin
  if new.outcome = 'donated' and (tg_op = 'INSERT' or old.outcome is distinct from 'donated') then
    select reference_code into v_code from public.blood_requests where id = new.request_id;
    perform private.notify_donation_follow_up(new.request_id);
    insert into public.notifications (user_id, kind, title, body, link)
    values (new.donor_id, 'follow_up', 'Thank you for donating',
      case when new.donation_record_id is null
        then 'Thank you for giving blood for ' || v_code || '. Add it to your donation record so we know when you can give again.'
        else 'Thank you for giving blood for ' || v_code || '. It is in your donation record. A Rakt Mitra may check in with you.'
      end,
      case when new.response = 'interested' then '/requests/' || new.request_id::text else '/donations/new' end);
  end if;
  return null;
end;
$$;

create trigger request_responses_donation_outcome
  before insert or update of outcome on public.request_responses
  for each row execute function private.on_donation_outcome();
create trigger request_responses_donation_notify
  after insert or update of outcome on public.request_responses
  for each row execute function private.notify_donation_outcome();

-- -----------------------------------------------------------------------------
-- Donors: "I donated" / "I didn't donate" for a request they joined
-- -----------------------------------------------------------------------------
create or replace function public.report_my_donation(p_request uuid, p_donated boolean, p_date date default null)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_req public.blood_requests;
  v_rr public.request_responses;
  v_date date;
  v_type public.donation_type;
  v_record uuid;
begin
  if v_uid is null then
    raise exception 'Sign in required' using errcode = '42501';
  end if;
  select * into v_rr from public.request_responses where request_id = p_request and donor_id = v_uid for update;
  if not found or v_rr.response is distinct from 'interested' then
    raise exception 'You can only tell us about requests you joined' using errcode = '42501';
  end if;
  select * into v_req from public.blood_requests where id = p_request;
  if not private.donation_report_open(v_req) then
    raise exception 'This request has closed. Add the donation from your donation history instead.' using errcode = '22023';
  end if;
  -- A Rakt Mitra may have recorded the donation already: the donor can still add it to
  -- their record (the follow-up has started, so nothing else changes).
  if v_rr.outcome = 'donated' and (v_rr.donation_record_id is not null or not p_donated) then
    raise exception 'You already told us you donated for this request' using errcode = '22023';
  end if;

  if not p_donated then
    update public.request_responses set outcome = 'did_not_donate' where id = v_rr.id;
    insert into public.request_events (request_id, actor_id, event_type, note)
    values (p_request, v_uid, 'donor_responded', 'Donor said they did not donate');
    return null;
  end if;

  v_date := coalesce(p_date, private.today_ist());
  if v_date > private.today_ist() then
    raise exception 'Donation date cannot be in the future' using errcode = '22023';
  end if;
  if v_date < (v_req.created_at at time zone 'Asia/Kolkata')::date then
    raise exception 'That date is before this request was made' using errcode = '22023';
  end if;
  v_type := case v_req.request_type
    when 'sdp' then 'sdp'::public.donation_type
    when 'other_apheresis' then 'other_apheresis'::public.donation_type
    else 'whole_blood'::public.donation_type
  end;

  -- One record per donor, type and day: reuse it if the donor already added this donation.
  select id into v_record from public.donation_records
  where donor_id = v_uid and donation_type = v_type and donation_date = v_date and verification_status <> 'rejected';
  if v_record is null then
    insert into public.donation_records (donor_id, donation_type, donation_date, centre_name, city, district,
      record_source, verification_status, created_by)
    values (v_uid, v_type, v_date, left(v_req.hospital_name, 150), left(v_req.city, 80), left(v_req.district, 60),
      'self_reported', 'pending', v_uid)
    returning id into v_record;
  end if;

  update public.request_responses
  set outcome = 'donated', donated_on = v_date, donation_record_id = v_record
  where id = v_rr.id;
  insert into public.request_events (request_id, actor_id, event_type, note)
  values (p_request, v_uid, 'outcome_recorded', 'Donor reported donating');
  return v_record;
end;
$$;

-- The caller's joined requests that are still open for a donation report, and those
-- already reported. can_report: they can still say "I donated" (or, when a Rakt Mitra
-- recorded the donation, add it to their record). ask_now: the request's time has
-- passed, so ask "did you donate?".
create or replace function public.list_my_donation_checks()
returns table (
  request_id uuid,
  reference_code text,
  blood_group public.blood_group,
  request_type public.request_type,
  hospital_name text,
  city text,
  district text,
  required_by timestamptz,
  status public.request_status,
  outcome public.coordination_outcome,
  donated_on date,
  donation_record_id uuid,
  can_report boolean,
  ask_now boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  select br.id, br.reference_code, br.blood_group, br.request_type, br.hospital_name, br.city, br.district,
    br.required_by, br.status, rr.outcome, rr.donated_on, rr.donation_record_id,
    (rr.outcome = 'pending' or (rr.outcome = 'donated' and rr.donation_record_id is null)) and private.donation_report_open(br),
    rr.outcome = 'pending' and private.donation_report_open(br)
      and (br.status in ('fulfilled', 'expired') or (br.status in ('verified', 'in_coordination') and br.required_by < now()))
  from public.request_responses rr
  join public.blood_requests br on br.id = rr.request_id
  where rr.donor_id = auth.uid()
    and rr.response = 'interested'
    and br.status <> 'rejected'
    and (rr.outcome = 'donated' or (rr.outcome = 'pending' and private.donation_report_open(br)))
  order by br.required_by desc
  limit 20;
$$;

-- -----------------------------------------------------------------------------
-- Rakt Mitras: mark a follow-up done, with an optional note for the team
-- -----------------------------------------------------------------------------
create or replace function public.complete_donation_follow_up(p_request uuid, p_donor uuid, p_note text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_note text := nullif(btrim(p_note), '');
  v_label text;
begin
  if not public.is_staff() then
    raise exception 'Only authorised volunteers can record follow-ups' using errcode = '42501';
  end if;
  if v_note is not null and char_length(v_note) > 500 then
    raise exception 'Please keep the note under 500 characters' using errcode = '22023';
  end if;
  update public.request_responses
  set followed_up_at = now(), followed_up_by = auth.uid()
  where request_id = p_request and donor_id = p_donor and outcome = 'donated' and followed_up_at is null;
  if not found then
    raise exception 'There is no follow-up waiting for this donor' using errcode = 'P0002';
  end if;
  insert into public.request_events (request_id, actor_id, event_type, note)
  values (p_request, auth.uid(), 'outcome_recorded', 'Followed up with a donor after their donation');
  if v_note is not null then
    -- The name Rakt Mitras see (as private.donor_label() gives them), never the full name:
    -- the whole team reads these notes.
    select case
        when p.display_name is not null then p.display_name
        when coalesce(pr.show_first_name, false) then split_part(p.full_name, ' ', 1)
        else 'Donor #' || upper(left(replace(p.id::text, '-', ''), 4))
      end into v_label
    from public.profiles p
    left join public.donor_preferences pr on pr.profile_id = p.id
    where p.id = p_donor;
    insert into public.internal_notes (subject_type, subject_id, author_id, body)
    values ('blood_request', p_request, auth.uid(), left('Follow-up with ' || coalesce(v_label, 'the donor') || ': ' || v_note, 2000));
  end if;
end;
$$;

-- -----------------------------------------------------------------------------
-- Contact for follow-ups: a Rakt Mitra may open the contact of a donor who gave blood
-- for this request while the follow-up is open, even after the request has closed.
-- Otherwise copied from 20261011000900.
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
  v_follow_up boolean;
  v_standing boolean;
begin
  if not public.is_staff() then
    raise exception 'Only authorised volunteers can access donor contact details' using errcode = '42501';
  end if;
  v_follow_up := exists (
    select 1 from public.request_responses rr
    where rr.request_id = p_request and rr.donor_id = p_donor and rr.outcome = 'donated'
      and rr.followed_up_at is null
      and rr.follow_up_due_at > now() - make_interval(days => private.setting_int('donation_follow_up_days', 14))
  );
  select * into v_req from public.blood_requests where id = p_request;
  if not found or (v_req.status not in ('verified', 'in_coordination') and not v_follow_up) then
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
  v_standing := coalesce(v_pref.contact_consent and v_pref.open_to_contact, false)
    and v_req.status in ('verified', 'in_coordination');
  if not (v_accepted or v_standing or v_follow_up) then
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
    jsonb_build_object('request_id', p_request, 'basis',
      case when v_accepted then 'contact_request_accepted' when v_standing then 'standing_consent' else 'donation_follow_up' end));

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

-- -----------------------------------------------------------------------------
-- Grants: signed-in members only (each function checks who may do what).
-- -----------------------------------------------------------------------------
revoke execute on function public.report_my_donation(uuid, boolean, date) from public, anon;
revoke execute on function public.list_my_donation_checks() from public, anon;
revoke execute on function public.complete_donation_follow_up(uuid, uuid, text) from public, anon;
grant execute on function public.report_my_donation(uuid, boolean, date) to authenticated;
grant execute on function public.list_my_donation_checks() to authenticated;
grant execute on function public.complete_donation_follow_up(uuid, uuid, text) to authenticated;
