-- Search Database Schema

-- Enable the pg_trgm extension for text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Content Categories Table
CREATE TABLE IF NOT EXISTS content_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Popular Tags Table
CREATE TABLE IF NOT EXISTS popular_tags (
  id SERIAL PRIMARY KEY,
  tag TEXT NOT NULL UNIQUE,
  count INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content Tags Table
CREATE TABLE IF NOT EXISTS content_tags (
  id SERIAL PRIMARY KEY,
  content_id TEXT NOT NULL,
  content_type TEXT NOT NULL,
  tag TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(content_id, content_type, tag)
);

-- Search View that combines content from different sources
CREATE OR REPLACE VIEW search_view AS (
  -- Lessons
  SELECT
    l.id::TEXT,
    l.title,
    'lesson'::TEXT as type,
    l.description,
    l.thumbnail_url,
    '/academy/' || l.course_id || '/' || l.id as url,
    l.created_at,
    c.instructor as author,
    c.required_tier as tier,
    ARRAY(
      SELECT tag FROM content_tags 
      WHERE content_id = l.id::TEXT AND content_type = 'lesson'
    ) as tags,
    cat.name as category,
    to_tsvector('english', 
      coalesce(l.title, '') || ' ' || 
      coalesce(l.description, '') || ' ' || 
      coalesce(c.title, '') || ' ' || 
      string_agg(coalesce(ct.tag, ''), ' ')
    ) as search_vector
  FROM lessons l
  LEFT JOIN courses c ON l.course_id = c.id
  LEFT JOIN content_categories cat ON c.category_id = cat.id
  LEFT JOIN content_tags ct ON ct.content_id = l.id::TEXT AND ct.content_type = 'lesson'
  GROUP BY l.id, c.id, cat.id
  
  UNION ALL
  
  -- Videos (standalone videos not part of courses)
  SELECT
    v.id::TEXT,
    v.title,
    'video'::TEXT as type,
    v.description,
    v.thumbnail_url,
    '/videos/' || v.id as url,
    v.created_at,
    v.instructor as author,
    v.required_tier as tier,
    ARRAY(
      SELECT tag FROM content_tags 
      WHERE content_id = v.id::TEXT AND content_type = 'video'
    ) as tags,
    cat.name as category,
    to_tsvector('english', 
      coalesce(v.title, '') || ' ' || 
      coalesce(v.description, '') || ' ' || 
      string_agg(coalesce(ct.tag, ''), ' ')
    ) as search_vector
  FROM videos v
  LEFT JOIN content_categories cat ON v.category_id = cat.id
  LEFT JOIN content_tags ct ON ct.content_id = v.id::TEXT AND ct.content_type = 'video'
  WHERE v.course_id IS NULL -- Only standalone videos
  GROUP BY v.id, cat.id
  
  UNION ALL
  
  -- Articles
  SELECT
    a.id::TEXT,
    a.title,
    'article'::TEXT as type,
    a.summary as description,
    a.thumbnail_url,
    '/articles/' || a.id as url,
    a.created_at,
    a.author,
    a.required_tier as tier,
    ARRAY(
      SELECT tag FROM content_tags 
      WHERE content_id = a.id::TEXT AND content_type = 'article'
    ) as tags,
    cat.name as category,
    to_tsvector('english', 
      coalesce(a.title, '') || ' ' || 
      coalesce(a.summary, '') || ' ' || 
      coalesce(a.content, '') || ' ' || 
      string_agg(coalesce(ct.tag, ''), ' ')
    ) as search_vector
  FROM articles a
  LEFT JOIN content_categories cat ON a.category_id = cat.id
  LEFT JOIN content_tags ct ON ct.content_id = a.id::TEXT AND ct.content_type = 'article'
  GROUP BY a.id, cat.id
  
  UNION ALL
  
  -- Community Posts
  SELECT
    p.id::TEXT,
    CASE 
      WHEN length(p.content) <= 50 THEN p.content 
      ELSE substring(p.content, 1, 47) || '...'
    END as title,
    'community'::TEXT as type,
    p.content as description,
    NULL as thumbnail_url,
    '/community/post/' || p.id as url,
    p.created_at,
    u.full_name as author,
    'free'::TEXT as tier, -- Community posts are always free
    ARRAY(
      SELECT tag FROM content_tags 
      WHERE content_id = p.id::TEXT AND content_type = 'community'
    ) as tags,
    'Community'::TEXT as category,
    to_tsvector('english', 
      coalesce(p.content, '') || ' ' || 
      coalesce(u.full_name, '') || ' ' || 
      string_agg(coalesce(ct.tag, ''), ' ')
    ) as search_vector
  FROM community_posts p
  LEFT JOIN profiles u ON p.user_id = u.id
  LEFT JOIN content_tags ct ON ct.content_id = p.id::TEXT AND ct.content_type = 'community'
  GROUP BY p.id, u.id
);

-- Function to update popular tags based on content tags
CREATE OR REPLACE FUNCTION update_popular_tags()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update the tag count
  INSERT INTO popular_tags (tag, count, last_updated)
  VALUES (NEW.tag, 1, NOW())
  ON CONFLICT (tag) 
  DO UPDATE SET 
    count = popular_tags.count + 1,
    last_updated = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update popular tags when a new content tag is added
CREATE TRIGGER update_popular_tags_trigger
AFTER INSERT ON content_tags
FOR EACH ROW
EXECUTE FUNCTION update_popular_tags();

-- Function to decrease popular tag count when a content tag is removed
CREATE OR REPLACE FUNCTION decrease_popular_tag_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Decrease the tag count
  UPDATE popular_tags
  SET count = GREATEST(count - 1, 0),
      last_updated = NOW()
  WHERE tag = OLD.tag;
  
  -- Remove tags with zero count
  DELETE FROM popular_tags
  WHERE count = 0;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger to decrease popular tag count when a content tag is removed
CREATE TRIGGER decrease_popular_tag_count_trigger
AFTER DELETE ON content_tags
FOR EACH ROW
EXECUTE FUNCTION decrease_popular_tag_count();

-- Create indexes for better search performance
CREATE INDEX IF NOT EXISTS content_tags_content_id_idx ON content_tags(content_id);
CREATE INDEX IF NOT EXISTS content_tags_content_type_idx ON content_tags(content_type);
CREATE INDEX IF NOT EXISTS content_tags_tag_idx ON content_tags(tag);
CREATE INDEX IF NOT EXISTS popular_tags_count_idx ON popular_tags(count DESC);

-- Row Level Security Policies
ALTER TABLE content_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE popular_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_tags ENABLE ROW LEVEL SECURITY;

-- Everyone can view categories
CREATE POLICY "Categories are viewable by everyone" 
  ON content_categories FOR SELECT 
  USING (true);

-- Everyone can view popular tags
CREATE POLICY "Popular tags are viewable by everyone" 
  ON popular_tags FOR SELECT 
  USING (true);

-- Everyone can view content tags
CREATE POLICY "Content tags are viewable by everyone" 
  ON content_tags FOR SELECT 
  USING (true);

-- Only admins can modify categories
CREATE POLICY "Only admins can insert categories" 
  ON content_categories FOR INSERT 
  WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users));

