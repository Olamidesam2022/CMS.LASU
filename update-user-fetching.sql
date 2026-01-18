-- UPDATE DATABASE WITH USER FETCHING FUNCTION
-- Run this in Supabase SQL Editor

-- Create function for admins to fetch all users
CREATE OR REPLACE FUNCTION get_all_users()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  full_name TEXT,
  department TEXT,
  avatar_url TEXT,
  role TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.user_id,
    p.email,
    p.full_name,
    p.department,
    p.avatar_url,
    COALESCE(ur.role, 'legal_officer') as role
  FROM profiles p
  LEFT JOIN user_roles ur ON p.user_id = ur.user_id;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_all_users() TO authenticated;

-- Test the function
SELECT * FROM get_all_users();