-- Migration: Master Schema Update
-- Description: Comprehensive schema update with all tables, indexes, and RLS policies
-- Date: 2025-01-18

-- This migration applies the complete master schema to ensure all tables, indexes, and policies are up to date

-- =====================
-- ENUM TYPES
-- =====================
DO $$ BEGIN
    CREATE TYPE contributor_type AS ENUM ('member', 'guest', 'mentor', 'creator');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE contribution_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE member_contribution_type AS ENUM ('swing-video', 'tutorial-topic', 'personal-story');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE guest_contribution_type AS ENUM ('swing-demo', 'idea');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE mentor_contribution_type AS ENUM ('swing-breakdown', 'ai-tutorial');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE content_creator_type AS ENUM ('edited-clip', 'commentary', 'gear-review', 'community-highlight');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE swing_type AS ENUM ('driver', 'iron', 'wedge', 'putting');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE analysis_type AS ENUM ('technical', 'conceptual', 'both');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE gear_type AS ENUM ('driver', 'iron', 'wedge', 'putter', 'ball', 'accessory');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE highlight_type AS ENUM ('achievement', 'improvement', 'community', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('member', 'mentor', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================
-- USER PROFILES & ADMIN
-- =====================
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
  role TEXT DEFAULT 'user',
  is_verified BOOLEAN DEFAULT false,
  verification_token TEXT,
  verification_token_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile." ON profiles;
CREATE POLICY "Users can view their own profile." ON profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile." ON profiles;
CREATE POLICY "Users can update their own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles." ON profiles;
CREATE POLICY "Admins can view all profiles." ON profiles FOR SELECT USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

DROP POLICY IF EXISTS "Admins can update all profiles." ON profiles;
CREATE POLICY "Admins can update all profiles." ON profiles FOR UPDATE USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- =====================
-- COMMUNITY FEED
-- =====================
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  likes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS community_posts_user_id_idx ON community_posts(user_id);
CREATE INDEX IF NOT EXISTS community_posts_created_at_idx ON community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS community_posts_likes_count_idx ON community_posts(likes_count DESC);

ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view community posts" ON community_posts;
CREATE POLICY "Anyone can view community posts" ON community_posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create posts" ON community_posts;
CREATE POLICY "Authenticated users can create posts" ON community_posts FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update their own posts" ON community_posts;
CREATE POLICY "Users can update their own posts" ON community_posts FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own posts" ON community_posts;
CREATE POLICY "Users can delete their own posts" ON community_posts FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS post_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS post_comments_post_id_idx ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS post_comments_user_id_idx ON post_comments(user_id);
CREATE INDEX IF NOT EXISTS post_comments_created_at_idx ON post_comments(created_at DESC);

ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view post comments" ON post_comments;
CREATE POLICY "Anyone can view post comments" ON post_comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create comments" ON post_comments;
CREATE POLICY "Authenticated users can create comments" ON post_comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update their own comments" ON post_comments;
CREATE POLICY "Users can update their own comments" ON post_comments FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own comments" ON post_comments;
CREATE POLICY "Users can delete their own comments" ON post_comments FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS post_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

CREATE INDEX IF NOT EXISTS post_likes_post_id_idx ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS post_likes_user_id_idx ON post_likes(user_id);

ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view post likes" ON post_likes;
CREATE POLICY "Anyone can view post likes" ON post_likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can like posts" ON post_likes;
CREATE POLICY "Authenticated users can like posts" ON post_likes FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can unlike posts they liked" ON post_likes;
CREATE POLICY "Users can unlike posts they liked" ON post_likes FOR DELETE USING (auth.uid() = user_id);

-- =====================
-- CONTENT NOTIFICATIONS
-- =====================
CREATE TABLE IF NOT EXISTS content_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id TEXT NOT NULL,
  content_title TEXT NOT NULL,
  release_date TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, content_id)
);

CREATE INDEX IF NOT EXISTS content_notifications_user_id_idx ON content_notifications(user_id);
CREATE INDEX IF NOT EXISTS content_notifications_content_id_idx ON content_notifications(content_id);

ALTER TABLE content_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own notifications." ON content_notifications;
CREATE POLICY "Users can view their own notifications." ON content_notifications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own notifications." ON content_notifications;
CREATE POLICY "Users can insert their own notifications." ON content_notifications FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications." ON content_notifications;
CREATE POLICY "Users can update their own notifications." ON content_notifications FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own notifications." ON content_notifications;
CREATE POLICY "Users can delete their own notifications." ON content_notifications FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all notifications." ON content_notifications;
CREATE POLICY "Admins can view all notifications." ON content_notifications FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- =====================
-- COURSES, LESSONS, PROGRESS
-- =====================
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail_url VARCHAR(255),
  total_lessons INTEGER NOT NULL DEFAULT 0,
  level VARCHAR(50) CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Courses are viewable by everyone" ON courses;
