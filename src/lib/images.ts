/**
 * Image validation and metadata removal for user uploads.
 *
 * The browser resizes photos before upload (which already drops EXIF), but the
 * server never trusts that: it sniffs the real file type from magic bytes and
 * strips metadata segments that can contain GPS location, device details or
 * embedded text before anything is stored.
 */

export type ImageKind = "jpeg" | "png" | "webp";

export const MAX_UPLOAD_BYTES = 3 * 1024 * 1024;

export const IMAGE_MIME: Record<ImageKind, string> = {
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export const IMAGE_EXTENSION: Record<ImageKind, string> = {
  jpeg: "jpg",
  png: "png",
  webp: "webp",
};

export function detectImageKind(bytes: Uint8Array): ImageKind | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpeg";
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
    bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a
  ) {
    return "png";
  }
  if (bytes.length >= 12 && ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 4) === "WEBP") return "webp";
  return null;
}

function ascii(bytes: Uint8Array, offset: number, length: number): string {
  return String.fromCharCode(...bytes.subarray(offset, offset + length));
}

function concat(parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((sum, p) => sum + p.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

/** JPEG: keep APP0 (JFIF), APP2 (ICC colour profile) and APP14 (Adobe); drop APP1 (EXIF/XMP), other APPn and comments. */
export function stripJpegMetadata(bytes: Uint8Array): Uint8Array {
  if (detectImageKind(bytes) !== "jpeg") throw new Error("Not a JPEG");
  const parts: Uint8Array[] = [bytes.subarray(0, 2)];
  let i = 2;
  while (i < bytes.length) {
    if (bytes[i] !== 0xff) throw new Error("Corrupt JPEG");
    let markerIndex = i + 1;
    while (bytes[markerIndex] === 0xff) markerIndex += 1; // fill bytes
    const marker = bytes[markerIndex];
    if (marker === undefined) throw new Error("Corrupt JPEG");
    if (marker === 0xda) {
      // Start of scan: the remainder is entropy-coded image data.
      parts.push(bytes.subarray(i));
      return concat(parts);
    }
    if (marker === 0xd9) {
      parts.push(bytes.subarray(i, markerIndex + 1));
      return concat(parts);
    }
    if ((marker >= 0xd0 && marker <= 0xd7) || marker === 0x01) {
      parts.push(bytes.subarray(i, markerIndex + 1));
      i = markerIndex + 1;
      continue;
    }
    const length = (bytes[markerIndex + 1] << 8) | bytes[markerIndex + 2];
    if (!Number.isFinite(length) || length < 2) throw new Error("Corrupt JPEG");
    const end = markerIndex + 1 + length;
    if (end > bytes.length) throw new Error("Corrupt JPEG");
    const isApp = marker >= 0xe0 && marker <= 0xef;
    const keep = !(isApp || marker === 0xfe) || marker === 0xe0 || marker === 0xe2 || marker === 0xee;
    if (keep) parts.push(bytes.subarray(i, end));
    i = end;
  }
  throw new Error("Corrupt JPEG");
}

const PNG_DROP = new Set(["tEXt", "zTXt", "iTXt", "eXIf", "tIME"]);

export function stripPngMetadata(bytes: Uint8Array): Uint8Array {
  if (detectImageKind(bytes) !== "png") throw new Error("Not a PNG");
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const parts: Uint8Array[] = [bytes.subarray(0, 8)];
  let i = 8;
  while (i + 12 <= bytes.length) {
    const length = view.getUint32(i);
    const type = ascii(bytes, i + 4, 4);
    const end = i + 12 + length;
    if (end > bytes.length) throw new Error("Corrupt PNG");
    if (!PNG_DROP.has(type)) parts.push(bytes.subarray(i, end));
    i = end;
    if (type === "IEND") return concat(parts);
  }
  throw new Error("Corrupt PNG");
}

export function stripWebpMetadata(bytes: Uint8Array): Uint8Array {
  if (detectImageKind(bytes) !== "webp") throw new Error("Not a WebP");
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const riffEnd = Math.min(bytes.length, 8 + view.getUint32(4, true));
  const chunks: Uint8Array[] = [];
  let i = 12;
  while (i + 8 <= riffEnd) {
    const type = ascii(bytes, i, 4);
    const size = view.getUint32(i + 4, true);
    const end = i + 8 + size + (size % 2);
    if (i + 8 + size > riffEnd) throw new Error("Corrupt WebP");
    if (type !== "EXIF" && type !== "XMP ") {
      const chunk = bytes.slice(i, Math.min(end, riffEnd));
      if (type === "VP8X" && chunk.length > 8) {
        chunk[8] &= ~(0x08 | 0x04); // clear EXIF and XMP presence flags
      }
      chunks.push(chunk);
    }
    i = end;
  }
  const body = concat(chunks);
  const header = new Uint8Array(12);
  header.set(bytes.subarray(0, 4), 0);
  new DataView(header.buffer).setUint32(4, body.length + 4, true);
  header.set(bytes.subarray(8, 12), 8);
  return concat([header, body]);
}

export interface SanitizedImage {
  kind: ImageKind;
  bytes: Uint8Array;
  contentType: string;
  extension: string;
}

/** Validates type and size, then strips metadata. Throws a user-safe Error. */
export function sanitizeImage(bytes: Uint8Array, maxBytes = MAX_UPLOAD_BYTES): SanitizedImage {
  if (bytes.length === 0) throw new Error("The photo is empty.");
  if (bytes.length > maxBytes) throw new Error(`Photos must be smaller than ${Math.round(maxBytes / 1024 / 1024)} MB.`);
  const kind = detectImageKind(bytes);
  if (!kind) throw new Error("Please upload a JPEG, PNG or WebP photo.");
  let clean: Uint8Array;
  try {
    clean = kind === "jpeg" ? stripJpegMetadata(bytes) : kind === "png" ? stripPngMetadata(bytes) : stripWebpMetadata(bytes);
  } catch {
    throw new Error("This photo could not be processed. Please try a different image.");
  }
  return { kind, bytes: clean, contentType: IMAGE_MIME[kind], extension: IMAGE_EXTENSION[kind] };
}
