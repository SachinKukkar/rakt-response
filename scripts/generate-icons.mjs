/**
 * Generates PWA / favicon derivatives from the supplied Rakt Response logo.
 * The original artwork is only resized (never redrawn or stretched).
 *   npm run icons
 */
import sharp from "sharp";
import { mkdirSync, existsSync } from "node:fs";

const SOURCE = "public/images/rakt-response-logo.jpeg";
if (!existsSync(SOURCE)) {
  console.error(`Logo not found at ${SOURCE}. Place the supplied Rakt Response logo there first.`);
  process.exit(1);
}
mkdirSync("public/icons", { recursive: true });
const white = { r: 255, g: 255, b: 255, alpha: 1 };

async function square(size, out, padding = 0) {
  const inner = Math.round(size * (1 - padding * 2));
  const logo = await sharp(SOURCE).resize(inner, inner, { fit: "contain", background: white }).toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: white } })
    .composite([{ input: logo, gravity: "center" }])
    .png({ compressionLevel: 9, palette: true, quality: 92 })
    .toFile(out);
}

await square(192, "public/icons/icon-192.png");
await square(512, "public/icons/icon-512.png");
// Maskable icons need the artwork inside the central safe zone (80%).
await square(512, "public/icons/maskable-512.png", 0.1);
await square(180, "src/app/apple-icon.png", 0.04);
await square(96, "src/app/icon.png");
// Web-optimised copies of the full logo for UI placements.
for (const size of [96, 192, 384]) {
  await sharp(SOURCE).resize(size, size, { fit: "contain", background: white }).webp({ quality: 90 }).toFile(`public/images/rakt-response-logo-${size}.webp`);
}
console.log("Icons generated from", SOURCE);
