-- ============================================
-- FIX ONBOARDING WITH DATABASE FUNCTION
-- ============================================
--
-- Instead of relying on RLS policies for the initial onboarding,
-- create a database function that runs with elevated privileges
-- to handle the atomic creation of box + user.
--
-- This bypasses RLS for the onboarding flow while maintaining
-- security through the function's logic.
--
-- Run this in Supabase SQL Editor:
-- https://app.supabase.com/project/oaokydrcsqkgpatdfszj/sql/new
-- ============================================

-- Create a function to handle onboarding (creates box + user atomically)
CREATE OR REPLACE FUNCTION public.create_box_and_user(
  p_box_name TEXT,
  p_box_slug TEXT,
  p_user_name TEXT,
  p_user_email TEXT,
  p_user_role TEXT DEFAULT 'owner'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER -- This allows the function to bypass RLS
SET search_path = public
AS $$
DECLARE
  v_box_id UUID;
  v_user_id UUID;
  v_result JSON;
BEGIN
  -- Get the current authenticated user ID
  v_user_id := auth.uid();

  -- Check if user is authenticated
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check if user already has a box
  IF EXISTS (SELECT 1 FROM public.users WHERE id = v_user_id) THEN
    RAISE EXCEPTION 'User already has a box';
  END IF;

  -- Create the box
  INSERT INTO public.boxes (name, slug)
  VALUES (p_box_name, p_box_slug)
  RETURNING id INTO v_box_id;

  -- Create the user
  INSERT INTO public.users (id, email, name, box_id, role)
  VALUES (v_user_id, p_user_email, p_user_name, v_box_id, p_user_role);

  -- Return the result
  SELECT json_build_object(
    'box_id', v_box_id,
    'slug', p_box_slug
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_box_and_user TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_box_and_user TO public;
