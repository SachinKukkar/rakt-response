/**
 * Builds the link preview shown by WhatsApp, Facebook and X (public/images/share-card.jpg,
 * 1200 × 630) from the logo badge, the hero photo and the homepage headline.
 * Renders an HTML card in a local browser (Playwright), so it needs network access for
 * the Geist fonts.
 *   npm run share-card
 * Set PLAYWRIGHT_CHANNEL=msedge (or chrome) to use an installed browser.
 */
import { readFileSync } from "node:fs";
import { chromium } from "@playwright/test";

const dataUri = (path, type) => `data:${type};base64,${readFileSync(path).toString("base64")}`;
const logo = dataUri("public/brand/logo.png", "image/png");
const photo = dataUri("public/images/photos/hero-donor-nurse.jpg", "image/jpeg");

const html = `<!doctype html>
<html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@500;700;800&family=Geist+Mono:wght@500&display=block" rel="stylesheet">
<style>
  * { margin: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; overflow: hidden; background: #990000; font-family: Geist, sans-serif; }
  .photo { position: absolute; inset: 0 0 0 auto; width: 760px; background: url(${photo}) 70% 40% / cover; }
  .fade { position: absolute; inset: 0; background: linear-gradient(90deg, #990000 0%, #990000 38%, rgba(153,0,0,0.82) 52%, rgba(153,0,0,0) 74%); }
  .copy { position: absolute; left: 64px; top: 56px; width: 560px; }
  .pill { display: inline-flex; align-items: center; gap: 14px; padding: 8px 26px 8px 8px; border-radius: 999px; background: #f4f3ef; }
  .pill img { width: 72px; height: 72px; border-radius: 50%; }
  .pill span { color: #990000; font-weight: 800; font-size: 22px; letter-spacing: 0.06em; text-transform: uppercase; }
  h1 { margin-top: 56px; color: #fff; font-weight: 500; font-size: 76px; line-height: 1; letter-spacing: -0.03em; }
  .card { margin-top: 26px; display: inline-block; padding: 14px 24px 18px; border-radius: 20px; background: #f4f3ef; color: #c62a2a; font-weight: 500; font-size: 44px; line-height: 1.1; letter-spacing: -0.02em; }
  .meta { position: absolute; left: 64px; bottom: 56px; color: rgba(244,243,239,0.85); font: 500 16px "Geist Mono", monospace; letter-spacing: 0.12em; text-transform: uppercase; }
  .url { position: absolute; right: 64px; bottom: 52px; padding: 10px 18px; border-radius: 999px; background: rgba(29,11,14,0.55); color: #f4f3ef; font: 500 16px "Geist Mono", monospace; }
</style></head>
<body>
  <div class="photo"></div><div class="fade"></div>
  <div class="copy">
    <div class="pill"><img src="${logo}" alt=""><span>Rakt Response</span></div>
    <h1>Every donor<br>matters.</h1>
    <div class="card">Every response can<br>save a life.</div>
  </div>
  <p class="meta">Free · Checked by Rakt Mitras</p>
  <p class="url">rakt-response.vercel.app</p>
</body></html>`;

const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || undefined });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: "public/images/share-card.jpg", type: "jpeg", quality: 88 });
await browser.close();
console.log("Share card saved to public/images/share-card.jpg");
