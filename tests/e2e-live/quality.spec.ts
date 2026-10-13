import { mkdirSync, writeFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { localSqlValue, login } from "./helpers";
import { ADMIN_PAGES, DONOR_PAGES, PUBLIC_PAGES, VOLUNTEER_PAGES } from "./pages";

/*
 * Site quality sweep on a small phone (360 px wide), per role:
 *  - no horizontal scrolling,
 *  - no broken internal links,
 *  - every page has a specific <title> and a meta description,
 *  - images have alt text and load, buttons and links have a name,
 *  - no leftover placeholder text.
 * Softer findings (small tap targets, tiny text) go to
 * test-results/quality-report.json for review.
 */

type Finding = { page: string; issue: string; detail: string };
const findings: Finding[] = [];
const seenLinks = new Map<string, string>(); // href -> first page it was seen on
const PHONE = { width: 360, height: 780 };

async function audit(page: Page, path: string) {
  const response = await page.goto(path);
  expect(response?.status(), path).toBeLessThan(400);
  await page.waitForLoadState("load");

  const result = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const out = {
      scrollWidth: document.documentElement.scrollWidth,
      vw,
      overflowing: [] as string[],
      title: document.title,
      description: document.querySelector('meta[name="description"]')?.getAttribute("content") ?? "",
      links: [] as string[],
      unnamed: [] as string[],
      images: [] as string[],
      placeholder: [] as string[],
      smallTargets: 0,
      smallList: [] as string[],
      tinyText: 0,
      tinyList: [] as string[],
    };
    const describe = (el: Element) => {
      const id = el.id ? `#${el.id}` : "";
      const cls = typeof el.className === "string" ? `.${el.className.trim().split(/\s+/).slice(0, 3).join(".")}` : "";
      const text = (el.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 50);
      return `${el.tagName.toLowerCase()}${id}${cls} "${text}"`;
    };
    // Elements sticking out of the viewport, unless a scroll container clips them on purpose.
    const clipped = (el: Element) => {
      for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
        const s = getComputedStyle(p);
        if (/(auto|scroll|hidden|clip)/.test(s.overflowX)) return true;
      }
      return false;
    };
    for (const el of Array.from(document.body.querySelectorAll("*"))) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const s = getComputedStyle(el);
      if (s.position === "fixed" && s.visibility === "hidden") continue;
      if ((r.right > vw + 1 || r.left < -1) && !clipped(el)) out.overflowing.push(describe(el));
    }
    for (const a of Array.from(document.querySelectorAll("a[href]"))) {
      const href = a.getAttribute("href") ?? "";
      out.links.push(href);
      const name = (a.getAttribute("aria-label") ?? a.textContent ?? "").trim() || a.querySelector("img")?.getAttribute("alt") || "";
      if (!name) out.unnamed.push(`link ${href}`);
    }
    for (const b of Array.from(document.querySelectorAll("button, [role=button]"))) {
      const name = (b.getAttribute("aria-label") ?? b.textContent ?? "").trim() || b.getAttribute("title") || "";
      if (!name) out.unnamed.push(`button ${describe(b)}`);
    }
    for (const img of Array.from(document.querySelectorAll("img"))) {
      if (!img.hasAttribute("alt")) out.images.push(`no alt: ${img.getAttribute("src")}`);
      else if (img.complete && img.naturalWidth === 0) out.images.push(`broken: ${img.getAttribute("src")}`);
    }
    const text = document.body.innerText;
    for (const word of ["lorem ipsum", "todo", "tbd", "coming soon", "placeholder", "xxx", "undefined", "null", "NaN", "[object Object]"]) {
      const re = new RegExp(`(^|[^a-z])${word.replace(/[[\]]/g, "\\$&")}([^a-z]|$)`, "i");
      // Seeded sample data is marked "(Fictional)" or "[DEV]" and never exists in production.
      const line = text.split("\n").find((l) => re.test(l) && !/\(Fictional\)|\[DEV\]/.test(l));
      if (line) out.placeholder.push(`${word}: ${line.trim().slice(0, 80)}`);
    }
    const ignorable = (el: Element) => el.closest(".sr-only, nextjs-portal, [data-nextjs-toast]") !== null;
    for (const el of Array.from(document.querySelectorAll("a, button, input, select, textarea, [role=button]"))) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0 || ignorable(el)) continue;
      // A checkbox or radio inside its label: the whole label is the tap target.
      if (el.tagName === "INPUT" && el.closest("label")) continue;
      const inline = el.tagName === "A" && getComputedStyle(el).display === "inline";
      if (!inline && (r.height < 36 || r.width < 36)) {
        out.smallTargets++;
        out.smallList.push(`${describe(el)} ${Math.round(r.width)}x${Math.round(r.height)}`);
      }
    }
    for (const el of Array.from(document.querySelectorAll("p, span, li, a, label, dd, dt"))) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || ignorable(el)) continue;
      if (el.children.length === 0 && (el.textContent ?? "").trim() && parseFloat(getComputedStyle(el).fontSize) < 11) {
        out.tinyText++;
        out.tinyList.push(describe(el));
      }
    }
    return out;
  });

  if (result.scrollWidth > result.vw + 1) {
    findings.push({ page: path, issue: "horizontal-scroll", detail: `${result.scrollWidth}px wide on a ${result.vw}px screen: ${result.overflowing.slice(0, 5).join(" | ")}` });
  }
  if (!result.title || result.title === "Rakt Response" || !result.title.includes("Rakt Response")) {
    findings.push({ page: path, issue: "title", detail: result.title || "(none)" });
  }
  if (result.description.length < 40) findings.push({ page: path, issue: "meta-description", detail: result.description || "(none)" });
  for (const u of result.unnamed) findings.push({ page: path, issue: "no-accessible-name", detail: u });
  for (const i of result.images) findings.push({ page: path, issue: "image", detail: i });
  for (const p of result.placeholder) findings.push({ page: path, issue: "placeholder-text", detail: p });
  if (result.smallTargets) findings.push({ page: path, issue: "small-tap-targets (report only)", detail: result.smallList.join(" | ") });
  if (result.tinyText) findings.push({ page: path, issue: "tiny-text (report only)", detail: result.tinyList.join(" | ") });
  for (const href of result.links) if (!seenLinks.has(href)) seenLinks.set(href, path);
}

