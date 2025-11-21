-- Check all policies on boxes table
SELECT
  policyname,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'boxes'
ORDER BY cmd, policyname;
