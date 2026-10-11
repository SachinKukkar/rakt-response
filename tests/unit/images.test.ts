import { describe, expect, it } from "vitest";
import { detectImageKind, sanitizeImage, stripJpegMetadata, stripPngMetadata, stripWebpMetadata } from "@/lib/images";

const bytes = (...parts: Array<number[] | string>) =>
  new Uint8Array(parts.flatMap((p) => (typeof p === "string" ? [...p].map((c) => c.charCodeAt(0)) : p)));
const u32be = (n: number) => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
const u32le = (n: number) => [n & 255, (n >>> 8) & 255, (n >>> 16) & 255, (n >>> 24) & 255];
const contains = (hay: Uint8Array, needle: string) => Buffer.from(hay).includes(Buffer.from(needle));

function segment(marker: number, payload: Uint8Array) {
  const len = payload.length + 2;
  return [0xff, marker, len >> 8, len & 255, ...payload];
}

function fakeJpeg() {
  const app0 = segment(0xe0, bytes("JFIF\0", [1, 1, 0, 0, 1, 0, 1, 0, 0]));
  const app1 = segment(0xe1, bytes("Exif\0\0", "GPS-LATITUDE-18.5204"));
  const com = segment(0xfe, bytes("secret comment"));
  const sos = [0xff, 0xda, 0, 8, 1, 1, 0, 0, 63, 0, 0x12, 0x34, 0xff, 0xd9];
  return new Uint8Array([0xff, 0xd8, ...app0, ...app1, ...com, ...sos]);
}

function pngChunk(type: string, data: number[]) {
  return [...u32be(data.length), ...bytes(type), ...data, 0, 0, 0, 0];
}

function fakePng() {
  return new Uint8Array([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    ...pngChunk("IHDR", Array(13).fill(0)),
    ...pngChunk("tEXt", [...bytes("Comment\0private")]),
    ...pngChunk("eXIf", [...bytes("GPS")]),
    ...pngChunk("IDAT", [1, 2, 3]),
    ...pngChunk("IEND", []),
  ]);
}

function webpChunk(type: string, data: number[]) {
  const pad = data.length % 2 ? [0] : [];
  return [...bytes(type), ...u32le(data.length), ...data, ...pad];
}

function fakeWebp() {
  const body = [
    ...webpChunk("VP8X", [0x0c, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
    ...webpChunk("VP8 ", [1, 2, 3, 4]),
    ...webpChunk("EXIF", [...bytes("GPS-DATA")]),
    ...webpChunk("XMP ", [...bytes("<xmp>location</xmp>")]),
  ];
  return new Uint8Array([...bytes("RIFF"), ...u32le(body.length + 4), ...bytes("WEBP"), ...body]);
}

describe("image sanitisation", () => {
  it("detects real types from magic bytes, not file names", () => {
    expect(detectImageKind(fakeJpeg())).toBe("jpeg");
    expect(detectImageKind(fakePng())).toBe("png");
    expect(detectImageKind(fakeWebp())).toBe("webp");
    expect(detectImageKind(bytes("<svg onload=alert(1)>"))).toBeNull();
    expect(detectImageKind(bytes("GIF89a"))).toBeNull();
  });

  it("removes EXIF/GPS and comments from JPEG but keeps image data", () => {
    const clean = stripJpegMetadata(fakeJpeg());
    expect(contains(clean, "GPS-LATITUDE")).toBe(false);
    expect(contains(clean, "secret comment")).toBe(false);
    expect(contains(clean, "JFIF")).toBe(true);
    expect(clean.at(-2)).toBe(0xff);
    expect(clean.at(-1)).toBe(0xd9);
  });

  it("removes text and EXIF chunks from PNG", () => {
    const clean = stripPngMetadata(fakePng());
    expect(contains(clean, "private")).toBe(false);
    expect(contains(clean, "eXIf")).toBe(false);
    expect(contains(clean, "IDAT")).toBe(true);
    expect(contains(clean, "IEND")).toBe(true);
  });

  it("removes EXIF and XMP chunks from WebP and fixes the header", () => {
    const clean = stripWebpMetadata(fakeWebp());
    expect(contains(clean, "GPS-DATA")).toBe(false);
    expect(contains(clean, "location")).toBe(false);
    const view = new DataView(clean.buffer, clean.byteOffset, clean.byteLength);
    expect(view.getUint32(4, true)).toBe(clean.length - 8);
    expect(clean[20] & 0x0c).toBe(0); // VP8X EXIF/XMP flags cleared
  });

  it("rejects oversized, empty, corrupt and unknown uploads with friendly errors", () => {
    expect(() => sanitizeImage(new Uint8Array())).toThrow(/empty/);
    expect(() => sanitizeImage(fakeJpeg(), 10)).toThrow(/smaller than/);
    expect(() => sanitizeImage(bytes("%PDF-1.7"))).toThrow(/JPEG, PNG or WebP/);
    expect(() => sanitizeImage(new Uint8Array([0xff, 0xd8, 0xff, 0x00]))).toThrow(/could not be processed/);
    expect(sanitizeImage(fakePng()).contentType).toBe("image/png");
  });
});
