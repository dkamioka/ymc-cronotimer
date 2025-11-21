-- ============================================
-- DEBUG RLS POLICIES
-- ============================================
-- Run this to see current policies on boxes table
-- ============================================

SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'boxes'
ORDER BY policyname;
