# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**YMC Cronotimer** - Multi-tenant CrossFit timer application for creating, managing, and executing workouts with TV display optimization.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite 5
- **Styling**: Tailwind CSS 3
- **State**: Zustand 4
- **Backend**: Supabase (Postgres + Auth + Realtime)
- **Routing**: React Router 7
- **Offline**: Dexie.js (IndexedDB)

## Development Commands

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Database Commands

```bash
# Create new migration
npx supabase migration new <name>

# Generate TypeScript types from schema (when linked)
npx supabase gen types typescript --linked > src/types/database.types.ts
```

## Architecture

### Directory Structure

```
src/
├── app/              # App setup (routes, providers)
├── features/         # Feature modules
│   ├── auth/        # Authentication
│   ├── editor/      # Workout editor
│   ├── execution/   # Timer and TV display
│   ├── remote/      # Remote control
│   └── library/     # Workout library
├── shared/          # Shared utilities
│   ├── components/  # Reusable UI components
│   ├── hooks/       # Reusable hooks
│   └── utils/       # Utility functions
└── types/           # TypeScript type definitions
```

### Key Architectural Patterns

**Multi-tenancy**: All data isolated by `box_id`. RLS policies enforce isolation at database level.

**Offline-first**:
- UI state → Zustand (memory)
- Local cache → Dexie (IndexedDB)
- Source of truth → Supabase (Postgres)

**Real-time sync**: Supabase Realtime for multi-device coordination.

**Authentication**:
- Supabase Auth (JWT)
- User roles: owner, coach, athlete
- Protected routes enforce role-based access

## Design Documents

- Full design: `docs/plans/2025-11-20-cronotimer-design.md`
- Implementation plan: `docs/plans/2025-11-20-initial-setup.md`

## Environment Setup

1. Copy `.env.local` from deployment guide or create with:
   - `VITE_SUPABASE_URL` - Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key
2. Never commit `.env.local` (contains secrets)

## Multi-Tenant Data Model

**Key tables:**
- `boxes` - CrossFit box/gym (tenant)
- `users` - Extends Supabase auth with box_id and role
- `workouts` - Hierarchical: Workout → Section → Exercise → Round
- RLS policies ensure box isolation

## Current State

✅ Project scaffolded (Vite + React + TypeScript + Tailwind)
✅ Supabase client and types configured
✅ Database schema created with RLS policies (migrations in supabase/migrations/)
✅ Auth store and login page implemented
✅ Protected routes with role-based access
⏳ Database migrations need to be pushed to remote (requires Supabase login)
⏳ Editor module (next)
⏳ TV execution module
⏳ Remote control module
⏳ Library module
⏳ Offline sync

## Next Steps

The foundation is complete. Next steps are:
1. Link Supabase CLI and push migrations to remote database
2. Begin implementing feature modules starting with Editor
3. See `docs/plans/2025-11-20-initial-setup.md` for detailed task breakdown
