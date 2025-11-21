-- ============================================
-- COMPLETE RLS FIX FOR ONBOARDING FLOW
-- ============================================
--
-- Problem: The original migrations have NO INSERT policy for boxes table.
-- When RLS is enabled without an INSERT policy, ALL inserts are blocked.
--
-- This adds the missing INSERT policies for both boxes and users tables
-- to allow the onboarding flow to work.
--
-- Run this in Supabase SQL Editor:
-- https://app.supabase.com/project/oaokydrcsqkgpatdfszj/sql/new
-- ============================================

-- 1. Allow authenticated users to create boxes (for onboarding)
DROP POLICY IF EXISTS "authenticated_can_create_box" ON public.boxes;
CREATE POLICY "authenticated_can_create_box"
  ON public.boxes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 2. Allow users to insert their own user record during onboarding
DROP POLICY IF EXISTS "users_can_create_self" ON public.users;
CREATE POLICY "users_can_create_self"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- 3. Update the existing INSERT policy for users to work alongside the new one
-- The original policy was too restrictive for onboarding
DROP POLICY IF EXISTS "owners_coaches_can_add_users" ON public.users;
CREATE POLICY "owners_coaches_can_add_users"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    box_id = (SELECT box_id FROM public.users WHERE id = auth.uid())
    AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('owner', 'coach')
    )
  );
