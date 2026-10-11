# Setup & Supabase configuration

## 1. Prerequisites

- Node.js 20.9+ (tested on Node 24) and npm.
- A Supabase account (free plan is enough to start) **or** Docker + the Supabase CLI for a fully local stack.

## 2. Install

```bash
npm install
cp .env.example .env.local
```

| Variable | Where | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | public | Base URL used in auth email redirects, e.g. `https://raktresponse.org` |
| `NEXT_PUBLIC_SUPABASE_URL` | public | Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | The anon/publishable key. Safe in the browser — RLS protects data |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only** | Optional. Enables anonymous blood-request submission, the admin bootstrap script and login removal when processing deletions. Never prefix with `NEXT_PUBLIC_` |
| `RATE_LIMIT_SALT` | **server only** | Random secret for hashing client IPs used as rate-limit keys |
| `NEXT_PUBLIC_ENABLE_MAP` | public | `false` hides the optional OpenStreetMap picker |

## 3a. Hosted Supabase project

1. Create a project (choose the region closest to your users, e.g. Mumbai `ap-south-1`).
2. Apply migrations **in filename order**:
   - CLI: `npx supabase link --project-ref <ref>` then `npx supabase db push`, or
   - Dashboard → SQL editor: paste each file in `supabase/migrations/` in order and run.
3. Check `storage` → buckets `story-uploads` (private), `story-public` (public), `profile-photos` (private) exist. Migration `0400` creates them and their policies.
4. **Authentication → URL configuration**
   - Site URL: your public URL.
   - Redirect URLs: `https://<your-domain>/auth/callback`, `https://<your-domain>/auth/confirm` (and the localhost equivalents for development).
5. **Authentication → Providers → Email**: keep email confirmations **on**. Minimum password length 8.
6. **Authentication → Email templates**: replace the *Confirm signup*, *Reset password* and *Change email address* templates with the files in `supabase/templates/`. They use token-hash links (`/auth/confirm?token_hash=…`) that work even when the email is opened on a different device. (The default templates also work through `/auth/callback`, but only in the same browser that signed up.)
7. **Authentication → SMTP**: the built-in sender is for testing only — at the time of writing it is limited to about **2 emails per hour** and only delivers to members of your Supabase organisation. Before launch configure a custom SMTP provider. Several providers have free tiers suitable for small volumes (check their current limits and terms); the app itself needs no email API.
8. Sign up on your site with the organiser's address, confirm it, then run the bootstrap (next section).

## 3b. Local Supabase (Docker)

```bash
npx supabase start          # first run downloads the Docker images
npx supabase db reset       # applies migrations + fictional seed
```

Copy the printed API URL and anon key into `.env.local`. Local emails appear in the Inbucket UI at http://localhost:54324. Seeded accounts all use the password `RaktDev#2026` (see `supabase/seed.sql`).

## 4. First administrator

Roles can never be granted at signup. Create the first admin once:

```bash
npm run bootstrap-admin -- organiser@your-organisation.org
```

or in the SQL editor:

```sql
select public.bootstrap_first_admin('organiser@your-organisation.org');
```

The function refuses if an administrator already exists or the email is unconfirmed. Further roles are granted from **Admin → Users & roles**.

## 5. First-run checklist

- Admin → Settings: set public contact email/phone/WhatsApp and service area.
- Review rate limits (contact views per volunteer, request limits).
- Grant volunteer roles with the least permissions needed (verify requests / verify donations / export).
- Read docs/SECURITY.md and docs/OPERATIONS.md.

## 6. Development workflow

```bash
npm run dev
npm run check          # lint + typecheck + unit + database tests
npm run build && npm run test:e2e
```

Database tests run entirely in-process with PGlite and a small Supabase auth stub (`tests/db/supabase-stub.sql`), so they need no network or Docker. When you change SQL, add a migration file — never edit a migration that has already been applied to production.

### Generating database types (optional)

With a linked project you can generate full TypeScript types:

```bash
npx supabase gen types typescript --linked > src/lib/database.types.ts
```

The app currently uses hand-written row types in `src/lib/types.ts`, and `tests/db/query-contract.test.ts` verifies that every table, column and RPC argument used in `src/` exists in the schema.
