import { describe, expect, it } from "vitest";
import { safeNextPath } from "@/lib/redirects";
import { csvCell, toCsv } from "@/lib/csv";
import { friendlyDbError, isRateLimited } from "@/lib/errors";
import { formatDate, indiaLocalToIso, initials, todayInIndia } from "@/lib/format";
import { roundCoordinate } from "@/lib/geo";
import { isProtectedPath } from "@/lib/supabase/proxy";

describe("safeNextPath", () => {
  it.each([
    ["/dashboard", "/dashboard"],
    ["/requests?x=1", "/requests?x=1"],
    ["//evil.example", "/dashboard"],
    ["https://evil.example", "/dashboard"],
    ["/\\evil.example", "/dashboard"],
    [undefined, "/dashboard"],
  ])("%s -> %s", (input, expected) => {
    expect(safeNextPath(input)).toBe(expected);
  });
});

describe("protected paths", () => {
  it.each(["/dashboard", "/admin/users", "/volunteer/donors", "/share-your-story/submissions", "/settings"])("%s is protected", (p) => {
    expect(isProtectedPath(p)).toBe(true);
  });
  it.each(["/", "/blood-requests", "/stories", "/share-your-story", "/administrator", "/login"])("%s is public", (p) => {
    expect(isProtectedPath(p)).toBe(false);
  });
});

describe("csv", () => {
  it("escapes quotes, commas and newlines", () => {
    expect(csvCell('He said "hi", then\nleft')).toBe('"He said ""hi"", then\nleft"');
  });
  it("neutralises spreadsheet formulas", () => {
    expect(csvCell("=SUM(A1)")).toBe("'=SUM(A1)");
    expect(csvCell("+91")).toBe("'+91");
    expect(csvCell("@cmd")).toBe("'@cmd");
  });
  it("builds rows", () => {
    expect(toCsv(["a", "b"], [[1, null]])).toBe("a,b\r\n1,\r\n");
  });
});

describe("friendlyDbError", () => {
  it("passes through messages written for users", () => {
    expect(friendlyDbError({ code: "42501", message: "Only authorised volunteers can search the donor directory" })).toMatch(/authorised volunteers/);
    expect(friendlyDbError({ code: "RR429", message: "You have reached the hourly limit" })).toMatch(/hourly limit/);
    expect(isRateLimited({ code: "RR429" })).toBe(true);
  });
  it("hides internal details", () => {
    expect(friendlyDbError({ code: "42501", message: "permission denied for table profiles" })).toBe("You do not have permission to do that.");
    expect(friendlyDbError({ code: "23514", message: 'new row violates check constraint "x"' })).not.toMatch(/constraint/);
    expect(friendlyDbError({ code: "XX000", message: "internal error at line 3" })).not.toMatch(/line 3/);
    expect(friendlyDbError({ code: "22023", message: 'relation "secret" does not exist' })).not.toMatch(/secret/);
  });
});

describe("format helpers", () => {
  it("treats datetime-local input as India time", () => {
    expect(indiaLocalToIso("2026-10-11T10:00")).toBe("2026-10-11T04:30:00.000Z");
    expect(indiaLocalToIso("bad")).toBeNull();
  });
  it("computes today's date in India", () => {
    expect(todayInIndia(new Date("2026-10-10T20:00:00Z"))).toBe("2026-10-11");
  });
  it("formats calendar dates without timezone drift", () => {
    expect(formatDate("2026-01-01")).toBe("1 Jan 2026");
  });
  it("builds initials and rounds coordinates to about 1 km", () => {
    expect(initials("Asha Fictional Person")).toBe("AF");
    expect(roundCoordinate(18.520412)).toBe(18.52);
  });
});
