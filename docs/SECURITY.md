# Security & privacy

## Principles

1. **Private by default.** New donors are invisible in the directory and not contactable until they opt in. Each permission is separate and revocable, and its history is recorded.
2. **Defence in depth.** Every private page is gated in the proxy *and* server layouts; every mutation is a server action that validates input with Zod and re-checks the user; the database enforces RLS, guard triggers, CHECK constraints and authorisation inside every SECURITY DEFINER function. Hiding a button is never the control.
3. **Least privilege.** Volunteers get per-permission flags; contact details are released one donor, one verified request at a time, with consent, a rate limit and an audit entry.
4. **Minimal data.** No date of birth, gender, medical history or street address. Coordinates are optional and rounded to ~1 km. Requests ask for no patient identifiers.

## Checklist

- [x] RLS enabled on every public table (tested).
- [x] Roles only via admin RPCs; no self-assignment; signup metadata ignored for roles (tested).
- [x] Service role key used only server-side, optional, never `NEXT_PUBLIC_`.
- [x] Privileged columns (verification, status, provenance, roles) protected by guard triggers (tested).
- [x] Contact access: staff + verified request + consent/accepted request + rate limit + audit (tested).
- [x] Directory never returns phone, email, PIN or coordinates (tested).
- [x] Public request/story functions return only safe columns (tested).
- [x] Audit log append-only, stores changed field names not values.
- [x] Rate limits on requests (per user / hashed IP), contact views, contact requests, stories, corrections, donation records; Supabase Auth limits for sign-in/sign-up.
- [x] Spam: honeypot field, duplicate request detection, verification before anything is shown.
- [x] Server Actions CSRF protection (Next.js origin check); sign-out is POST-only with an origin check.
- [x] Open-redirect protection on `next` parameters.
- [x] Security headers: CSP, HSTS, X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy, COOP.
- [x] Uploads: magic-byte type detection (JPEG/PNG/WebP only), size limits, metadata (EXIF/GPS/XMP/text) stripped server-side, private bucket until an admin publishes a copy under a random name; withdrawal removes the public copy.
- [x] Errors shown to users never include SQL, table names or personal data (`friendlyDbError`).
- [x] Phone numbers, emails and location are kept out of URLs, logs, analytics (none used), JWTs and browser storage; the service worker never caches private pages or API data.
- [x] CSV exports administrator-only, exclude contact details and precise location, guard against formula injection, and are audit-logged.
- [x] Account deletion: immediate withdrawal from discovery, admin anonymisation, optional login removal.
- [ ] Before launch: independent review of RLS policies and privacy documents; penetration test of the deployed site.
- [ ] Before launch: enable MFA for all administrators in Supabase Auth, and restrict dashboard access.

## Volunteer conduct (operational)

- Use contact details only for the specific verified request; don't save numbers to personal phones or share them in groups.
- Never forward patient details; use the request reference code.
- Close requests honestly — "fulfilled" only when the hospital/requester confirms.

## Indian data-protection notes

The Digital Personal Data Protection Act, 2023 (and its rules) applies to digital personal data processed in India. The platform is built to support: notice and specific consent (separate consents with timestamps), purpose limitation (coordination only), data minimisation, withdrawal of consent, correction and erasure requests, security safeguards and breach preparedness (audit logs). Health-related information (blood group, donation history) should be treated as sensitive. **This is not legal advice** — obtain a professional review of the privacy policy, terms, retention periods, cross-border hosting region and grievance process before production. Do not claim automatic compliance.

## Reporting a vulnerability

Email the organisation contact listed in Admin → Settings with details; do not test against real donor data.
