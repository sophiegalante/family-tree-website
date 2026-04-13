import type { FamilyMember } from "@/data/familyData";

export interface StoryMilestone {
  label: "Born" | "Married" | "Children" | "Passed";
  primary: string;
  secondary?: string;
  isKnown: boolean;
}

function formatChildren(childrenNames: string[]): { primary: string; secondary?: string; isKnown: boolean } {
  if (childrenNames.length === 0) {
    return { primary: "Unknown", isKnown: false };
  }

  return {
    primary: `${childrenNames.length} ${childrenNames.length === 1 ? "child" : "children"}`,
    secondary: childrenNames.join(", "),
    isKnown: true,
  };
}

export function buildStoryMilestones(member: FamilyMember): StoryMilestone[] {
  const bornKnown = Boolean(member.birthDate || member.birthPlace);
  const marriedKnown = Boolean(member.marriageDate || member.spouseName || member.marriagePlace);
  const passedKnown = Boolean(member.deathDate || member.deathPlace);
  const children = formatChildren(member.childrenNames);

  return [
    {
      label: "Born",
      primary: member.birthDate || "Unknown",
      secondary: member.birthPlace,
      isKnown: bornKnown,
    },
    {
      label: "Married",
      primary: member.marriageDate || "Unknown",
      secondary: member.spouseName
        ? `${member.spouseName}${member.marriagePlace ? ` in ${member.marriagePlace}` : ""}`
        : member.marriagePlace,
      isKnown: marriedKnown,
    },
    {
      label: "Children",
      primary: children.primary,
      secondary: children.secondary,
      isKnown: children.isKnown,
    },
    {
      label: "Passed",
      primary: member.deathDate || "Unknown",
      secondary: member.deathPlace,
      isKnown: passedKnown,
    },
  ];
}
