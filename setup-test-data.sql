-- ============================================
-- CREATE TEST DATA FOR YMC CRONOTIMER
-- ============================================
-- Prerequisites:
-- 1. Run setup-all.sql first
-- 2. Create a user via Supabase Auth Dashboard:
--    Dashboard → Authentication → Users → Add User
--    Email: test@example.com
--    Password: testpass123
-- 3. Copy the user's UUID from the dashboard
-- 4. Replace 'YOUR_USER_UUID_HERE' below with that UUID
-- 5. Run this script
-- ============================================

-- Create test box
INSERT INTO public.boxes (name, slug)
VALUES ('Demo CrossFit Box', 'demo-box')
ON CONFLICT (slug) DO NOTHING;

-- Link the auth user to the box as owner
-- IMPORTANT: Replace 'YOUR_USER_UUID_HERE' with the actual UUID from step 2 above
INSERT INTO public.users (id, email, name, box_id, role)
SELECT
  'YOUR_USER_UUID_HERE'::uuid,  -- Replace with your auth user UUID
  'test@example.com',
  'Test Owner',
  (SELECT id FROM public.boxes WHERE slug = 'demo-box'),
  'owner'
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- TEST DATA SETUP COMPLETE!
-- ============================================
-- You can now login with:
--   Email: test@example.com
--   Password: testpass123
-- ============================================