CREATE POLICY "Courses are viewable by everyone" ON courses FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert courses" ON courses;
CREATE POLICY "Admins can insert courses" ON courses FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins can update courses" ON courses;
CREATE POLICY "Admins can update courses" ON courses FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins can delete courses" ON courses;
CREATE POLICY "Admins can delete courses" ON courses FOR DELETE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL,
  thumbnail_url VARCHAR(255),
  video_url VARCHAR(255),
  order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS lessons_course_id_idx ON lessons(course_id);

ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lessons are viewable by everyone" ON lessons;
CREATE POLICY "Lessons are viewable by everyone" ON lessons FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert lessons" ON lessons;
CREATE POLICY "Admins can insert lessons" ON lessons FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins can update lessons" ON lessons;
CREATE POLICY "Admins can update lessons" ON lessons FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins can delete lessons" ON lessons;
CREATE POLICY "Admins can delete lessons" ON lessons FOR DELETE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE TABLE IF NOT EXISTS user_lesson_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  watch_time INTEGER NOT NULL DEFAULT 0,
  last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS user_lesson_progress_user_id_idx ON user_lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS user_lesson_progress_lesson_id_idx ON user_lesson_progress(lesson_id);

ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own lesson progress" ON user_lesson_progress;
CREATE POLICY "Users can view their own lesson progress" ON user_lesson_progress FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own lesson progress" ON user_lesson_progress;
CREATE POLICY "Users can insert their own lesson progress" ON user_lesson_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own lesson progress" ON user_lesson_progress;
CREATE POLICY "Users can update their own lesson progress" ON user_lesson_progress FOR UPDATE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS user_course_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  completed_lessons INTEGER NOT NULL DEFAULT 0,
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

CREATE INDEX IF NOT EXISTS user_course_progress_user_id_idx ON user_course_progress(user_id);
CREATE INDEX IF NOT EXISTS user_course_progress_course_id_idx ON user_course_progress(course_id);

ALTER TABLE user_course_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own course progress" ON user_course_progress;
CREATE POLICY "Users can view their own course progress" ON user_course_progress FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own course progress" ON user_course_progress;
CREATE POLICY "Users can insert their own course progress" ON user_course_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own course progress" ON user_course_progress;
CREATE POLICY "Users can update their own course progress" ON user_course_progress FOR UPDATE USING (auth.uid() = user_id);

-- =====================
-- CONTRIBUTIONS
-- =====================
CREATE TABLE IF NOT EXISTS contributions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    contributor_id UUID NOT NULL REFERENCES auth.users(id),
    contributor_type contributor_type NOT NULL,
    contribution_type TEXT NOT NULL,
    status contribution_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tags TEXT[] DEFAULT '{}',
    is_public BOOLEAN DEFAULT true,
    video_url TEXT,
    swing_type swing_type,
    difficulty_level difficulty_level,
    category TEXT,
    impact TEXT,
    target_swing_id UUID,
    analysis_type analysis_type,
    key_points TEXT[],
    ai_model TEXT,
    prompt_used TEXT,
    gear_brand TEXT,
    gear_model TEXT,
    gear_type gear_type,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    pros TEXT[],
    cons TEXT[],
    featured_community_member UUID,
    highlight_type highlight_type
);

CREATE INDEX IF NOT EXISTS idx_contributions_contributor_id ON contributions(contributor_id);
CREATE INDEX IF NOT EXISTS idx_contributions_status ON contributions(status);
CREATE INDEX IF NOT EXISTS idx_contributions_created_at ON contributions(created_at);
CREATE INDEX IF NOT EXISTS idx_contributions_contributor_type ON contributions(contributor_type);

ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Contributions are viewable by everyone if public" ON contributions;
CREATE POLICY "Contributions are viewable by everyone if public" ON contributions FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Users can view their own contributions" ON contributions;
CREATE POLICY "Users can view their own contributions" ON contributions FOR SELECT USING (auth.uid() = contributor_id);

DROP POLICY IF EXISTS "Authenticated users can create contributions" ON contributions;
CREATE POLICY "Authenticated users can create contributions" ON contributions FOR INSERT WITH CHECK (auth.uid() = contributor_id);

DROP POLICY IF EXISTS "Users can update their own contributions" ON contributions;
CREATE POLICY "Users can update their own contributions" ON contributions FOR UPDATE USING (auth.uid() = contributor_id);

