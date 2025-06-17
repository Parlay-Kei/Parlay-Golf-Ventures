-- Simple Content Tables Migration (without indexes)

-- Academy Content Tags Table
CREATE TABLE IF NOT EXISTS academy_content_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Contributions Table
CREATE TABLE IF NOT EXISTS contributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  contributor_id UUID NOT NULL REFERENCES auth.users(id),
  contributor_type TEXT DEFAULT 'guest',
  status TEXT NOT NULL DEFAULT 'pending',
  type TEXT,
  description TEXT,
  thumbnail_url TEXT,
  is_public BOOLEAN DEFAULT TRUE,
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
