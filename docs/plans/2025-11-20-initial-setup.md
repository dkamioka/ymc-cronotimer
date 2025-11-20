# YMC Cronotimer - Initial Setup Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use ring:executing-plans to implement this plan task-by-task.

**Goal:** Set up React PWA project with Vite, TypeScript, Tailwind, and connect to Supabase backend with multi-tenant database schema.

**Architecture:** React 18 PWA frontend using Vite build tool, TypeScript for type safety, Tailwind for styling, Zustand for state management, Supabase for backend (Postgres + Auth + Realtime).

**Tech Stack:**
- Frontend: React 18, TypeScript 5, Vite 5, Tailwind CSS 3
- State: Zustand 4
- Backend: Supabase (Postgres, Auth, Realtime)
- Routing: React Router 6

**Global Prerequisites:**
- Environment: Linux/macOS/WSL2, Node.js 18+, npm 9+
- Tools: git, curl, supabase CLI
- Access: Supabase account (free tier), internet connection
- State: Clean working tree on `feature/initial-setup` branch in worktree

**Verification before starting:**
```bash
# Run ALL these commands and verify output:
node --version     # Expected: v18.0.0 or higher
npm --version      # Expected: 9.0.0 or higher
git --version      # Expected: 2.0.0 or higher
git branch --show-current  # Expected: feature/initial-setup
pwd                # Expected: <path>/.worktrees/feature/initial-setup
```

---

## Task 1: Initialize Vite + React + TypeScript Project

**Files:**
- Create: `package.json` (via npm create)
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/vite-env.d.ts`

**Prerequisites:**
- Node.js 18+, npm 9+
- Current directory: worktree root

**Step 1: Create Vite project with React + TypeScript template**

```bash
npm create vite@latest . -- --template react-ts
```

**Expected output:**
```
Scaffolding project in <path>...
Done. Now run:
  npm install
```

**If error "directory not empty":** This is expected, Vite will merge with existing files.

**Step 2: Install dependencies**

```bash
npm install
```

**Expected output:**
```
added XXX packages
```

**Step 3: Verify dev server works**

```bash
npm run dev
```

**Expected output:**
```
VITE v5.x.x ready in XXX ms
➜  Local:   http://localhost:5173/
```

Press Ctrl+C to stop server.

**Step 4: Verify project structure**

```bash
ls -la
```

**Expected files:**
- package.json
- vite.config.ts
- tsconfig.json
- index.html
- src/main.tsx
- src/App.tsx
- node_modules/

**Step 5: Commit**

```bash
git add .
git commit -m "chore: initialize Vite + React + TypeScript project"
```

---

## Task 2: Install and Configure Tailwind CSS

**Files:**
- Modify: `package.json` (via npm install)
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `src/index.css`
- Modify: `src/main.tsx`

**Prerequisites:**
- Task 1 completed
- npm dependencies installed

**Step 1: Install Tailwind and dependencies**

```bash
npm install -D tailwindcss postcss autoprefixer
```

**Step 2: Initialize Tailwind config**

```bash
npx tailwindcss init -p
```

**Expected output:**
```
Created Tailwind config file: tailwind.config.js
Created PostCSS config file: postcss.config.js
```

**Step 3: Configure Tailwind content paths**

Replace content of `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**Step 4: Create Tailwind CSS file**

Create `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Step 5: Import CSS in main.tsx**

Modify `src/main.tsx` to import the CSS file. Add at the top:

```typescript
import './index.css'
```

**Step 6: Test Tailwind is working**

Modify `src/App.tsx` to use Tailwind classes:

```tsx
function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <h1 className="text-4xl font-bold">YMC Cronotimer</h1>
    </div>
  )
}

export default App
```

**Step 7: Verify Tailwind styles work**

```bash
npm run dev
```

Open browser to `http://localhost:5173/` - should see dark background with white text centered.

Press Ctrl+C to stop server.

**Step 8: Commit**

```bash
git add .
git commit -m "chore: add and configure Tailwind CSS"
```

---

## Task 3: Install Core Dependencies

**Files:**
- Modify: `package.json` (via npm install)

**Prerequisites:**
- Task 2 completed

**Step 1: Install routing**

```bash
npm install react-router-dom
```

**Step 2: Install state management**

```bash
npm install zustand
```

**Step 3: Install Supabase client**

```bash
npm install @supabase/supabase-js
```

**Step 4: Install offline storage**

```bash
npm install dexie dexie-react-hooks
```

