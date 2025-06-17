-- Create enum types
CREATE TYPE contributor_type AS ENUM ('member', 'guest', 'mentor', 'creator');
CREATE TYPE contribution_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE member_contribution_type AS ENUM ('swing-video', 'tutorial-topic', 'personal-story');
CREATE TYPE guest_contribution_type AS ENUM ('swing-demo', 'idea');
CREATE TYPE mentor_contribution_type AS ENUM ('swing-breakdown', 'ai-tutorial');
CREATE TYPE content_creator_type AS ENUM ('edited-clip', 'commentary', 'gear-review', 'community-highlight');
CREATE TYPE swing_type AS ENUM ('driver', 'iron', 'wedge', 'putting');
CREATE TYPE difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE analysis_type AS ENUM ('technical', 'conceptual', 'both');
CREATE TYPE gear_type AS ENUM ('driver', 'iron', 'wedge', 'putter', 'ball', 'accessory');
CREATE TYPE highlight_type AS ENUM ('achievement', 'improvement', 'community', 'other');

-- Create contributions table
CREATE TABLE contributions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    contributor_id UUID NOT NULL REFERENCES auth.users(id),
    contributor_type contributor_type NOT NULL,
    contribution_type TEXT NOT NULL, -- Dynamic type based on contributor_type
    status contribution_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tags TEXT[] DEFAULT '{}',
    is_public BOOLEAN DEFAULT true,
    
    -- Common fields
    video_url TEXT,
    
    -- Member specific fields
    swing_type swing_type,
    difficulty_level difficulty_level,
    
    -- Guest specific fields
    category TEXT,
    impact TEXT,
    
    -- Mentor specific fields
    target_swing_id UUID,
    analysis_type analysis_type,
    key_points TEXT[],
    ai_model TEXT,
    prompt_used TEXT,
    
    -- Content creator specific fields
    gear_brand TEXT,
    gear_model TEXT,
    gear_type gear_type,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    pros TEXT[],
    cons TEXT[],
    featured_community_member UUID,
    highlight_type highlight_type
);

-- Create indexes
CREATE INDEX idx_contributions_contributor_id ON contributions(contributor_id);
CREATE INDEX idx_contributions_status ON contributions(status);
CREATE INDEX idx_contributions_created_at ON contributions(created_at);
CREATE INDEX idx_contributions_contributor_type ON contributions(contributor_type);

-- Create RLS policies
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;

-- Policy for reading contributions
CREATE POLICY "Contributions are viewable by everyone if public"
    ON contributions FOR SELECT
    USING (is_public = true);

-- Policy for authenticated users to view their own contributions
CREATE POLICY "Users can view their own contributions"
    ON contributions FOR SELECT
    USING (auth.uid() = contributor_id);

-- Policy for creating contributions
CREATE POLICY "Authenticated users can create contributions"
    ON contributions FOR INSERT
    WITH CHECK (auth.uid() = contributor_id);

-- Policy for updating contributions
CREATE POLICY "Users can update their own contributions"
    ON contributions FOR UPDATE
    USING (auth.uid() = contributor_id);

-- Policy for deleting contributions
CREATE POLICY "Users can delete their own contributions"
    ON contributions FOR DELETE
    USING (auth.uid() = contributor_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_contributions_updated_at
    BEFORE UPDATE ON contributions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 