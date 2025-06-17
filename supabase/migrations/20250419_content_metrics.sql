-- Migration: Content Metrics Table
-- Description: Creates a table for tracking user engagement metrics for content

-- Create content_metrics table
CREATE TABLE IF NOT EXISTS content_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id TEXT NOT NULL,
  content_type TEXT NOT NULL,
  metric_type TEXT NOT NULL,
  user_id TEXT,
  value INTEGER NOT NULL DEFAULT 1,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_content_metrics_content_id ON content_metrics(content_id);
CREATE INDEX IF NOT EXISTS idx_content_metrics_content_type ON content_metrics(content_type);
CREATE INDEX IF NOT EXISTS idx_content_metrics_metric_type ON content_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_content_metrics_user_id ON content_metrics(user_id);

-- Add a composite index for common queries
CREATE INDEX IF NOT EXISTS idx_content_metrics_composite 
  ON content_metrics(content_id, content_type, metric_type);

-- Add Row Level Security (RLS) policies
ALTER TABLE content_metrics ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all metrics
CREATE POLICY admin_all_access ON content_metrics 
  FOR ALL 
  TO authenticated 
  USING (auth.jwt() ->> 'role' = 'admin');

-- Policy: Users can view metrics for public content
CREATE POLICY user_view_public_metrics ON content_metrics 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Policy: Users can add their own metrics
CREATE POLICY user_add_own_metrics ON content_metrics 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Add function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to automatically update updated_at
CREATE TRIGGER update_content_metrics_updated_at
BEFORE UPDATE ON content_metrics
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Create a view for aggregated metrics
CREATE OR REPLACE VIEW content_metrics_summary AS
SELECT 
  content_id,
  content_type,
  metric_type,
  SUM(value) as total_value,
  COUNT(DISTINCT user_id) as unique_users,
  MAX(updated_at) as last_updated
FROM content_metrics
GROUP BY content_id, content_type, metric_type;