**Step 5: Install UI components and utilities**

```bash
npm install @headlessui/react @heroicons/react clsx
```

**Step 6: Install form handling**

```bash
npm install react-hook-form zod @hookform/resolvers
```

**Step 7: Install date utilities**

```bash
npm install date-fns
```

**Step 8: Install ID generation**

```bash
npm install nanoid
```

**Step 9: Verify all installed**

```bash
cat package.json | grep -A 20 '"dependencies"'
```

**Expected:** Should see all packages listed above.

**Step 10: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install core dependencies"
```

---

## Task 4: Set Up Project Structure

**Files:**
- Create: `src/app/App.tsx` (move from src/)
- Create: `src/app/routes.tsx`
- Create: `src/app/providers.tsx`
- Create: `src/features/.gitkeep`
- Create: `src/shared/components/.gitkeep`
- Create: `src/shared/hooks/.gitkeep`
- Create: `src/shared/utils/.gitkeep`
- Create: `src/types/.gitkeep`
- Modify: `src/main.tsx`

**Prerequisites:**
- Task 3 completed

**Step 1: Create directory structure**

```bash
mkdir -p src/app
mkdir -p src/features/auth/{components,hooks,store}
mkdir -p src/features/editor/{components,hooks,store}
mkdir -p src/features/execution/{components,hooks,workers}
mkdir -p src/features/remote/{components,hooks}
mkdir -p src/features/library/{components,hooks}
mkdir -p src/shared/{components,hooks,utils}
mkdir -p src/types
```

**Step 2: Move App.tsx to app directory**

```bash
mv src/App.tsx src/app/App.tsx
```

**Step 3: Create routes configuration**

Create `src/app/routes.tsx`:

```tsx
import { createBrowserRouter } from 'react-router-dom';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <div>Home</div>,
  },
  {
    path: '/:boxSlug',
    children: [
      {
        path: 'dashboard',
        element: <div>Dashboard</div>,
      },
      {
        path: 'editor/:workoutSlug?',
        element: <div>Editor</div>,
      },
      {
        path: 'tv/:workoutSlug',
        element: <div>TV Mode</div>,
      },
      {
        path: 'remote/:sessionCode',
        element: <div>Remote Control</div>,
      },
    ],
  },
]);
```

**Step 4: Create providers file**

Create `src/app/providers.tsx`:

```tsx
import { ReactNode } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';

interface ProvidersProps {
  children?: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return <RouterProvider router={router} />;
}
```

**Step 5: Update main.tsx to use new structure**

Replace content of `src/main.tsx`:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Providers } from './app/providers'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers />
  </StrictMode>,
)
```

**Step 6: Verify app still runs**

```bash
npm run dev
```

Should see "Home" text at `http://localhost:5173/`

Press Ctrl+C to stop.

**Step 7: Commit**

```bash
git add .
git commit -m "chore: set up project structure and routing"
```

---

## Task 5: Create Supabase Project and Get Credentials

**Files:**
- Create: `.env.local`
- Create: `.env.example`
- Modify: `.gitignore` (verify .env.local is ignored)

**Prerequisites:**
- Task 4 completed
- Supabase account created at https://supabase.com

**Step 1: Create Supabase project**

Manual steps (do in browser):
1. Go to https://app.supabase.com
2. Click "New Project"
3. Organization: Select or create
4. Name: "ymc-cronotimer"
5. Database Password: Generate strong password (save it!)
6. Region: Choose closest to Brazil
7. Click "Create new project"
8. Wait 2-3 minutes for provisioning

**Step 2: Get project credentials**

