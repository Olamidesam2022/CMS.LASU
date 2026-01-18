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

-- Policies for audit_logs
CREATE POLICY "Admins can view all audit logs" ON audit_logs FOR SELECT USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "System can insert audit logs" ON audit_logs FOR INSERT WITH CHECK (true);
