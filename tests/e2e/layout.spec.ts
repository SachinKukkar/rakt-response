import { expect, test } from "@playwright/test";

const PUBLIC_PAGES = [
  "/",
  "/about",
  "/learn",
  "/why-donate",
  "/donation-types",
  "/eligibility",
  "/donation-process",
  "/faq",
  "/contact",
  "/privacy",
  "/terms",
  "/blood-requests",
  "/blood-requests/new",
  "/impact",
  "/stories",
  "/share-your-story",
  "/login",
  "/register",
  "/forgot-password",
  "/verify-email",
];

for (const path of PUBLIC_PAGES) {
  test(`${path} renders with Rakt Response branding and no horizontal scroll`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(/Rakt Response/);
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.getByAltText("Rakt Response Team logo").first()).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
}

test("never uses another platform name", async ({ page }) => {
  for (const path of ["/", "/about", "/privacy"]) {
    await page.goto(path);
    const text = (await page.locator("body").innerText()).toLowerCase();
    expect(text).not.toContain("raktsetu");
    expect(text).not.toContain("raktconnect");
  }
});

test("interactive controls have at least ~44px touch targets on the homepage", async ({ page }) => {
  await page.goto("/");
  const small = await page.evaluate(() =>
    [...document.querySelectorAll("main a.inline-flex, main button, header button")]
      .map((el) => el.getBoundingClientRect())
      .filter((r) => r.width > 0 && r.height > 0 && r.height < 40).length,
  );
  expect(small).toBe(0);
});