In Supabase dashboard:
1. Go to Settings > API
2. Copy "Project URL" (looks like: https://xxxxx.supabase.co)
3. Copy "anon public" API key (long string starting with "eyJ...")

**Step 3: Create .env.local file**

Create `.env.local` (replace XXX with your actual values):

```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
```

**Step 4: Create .env.example template**

Create `.env.example`:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Step 5: Verify .gitignore includes .env.local**

```bash
grep -q "^\.env\.local$" .gitignore && echo "Already ignored" || echo ".env.local" >> .gitignore
```

**Step 6: Verify environment variables load**

Add to `src/app/App.tsx` temporarily:

```tsx
function App() {
  console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <h1 className="text-4xl font-bold">YMC Cronotimer</h1>
    </div>
  )
}

export default App
```

**Step 7: Test environment loading**

```bash
npm run dev
```

Open browser console - should see your Supabase URL printed.

Press Ctrl+C to stop.

**Step 8: Remove console.log from App.tsx**

Remove the console.log line added in Step 6.

**Step 9: Commit**

```bash
git add .env.example .gitignore
git commit -m "chore: add Supabase environment configuration"
```

**Note:** `.env.local` should NOT be committed (contains secrets).

---

## Task 6: Create Supabase Client Utility

**Files:**
- Create: `src/shared/utils/supabase.ts`
- Create: `src/types/database.types.ts`

**Prerequisites:**
- Task 5 completed
- .env.local file exists with valid credentials

**Step 1: Create database types file**

Create `src/types/database.types.ts`:

```typescript
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      boxes: {
        Row: {
          id: string
          name: string
          slug: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          box_id: string
          role: 'owner' | 'coach' | 'athlete'
          created_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          box_id: string
          role: 'owner' | 'coach' | 'athlete'
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          box_id?: string
          role?: 'owner' | 'coach' | 'athlete'
          created_at?: string
        }
      }
      // More tables will be added as we create migrations
    }
  }
}
```

**Step 2: Create Supabase client**

Create `src/shared/utils/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../types/database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Check .env.local file.'
  )
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})
```

**Step 3: Create hook for Supabase client**

Create `src/shared/hooks/useSupabase.ts`:

```typescript
import { supabase } from '../utils/supabase'

export function useSupabase() {
  return supabase
}
```

**Step 4: Test Supabase connection**

Add to `src/app/App.tsx` temporarily:

```tsx
import { useEffect } from 'react'
import { useSupabase } from '../shared/hooks/useSupabase'

function App() {
  const supabase = useSupabase()

  useEffect(() => {
    async function testConnection() {
      const { data, error } = await supabase.from('boxes').select('count')
      if (error) {
        console.log('Supabase connected (table does not exist yet):', error.message)
      } else {
        console.log('Supabase connected:', data)
      }
    }
    testConnection()
  }, [supabase])

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <h1 className="text-4xl font-bold">YMC Cronotimer</h1>
    </div>
  )
}

export default App
```

**Step 5: Verify connection**

```bash
npm run dev
```

Check browser console - should see message about table not existing (expected at this stage).

Press Ctrl+C to stop.

**Step 6: Remove test code from App.tsx**

Remove the useEffect and import added in Step 4.

**Step 7: Commit**

```bash
git add .
git commit -m "feat: create Supabase client and connection utilities"
```

---

## Task 7: Initialize Supabase CLI and Local Development

**Files:**
- Create: `supabase/config.toml`
- Create: `supabase/.gitignore`

**Prerequisites:**
- Task 6 completed
- Supabase CLI installed (if not: `npm install -g supabase`)

**Step 1: Verify Supabase CLI is installed**

```bash
supabase --version
```

**Expected output:**
```
supabase version X.X.X
```

**If not installed:**
```bash
npm install -g supabase
```

**Step 2: Initialize Supabase in project**

```bash
supabase init
```

**Expected output:**
```
Finished supabase init.
```

**Step 3: Verify supabase directory created**

```bash
ls -la supabase/
```

**Expected files:**
- config.toml
- .gitignore

**Step 4: Link to remote Supabase project**

Get your project reference ID from Supabase dashboard (Settings > General > Reference ID).

```bash
supabase link --project-ref your-project-ref
```

**When prompted for database password:** Enter the password you saved when creating the project.

**Expected output:**
```
Finished supabase link.
```

**Step 5: Commit**

```bash
git add supabase/
git commit -m "chore: initialize Supabase CLI and link project"
```

---

## Task 8: Create Database Schema Migration - Part 1 (Boxes and Users)

**Files:**
- Create: `supabase/migrations/20241120000001_create_boxes_and_users.sql`

**Prerequisites:**
- Task 7 completed
- Supabase CLI linked to project

**Step 1: Create migration file**

```bash
supabase migration new create_boxes_and_users
```

**Expected output:**
```
Created new migration at supabase/migrations/XXXXXX_create_boxes_and_users.sql
```

Note the actual filename (will have timestamp).

**Step 2: Add boxes table to migration**

Edit the migration file created (in `supabase/migrations/`):

```sql
-- Create boxes table
CREATE TABLE IF NOT EXISTS public.boxes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on slug for fast lookups
CREATE INDEX idx_boxes_slug ON public.boxes(slug);

-- Enable RLS
ALTER TABLE public.boxes ENABLE ROW LEVEL SECURITY;

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  box_id UUID NOT NULL REFERENCES public.boxes(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'coach', 'athlete')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_users_box_id ON public.users(box_id);
CREATE INDEX idx_users_email ON public.users(email);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
```

**Step 3: Apply migration locally (dry run)**

```bash
supabase db reset
```

**Expected output:**
```
Applying migration XXXXXX_create_boxes_and_users.sql...
Finished supabase db reset.
```

**Step 4: Push migration to remote Supabase**

```bash
supabase db push
```

**Expected output:**
```
Applying migrations...
Finished supabase db push.
```

**Step 5: Verify tables created in Supabase dashboard**

Manual verification:
1. Go to Supabase dashboard
2. Click "Table Editor"
3. Should see `boxes` and `users` tables

**Step 6: Commit**

```bash
git add supabase/migrations/
git commit -m "feat: create boxes and users tables with RLS"
```

---

## Task 9: Create Database Schema Migration - Part 2 (Workouts)

**Files:**
- Create: `supabase/migrations/20241120000002_create_workouts.sql`

**Prerequisites:**
- Task 8 completed
- boxes and users tables exist

**Step 1: Create migration file**

```bash
supabase migration new create_workouts
```

**Step 2: Add workout tables to migration**

Edit the new migration file:

```sql
-- Create workouts table
CREATE TABLE IF NOT EXISTS public.workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  box_id UUID NOT NULL REFERENCES public.boxes(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  tags TEXT[],
  is_template BOOLEAN DEFAULT FALSE,
  total_duration INTERVAL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(box_id, slug)
);

-- Create indexes
CREATE INDEX idx_workouts_box_id ON public.workouts(box_id);
CREATE INDEX idx_workouts_date ON public.workouts(date);
CREATE INDEX idx_workouts_slug ON public.workouts(slug);
CREATE INDEX idx_workouts_tags ON public.workouts USING GIN(tags);

-- Enable RLS
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;

-- Create sections table
CREATE TABLE IF NOT EXISTS public.sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  color TEXT,
  repeat_count INTEGER DEFAULT 1,
  exclude_from_total BOOLEAN DEFAULT FALSE
);

-- Create index
CREATE INDEX idx_sections_workout_id ON public.sections(workout_id);

-- Enable RLS
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;

-- Create exercises table
CREATE TABLE IF NOT EXISTS public.exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  notes TEXT,
  "order" INTEGER NOT NULL
);

-- Create index
CREATE INDEX idx_exercises_section_id ON public.exercises(section_id);

-- Enable RLS
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

-- Create rounds table
CREATE TABLE IF NOT EXISTS public.rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  duration INTERVAL NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('countup', 'countdown')),
  color TEXT,
  exclude_from_total BOOLEAN DEFAULT FALSE,
  "order" INTEGER NOT NULL
);

-- Create index
CREATE INDEX idx_rounds_exercise_id ON public.rounds(exercise_id);

-- Enable RLS
ALTER TABLE public.rounds ENABLE ROW LEVEL SECURITY;

-- Create execution_logs table
CREATE TABLE IF NOT EXISTS public.execution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  round_id UUID NOT NULL REFERENCES public.rounds(id) ON DELETE CASCADE,
  planned_duration INTERVAL NOT NULL,
  actual_duration INTERVAL NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ NOT NULL
);

-- Create indexes
CREATE INDEX idx_execution_logs_workout_id ON public.execution_logs(workout_id);
CREATE INDEX idx_execution_logs_started_at ON public.execution_logs(started_at);

-- Enable RLS
ALTER TABLE public.execution_logs ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to workouts table
CREATE TRIGGER update_workouts_updated_at
  BEFORE UPDATE ON public.workouts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Step 3: Apply migration locally**

```bash
supabase db reset
```

**Step 4: Push to remote**

```bash
supabase db push
```

**Step 5: Verify in Supabase dashboard**

Should now see: boxes, users, workouts, sections, exercises, rounds, execution_logs

**Step 6: Commit**

```bash
git add supabase/migrations/
git commit -m "feat: create workout hierarchy tables (sections, exercises, rounds)"
```

---

## Task 10: Create RLS Policies for Multi-Tenant Isolation

**Files:**
- Create: `supabase/migrations/20241120000003_create_rls_policies.sql`

**Prerequisites:**
- Task 9 completed
- All tables created with RLS enabled

**Step 1: Create migration file**

```bash
supabase migration new create_rls_policies
```

**Step 2: Add RLS policies to migration**

Edit the new migration file:

```sql
-- ============================================
-- RLS POLICIES FOR MULTI-TENANT ISOLATION
-- ============================================

-- Helper function: Get current user's box_id
CREATE OR REPLACE FUNCTION auth.user_box_id()
RETURNS UUID AS $$
  SELECT box_id FROM public.users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- ============================================
-- BOXES TABLE POLICIES
-- ============================================

-- Users can view their own box
CREATE POLICY "users_can_view_own_box"
  ON public.boxes
  FOR SELECT
  USING (
    id IN (SELECT box_id FROM public.users WHERE id = auth.uid())
  );

-- Only owners can update their box
CREATE POLICY "owners_can_update_own_box"
  ON public.boxes
  FOR UPDATE
  USING (
    id IN (
      SELECT box_id FROM public.users
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

-- Users can view users in their box
CREATE POLICY "users_can_view_box_members"
  ON public.users
  FOR SELECT
  USING (box_id = auth.user_box_id());

-- Owners and coaches can insert new users in their box
CREATE POLICY "owners_coaches_can_add_users"
  ON public.users
  FOR INSERT
  WITH CHECK (
    box_id = auth.user_box_id()
    AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('owner', 'coach')
    )
  );

-- Only owners can update users
CREATE POLICY "owners_can_update_users"
  ON public.users
  FOR UPDATE
  USING (
    box_id = auth.user_box_id()
    AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

-- Only owners can delete users
CREATE POLICY "owners_can_delete_users"
  ON public.users
  FOR DELETE
  USING (
    box_id = auth.user_box_id()
    AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

-- ============================================
-- WORKOUTS TABLE POLICIES
-- ============================================

-- Users can view workouts from their box
CREATE POLICY "users_can_view_box_workouts"
  ON public.workouts
  FOR SELECT
  USING (box_id = auth.user_box_id());

-- Coaches and owners can create workouts
CREATE POLICY "coaches_owners_can_create_workouts"
  ON public.workouts
  FOR INSERT
  WITH CHECK (
    box_id = auth.user_box_id()
    AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('owner', 'coach')
    )
  );

-- Coaches and owners can update workouts in their box
CREATE POLICY "coaches_owners_can_update_workouts"
  ON public.workouts
  FOR UPDATE
  USING (
    box_id = auth.user_box_id()
    AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('owner', 'coach')
    )
  );

-- Coaches and owners can delete workouts in their box
CREATE POLICY "coaches_owners_can_delete_workouts"
  ON public.workouts
  FOR DELETE
  USING (
    box_id = auth.user_box_id()
    AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('owner', 'coach')
    )
  );

-- ============================================
-- SECTIONS, EXERCISES, ROUNDS POLICIES
-- (Inherit isolation from parent workout via FK)
-- ============================================

-- Sections: Users can view sections from workouts in their box
CREATE POLICY "users_can_view_sections"
  ON public.sections
  FOR SELECT
  USING (
    workout_id IN (
      SELECT id FROM public.workouts WHERE box_id = auth.user_box_id()
    )
  );

CREATE POLICY "coaches_owners_can_manage_sections"
  ON public.sections
  FOR ALL
  USING (
    workout_id IN (
      SELECT id FROM public.workouts WHERE box_id = auth.user_box_id()
    )
    AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('owner', 'coach')
    )
  );

