type MemberWithBirthYear = { birthYear: number };

export function getBirthYearRange(members: MemberWithBirthYear[]): { earliest: number; latest: number } {
  const validYears = members
    .map((member) => member.birthYear)
    .filter((year) => Number.isFinite(year) && year > 0);

  if (validYears.length === 0) {
    return { earliest: 0, latest: 0 };
  }

  return {
    earliest: Math.min(...validYears),
    latest: Math.max(...validYears),
  };
}
