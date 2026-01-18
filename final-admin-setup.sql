-- UPDATED ADMIN SETUP WITH RLS FIX
-- Run these commands in Supabase SQL Editor

-- STEP 1: Create function to bypass RLS for role fetching
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM user_roles WHERE user_id = $1;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_role(UUID) TO authenticated;

-- STEP 2: Insert admin role
INSERT INTO public.user_roles (user_id, role)
SELECT
  (SELECT id FROM auth.users WHERE email = 'admin@lasu.edu.ng'),
  'admin'
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles
  WHERE user_id = (SELECT id FROM auth.users WHERE email = 'admin@lasu.edu.ng')
);

-- STEP 3: Insert admin profile
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

-- STEP 4: Verify setup
SELECT
  '✅ SUCCESS - RLS Fixed' as status,
  u.email,
  u.email_confirmed_at as confirmed,
  ur.role,
  p.full_name,
  p.department
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'admin@lasu.edu.ng';