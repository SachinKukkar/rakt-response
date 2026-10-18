-- =============================================================================
-- Rakt Response — LOCAL DEVELOPMENT SEED (fictional data only)
--
-- Runs automatically on `npx supabase db reset` against the LOCAL stack.
-- NEVER run this against a production project. Every person, phone number,
-- hospital and story below is invented and labelled "(Fictional)" or "[DEV]".
--
-- Sign-in for all seeded accounts: password  RaktDev#2026
--   admin@example.test       administrator
--   volunteer@example.test   volunteer (can verify requests and donations)
--   donor1@example.test …    donors
--   member@example.test      member (not a donor) with a verified O+ request:
--                            sees donor1 and donor2; not donor6 (gave recently)
--                            or donor7 (keeps the number hidden)
-- =============================================================================

do $seed$
declare
  v_users jsonb := jsonb_build_array(
    jsonb_build_object('email', 'admin@example.test', 'meta', jsonb_build_object(
      'full_name', 'Aarav Admin (Fictional)', 'is_donor', true, 'blood_group', 'B+', 'age_confirmed', true, 'terms_accepted', true,
      'donation_experience', 'regular', 'phone', '+919000000001',
      'location', jsonb_build_object('state', 'Maharashtra', 'district', 'Pune', 'city', 'Pune', 'locality', 'Shivajinagar', 'pincode', '411005'),
      'preferences', jsonb_build_object('directory_visible', false))),
    jsonb_build_object('email', 'volunteer@example.test', 'meta', jsonb_build_object(
      'full_name', 'Vidya Volunteer (Fictional)', 'is_donor', true, 'blood_group', 'A+', 'age_confirmed', true, 'terms_accepted', true,
      'donation_experience', 'occasional', 'phone', '+919000000002',
      'location', jsonb_build_object('state', 'Maharashtra', 'district', 'Pune', 'city', 'Pune', 'locality', 'Aundh', 'pincode', '411007'),
      'preferences', jsonb_build_object('directory_visible', false))),
    jsonb_build_object('email', 'donor1@example.test', 'meta', jsonb_build_object(
      'full_name', 'Meera Sample (Fictional)', 'display_name', 'Meera S.', 'is_donor', true, 'blood_group', 'O+', 'age_confirmed', true,
      'terms_accepted', true, 'donation_experience', 'regular', 'phone', '+919000000101',
      'location', jsonb_build_object('state', 'Maharashtra', 'district', 'Pune', 'city', 'Pune', 'locality', 'Kothrud', 'pincode', '411038', 'lat', 18.51, 'lng', 73.81),
      'preferences', jsonb_build_object('directory_visible', true, 'contact_consent', true, 'open_to_contact', true, 'emergency_alerts', true,
        'show_donation_summary', true, 'preferred_contact_method', 'whatsapp'),
      'donations', jsonb_build_array(
        jsonb_build_object('donation_type', 'whole_blood', 'donation_date', '2026-03-14', 'centre_name', 'Fictional City Blood Bank [DEV]', 'city', 'Pune'),
        jsonb_build_object('donation_type', 'whole_blood', 'donation_date', '2025-11-02', 'centre_name', 'Fictional City Blood Bank [DEV]', 'city', 'Pune')))),
    jsonb_build_object('email', 'donor2@example.test', 'meta', jsonb_build_object(
      'full_name', 'Rohan Example (Fictional)', 'is_donor', true, 'blood_group', 'O+', 'age_confirmed', true, 'terms_accepted', true,
      'donation_experience', 'regular', 'phone', '+919000000102',
      'location', jsonb_build_object('state', 'Maharashtra', 'district', 'Pune', 'city', 'Pune', 'locality', 'Hadapsar', 'pincode', '411028', 'lat', 18.50, 'lng', 73.93),
      'preferences', jsonb_build_object('directory_visible', true, 'contact_consent', true, 'open_to_contact', true, 'emergency_alerts', true,
        'show_donation_summary', true, 'preferred_contact_method', 'phone'),
      'donations', jsonb_build_array(
        jsonb_build_object('donation_type', 'sdp', 'donation_date', '2026-06-20', 'centre_name', 'Fictional Apheresis Unit [DEV]', 'city', 'Pune')))),
    jsonb_build_object('email', 'donor3@example.test', 'meta', jsonb_build_object(
      'full_name', 'Sana Placeholder (Fictional)', 'is_donor', true, 'blood_group', 'B-', 'age_confirmed', true, 'terms_accepted', true,
      'donation_experience', 'first_time', 'phone', '+919000000103',
      'location', jsonb_build_object('state', 'Maharashtra', 'district', 'Mumbai Suburban', 'city', 'Mumbai', 'locality', 'Andheri'),
      'preferences', jsonb_build_object('directory_visible', true, 'contact_consent', false, 'emergency_alerts', false))),
    jsonb_build_object('email', 'donor4@example.test', 'meta', jsonb_build_object(
      'full_name', 'Kabir Testcase (Fictional)', 'is_donor', true, 'blood_group', 'AB+', 'age_confirmed', true, 'terms_accepted', true,
      'donation_experience', 'occasional', 'phone', '+919000000104',
      'location', jsonb_build_object('state', 'Maharashtra', 'district', 'Pune', 'city', 'Pimpri-Chinchwad', 'locality', 'Wakad'),
      'preferences', jsonb_build_object('directory_visible', true, 'contact_consent', true, 'open_to_contact', false))),
    jsonb_build_object('email', 'donor5@example.test', 'meta', jsonb_build_object(
      'full_name', 'Private Donor (Fictional)', 'is_donor', true, 'blood_group', 'O-', 'age_confirmed', true, 'terms_accepted', true,
      'donation_experience', 'regular', 'phone', '+919000000105',
      'location', jsonb_build_object('state', 'Maharashtra', 'district', 'Pune', 'city', 'Pune'),
      'preferences', jsonb_build_object('directory_visible', false))),
    jsonb_build_object('email', 'member@example.test', 'meta', jsonb_build_object(
      'full_name', 'Neha Member (Fictional)', 'is_donor', false, 'terms_accepted', true)),
    -- Gave whole blood a month ago: not shown to patients until 90 days have passed.
    jsonb_build_object('email', 'donor6@example.test', 'meta', jsonb_build_object(
      'full_name', 'Ravi Recent (Fictional)', 'is_donor', true, 'blood_group', 'O+', 'age_confirmed', true, 'terms_accepted', true,
      'donation_experience', 'regular', 'phone', '+919000000106',
      'location', jsonb_build_object('state', 'Maharashtra', 'district', 'Pune', 'city', 'Pune', 'locality', 'Baner'),
      'preferences', jsonb_build_object('directory_visible', true, 'contact_consent', true, 'open_to_contact', true, 'emergency_alerts', true,
        'hide_number', false, 'preferred_contact_method', 'phone'),
      'donations', jsonb_build_array(
        jsonb_build_object('donation_type', 'whole_blood', 'donation_date', to_char(current_date - 30, 'YYYY-MM-DD'),
          'centre_name', 'Fictional City Blood Bank [DEV]', 'city', 'Pune')))),
    -- Keeps their number hidden: never listed to patients, can still join requests.
    jsonb_build_object('email', 'donor7@example.test', 'meta', jsonb_build_object(
      'full_name', 'Hema Hidden (Fictional)', 'is_donor', true, 'blood_group', 'O+', 'age_confirmed', true, 'terms_accepted', true,
      'donation_experience', 'occasional', 'phone', '+919000000107',
      'location', jsonb_build_object('state', 'Maharashtra', 'district', 'Pune', 'city', 'Pune', 'locality', 'Viman Nagar'),
      'preferences', jsonb_build_object('directory_visible', true, 'contact_consent', true, 'open_to_contact', true, 'emergency_alerts', true,
        'hide_number', true, 'preferred_contact_method', 'whatsapp')))
  );
  v_user jsonb;
  v_id uuid;
  v_admin uuid;
  v_volunteer uuid;
  v_member uuid;
  v_request uuid;
  v_story uuid;
