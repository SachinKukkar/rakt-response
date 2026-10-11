import { describe, expect, it } from "vitest";
import { formatPhone, normalizePhone } from "@/lib/phone";
import { telLink, volunteerWhatsappMessage, whatsappLink } from "@/lib/contact-links";

describe("normalizePhone", () => {
  it.each([
    ["98765 43210", "+919876543210"],
    ["09876543210", "+919876543210"],
    ["+91 98765-43210", "+919876543210"],
    ["919876543210", "+919876543210"],
    ["+44 20 7946 0958", "+442079460958"],
  ])("normalises %s", (input, expected) => {
    expect(normalizePhone(input)).toBe(expected);
  });

  it.each(["", "12345", "5876543210", "+91 12345 67890", "abc", "+0123456789"])("rejects %s", (input) => {
    expect(normalizePhone(input)).toBeNull();
  });

  it("formats Indian numbers for display", () => {
    expect(formatPhone("+919876543210")).toBe("+91 98765 43210");
  });
});

describe("contact links", () => {
  it("builds tel and WhatsApp links without leaking extra data", () => {
    expect(telLink("+919876543210")).toBe("tel:+919876543210");
    const link = whatsappLink("+919876543210", volunteerWhatsappMessage("RR-261011-ABCDE"));
    expect(link.startsWith("https://wa.me/919876543210?text=")).toBe(true);
    expect(decodeURIComponent(link)).toContain("RR-261011-ABCDE");
    expect(decodeURIComponent(link)).not.toMatch(/patient|diagnosis/i);
  });
});
