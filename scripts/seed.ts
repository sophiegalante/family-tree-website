/**
 * Seed script: populates the Supabase family_members table from the static
 * TypeScript data in src/data/familyData.ts
 *
 * NOTE: The table already has 167 rows. This script is provided for future
 * use (e.g. if the table is dropped and recreated, or to add new members).
 * It uses upsert so it's safe to re-run.
 *
 * Run with:
 *   SUPABASE_SERVICE_KEY=sb_secret_... npx tsx scripts/seed.ts
 *
 * Column mapping (TypeScript → Supabase):
 *   pageId            → family_line (via pageIdToFamilyLine)
 *   parent1Name       → parent_1
 *   parent2Name       → parent_2
 *   marriagePlace     → marriage_location
 *   childrenNames[]   → children (semicolon-separated string)
 *   birthYear/deathYear/gender are computed fields, not stored in the table
 */

import { createClient } from '@supabase/supabase-js';
import { familyMembers } from '../src/data/familyData.js';

const SUPABASE_URL = 'https://mgffrcvhmczouptnuisu.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('Error: SUPABASE_SERVICE_KEY environment variable is required');
  console.error('Usage: SUPABASE_SERVICE_KEY=sb_secret_... npx tsx scripts/seed.ts');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const pageIdToFamilyLine: Record<string, string> = {
  p1: 'App 2 - Haddock-Henderson',
  p2: 'App 2.1 - Henderson-Mosey',
  p3: 'App 3 - Haddock-Ainsley',
  p4: 'App 4 - Haddock-Stones',
};

// Extract the numeric person_id from the composite id (e.g. "p1-5" → 5)
function parsePersonId(id: string): number {
  return parseInt(id.split('-')[1]);
}

const rows = familyMembers.map((m) => ({
  person_id: parsePersonId(m.id),
  family_line: pageIdToFamilyLine[m.pageId],
  common_name: m.commonName,
  first_name: m.firstName,
  middle_name: m.middleName ?? null,
  last_name: m.lastName,
  birth_date: m.birthDate,
  birth_place: m.birthPlace ?? null,
  baptism_date: m.baptismDate ?? null,
  baptism_place: m.baptismPlace ?? null,
  parent_1: m.parent1Name ?? null,
  parent_2: m.parent2Name ?? null,
  death_date: m.deathDate ?? null,
  death_place: m.deathPlace ?? null,
  spouse_name: m.spouseName ?? null,
  marriage_date: m.marriageDate ?? null,
  marriage_location: m.marriagePlace ?? null,
  children: m.childrenNames.length > 0 ? m.childrenNames.join('; ') : null,
}));

async function seed() {
  console.log(`Seeding ${rows.length} family members into Supabase...`);

  const BATCH_SIZE = 100;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase
      .from('family_members')
      .upsert(batch, { onConflict: 'person_id' });

    if (error) {
      console.error(`Batch ${Math.floor(i / BATCH_SIZE) + 1} failed:`, error.message);
      process.exit(1);
    }
    console.log(`  Inserted rows ${i + 1}–${Math.min(i + BATCH_SIZE, rows.length)}`);
  }

  console.log(`\nDone! ${rows.length} members seeded successfully.`);
}

seed();
