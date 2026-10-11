import { defineConfig, devices } from "@playwright/test";

/**
 * Full-stack tests against a LOCAL Supabase stack (`npx supabase start` +
 * `npx supabase db reset` for the fictional seed) and the app running with
 * `.env.local` pointing at it:
 *
 *   npm run dev            # http://localhost:3000
 *   npm run test:live
 *
 * Never point these tests at production: they create accounts and data.
 */
export default defineConfig({
  testDir: "tests/e2e-live",
  timeout: 120_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: {
    ...devices["Pixel 7"],
    channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
    baseURL: process.env.LIVE_BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
  },
});
