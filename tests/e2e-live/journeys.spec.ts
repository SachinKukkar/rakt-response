import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { PASSWORD, latestEmailLink, localSql, localSqlValue, login, logout, trackErrors } from "./helpers";

/*
 * End-to-end journeys across roles on a local Supabase stack. Each run uses a
 * unique email so it can be repeated without resetting the database.
 */
const RUN = Date.now().toString(36);
const NEW_DONOR = `newdonor-${RUN}@example.test`;
const HOSPITAL = `Live Test Hospital ${RUN}`;
const CENTRE = `Live Test Blood Bank ${RUN}`;
/** A datetime-local value (India time) `hours` from now. */
const inHours = (hours: number) => new Date(Date.now() + (hours + 5.5) * 3600_000).toISOString().slice(0, 16);

test.describe.configure({ mode: "serial" });

test.beforeAll(() => {
  // Previous runs may have used today's request allowance for the test accounts.
  localSql(`delete from public.rate_limits;
    delete from auth.users where email like 'newdonor-%@example.test';
    delete from public.blood_requests where hospital_name like 'Live %';`);
});

async function registerDonor(page: Page, email: string) {
  await page.goto("/register");
  await page.locator("#full_name").fill("Live Test Donor");
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(PASSWORD);
  await page.locator("#confirm_password").fill(PASSWORD);
  await page.locator("#accept_terms").check();
  await page.getByRole("button", { name: /Continue/ }).click();

  await page.locator('input[name="blood_group"][value="O+"]').locator("..").click();
  await page.locator("#age_confirmed").check();
  await page.getByText("I donate regularly").click();
  await page.locator("#display_name").fill("Live D.");
  await page.locator("#phone").fill("98111 22334");
  await page.locator("#preferred_contact_method").selectOption("whatsapp");
  await page.getByRole("button", { name: /Continue/ }).click();

  await page.locator("#state").selectOption("Maharashtra");
  // Searchable district and town lists for the chosen state.
  await page.locator("#district").fill("pun");
  await page.getByRole("option", { name: "Pune", exact: true }).click();
  await page.locator("#city").fill("pune ci");
  await page.getByRole("option", { name: /^Pune City/ }).click();
  await expect(page.locator("#pincode")).toHaveValue("411002"); // filled from the post office
  await page.locator("#locality").fill("Baner");
  await page.locator("#pincode").fill("411045");
  await page.getByRole("button", { name: /Continue/ }).click();

  await page.getByText("I have donated before").click();
  await page.locator("#d-date-0").fill("2026-02-10");
  await page.locator("#d-centre-0").fill(CENTRE);
  await page.getByRole("button", { name: /Continue/ }).click();

  // No separate consent step: one switch on the review screen, on by default.
  await expect(page.getByRole("heading", { name: "Review & confirm" })).toBeVisible();
  await expect(page.locator("#reachable")).toBeChecked();
  await page.getByRole("button", { name: /Register/ }).click();
  await expect(page).toHaveURL(/\/verify-email/, { timeout: 30_000 });
}

test("a new donor registers, confirms their email and lands on the dashboard", async ({ page }) => {
  const errors = trackErrors(page);
  await registerDonor(page, NEW_DONOR);
  // Unconfirmed accounts cannot sign in.
  await page.goto("/login");
  await page.locator("#email").fill(NEW_DONOR);
  await page.locator("#password").fill(PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByText(/confirm your email/i)).toBeVisible();
  await expect(page.getByRole("link", { name: "Resend the verification email" })).toBeVisible();

  const link = await latestEmailLink(NEW_DONOR, "/auth/");
  await page.goto(link);
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 30_000 });
  await expect(page.getByText("Welcome to Rakt Response")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Live D." })).toBeVisible();

  await page.goto("/profile");
  await expect(page.getByText("+91 98111 22334")).toBeVisible();
  await expect(page.getByText("Baner")).toBeVisible();
  // Confirming the email verifies the donor.
  await expect(page.getByRole("heading", { name: "Email verified" })).toBeVisible();
  await expect(page.getByText("Verified donor")).toBeVisible();
  await expect(page.getByRole("link", { name: "Share your story" })).toBeVisible();

  await page.goto("/profile/edit");
  await page.locator("#bio").fill("My dad needed blood once. Now I give back.");
  await page.getByRole("button", { name: "Save details" }).click();
  await expect(page.getByText("Profile updated.")).toBeVisible();
  await page.goto("/profile");
  await expect(page.getByText("My dad needed blood once. Now I give back.")).toBeVisible();
  await page.goto("/donations");
  await expect(page.getByText(CENTRE)).toBeVisible();
  await expect(page.getByText("Self-reported · pending").first()).toBeVisible();
  expect(errors).toEqual([]);
});

