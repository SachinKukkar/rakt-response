-- =============================================================================
-- Rakt Response — 0300 Our Impact: stories, consents, verification events,
-- camp records, manually verified metric sources and public impact metrics.
--
-- Rules enforced here:
--   * Nothing becomes public without an administrator publishing it.
--   * Publication requires the contributor's explicit publish consent and is
--     limited to the disclosures they consented to (CHECK constraints).
--   * Withdrawal removes public access immediately (public functions filter
--     withdrawn stories) and is self-service for the contributor.
--   * Public metrics are computed from records; manual figures must carry a
--     source description and a verification date.
-- =============================================================================

create type public.story_type as enum ('donor', 'attendant', 'recipient', 'volunteer', 'camp');
create type public.story_status as enum (
  'draft', 'submitted', 'under_review', 'verification_requested', 'approved',
  'rejected', 'published', 'unpublished', 'archived'
);
create type public.camp_status as enum ('planned', 'completed', 'cancelled');

-- -----------------------------------------------------------------------------
-- camp_records
-- -----------------------------------------------------------------------------
create table public.camp_records (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 3 and 150),
  camp_date date not null,
  state text check (state is null or char_length(state) between 2 and 60),
  district text not null check (char_length(district) between 2 and 60),
  city text not null check (char_length(city) between 2 and 80),
  venue_area text check (venue_area is null or char_length(venue_area) <= 120),
  organizing_partners text check (organizing_partners is null or char_length(organizing_partners) <= 300),
  partners_confirmed boolean not null default false,
  status public.camp_status not null default 'planned',
  registrations_count integer check (registrations_count >= 0),
  verified_donor_count integer check (verified_donor_count >= 0),
  verified_units_collected integer check (verified_units_collected >= 0),
  volunteer_count integer check (volunteer_count >= 0),
  highlights text check (highlights is null or char_length(highlights) <= 2000),
  learnings text check (learnings is null or char_length(learnings) <= 2000),
  data_source text check (data_source is null or char_length(data_source) <= 300),
  data_verified_by uuid references auth.users (id) on delete set null,
  data_verified_at timestamptz,
  is_public boolean not null default false,
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Verified participation figures need a documented source and verification date.
  constraint camp_verified_figures_documented check (
    (verified_donor_count is null and verified_units_collected is null)
    or (data_verified_at is not null and data_source is not null)
  ),
  constraint camp_verified_only_when_completed check (
    status = 'completed' or (verified_donor_count is null and verified_units_collected is null)
  )
);
create index camp_records_date_idx on public.camp_records (camp_date desc);
create index camp_records_public_idx on public.camp_records (is_public, status);
create trigger camp_records_updated_at before update on public.camp_records
  for each row execute function private.set_updated_at();
create trigger camp_records_audit after insert or update or delete on public.camp_records
  for each row execute function private.audit_row_change();

