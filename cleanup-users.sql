-- CLEAN UP USERS: Keep only admin and one legal officer
-- Run this in Supabase SQL Editor

-- STEP 1: First, see all current users
SELECT
  'Current Users' as info,
  u.email,
  p.full_name,
  ur.role,
  p.department
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
ORDER BY ur.role DESC, u.email;

-- STEP 2: Delete ALL users except admin@lasu.edu.ng
-- (Run this only after confirming which users you want to keep)

-- DELETE FROM public.user_roles
-- WHERE user_id IN (
--   SELECT id FROM auth.users
--   WHERE email != 'admin@lasu.edu.ng'
-- );

-- DELETE FROM public.profiles
-- WHERE user_id IN (
--   SELECT id FROM auth.users
--   WHERE email != 'admin@lasu.edu.ng'
-- );

-- STEP 3: Alternative - Delete all legal officers except one specific email
-- Replace 'legal1@lasu.edu.ng' with the email of the legal officer you want to keep

-- DELETE FROM public.user_roles
-- WHERE user_id IN (
--   SELECT id FROM auth.users
--   WHERE email != 'admin@lasu.edu.ng'
--   AND email != 'legal1@lasu.edu.ng'  -- Replace with the legal officer to keep
-- );

-- DELETE FROM public.profiles
-- WHERE user_id IN (
--   SELECT id FROM auth.users
--   WHERE email != 'admin@lasu.edu.ng'
--   AND email != 'legal1@lasu.edu.ng'  -- Replace with the legal officer to keep
-- );

-- STEP 4: Verify remaining users
SELECT
  'Remaining Users' as info,
  u.email,
  p.full_name,
  ur.role,
  p.department
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email IN ('admin@lasu.edu.ng', 'legal1@lasu.edu.ng')  -- Update this list
ORDER BY ur.role DESC;