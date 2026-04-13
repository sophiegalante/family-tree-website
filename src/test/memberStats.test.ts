import { describe, expect, it } from "vitest";
import { getBirthYearRange } from "@/lib/memberStats";

describe("getBirthYearRange", () => {
  it("ignores zero and invalid years when computing range", () => {
    const range = getBirthYearRange([
      { birthYear: 0 },
      { birthYear: 1723 },
      { birthYear: 1976 },
    ]);

    expect(range).toEqual({ earliest: 1723, latest: 1976 });
  });

  it("returns zeros when there are no valid years", () => {
    const range = getBirthYearRange([{ birthYear: 0 }, { birthYear: -1 }]);

    expect(range).toEqual({ earliest: 0, latest: 0 });
  });
});
