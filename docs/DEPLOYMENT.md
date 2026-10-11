# Deployment

## Vercel

1. Push the repository to GitHub/GitLab and import it in Vercel (framework preset: Next.js).
2. Environment variables (Production and Preview):
   - `NEXT_PUBLIC_SITE_URL` — e.g. `https://raktresponse.org`
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (optional, **Production only**, mark as sensitive)
   - `RATE_LIMIT_SALT` (random 32+ bytes)
3. Deploy. `NEXT_PUBLIC_*` values are compiled into the build, so **redeploy after changing them**.
4. Add your domain, then update Supabase **Site URL** and **Redirect URLs** to match.
5. Smoke test: homepage, register → confirmation email → dashboard, submit a request, volunteer verification, admin pages.

> **Plan terms:** Vercel's Hobby plan is restricted to personal, non-commercial use (see Vercel's fair-use guidelines). A community organisation should confirm its use qualifies, apply for a sponsored/nonprofit arrangement, upgrade to Pro, or host elsewhere. The app is a standard Next.js server and also runs on any Node.js host (`npm run build && npm run start`) or container platform.

### Headers & caching

`next.config.ts` sets a Content-Security-Policy (Supabase origin and OpenStreetMap tiles are allow-listed automatically from `NEXT_PUBLIC_SUPABASE_URL`), HSTS, `X-Frame-Options: DENY`, `nosniff`, a strict referrer policy and a restrictive Permissions-Policy. Private routes are rendered per request and the proxy adds `Cache-Control: private, no-store`.

## Supabase production settings

- Migrations applied in order (`npx supabase db push`).
- Email templates from `supabase/templates/`, custom SMTP configured, confirmations on.
- Auth rate limits reviewed (Authentication → Rate limits).
- Optional scheduled jobs (Database → Extensions → enable `pg_cron`):

```sql
-- Expire stale requests every 30 minutes and send follow-up reminders.
select cron.schedule('rr-expire-requests', '*/30 * * * *', $$select public.expire_stale_requests()$$);
select cron.schedule('rr-follow-ups', '*/15 * * * *', $$select public.generate_follow_up_reminders()$$);
-- Daily retention clean-up of requester contacts on long-closed requests.
select cron.schedule('rr-retention', '30 2 * * *', $$select public.purge_closed_request_contacts(90)$$);
```

Without pg_cron the same housekeeping runs whenever a volunteer opens their overview, and admins can run retention from Settings.

## Release checklist

- [ ] `npm run check` and `npm run build && npm run test:e2e` pass.
- [ ] New SQL is in a new migration file and tested with `npm run test:db`.
- [ ] No secrets in the repository (`git grep -i service_role` shows only docs/code references).
- [ ] Privacy policy updated if data handling changed.
- [ ] Backup taken before running destructive migrations (docs/OPERATIONS.md).
