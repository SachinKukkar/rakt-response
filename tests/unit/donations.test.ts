import { describe, expect, it } from "vitest";
import { findPossibleDuplicates, informationalWholeBloodEstimate, summarizeDonations } from "@/lib/donations";

describe("findPossibleDuplicates", () => {
  const existing = [
    { id: "1", donation_type: "whole_blood" as const, donation_date: "2026-03-10", verification_status: "pending" as const },
    { id: "2", donation_type: "sdp" as const, donation_date: "2026-03-11", verification_status: "verified" as const },
    { id: "3", donation_type: "whole_blood" as const, donation_date: "2026-01-01", verification_status: "rejected" as const },
  ];

  it("flags the same type within a week", () => {
    expect(findPossibleDuplicates(existing, { donation_type: "whole_blood", donation_date: "2026-03-15" }).map((d) => d.id)).toEqual(["1"]);
  });

  it("does not mix whole blood and SDP", () => {
    expect(findPossibleDuplicates(existing, { donation_type: "sdp", donation_date: "2026-03-10" }).map((d) => d.id)).toEqual(["2"]);
  });

  it("ignores rejected records, distant dates and the record itself", () => {
    expect(findPossibleDuplicates(existing, { donation_type: "whole_blood", donation_date: "2026-01-02" })).toEqual([]);
    expect(findPossibleDuplicates(existing, { donation_type: "whole_blood", donation_date: "2026-05-01" })).toEqual([]);
    expect(findPossibleDuplicates(existing, { id: "1", donation_type: "whole_blood", donation_date: "2026-03-10" })).toEqual([]);
  });
});

describe("summarizeDonations", () => {
  it("keeps reported and verified, whole blood and SDP separate", () => {
    const summary = summarizeDonations([
      { donation_type: "whole_blood", donation_date: "2026-01-01", verification_status: "verified" },
      { donation_type: "whole_blood", donation_date: "2026-05-01", verification_status: "pending" },
      { donation_type: "sdp", donation_date: "2026-04-01", verification_status: "verified" },
      { donation_type: "sdp", donation_date: "2026-06-01", verification_status: "rejected" },
    ]);
    expect(summary).toMatchObject({
      last_reported_whole_blood: "2026-05-01",
      last_verified_whole_blood: "2026-01-01",
      last_reported_sdp: "2026-04-01",
      last_verified_sdp: "2026-04-01",
      verified_whole_blood_count: 1,
      verified_sdp_count: 1,
      pending_count: 1,
    });
  });
});

describe("informationalWholeBloodEstimate", () => {
  it("adds the configured interval and never invents a date", () => {
    expect(informationalWholeBloodEstimate("2026-01-01", 90)).toBe("2026-04-01");
    expect(informationalWholeBloodEstimate(null, 90)).toBeNull();
    expect(informationalWholeBloodEstimate("2026-01-01", 0)).toBeNull();
    expect(informationalWholeBloodEstimate("not-a-date", 90)).toBeNull();
  });
});
