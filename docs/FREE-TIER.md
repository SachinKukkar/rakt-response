# Free-tier limits & trade-offs

Figures checked on 11 October 2026 from the providers' public pages. **Free tiers change — re-check before launch and periodically.** None of them is unlimited or guaranteed to stay free.

## Supabase (Free plan)

| Resource | Limit |
| --- | --- |
| Database | 500 MB per project |
| File storage | 1 GB |
| Egress | 5 GB (+5 GB cached) |
| Monthly active users | 50,000 |
| Active projects | 2 |
| Inactivity | Projects pause after ~1 week of inactivity |
| Backups | Not included |
| Built-in auth email | Testing only: about 2 emails/hour, delivered only to your organisation's team members — **configure custom SMTP** for real users |

What this means for Rakt Response: text data is tiny (thousands of donors fit easily in 500 MB). Photos are the main storage cost — they are resized in the browser (max 1600 px for stories, 800 px for profiles) and capped at 2–3 MB. Plan manual backups (docs/OPERATIONS.md).

## Vercel (Hobby plan)

| Resource | Included |
| --- | --- |
| Fast data transfer | 100 GB / month |
| Function invocations | 1,000,000 / month |
| Active CPU | 4 CPU-hours / month |
| Image transformations | 5,000 / month |
| Runtime logs | 1 hour |

**Terms:** Hobby is limited to personal, non-commercial use. Confirm eligibility for your organisation or choose another host (see DEPLOYMENT.md). Exceeding a limit can pause the feature until the 30-day window resets.

What this means: public education pages are static/ISR (cheap); only signed-in pages and actions use functions. The logo and story photos use Next.js image optimisation sparingly; story photos and profile photos are already resized, and signed-in previews use unoptimised images to save transformations.

## OpenStreetMap tiles (optional map)

The standard tile server is free but **best-effort with no SLA**, and requires visible attribution, normal caching, a valid Referer, and no bulk/offline downloading. Heavy use can be blocked. The app loads the map only when someone taps "Pick on a map", so typical use is light. No geocoding service is used. For growth, switch to a self-hosted or commercial tile provider (only the tile URL in `src/components/map/location-picker.tsx` and the CSP need changing). Set `NEXT_PUBLIC_ENABLE_MAP=false` to disable the map entirely; everything works without it.

## Deliberate free alternatives

| Wanted | Free approach used | Trade-off |
| --- | --- | --- |
| SMS / WhatsApp Business alerts | In-app notifications + consent-based `tel:` / `wa.me` links opened by a volunteer | Donors must open the app to see alerts; volunteers message individually (no bulk messaging, by design) |
| Email notifications | Only Supabase Auth emails (via your SMTP). Core features never depend on email | No email digests yet |
| Analytics | None (privacy) — admin analytics are computed from the database | No traffic analytics |
| CAPTCHA | Honeypot, rate limits, verification before display | A determined spammer can still submit requests that volunteers must reject |
| Scheduler | pg_cron (free on Supabase) or opportunistic housekeeping when volunteers open their overview | Without pg_cron, expiry runs only when staff are active |
| Geocoding / distance | Structured area fields; optional rounded coordinates set by the donor | Distance filters work only for donors who added a map point |