-- Exercises: Same pattern
CREATE POLICY "users_can_view_exercises"
  ON public.exercises
  FOR SELECT
  USING (
    section_id IN (
      SELECT s.id FROM public.sections s
      JOIN public.workouts w ON s.workout_id = w.id
      WHERE w.box_id = auth.user_box_id()
    )
  );

CREATE POLICY "coaches_owners_can_manage_exercises"
  ON public.exercises
  FOR ALL
  USING (
    section_id IN (
      SELECT s.id FROM public.sections s
      JOIN public.workouts w ON s.workout_id = w.id
      WHERE w.box_id = auth.user_box_id()
    )
    AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('owner', 'coach')
    )
  );

-- Rounds: Same pattern
CREATE POLICY "users_can_view_rounds"
  ON public.rounds
  FOR SELECT
  USING (
    exercise_id IN (
      SELECT e.id FROM public.exercises e
      JOIN public.sections s ON e.section_id = s.id
      JOIN public.workouts w ON s.workout_id = w.id
      WHERE w.box_id = auth.user_box_id()
    )
  );

CREATE POLICY "coaches_owners_can_manage_rounds"
  ON public.rounds
  FOR ALL
  USING (
    exercise_id IN (
      SELECT e.id FROM public.exercises e
      JOIN public.sections s ON e.section_id = s.id
      JOIN public.workouts w ON s.workout_id = w.id
      WHERE w.box_id = auth.user_box_id()
    )
    AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('owner', 'coach')
    )
  );