test("donors record donations, get duplicate warnings and manage consent", async ({ page }) => {
  await login(page, NEW_DONOR);
  await page.goto("/donations/new");
  await page.getByText("SDP (single donor platelets)").click();
  await page.locator("#donation_date").fill("2026-06-01");
  await page.locator("#centre_name").fill("Live Apheresis Unit");
  await page.getByRole("button", { name: "Save donation" }).click();
  await expect(page).toHaveURL(/\/donations$/);
  await expect(page.getByText("Live Apheresis Unit")).toBeVisible();

  await page.goto("/donations/new");
  await page.getByText("SDP (single donor platelets)").click();
  await page.locator("#donation_date").fill("2026-06-03");
  await page.locator("#centre_name").fill("Live Apheresis Unit");
  await page.getByRole("button", { name: "Save donation" }).click();
  await expect(page.getByText("This might be a duplicate")).toBeVisible();
  await page.getByRole("button", { name: /separate donation/ }).click();
  await expect(page).toHaveURL(/\/donations$/);

  await page.goto("/settings");
  await page.locator("#pref-emergency_alerts").uncheck();
  await page.getByRole("button", { name: "Save my choices" }).click();
  await expect(page.getByText("Your choices were saved.")).toBeVisible();
  await page.reload();
  await expect(page.locator("#pref-emergency_alerts")).not.toBeChecked();
  await expect(page.getByText(/Request alerts: withdrawn/)).toBeVisible();
  await page.locator("#pref-emergency_alerts").check();
  await page.getByRole("button", { name: "Save my choices" }).click();
  await expect(page.getByText("Your choices were saved.")).toBeVisible();
});

test("a member submits a blood request; it stays private until verified", async ({ page }) => {
  await login(page, "member@example.test");
  await page.goto("/blood-requests/new");
  await page.locator('input[name="blood_group"][value="O+"]').locator("..").click();
  await page.locator("#required_by").fill(inHours(24));
  await page.locator("#hospital_name").fill(HOSPITAL);
  await page.locator("#city").fill("Pune");
  await page.locator("#district").fill("Pune");
  await page.locator("#requester_phone").fill("9822001122");
  await page.locator("#public_listing_consent").check();
  await page.locator("#acknowledge_limits").check();
  await page.getByRole("button", { name: /Submit request/ }).click();
  await expect(page.getByText("Request received")).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText(/RR-\d{6}-[0-9A-F]{5}/)).toBeVisible();

  await page.goto("/requests");
  await expect(page.getByText(HOSPITAL)).toBeVisible();
  await logout(page);
  await page.goto("/blood-requests");
  await expect(page.getByText(HOSPITAL)).toHaveCount(0);
});

test("anonymous visitors can submit a request too (rate limited server-side)", async ({ page }) => {
  localSql("delete from public.rate_limits where key like 'anon:%';");
  await page.goto("/blood-requests/new");
  await page.locator('input[name="blood_group"][value="B-"]').locator("..").click();
  await page.locator("#required_by").fill(inHours(30));
  await page.locator("#hospital_name").fill(`${HOSPITAL} Anon`);
  await page.locator("#city").fill("Mumbai");
  await page.locator("#district").fill("Mumbai");
  await page.locator("#requester_name").fill("Anonymous Live Tester");
  await page.locator("#requester_phone").fill("9822003344");
  await page.locator("#acknowledge_limits").check();
  await page.getByRole("button", { name: /Submit request/ }).click();
  await expect(page.getByText("Request received")).toBeVisible({ timeout: 30_000 });
});

