-- User Profile Database Schema

-- User Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(100),
  email VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  bio TEXT,
  avatar_url TEXT,
  skill_level VARCHAR(50),
  learning_style VARCHAR(50),
  goals TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin Users table
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- User Avatars storage bucket
CREATE POLICY "Avatar images are publicly accessible."
  ON storage.objects FOR SELECT
  USING (bucket_id = 'user-avatars');

CREATE POLICY "Users can upload their own avatar."
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'user-avatars' AND auth.uid() = (storage.foldername(name))[1]::uuid);

CREATE POLICY "Users can update their own avatar."
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'user-avatars' AND auth.uid() = (storage.foldername(name))[1]::uuid);

CREATE POLICY "Users can delete their own avatar."
  ON storage.objects FOR DELETE
  USING (bucket_id = 'user-avatars' AND auth.uid() = (storage.foldername(name))[1]::uuid);

-- Row Level Security Policies for Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view their own profile."
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile."
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile."
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles."
  ON profiles FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM admin_users));

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles."
  ON profiles FOR UPDATE
  USING (auth.uid() IN (SELECT user_id FROM admin_users));

-- Row Level Security Policies for Admin Users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Only admins can view admin users
CREATE POLICY "Only admins can view admin users."
  ON admin_users FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM admin_users));

-- Only admins can insert admin users
CREATE POLICY "Only admins can insert admin users."
  ON admin_users FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users));

-- Only admins can update admin users
CREATE POLICY "Only admins can update admin users."
  ON admin_users FOR UPDATE
  USING (auth.uid() IN (SELECT user_id FROM admin_users));

-- Only admins can delete admin users
CREATE POLICY "Only admins can delete admin users."
  ON admin_users FOR DELETE
  USING (auth.uid() IN (SELECT user_id FROM admin_users));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);
CREATE INDEX IF NOT EXISTS admin_users_user_id_idx ON admin_users(user_id);
