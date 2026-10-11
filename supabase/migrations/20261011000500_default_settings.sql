-- =============================================================================
-- Rakt Response — 0500 default platform settings (safe for production).
-- Organisation contact details are intentionally empty: an administrator sets
-- the real values in /admin/settings. Limits can be tuned there too.
-- =============================================================================
insert into public.platform_settings (key, value, is_public, description) values
  ('org.contact_email', '""', true, 'Public contact email for Rakt Response'),
  ('org.contact_phone', '""', true, 'Public helpline number in international format, e.g. +919800000000'),
  ('org.whatsapp', '""', true, 'Public WhatsApp number in international format'),
  ('org.service_area', '""', true, 'Cities/districts the team currently serves'),
  ('registration_open', 'true', true, 'Whether new donor registrations are accepted'),
  ('whole_blood_interval_days', '90', true, 'Minimum days used for the informational whole-blood estimate. Indian guidance currently differs by sex (e.g. 90/120 days); the blood centre decides.'),
  ('anon_request_daily_limit', '3', false, 'Blood requests per anonymous connection per day'),
  ('member_request_daily_limit', '5', false, 'Blood requests per signed-in member per day'),
  ('contact_reveal_hourly_limit', '20', false, 'Donor contact detail views per volunteer per hour'),
  ('contact_request_hourly_limit', '30', false, 'Contact requests per volunteer per hour'),
  ('request_alert_max_donors', '25', false, 'Maximum donors alerted in-app when a request is verified'),
  ('request_expiry_grace_hours', '12', false, 'Hours after the required time before an open request expires'),
  ('story_daily_limit', '3', false, 'Stories a member can submit per day')
on conflict (key) do nothing;