DROP POLICY IF EXISTS "Users can delete their own contributions" ON contributions;
CREATE POLICY "Users can delete their own contributions" ON contributions FOR DELETE USING (auth.uid() = contributor_id);

DROP POLICY IF EXISTS "Mentors can update any contribution status" ON contributions;
CREATE POLICY "Mentors can update any contribution status" ON contributions FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'mentor'));

DROP POLICY IF EXISTS "Admins can perform any operation" ON contributions;
CREATE POLICY "Admins can perform any operation" ON contributions FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- =====================
-- SUBSCRIPTIONS & BILLING
-- =====================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own customer data." ON customers;
CREATE POLICY "Users can view their own customer data." ON customers FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Only service role can insert customer data." ON customers;
CREATE POLICY "Only service role can insert customer data." ON customers FOR INSERT WITH CHECK (auth.uid() = id OR auth.jwt() ? auth.jwt()->>'role' = 'service_role' : false);

DROP POLICY IF EXISTS "Only service role can update customer data." ON customers;
CREATE POLICY "Only service role can update customer data." ON customers FOR UPDATE USING (auth.uid() = id OR auth.jwt() ? auth.jwt()->>'role' = 'service_role' : false);

CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  tier TEXT NOT NULL,
  status TEXT NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS subscriptions_status_idx ON subscriptions(status);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own subscriptions." ON subscriptions;
CREATE POLICY "Users can view their own subscriptions." ON subscriptions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Only service role can insert subscriptions." ON subscriptions;
CREATE POLICY "Only service role can insert subscriptions." ON subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.jwt() ? auth.jwt()->>'role' = 'service_role' : false);

DROP POLICY IF EXISTS "Only service role can update subscriptions." ON subscriptions;
CREATE POLICY "Only service role can update subscriptions." ON subscriptions FOR UPDATE USING (auth.uid() = user_id OR auth.jwt() ? auth.jwt()->>'role' = 'service_role' : false);

DROP POLICY IF EXISTS "Only service role can delete subscriptions." ON subscriptions;
CREATE POLICY "Only service role can delete subscriptions." ON subscriptions FOR DELETE USING (auth.uid() = user_id OR auth.jwt() ? auth.jwt()->>'role' = 'service_role' : false);

CREATE TABLE IF NOT EXISTS payment_methods (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_payment_method_id TEXT UNIQUE,
  type TEXT NOT NULL,
  last_four TEXT,
  exp_month INTEGER,
  exp_year INTEGER,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS payment_methods_user_id_idx ON payment_methods(user_id);

ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own payment methods." ON payment_methods;
CREATE POLICY "Users can view their own payment methods." ON payment_methods FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Only service role can insert payment methods." ON payment_methods;
CREATE POLICY "Only service role can insert payment methods." ON payment_methods FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.jwt() ? auth.jwt()->>'role' = 'service_role' : false);

DROP POLICY IF EXISTS "Only service role can update payment methods." ON payment_methods;
CREATE POLICY "Only service role can update payment methods." ON payment_methods FOR UPDATE USING (auth.uid() = user_id OR auth.jwt() ? auth.jwt()->>'role' = 'service_role' : false);

DROP POLICY IF EXISTS "Only service role can delete payment methods." ON payment_methods;
CREATE POLICY "Only service role can delete payment methods." ON payment_methods FOR DELETE USING (auth.uid() = user_id OR auth.jwt() ? auth.jwt()->>'role' = 'service_role' : false);

CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_invoice_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  amount_due INTEGER,
  amount_paid INTEGER,
  currency TEXT,
  status TEXT,
  invoice_pdf TEXT,
  hosted_invoice_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS invoices_user_id_idx ON invoices(user_id);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own invoices." ON invoices;
CREATE POLICY "Users can view their own invoices." ON invoices FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Only service role can insert invoices." ON invoices;
CREATE POLICY "Only service role can insert invoices." ON invoices FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.jwt() ? auth.jwt()->>'role' = 'service_role' : false);

