import { execSync } from "node:child_process";
import { expect, type Page } from "@playwright/test";

export const PASSWORD = "RaktDev#2026";
const MAILPIT = process.env.MAILPIT_URL ?? "http://127.0.0.1:54324";

export async function login(page: Page, email: string, password = PASSWORD) {
  await page.goto("/login");
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  // Administrators land on the admin hub; everyone else on the dashboard.
  await expect(page).toHaveURL(/\/(dashboard|admin)/, { timeout: 30_000 });
}

export async function logout(page: Page) {
  await page.context().clearCookies();
}

/** Finds the newest email to `to` in the local Mailpit inbox and returns the first matching link. */
export async function latestEmailLink(to: string, pathPart: string): Promise<string> {
  for (let attempt = 0; attempt < 30; attempt++) {
    const list = await fetch(`${MAILPIT}/api/v1/search?query=${encodeURIComponent(`to:${to}`)}`).then((r) => r.json());
    const message = list.messages?.[0];
    if (message) {
      const full = await fetch(`${MAILPIT}/api/v1/message/${message.ID}`).then((r) => r.json());
      const html: string = full.HTML || full.Text || "";
      const match = html.match(new RegExp(`https?://[^"'\\s<>]*${pathPart}[^"'\\s<>]*`));
      if (match) return match[0].replace(/&amp;/g, "&");
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`No email with a ${pathPart} link for ${to}`);
}

/** Collects uncaught page errors and failed server renders while visiting pages. */
export function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("response", (r) => {
    if (r.status() >= 500) errors.push(`${r.status()} ${r.url()}`);
  });
  return errors;
}

export async function expectHealthyPage(page: Page, path: string) {
  const response = await page.goto(path);
  expect(response?.status(), path).toBeLessThan(400);
  await expect(page.locator("h1").first(), path).toBeVisible();
  await expect(page.getByText("Something went wrong"), path).toHaveCount(0);
}

/** Runs SQL against the LOCAL Supabase database container (test setup only). */
/** Runs a query against the local database and returns its single value. */
export function localSqlValue(sql: string): string {
  const container = process.env.SUPABASE_DB_CONTAINER ?? "supabase_db_rakt-response";
  return execSync(`docker exec -i ${container} psql -U postgres -d postgres -tA -v ON_ERROR_STOP=1`, { input: sql }).toString().trim();
}

export function localSql(sql: string) {
  const container = process.env.SUPABASE_DB_CONTAINER ?? "supabase_db_rakt-response";
  execSync(`docker exec -i ${container} psql -U postgres -d postgres -v ON_ERROR_STOP=1`, { input: sql, stdio: ["pipe", "ignore", "inherit"] });
}
