# The Haddock Family Heritage Project

A digital family history website tracing the Haddock family from 12th-century Durham through centuries of farming, faith, and adventure across England and beyond. Dedicated to the memory of **Arthur Haddock**, whose decades of research made this possible.

## Features

- **Family Tree** — Navigate branches and discover connections across generations
- **Timeline** — Walk through centuries of family history with historical context
- **Map** — Trace birth and marriage locations across England and beyond
- **Member Profiles** — Detailed pages for individual family members
- **Origin of the Name** — The history and etymology of the Haddock surname
- **Recent Updates** — Live feed of changes pulled from this GitHub repository

## Tech Stack

- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) — build tool and dev server
- [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) — styling and components
- [Supabase](https://supabase.com/) — family member database
- [TanStack Query](https://tanstack.com/query) — data fetching and caching
- [React Router](https://reactrouter.com/) — client-side routing
- [Leaflet](https://leafletjs.com/) — interactive maps

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Setup

```sh
# Clone the repository
git clone https://github.com/sophiegalante/family-tree-website.git
cd family-tree-website

# Install dependencies
npm install

# Create a .env.local file with your credentials
cp .env.example .env.local
# Then fill in your Supabase and GitHub token values

# Start the development server
npm run dev
```

The app will be available at `http://localhost:8080`.

### Environment Variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key |
| `VITE_GITHUB_TOKEN` | GitHub personal access token (needed for private repo) |

## Data

Family member data is stored in a Supabase `family_members` table. Historical events are static and defined in `src/data/historicalEvents.ts`.