-- -----------------------------------------------------------------------------
-- impact_stories
-- -----------------------------------------------------------------------------
create table public.impact_stories (
  id uuid primary key default gen_random_uuid(),
  slug text unique check (slug is null or slug ~ '^[a-z0-9-]{3,90}$'),
  story_type public.story_type not null,
  contributor_id uuid references public.profiles (id) on delete set null,
  -- Private contributor details (never returned by public functions)
  contributor_name text not null check (char_length(contributor_name) between 2 and 100),
  follow_up_email text check (follow_up_email is null or char_length(follow_up_email) <= 254),
  follow_up_phone text check (follow_up_phone is null or follow_up_phone ~ '^\+[1-9][0-9]{7,14}$'),
  private_supporting_details text check (private_supporting_details is null or char_length(private_supporting_details) <= 2000),
  photo_path text check (photo_path is null or char_length(photo_path) <= 300),
  -- Submitted content
  public_display_name text check (public_display_name is null or char_length(public_display_name) between 2 and 60),
  city text check (city is null or char_length(city) between 2 and 80),
  title text not null check (char_length(title) between 5 and 120),
  body text not null check (char_length(body) between 80 and 6000),
  experience_period text check (experience_period is null or char_length(experience_period) <= 60),
  donation_type public.donation_type,
  blood_group public.blood_group,
  camp_id uuid references public.camp_records (id) on delete set null,
  -- Current consent (history in story_consents)
  consent_contact_for_verification boolean not null default false,
  consent_publish boolean not null default false,
  consent_show_name boolean not null default false,
  consent_show_photo boolean not null default false,
  consent_show_personal_details boolean not null default false,
  rights_confirmed boolean not null check (rights_confirmed),
  -- Moderated public presentation
  public_title text check (public_title is null or char_length(public_title) between 5 and 120),
  public_body text check (public_body is null or char_length(public_body) between 80 and 6000),
  public_excerpt text check (public_excerpt is null or char_length(public_excerpt) <= 240),
  public_photo_path text check (public_photo_path is null or char_length(public_photo_path) <= 300),
  show_name boolean not null default false,
  show_photo boolean not null default false,
  show_personal_details boolean not null default false,
  show_city boolean not null default true,
  -- Trust labels
  identity_verified boolean not null default false,
  experience_reviewed boolean not null default false,
  donation_verified boolean not null default false,
  donation_record_id uuid references public.donation_records (id) on delete set null,
  verification_updated_at timestamptz,
  -- Moderation
  status public.story_status not null default 'submitted',
  reviewer_id uuid references auth.users (id) on delete set null,
  reviewed_at timestamptz,
  decision_reason text check (decision_reason is null or char_length(decision_reason) <= 500),
  published_at timestamptz,
  withdrawal_requested_at timestamptz,
  withdrawn_at timestamptz,
  withdrawal_reason text check (withdrawal_reason is null or char_length(withdrawal_reason) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint stories_show_name_consented check (not show_name or consent_show_name),
  constraint stories_show_photo_consented check (not show_photo or consent_show_photo),
  constraint stories_show_personal_consented check (not show_personal_details or consent_show_personal_details),
  constraint stories_publish_consented check (status <> 'published' or (consent_publish and withdrawn_at is null)),
  constraint stories_published_has_slug check (status <> 'published' or slug is not null),
  constraint stories_donation_badge_has_record check (not donation_verified or donation_record_id is not null)
);
create index impact_stories_status_idx on public.impact_stories (status, published_at desc);
create index impact_stories_type_idx on public.impact_stories (story_type) where status = 'published';
create index impact_stories_contributor_idx on public.impact_stories (contributor_id);
create trigger impact_stories_updated_at before update on public.impact_stories
  for each row execute function private.set_updated_at();
create trigger impact_stories_audit after update of status, identity_verified, experience_reviewed, donation_verified,
  show_name, show_photo, show_personal_details, public_photo_path on public.impact_stories
  for each row execute function private.audit_row_change();

-- Consent history (append only).
create table public.story_consents (
  id bigint generated always as identity primary key,
  story_id uuid not null references public.impact_stories (id) on delete cascade,
  consent_publish boolean not null,
  consent_show_name boolean not null,
  consent_show_photo boolean not null,
  consent_show_personal_details boolean not null,
  consent_contact_for_verification boolean not null,
  rights_confirmed boolean not null,
  recorded_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);
create index story_consents_story_idx on public.story_consents (story_id, created_at desc);

-- Moderation and verification trail.
create table public.story_verification_events (
  id bigint generated always as identity primary key,
  story_id uuid not null references public.impact_stories (id) on delete cascade,
  actor_id uuid references auth.users (id) on delete set null,
  event_type text not null check (event_type in (
    'submitted', 'status_changed', 'verification_updated', 'content_edited', 'disclosure_updated',
    'photo_updated', 'consent_updated', 'correction_requested', 'withdrawn', 'note'
  )),
  from_status public.story_status,
  to_status public.story_status,
  reason text check (reason is null or char_length(reason) <= 1000),
  is_internal boolean not null default true,
  created_at timestamptz not null default now()
);
create index story_events_story_idx on public.story_verification_events (story_id, created_at desc);

-- -----------------------------------------------------------------------------
-- impact_metrics_sources — manually verified figures (e.g. units collected at a
-- partner camp) that cannot be derived from platform records.
-- -----------------------------------------------------------------------------
create table public.impact_metrics_sources (
  id uuid primary key default gen_random_uuid(),
  metric_key text not null check (metric_key ~ '^[a-z0-9_]{3,60}$'),
  label text not null check (char_length(label) between 3 and 120),
  value numeric not null check (value >= 0),
  unit text check (unit is null or char_length(unit) <= 30),
  period_start date,
  period_end date,
  source_description text not null check (char_length(source_description) between 5 and 500),
  verified_by uuid references auth.users (id) on delete set null default auth.uid(),
  verified_at date not null default current_date,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint metric_period_order check (period_start is null or period_end is null or period_start <= period_end)
);
create trigger impact_metrics_sources_updated_at before update on public.impact_metrics_sources
  for each row execute function private.set_updated_at();
create trigger impact_metrics_sources_audit after insert or update or delete on public.impact_metrics_sources
  for each row execute function private.audit_row_change();

-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------
alter table public.camp_records enable row level security;
alter table public.impact_stories enable row level security;
alter table public.story_consents enable row level security;
alter table public.story_verification_events enable row level security;
alter table public.impact_metrics_sources enable row level security;

create policy camp_records_select on public.camp_records for select to anon, authenticated
  using (is_public or (select public.is_staff()));
create policy camp_records_insert on public.camp_records for insert to authenticated
  with check ((select public.is_admin()));
create policy camp_records_update on public.camp_records for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy camp_records_delete on public.camp_records for delete to authenticated
  using ((select public.is_admin()));

-- Stories: contributors read their own submissions; administrators read all.
-- Public reads go through list_published_stories()/get_published_story().
create policy impact_stories_select on public.impact_stories for select to authenticated
  using (contributor_id = (select auth.uid()) or (select public.is_admin()));

create policy story_consents_select on public.story_consents for select to authenticated
  using (
    (select public.is_admin())
    or exists (select 1 from public.impact_stories s where s.id = story_id and s.contributor_id = (select auth.uid()))
  );

create policy story_events_select on public.story_verification_events for select to authenticated
  using (
    (select public.is_admin())
    or (not is_internal and exists (
      select 1 from public.impact_stories s where s.id = story_id and s.contributor_id = (select auth.uid())))
  );

create policy impact_metrics_select on public.impact_metrics_sources for select to anon, authenticated
  using (is_public or (select public.is_admin()));
create policy impact_metrics_insert on public.impact_metrics_sources for insert to authenticated
  with check ((select public.is_admin()));
create policy impact_metrics_update on public.impact_metrics_sources for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy impact_metrics_delete on public.impact_metrics_sources for delete to authenticated
  using ((select public.is_admin()));

revoke all on public.impact_stories, public.story_consents, public.story_verification_events from anon;
revoke insert, update, delete on public.impact_stories, public.story_consents, public.story_verification_events from authenticated;
revoke all on public.camp_records, public.impact_metrics_sources from anon;
grant select on public.camp_records, public.impact_metrics_sources to anon;

-- -----------------------------------------------------------------------------
-- Helpers
-- -----------------------------------------------------------------------------
create or replace function private.story_transition_allowed(p_from public.story_status, p_to public.story_status)
returns boolean language sql immutable set search_path = '' as $$
  select case p_from
    when 'draft' then p_to in ('submitted', 'archived')
    when 'submitted' then p_to in ('under_review', 'rejected', 'archived')
    when 'under_review' then p_to in ('verification_requested', 'approved', 'rejected', 'archived')
    when 'verification_requested' then p_to in ('under_review', 'approved', 'rejected', 'archived')
    when 'approved' then p_to in ('published', 'under_review', 'rejected', 'archived')
    when 'published' then p_to in ('unpublished')
    when 'unpublished' then p_to in ('published', 'under_review', 'archived')
    when 'rejected' then p_to in ('under_review', 'archived')
    else false end;
$$;

create or replace function private.slugify(p text)
returns text language sql immutable set search_path = '' as $$
  select coalesce(nullif(btrim(left(regexp_replace(lower(coalesce(p, '')), '[^a-z0-9]+', '-', 'g'), 70), '-'), ''), 'story');
$$;

create or replace function private.snapshot_story_consent(p_story uuid)
returns void language sql security definer set search_path = '' as $$
  insert into public.story_consents (
    story_id, consent_publish, consent_show_name, consent_show_photo, consent_show_personal_details,
    consent_contact_for_verification, rights_confirmed, recorded_by
  )
  select s.id, s.consent_publish, s.consent_show_name, s.consent_show_photo, s.consent_show_personal_details,
    s.consent_contact_for_verification, s.rights_confirmed, auth.uid()
  from public.impact_stories s where s.id = p_story;
$$;

-- -----------------------------------------------------------------------------
-- Contributor functions
-- -----------------------------------------------------------------------------
create or replace function public.submit_story(
  p_story_type public.story_type,
  p_contributor_name text,
  p_public_display_name text,
  p_follow_up_email text,
  p_follow_up_phone text,
  p_city text,
  p_title text,
  p_body text,
  p_experience_period text,
  p_donation_type public.donation_type,
  p_blood_group public.blood_group,
  p_camp_id uuid,
  p_supporting_details text,
  p_photo_path text,
  p_consent_contact boolean,
  p_consent_publish boolean,
  p_consent_show_name boolean,
  p_consent_show_photo boolean,
  p_consent_show_personal boolean,
  p_rights_confirmed boolean
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Please sign in to share your story' using errcode = '42501';
  end if;
  if not coalesce(p_rights_confirmed, false) then
    raise exception 'Please confirm you have the right to share this content' using errcode = '22023';
  end if;
  if not coalesce(p_consent_publish, false) then
    raise exception 'Stories are shared for publication. Please give consent to publish, or contact us privately instead.' using errcode = '22023';
  end if;
  if p_story_type = 'volunteer' and not public.is_staff() then
    raise exception 'Volunteer stories can be submitted by authorised volunteers' using errcode = '42501';
  end if;
  if p_photo_path is not null and (p_photo_path not like auth.uid()::text || '/%' or p_photo_path like '%..%') then
    raise exception 'Invalid photo reference' using errcode = '22023';
  end if;
  if p_camp_id is not null and not exists (select 1 from public.camp_records c where c.id = p_camp_id and c.is_public) then
    raise exception 'Camp not found' using errcode = 'P0002';
  end if;
  if not public.hit_rate_limit('story_submit', private.setting_int('story_daily_limit', 3), 86400) then
    raise exception 'You have shared several stories today. Please try again tomorrow.' using errcode = 'RR429';
  end if;

  insert into public.impact_stories (
    story_type, contributor_id, contributor_name, follow_up_email, follow_up_phone, private_supporting_details,
    photo_path, public_display_name, city, title, body, experience_period, donation_type, blood_group, camp_id,
    consent_contact_for_verification, consent_publish, consent_show_name, consent_show_photo,
    consent_show_personal_details, rights_confirmed,
    show_name, show_photo, show_personal_details, status
  ) values (
    p_story_type, auth.uid(), btrim(p_contributor_name), nullif(lower(btrim(p_follow_up_email)), ''),
    nullif(btrim(p_follow_up_phone), ''), nullif(btrim(p_supporting_details), ''),
    p_photo_path, nullif(btrim(p_public_display_name), ''), nullif(btrim(p_city), ''), btrim(p_title), btrim(p_body),
    nullif(btrim(p_experience_period), ''), p_donation_type, p_blood_group, p_camp_id,
    coalesce(p_consent_contact, false), true, coalesce(p_consent_show_name, false),
    coalesce(p_consent_show_photo, false) and p_photo_path is not null, coalesce(p_consent_show_personal, false), true,
    coalesce(p_consent_show_name, false), coalesce(p_consent_show_photo, false) and p_photo_path is not null,
    coalesce(p_consent_show_personal, false), 'submitted'
  ) returning id into v_id;

  perform private.snapshot_story_consent(v_id);
  insert into public.story_verification_events (story_id, actor_id, event_type, to_status, is_internal)
  values (v_id, auth.uid(), 'submitted', 'submitted', false);
  perform private.notify_admins('story_update', 'New story submitted for review',
    'A ' || p_story_type::text || ' story is waiting for moderation.', '/admin/stories/' || v_id::text);
  return v_id;
end;
$$;

create or replace function public.update_story_consents(
  p_story uuid,
  p_show_name boolean,
  p_show_photo boolean,
  p_show_personal boolean,
  p_contact boolean
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_s public.impact_stories;
begin
  select * into v_s from public.impact_stories where id = p_story for update;
  if not found or v_s.contributor_id is distinct from auth.uid() then
    raise exception 'Story not found' using errcode = 'P0002';
  end if;
  if v_s.withdrawn_at is not null then
    raise exception 'This story has been withdrawn' using errcode = '22023';
  end if;
  -- Revocations take effect immediately; new permissions only allow (never
  -- force) an administrator to display that detail after review.
  update public.impact_stories set
    consent_show_name = p_show_name,
    consent_show_photo = p_show_photo and photo_path is not null,
    consent_show_personal_details = p_show_personal,
    consent_contact_for_verification = p_contact,
    show_name = show_name and p_show_name,
    show_photo = show_photo and p_show_photo,
    show_personal_details = show_personal_details and p_show_personal
  where id = p_story;
  perform private.snapshot_story_consent(p_story);
  insert into public.story_verification_events (story_id, actor_id, event_type, reason, is_internal)
  values (p_story, auth.uid(), 'consent_updated', 'Contributor updated their consent choices', false);
  if (v_s.consent_show_name and not p_show_name) or (v_s.consent_show_photo and not p_show_photo)
     or (v_s.consent_show_personal_details and not p_show_personal) then
    perform private.notify_admins('story_update', 'A contributor narrowed their consent',
      'Public display has been reduced automatically. Check any public photo that may need removing.',
      '/admin/stories/' || p_story::text);
  end if;
end;
$$;

create or replace function public.request_story_withdrawal(
  p_story uuid,
  p_reason text default null,
  p_photo_cleanup_needed boolean default false
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_s public.impact_stories;
begin
  select * into v_s from public.impact_stories where id = p_story for update;
  if not found or v_s.contributor_id is distinct from auth.uid() then
    raise exception 'Story not found' using errcode = 'P0002';
  end if;
  if v_s.withdrawn_at is not null then
    return;
  end if;
  update public.impact_stories set
    withdrawal_requested_at = now(),
    withdrawn_at = now(),
    withdrawal_reason = nullif(left(btrim(p_reason), 500), ''),
    consent_publish = false,
    show_name = false,
    show_photo = false,
    show_personal_details = false,
    public_photo_path = null,
    status = case when status in ('published') then 'unpublished'::public.story_status
                  when status = 'archived' then status
                  else 'archived'::public.story_status end
  where id = p_story;
  perform private.snapshot_story_consent(p_story);
  insert into public.story_verification_events (story_id, actor_id, event_type, from_status, to_status, reason, is_internal)
  values (p_story, auth.uid(), 'withdrawn', v_s.status,
    case when v_s.status = 'published' then 'unpublished'::public.story_status when v_s.status = 'archived' then v_s.status else 'archived'::public.story_status end,
    'Withdrawn by contributor', false);
  perform private.notify_admins('story_update', 'A story was withdrawn by its contributor',
    'It is no longer public.' || case when p_photo_cleanup_needed then ' A public photo may still need to be deleted from storage.' else '' end,
    '/admin/stories/' || p_story::text);
end;
$$;

create or replace function public.request_story_correction(p_story uuid, p_details text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_s public.impact_stories;
begin
  select * into v_s from public.impact_stories where id = p_story;
  if not found or v_s.contributor_id is distinct from auth.uid() then
    raise exception 'Story not found' using errcode = 'P0002';
  end if;
  if nullif(btrim(p_details), '') is null then
    raise exception 'Please describe the correction you need' using errcode = '22023';
  end if;
  if not public.hit_rate_limit('story_correction', 5, 86400) then
    raise exception 'Too many correction requests today' using errcode = 'RR429';
  end if;
  insert into public.story_verification_events (story_id, actor_id, event_type, reason, is_internal)
  values (p_story, auth.uid(), 'correction_requested', left(btrim(p_details), 1000), false);
  perform private.notify_admins('story_update', 'Story correction requested',
    'A contributor asked for a correction to their story.', '/admin/stories/' || p_story::text);
end;
$$;

-- -----------------------------------------------------------------------------
-- Moderation (administrators)
-- -----------------------------------------------------------------------------
create or replace function public.set_story_status(p_story uuid, p_status public.story_status, p_reason text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_s public.impact_stories;
  v_reason text := nullif(btrim(p_reason), '');
  v_slug text;
begin
  if not public.is_admin() then
    raise exception 'Only administrators can moderate stories' using errcode = '42501';
  end if;
  select * into v_s from public.impact_stories where id = p_story for update;
  if not found then
    raise exception 'Story not found' using errcode = 'P0002';
  end if;
  if v_s.status = p_status then
    return;
  end if;
  if not private.story_transition_allowed(v_s.status, p_status) then
    raise exception 'A story cannot move from % to %', v_s.status, p_status using errcode = '22023';
  end if;
  if p_status in ('rejected', 'unpublished', 'archived', 'verification_requested') and v_reason is null then
    raise exception 'Please record the reason for this decision' using errcode = '22023';
  end if;
  if p_status = 'published' then
    if v_s.withdrawn_at is not null or not v_s.consent_publish then
      raise exception 'This story cannot be published without the contributor''s current consent' using errcode = '42501';
    end if;
    v_slug := coalesce(v_s.slug, private.slugify(coalesce(v_s.public_title, v_s.title)) || '-' || substr(md5(v_s.id::text), 1, 6));
  end if;
  update public.impact_stories set
    status = p_status,
    slug = coalesce(v_slug, slug),
    public_title = case when p_status = 'published' then coalesce(public_title, title) else public_title end,
    public_body = case when p_status = 'published' then coalesce(public_body, body) else public_body end,
    published_at = case when p_status = 'published' then coalesce(published_at, now()) else published_at end,
    reviewer_id = case when p_status in ('approved', 'rejected', 'published') then auth.uid() else reviewer_id end,
    reviewed_at = case when p_status in ('approved', 'rejected', 'published') then now() else reviewed_at end,
    decision_reason = coalesce(left(v_reason, 500), decision_reason)
  where id = p_story;
  insert into public.story_verification_events (story_id, actor_id, event_type, from_status, to_status, reason, is_internal)
  values (p_story, auth.uid(), 'status_changed', v_s.status, p_status, left(v_reason, 1000),
    p_status not in ('published', 'unpublished', 'rejected', 'verification_requested'));
  perform private.notify(v_s.contributor_id, 'story_update',
    case p_status
      when 'published' then 'Your story is now published'
      when 'unpublished' then 'Your story is no longer public'
      when 'rejected' then 'Your story was not approved'
      when 'verification_requested' then 'We need a little more information about your story'
      when 'approved' then 'Your story was approved'
      when 'under_review' then 'Your story is being reviewed'
      else 'Your story status changed' end,
    case when p_status in ('rejected', 'verification_requested', 'unpublished') then v_reason end,
    '/share-your-story/submissions');
end;
$$;

create or replace function public.update_story_public_content(
  p_story uuid,
  p_public_title text,
  p_public_body text,
  p_public_excerpt text,
  p_public_display_name text,
  p_show_name boolean,
  p_show_photo boolean,
  p_show_personal boolean,
  p_show_city boolean
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_s public.impact_stories;
begin
  if not public.is_admin() then
    raise exception 'Only administrators can edit stories' using errcode = '42501';
  end if;
  select * into v_s from public.impact_stories where id = p_story for update;
  if not found then
    raise exception 'Story not found' using errcode = 'P0002';
  end if;
  if (p_show_name and not v_s.consent_show_name)
     or (p_show_photo and not v_s.consent_show_photo)
     or (p_show_personal and not v_s.consent_show_personal_details) then
    raise exception 'You can only display details the contributor consented to share' using errcode = '42501';
  end if;
  update public.impact_stories set
    public_title = nullif(btrim(p_public_title), ''),
    public_body = nullif(btrim(p_public_body), ''),
    public_excerpt = nullif(btrim(p_public_excerpt), ''),
    public_display_name = nullif(btrim(p_public_display_name), ''),
    show_name = p_show_name,
    show_photo = p_show_photo,
    show_personal_details = p_show_personal,
    show_city = p_show_city
  where id = p_story;
  insert into public.story_verification_events (story_id, actor_id, event_type, reason)
  values (p_story, auth.uid(), 'content_edited', 'Public presentation updated (original submission preserved)');
end;
$$;

create or replace function public.set_story_verification(
  p_story uuid,
  p_identity_verified boolean,
  p_experience_reviewed boolean,
  p_donation_verified boolean,
  p_donation_record uuid default null,
  p_note text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_s public.impact_stories;
begin
  if not public.is_admin() then
    raise exception 'Only administrators can set verification labels' using errcode = '42501';
  end if;
  select * into v_s from public.impact_stories where id = p_story for update;
  if not found then
    raise exception 'Story not found' using errcode = 'P0002';
  end if;
  if p_donation_verified then
    if p_donation_record is null or not exists (
      select 1 from public.donation_records r
      where r.id = p_donation_record and r.verification_status = 'verified' and r.donor_id = v_s.contributor_id
    ) then
      raise exception 'Link a verified donation record belonging to the contributor first' using errcode = '22023';
    end if;
  end if;
  update public.impact_stories set
    identity_verified = p_identity_verified,
    experience_reviewed = p_experience_reviewed,
    donation_verified = p_donation_verified,
    donation_record_id = case when p_donation_verified then p_donation_record else null end,
    verification_updated_at = now()
  where id = p_story;
  insert into public.story_verification_events (story_id, actor_id, event_type, reason)
  values (p_story, auth.uid(), 'verification_updated',
    concat_ws('; ',
      'identity=' || p_identity_verified::text,
      'experience=' || p_experience_reviewed::text,
      'donation=' || p_donation_verified::text,
      nullif(btrim(p_note), '')));
end;
$$;

create or replace function public.set_story_public_photo(p_story uuid, p_public_path text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_s public.impact_stories;
begin
  if not public.is_admin() then
    raise exception 'Only administrators can publish photos' using errcode = '42501';
  end if;
  select * into v_s from public.impact_stories where id = p_story for update;
  if not found then
    raise exception 'Story not found' using errcode = 'P0002';
  end if;
  if p_public_path is not null and (not v_s.consent_show_photo or v_s.photo_path is null or v_s.withdrawn_at is not null) then
    raise exception 'The contributor has not consented to a public photo' using errcode = '42501';
  end if;
  if p_public_path is not null and p_public_path !~ '^[a-f0-9-]{36}\.(jpg|png|webp)$' then
    raise exception 'Invalid public photo name' using errcode = '22023';
  end if;
  update public.impact_stories set
    public_photo_path = p_public_path,
    show_photo = case when p_public_path is null then false else show_photo end
  where id = p_story;
  insert into public.story_verification_events (story_id, actor_id, event_type, reason)
  values (p_story, auth.uid(), 'photo_updated', case when p_public_path is null then 'Public photo removed' else 'Public photo approved' end);
end;
$$;

-- -----------------------------------------------------------------------------
-- Public read functions (only published, consented, non-withdrawn content)
-- -----------------------------------------------------------------------------
create or replace function public.list_published_stories(
  p_types public.story_type[] default null,
  p_limit integer default 12,
  p_offset integer default 0
)
returns table (
  slug text,
  story_type public.story_type,
  title text,
  excerpt text,
  display_name text,
  city text,
  photo_path text,
  identity_verified boolean,
  experience_reviewed boolean,
  donation_verified boolean,
  donation_type public.donation_type,
  published_at timestamptz,
  total_count bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  select s.slug, s.story_type, coalesce(s.public_title, s.title),
    coalesce(s.public_excerpt, left(coalesce(s.public_body, s.body), 180) || case when char_length(coalesce(s.public_body, s.body)) > 180 then '…' else '' end),
    case when s.show_name and s.consent_show_name then coalesce(s.public_display_name, split_part(s.contributor_name, ' ', 1)) end,
    case when s.show_city then s.city end,
    case when s.show_photo and s.consent_show_photo then s.public_photo_path end,
    s.identity_verified, s.experience_reviewed, s.donation_verified, s.donation_type, s.published_at,
    count(*) over ()
  from public.impact_stories s
  where s.status = 'published' and s.consent_publish and s.withdrawn_at is null
    and (p_types is null or cardinality(p_types) = 0 or s.story_type = any(p_types))
  order by s.published_at desc
  limit least(greatest(coalesce(p_limit, 12), 1), 48) offset greatest(coalesce(p_offset, 0), 0);
$$;

create or replace function public.get_published_story(p_slug text)
returns table (
  slug text,
  story_type public.story_type,
  title text,
  body text,
  display_name text,
  city text,
  photo_path text,
  experience_period text,
  donation_type public.donation_type,
  blood_group public.blood_group,
  identity_verified boolean,
  experience_reviewed boolean,
  donation_verified boolean,
  verification_updated_at timestamptz,
  published_at timestamptz,
  camp_name text,
  camp_date date,
  camp_city text,
  camp_district text,
  camp_partners text,
  camp_verified_donors integer,
  camp_verified_units integer,
  camp_data_verified_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select s.slug, s.story_type, coalesce(s.public_title, s.title), coalesce(s.public_body, s.body),
    case when s.show_name and s.consent_show_name then coalesce(s.public_display_name, split_part(s.contributor_name, ' ', 1)) end,
    case when s.show_city then s.city end,
    case when s.show_photo and s.consent_show_photo then s.public_photo_path end,
    s.experience_period, s.donation_type,
    case when s.show_personal_details and s.consent_show_personal_details then s.blood_group end,
    s.identity_verified, s.experience_reviewed, s.donation_verified, s.verification_updated_at, s.published_at,
    c.name, c.camp_date, c.city, c.district,
    case when c.partners_confirmed then c.organizing_partners end,
    case when c.data_verified_at is not null then c.verified_donor_count end,
    case when c.data_verified_at is not null then c.verified_units_collected end,
    c.data_verified_at
  from public.impact_stories s
  left join public.camp_records c on c.id = s.camp_id and c.is_public
  where s.slug = p_slug and s.status = 'published' and s.consent_publish and s.withdrawn_at is null;
$$;

-- Public impact metrics. Every figure is computed from records at request time
-- and comes with a definition; no figure is stored or typed in by hand here.
create or replace function public.get_impact_metrics()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with donors as (
    select p.* from public.profiles p join auth.users u on u.id = p.id
    where p.is_donor and p.is_active and p.deletion_requested_at is null and u.email_confirmed_at is not null
  ), coordination as (
    select
      br.id,
      br.verified_at,
      (select min(e.created_at) from public.request_events e where e.request_id = br.id and e.to_status = 'in_coordination') as coordinated_at
    from public.blood_requests br
  )
  select jsonb_build_object(
    'generated_at', now(),
    'period_start', (select min(d.created_at) from donors d),
    'registered_donors', (select count(*) from donors),
    'verified_donors', (select count(*) from donors d where d.verification_status = 'verified'),
    'verified_whole_blood_donations', (select count(*) from public.donation_records r join donors d on d.id = r.donor_id
                                       where r.donation_type = 'whole_blood' and r.verification_status = 'verified'),
    'verified_sdp_donations', (select count(*) from public.donation_records r join donors d on d.id = r.donor_id
                               where r.donation_type = 'sdp' and r.verification_status = 'verified'),
    'self_reported_donations', (select count(*) from public.donation_records r join donors d on d.id = r.donor_id
                                where r.verification_status = 'pending'),
    'requests_received', (select count(*) from public.blood_requests where status <> 'draft'),
    'requests_verified', (select count(*) from public.blood_requests where verified_at is not null),
    'requests_coordinated', (select count(*) from coordination c where c.coordinated_at is not null),
    'requests_fulfilled', (select count(*) from public.blood_requests where status = 'fulfilled'),
    'camps_completed', (select count(*) from public.camp_records where is_public and status = 'completed'),
    'camp_verified_donors', (select sum(verified_donor_count) from public.camp_records
                             where is_public and status = 'completed' and data_verified_at is not null),
    'stories_published', (select count(*) from public.impact_stories where status = 'published' and withdrawn_at is null),
    'median_hours_to_coordination', (
      select round((percentile_cont(0.5) within group (order by extract(epoch from (c.coordinated_at - c.verified_at)) / 3600))::numeric, 1)
      from coordination c where c.verified_at is not null and c.coordinated_at is not null and c.coordinated_at >= c.verified_at
    ),
    'coordination_sample_size', (
      select count(*) from coordination c where c.verified_at is not null and c.coordinated_at is not null and c.coordinated_at >= c.verified_at
    ),
    'manual_sources', coalesce((
      select jsonb_agg(jsonb_build_object(
        'label', m.label, 'value', m.value, 'unit', m.unit, 'period_start', m.period_start,
        'period_end', m.period_end, 'source', m.source_description, 'verified_at', m.verified_at
      ) order by m.verified_at desc)
      from public.impact_metrics_sources m where m.is_public
    ), '[]'::jsonb)
  );
$$;

-- -----------------------------------------------------------------------------
-- Account anonymisation (processing a deletion request without destroying
-- aggregate history). Returns storage paths the server must delete.
-- -----------------------------------------------------------------------------
create or replace function public.anonymize_account(p_profile uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_paths jsonb;
begin
  if not public.is_admin() then
    raise exception 'Only administrators can process deletion requests' using errcode = '42501';
  end if;
  if p_profile = auth.uid() then
    raise exception 'You cannot process your own deletion request' using errcode = '42501';
  end if;
  if not exists (select 1 from public.profiles where id = p_profile) then
    raise exception 'Profile not found' using errcode = 'P0002';
  end if;

  select jsonb_build_object(
    'profile_photo', (select photo_path from public.profiles where id = p_profile),
    'story_photos', coalesce((select jsonb_agg(photo_path) from public.impact_stories where contributor_id = p_profile and photo_path is not null), '[]'::jsonb),
    'public_story_photos', coalesce((select jsonb_agg(public_photo_path) from public.impact_stories where contributor_id = p_profile and public_photo_path is not null), '[]'::jsonb)
  ) into v_paths;

  update public.impact_stories set
    withdrawn_at = coalesce(withdrawn_at, now()),
    withdrawal_requested_at = coalesce(withdrawal_requested_at, now()),
    withdrawal_reason = coalesce(withdrawal_reason, 'Account deleted'),
    consent_publish = false, show_name = false, show_photo = false, show_personal_details = false,
    status = case when status = 'published' then 'unpublished'::public.story_status when status = 'archived' then status else 'archived'::public.story_status end,
    contributor_name = 'Deleted member',
    follow_up_email = null, follow_up_phone = null, private_supporting_details = null,
    photo_path = null, public_photo_path = null
  where contributor_id = p_profile;

  update public.donor_preferences set directory_visible = false, contact_consent = false,
    emergency_alerts = false, open_to_contact = false, show_donation_summary = false
  where profile_id = p_profile;
  delete from public.donor_locations where profile_id = p_profile;
  update public.profile_contacts set phone = null, whatsapp = null, email = null where profile_id = p_profile;
  update public.staff_roles set is_active = false where user_id = p_profile;
  update public.profiles set
    full_name = 'Deleted member', display_name = null, is_donor = false, blood_group = null,
    requested_blood_group = null, photo_path = null, is_active = false,
    deletion_requested_at = coalesce(deletion_requested_at, now())
  where id = p_profile;
  delete from public.notifications where user_id = p_profile;
  perform private.write_audit('profiles.anonymized', 'profiles', p_profile::text, '{}'::jsonb);
  return v_paths;
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
grant execute on function public.list_published_stories(public.story_type[], integer, integer) to anon;
grant execute on function public.get_published_story(text) to anon;
grant execute on function public.get_impact_metrics() to anon;
revoke execute on function public.consume_rate_limit(text, integer, integer) from authenticated;
revoke execute on function public.bootstrap_first_admin(text) from authenticated;
