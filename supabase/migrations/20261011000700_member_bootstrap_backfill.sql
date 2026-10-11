-- =============================================================================
-- Rakt Response - 0700 reusable member bootstrap + backfill
--
-- Moves the signup bootstrap into private.create_member_from_metadata() so it
-- can also repair accounts created before the schema existed (e.g. an account
-- registered while the database was empty). The trigger behaviour is unchanged.
-- =============================================================================
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
    p_id, v_name, v_display, v_is_donor, v_bg, private.jbool(m, 'age_confirmed', false), v_exp,
    v_approx, case when private.jbool(m, 'terms_accepted', false) then now() end
  );

  insert into public.profile_contacts (profile_id, email, phone, whatsapp)
  values (p_id, p_email, v_phone, v_whatsapp);

  begin
    v_dist := (prefs ->> 'max_distance_km')::integer;
    if v_dist not between 1 and 500 then v_dist := null; end if;
  exception when others then v_dist := null; end;

  insert into public.donor_preferences (
    profile_id, directory_visible, contact_consent, emergency_alerts, open_to_contact,
    show_donation_summary, preferred_contact_method, max_distance_km
  ) values (
    p_id,
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

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.create_member_from_metadata(
    new.id,
    new.email,
    coalesce(
      nullif(current_setting('rr.signup_' || replace(new.id::text, '-', ''), true), '')::jsonb,
      new.raw_user_meta_data,
      '{}'::jsonb
    )
  );
  return new;
end;
$$;

-- Backfill: create profiles for existing accounts that have none.
select private.create_member_from_metadata(u.id, u.email, coalesce(u.raw_user_meta_data, '{}'::jsonb))
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id);

-- Keep only the name in auth metadata for those accounts, as the BEFORE
-- trigger does for every newer signup (phone/location never belong in JWTs).
do $cleanup$
begin
  update auth.users u set raw_user_meta_data = jsonb_strip_nulls(jsonb_build_object(
    'full_name', private.jtext(u.raw_user_meta_data, 'full_name', 100),
    'display_name', private.jtext(u.raw_user_meta_data, 'display_name', 60)
  ))
  where u.raw_user_meta_data ?| array['phone', 'whatsapp', 'location', 'donations', 'preferences', 'blood_group'];
exception when insufficient_privilege then
  raise notice 'auth metadata clean-up skipped (insufficient privilege)';
end;
$cleanup$;

revoke execute on all functions in schema private from public;
