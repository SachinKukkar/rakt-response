import { expect, test } from "@playwright/test";

test.describe("homepage", () => {
  test("shows the mission, CTAs and honest statistics", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Every Donor Matters");
    await expect(page.getByRole("link", { name: /Become a Donor/ }).first()).toHaveAttribute("href", "/register");
    await expect(page.getByRole("link", { name: "Find Blood" }).first()).toHaveAttribute("href", "/blood-requests");
    for (const section of ["How Rakt Response works", "Why blood donation matters", "Types of donation", "Blood groups", "Community impact"]) {
      await expect(page.getByRole("heading", { name: section })).toBeVisible();
    }
    // Without a database no numbers are invented.
    await expect(page.getByText("Live figures are not available right now")).toBeVisible();
    for (const group of ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]) {
      await expect(page.getByRole("img", { name: `Blood group ${group}` }).first()).toBeAttached();
    }
  });

  test("mobile menu opens and navigates", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("link", { name: "Eligibility" }).click();
    await expect(page).toHaveURL(/\/eligibility$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});

test.describe("registration wizard", () => {
  test("validates each step before moving on", async ({ page }) => {
    await page.goto("/register");
    await page.getByRole("button", { name: /Continue/ }).click();
    await expect(page.getByText("Please enter at least 2 characters")).toBeVisible();
    await expect(page.getByText("Enter a valid email address")).toBeVisible();
    await expect(page.getByText("You need to accept the privacy policy and terms to continue")).toBeVisible();

    await page.locator("#full_name").fill("Test Person");
    await page.locator("#email").fill("person@example.test");
    await page.locator("#password").fill("weakpass");
    await page.locator("#confirm_password").fill("weakpass");
    await page.locator("#accept_terms").check();
    await page.getByRole("button", { name: /Continue/ }).click();
    await expect(page.getByText("Include at least one letter and one number")).toBeVisible();

    await page.locator("#password").fill("Stronger1");
    await page.locator("#confirm_password").fill("Stronger1");
    await page.getByRole("button", { name: /Continue/ }).click();
    await expect(page.getByRole("heading", { name: "About you as a donor" })).toBeVisible();
    await expect(page.getByText("Step 2 of 6")).toBeVisible();

    // Donor details are required for donors…
    await page.getByRole("button", { name: /Continue/ }).click();
    await expect(page.getByText("Choose your blood group")).toBeVisible();
    // …but members who only want to request blood skip donor-only steps.
    await page.getByText("I want to request blood or share a story").click();
    await expect(page.getByText("Step 2 of 4")).toBeVisible();
  });

  test("consent choices are separate and default to off", async ({ page }) => {
    await page.goto("/register");
    await page.locator("#full_name").fill("Test Person");
    await page.locator("#email").fill("person@example.test");
    await page.locator("#password").fill("Stronger1");
    await page.locator("#confirm_password").fill("Stronger1");
    await page.locator("#accept_terms").check();
    await page.getByRole("button", { name: /Continue/ }).click();

    await page.locator('input[name="blood_group"][value="O+"]').locator("..").click();
    await expect(page.getByRole("radio", { name: "O+" })).toBeChecked();
    await page.getByText("I confirm I am between 18 and 65 years old").click();
    await page.getByText("I donate regularly").click();
    await page.getByRole("button", { name: /Continue/ }).click();

    await page.locator("#state").selectOption("Maharashtra");
    await page.locator("#district").fill("Pune");
    await page.locator("#city").fill("Pune");
    await page.getByRole("button", { name: /Continue/ }).click();
    await page.getByRole("button", { name: /Continue/ }).click(); // history: none

    await expect(page.getByRole("heading", { name: "Availability & consent" })).toBeVisible();
    for (const label of ["directory_visible", "contact_consent", "open_to_contact", "emergency_alerts", "show_donation_summary"]) {
      await expect(page.locator(`#${label}`)).not.toBeChecked();
    }
    await page.getByRole("button", { name: /Continue/ }).click();
    await expect(page.getByRole("heading", { name: "Review & confirm" })).toBeVisible();
    await expect(page.getByText("Visible in volunteer directory")).toBeVisible();

    // Submitting without a configured database fails safely with a clear message.
    await page.getByRole("button", { name: /Register/ }).click();
    await expect(page.getByRole("alert").filter({ hasText: /not been configured|not available/ })).toBeVisible();
  });
});

test.describe("authentication and access control", () => {
  test("login shows a clear message when accounts are unavailable", async ({ page }) => {
    await page.goto("/login");
    await page.locator("#email").fill("someone@example.test");
    await page.locator("#password").fill("whatever1");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByRole("alert").filter({ hasText: /not available yet/ })).toBeVisible();
  });

  for (const path of ["/dashboard", "/profile", "/donations/new", "/requests", "/settings", "/volunteer", "/volunteer/donors", "/admin", "/admin/audit-logs", "/share-your-story/submissions"]) {
    test(`${path} is not reachable without signing in`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(/\/login/);
    });
  }

  test("CSV exports are forbidden without staff permissions", async ({ request }) => {
    const response = await request.get("/api/admin/export/donors", { maxRedirects: 0 });
    expect([302, 303, 307, 403]).toContain(response.status());
  });

  test("sign-out only accepts POST", async ({ request }) => {
    const response = await request.get("/auth/signout", { maxRedirects: 0 });
    expect(response.status()).toBe(405);
  });
});

test.describe("blood requests and stories", () => {
  test("public request page explains limits and offers a request form", async ({ page }) => {
    await page.goto("/blood-requests");
    await expect(page.getByText("In an emergency, contact the hospital first")).toBeVisible();
    await page.getByRole("link", { name: /Submit a request/ }).click();
    await expect(page).toHaveURL(/\/blood-requests\/new/);
    await expect(page.getByText("First, contact the hospital blood bank")).toBeVisible();
  });

  test("story submission requires an account and explains privacy", async ({ page }) => {
    await page.goto("/share-your-story");
    await expect(page.getByText("Private until an administrator approves it")).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign in" }).first()).toBeVisible();
  });

  test("stories page shows category filters and an honest empty state", async ({ page }) => {
    await page.goto("/stories?category=hope");
    await expect(page.getByRole("link", { name: "Stories of Hope" })).toHaveAttribute("aria-current", "page");
    await expect(page.getByText("What do the verification labels mean?")).toBeVisible();
  });

  test("unknown pages show a friendly 404", async ({ page }) => {
    const response = await page.goto("/this-page-does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "We couldn't find that page" })).toBeVisible();
  });
});

test.describe("platform", () => {
  test("sends security headers", async ({ request }) => {
    const response = await request.get("/");
    const headers = response.headers();
    expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["x-powered-by"]).toBeUndefined();
  });

  test("serves an installable PWA manifest with the official logo icons", async ({ request }) => {
    const response = await request.get("/manifest.webmanifest");
    const manifest = await response.json();
    expect(manifest.name).toBe("Rakt Response");
    expect(manifest.icons.map((i: { sizes: string }) => i.sizes)).toEqual(expect.arrayContaining(["192x192", "512x512"]));
    const sw = await request.get("/sw.js");
    expect(await sw.text()).toContain("never caches HTML of private pages");
  });

  test("robots.txt keeps private areas out of search engines", async ({ request }) => {
    const text = await (await request.get("/robots.txt")).text();
    for (const path of ["/admin", "/volunteer", "/dashboard"]) expect(text).toContain(`Disallow: ${path}`);
  });
});
