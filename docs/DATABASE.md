# Database, roles & Row Level Security

All schema lives in version-controlled migrations:

| File | Contents |
| --- | --- |
| `0100_foundation.sql` | Enums, core tables, indexes, role helpers, guard triggers, audit log, rate limits, signup bootstrap trigger, RLS policies, grants |
| `0200_coordination.sql` | Donation summary & verification, profile verification, blood-group corrections, deletion requests, staff roles, admin bootstrap, request lifecycle, alerts, assignments, directory search, matching, consent-checked contact, analytics, retention |
| `0300_impact_stories.sql` | Stories, consent history, moderation trail, camps, documented metric sources, public impact metrics, account anonymisation |
| `0400_storage.sql` | Storage buckets and object policies (skipped where `storage` doesn't exist, e.g. tests) |
| `0500_default_settings.sql` | Safe default platform settings |
| `0600_audit_actor_deletion.sql` | Lets account deletion clear `audit_logs.actor_id` while keeping the log append-only |
| `0700_member_bootstrap_backfill.sql` | Reusable member bootstrap from signup metadata, plus a backfill for older accounts |
| `0800_email_verification_and_admin_edits.sql` | Donors verified on email confirmation, donor bio, administrator edits of donor details |
| `0900_name_privacy_photos_data_checks.sql` | Display name or "Donor #XXXX" for volunteers, admin-only profile photos, `admin_data_checks()` |
| `1000_bombay_blood_group.sql` (dated `20261015`) | Adds the Bombay blood group `'Oh'` to `blood_group`; matching stays exact, so Oh requests reach Oh donors only |

## Roles

- **Donor / member** — every authenticated user. Default.
- **Volunteer** — row in `staff_roles` with `role = 'volunteer'` and per-permission flags: `can_verify_requests`, `can_verify_donations` (`can_export` is reserved; exports are currently admin-only).
- **Administrator** — `role = 'admin'`, all permissions.

Roles are only changed by `grant_staff_role` / `revoke_staff_role` (admin-only, not on yourself) or the one-time `bootstrap_first_admin`. Signup metadata is never used for roles. `public.is_staff()`, `is_admin()` and `staff_can(permission)` read `staff_roles` for `auth.uid()` and are used in policies and RPCs.

## Tables

| Table | Purpose | Key protections |
| --- | --- | --- |
| `profiles` | Name, display name, blood group (+ verified flag, requested correction), age declaration, experience, verification, activity | Owner/admin read (volunteers only via directory RPCs); owner update; guard trigger blocks changes to verification, activity, deletion and verified blood group |
| `profile_contacts` | Email copy, phone, WhatsApp (separate from profile) | Owner/admin only. Volunteers get contact data only through `reveal_donor_contact()` |
| `donor_preferences` | Directory visibility, contact consent, open-to-contact, alerts, summary sharing, preferred method | Owner write; admin read; consent timestamps set by trigger; `open_to_contact` forced off without contact consent |
| `consent_events` | Append-only consent history | Owner/admin read; written by trigger |
| `donor_locations` | State/district/city/locality/PIN + optional coordinates rounded to 2 decimals (~1 km) | Owner write; admin read; volunteers see broad area only via directory RPCs; never public |
| `donation_records` | Type (whole blood / SDP / other apheresis / unknown), date, centre, source, verification | Donor inserts are forced to self-reported + pending; only `verify_donation_record()` changes verification; exact duplicates blocked by unique index; no future dates |
| `blood_requests` | Request with private requester contact, lifecycle status, duplicate pointer | Creator/staff read; inserts only via `submit_blood_request()`; status only via `set_request_status()` / `cancel_my_blood_request()` |
| `request_events` | Request history | Staff and creator read |
| `request_responses` | Donor response, coordination outcome, contact attempts | Donor/staff read; writes via RPC |
| `contact_requests` | Consent request from a volunteer to a donor for a specific request | Donor, requester volunteer and staff read; writes via RPC |
| `notifications` | In-app notifications | Owner read/delete; only `read_at` updatable |
| `volunteer_assignments` | Who coordinates which request, follow-ups | Staff read; writes via RPC |
| `internal_notes` | Staff-only notes on any record | Staff read/insert; append-only |
| `audit_logs` | Privileged actions (changed column names, never values) | Admin read; no writes from API roles; update/delete blocked by trigger |
| `platform_settings` | Contact details, limits, interval for estimates | Public keys readable by all; admin update; audited |
| `rate_limits` | Fixed-window counters | No API access |
| `impact_stories` | Submission (private fields), consents, moderated public fields, trust labels, status | Contributor/admin read; all writes via RPC; CHECK constraints tie each displayed detail to consent and publication to publish consent |
| `story_consents` | Consent snapshots | Contributor/admin read |
| `story_verification_events` | Moderation trail (`is_internal` flag) | Admin read; contributor reads non-internal events |
| `camp_records` | Camps; verified figures need a source + verification date; only completed camps can have them | Public rows readable; admin write |
| `impact_metrics_sources` | Manually documented figures with source + verification date | Public rows readable; admin write |

The minimum set from the brief (`profiles`, `donor_preferences`, `donor_locations`, `donation_records`, `blood_requests`, `request_responses`, `contact_requests`, `notifications`, `volunteer_assignments`, `audit_logs`, `platform_settings`, `impact_stories`, `story_consents`, `story_verification_events`, `impact_metrics_sources`, `camp_records`) is implemented, plus supporting tables.

## Access matrix (summary)

| | anon | donor (own) | volunteer | admin |
| --- | --- | --- | --- | --- |
| Profiles / locations / preferences | — | read, update permitted fields | only via directory functions and minimal labels (`staff_profile_labels`) | read, update |
| Contact details | — | own | via `reveal_donor_contact` only | read |
| Donation records | — | own: add, edit/delete while pending | read and verify only with `can_verify_donations` (never own) | all |
| Blood requests | public view of verified, consented requests (safe columns) | submit; read/cancel own | read, edit details, status (verify if permitted), assign self | all, assign others |
| Directory search | — | — | `search_donors`, facets, matching | same |
| Stories | published, consented fields only | submit; read/manage own | volunteer stories | moderate everything |
| Audit logs | — | — | — | read |

## Key functions (SECURITY DEFINER, `search_path = ''`)

- Directory: `search_donors`, `search_donor_facets`, `match_donors_for_request` — staff only, only directory-visible + confirmed + active donors, never contact columns; wildcards escaped.
- Contact: `reveal_donor_contact(donor, request)` — staff, verified/active request, standing consent **or** accepted contact request, per-volunteer hourly rate limit, audit log entry. `create_contact_request`, `respond_to_contact_request`.
- Requests: `submit_blood_request` (rate limit by user or hashed client key, duplicate detection), `set_request_status` (transition rules, verify permission, reasons for reject/cancel/fulfil, alerts on verification), `cancel_my_blood_request`, `expire_stale_requests`, `assign_request`, `update_assignment`, `record_coordination`, `generate_follow_up_reminders`, `list_my_request_matches`.
- Donations: `donation_summary` (invoker), `verify_donation_record`.
- People: `verify_profile`, `request_blood_group_change`, `resolve_blood_group_change`, `request_account_deletion`, `cancel_account_deletion`, `set_profile_active`, `anonymize_account`, `grant_staff_role`, `revoke_staff_role`, `bootstrap_first_admin`.
- Stories: `submit_story`, `update_story_consents`, `request_story_withdrawal`, `request_story_correction`, `set_story_status`, `update_story_public_content`, `set_story_verification`, `set_story_public_photo`, `list_published_stories`, `get_published_story`.
- Reporting: `get_impact_metrics` (public), `get_volunteer_overview`, `get_admin_analytics`, `log_audit_event` (namespaced).
- Retention: `purge_closed_request_contacts`, `private.purge_audit_logs`.

Anonymous users can execute only: `get_impact_metrics`, `get_public_blood_request`, `get_published_story`, `list_public_blood_requests`, `list_published_stories`, and the role helpers used by policies (enforced by `tests/db/consistency.test.ts`).

## Signup bootstrap

`auth.users` triggers create the profile, contacts, preferences, location and self-reported history from validated signup metadata. A BEFORE trigger stores the full payload in a transaction-local setting and strips everything except the name from `raw_user_meta_data`, so phone numbers and location never end up in JWTs or cookies. Invalid optional fields are dropped instead of failing signup.

## Tests

`npm run test:db` applies all migrations to PGlite and runs 90+ tests covering SELECT/INSERT/UPDATE/DELETE permissions per role, privilege escalation attempts, consent and contact checks, rate limits, request and story lifecycles, the seed, and schema/code consistency.
