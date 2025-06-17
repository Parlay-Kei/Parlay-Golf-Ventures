-- Create tables for content types if they don't exist already

-- Lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  thumbnail_url TEXT,
  video_url TEXT,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'driven', 'aspiring', 'breakthrough')),
  category TEXT,
  tags TEXT[],
  author_id UUID REFERENCES auth.users(id),
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Articles table
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  thumbnail_url TEXT,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'driven', 'aspiring', 'breakthrough')),
  category TEXT,
  tags TEXT[],
  author_id UUID REFERENCES auth.users(id),
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Videos table
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INTEGER, -- in seconds
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'driven', 'aspiring', 'breakthrough')),
  category TEXT,
  tags TEXT[],
  author_id UUID REFERENCES auth.users(id),
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community posts table
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Popular tags view (will be populated by a function/trigger)
CREATE TABLE IF NOT EXISTS popular_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tag TEXT NOT NULL UNIQUE,
  count INTEGER DEFAULT 1,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a function to update popular_tags
CREATE OR REPLACE FUNCTION update_popular_tags()
RETURNS TRIGGER AS $$
BEGIN
  -- For each tag in the new/updated record
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    FOREACH item IN ARRAY NEW.tags
    LOOP
      -- Insert or update the tag count
      INSERT INTO popular_tags (tag, count)
      VALUES (item, 1)
      ON CONFLICT (tag)
      DO UPDATE SET 
        count = popular_tags.count + 1,
        updated_at = NOW();
    END LOOP;
  END IF;
  
  -- For deleted records or updated records with removed tags
  IF TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN
    FOREACH item IN ARRAY 
      CASE 
        WHEN TG_OP = 'DELETE' THEN OLD.tags
        WHEN TG_OP = 'UPDATE' THEN (
          SELECT ARRAY(
            SELECT unnest(OLD.tags) 
            EXCEPT 
            SELECT unnest(NEW.tags)
          )
        )
      END
    LOOP
      -- Decrement the tag count
      UPDATE popular_tags
      SET count = GREATEST(count - 1, 0),
          updated_at = NOW()
      WHERE tag = item;
      
      -- Remove tags with zero count
      DELETE FROM popular_tags
      WHERE count = 0;
    END LOOP;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for tag counting
DROP TRIGGER IF EXISTS lessons_tags_trigger ON lessons;
CREATE TRIGGER lessons_tags_trigger
AFTER INSERT OR UPDATE OR DELETE ON lessons
FOR EACH ROW
EXECUTE FUNCTION update_popular_tags();

DROP TRIGGER IF EXISTS articles_tags_trigger ON articles;
CREATE TRIGGER articles_tags_trigger
AFTER INSERT OR UPDATE OR DELETE ON articles
FOR EACH ROW
EXECUTE FUNCTION update_popular_tags();

DROP TRIGGER IF EXISTS videos_tags_trigger ON videos;
CREATE TRIGGER videos_tags_trigger
AFTER INSERT OR UPDATE OR DELETE ON videos
FOR EACH ROW
EXECUTE FUNCTION update_popular_tags();

DROP TRIGGER IF EXISTS community_posts_tags_trigger ON community_posts;
CREATE TRIGGER community_posts_tags_trigger
AFTER INSERT OR UPDATE OR DELETE ON community_posts
FOR EACH ROW
EXECUTE FUNCTION update_popular_tags();

-- Create search vector columns for full-text search
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS search_vector tsvector;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS search_vector tsvector;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS search_vector tsvector;
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create function to update search vectors
CREATE OR REPLACE FUNCTION update_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'lessons' THEN
    NEW.search_vector = 
      setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
      setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
      setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'C') ||
      setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'B');
  ELSIF TG_TABLE_NAME = 'articles' THEN
    NEW.search_vector = 
      setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
      setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
      setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'C') ||
      setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'B');
  ELSIF TG_TABLE_NAME = 'videos' THEN
    NEW.search_vector = 
      setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
      setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
      setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'B');
  ELSIF TG_TABLE_NAME = 'community_posts' THEN
    NEW.search_vector = 
      setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
      setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'C') ||
      setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'B');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for search vector updates
DROP TRIGGER IF EXISTS lessons_search_trigger ON lessons;
CREATE TRIGGER lessons_search_trigger
BEFORE INSERT OR UPDATE ON lessons
FOR EACH ROW
EXECUTE FUNCTION update_search_vector();