async function checkLinks(page: Page) {
  for (const [href, from] of seenLinks) {
    if (!href.startsWith("/") || href.startsWith("//") || href.startsWith("/auth/signout")) continue;
    const res = await page.request.get(href, { maxRedirects: 5 });
    if (res.status() >= 400) findings.push({ page: from, issue: "broken-link", detail: `${href} → ${res.status()}` });
  }
  seenLinks.clear();
}

test.afterAll(() => {
  mkdirSync("test-results", { recursive: true });
  writeFileSync("test-results/quality-report.json", JSON.stringify(findings, null, 2));
});

const hard = (f: Finding) => !f.issue.includes("report only");

// Each sweep visits every page of a role and requests every link it found.
test.describe.configure({ timeout: 600_000 });

test("public pages pass the quality sweep on a phone", async ({ page }) => {
  await page.setViewportSize(PHONE);
  const story = localSqlValue("select slug from public.impact_stories where status = 'published' and slug is not null limit 1;");
  const request = localSqlValue("select id from public.blood_requests where status in ('verified','in_coordination') and public_listing_consent limit 1;");
  const extra = [story && `/stories/${story}`, request && `/blood-requests/${request}`].filter(Boolean) as string[];
  for (const path of [...PUBLIC_PAGES, ...extra]) await audit(page, path);
  await checkLinks(page);
  expect(findings.filter(hard), JSON.stringify(findings.filter(hard), null, 2)).toEqual([]);
});

for (const [role, email, pages] of [
  ["donor", "donor1@example.test", DONOR_PAGES],
  ["volunteer", "volunteer@example.test", VOLUNTEER_PAGES],
  ["admin", "admin@example.test", ADMIN_PAGES],
] as const) {
  test(`${role} pages pass the quality sweep on a phone`, async ({ page }) => {
    await login(page, email);
    await page.setViewportSize(PHONE);
    const extra: string[] = [];
    if (role === "volunteer") {
      const id = localSqlValue("select id from public.blood_requests order by created_at desc limit 1;");
      if (id) extra.push(`/volunteer/requests/${id}`);
    }
    if (role === "admin") {
      const donor = localSqlValue("select id from auth.users where email = 'donor1@example.test';");
      const story = localSqlValue("select id from public.impact_stories order by created_at desc limit 1;");
      if (donor) extra.push(`/admin/donors/${donor}`);
      if (story) extra.push(`/admin/stories/${story}`);
    }
    const before = findings.length;
    for (const path of [...pages, ...extra]) await audit(page, path);
    await checkLinks(page);
    const mine = findings.slice(before).filter(hard);
    expect(mine, JSON.stringify(mine, null, 2)).toEqual([]);
  });
}
