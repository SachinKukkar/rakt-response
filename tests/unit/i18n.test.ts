import { describe, expect, it } from "vitest";
import { HINDI } from "@/i18n/catalog";
import { translate } from "@/i18n/translate";

describe("translate", () => {
  it("returns English unchanged", () => {
    expect(translate("en", "Become a Donor")).toBe("Become a Donor");
    expect(translate("en", "Hello, {name}", { name: "Asha" })).toBe("Hello, Asha");
  });

  it("uses the Hindi catalog and fills placeholders", () => {
    expect(translate("hi", "Become a Donor")).toBe("डोनर बनें");
    expect(translate("hi", "Hello, {name}", { name: "Asha" })).toBe("नमस्ते, Asha");
  });

  it("translates server messages that already contain their values", () => {
    expect(translate("hi", "We've sent a new verification link to asha@example.test.")).toBe(
      "हमने asha@example.test पर पुष्टि का नया लिंक भेज दिया है।",
    );
  });

  it("does not stretch page templates over unrelated text", () => {
    // "Request {code}" is a page template; a hospital name must not be rewritten by it.
    expect(translate("hi", "Request Memorial Hospital")).toBe("Request Memorial Hospital");
  });

  it("falls back to English for anything not yet translated", () => {
    expect(translate("hi", "A sentence nobody has translated")).toBe("A sentence nobody has translated");
  });

  it("keeps placeholders consistent between English and Hindi", () => {
    const names = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
    for (const [english, hindi] of Object.entries(HINDI)) {
      expect(names(hindi), english).toEqual(names(english));
      expect(hindi.trim(), english).not.toBe("");
    }
  });
});