test("a volunteer verifies the request, alerted donors respond, contact needs consent", async ({ page }) => {
  await login(page, "volunteer@example.test");
  await page.goto("/volunteer/requests?tab=verify");
  await page.getByRole("link", { name: new RegExp(HOSPITAL) }).first().click();
  await expect(page.getByText("Requester (private)")).toBeVisible();
  await page.getByRole("button", { name: "I'll coordinate this" }).click();
  await expect(page.getByRole("region", { name: "Volunteers coordinating" }).getByText(/Vidya/)).toBeVisible();
  await page.locator('select[name="status"]').selectOption("verified");
  await page.getByRole("button", { name: "Update status" }).click();
  await expect(page.getByText("Status updated.")).toBeVisible();
  const requestUrl = page.url();

  // Matching donors are shown without contact details until requested.
  await page.reload();
  await expect(page.getByRole("heading", { name: "Matching donors" })).toBeVisible();
  const card = page.locator("li", { hasText: "Live D." }).first();
  await expect(card).toBeVisible();
  await expect(page.getByText("98111")).toHaveCount(0);
  await card.getByRole("button", { name: "View contact details" }).click();
  await expect(card.getByRole("link", { name: /Call \+91 98111 22334/ })).toHaveAttribute("href", "tel:+919811122334");
  await expect(card.getByRole("link", { name: "WhatsApp" })).toHaveAttribute("href", /wa\.me\/919811122334/);
  await card.getByRole("button", { name: "Log a contact attempt" }).click();
  await expect(card.getByText("Contact attempt logged.")).toBeVisible();

  // A donor without standing contact consent can only be asked.
  const quiet = page.locator("li", { hasText: "Meera S." }).first();
  if (await quiet.count()) await expect(quiet.getByRole("button", { name: "View contact details" })).toBeVisible();

  // The verified request is now public (without requester details).
  await logout(page);
  await page.goto("/blood-requests");
  await expect(page.getByText(HOSPITAL).first()).toBeVisible();
  await expect(page.getByText("9822001122")).toHaveCount(0);

  // The alerted donor sees it and responds.
  await login(page, NEW_DONOR);
  await page.goto("/notifications");
  await expect(page.getByText(/Verified O\+ whole blood request in Pune/).first()).toBeVisible();
  await page.goto("/requests");
  const match = page.locator("li", { hasText: HOSPITAL }).first();
  await match.getByRole("button", { name: "I can help" }).click();
  await expect(match.getByText(/A volunteer will be in touch/)).toBeVisible();

  // The volunteer sees the interest and closes the request honestly.
  await logout(page);
  await login(page, "volunteer@example.test");
  await page.goto(requestUrl);
  await expect(page.locator("li", { hasText: "Live D." }).first().locator("span", { hasText: /^Interested$/ })).toBeVisible();
  await page.locator('select[name="status"]').selectOption("fulfilled");
  await page.locator('input[name="reason"]').first().fill("Hospital blood bank confirmed two donations");
  await page.getByRole("button", { name: "Update status" }).click();
  await expect(page.getByText("Status updated.")).toBeVisible();
});

test("contact requests: a volunteer asks, the donor accepts, then contact is visible", async ({ page }) => {
  // Seeded donor3 is in the directory but has not given standing contact consent.
  const sdpHospital = `Live SDP Centre ${RUN}`;
  localSql(`insert into public.blood_requests (requester_name, requester_phone, blood_group, request_type, hospital_name, district, city, required_by, urgency, status)
    values ('Live Requester (Fictional)', '+919822005566', 'B-', 'sdp', '${sdpHospital}', 'Mumbai Suburban', 'Mumbai', now() + interval '1 day', 'critical', 'submitted');`);
  await login(page, "volunteer@example.test");
  await page.goto("/volunteer/requests?tab=verify");
  await page.getByRole("link", { name: new RegExp(sdpHospital) }).first().click();
  await page.locator('select[name="status"]').selectOption("verified");
  await page.getByRole("button", { name: "Update status" }).click();
  await expect(page.getByText("Status updated.")).toBeVisible();
  await page.reload();
  // Sana has no display name, so volunteers see only her neutral code.
  const sanaLabel = localSqlValue(
    "select 'Donor #' || upper(left(replace(id::text, '-', ''), 4)) from auth.users where email = 'donor3@example.test';",
  );
  await expect(page.getByText("Sana")).toHaveCount(0);
  const donor = page.locator("li", { hasText: sanaLabel }).first();
  await expect(donor.getByRole("button", { name: "View contact details" })).toHaveCount(0);
  await donor.getByRole("button", { name: "Ask for permission to contact" }).click();
  await donor.locator("textarea[name=message]").fill("Platelets needed tomorrow morning.");
  await donor.getByRole("button", { name: "Send contact request" }).click();
  await expect(donor.getByText("Contact request sent — waiting for the donor.")).toBeVisible();
  const requestUrl = page.url();

  await logout(page);
  await login(page, "donor3@example.test");
  await page.goto("/requests");
  await expect(page.getByText("Contact requests waiting for you")).toBeVisible();
  await page.locator("li", { hasText: sdpHospital }).getByRole("button", { name: "Share my contact details" }).click();
  await expect(page.locator("li", { hasText: sdpHospital }).getByText("You shared contact details")).toBeVisible();

  await logout(page);
  await login(page, "volunteer@example.test");
  await page.goto(requestUrl);
  const accepted = page.locator("li", { hasText: sanaLabel }).first();
  await accepted.getByRole("button", { name: "View contact details" }).click();
  await expect(accepted.getByRole("link", { name: /Call/ })).toHaveAttribute("href", "tel:+919000000103");
});

