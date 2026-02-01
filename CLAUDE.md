# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start Vite dev server
pnpm build        # TypeScript compilation + Vite build
pnpm lint         # Prettier formatting + ESLint fixing
pnpm test         # Run all tests (types + unit + component)
pnpm test:unit    # Vitest unit tests only
pnpm test:types   # TypeScript type checking only
pnpm test:cypress:dev  # Cypress component tests (interactive)
pnpm test:cypress:ci   # Cypress component tests (CI mode)
```

## Architecture

**CountryGuessr** is a geography guessing game where players identify 178 countries on an interactive map within time and life constraints.

### Tech Stack
- React 19 + TypeScript 5.9 + Vite 7
- TanStack Router (file-based routing with `.lazy.tsx` files)
- Leaflet/React-Leaflet for map rendering
- Tailwind CSS + Shadcn/ui (Radix primitives)
- Vitest + Cypress for testing
- Cloudflare Pages for deployment

### Key Directories
- `src/routes/` - TanStack Router file-based routes (`__root.tsx` is root layout)
- `src/contexts/GameContext.tsx` - Centralized game state (lives, time, guesses, game status)
- `src/components/ui/` - Shadcn/ui generated components (avoid editing directly)
- `src/lib/` - Utility functions (storage, country navigation, region mapping)
- `src/types/` - TypeScript definitions for game state and country data
- `public/data/countries.geojson` - Pre-processed 178-country dataset

### State Management
Game state flows through `GameContext` using React Context API. The context manages:
- Game status (playing, paused, won, lost)
- Current country selection and guessing
- Lives (3 initial) and timer (30 min)
- Persistence via localStorage with auto-resume and v1→v2 migration

### Routing
TanStack Router auto-generates route tree from `src/routes/`. Routes use lazy loading pattern:
- `index.lazy.tsx` - Main game page
- `stats.lazy.tsx` - Game statistics page

### Path Alias
`@/*` maps to `src/*` (configured in tsconfig.json and vite.config.ts)

## Code Style

ESLint enforces import ordering: React → External packages → Internal (`@/`) → Assets → Styles

Test files are colocated with source files using `.test.ts` (unit) and `.cy.tsx` (component) suffixes.