begin
  if exists (select 1 from auth.users where email = 'admin@example.test') then
    raise notice 'Seed already applied';
    return;
  end if;

  for v_user in select value from jsonb_array_elements(v_users) loop
    v_id := gen_random_uuid();
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      '00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', v_user ->> 'email',
      extensions.crypt('RaktDev#2026', extensions.gen_salt('bf')), now(),
      '{"provider": "email", "providers": ["email"]}'::jsonb, v_user -> 'meta', now() - interval '60 days', now(),
      '', '', '', ''
    );
    insert into auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), v_id, v_id::text, 'email',
      jsonb_build_object('sub', v_id::text, 'email', v_user ->> 'email', 'email_verified', true), now(), now(), now());
  end loop;

  select id into v_admin from auth.users where email = 'admin@example.test';
  select id into v_volunteer from auth.users where email = 'volunteer@example.test';
  select id into v_member from auth.users where email = 'member@example.test';

  -- Roles (the production path is bootstrap_first_admin + the admin UI).
  insert into public.staff_roles (user_id, role, can_verify_donations, can_verify_requests, can_export)
  values (v_admin, 'admin', true, true, true), (v_volunteer, 'volunteer', true, true, false);

  -- Verify a few records so dashboards show both verified and self-reported data.
  update public.donation_records r set verification_status = 'verified', record_source = 'volunteer_verified',
    verified_by = v_volunteer, verified_at = now()
  where r.donor_id = (select id from auth.users where email = 'donor1@example.test') and r.donation_date = '2025-11-02';
  update public.profiles set verification_status = 'verified', verified_by = v_admin, verified_at = now(), blood_group_verified = true
  where id = (select id from auth.users where email = 'donor1@example.test');

  -- Blood requests in different lifecycle states. The member's verified request
  -- uses the current form, so the member sees Meera and Rohan as able to give now.
  insert into public.blood_requests (created_by, requester_name, requester_phone, requester_contact_method, requester_relation,
    patient_name, patient_age, patient_gender, hospital_patient_id, ward, reason, share_contact_with_donors,
    blood_group, request_type, units_needed, hospital_name, state, district, city, required_by, urgency, notes,
    public_listing_consent, status, verified_by, verified_at)
  values (v_member, 'Neha Member (Fictional)', '+919000000201', 'phone', 'child',
    'Kamla Patient (Fictional)', 62, 'female', 'IP-DEV-0042', 'Ward 3', 'surgery', true,
    'O+', 'whole_blood', 2, 'Fictional General Hospital [DEV]', 'Maharashtra', 'Pune', 'Pune', now() + interval '20 hours', 'urgent',
    'Sample request for local development.', true, 'verified', v_volunteer, now() - interval '2 hours')
  returning id into v_request;
  insert into public.request_events (request_id, actor_id, event_type, to_status) values
    (v_request, v_member, 'created', 'submitted'),
    (v_request, v_volunteer, 'status_changed', 'verified');

  insert into public.blood_requests (requester_name, requester_phone, requester_contact_method, blood_group, request_type,
    hospital_name, state, district, city, required_by, urgency, public_listing_consent, status)
  values ('Anonymous Requester (Fictional)', '+919000000202', 'phone', 'B-', 'sdp',
    'Fictional Cancer Care Centre [DEV]', 'Maharashtra', 'Mumbai Suburban', 'Mumbai', now() + interval '2 days', 'critical', false, 'submitted');

  -- A completed camp with documented (fictional) figures.
  insert into public.camp_records (name, camp_date, state, district, city, organizing_partners, partners_confirmed, status,
    registrations_count, verified_donor_count, volunteer_count, highlights, data_source, data_verified_by, data_verified_at, is_public)
  values ('Sample Community Camp [DEV]', current_date - 30, 'Maharashtra', 'Pune', 'Pune', 'Fictional Partner Blood Centre', true,
    'completed', 60, 41, 12, 'Development sample only.', 'Fictional collection sheet [DEV]', v_admin, now(), true);

  -- One published sample story, clearly marked as development data.
  insert into public.impact_stories (story_type, contributor_id, contributor_name, follow_up_email, public_display_name, city,
    title, body, experience_period, donation_type, consent_contact_for_verification, consent_publish, consent_show_name,
    rights_confirmed, show_name, status, slug, public_title, public_body, published_at, reviewer_id, reviewed_at, experience_reviewed)
  values ('donor', (select id from auth.users where email = 'donor1@example.test'), 'Meera Sample (Fictional)', 'donor1@example.test',
    'Meera S.', 'Pune', '[Sample — development only] My first donation',
    'This is fictional sample text used only in local development to preview how a published story looks. It does not describe a real person or a real event, and it must never appear in production.',
    'March 2026', 'whole_blood', true, true, true, true, true, 'published', 'sample-development-story',
    '[Sample — development only] My first donation',
    'This is fictional sample text used only in local development to preview how a published story looks. It does not describe a real person or a real event, and it must never appear in production.',
    now(), v_admin, now(), true)
  returning id into v_story;
  insert into public.story_consents (story_id, consent_publish, consent_show_name, consent_show_photo, consent_show_personal_details,
    consent_contact_for_verification, rights_confirmed, recorded_by)
  values (v_story, true, true, false, false, true, true, null);

  update public.platform_settings set value = '"Pune (development sample)"' where key = 'org.service_area';
end;
$seed$;
