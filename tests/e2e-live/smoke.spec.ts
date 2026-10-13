import { expect, test } from "@playwright/test";
import { expectHealthyPage, localSql, login, trackErrors } from "./helpers";
import { ADMIN_PAGES, DONOR_PAGES, VOLUNTEER_PAGES } from "./pages";

test("public pages render live data from the seed", async ({ page }) => {
  // Requests expire after their deadline; keep the seeded sample request current.
  localSql(`update public.blood_requests set status = 'verified', required_by = now() + interval '20 hours'
    where hospital_name = 'Fictional General Hospital [DEV]';`);
  const errors = trackErrors(page);
  await page.goto("/");
  await expect(page.getByText("Registered donors")).toBeVisible();
  await expect(page.getByText("Live figures are not available right now")).toHaveCount(0);
  await page.goto("/blood-requests");
  await expect(page.getByText("Fictional General Hospital [DEV]")).toBeVisible();
  await page.goto("/stories");
  await expect(page.getByText(/Sample — development only/).first()).toBeVisible();
  await page.goto("/impact");
  await expect(page.getByText("Sample Community Camp [DEV]")).toBeVisible();
  expect(errors).toEqual([]);
});

test("staff areas are hidden: no public admin links, 404 when signed out", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('a[href^="/admin"], a[href^="/volunteer"]')).toHaveCount(0);
  await expect(page.getByRole("link", { name: /admin/i })).toHaveCount(0);
  for (const path of ["/admin", "/admin/donors", "/volunteer", "/api/admin/export/donors"]) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(404);
    await expect(page).not.toHaveURL(/\/login/);
  }
  const robots = await (await page.request.get("/robots.txt")).text();
  expect(robots).not.toMatch(/admin|volunteer/);
});

test("administrators sign in through the shared login and land on the admin hub", async ({ page }) => {
  await login(page, "admin@example.test");
  await expect(page).toHaveURL(/\/admin$/);
});

test("every donor page loads for a donor", async ({ page }) => {
  const errors = trackErrors(page);
  await login(page, "donor1@example.test");
  for (const path of DONOR_PAGES) await expectHealthyPage(page, path);
  // Donors are kept out of staff areas.
  for (const path of ["/volunteer", "/admin", "/admin/users"]) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(404);
    await expect(page).toHaveURL(new RegExp(`${path}$`));
  }
  expect(errors).toEqual([]);
});

test("every volunteer page loads for a volunteer, admin pages do not", async ({ page }) => {
  const errors = trackErrors(page);
  await login(page, "volunteer@example.test");
  for (const path of VOLUNTEER_PAGES) await expectHealthyPage(page, path);
  const response = await page.goto("/admin/users");
  expect(response?.status()).toBe(404);
  expect(errors).toEqual([]);
});

test("every admin page loads for an administrator", async ({ page }) => {
  const errors = trackErrors(page);
  await login(page, "admin@example.test");
  for (const path of [...ADMIN_PAGES, ...VOLUNTEER_PAGES]) await expectHealthyPage(page, path);
  expect(errors).toEqual([]);
});
