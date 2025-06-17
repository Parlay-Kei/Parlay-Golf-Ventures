-- Content Tables Migration

-- Academy Content Tags Table
CREATE TABLE IF NOT EXISTS public.academy_content_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Contributions Table
CREATE TABLE IF NOT EXISTS public.contributions (
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
CREATE TABLE IF NOT EXISTS public.contribution_to_tags (
  contribution_id UUID NOT NULL REFERENCES contributions(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES academy_content_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (contribution_id, tag_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_academy_content_tags_name ON academy_content_tags(name);
CREATE INDEX IF NOT EXISTS idx_academy_content_tags_slug ON academy_content_tags(slug);
CREATE INDEX IF NOT EXISTS idx_contributions_contributor_id ON contributions(contributor_id);
CREATE INDEX IF NOT EXISTS idx_contributions_status ON contributions(status);
CREATE INDEX IF NOT EXISTS idx_contributions_type ON contributions(type);
