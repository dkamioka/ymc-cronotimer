-- ============================================
-- FIX: Explicitly disable RLS in the function
-- ============================================
--
-- SECURITY DEFINER alone isn't enough - we need to explicitly
-- set the role to bypass RLS within the function.
--
-- Run this in Supabase SQL Editor:
-- https://app.supabase.com/project/oaokydrcsqkgpatdfszj/sql/new
-- ============================================

-- Drop the old function
DROP FUNCTION IF EXISTS public.create_box_and_user(TEXT, TEXT, TEXT, TEXT, TEXT);

-- Create function that explicitly bypasses RLS
CREATE OR REPLACE FUNCTION public.create_box_and_user(
  p_box_name TEXT,
  p_box_slug TEXT,
  p_user_name TEXT,
  p_user_email TEXT,
  p_user_role TEXT DEFAULT 'owner'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
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

  -- Set role to service_role to bypass RLS for this transaction
  EXECUTE 'SET LOCAL role TO service_role';

  -- Create the box
  INSERT INTO public.boxes (name, slug)
  VALUES (p_box_name, p_box_slug)
  RETURNING id INTO v_box_id;

  -- Create the user
  INSERT INTO public.users (id, email, name, box_id, role)
  VALUES (v_user_id, p_user_email, p_user_name, v_box_id, p_user_role);

  -- Reset role
  EXECUTE 'RESET role';

  -- Return the result
  SELECT json_build_object(
    'box_id', v_box_id,
    'slug', p_box_slug
  ) INTO v_result;

  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    -- Ensure role is reset even on error
    EXECUTE 'RESET role';
    RAISE;
END;
$$;

-- Set the function owner to postgres (superuser) so it can change roles
ALTER FUNCTION public.create_box_and_user(TEXT, TEXT, TEXT, TEXT, TEXT) OWNER TO postgres;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.create_box_and_user TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_box_and_user TO anon;
GRANT EXECUTE ON FUNCTION public.create_box_and_user TO public;
