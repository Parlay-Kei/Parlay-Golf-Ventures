-- Migration: User Signups Table
-- Description: Creates a table for tracking user signups with beta status

-- Create user_signups table
CREATE TABLE IF NOT EXISTS user_signups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  email TEXT NOT NULL,
  is_beta BOOLEAN NOT NULL DEFAULT TRUE,
  signup_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_user_signups_user_id ON user_signups(user_id);
CREATE INDEX IF NOT EXISTS idx_user_signups_is_beta ON user_signups(is_beta);
CREATE INDEX IF NOT EXISTS idx_user_signups_signup_date ON user_signups(signup_date);

-- Add Row Level Security (RLS) policies
ALTER TABLE user_signups ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all signups
CREATE POLICY admin_all_access ON user_signups 
  FOR ALL 
  TO authenticated 
  USING (auth.jwt() ->> 'role' = 'admin');

-- Create a view for signup analytics
CREATE OR REPLACE VIEW signup_analytics AS
SELECT 
  DATE_TRUNC('day', signup_date) as day,
  COUNT(*) as total_signups,
  COUNT(*) FILTER (WHERE is_beta = TRUE) as beta_signups,
  COUNT(*) FILTER (WHERE is_beta = FALSE) as production_signups
FROM user_signups
GROUP BY DATE_TRUNC('day', signup_date)
ORDER BY day DESC;
