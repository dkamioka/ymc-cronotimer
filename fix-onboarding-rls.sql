-- ============================================
-- FIX RLS POLICIES FOR ONBOARDING FLOW
-- ============================================
--
-- This fixes the "new row violates row-level security policy" error
-- that prevents new Google OAuth users from completing onboarding.
--
-- Run this in Supabase SQL Editor:
-- https://app.supabase.com/project/oaokydrcsqkgpatdfszj/sql/new
-- ============================================

-- Allow authenticated users to create boxes (for onboarding)
DROP POLICY IF EXISTS "authenticated_can_create_box" ON public.boxes;
CREATE POLICY "authenticated_can_create_box"
  ON public.boxes
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to insert their own user record during onboarding
DROP POLICY IF EXISTS "users_can_create_self" ON public.users;
CREATE POLICY "users_can_create_self"
  ON public.users
  FOR INSERT
  WITH CHECK (id = auth.uid());
