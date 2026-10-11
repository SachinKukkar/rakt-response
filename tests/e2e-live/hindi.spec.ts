import { writeFileSync, mkdirSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { login, trackErrors } from "./helpers";
import { ADMIN_PAGES, DONOR_PAGES, PUBLIC_PAGES, VOLUNTEER_PAGES } from "./pages";

/*
 * Every page in Hindi: must render without errors, with <html lang="hi-IN">.
 * Also writes test-results/hindi-leftovers.json listing lines that still look
 * English (seeded sample data is English on purpose and is ignored).
 */

const leftovers: Record<string, string[]> = {};
const IGNORE = /Rakt Response|\(Fictional\)|\[DEV\]|Sample|example\.test|@|https?:|Fictional|OpenStreetMap|Leaflet/;
const ENGLISH_RUN = /[A-Za-z][A-Za-z'’-]+(?:\s+[A-Za-z][A-Za-z'’-]+){2,}/;

async function useHindi(page: Page) {
  const baseURL = test.info().project.use.baseURL ?? "http://localhost:3000";
  await page.context().addCookies([{ name: "rr_lang", value: "hi", url: baseURL }]);
}

async function visitInHindi(page: Page, path: string) {
  const response = await page.goto(path);
  expect(response?.status(), path).toBeLessThan(400);
  await expect(page.locator("html"), path).toHaveAttribute("lang", "hi-IN");
  await expect(page.locator("h1").first(), path).toBeVisible();
  await expect(page.getByText("कुछ गड़बड़ हो गई"), path).toHaveCount(0);
  await expect(page.getByText("Something went wrong"), path).toHaveCount(0);
  const text = await page.locator("body").innerText();
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => ENGLISH_RUN.test(l) && !IGNORE.test(l));
  if (lines.length) leftovers[path] = [...new Set(lines)].slice(0, 25);
}

test.afterAll(() => {
  mkdirSync("test-results", { recursive: true });
  writeFileSync("test-results/hindi-leftovers.json", JSON.stringify(leftovers, null, 2));
});

test("every public page renders in Hindi", async ({ page }) => {
  const errors = trackErrors(page);
  await useHindi(page);
  for (const path of PUBLIC_PAGES) await visitInHindi(page, path);
  expect(errors).toEqual([]);
});

test("the language button switches the whole site and remembers it", async ({ page }) => {
  await page.goto("/about");
  await page.getByRole("button", { name: /View in Hindi/ }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "hi-IN");
  await expect(page.getByRole("link", { name: "डोनर बनें" }).first()).toBeVisible();
  await page.goto("/eligibility");
  await expect(page.locator("html")).toHaveAttribute("lang", "hi-IN");
  await page.getByRole("button", { name: /View in English/ }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en-IN");
  await expect(page.getByRole("link", { name: "Become a Donor" }).first()).toBeVisible();
});

for (const [role, email, pages] of [
  ["donor", "donor1@example.test", DONOR_PAGES],
  ["volunteer", "volunteer@example.test", VOLUNTEER_PAGES],
  ["admin", "admin@example.test", ADMIN_PAGES],
] as const) {
  test(`every ${role} page renders in Hindi`, async ({ page }) => {
    const errors = trackErrors(page);
    await login(page, email);
    await useHindi(page);
    for (const path of pages) await visitInHindi(page, path);
    expect(errors).toEqual([]);
  });
}