test("volunteers verify donation records; donors see the verified badge", async ({ page }) => {
  await login(page, "volunteer@example.test");
  await page.goto("/volunteer/donations");
  const record = page.locator("li", { hasText: CENTRE }).first();
  await record.getByRole("button", { name: "Verify" }).click();
  await expect(page.locator("li", { hasText: CENTRE })).toHaveCount(0); // leaves the pending queue
  await logout(page);
  await login(page, NEW_DONOR);
  await page.goto("/donations");
  await expect(page.locator("li", { hasText: CENTRE }).getByText("Volunteer-verified")).toBeVisible();
});

test("stories: submit with photo, moderate, publish, then withdraw", async ({ page }) => {
  const title = `Live story ${RUN}`;
  await login(page, NEW_DONOR);
  await page.goto("/share-your-story");
  await page.locator("#public_display_name").fill("Live D.");
  await page.locator("#city").fill("Pune");
  await page.getByRole("button", { name: /Continue/ }).click();
  await page.locator("#title").fill(title);
  await page.locator("#body").fill(
    "This is an automated end-to-end test story. It checks that stories stay private until an administrator publishes them, and that withdrawal removes them.",
  );
  await page.getByRole("button", { name: /Continue/ }).click();
  await page.locator('input[type="file"]').setInputFiles(path.resolve("public/icons/icon-192.png"));
  await expect(page.getByAltText("Selected photo preview")).toBeVisible();
  for (const id of ["consent_publish", "consent_show_name", "consent_show_photo", "rights_confirmed"]) await page.locator(`#${id}`).check();
  await page.getByRole("button", { name: /Continue/ }).click();
  await expect(page.getByText("This is how your story would appear")).toBeVisible();
  await page.getByRole("button", { name: /Submit for review/ }).click();
  await expect(page.getByText("Thank you for sharing your story")).toBeVisible({ timeout: 30_000 });

  await logout(page);
  await page.goto("/stories");
  await expect(page.getByText(title)).toHaveCount(0);

  await login(page, "admin@example.test");
  await page.goto("/admin/stories");
  await page.getByRole("link", { name: new RegExp(title) }).click();
  const decide = async (status: string) => {
    await page.locator('select[name="status"]').selectOption(status);
    await page.getByRole("button", { name: "Apply decision" }).click();
    await expect(page.getByText("Story status updated.")).toBeVisible();
    await page.reload();
  };
  await decide("under_review");
  await page.getByRole("button", { name: "Approve photo for publication" }).click();
  await expect(page.getByText(/Photo approved for publication/)).toBeVisible();
  await page.reload();
  await page.locator('input[name="show_photo"]').check();
  await page.getByRole("button", { name: "Save presentation" }).click();
  await expect(page.getByText(/Public presentation saved/)).toBeVisible();
  await page.reload();
  await page.locator('input[name="experience_reviewed"]').check();
  await page.getByRole("button", { name: "Save labels" }).click();
  await expect(page.getByText("Verification labels updated.")).toBeVisible();
  await page.reload();
  await decide("approved");
  await decide("published");

  await logout(page);
  await page.goto("/stories");
  const card = page.locator("article", { hasText: title });
  await expect(card).toBeVisible();
  await expect(card.getByText("Experience Reviewed")).toBeVisible();
  await card.getByRole("link", { name: /Read story/ }).click();
  const photo = page.getByAltText("Photo shared by the contributor");
  await expect(photo).toBeVisible();
  const photoSrc = await photo.getAttribute("src");

  await login(page, NEW_DONOR);
  await page.goto("/share-your-story/submissions");
  page.once("dialog", (d) => d.accept());
  await page.getByText("Manage this story").first().click();
  await page.getByRole("button", { name: "Withdraw story" }).first().click();
  await expect(page.getByText(/Withdrawn on .* It is not public./).first()).toBeVisible();

  await logout(page);
  await page.goto("/stories");
  await expect(page.getByText(title)).toHaveCount(0);
  if (photoSrc) {
    const original = new URL(photoSrc, "http://localhost:3000").searchParams.get("url") ?? photoSrc;
    const res = await page.request.get(original);
    expect(res.status()).toBeGreaterThanOrEqual(400); // public photo removed from storage
  }
});

