# Operations: backups, recovery & retention

## Backups

The Supabase **free plan does not include automatic backups** (check the current pricing page). Until you upgrade:

1. **Weekly logical backup** (and before every migration):
   ```bash
   # Connection string: Supabase → Project Settings → Database (use the session pooler or direct connection)
   npx supabase db dump --db-url "$DATABASE_URL" -f backups/schema.sql
   npx supabase db dump --db-url "$DATABASE_URL" --data-only -f backups/data-$(date +%F).sql
   ```
   or `pg_dump --format=custom --no-owner "$DATABASE_URL" > rr-$(date +%F).dump`.
2. Include the `auth` schema in data backups only if you need to restore accounts (it contains password hashes — store with the same care as the data).
3. **Storage**: download the `story-uploads`, `story-public` and `profile-photos` buckets periodically (dashboard or the Storage API).
4. Encrypt backup files, keep at least two generations in separate places, restrict access to administrators, and delete old copies according to the retention policy.
5. On a paid plan, enable daily backups / point-in-time recovery.

## Recovery

1. Create a new Supabase project (same region) or reset the existing one.
2. Apply migrations: `npx supabase db push`.
3. Restore data: `psql "$DATABASE_URL" -f data-YYYY-MM-DD.sql` (or `pg_restore --data-only`). Restore in a maintenance window; triggers re-run on inserts, so prefer `pg_restore --disable-triggers` as the owner for full restores.
4. Re-create storage buckets (migration 0400) and upload bucket contents.
5. Reconfigure Auth URLs, templates and SMTP; update Vercel env vars if the project URL changed; redeploy.
6. Verify: sign in as admin, check analytics totals against the backup, check audit logs.

**Test a restore at least once per quarter** into a throwaway project.

## Retention (defaults — confirm with your legal review)

| Data | Retention |
| --- | --- |
| Accounts & profiles | Until deletion is requested; then anonymised by an admin |
| Requester contact details on closed requests | ~90 days (`purge_closed_request_contacts`) |
| Audit logs | 3 years (`select private.purge_audit_logs(interval '3 years');` as the database owner) |
| Rate-limit counters | ~2 days (automatic) |
| Withdrawn stories | Hidden immediately; contributor details anonymised when the account is deleted. Consent and moderation records kept for accountability |
| Unconfirmed sign-ups | Review periodically in Admin → Overview ("Unconfirmed sign-ups") and delete in the Supabase Auth dashboard |

## Routine tasks

- Daily (automatic with pg_cron, see DEPLOYMENT.md): expire stale requests, follow-up reminders, retention clean-up.
- Weekly: review pending verifications, deletion requests, story queue; take a backup.
- Monthly: review audit logs for unusual contact access (`donor_contact.revealed`), staff list and permissions, Supabase usage against free-tier limits.

## Incident response (summary)

1. Contain: revoke the affected staff role (Admin → Volunteers), rotate keys (Supabase → API) and redeploy.
2. Investigate with `audit_logs` (who accessed which donor, when).
3. Notify affected people and authorities as required by law; document actions.
4. Fix and add a regression test.

## Free-tier pausing

Supabase pauses free projects after about a week without activity. A paused project makes accounts and requests unavailable (public education pages still load). Keep the project active, monitor it, or upgrade before relying on it for emergencies.
