# Rakt Response

**We Respond, We Support, We Save Lives.**

Rakt Response is a mobile-first web platform for the Rakt Response Team. It keeps a private register of voluntary blood donors, records whole blood and SDP donation history separately, helps authorised volunteers find consenting donors by blood group and area, coordinates verified blood requests, publishes real stories with consent, and educates the public about voluntary donation.

> Rakt Response facilitates coordination. It does not store blood, reserve units, certify compatibility, guarantee donor availability or replace a hospital or licensed blood bank.

## What's included

| Area | Highlights |
| --- | --- |
| Public site | Homepage, About, Why donate, Donation types, Eligibility (information only), Donation process, FAQ, Contact, Privacy, Terms, Our Impact, Stories, Share your story |
| Accounts | Email/password sign-up with email verification, password reset, 5-step donor registration with separate consents, member (non-donor) path |
| Donors | Dashboard, profile & photo, area with optional ~1 km map point, consent & availability controls with history, whole blood / SDP / apheresis history (self-reported vs verified), duplicate warnings, requests that match them, contact-request accept/decline, deletion request |
| Requests | Public or signed-in submission (rate limited, honeypot, duplicate detection), 9-state lifecycle, verification before listing, SDP-specific workflow, in-app alerts to opted-in donors, closure with confirmation notes, history |
| Volunteers | Overview, request queue, request coordination page (verify, assign, match, consent-checked contact, outcomes, notes), donor directory with server-side filters + mobile filter sheet, donation verification queue, follow-ups |
| Admins | Analytics from live records, donor verification & blood-group corrections, users & roles, volunteer permissions, story moderation & photo publication, camps & documented impact figures, audit logs, settings, retention clean-up, CSV exports (no contact data, logged) |
| Platform | Supabase Postgres with RLS on every table, SECURITY DEFINER RPCs with built-in authorisation, append-only audit log, PWA manifest + privacy-safe service worker, security headers, no paid services required |

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS v4 · shadcn/ui (Radix) · Lucide · Supabase (Postgres, Auth, Storage, RLS) · Zod · React Hook Form · Leaflet + OpenStreetMap (optional) · Vitest · PGlite (database tests) · Playwright.

## Quick start (local)

```bash
npm install
cp .env.example .env.local     # fill in Supabase URL + anon key
npm run dev                    # http://localhost:3000
```

The site runs without a database (education pages work; account features explain they are unavailable). For the full app:

1. Create a free Supabase project (or run `npx supabase start` locally with Docker).
2. Apply the migrations in `supabase/migrations` (`npx supabase db push`, or paste them in order into the SQL editor).
3. Configure auth URLs and email templates — see [docs/SETUP.md](docs/SETUP.md).
4. Register your own account, confirm the email, then make it the first administrator:
   ```bash
   npm run bootstrap-admin -- you@your-organisation.org
   ```
   (or run `select public.bootstrap_first_admin('you@your-organisation.org');` in the SQL editor).

Local Supabase (`npx supabase db reset`) also loads **fictional** seed accounts — see `supabase/seed.sql`. Never seed production.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js development, production build, production server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript `--noEmit` |
| `npm test` | Unit + database tests (Vitest) |
| `npm run test:unit` | Validation, helpers, image metadata stripping, CSV, errors |
| `npm run test:db` | Migrations + RLS/RPC tests in PGlite (in-process Postgres with a Supabase auth stub) |
| `npm run test:e2e` | Playwright on phone, 320 px and desktop viewports (run `npm run build` first; `PLAYWRIGHT_CHANNEL=chrome` uses installed Chrome) |
| `npm run test:live` | Full-stack journeys against a **local** Supabase (`npx supabase start`) with `npm run dev` running: signup + email confirmation, donations, requests, volunteer verification, consent-checked contact, stories with photos, password reset, roles, export, deletion |
| `npm run db:check` | Apply all migrations to an in-memory database |
| `npm run icons` | Regenerate PWA/favicon derivatives from the supplied logo |
| `npm run bootstrap-admin -- <email>` | Create the first administrator (service role key required) |

## Project structure

```
src/
  app/(site)/        public pages (static/ISR where possible)
  app/(auth)/        login, register, password flows
  app/(member)/      signed-in area: dashboard, profile, donations, requests, settings,
                     volunteer/*, admin/* (each gated server-side)
  app/auth/          email link + sign-out route handlers
  app/api/admin/     CSV export route
  actions/           server actions (validated with Zod, authorised server-side)
  components/        UI (shadcn/ui primitives in components/ui)
  lib/               Supabase clients, auth, validation, helpers
  proxy.ts           session refresh + private-route gate
supabase/
  migrations/        schema, RLS, functions, storage, default settings
  seed.sql           fictional local data
  templates/         auth email templates (token-hash links)
tests/  unit/ db/ e2e/
docs/               setup, deployment, database, security, operations, free tier, scaling
```

## Documentation

- [Setup & Supabase configuration](docs/SETUP.md)
- [Deployment (Vercel + Supabase)](docs/DEPLOYMENT.md)
- [Database, roles & RLS](docs/DATABASE.md)
- [Security & privacy checklist](docs/SECURITY.md)
- [Operations: backups, recovery, retention](docs/OPERATIONS.md)
- [Free-tier limits & trade-offs](docs/FREE-TIER.md)
- [Scaling & migration plan](docs/SCALING.md)

## Brand

The official logo was supplied by the Rakt Response Team (`public/brand/logo-original-supplied.png`). It is cut out without redrawing into `public/brand/`: `logo-mark.png` (the drop held in a hand), `logo-wordmark.png` / `logo-wordmark-cream.png` ("RAKT RESPONSE") and `logo-full.png`. `npm run icons` builds the favicon and app icons from the mark. The older badge `public/images/rakt-response-logo.jpeg` is kept only because existing auth emails may link to it.

Design (2026): brand red `#990000` ("night") and cream `#F4F3EF` sections, near-black ink `#1D0B0E` ("navy"), red `#C62A2A` / `#E2453F`, maroon `#5A0909`, Geist and Geist Mono type. Tokens and classes live in `src/app/globals.css`; photographs and where they came from in `src/lib/photos.ts`.

## Important

- Medical eligibility is never decided by this software. Any "next donation" date shown is an informational estimate for whole blood only.
- The privacy policy and terms describe the implemented behaviour but are **not legal advice**; have them reviewed against India's Digital Personal Data Protection Act, 2023 before launch.
- Never publish fictional stories or figures. The seed data exists only for local development.
