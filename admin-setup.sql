-- Create admin user in auth.users (this will be done via dashboard)
-- Then run these SQL commands in Supabase SQL Editor:

-- Insert admin role for the user (only if not already exists)
INSERT INTO public.user_roles (user_id, role)
SELECT
  (SELECT id FROM auth.users WHERE email = 'admin@lasu.edu.ng'),
  'admin'
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles
  WHERE user_id = (SELECT id FROM auth.users WHERE email = 'admin@lasu.edu.ng')
);

-- Insert admin profile (only if not already exists)
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

-- Verify the admin user was created
SELECT
  u.email,
  p.full_name,
  p.role,
  ur.role as user_role
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = 'admin@lasu.edu.ng';