CREATE POLICY "Only admins can update categories" 
  ON content_categories FOR UPDATE 
  USING (auth.uid() IN (SELECT user_id FROM admin_users));

CREATE POLICY "Only admins can delete categories" 
  ON content_categories FOR DELETE 
  USING (auth.uid() IN (SELECT user_id FROM admin_users));

-- Only admins can directly modify popular tags
CREATE POLICY "Only admins can insert popular tags" 
  ON popular_tags FOR INSERT 
  WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users));

CREATE POLICY "Only admins can update popular tags" 
  ON popular_tags FOR UPDATE 
  USING (auth.uid() IN (SELECT user_id FROM admin_users));

CREATE POLICY "Only admins can delete popular tags" 
  ON popular_tags FOR DELETE 
  USING (auth.uid() IN (SELECT user_id FROM admin_users));

-- Content creators and admins can add tags to content
CREATE POLICY "Content creators and admins can insert content tags" 
  ON content_tags FOR INSERT 
  WITH CHECK (
    auth.uid() IN (SELECT user_id FROM admin_users) OR
    auth.uid() IN (SELECT user_id FROM content_creators)
  );

CREATE POLICY "Content creators and admins can update content tags" 
  ON content_tags FOR UPDATE 
  USING (
    auth.uid() IN (SELECT user_id FROM admin_users) OR
    auth.uid() IN (SELECT user_id FROM content_creators)
  );

CREATE POLICY "Content creators and admins can delete content tags" 
  ON content_tags FOR DELETE 
  USING (
    auth.uid() IN (SELECT user_id FROM admin_users) OR
    auth.uid() IN (SELECT user_id FROM content_creators)
  );

-- Insert some initial categories
INSERT INTO content_categories (name, description)
VALUES 
  ('Swing Fundamentals', 'Basic and advanced golf swing techniques'),
  ('Short Game', 'Putting, chipping, and pitching techniques'),
  ('Course Management', 'Strategic play and decision making on the course'),
  ('Mental Game', 'Psychology, focus, and mental preparation'),
  ('Physical Training', 'Fitness, flexibility, and strength for golf'),
  ('Equipment', 'Club selection, fitting, and technology'),
  ('Rules & Etiquette', 'Golf rules, scoring, and course etiquette'),
  ('Tournament Preparation', 'Preparing for competitive play'),
  ('Beginner Basics', 'Fundamentals for new golfers'),
  ('Advanced Techniques', 'Specialized techniques for experienced players'),
  ('Community', 'Community discussions and social content')
ON CONFLICT (name) DO NOTHING;
