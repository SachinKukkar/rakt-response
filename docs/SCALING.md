# Scaling & migration plan

## Stage 1 — launch (free tiers)

Current architecture. Watch: database size, storage, egress, MAU, Vercel function usage, and project pausing.

## Stage 2 — reliability (first paid step)

Triggers: real emergencies depend on uptime, >~2,000 donors, or any free limit at 70%.

- Supabase Pro: no pausing, daily backups, more storage/egress. Enable PITR if budget allows.
- Paid/commercial-eligible hosting plan (or a Node host) with longer log retention.
- Custom SMTP on a paid tier with deliverability monitoring (SPF/DKIM/DMARC on your domain).
- Uptime monitoring and error reporting (choose a privacy-respecting provider; never send personal data in error payloads).
- Enforce MFA for administrators.

## Stage 3 — growth

- **Search performance:** add `pg_trgm` GIN indexes on `profiles.display_name`, `donor_locations.locality/city`; consider PostGIS (`geography` points + GiST index) for distance search instead of the haversine expression.
- **Derived statistics:** if `get_impact_metrics` / `get_admin_analytics` get slow, materialise them into a summary table refreshed by pg_cron (keep definitions identical).
- **Notifications:** optional opt-in email or web-push channel behind the existing `notifications` table; keep in-app as the source of truth and keep strict per-donor limits.
- **Messaging:** if the organisation adopts WhatsApp Business or SMS, add a provider adapter called from `set_request_status` alerts — keep consent, quiet hours and caps.
- **Maps:** move to a commercial or self-hosted tile service.
- **Multi-region teams:** add `service_areas` and scope volunteer permissions by district.
- **Types:** generate `Database` types with `supabase gen types` and pass them to the Supabase clients.

## Migrating away from a provider

- **Database:** standard Postgres. Dump with `pg_dump`, restore into any Postgres 15+; the app needs PostgREST-compatible RPC semantics only through `@supabase/supabase-js`, so moving off Supabase means replacing the client calls with a server-side data layer (the SQL functions are portable).
- **Auth:** Supabase Auth users can be exported (password hashes are bcrypt). Re-implementing `auth.uid()` for RLS is required on other platforms.
- **Storage:** three buckets of plain files; copy to any S3-compatible store and update the upload/download helpers.
- **Hosting:** the app is a standard Next.js Node server (`npm run build && npm start`), deployable to any container or Node host.

## Operational maturity checklist

- [ ] Documented on-call rota for volunteers during emergencies.
- [ ] Quarterly restore test.
- [ ] Annual privacy and access review (remove inactive staff).
- [ ] Load test donor search with realistic data before large campaigns.
