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
  birth_lat: number | null;
  birth_lng: number | null;
  baptism_date: string | null;
  baptism_place: string | null;
  baptism_lat: number | null;
  baptism_lng: number | null;
  parent_1: string | null;
  parent_2: string | null;
  death_date: string | null;
  death_place: string | null;
  death_lat: number | null;
  death_lng: number | null;
  spouse_name: string | null;
  marriage_date: string | null;
  marriage_location: string | null;
  marriage_lat: number | null;
  marriage_lng: number | null;
  children: string | null;
}

// Maps the family_line string from Supabase to our page IDs
const familyLineToPageId: Record<string, FamilyMember['pageId']> = {
  'Haddock and Henderson':  'p1',
  'Henderson and Mosey':    'p2',
  'Haddock and Ainsley':    'p3',
  'Haddock and Stones':     'p4',
  'Priestman and Patton':   'p5',
  'Priestman and Wilson':   'p6',
  'Priestman and Moses':    'p7',
  'Haddock Main':           'p8',
};

const femaleNames = new Set([
  // Original set
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
  // Victorian & Northern English
  "abigail","ada","adah","addie","adela","adelaide","adeline","adella",
  "alberta","albina","alma","almira","althea","alvina","amelia","amy",
  "arabella","barbara","belle","bernadette","bernice","berta","bess","bessie",
  "betsey","betsy","betty","blanche","bridget","caroline","celia","charlotte",
  "christiana","christina","constance","cora","cordelia","daisy","deborah",
  "della","diana","dinah","effie","eliza","ella","ellie","elma","elna",
  "elvira","emeline","emily","ernestine","esther","eugenia","euphemia","eva",
  "evelina","fanny","fern","flora","frances","genevieve","georgia","georgiana",
  "geraldine","grace","harriet","harriett","hattie","henrietta","hettie",
  "honor","honora","inez","janet","jeanette","jennie","jenny","joanna",
  "josephine","julianna","kate","lena","leona","letta","lettie","lillie",
  "lilly","lily","lizzie","lois","loretta","louisa","louise","lucie",
  "lucinda","lucy","luella","lula","luna","mabel","madeline","maggie",
  "malinda","mamie","marcella","matilda","maxine","may","mayme","mercy",
  "millie","mina","minnie","miranda","mollie","molly","muriel","myra","myrtle",
  "nancy","naomi","nell","nettie","nina","nola","octavia","olive","olivia",
  "ora","polly","prudence","reba","rebecca","roberta","rosa","rosalie",
  "rosanna","rose","rowena","ruby","ruth","sadie","sallie","sally","selma",
  "serena","sibyl","sybil","sophia","sophronia","stella","sue","susanna",
  "susannah","susy","temperance","tessie","tilda","tillie","ursula","velma",
  "vesta","winona","zilpha","zina","zora",
  // American (Ohio/West Virginia/Pennsylvania)
  "almeda","arvilla","delilah","delphia","drusilla","eldora","elnora",
  "emaline","emogene","euphenia","evaline","evalyn","faith","felicia",
  "gertha","goldie","gussie","hanna","idella","iona","ira","irma",
  "isabell","lavina","lavinia","leah","leila","leota","letta","levia",
  "llewellyn","lola","lottie","louella","lovina","lula","lulie","lurena",
  "madora","malvina","mandy","mariah","marietta","marilla","maude","melvina",
  "mertie","minerva","mora","myrtie","nan","nana","narcissa","olevia",
  "olexa","ollie","osmia","permelia","phebe","philena","phillis","phoebe",
  "pinkie","prudence","purdy","rhoda","rosanna","roxana","roxanna","rubie",
  "savannah","sena","sibbie","sophronia","tabitha","tena","thirza","thursa",
  "vernie","vida","vinnie","violetta","virgie","virginia","wilda","zelda","zilah",
]);

function extractYear(dateStr: string | null): number | undefined {
  if (!dateStr) return undefined;
  const match = dateStr.match(/\b(\d{4})\b/);
  return match ? parseInt(match[1]) : undefined;
}

function inferGender(firstName: string): 'male' | 'female' {
  const check = firstName.split(' ')[0].replace(/"/g, '').toLowerCase();
  const isFemale = femaleNames.has(check);
  if (import.meta.env.DEV && !isFemale) {
    console.debug('[gender] defaulting to male for unknown name:', check);
  }
  return isFemale ? 'female' : 'male';
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
    pageIds: [pageId],
    commonName: row.common_name,
    firstName: row.first_name,
    middleName: row.middle_name ?? undefined,
    lastName: row.last_name,
    birthDate: row.birth_date,
    birthYear,
    birthPlace: row.birth_place ?? undefined,
    birthLat: row.birth_lat ?? undefined,
    birthLng: row.birth_lng ?? undefined,
    baptismDate: row.baptism_date ?? undefined,
    baptismPlace: row.baptism_place ?? undefined,
    baptismLat: row.baptism_lat ?? undefined,
    baptismLng: row.baptism_lng ?? undefined,
    deathDate: row.death_date ?? undefined,
    deathYear,
    deathPlace: row.death_place ?? undefined,
    deathLat: row.death_lat ?? undefined,
    deathLng: row.death_lng ?? undefined,
    gender: inferGender(row.first_name),
    spouseName: row.spouse_name ?? undefined,
    marriageDate: row.marriage_date ?? undefined,
    marriagePlace: row.marriage_location ?? undefined,
    marriageLat: row.marriage_lat ?? undefined,
    marriageLng: row.marriage_lng ?? undefined,
    childrenNames,
    parent1Name: row.parent_1 ?? undefined,
    parent2Name: row.parent_2 ?? undefined,
    biography: undefined,
    photoUrl: undefined,
  };
}

function deduplicateMembers(members: FamilyMember[]): FamilyMember[] {
  const seen = new Map<string, FamilyMember>();
  for (const member of members) {
    const personId = member.id.replace(/^p\d+-/, '');
    const existing = seen.get(personId);
    if (existing) {
      if (!existing.pageIds.includes(member.pageId)) {
        existing.pageIds.push(member.pageId);
      }
    } else {
      seen.set(personId, { ...member, pageIds: [member.pageId] });
    }
  }
  return Array.from(seen.values());
}

export function mapRowsToMembers(rows: FamilyMemberRow[] | undefined): FamilyMember[] {
  if (!rows || rows.length === 0) {
    return [];
  }

  return deduplicateMembers(rows.map(rowToMember));
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
