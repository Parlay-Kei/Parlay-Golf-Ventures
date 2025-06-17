-- Lesson Tracking Database Schema

-- Courses table
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

-- Lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL, -- in minutes
  thumbnail_url VARCHAR(255),
  video_url VARCHAR(255),
  order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User lesson progress table
CREATE TABLE IF NOT EXISTS user_lesson_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  watch_time INTEGER NOT NULL DEFAULT 0, -- in seconds
  last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- User course progress table
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

-- Row Level Security Policies

-- Courses: Everyone can view courses
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Courses are viewable by everyone" ON courses
  FOR SELECT USING (true);

-- Only admins can insert/update/delete courses
CREATE POLICY "Admins can insert courses" ON courses
  FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users));
  
CREATE POLICY "Admins can update courses" ON courses
  FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM admin_users));
  
CREATE POLICY "Admins can delete courses" ON courses
  FOR DELETE USING (auth.uid() IN (SELECT user_id FROM admin_users));

-- Lessons: Everyone can view lessons
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lessons are viewable by everyone" ON lessons
  FOR SELECT USING (true);

-- Only admins can insert/update/delete lessons
CREATE POLICY "Admins can insert lessons" ON lessons
  FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users));
  
CREATE POLICY "Admins can update lessons" ON lessons
  FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM admin_users));
  
CREATE POLICY "Admins can delete lessons" ON lessons
  FOR DELETE USING (auth.uid() IN (SELECT user_id FROM admin_users));

-- User lesson progress: Users can only view and modify their own progress
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own lesson progress" ON user_lesson_progress
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert their own lesson progress" ON user_lesson_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can update their own lesson progress" ON user_lesson_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- User course progress: Users can only view and modify their own progress
ALTER TABLE user_course_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own course progress" ON user_course_progress
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert their own course progress" ON user_course_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can update their own course progress" ON user_course_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS lessons_course_id_idx ON lessons(course_id);
CREATE INDEX IF NOT EXISTS user_lesson_progress_user_id_idx ON user_lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS user_lesson_progress_lesson_id_idx ON user_lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS user_course_progress_user_id_idx ON user_course_progress(user_id);
CREATE INDEX IF NOT EXISTS user_course_progress_course_id_idx ON user_course_progress(course_id);