DROP TRIGGER IF EXISTS articles_search_trigger ON articles;
CREATE TRIGGER articles_search_trigger
BEFORE INSERT OR UPDATE ON articles
FOR EACH ROW
EXECUTE FUNCTION update_search_vector();

DROP TRIGGER IF EXISTS videos_search_trigger ON videos;
CREATE TRIGGER videos_search_trigger
BEFORE INSERT OR UPDATE ON videos
FOR EACH ROW
EXECUTE FUNCTION update_search_vector();

DROP TRIGGER IF EXISTS community_posts_search_trigger ON community_posts;
CREATE TRIGGER community_posts_search_trigger
BEFORE INSERT OR UPDATE ON community_posts
FOR EACH ROW
EXECUTE FUNCTION update_search_vector();

-- Create indexes for search vectors
CREATE INDEX IF NOT EXISTS lessons_search_idx ON lessons USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS articles_search_idx ON articles USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS videos_search_idx ON videos USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS community_posts_search_idx ON community_posts USING GIN(search_vector);

-- Create a unified search view
CREATE OR REPLACE VIEW search_view AS
SELECT 
  id,
  title,
  'lesson' as type,
  description,
  thumbnail_url,
  CASE 
    WHEN video_url IS NOT NULL THEN '/academy/lesson/' || id::text
    ELSE '/academy/lesson/' || id::text
  END as url,
  created_at,
  (SELECT email FROM auth.users WHERE id = author_id) as author,
  tier,
  tags,
  category,
  search_vector
FROM lessons
WHERE published = true

UNION ALL

SELECT 
  id,
  title,
  'article' as type,
  description,
  thumbnail_url,
  '/articles/' || id::text as url,
  created_at,
  (SELECT email FROM auth.users WHERE id = author_id) as author,
  tier,
  tags,
  category,
  search_vector
FROM articles
WHERE published = true

UNION ALL

SELECT 
  id,
  title,
  'video' as type,
  description,
  thumbnail_url,
  '/videos/' || id::text as url,
  created_at,
  (SELECT email FROM auth.users WHERE id = author_id) as author,
  tier,
  tags,
  category,
  search_vector
FROM videos
WHERE published = true

UNION ALL

SELECT 
  id,
  title,
  'community' as type,
  LEFT(content, 150) as description,
  NULL as thumbnail_url,
  '/community/post/' || id::text as url,
  created_at,
  (SELECT email FROM auth.users WHERE id = user_id) as author,
  'free' as tier,
  tags,
  NULL as category,
  search_vector
FROM community_posts;

-- Create RLS policies for content tables
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

-- Published content is visible to all
CREATE POLICY "Published lessons are visible to everyone"
  ON lessons FOR SELECT
  USING (published = true);

CREATE POLICY "Published articles are visible to everyone"
  ON articles FOR SELECT
  USING (published = true);

CREATE POLICY "Published videos are visible to everyone"
  ON videos FOR SELECT
  USING (published = true);

CREATE POLICY "Community posts are visible to everyone"
  ON community_posts FOR SELECT
  USING (true);

-- Authors can manage their own content
CREATE POLICY "Authors can manage their lessons"
  ON lessons FOR ALL
  USING (author_id = auth.uid());

CREATE POLICY "Authors can manage their articles"
  ON articles FOR ALL
  USING (author_id = auth.uid());

CREATE POLICY "Authors can manage their videos"
  ON videos FOR ALL
  USING (author_id = auth.uid());

CREATE POLICY "Users can manage their community posts"
  ON community_posts FOR ALL
  USING (user_id = auth.uid());

-- Admins can manage all content
CREATE POLICY "Admins can manage all lessons"
  ON lessons FOR ALL
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all articles"
  ON articles FOR ALL
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all videos"
  ON videos FOR ALL
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all community posts"
  ON community_posts FOR ALL
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- Insert some sample categories
INSERT INTO categories (name, description)
VALUES 
  ('Putting', 'Improve your putting skills'),
  ('Driving', 'Master your drives for maximum distance and accuracy'),
  ('Short Game', 'Perfect your approach shots and short game techniques'),
  ('Course Management', 'Strategic planning for better scores'),
  ('Mental Game', 'Psychological aspects of golf performance'),
  ('Equipment', 'Golf club and equipment guides'),
  ('Rules', 'Understanding golf rules and etiquette'),
  ('Fitness', 'Physical conditioning for golf')
ON CONFLICT (name) DO NOTHING;
