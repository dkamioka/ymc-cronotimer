-- ============================================
-- SIMPLE RLS FIX - Just add the INSERT policies correctly
-- ============================================
--
-- The issue is simple: there are NO INSERT policies for boxes table.
-- We just need to add them. No fancy functions needed.
--
-- Run this in Supabase SQL Editor:
-- https://app.supabase.com/project/oaokydrcsqkgpatdfszj/sql/new
-- ============================================

-- First, let's temporarily disable RLS on boxes to test
ALTER TABLE public.boxes DISABLE ROW LEVEL SECURITY;

-- Then re-enable it with proper policies
ALTER TABLE public.boxes ENABLE ROW LEVEL SECURITY;

-- Add INSERT policy for authenticated users on boxes
DROP POLICY IF EXISTS "authenticated_can_create_box" ON public.boxes;
CREATE POLICY "authenticated_can_create_box"
  ON public.boxes
  FOR INSERT
  WITH CHECK (true);

-- For users table, also simplify the INSERT policy
DROP POLICY IF EXISTS "users_can_create_self" ON public.users;
CREATE POLICY "users_can_create_self"
  ON public.users
  FOR INSERT
  WITH CHECK (id = auth.uid());

-- Keep the existing INSERT policy for coaches/owners adding users
DROP POLICY IF EXISTS "owners_coaches_can_add_users" ON public.users;
CREATE POLICY "owners_coaches_can_add_users"
  ON public.users
  FOR INSERT
  WITH CHECK (
    box_id IN (SELECT box_id FROM public.users WHERE id = auth.uid())
    AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('owner', 'coach')
    )
  );