-- ============================================
-- EXECUTION LOGS POLICIES
-- ============================================

-- All users can view execution logs from their box
CREATE POLICY "users_can_view_execution_logs"
  ON public.execution_logs
  FOR SELECT
  USING (
    workout_id IN (
      SELECT id FROM public.workouts WHERE box_id = auth.user_box_id()
    )
  );

-- All users can create execution logs (when executing workouts)
CREATE POLICY "users_can_create_execution_logs"
  ON public.execution_logs
  FOR INSERT
  WITH CHECK (
    workout_id IN (
      SELECT id FROM public.workouts WHERE box_id = auth.user_box_id()
    )
  );
```

**Step 3: Apply migration**

```bash
supabase db reset
```

**Step 4: Push to remote**

```bash
supabase db push
```

**Step 5: Verify RLS policies in dashboard**

In Supabase dashboard:
1. Go to Authentication > Policies
2. Should see all policies listed for each table

**Step 6: Commit**

```bash
git add supabase/migrations/
git commit -m "feat: add RLS policies for multi-tenant isolation"
```

---

## Task 11: Update TypeScript Database Types

**Files:**
- Modify: `src/types/database.types.ts`

**Prerequisites:**
- Task 10 completed
- All migrations applied to Supabase

**Step 1: Generate types from Supabase**

```bash
supabase gen types typescript --local > src/types/database.types.ts
```

**Expected output:**
```
Generated types at src/types/database.types.ts
```

**Step 2: Verify file was generated**

```bash
wc -l src/types/database.types.ts
```

**Expected:** Should have 100+ lines (contains all table definitions).

**Step 3: Commit**

```bash
git add src/types/database.types.ts
git commit -m "chore: generate TypeScript types from database schema"
```

---

## Task 12: Create Basic Auth Store with Zustand

**Files:**
- Create: `src/features/auth/store/authStore.ts`
- Create: `src/features/auth/hooks/useAuth.ts`

**Prerequisites:**
- Task 11 completed

**Step 1: Create auth store**

Create `src/features/auth/store/authStore.ts`:

```typescript
import { create } from 'zustand'
import { User, Session } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  boxId: string | null
  role: 'owner' | 'coach' | 'athlete' | null
  setAuth: (user: User | null, session: Session | null) => void
  setUserProfile: (boxId: string, role: 'owner' | 'coach' | 'athlete') => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,
  boxId: null,
  role: null,
  setAuth: (user, session) => set({ user, session, loading: false }),
  setUserProfile: (boxId, role) => set({ boxId, role }),
  clearAuth: () => set({
    user: null,
    session: null,
    loading: false,
    boxId: null,
    role: null
  }),
}))
```

**Step 2: Create auth hook**

Create `src/features/auth/hooks/useAuth.ts`:

```typescript
import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../../../shared/utils/supabase'

