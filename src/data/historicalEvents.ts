export interface HistoricalEvent {
  name: string;
  year: number;
  endYear?: number;
  description: string;
  locations: string[]; // normalized place keywords
  category: "war" | "political" | "social" | "disaster" | "industrial" | "cultural" | "migration";
}

export const historicalEvents: HistoricalEvent[] = [
  // Wars & Conflicts
  { name: "English Civil War", year: 1642, endYear: 1651, description: "Conflict between Parliamentarians and Royalists across England", locations: ["yorkshire", "durham", "england"], category: "war" },
  { name: "Jacobite Rising of 1745", year: 1745, endYear: 1746, description: "Attempt by Charles Edward Stuart to reclaim the British throne", locations: ["yorkshire", "durham", "northumberland", "england"], category: "war" },
  { name: "Napoleonic Wars", year: 1803, endYear: 1815, description: "Series of major European conflicts involving Napoleon Bonaparte", locations: ["england", "yorkshire", "durham"], category: "war" },
  { name: "American Civil War", year: 1861, endYear: 1865, description: "War between the Union and Confederacy in the United States", locations: ["ohio", "virginia", "west virginia", "indiana", "illinois", "usa"], category: "war" },
  { name: "World War I", year: 1914, endYear: 1918, description: "The Great War — millions mobilized across Britain and the world", locations: ["yorkshire", "durham", "england", "ohio", "west virginia", "usa"], category: "war" },
  { name: "World War II", year: 1939, endYear: 1945, description: "Global conflict that affected every family in Britain and America", locations: ["yorkshire", "durham", "england", "ohio", "west virginia", "indiana", "usa", "lancashire", "london"], category: "war" },
  { name: "Korean War", year: 1950, endYear: 1953, description: "British and American forces fought in the Korean Peninsula", locations: ["england", "usa"], category: "war" },

  // Industrial & Economic
  { name: "Start of the Industrial Revolution", year: 1760, endYear: 1840, description: "Transformation of manufacturing, beginning in Northern England", locations: ["yorkshire", "durham", "lancashire", "england"], category: "industrial" },
  { name: "Durham Coalfield Expansion", year: 1800, endYear: 1900, description: "Massive growth of coal mining across County Durham", locations: ["durham", "chester le street", "easington", "houghton", "rainton", "lanchester"], category: "industrial" },
  { name: "Railway Mania", year: 1840, endYear: 1850, description: "Rapid expansion of railways across Britain, many built through Yorkshire and Durham", locations: ["yorkshire", "durham", "darlington", "shildon", "england"], category: "industrial" },
  { name: "Stockton & Darlington Railway Opens", year: 1825, endYear: 1825, description: "World's first public railway using steam locomotion, opened near Darlington", locations: ["darlington", "shildon", "durham", "stockton"], category: "industrial" },
  { name: "The Great Depression", year: 1929, endYear: 1939, description: "Worldwide economic downturn causing mass unemployment", locations: ["yorkshire", "durham", "england", "ohio", "west virginia", "indiana", "usa"], category: "industrial" },
  { name: "Durham Miners' Strike", year: 1926, endYear: 1926, description: "General Strike led by miners across the Durham coalfield", locations: ["durham", "easington", "houghton", "chester le street", "lanchester"], category: "industrial" },
  { name: "Decline of Durham Coal Mining", year: 1960, endYear: 1990, description: "Pit closures devastated mining communities across County Durham", locations: ["durham", "easington", "houghton", "chester le street", "lanchester"], category: "industrial" },

  // Social & Political
  { name: "Act of Union (Great Britain)", year: 1707, endYear: 1707, description: "Scotland and England united into Great Britain", locations: ["england", "yorkshire", "durham"], category: "political" },
  { name: "Reform Act 1832", year: 1832, endYear: 1832, description: "Major electoral reform extending voting rights in Britain", locations: ["england", "yorkshire", "durham"], category: "political" },
  { name: "American Declaration of Independence", year: 1776, endYear: 1776, description: "The thirteen colonies declared independence from Britain", locations: ["ohio", "virginia", "usa"], category: "political" },
  { name: "NHS Founded", year: 1948, endYear: 1948, description: "National Health Service established, providing free healthcare for all", locations: ["england", "yorkshire", "durham", "lancashire", "london"], category: "social" },
  { name: "Women's Suffrage (UK)", year: 1918, endYear: 1928, description: "Women gained the right to vote in Britain", locations: ["england", "yorkshire", "durham", "lancashire"], category: "social" },

  // Disease & Disaster
  { name: "Cholera Epidemic", year: 1831, endYear: 1832, description: "First major cholera outbreak swept through Northern England", locations: ["durham", "yorkshire", "gateshead", "sunderland", "newcastle"], category: "disaster" },
  { name: "Irish Potato Famine Migration", year: 1845, endYear: 1852, description: "Waves of Irish immigrants arrived in Northern England and America", locations: ["durham", "yorkshire", "lancashire", "ohio", "usa"], category: "migration" },
  { name: "Spanish Flu Pandemic", year: 1918, endYear: 1920, description: "Global pandemic killing millions worldwide", locations: ["england", "yorkshire", "durham", "ohio", "west virginia", "usa"], category: "disaster" },

  // Migration
  { name: "Great Migration to America", year: 1850, endYear: 1920, description: "Millions of Europeans emigrated to the United States seeking opportunity", locations: ["ohio", "west virginia", "indiana", "illinois", "usa"], category: "migration" },
  { name: "Yorkshire–Durham Internal Migration", year: 1800, endYear: 1900, description: "Rural families moved to mining and industrial towns across the region", locations: ["yorkshire", "durham", "darlington", "richmond"], category: "migration" },

  // Cultural
  { name: "Queen Victoria's Reign Begins", year: 1837, endYear: 1901, description: "The Victorian era — transformation of British society and culture", locations: ["england", "yorkshire", "durham", "lancashire", "london"], category: "cultural" },
  { name: "Festival of Britain", year: 1951, endYear: 1951, description: "National celebration of British arts and industry", locations: ["england", "london", "durham", "yorkshire"], category: "cultural" },
];

// Match events to a person based on their lifespan and locations
export function getEventsForPerson(
  birthYear: number,
  deathYear: number | undefined,
  birthPlace?: string,
  deathPlace?: string,
  marriagePlace?: string
): HistoricalEvent[] {
  const endYear = deathYear || new Date().getFullYear();
  const places = [birthPlace, deathPlace, marriagePlace]
    .filter(Boolean)
    .map((p) => p!.toLowerCase());

  return historicalEvents.filter((event) => {
    // Check time overlap
    const eventEnd = event.endYear || event.year;
    const timeOverlap = event.year <= endYear && eventEnd >= birthYear;
    if (!timeOverlap) return false;

    // Check location match
    const locationMatch = event.locations.some((loc) =>
      places.some((p) => p.includes(loc) || loc.includes(p.split(",")[0].trim()))
    );
    return locationMatch;
  });
}

// Category styling
export const categoryStyles: Record<HistoricalEvent["category"], { emoji: string; label: string }> = {
  war: { emoji: "⚔️", label: "Conflict" },
  political: { emoji: "🏛️", label: "Political" },
  social: { emoji: "👥", label: "Social" },
  disaster: { emoji: "⚠️", label: "Disaster" },
  industrial: { emoji: "🏭", label: "Industrial" },
  cultural: { emoji: "🎭", label: "Cultural" },
  migration: { emoji: "🚢", label: "Migration" },
};
