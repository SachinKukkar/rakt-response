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
| `1100_record_editing.sql` (dated `20261016`) | Donors edit and remove their own donation records at any status (editing a checked record sends it back to self-reported + pending); volunteers with `verify_donations` correct any record; admins edit and delete any record; `admin_delete_blood_request()` and `admin_delete_story()`; record edits and deletes are audited |
| `1200_patient_donor_contact.sql` (dated `20261018`) | Requests need an account and the patient's details (name, age, gender, IP/UHID, ward, reason, the requester's relation); "Hide my number" replaces the directory and contact switches (which now follow it); eligibility from donation dates (whole blood and apheresis intervals, India date); the family behind a verified request sees donors who can give now and opens one contact at a time (`donor_disclosures`, rate-limited, audited); donors join requests they can give for, within limits, and then see the patient's details; volunteers alone change a request's place, date or patient details |
| `1300_donation_follow_up.sql` (dated `20261018`) | Follow up after donation: a donor who joined a request reports "I donated" (a self-reported donation record from the request's hospital and type) or "I didn't"; whenever an outcome becomes `donated` a trigger starts a follow-up, tells the coordinating volunteers (else those who verify requests) and thanks the donor; volunteers mark it done with a note (an internal note, never the full name); `reveal_donor_contact` also opens a donated donor's contact for the follow-up, even after the request closes (logged); donation dates are checked against the India date |

## Roles

The site calls volunteers **Rakt Mitras**. The database keeps the word "volunteer" (role value, `volunteer_assignments`, function messages); the app's `translate()` shows those messages with "Rakt Mitra" (`src/i18n/terms.ts`).

- **Donor / member** — every authenticated user. Default.
- **Volunteer** — row in `staff_roles` with `role = 'volunteer'` and per-permission flags: `can_verify_requests`, `can_verify_donations` (`can_export` is reserved; exports are currently admin-only).
- **Administrator** — `role = 'admin'`, all permissions.

Roles are only changed by `grant_staff_role` / `revoke_staff_role` (admin-only, not on yourself) or the one-time `bootstrap_first_admin`. Signup metadata is never used for roles. `public.is_staff()`, `is_admin()` and `staff_can(permission)` read `staff_roles` for `auth.uid()` and are used in policies and RPCs.

## Tables

| Table | Purpose | Key protections |
| --- | --- | --- |
| `profiles` | Name, display name, blood group (+ verified flag, requested correction), age declaration, experience, verification, activity | Owner/admin read (volunteers only via directory RPCs); owner update; guard trigger blocks changes to verification, activity, deletion and verified blood group |
| `profile_contacts` | Email copy, phone, WhatsApp (separate from profile) | Owner/admin only. Volunteers get contact data only through `reveal_donor_contact()`; the family behind a verified request only through `reveal_donor_contact_to_requester()` |
| `donor_preferences` | Hide my number, open-to-contact, alerts, summary sharing, preferred method (call, WhatsApp or email); the older directory and contact switches follow Hide my number | Owner write; admin read; timestamps set by trigger; `open_to_contact` forced off without contact permission |
| `consent_events` | Append-only history of a member's choices (alerts, Hide my number, terms, and the older switches) | Owner/admin read; written by trigger |
| `donor_locations` | State/district/city/locality/PIN + optional coordinates rounded to 2 decimals (~1 km) | Owner write; admin read; volunteers see broad area only via directory RPCs; never public |
| `donation_records` | Type (whole blood / SDP / other apheresis / unknown), date, centre, source, verification | Donor inserts are forced to self-reported + pending; only `verify_donation_record()` changes verification; a donor's edit to a checked record resets it to self-reported + pending; owner, `verify_donations` staff and admins can edit; owner and admins can delete; edits and deletes audited; exact duplicates blocked by unique index; no future dates |
| `blood_requests` | Request with the patient's details, private requester contact, lifecycle status, duplicate pointer | Creator/staff read (donors who joined: through `get_request_details_for_donor()`); inserts only via `create_blood_request()` (signed in); place, date and patient details changed by staff only; status only via `set_request_status()` / `cancel_my_blood_request()`; permanent deletion only via `admin_delete_blood_request()` (admin, audited) |
| `request_events` | Request history | Staff and creator read |
| `request_responses` | Donor response, coordination outcome, contact attempts; after a donation: date, linked donation record, follow-up due / done (by whom) | Donor/staff read; writes via RPC; a trigger starts the follow-up when the outcome becomes `donated` |
| `contact_requests` | A volunteer asking a donor without standing contact permission to share their contact for one request (accepting counts as joining) | Donor, requester volunteer and staff read; writes via RPC |
| `donor_disclosures` | Which donor contacts a family has opened: one row per request and donor | The donor, the family and admins read; written only by `reveal_donor_contact_to_requester()` |
| `notifications` | In-app notifications | Owner read/delete; only `read_at` updatable |
| `volunteer_assignments` | Who coordinates which request, follow-ups | Staff read; writes via RPC |
| `internal_notes` | Staff-only notes on any record | Staff read/insert; append-only |
| `audit_logs` | Privileged actions (changed column names, never values) | Admin read; no writes from API roles; update/delete blocked by trigger |
| `platform_settings` | Contact details, limits, interval for estimates | Public keys readable by all; admin update; audited |
| `rate_limits` | Fixed-window counters | No API access |
| `impact_stories` | Submission (private fields), consents, moderated public fields, trust labels, status | Contributor/admin read; all writes via RPC; CHECK constraints tie each displayed detail to consent and publication to publish consent; permanent deletion only via `admin_delete_story()` (admin, audited) |
| `story_consents` | Consent snapshots | Contributor/admin read |
| `story_verification_events` | Moderation trail (`is_internal` flag) | Admin read; contributor reads non-internal events |
| `camp_records` | Camps; verified figures need a source + verification date; only completed camps can have them | Public rows readable; admin write |
| `impact_metrics_sources` | Manually documented figures with source + verification date | Public rows readable; admin write |

The minimum set from the brief (`profiles`, `donor_preferences`, `donor_locations`, `donation_records`, `blood_requests`, `request_responses`, `contact_requests`, `notifications`, `volunteer_assignments`, `audit_logs`, `platform_settings`, `impact_stories`, `story_consents`, `story_verification_events`, `impact_metrics_sources`, `camp_records`) is implemented, plus supporting tables.

## Access matrix (summary)

| | anon | donor (own) | volunteer | admin |
| --- | --- | --- | --- | --- |
| Profiles / locations / preferences | — | read, update permitted fields | only via directory functions and minimal labels (`staff_profile_labels`) | read, update |
| Contact details | — | own; the family behind a verified request: donors who can give now and don't hide their number, via `reveal_donor_contact_to_requester` | via `reveal_donor_contact` only | read |
| Donation records | — | own: add, edit/delete while pending | read and verify only with `can_verify_donations` (never own) | all |
| Blood requests | public view of verified requests (safe columns; older requests only if listing was allowed) | submit (signed in); read/cancel own; join open requests they can give for | read, edit details, status (verify if permitted), assign self | all, assign others |
| Directory search | — | — | `search_donors`, facets, matching | same |
| Stories | published, consented fields only | submit; read/manage own | volunteer stories | moderate everything |
| Audit logs | — | — | — | read |

## Key functions (SECURITY DEFINER, `search_path = ''`)

- Directory: `search_donors`, `search_donor_facets`, `match_donors_for_request` — staff only, only directory-visible + confirmed + active donors, never contact columns; wildcards escaped.
- Contact: `reveal_donor_contact(donor, request)` — staff, verified/active request, standing contact permission **or** accepted contact request (or an open follow-up for a donor who donated for this request, for `donation_follow_up_days` even after it closes), per-volunteer hourly rate limit, audit log entry. `create_contact_request`, `respond_to_contact_request`.
- Families: `list_eligible_donors_for_my_request(request)` — the request's creator only, once verified: donors who joined, then donors of the same group and district who can give now and don't hide their number (contact columns only once opened). `reveal_donor_contact_to_requester(request, donor)` — one donor from that list, hourly and monthly limits, a `donor_disclosures` row and an audit entry on first opening.
- Donors: `list_open_requests_for_donor` (each with `can_join`, a reason code and `eligible_from`), `respond_to_blood_request` (joining checks group, eligibility, open and daily limits; tells the family and assigned volunteers), `get_request_details_for_donor` (only after joining; the requester's phone only for requests made after this change), `my_next_eligible_date`.
- After donation: `report_my_donation(request, donated, date)` (a donor who joined; within a window after the request closes), `list_my_donation_checks()` (the donor's joined requests, with `ask_now` once the time has passed), `complete_donation_follow_up(request, donor, note)` (staff).
- Requests: `create_blood_request` (signed in, patient details, open-request and daily limits, duplicate detection; `submit_blood_request` stays one release for old clients and refuses anonymous callers), `set_request_status` (transition rules, verify permission, reasons for reject/cancel/fulfil, alerts on verification), `cancel_my_blood_request`, `expire_stale_requests`, `assign_request`, `update_assignment`, `record_coordination`, `generate_follow_up_reminders`, `list_my_request_matches`.
- Donations: `donation_summary` (invoker), `verify_donation_record`.
- People: `verify_profile`, `request_blood_group_change`, `resolve_blood_group_change`, `request_account_deletion`, `cancel_account_deletion`, `set_profile_active`, `anonymize_account`, `grant_staff_role`, `revoke_staff_role`, `bootstrap_first_admin`.
- Stories: `submit_story`, `update_story_consents`, `request_story_withdrawal`, `request_story_correction`, `set_story_status`, `update_story_public_content`, `set_story_verification`, `set_story_public_photo`, `list_published_stories`, `get_published_story`.
- Reporting: `get_impact_metrics` (public), `get_volunteer_overview`, `get_admin_analytics`, `log_audit_event` (namespaced).
- Retention: `purge_closed_request_contacts`, `private.purge_audit_logs`.

Anonymous users can execute only: `get_impact_metrics`, `get_public_blood_request`, `get_published_story`, `list_public_blood_requests`, `list_published_stories`, and the role helpers used by policies (enforced by `tests/db/consistency.test.ts`).

## Signup bootstrap

`auth.users` triggers create the profile, contacts, preferences, location and self-reported history from validated signup metadata. A BEFORE trigger stores the full payload in a transaction-local setting and strips everything except the name from `raw_user_meta_data`, so phone numbers and location never end up in JWTs or cookies. Invalid optional fields are dropped instead of failing signup.

## Tests

`npm run test:db` applies all migrations to PGlite and runs 130+ tests covering SELECT/INSERT/UPDATE/DELETE permissions per role, privilege escalation attempts, contact, eligibility and joining checks, rate limits, request and story lifecycles, the seed, and schema/code consistency.
