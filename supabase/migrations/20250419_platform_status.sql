-- Migration: Platform Status Table
-- Description: Creates a table for tracking platform status changes (beta/live)

-- Create platform_status table
CREATE TABLE IF NOT EXISTS platform_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  status TEXT NOT NULL,
  changed_by TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_platform_status_status ON platform_status(status);
CREATE INDEX IF NOT EXISTS idx_platform_status_created_at ON platform_status(created_at);

-- Add Row Level Security (RLS) policies
ALTER TABLE platform_status ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view and insert platform status changes
CREATE POLICY admin_all_access ON platform_status 
  FOR ALL 
  TO authenticated 
  USING (auth.jwt() ->> 'role' = 'admin');

-- Insert initial beta status
INSERT INTO platform_status (status, notes)
VALUES ('beta', 'Initial platform status');

-- Create a function to log platform status changes
CREATE OR REPLACE FUNCTION log_platform_status_change(new_status TEXT, admin_id TEXT, change_notes TEXT)
RETURNS UUID AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO platform_status (status, changed_by, notes)
  VALUES (new_status, admin_id, change_notes)
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;
