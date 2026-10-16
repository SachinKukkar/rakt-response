/**
 * Generates favicon and app icons from the supplied Rakt Response logo mark
 * (the drop held in a hand). The artwork is only resized, never redrawn.
 *   npm run icons
 *
 * public/brand/logo-mark.png is the mark cut out of the supplied logo file
 * (public/brand/logo-original-supplied.png) on a transparent background.
 */
import sharp from "sharp";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";

const SOURCE = "public/brand/logo-mark.png";
if (!existsSync(SOURCE)) {
  console.error(`Logo mark not found at ${SOURCE}.`);
  process.exit(1);
}
mkdirSync("public/icons", { recursive: true });

const NIGHT = { r: 18, g: 4, b: 7, alpha: 1 }; // the site's dark background
const CLEAR = { r: 0, g: 0, b: 0, alpha: 0 };

/** The mark centred on a square, `padding` as a share of the side. */
async function square(size, background, padding) {
  const inner = Math.round(size * (1 - padding * 2));
  const mark = await sharp(SOURCE).resize(inner, inner, { fit: "contain", background: CLEAR }).toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background } })
    .composite([{ input: mark, gravity: "center" }])
    .png({ compressionLevel: 9 })
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

// App icons sit on the dark brand background; maskable ones keep the mark in the 80% safe zone.
writeFileSync("public/icons/icon-192.png", await square(192, NIGHT, 0.12));
writeFileSync("public/icons/icon-512.png", await square(512, NIGHT, 0.12));
writeFileSync("public/icons/maskable-512.png", await square(512, NIGHT, 0.2));
writeFileSync("src/app/apple-icon.png", await square(180, NIGHT, 0.14));
// Browser tab icons: the mark alone, readable on light and dark tab bars.
writeFileSync("src/app/icon.png", await square(96, CLEAR, 0.02));
const sizes = [16, 32, 48];
writeFileSync("src/app/favicon.ico", ico(await Promise.all(sizes.map(async (size) => ({ size, png: await square(size, CLEAR, 0) })))));

console.log("Icons generated from", SOURCE);
