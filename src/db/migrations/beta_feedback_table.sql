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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_beta_feedback_user_id ON beta_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_beta_feedback_submitted_at ON beta_feedback(submitted_at);

-- Enable Row Level Security (RLS)
ALTER TABLE beta_feedback ENABLE ROW LEVEL SECURITY;

-- Create policies for beta_feedback
-- Admin can do everything
CREATE POLICY "Admins can do everything on beta_feedback" 
  ON beta_feedback FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Users can view and insert their own feedback
CREATE POLICY "Users can view their own feedback" 
  ON beta_feedback FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own feedback" 
  ON beta_feedback FOR INSERT 
  WITH CHECK (user_id = auth.uid());
