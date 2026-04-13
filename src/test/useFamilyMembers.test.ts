import { describe, expect, it } from "vitest";
import { mapRowsToMembers } from "@/hooks/useFamilyMembers";

describe("mapRowsToMembers", () => {
  it("returns an empty list when Supabase rows are missing", () => {
    const members = mapRowsToMembers(undefined);

    expect(members).toEqual([]);
  });

  it("maps Supabase-style rows into app members", () => {
    const members = mapRowsToMembers([
      {
        id: 1,
        person_id: 42,
        family_line: "App 2 - Haddock-Henderson",
        common_name: "Jane Doe (1900-1980)",
        first_name: "Jane",
        middle_name: null,
        last_name: "Doe",
        birth_date: "1 January 1900",
        birth_place: "Durham",
        baptism_date: null,
        baptism_place: null,
        parent_1: "John Doe",
        parent_2: "Mary Doe",
        death_date: "1980",
        death_place: "Yorkshire",
        spouse_name: "James Doe",
        marriage_date: "1920",
        marriage_location: "Durham",
        children: "Alice Doe; Bob Doe",
      },
    ]);

    expect(members).toHaveLength(1);
    expect(members[0]).toMatchObject({
      id: "p1-42",
      pageId: "p1",
      firstName: "Jane",
      gender: "female",
      childrenNames: ["Alice Doe", "Bob Doe"],
      birthYear: 1900,
      deathYear: 1980,
    });
  });
});
