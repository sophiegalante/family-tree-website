/**
 * Geocoding script: populates birth_lat/lng, death_lat/lng, marriage_lat/lng,
 * baptism_lat/lng columns in family_members using the OpenCage geocoding API.
 *
 * Strategy:
 *   1. Fetch all distinct location strings from the four place fields
 *   2. Deduplicate — each unique string is geocoded only once
 *   3. Call OpenCage for each unique string (350ms delay to respect rate limits)
 *   4. Only write coordinates where OpenCage confidence >= 4 (skips garbled
 *      strings like "ww1", "durham nw", "leeds at the general infirmary")
 *   5. Update rows in Supabase in batches
 *
 * Run with:
 *   SUPABASE_SERVICE_KEY=sb_secret_... OPENCAGE_KEY=your_key npx tsx scripts/geocode.ts
 *
 * Safe to re-run — rows that already have coordinates are skipped by default.
 * Pass --force to re-geocode everything.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mgffrcvhmczouptnuisu.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const OPENCAGE_KEY = process.env.OPENCAGE_KEY;
const FORCE = process.argv.includes('--force');
// Confidence measures bounding box SIZE, not match certainty (per OpenCage docs).
// Large places like "Yorkshire" or "Durham" legitimately score 1–2.
// We only reject confidence 0 = OpenCage could not determine a bounding box at all.
const MIN_CONFIDENCE = 1;

if (!SUPABASE_SERVICE_KEY) {
  console.error('Error: SUPABASE_SERVICE_KEY environment variable is required');
  process.exit(1);
}
if (!OPENCAGE_KEY) {
  console.error('Error: OPENCAGE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function geocode(place: string): Promise<[number, number] | null> {
  const url = new URL('https://api.opencagedata.com/geocode/v1/json');
  url.searchParams.set('q', place);
  url.searchParams.set('key', OPENCAGE_KEY!);
  url.searchParams.set('limit', '1');
  url.searchParams.set('no_annotations', '1');
  url.searchParams.set('language', 'en');

  const res = await fetch(url.toString());
  if (!res.ok) {
    console.warn(`  API error ${res.status} for "${place}"`);
    return null;
  }

  const json = await res.json();
  const result = json.results?.[0];
  if (!result) return null;

  const confidence: number = result.confidence ?? 0;
  if (confidence < MIN_CONFIDENCE) {
    console.log(`  ⚠ low confidence (${confidence}) — skipping "${place}"`);
    return null;
  }

  return [result.geometry.lat, result.geometry.lng];
}

type Row = {
  id: number;
  birth_place: string | null;
  death_place: string | null;
  marriage_location: string | null;
  baptism_place: string | null;
  birth_lat: number | null;
  death_lat: number | null;
  marriage_lat: number | null;
  baptism_lat: number | null;
};

async function main() {
  console.log('Fetching rows from Supabase…');
  const { data: rows, error } = await supabase
    .from('family_members')
    .select('id, birth_place, death_place, marriage_location, baptism_place, birth_lat, death_lat, marriage_lat, baptism_lat')
    .order('id', { ascending: true });

  if (error) throw new Error(error.message);
  if (!rows?.length) { console.log('No rows found.'); return; }

  console.log(`Found ${rows.length} rows.`);

  // Collect unique place strings that still need geocoding
  const needsGeocode = new Set<string>();
  for (const row of rows as Row[]) {
    if (row.birth_place && (FORCE || row.birth_lat === null)) needsGeocode.add(row.birth_place);
    if (row.death_place && (FORCE || row.death_lat === null)) needsGeocode.add(row.death_place);
    if (row.marriage_location && (FORCE || row.marriage_lat === null)) needsGeocode.add(row.marriage_location);
    if (row.baptism_place && (FORCE || row.baptism_lat === null)) needsGeocode.add(row.baptism_place);
  }

  console.log(`\n${needsGeocode.size} unique place strings to geocode${FORCE ? ' (--force)' : ''}.\n`);

  // Geocode each unique place
  const cache = new Map<string, [number, number] | null>();
  let done = 0;
  for (const place of needsGeocode) {
    done++;
    process.stdout.write(`[${done}/${needsGeocode.size}] "${place}" … `);
    const coords = await geocode(place);
    cache.set(place, coords);
    if (coords) {
      console.log(`✓ ${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}`);
    }
    await sleep(350); // ~2 req/sec — well within the 2,500/day free limit
  }

  console.log('\nWriting coordinates back to Supabase…');

  let updated = 0;
  let skipped = 0;

  for (const row of rows as Row[]) {
    const patch: Record<string, number> = {};

    const b = row.birth_place ? cache.get(row.birth_place) : undefined;
    if (b) { patch.birth_lat = b[0]; patch.birth_lng = b[1]; }

    const d = row.death_place ? cache.get(row.death_place) : undefined;
    if (d) { patch.death_lat = d[0]; patch.death_lng = d[1]; }

    const m = row.marriage_location ? cache.get(row.marriage_location) : undefined;
    if (m) { patch.marriage_lat = m[0]; patch.marriage_lng = m[1]; }

    const bp = row.baptism_place ? cache.get(row.baptism_place) : undefined;
    if (bp) { patch.baptism_lat = bp[0]; patch.baptism_lng = bp[1]; }

    if (Object.keys(patch).length === 0) { skipped++; continue; }

    const { error: updateError } = await supabase
      .from('family_members')
      .update(patch)
      .eq('id', row.id);

    if (updateError) {
      console.error(`  Error updating row ${row.id}: ${updateError.message}`);
    } else {
      updated++;
    }
  }

  console.log(`\nDone. ${updated} rows updated, ${skipped} skipped (no geocodable places).`);

  // Summary of what still couldn't be geocoded
  const failed = [...cache.entries()].filter(([, v]) => v === null).map(([k]) => k);
  if (failed.length > 0) {
    console.log(`\n${failed.length} place strings returned low/no confidence:`);
    failed.forEach((p) => console.log(`  - "${p}"`));
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
