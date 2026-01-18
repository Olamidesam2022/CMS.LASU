-- ADMIN SETUP FROM SCRATCH
-- Run these commands in order in Supabase SQL Editor

-- STEP 1: Clean up any existing admin data (optional - only if you want to start fresh)
-- DELETE FROM public.user_roles WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'admin@lasu.edu.ng');
-- DELETE FROM public.profiles WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'admin@lasu.edu.ng');

-- STEP 2: Verify admin user exists in auth.users
-- (This should be created manually in Supabase Dashboard -> Authentication -> Users)

-- STEP 3: Insert admin role
INSERT INTO public.user_roles (user_id, role)
SELECT
  (SELECT id FROM auth.users WHERE email = 'admin@lasu.edu.ng'),
  'admin'
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles
  WHERE user_id = (SELECT id FROM auth.users WHERE email = 'admin@lasu.edu.ng')
);

-- STEP 4: Insert admin profile
INSERT INTO public.profiles (id, user_id, email, full_name, department)
SELECT
  (SELECT id FROM auth.users WHERE email = 'admin@lasu.edu.ng'),
  (SELECT id FROM auth.users WHERE email = 'admin@lasu.edu.ng'),
  'admin@lasu.edu.ng',
  'LASU Administrator',
  'Administration'
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles
  WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@lasu.edu.ng')
);

-- STEP 5: Verify everything is set up correctly
SELECT
  'Admin Setup Complete' as status,
  u.email,
  u.email_confirmed_at as confirmed,
  ur.role,
  p.full_name,
  p.department
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'admin@lasu.edu.ng';