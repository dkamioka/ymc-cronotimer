-- ============================================
-- COMPLETE DATABASE SETUP FOR YMC CRONOTIMER
-- ============================================
-- Copy this entire file and paste into:
-- Supabase Dashboard → SQL Editor → New Query → Paste → Run
-- ============================================

-- MIGRATION 1: Create boxes and users tables
-- ============================================

-- Create boxes table
CREATE TABLE IF NOT EXISTS public.boxes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on slug for fast lookups
CREATE INDEX IF NOT EXISTS idx_boxes_slug ON public.boxes(slug);

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
CREATE INDEX IF NOT EXISTS idx_users_box_id ON public.users(box_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- MIGRATION 2: Create workouts hierarchy
-- ============================================

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
CREATE INDEX IF NOT EXISTS idx_workouts_box_id ON public.workouts(box_id);
CREATE INDEX IF NOT EXISTS idx_workouts_date ON public.workouts(date);
CREATE INDEX IF NOT EXISTS idx_workouts_slug ON public.workouts(slug);
CREATE INDEX IF NOT EXISTS idx_workouts_tags ON public.workouts USING GIN(tags);

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
CREATE INDEX IF NOT EXISTS idx_sections_workout_id ON public.sections(workout_id);

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
CREATE INDEX IF NOT EXISTS idx_exercises_section_id ON public.exercises(section_id);

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
CREATE INDEX IF NOT EXISTS idx_rounds_exercise_id ON public.rounds(exercise_id);

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
CREATE INDEX IF NOT EXISTS idx_execution_logs_workout_id ON public.execution_logs(workout_id);
CREATE INDEX IF NOT EXISTS idx_execution_logs_started_at ON public.execution_logs(started_at);

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
DROP TRIGGER IF EXISTS update_workouts_updated_at ON public.workouts;
CREATE TRIGGER update_workouts_updated_at
  BEFORE UPDATE ON public.workouts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- MIGRATION 3: Create RLS policies
-- ============================================

-- Helper function: Get current user's box_id
CREATE OR REPLACE FUNCTION auth.user_box_id()
RETURNS UUID AS $$
  SELECT box_id FROM public.users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- BOXES TABLE POLICIES
DROP POLICY IF EXISTS "users_can_view_own_box" ON public.boxes;
CREATE POLICY "users_can_view_own_box"
  ON public.boxes
  FOR SELECT
  USING (
    id IN (SELECT box_id FROM public.users WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "owners_can_update_own_box" ON public.boxes;
CREATE POLICY "owners_can_update_own_box"
  ON public.boxes
  FOR UPDATE
  USING (
    id IN (
      SELECT box_id FROM public.users
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

-- USERS TABLE POLICIES
DROP POLICY IF EXISTS "users_can_view_box_members" ON public.users;
CREATE POLICY "users_can_view_box_members"
  ON public.users
  FOR SELECT
  USING (box_id = auth.user_box_id());

DROP POLICY IF EXISTS "owners_coaches_can_add_users" ON public.users;
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

DROP POLICY IF EXISTS "owners_can_update_users" ON public.users;
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

DROP POLICY IF EXISTS "owners_can_delete_users" ON public.users;
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

-- WORKOUTS TABLE POLICIES
DROP POLICY IF EXISTS "users_can_view_box_workouts" ON public.workouts;
CREATE POLICY "users_can_view_box_workouts"
  ON public.workouts
  FOR SELECT
  USING (box_id = auth.user_box_id());

DROP POLICY IF EXISTS "coaches_owners_can_create_workouts" ON public.workouts;
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

DROP POLICY IF EXISTS "coaches_owners_can_update_workouts" ON public.workouts;
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

DROP POLICY IF EXISTS "coaches_owners_can_delete_workouts" ON public.workouts;
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

-- SECTIONS POLICIES
DROP POLICY IF EXISTS "users_can_view_sections" ON public.sections;
CREATE POLICY "users_can_view_sections"
  ON public.sections
  FOR SELECT
  USING (
    workout_id IN (
      SELECT id FROM public.workouts WHERE box_id = auth.user_box_id()
    )
  );

DROP POLICY IF EXISTS "coaches_owners_can_manage_sections" ON public.sections;
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

-- EXERCISES POLICIES
DROP POLICY IF EXISTS "users_can_view_exercises" ON public.exercises;
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

DROP POLICY IF EXISTS "coaches_owners_can_manage_exercises" ON public.exercises;
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

-- ROUNDS POLICIES
DROP POLICY IF EXISTS "users_can_view_rounds" ON public.rounds;
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

DROP POLICY IF EXISTS "coaches_owners_can_manage_rounds" ON public.rounds;
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

-- EXECUTION LOGS POLICIES
DROP POLICY IF EXISTS "users_can_view_execution_logs" ON public.execution_logs;
CREATE POLICY "users_can_view_execution_logs"
  ON public.execution_logs
  FOR SELECT
  USING (
    workout_id IN (
      SELECT id FROM public.workouts WHERE box_id = auth.user_box_id()
    )
  );

DROP POLICY IF EXISTS "users_can_create_execution_logs" ON public.execution_logs;
CREATE POLICY "users_can_create_execution_logs"
  ON public.execution_logs
  FOR INSERT
  WITH CHECK (
    workout_id IN (
      SELECT id FROM public.workouts WHERE box_id = auth.user_box_id()
    )
  );

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- Next: Run setup-test-data.sql to create test accounts
-- ============================================
