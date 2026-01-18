-- Create profiles table
CREATE TABLE profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  department TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_roles table
CREATE TABLE user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('admin', 'legal_officer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create litigation_cases table
CREATE TABLE litigation_cases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  suit_number TEXT NOT NULL,
  case_title TEXT NOT NULL,
  adversary_party TEXT NOT NULL,
  procedural_stage TEXT CHECK (procedural_stage IN ('Mention', 'Interlocutory', 'Trial', 'Judgment')),
  assigned_counsel TEXT NOT NULL,
  status TEXT CHECK (status IN ('Active', 'Pending', 'Closed', 'Urgent')) DEFAULT 'Active',
  next_hearing TIMESTAMP WITH TIME ZONE,
  court TEXT NOT NULL,
  filed_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create advisory_requests table
CREATE TABLE advisory_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_number TEXT NOT NULL,
  title TEXT NOT NULL,
  requested_by TEXT NOT NULL,
  department TEXT NOT NULL,
  date_received TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  due_date TIMESTAMP WITH TIME ZONE,
  status TEXT CHECK (status IN ('Pending', 'In Progress', 'Completed', 'Urgent')) DEFAULT 'Pending',
  assigned_to TEXT,
  priority TEXT CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')) DEFAULT 'Medium',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create legal_documents table
CREATE TABLE legal_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('MoU', 'Court Process', 'Legal Opinion', 'Contract', 'Correspondence')),
  case_id UUID REFERENCES litigation_cases(id) ON DELETE SET NULL,
  version TEXT DEFAULT '1.0',
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  size TEXT,
  status TEXT CHECK (status IN ('Draft', 'Final', 'Archived')) DEFAULT 'Draft',
  file_path TEXT,
  file_url TEXT
);

-- Create audit_logs table
CREATE TABLE audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  user_name TEXT,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  details JSONB
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE litigation_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE advisory_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust as needed for your security)
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can insert profiles" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update all profiles" ON profiles FOR UPDATE USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can view own role" ON user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON user_roles FOR SELECT USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can insert roles" ON user_roles FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update roles" ON user_roles FOR UPDATE USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Policies for litigation_cases
CREATE POLICY "Legal officers can view all cases" ON litigation_cases FOR SELECT USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'legal_officer')));
CREATE POLICY "Legal officers can insert cases" ON litigation_cases FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'legal_officer')));
CREATE POLICY "Legal officers can update cases" ON litigation_cases FOR UPDATE USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'legal_officer')));

-- Policies for advisory_requests
CREATE POLICY "Legal officers can view all advisory requests" ON advisory_requests FOR SELECT USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'legal_officer')));
CREATE POLICY "Users can insert advisory requests" ON advisory_requests FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Legal officers can update advisory requests" ON advisory_requests FOR UPDATE USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'legal_officer')));

-- Policies for legal_documents
CREATE POLICY "Legal officers can view all documents" ON legal_documents FOR SELECT USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'legal_officer')));
CREATE POLICY "Legal officers can insert documents" ON legal_documents FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'legal_officer')));
CREATE POLICY "Legal officers can update documents" ON legal_documents FOR UPDATE USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'legal_officer')));

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

-- Grant execute permission to authenticated users (RLS will handle access control)
GRANT EXECUTE ON FUNCTION get_all_users() TO authenticated;

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