test("password reset by email", async ({ page }) => {
  await page.goto("/forgot-password");
  await page.locator("#email").fill(NEW_DONOR);
  await page.getByRole("button", { name: "Send reset link" }).click();
  await expect(page.getByText(/reset link is on its way/)).toBeVisible();
  const link = await latestEmailLink(NEW_DONOR, "type=recovery");
  await page.goto(link);
  await expect(page).toHaveURL(/\/reset-password/, { timeout: 30_000 });
  await page.locator("#password").fill("NewPass#2026x");
  await page.locator("#confirm_password").fill("NewPass#2026x");
  await page.getByRole("button", { name: "Update password" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
  await logout(page);
  await login(page, NEW_DONOR, "NewPass#2026x");
});

test("admins manage roles, verify donors, export, and process deletion", async ({ page }) => {
  await login(page, "admin@example.test");
  // Admins see their donor tabs plus one Admin hub, not a separate volunteer area.
  const tabs = page.getByRole("navigation", { name: "Primary" });
  await expect(tabs.getByRole("link", { name: "Admin" })).toBeVisible();
  await expect(tabs.getByRole("link", { name: "Volunteer" })).toHaveCount(0);
  await page.goto("/admin");
  await expect(page.getByRole("link", { name: "Coordinate requests" }).first()).toBeVisible();

  // Admins can correct a donor's details (recorded in the audit log).
  await page.goto(`/admin/users?q=${encodeURIComponent(NEW_DONOR)}`);
  await page.getByRole("link", { name: /Live Test Donor/ }).click();
  await page.getByText("Edit donor details").click();
  await page.locator('input[name="locality"]').fill("Aundh");
  await page.getByRole("button", { name: "Save details" }).click();
  await expect(page.getByText("Donor details saved.")).toBeVisible();
  await page.goto(`/admin/users?q=${encodeURIComponent(NEW_DONOR)}`);
  await page.goto(`/admin/users?q=${encodeURIComponent(NEW_DONOR)}`);
  await page.getByText("Make volunteer or admin").click();
  await page.getByRole("button", { name: "Grant role" }).click();
  await expect(page.getByText("Role saved.")).toBeVisible();

  await page.goto("/admin/volunteers");
  // Administrators see full names (volunteers would see the display name).
  await expect(page.getByText("Live Test Donor").first()).toBeVisible();

  const download = page.waitForEvent("download");
  await page.goto("/admin/analytics");
  await page.getByRole("link", { name: "Donor summary" }).click();
  const csv = await (await download).path();
  expect(csv).toBeTruthy();

  await page.goto("/admin/audit-logs?action=export");
  await expect(page.getByText("export.donors_csv").first()).toBeVisible();
  await page.goto("/admin/audit-logs?action=donor_contact");
  await expect(page.getByText("donor_contact.revealed").first()).toBeVisible();

  // The new donor asks for deletion; the admin anonymises.
  await logout(page);
  await login(page, NEW_DONOR, "NewPass#2026x");
  await page.goto("/settings");
  page.once("dialog", (d) => d.accept());
  await page.locator("#confirm").fill("DELETE");
  await page.getByRole("button", { name: "Request account deletion" }).click();
  await expect(page.getByText(/Deletion requested/).first()).toBeVisible();

  await logout(page);
  await login(page, "admin@example.test");
  await page.goto("/admin/donors?filter=deletion");
  await page.getByRole("link", { name: /Live Test Donor/ }).click();
  await page.getByText("Process deletion / anonymise").click();
  await page.locator('input[name="confirm"]').fill("ANONYMISE");
  await page.getByRole("button", { name: "Anonymise account" }).click();
  await expect(page.getByRole("heading", { name: "Deleted member" })).toBeVisible();

  await logout(page);
  await page.goto("/login");
  await page.locator("#email").fill(NEW_DONOR);
  await page.locator("#password").fill("NewPass#2026x");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(page).toHaveURL(/\/login/);
});