export function useAuth() {
  const { user, session, loading, boxId, role, setAuth, setUserProfile, clearAuth } = useAuthStore()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuth(session?.user ?? null, session)

      // If user exists, fetch their profile
      if (session?.user) {
        fetchUserProfile(session.user.id)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuth(session?.user ?? null, session)

      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        clearAuth()
      }
    })

    return () => subscription.unsubscribe()
  }, [setAuth, setUserProfile, clearAuth])

  async function fetchUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('box_id, role')
      .eq('id', userId)
      .single()

    if (data && !error) {
      setUserProfile(data.box_id, data.role)
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
    clearAuth()
  }

  return {
    user,
    session,
    loading,
    boxId,
    role,
    signOut,
    isAuthenticated: !!user,
    isOwner: role === 'owner',
    isCoach: role === 'coach' || role === 'owner',
  }
}
```

**Step 3: Test auth hook compiles**

```bash
npm run build
```

**Expected output:**
```
✓ built in XXXms
```

**If errors:** Check imports and TypeScript syntax.

**Step 4: Commit**

```bash
git add src/features/auth/
git commit -m "feat: create auth store and hook with Zustand"
```

---

## Task 13: Create Login Page Component

**Files:**
- Create: `src/features/auth/components/LoginPage.tsx`
- Modify: `src/app/routes.tsx`

**Prerequisites:**
- Task 12 completed

**Step 1: Create login page component**

Create `src/features/auth/components/LoginPage.tsx`:

```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../../shared/utils/supabase'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (data.user) {
      // Fetch user's box slug to redirect
      const { data: userData } = await supabase
        .from('users')
        .select('box_id, boxes(slug)')
        .eq('id', data.user.id)
        .single()

      if (userData?.boxes) {
        navigate(`/${userData.boxes.slug}/dashboard`)
      }
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-white text-center">
            YMC Cronotimer
          </h1>
          <p className="mt-2 text-center text-gray-400">
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

