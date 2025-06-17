-- Beta Invites Table
CREATE TABLE IF NOT EXISTS beta_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'claimed', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  claimed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  claimed_by UUID REFERENCES auth.users(id),
  notes TEXT
);

-- Beta Users Table
CREATE TABLE IF NOT EXISTS beta_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  invite_id UUID REFERENCES beta_invites(id),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  feedback_provided BOOLEAN DEFAULT FALSE,
  last_active_at TIMESTAMP WITH TIME ZONE
);

-- Beta Feedback Table
CREATE TABLE IF NOT EXISTS beta_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  overall_experience TEXT NOT NULL CHECK (overall_experience IN ('excellent', 'good', 'average', 'poor', 'terrible')),
  usability TEXT NOT NULL CHECK (usability IN ('excellent', 'good', 'average', 'poor', 'terrible')),
  features_missing TEXT,
  bug_report TEXT,
  improvement_suggestions TEXT,
  liked_most TEXT,
  liked_least TEXT,
  will_recommend TEXT NOT NULL CHECK (will_recommend IN ('definitely', 'probably', 'maybe', 'unlikely', 'no')),
  additional_comments TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Beta Requests Table
CREATE TABLE IF NOT EXISTS beta_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'invited')) DEFAULT 'pending',
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID REFERENCES auth.users(id),
  invite_id UUID REFERENCES beta_invites(id),
  notes TEXT
);

-- User Profiles Table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_beta_invites_code ON beta_invites(code);
CREATE INDEX IF NOT EXISTS idx_beta_invites_email ON beta_invites(email);
CREATE INDEX IF NOT EXISTS idx_beta_invites_status ON beta_invites(status);
CREATE INDEX IF NOT EXISTS idx_beta_users_user_id ON beta_users(user_id);
CREATE INDEX IF NOT EXISTS idx_beta_feedback_user_id ON beta_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_beta_feedback_submitted_at ON beta_feedback(submitted_at);
CREATE INDEX IF NOT EXISTS idx_beta_requests_email ON beta_requests(email);
CREATE INDEX IF NOT EXISTS idx_beta_requests_status ON beta_requests(status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- Enable Row Level Security (RLS) on tables
ALTER TABLE beta_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for beta_invites
-- Admin can do everything
CREATE POLICY "Admins can do everything on beta_invites" 
  ON beta_invites FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Users can view their own invites
CREATE POLICY "Users can view their own invites" 
  ON beta_invites FOR SELECT 
  USING (email = auth.email());

-- Create policies for beta_users
-- Admin can do everything
CREATE POLICY "Admins can do everything on beta_users" 
  ON beta_users FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Users can view their own beta status
CREATE POLICY "Users can view their own beta status" 
  ON beta_users FOR SELECT 
  USING (user_id = auth.uid());

-- Users can update their own beta status (for feedback and last active)
CREATE POLICY "Users can update their own beta status" 
  ON beta_users FOR UPDATE 
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid() AND (feedback_provided IS NOT NULL OR last_active_at IS NOT NULL));

-- Create policies for beta_feedback
-- Admin can do everything
CREATE POLICY "Admins can do everything on beta_feedback" 
  ON beta_feedback FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Users can insert their own feedback
CREATE POLICY "Users can insert their own feedback" 
  ON beta_feedback FOR INSERT 
  WITH CHECK (user_id = auth.uid());

-- Users can view their own feedback
CREATE POLICY "Users can view their own feedback" 
  ON beta_feedback FOR SELECT 
  USING (user_id = auth.uid());

-- Create policies for beta_requests
-- Admin can do everything
CREATE POLICY "Admins can do everything on beta_requests" 
  ON beta_requests FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Anyone can insert a beta request
CREATE POLICY "Anyone can insert a beta request" 
  ON beta_requests FOR INSERT 
  WITH CHECK (true);

-- Users can view their own requests
CREATE POLICY "Users can view their own requests" 
  ON beta_requests FOR SELECT 
  USING (email = auth.email());

-- Create policies for user_profiles
-- Admin can view all profiles
CREATE POLICY "Admins can view all profiles" 
  ON user_profiles FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Users can view their own profile
CREATE POLICY "Users can view their own profile" 
  ON user_profiles FOR SELECT 
  USING (user_id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" 
  ON user_profiles FOR UPDATE 
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid() AND role = 'user');

-- Academy Content Tables
-- See academy_content_tables.sql for the complete schema
-- This includes:
-- - academy_content_tags
-- - academy_content
-- - academy_content_to_tags
-- - contributions
-- - contribution_to_tags