CREATE TABLE IF NOT EXISTS subscription_history (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT,
  previous_tier TEXT,
  new_tier TEXT,
  previous_status TEXT,
  new_status TEXT,
  change_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS subscription_history_user_id_idx ON subscription_history(user_id);

ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own subscription history." ON subscription_history;
CREATE POLICY "Users can view their own subscription history." ON subscription_history FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Only service role can insert subscription history." ON subscription_history;
CREATE POLICY "Only service role can insert subscription history." ON subscription_history FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.jwt() ? auth.jwt()->>'role' = 'service_role' : false);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  stripe_product_id TEXT UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active products." ON products;
CREATE POLICY "Anyone can view active products." ON products FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "Only service role can manage products." ON products;
CREATE POLICY "Only service role can manage products." ON products FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE TABLE IF NOT EXISTS prices (
  id SERIAL PRIMARY KEY,
  stripe_price_id TEXT UNIQUE,
  stripe_product_id TEXT NOT NULL,
  tier TEXT NOT NULL,
  currency TEXT NOT NULL,
  unit_amount INTEGER NOT NULL,
  interval TEXT NOT NULL,
  interval_count INTEGER NOT NULL DEFAULT 1,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (stripe_product_id) REFERENCES products(stripe_product_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS prices_tier_idx ON prices(tier);

ALTER TABLE prices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active prices." ON prices;
CREATE POLICY "Anyone can view active prices." ON prices FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "Only service role can manage prices." ON prices;
CREATE POLICY "Only service role can manage prices." ON prices FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- =====================
-- AUDIT LOGS
-- =====================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  action VARCHAR(50) NOT NULL,
  details JSONB NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own audit logs" ON audit_logs;
CREATE POLICY "Users can view their own audit logs" ON audit_logs FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all audit logs" ON audit_logs;
CREATE POLICY "Admins can view all audit logs" ON audit_logs FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- =====================
-- CONTENT METRICS
-- =====================
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

CREATE INDEX IF NOT EXISTS idx_content_metrics_content_id ON content_metrics(content_id);
CREATE INDEX IF NOT EXISTS idx_content_metrics_content_type ON content_metrics(content_type);
CREATE INDEX IF NOT EXISTS idx_content_metrics_metric_type ON content_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_content_metrics_user_id ON content_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_content_metrics_composite ON content_metrics(content_id, content_type, metric_type);

ALTER TABLE content_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS admin_all_access ON content_metrics;
CREATE POLICY admin_all_access ON content_metrics FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS user_view_public_metrics ON content_metrics;
CREATE POLICY user_view_public_metrics ON content_metrics FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS user_add_own_metrics ON content_metrics;
CREATE POLICY user_add_own_metrics ON content_metrics FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- =====================
-- PLATFORM STATUS
-- =====================
CREATE TABLE IF NOT EXISTS platform_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  status TEXT NOT NULL,
  changed_by TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_platform_status_status ON platform_status(status);
CREATE INDEX IF NOT EXISTS idx_platform_status_created_at ON platform_status(created_at);

ALTER TABLE platform_status ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS admin_all_access ON platform_status;
CREATE POLICY admin_all_access ON platform_status FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- =====================
-- USER SIGNUPS & ANALYTICS
-- =====================
CREATE TABLE IF NOT EXISTS user_signups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  email TEXT NOT NULL,
  is_beta BOOLEAN NOT NULL DEFAULT TRUE,
  signup_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_user_signups_user_id ON user_signups(user_id);
CREATE INDEX IF NOT EXISTS idx_user_signups_is_beta ON user_signups(is_beta);
CREATE INDEX IF NOT EXISTS idx_user_signups_signup_date ON user_signups(signup_date);

ALTER TABLE user_signups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS admin_all_access ON user_signups;
CREATE POLICY admin_all_access ON user_signups FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE TABLE IF NOT EXISTS public.signup_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    is_beta_signup BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    source TEXT,
    referral_code TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT
);

CREATE INDEX IF NOT EXISTS idx_signup_analytics_created_at ON public.signup_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_signup_analytics_is_beta ON public.signup_analytics(is_beta_signup);

ALTER TABLE public.signup_analytics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all signup analytics" ON public.signup_analytics;
CREATE POLICY "Admins can view all signup analytics" ON public.signup_analytics FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins can insert signup analytics" ON public.signup_analytics;
CREATE POLICY "Admins can insert signup analytics" ON public.signup_analytics FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- =====================
-- SEARCH & TAGGING
-- =====================
CREATE TABLE IF NOT EXISTS content_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS popular_tags (
  id SERIAL PRIMARY KEY,
  tag TEXT NOT NULL UNIQUE,
  count INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS popular_tags_count_idx ON popular_tags(count DESC);

CREATE TABLE IF NOT EXISTS content_tags (
  id SERIAL PRIMARY KEY,
  content_id TEXT NOT NULL,
  content_type TEXT NOT NULL,
  tag TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(content_id, content_type, tag)
);

CREATE INDEX IF NOT EXISTS content_tags_content_id_idx ON content_tags(content_id);
CREATE INDEX IF NOT EXISTS content_tags_content_type_idx ON content_tags(content_type);

-- =====================
-- END OF MASTER SCHEMA MIGRATION
-- ===================== 