**Step 2: Add login route**

Modify `src/app/routes.tsx`:

```tsx
import { createBrowserRouter } from 'react-router-dom';
import { LoginPage } from '../features/auth/components/LoginPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LoginPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/:boxSlug',
    children: [
      {
        path: 'dashboard',
        element: <div className="text-white p-8">Dashboard (coming soon)</div>,
      },
      {
        path: 'editor/:workoutSlug?',
        element: <div className="text-white p-8">Editor (coming soon)</div>,
      },
      {
        path: 'tv/:workoutSlug',
        element: <div className="text-white p-8">TV Mode (coming soon)</div>,
      },
      {
        path: 'remote/:sessionCode',
        element: <div className="text-white p-8">Remote Control (coming soon)</div>,
      },
    ],
  },
]);
```

**Step 3: Test login page renders**

```bash
npm run dev
```

Open `http://localhost:5173/` - should see login form.

Press Ctrl+C to stop.

**Step 4: Commit**

```bash
git add .
git commit -m "feat: create login page component and route"
```

---

## Task 14: Create Protected Route Component

**Files:**
- Create: `src/features/auth/components/ProtectedRoute.tsx`
- Modify: `src/app/routes.tsx`

**Prerequisites:**
- Task 13 completed

**Step 1: Create protected route component**

Create `src/features/auth/components/ProtectedRoute.tsx`:

```tsx
import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: 'owner' | 'coach' | 'athlete'
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { loading, isAuthenticated, role } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && role !== requiredRole && role !== 'owner') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Access denied</div>
      </div>
    )
  }

  return <>{children}</>
}
```

**Step 2: Wrap protected routes**

Modify `src/app/routes.tsx`:

```tsx
import { createBrowserRouter } from 'react-router-dom';
import { LoginPage } from '../features/auth/components/LoginPage';
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LoginPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/:boxSlug',
    children: [
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <div className="text-white p-8">Dashboard (coming soon)</div>
          </ProtectedRoute>
        ),
      },
      {
        path: 'editor/:workoutSlug?',
        element: (
          <ProtectedRoute requiredRole="coach">
            <div className="text-white p-8">Editor (coming soon)</div>
          </ProtectedRoute>
        ),
      },
      {
        path: 'tv/:workoutSlug',
        element: (
          <ProtectedRoute>
            <div className="text-white p-8">TV Mode (coming soon)</div>
          </ProtectedRoute>
        ),
      },
      {
        path: 'remote/:sessionCode',
        element: (
          <ProtectedRoute>
            <div className="text-white p-8">Remote Control (coming soon)</div>
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
```

**Step 3: Test build**

```bash
npm run build
```

**Expected:** No errors.

**Step 4: Commit**

```bash
git add .
git commit -m "feat: add protected route component with role-based access"
```

---

## Task 15: Update CLAUDE.md with Project Information

**Files:**
- Modify: `CLAUDE.md`

**Prerequisites:**
- Task 14 completed

**Step 1: Update CLAUDE.md**

Replace content of `CLAUDE.md`:

```markdown
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**YMC Cronotimer** - Multi-tenant CrossFit timer application for creating, managing, and executing workouts with TV display optimization.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite 5
- **Styling**: Tailwind CSS 3
- **State**: Zustand 4
- **Backend**: Supabase (Postgres + Auth + Realtime)
- **Routing**: React Router 6
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

# Type check
npm run type-check  # (if configured)
```

## Database Commands

