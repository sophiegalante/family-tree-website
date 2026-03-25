# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server at http://localhost:8080
npm run build      # Production build
npm run lint       # Run ESLint
npm test           # Run tests once
npm run test:watch # Run tests in watch mode
```

## Environment Variables

Create `.env.local` with:
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase public anon key
- `VITE_GITHUB_TOKEN` — GitHub token (optional, for repo activity feed)

## Architecture

**Stack:** React 18 + TypeScript, Vite, Tailwind CSS + shadcn/ui, React Router 6, TanStack Query, Supabase.

**Data flow:**
1. `useFamilyMembers` hook fetches from Supabase `family_members` table via TanStack Query
2. Raw `FamilyMemberRow` records are transformed into `FamilyMember` objects (see `src/data/familyData.ts`)
3. Components receive `FamilyMember[]` and render Tree/Timeline/Map views

**Routing** (`src/App.tsx`):
- `/` — Home page with stats and Arthur Haddock tribute
- `/explore?view=tree|timeline|map` — Main explore hub; view mode is a URL query param
- `/member/:id` — Individual member profile
- `/origin` — Etymology of the Haddock surname

**Key relationships:**
- `src/lib/supabase.ts` — Supabase client
- `src/lib/github.ts` — GitHub API (recent commits/PRs for activity feed on Home)
- `src/hooks/useFamilyMembers.ts` — Primary data hook; transforms DB rows to `FamilyMember`
- `src/data/familyData.ts` — `FamilyMember` type definition and helper functions (getEras, getBranches)
- `src/data/historicalEvents.ts` — Static historical context shown in TimelineView

**Family branches** (mapped by `pageId`):
- `p1` = Haddock-Henderson
- `p2` = Henderson-Mosey
- `p3` = Haddock-Ainsley
- `p4` = Haddock-Stones

**TreeView** builds parent-child relationships by matching `commonName` or `firstName+lastName` against each member's `parent1Name`/`parent2Name` fields. It auto-expands 2 levels on load.

**MapView** uses Leaflet with hard-coded geocoordinates for Yorkshire/Durham locations stored in the component itself.

## Supabase Schema

Table `family_members`: `id`, `person_id`, `family_line`, `common_name`, `first_name`, `middle_name`, `last_name`, `birth_date`, `birth_place`, `baptism_date`, `baptism_place`, `parent_1`, `parent_2`, `death_date`, `death_place`, `spouse_name`, `marriage_date`, `marriage_location`, `children` (semicolon-delimited).

## UI Components

All UI primitives live in `src/components/ui/` (shadcn/ui over Radix UI). Import from `@/components/ui/<component>`. Add new shadcn components with `npx shadcn@latest add <component>`.

Path alias `@` maps to `src/`.
