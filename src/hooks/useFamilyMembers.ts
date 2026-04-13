import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { type FamilyMember, type Era, getEras, getBranches, getMembersByBranch } from '@/data/familyData';

// Actual column names in the Supabase table
interface FamilyMemberRow {
  id: number;
  person_id: number;
  family_line: string;
  common_name: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  birth_date: string;
  birth_place: string | null;
  baptism_date: string | null;
  baptism_place: string | null;
  parent_1: string | null;
  parent_2: string | null;
  death_date: string | null;
  death_place: string | null;
  spouse_name: string | null;
  marriage_date: string | null;
  marriage_location: string | null;
  children: string | null;
}

// Maps the family_line string from Supabase to our page IDs
const familyLineToPageId: Record<string, FamilyMember['pageId']> = {
  'App 2 - Haddock-Henderson':  'p1',
  'App 2.1 - Henderson-Mosey': 'p2',
  'App 3 - Haddock-Ainsley':   'p3',
  'App 4 - Haddock-Stones':    'p4',
};

const femaleNames = new Set([
  "elizabeth","mary","ann","anna","margaret","jane","rachel","hannah","martha",
  "tabitha","dorothy","hilda","eileen","marion","kathleen","sophie","lucia","helena",
  "brigitte","marie","elena","ingrid","theresa","rosina","johanna","clara","elise",
  "phoebe","isabella","theodosia","morrel","ethel","emma","pearl","norma","marjorie",
  "sandra","leann","terri","samantha","kerry","carolynn","patricia","teresa","norah",
  "maud","edna","joyce","vera","audrey","phyllis","winifred","florence","alice","ivy",
  "violet","beatrice","rhoda","marlene","valera","olwyn","carole","lynn",
  "susan","maureen","linda","lorna","bertha","eunice","ellen","julia","sarah","nellie",
  "priscilla","pauline","nora","agnes","eleanor","wilma","imogene","dora","mildred",
  "estelle","amie","tina","katherine","kim","joy","claire","clarice","sheron",
  "gertrude","doris","lucilla","freda","lilian","june","jessie","annie","edith",
  "gladys","jean","daphne","judith","alison","angela","helen","tonia",
  "victoria","irene","lydia","ida","catherine","elsie","evelyn",
]);

function extractYear(dateStr: string | null): number | undefined {
  if (!dateStr) return undefined;
  const match = dateStr.match(/\b(\d{4})\b/);
  return match ? parseInt(match[1]) : undefined;
}

function inferGender(firstName: string): 'male' | 'female' {
  const check = firstName.split(' ')[0].replace(/"/g, '').toLowerCase();
  return femaleNames.has(check) ? 'female' : 'male';
}

function rowToMember(row: FamilyMemberRow): FamilyMember {
  const pageId = familyLineToPageId[row.family_line] ?? 'p1';
  const birthYear = extractYear(row.birth_date) ?? 0;
  const deathYear = extractYear(row.death_date);
  const childrenNames = row.children
    ? row.children.split(';').map((c) => c.trim()).filter(Boolean)
    : [];

  return {
    id: `${pageId}-${row.person_id}`,
    pageId,
    commonName: row.common_name,
    firstName: row.first_name,
    middleName: row.middle_name ?? undefined,
    lastName: row.last_name,
    birthDate: row.birth_date,
    birthYear,
    birthPlace: row.birth_place ?? undefined,
    baptismDate: row.baptism_date ?? undefined,
    baptismPlace: row.baptism_place ?? undefined,
    deathDate: row.death_date ?? undefined,
    deathYear,
    deathPlace: row.death_place ?? undefined,
    gender: inferGender(row.first_name),
    spouseName: row.spouse_name ?? undefined,
    marriageDate: row.marriage_date ?? undefined,
    marriagePlace: row.marriage_location ?? undefined,
    childrenNames,
    parent1Name: row.parent_1 ?? undefined,
    parent2Name: row.parent_2 ?? undefined,
    biography: undefined,
    photoUrl: undefined,
  };
}

export function mapRowsToMembers(rows: FamilyMemberRow[] | undefined): FamilyMember[] {
  if (!rows || rows.length === 0) {
    return [];
  }

  return rows.map(rowToMember);
}

async function fetchFamilyMembers(): Promise<FamilyMember[]> {
  const { data, error } = await supabase
    .from('family_members')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return mapRowsToMembers(data as FamilyMemberRow[] | undefined);
}

export function useFamilyMembers() {
  const query = useQuery({
    queryKey: ['family-members'],
    queryFn: fetchFamilyMembers,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const members = query.data ?? [];

  return {
    members,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    eras: members.length > 0 ? getEras(members) : [] as Era[],
    branches: members.length > 0 ? getBranches(members) : [],
    getMembersByBranch: (pageId: string) => getMembersByBranch(members, pageId),
  };
}
