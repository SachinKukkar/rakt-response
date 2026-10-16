import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests run against a production build (`npm run build` first).
 * By default they use the bundled Chromium (`npx playwright install chromium`);
 * set PLAYWRIGHT_CHANNEL=chrome to use an installed Google Chrome instead.
 * The suite does not need a Supabase project: it covers public pages,
 * client-side validation, route protection and security headers.
 */
const PORT = Number(process.env.E2E_PORT ?? 3200);
const channel = process.env.PLAYWRIGHT_CHANNEL || undefined;

export default defineConfig({
  testDir: "tests/e2e",
  // Prepares the large homepage photo before the first test (see warmup.ts).
  globalSetup: "./tests/e2e/warmup.ts",
  timeout: 30_000,
  fullyParallel: true,
  // Two browsers at a time: more overloads a typical laptop (first-time image optimisation is heavy) and tests time out.
  workers: 2,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "mobile", use: { ...devices["Pixel 7"], channel } },
    { name: "small-phone", use: { ...devices["Pixel 7"], viewport: { width: 320, height: 640 }, channel } },
    { name: "desktop", use: { ...devices["Desktop Chrome"], channel }, testMatch: /layout\.spec\.ts/ },
  ],
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
