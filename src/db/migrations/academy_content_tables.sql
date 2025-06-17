-- Academy Content Tables Migration

-- Academy Content Tags Table
CREATE TABLE IF NOT EXISTS academy_content_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Academy Content Table
CREATE TABLE IF NOT EXISTS academy_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  content TEXT,
  thumbnail_url TEXT,
  author_id UUID REFERENCES auth.users(id),
  status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
  is_premium BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- Academy Content Tags Junction Table
CREATE TABLE IF NOT EXISTS academy_content_to_tags (
  content_id UUID NOT NULL REFERENCES academy_content(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES academy_content_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (content_id, tag_id)
);

-- Contributions Table
CREATE TABLE IF NOT EXISTS contributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  contributor_id UUID NOT NULL REFERENCES auth.users(id),
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  type TEXT NOT NULL CHECK (type IN ('tip', 'article', 'video', 'drill', 'question')),
  thumbnail_url TEXT,
  rejection_reason TEXT,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Contribution Tags Junction Table
CREATE TABLE IF NOT EXISTS contribution_to_tags (
  contribution_id UUID NOT NULL REFERENCES contributions(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES academy_content_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (contribution_id, tag_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_academy_content_tags_name ON academy_content_tags(name);
CREATE INDEX IF NOT EXISTS idx_academy_content_tags_slug ON academy_content_tags(slug);
CREATE INDEX IF NOT EXISTS idx_academy_content_slug ON academy_content(slug);
CREATE INDEX IF NOT EXISTS idx_academy_content_author_id ON academy_content(author_id);
CREATE INDEX IF NOT EXISTS idx_academy_content_status ON academy_content(status);
CREATE INDEX IF NOT EXISTS idx_academy_content_is_premium ON academy_content(is_premium);
CREATE INDEX IF NOT EXISTS idx_contributions_contributor_id ON contributions(contributor_id);
CREATE INDEX IF NOT EXISTS idx_contributions_status ON contributions(status);
CREATE INDEX IF NOT EXISTS idx_contributions_type ON contributions(type);

-- Enable Row Level Security (RLS) on tables
ALTER TABLE academy_content_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_content_to_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contribution_to_tags ENABLE ROW LEVEL SECURITY;

-- Create policies for academy_content_tags
-- Admin can do everything
CREATE POLICY "Admins can do everything on academy_content_tags" 
  ON academy_content_tags FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Everyone can view tags
CREATE POLICY "Everyone can view tags" 
  ON academy_content_tags FOR SELECT 
  USING (true);

-- Create policies for academy_content
-- Admin can do everything
CREATE POLICY "Admins can do everything on academy_content" 
  ON academy_content FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Authors can manage their own content
CREATE POLICY "Authors can manage their own content" 
  ON academy_content FOR ALL 
  USING (author_id = auth.uid());

-- Everyone can view published content
CREATE POLICY "Everyone can view published content" 
  ON academy_content FOR SELECT 
  USING (status = 'published');

-- Create policies for academy_content_to_tags
-- Admin can do everything
CREATE POLICY "Admins can do everything on academy_content_to_tags" 
  ON academy_content_to_tags FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Authors can manage tags for their own content
CREATE POLICY "Authors can manage tags for their own content" 
  ON academy_content_to_tags FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM academy_content 
    WHERE id = academy_content_to_tags.content_id AND author_id = auth.uid()
  ));

-- Everyone can view tags for published content
CREATE POLICY "Everyone can view tags for published content" 
  ON academy_content_to_tags FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM academy_content 
    WHERE id = academy_content_to_tags.content_id AND status = 'published'
  ));

-- Create policies for contributions
-- Admin can do everything
CREATE POLICY "Admins can do everything on contributions" 
  ON contributions FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Contributors can manage their own contributions
CREATE POLICY "Contributors can manage their own contributions" 
  ON contributions FOR ALL 
  USING (contributor_id = auth.uid());

-- Everyone can view approved contributions
CREATE POLICY "Everyone can view approved contributions" 
  ON contributions FOR SELECT 
  USING (status = 'approved');

-- Create policies for contribution_to_tags
-- Admin can do everything
CREATE POLICY "Admins can do everything on contribution_to_tags" 
  ON contribution_to_tags FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Contributors can manage tags for their own contributions
CREATE POLICY "Contributors can manage tags for their own contributions" 
  ON contribution_to_tags FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM contributions 
    WHERE id = contribution_to_tags.contribution_id AND contributor_id = auth.uid()
  ));

-- Everyone can view tags for approved contributions
CREATE POLICY "Everyone can view tags for approved contributions" 
  ON contribution_to_tags FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM contributions 
    WHERE id = contribution_to_tags.contribution_id AND status = 'approved'
  ));
