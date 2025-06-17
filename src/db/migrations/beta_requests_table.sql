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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_beta_requests_email ON beta_requests(email);
CREATE INDEX IF NOT EXISTS idx_beta_requests_status ON beta_requests(status);

-- Enable Row Level Security (RLS)
ALTER TABLE beta_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for beta_requests
-- Admin can do everything
CREATE POLICY "Admins can do everything on beta_requests" 
  ON beta_requests FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Anonymous users can insert requests
CREATE POLICY "Anonymous users can insert beta requests" 
  ON beta_requests FOR INSERT 
  WITH CHECK (auth.role() = 'anon');

-- Users can view their own requests
CREATE POLICY "Users can view their own beta requests" 
  ON beta_requests FOR SELECT 
  USING (email = auth.email());