```bash
# Reset local database (apply all migrations)
supabase db reset

# Create new migration
supabase migration new <name>

# Push migrations to remote Supabase
supabase db push

# Generate TypeScript types from schema
supabase gen types typescript --local > src/types/database.types.ts
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

1. Copy `.env.example` to `.env.local`
2. Fill in Supabase credentials from dashboard
3. Never commit `.env.local` (contains secrets)

## Multi-Tenant Data Model

**Key tables:**
- `boxes` - CrossFit box/gym (tenant)
- `users` - Extends Supabase auth with box_id and role
- `workouts` - Hierarchical: Workout → Section → Exercise → Round
- RLS policies ensure box isolation

## Current State

✅ Project scaffolded (Vite + React + TypeScript + Tailwind)
✅ Supabase connected
✅ Database schema created with RLS policies
✅ Auth store and login page implemented
✅ Protected routes with role-based access
⏳ Editor module (next)
⏳ TV execution module
⏳ Remote control module
⏳ Library module
⏳ Offline sync

## Next Steps

See `docs/plans/2025-11-20-initial-setup.md` for detailed task breakdown.
```

**Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md with project information and commands"
```

---

## Task 16: Final Verification and Documentation

**Files:**
- Create: `docs/setup-complete.md`

**Prerequisites:**
- All previous tasks completed

**Step 1: Run full verification**

```bash
# Verify dev server starts
npm run dev &
DEV_PID=$!
sleep 3
curl -s http://localhost:5173 > /dev/null && echo "✓ Dev server running" || echo "✗ Dev server failed"
kill $DEV_PID

# Verify build works
npm run build && echo "✓ Build successful" || echo "✗ Build failed"

# Verify TypeScript compiles
npx tsc --noEmit && echo "✓ TypeScript valid" || echo "✗ TypeScript errors"

# Verify database connection
supabase db ping && echo "✓ Database connected" || echo "✗ Database unreachable"
```

**Expected:** All checks should show ✓

**Step 2: Create setup completion document**

Create `docs/setup-complete.md`:

```markdown
# Initial Setup Complete ✓

**Date**: $(date +%Y-%m-%d)

## What's Been Built

### Infrastructure
- ✅ Vite + React + TypeScript project initialized
- ✅ Tailwind CSS configured
- ✅ Core dependencies installed (Zustand, Supabase, Dexie, etc.)
- ✅ Project structure created (features, shared, types)

### Backend (Supabase)
- ✅ Database schema created:
  - boxes, users (multi-tenant base)
  - workouts, sections, exercises, rounds (workout hierarchy)
  - execution_logs (timer tracking)
- ✅ RLS policies implemented (multi-tenant isolation)
- ✅ TypeScript types generated from schema

### Authentication
- ✅ Auth store (Zustand)
- ✅ Auth hook with session management
- ✅ Login page component
- ✅ Protected routes with role-based access

### Documentation
- ✅ Design document
- ✅ Implementation plan
- ✅ Updated CLAUDE.md

## What's Next

See `docs/plans/2025-11-20-initial-setup.md` for continued implementation:
- Week 3-4: Editor module
- Week 5: Templates and copy/paste
- Week 6: TV execution module
- Week 7: Library and search
- Week 8: Remote control and offline sync
- Week 9: QA and beta launch

## Verification

Run these commands to verify setup:
```bash
npm run dev      # Dev server should start
npm run build    # Should build without errors
supabase db ping # Database should be reachable
```

## Access

- Dev server: http://localhost:5173
- Supabase dashboard: https://app.supabase.com
- Login page: http://localhost:5173/login

## Notes for Future Development

- Always generate new TypeScript types after schema changes:
  `supabase gen types typescript --local > src/types/database.types.ts`

- Test RLS policies thoroughly - multi-tenant isolation is critical

- Follow TDD approach for new features

- Keep design document updated as architecture evolves
```

**Step 3: Commit**

```bash
git add docs/setup-complete.md
git commit -m "docs: add setup completion document"
```

**Step 4: Push to remote**

```bash
git push origin feature/initial-setup
```

**Expected output:**
```
To <remote>
 * [new branch]      feature/initial-setup -> feature/initial-setup
```

---

## Setup Complete! 🎉

**You've successfully completed the initial setup phase.**

**What was built:**
- React + TypeScript + Vite + Tailwind project
- Supabase backend with multi-tenant schema
- Authentication system with protected routes
- Project structure ready for feature development

**Next steps:**
- Continue with Week 3-4 tasks (Editor module)
- Or use this plan with ring:executing-plans skill

**To continue development:**
```bash
cd .worktrees/feature/initial-setup
npm run dev
```

**To merge into main:**
```bash
# Review changes
git diff main

# Merge
git checkout main
git merge feature/initial-setup
git push origin main

# Clean up worktree
git worktree remove .worktrees/feature/initial-setup
```
