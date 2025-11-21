-- ============================================
-- FIX DATABASE FUNCTION WITH PROPER SECURITY CONTEXT
-- ============================================
--
-- The SECURITY DEFINER function needs to properly handle the auth context.
-- We need to ensure the function runs with the correct security context
-- and can access auth.uid() properly.
--
-- Run this in Supabase SQL Editor:
-- https://app.supabase.com/project/oaokydrcsqkgpatdfszj/sql/new
-- ============================================

-- Drop the old function
DROP FUNCTION IF EXISTS public.create_box_and_user(TEXT, TEXT, TEXT, TEXT, TEXT);

-- Create improved function with proper security context
CREATE OR REPLACE FUNCTION public.create_box_and_user(
  p_box_name TEXT,
  p_box_slug TEXT,
  p_user_name TEXT,
  p_user_email TEXT,
  p_user_role TEXT DEFAULT 'owner'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER -- Run with elevated privileges
SET search_path = public, auth -- Ensure we can access auth schema
AS $$
DECLARE
  v_box_id UUID;
  v_user_id UUID;
  v_result JSON;
BEGIN
  -- Get the current authenticated user ID from JWT
  v_user_id := auth.uid();

  -- Check if user is authenticated
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check if user already has a box
  IF EXISTS (SELECT 1 FROM public.users WHERE id = v_user_id) THEN
    RAISE EXCEPTION 'User already has a box';
  END IF;

  -- Temporarily disable RLS for this transaction
  -- (safe because we've already validated authentication above)
  PERFORM set_config('request.jwt.claim.sub', v_user_id::text, true);

  -- Create the box (bypassing RLS due to SECURITY DEFINER)
  INSERT INTO public.boxes (name, slug)
  VALUES (p_box_name, p_box_slug)
  RETURNING id INTO v_box_id;

  -- Create the user (bypassing RLS due to SECURITY DEFINER)
  INSERT INTO public.users (id, email, name, box_id, role)
  VALUES (v_user_id, p_user_email, p_user_name, v_box_id, p_user_role);

  -- Return the result
  SELECT json_build_object(
    'box_id', v_box_id,
    'slug', p_box_slug
  ) INTO v_result;

  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error details for debugging
    RAISE EXCEPTION 'Onboarding failed: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
END;
$$;

-- Grant execute permission to authenticated and anon users
GRANT EXECUTE ON FUNCTION public.create_box_and_user TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_box_and_user TO anon;
GRANT EXECUTE ON FUNCTION public.create_box_and_user TO public;

-- Ensure the function owner has necessary privileges
ALTER FUNCTION public.create_box_and_user(TEXT, TEXT, TEXT, TEXT, TEXT) OWNER TO postgres;
