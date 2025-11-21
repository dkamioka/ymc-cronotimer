-- ============================================
-- FINAL RLS FIX - Use PUBLIC role like other policies
-- ============================================
--
-- The issue: Other policies use "TO public" but our new policy uses "TO authenticated"
-- This causes a role mismatch. Let's match the pattern of existing policies.
--
-- Run this in Supabase SQL Editor:
-- https://app.supabase.com/project/oaokydrcsqkgpatdfszj/sql/new
-- ============================================

-- Drop and recreate the INSERT policy for boxes using TO public (matching other policies)
DROP POLICY IF EXISTS "authenticated_can_create_box" ON public.boxes;
CREATE POLICY "authenticated_can_create_box"
  ON public.boxes
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() IS NOT NULL);

-- Drop and recreate the INSERT policy for users using TO public (matching other policies)
DROP POLICY IF EXISTS "users_can_create_self" ON public.users;
CREATE POLICY "users_can_create_self"
  ON public.users
  FOR INSERT
  TO public
  WITH CHECK (id = auth.uid());

-- Also update the owners/coaches policy to use TO public
DROP POLICY IF EXISTS "owners_coaches_can_add_users" ON public.users;
CREATE POLICY "owners_coaches_can_add_users"
  ON public.users
  FOR INSERT
  TO public
  WITH CHECK (
    box_id = (SELECT box_id FROM public.users WHERE id = auth.uid())
    AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('owner', 'coach')
    )
  );
