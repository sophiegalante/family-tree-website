import { describe, expect, it } from "vitest";
import { buildStoryMilestones } from "@/lib/memberStory";
import type { FamilyMember } from "@/data/familyData";

const baseMember: FamilyMember = {
  id: "p1-1",
  pageId: "p1",
  commonName: "Jane Doe",
  firstName: "Jane",
  lastName: "Doe",
  birthDate: "1 Jan 1900",
  birthYear: 1900,
  gender: "female",
  childrenNames: [],
};

describe("buildStoryMilestones", () => {
  it("builds all four milestones with event values", () => {
    const milestones = buildStoryMilestones({
      ...baseMember,
      birthPlace: "Durham",
      marriageDate: "1920",
      marriagePlace: "Yorkshire",
      spouseName: "John Doe",
      childrenNames: ["Alice Doe", "Bob Doe"],
      deathDate: "1980",
      deathPlace: "Leeds",
      deathYear: 1980,
    });

    expect(milestones[0]).toMatchObject({
      label: "Born",
      primary: "1 Jan 1900",
      secondary: "Durham",
      isKnown: true,
    });
    expect(milestones[1]).toMatchObject({
      label: "Married",
      primary: "1920",
      secondary: "John Doe in Yorkshire",
      isKnown: true,
    });
    expect(milestones[2]).toMatchObject({
      label: "Children",
      primary: "2 children",
      secondary: "Alice Doe, Bob Doe",
      isKnown: true,
    });
    expect(milestones[3]).toMatchObject({
      label: "Passed",
      primary: "1980",
      secondary: "Leeds",
      isKnown: true,
    });
  });

  it("returns unknown markers for missing data", () => {
    const milestones = buildStoryMilestones(baseMember);

    expect(milestones[1]).toMatchObject({ label: "Married", primary: "Unknown", isKnown: false });
    expect(milestones[2]).toMatchObject({ label: "Children", primary: "Unknown", isKnown: false });
    expect(milestones[3]).toMatchObject({ label: "Passed", primary: "Unknown", isKnown: false });
  });
});
