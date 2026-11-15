/**
 * Builds every logo file the site uses from the supplied Rakt Response logo
 * (assets/brand/logo-supplied.svg: the round "Rakt Response Team" badge on white).
 * The artwork is only cut out and resized, never redrawn.
 *   npm run icons
 *
 *   public/brand/logo.png                 the badge with transparent corners (header, pages)
 *   public/images/rakt-response-logo.jpeg the badge on white, for emails
 *   public/icons/*, src/app/*icon*        favicon and app icons
 */
import sharp from "sharp";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";

const SOURCE = "assets/brand/logo-supplied.svg";
if (!existsSync(SOURCE)) {
  console.error(`Supplied logo not found at ${SOURCE}.`);
  process.exit(1);
}
mkdirSync("public/icons", { recursive: true });

// The badge's red rim, measured on the supplied file drawn at its own size, 2000 × 2000
// (centre and radius in px). The cut sits at least 1.5 px inside the white page, so neither
// the page nor the soft shadow shows. Measure again if the supplied file changes.
const RIM = { x: 1004.3, y: 1002.7, r: 980 };

const left = Math.round(RIM.x - RIM.r);
const top = Math.round(RIM.y - RIM.r);
const side = RIM.r * 2;
const mask = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${side}" height="${side}">` +
    `<circle cx="${RIM.x - left}" cy="${RIM.y - top}" r="${RIM.r}" fill="#fff"/></svg>`,
);
// density 72 draws the SVG at its own 2000 × 2000 px.
const BADGE = await sharp(SOURCE, { density: 72 })
  .extract({ left, top, width: side, height: side })
  .ensureAlpha()
  .composite([{ input: mask, blend: "dest-in" }])
  .png()
  .toBuffer();

// A 256-colour palette, like the supplied drawing itself (255 colours): a fraction of the
// size, no visible difference.
const PALETTE = { compressionLevel: 9, palette: true, quality: 92, effort: 10, dither: 0.6 };

// Large enough for the biggest use (176 px, the blood-group circle) on a 3× screen.
await sharp(BADGE).resize(768, 768).png(PALETTE).toFile("public/brand/logo.png");
// Emails can't rely on transparency: the badge on white.
await sharp(BADGE)
  .resize(560, 560)
  .flatten({ background: "#ffffff" })
  .extend({ top: 40, bottom: 40, left: 40, right: 40, background: "#ffffff" })
  .jpeg({ quality: 88, mozjpeg: true })
  .toFile("public/images/rakt-response-logo.jpeg");

const CREAM = { r: 244, g: 243, b: 239, alpha: 1 }; // --cream, #f4f3ef
const CLEAR = { r: 0, g: 0, b: 0, alpha: 0 };

/** The badge centred on a square, `padding` as a share of the side. */
async function square(size, background, padding) {
  const inner = Math.round(size * (1 - padding * 2));
  const badge = await sharp(BADGE).resize(inner, inner).toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background } })
    .composite([{ input: badge, gravity: "center" }])
    .png(PALETTE)
    .toBuffer();
}

/** A .ico holding PNG images (supported by every current browser). */
function ico(images) {
  const header = Buffer.alloc(6 + images.length * 16);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, png }, i) => {
    const entry = 6 + i * 16;
    header.writeUInt8(size >= 256 ? 0 : size, entry);
    header.writeUInt8(size >= 256 ? 0 : size, entry + 1);
    header.writeUInt8(0, entry + 2);
    header.writeUInt8(0, entry + 3);
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(png.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += png.length;
  });
  return Buffer.concat([header, ...images.map((image) => image.png)]);
}

// App icons sit on cream; maskable ones keep the badge inside the 80% safe zone.
writeFileSync("public/icons/icon-192.png", await square(192, CREAM, 0.06));
writeFileSync("public/icons/icon-512.png", await square(512, CREAM, 0.06));
writeFileSync("public/icons/maskable-512.png", await square(512, CREAM, 0.12));
writeFileSync("src/app/apple-icon.png", await square(180, CREAM, 0.08));
// Browser tab icons: the round badge alone, on light and dark tab bars.
writeFileSync("src/app/icon.png", await square(96, CLEAR, 0));
const sizes = [16, 32, 48];
writeFileSync("src/app/favicon.ico", ico(await Promise.all(sizes.map(async (size) => ({ size, png: await square(size, CLEAR, 0) })))));

console.log("Logo files generated from", SOURCE);
