import { describe, expect, it } from "vitest";
import { bloodMatch } from "@/lib/blood-compat";

describe("bloodMatch", () => {
  it("O- gives to everyone and receives only O-", () => {
    const m = bloodMatch("O-");
    expect(m.givesTo).toEqual(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]);
    expect(m.receivesFrom).toEqual(["O-"]);
  });

  it("AB+ receives from everyone and gives only to AB+", () => {
    const m = bloodMatch("AB+");
    expect(m.receivesFrom).toHaveLength(8);
    expect(m.givesTo).toEqual(["AB+"]);
  });

  it("follows ABO and Rh rules for the middle groups", () => {
    expect(bloodMatch("A-").givesTo).toEqual(["A+", "A-", "AB+", "AB-"]);
    expect(bloodMatch("B+").receivesFrom).toEqual(["B+", "B-", "O+", "O-"]);
    expect(bloodMatch("O+").givesTo).toEqual(["A+", "B+", "AB+", "O+"]);
  });

  it("keeps Bombay (Oh) blood for Bombay patients", () => {
    expect(bloodMatch("Oh")).toEqual({ group: "Oh", givesTo: ["Oh"], receivesFrom: ["Oh"] });
  });
});
