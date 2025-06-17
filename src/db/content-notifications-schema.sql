-- Content Notifications Database Schema

-- Content Notifications table
CREATE TABLE IF NOT EXISTS content_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id TEXT NOT NULL,
  content_title TEXT NOT NULL,
  release_date TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, content_id)
);

-- Row Level Security Policies for Content Notifications
ALTER TABLE content_notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications."
  ON content_notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own notifications
CREATE POLICY "Users can insert their own notifications."
  ON content_notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own notifications
CREATE POLICY "Users can update their own notifications."
  ON content_notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications."
  ON content_notifications FOR DELETE
  USING (auth.uid() = user_id);

-- Admin Users can view all notifications
CREATE POLICY "Admins can view all notifications."
  ON content_notifications FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM admin_users));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS content_notifications_user_id_idx ON content_notifications(user_id);
CREATE INDEX IF NOT EXISTS content_notifications_content_id_idx ON content_notifications(content_id);
