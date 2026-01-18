-- UPDATE DATABASE FOR USER MANAGEMENT FUNCTIONALITY
-- Run this in Supabase SQL Editor

-- Function to delete a user (admin only)
CREATE OR REPLACE FUNCTION delete_user_admin(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_email TEXT;
  v_result JSON;
BEGIN
  -- Check if caller is admin
  IF (SELECT role FROM user_roles WHERE user_id = auth.uid()) != 'admin' THEN
    RETURN json_build_object('error', 'Only administrators can delete users');
  END IF;

  -- Prevent self-deletion
  IF p_user_id = auth.uid() THEN
    RETURN json_build_object('error', 'You cannot delete your own account');
  END IF;

  -- Get user email for confirmation
  SELECT email INTO v_user_email FROM profiles WHERE user_id = p_user_id;

  IF v_user_email IS NULL THEN
    RETURN json_build_object('error', 'User not found');
  END IF;

  -- Delete user data (auth user deletion needs Edge Function)
  DELETE FROM user_roles WHERE user_id = p_user_id;
  DELETE FROM profiles WHERE user_id = p_user_id;

  RETURN json_build_object(
    'success', true,
    'message', 'User data deleted successfully',
    'user_id', p_user_id,
    'email', v_user_email
  );

END;
$$;

-- Function to update a user (admin only)
CREATE OR REPLACE FUNCTION update_user_admin(
  p_user_id UUID,
  p_full_name TEXT DEFAULT NULL,
  p_department TEXT DEFAULT NULL,
  p_role TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSON;
BEGIN
  -- Check if caller is admin
  IF (SELECT role FROM user_roles WHERE user_id = auth.uid()) != 'admin' THEN
    RETURN json_build_object('error', 'Only administrators can update users');
  END IF;

  -- Validate role if provided
  IF p_role IS NOT NULL AND p_role NOT IN ('admin', 'legal_officer') THEN
    RETURN json_build_object('error', 'Invalid role');
  END IF;

  -- Check if user exists
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE user_id = p_user_id) THEN
    RETURN json_build_object('error', 'User not found');
  END IF;

  -- Update profile
  IF p_full_name IS NOT NULL OR p_department IS NOT NULL THEN
    UPDATE profiles
    SET
      full_name = COALESCE(p_full_name, full_name),
      department = COALESCE(p_department, department),
      updated_at = NOW()
    WHERE user_id = p_user_id;
  END IF;

  -- Update role
  IF p_role IS NOT NULL THEN
    -- Delete existing role
    DELETE FROM user_roles WHERE user_id = p_user_id;
    -- Insert new role
    INSERT INTO user_roles (user_id, role) VALUES (p_user_id, p_role);
  END IF;

  RETURN json_build_object(
    'success', true,
    'message', 'User updated successfully',
    'user_id', p_user_id
  );

END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION delete_user_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_admin(UUID, TEXT, TEXT, TEXT) TO authenticated;

-- Test the functions
SELECT 'Database functions updated successfully' as status;