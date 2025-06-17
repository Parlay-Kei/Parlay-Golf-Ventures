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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_beta_invites_code ON beta_invites(code);
CREATE INDEX IF NOT EXISTS idx_beta_invites_email ON beta_invites(email);
CREATE INDEX IF NOT EXISTS idx_beta_invites_status ON beta_invites(status);
CREATE INDEX IF NOT EXISTS idx_beta_users_user_id ON beta_users(user_id);

-- Set up Row Level Security (RLS) policies

-- Enable RLS on tables
ALTER TABLE beta_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta_users ENABLE ROW LEVEL SECURITY;

-- Create policies for beta_invites
-- Admin can do everything
CREATE POLICY "Admins can do everything on beta_invites" 
  ON beta_invites FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM user_roles 
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
    SELECT 1 FROM user_roles 
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
  WITH CHECK (user_id = auth.uid() AND 
    (feedback_provided IS NOT NULL OR last_active_at IS NOT NULL));
