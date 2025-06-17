import { supabase } from '@/lib/supabase';

export interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  thumbnail_url: string;
  video_url: string;
  course_id: string;
  order: number;
  completed?: boolean;
  last_watched_at?: string;
  watch_time?: number; // in seconds
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  total_lessons: number;
  completed_lessons: number;
  progress: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  lessons?: Lesson[];
}

/**
 * Fetches all courses with progress information for the current user
 */
export const getUserCourses = async (): Promise<Course[]> => {
  try {
    // Check if the courses table exists
    const { error: tableCheckError } = await supabase
      .from('courses')
      .select('id', { count: 'exact', head: true });

    // If table doesn't exist, return mock data
    if (tableCheckError) {
      console.log('Using mock course data since courses table is not available');
      return getMockCourses();
    }

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;

    const userId = userData.user?.id;
    if (!userId) throw new Error('User not authenticated');

    // Get all courses
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('*');

    if (coursesError) throw coursesError;

    // Get user progress for these courses
    const { data: progress, error: progressError } = await supabase
      .from('user_course_progress')
      .select('*')
      .eq('user_id', userId);

    if (progressError) throw progressError;

    // Map progress to courses
    const coursesWithProgress = courses.map((course) => {
      const courseProgress = progress?.find(p => p.course_id === course.id);
      return {
        ...course,
        completed_lessons: courseProgress?.completed_lessons || 0,
        progress: courseProgress ? (courseProgress.completed_lessons / course.total_lessons) * 100 : 0
      };
    });

    return coursesWithProgress;
  } catch (error) {
    console.error('Error fetching user courses:', error);
    return getMockCourses();
  }
};

/**
 * Fetches lessons for a specific course with user progress information
 */
export const getCourseLessons = async (courseId: string): Promise<Lesson[]> => {
  try {
    // Check if the lessons table exists
    const { error: tableCheckError } = await supabase
      .from('lessons')
      .select('id', { count: 'exact', head: true });

    // If table doesn't exist, return mock data
    if (tableCheckError) {
      console.log('Using mock lesson data since lessons table is not available');
      return getMockLessons(courseId);
    }

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;

    const userId = userData.user?.id;
    if (!userId) throw new Error('User not authenticated');

    // Get all lessons for this course
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', courseId)
      .order('order', { ascending: true });

    if (lessonsError) throw lessonsError;

    // Get user progress for these lessons
    const { data: progress, error: progressError } = await supabase
      .from('user_lesson_progress')
      .select('*')
      .eq('user_id', userId)
      .in('lesson_id', lessons.map(lesson => lesson.id));

    if (progressError) throw progressError;

    // Map progress to lessons
    const lessonsWithProgress = lessons.map((lesson) => {
      const lessonProgress = progress?.find(p => p.lesson_id === lesson.id);
      return {
        ...lesson,
        completed: lessonProgress?.completed || false,
        last_watched_at: lessonProgress?.last_watched_at,
        watch_time: lessonProgress?.watch_time || 0
      };
    });

    return lessonsWithProgress;
  } catch (error) {
    console.error('Error fetching course lessons:', error);
    return getMockLessons(courseId);
  }
};

/**
 * Marks a lesson as completed for the current user
 */
export const markLessonCompleted = async (lessonId: string): Promise<void> => {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;

    const userId = userData.user?.id;
    if (!userId) throw new Error('User not authenticated');

    // Check if progress record exists
    const { data: existingProgress, error: checkError } = await supabase
      .from('user_lesson_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    // If record exists, update it
    if (existingProgress) {
      const { error: updateError } = await supabase
        .from('user_lesson_progress')
        .update({
          completed: true,
          last_watched_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('lesson_id', lessonId);

      if (updateError) throw updateError;
    } else {
      // Otherwise, insert new record
      const { error: insertError } = await supabase
        .from('user_lesson_progress')
        .insert({
          user_id: userId,
          lesson_id: lessonId,
          completed: true,
          last_watched_at: new Date().toISOString(),
          watch_time: 0
        });

      if (insertError) throw insertError;
    }

    // Update course progress
    await updateCourseProgress(lessonId);
  } catch (error) {
    console.error('Error marking lesson as completed:', error);
    // For mock data, we'll just log the action
    console.log(`Mock: Marked lesson ${lessonId} as completed`);
  }
};

/**
 * Updates a user's watch time for a lesson
 */
export const updateLessonWatchTime = async (lessonId: string, watchTime: number): Promise<void> => {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;

    const userId = userData.user?.id;
    if (!userId) throw new Error('User not authenticated');

    // Check if progress record exists
    const { data: existingProgress, error: checkError } = await supabase
      .from('user_lesson_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    // If record exists, update it
    if (existingProgress) {
      const { error: updateError } = await supabase
        .from('user_lesson_progress')
        .update({
          watch_time: watchTime,
          last_watched_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('lesson_id', lessonId);

      if (updateError) throw updateError;
    } else {
      // Otherwise, insert new record
      const { error: insertError } = await supabase
        .from('user_lesson_progress')
        .insert({
          user_id: userId,
          lesson_id: lessonId,
          completed: false,
          last_watched_at: new Date().toISOString(),
          watch_time: watchTime
        });

      if (insertError) throw insertError;
    }
  } catch (error) {
    console.error('Error updating lesson watch time:', error);
    // For mock data, we'll just log the action
    console.log(`Mock: Updated watch time for lesson ${lessonId} to ${watchTime} seconds`);
  }
};

/**
 * Updates the course progress when a lesson is completed
 */
async function updateCourseProgress(lessonId: string): Promise<void> {
  try {
    // Get the course ID for this lesson
    const { data: lessonData, error: lessonError } = await supabase
      .from('lessons')
      .select('course_id')
      .eq('id', lessonId)
      .single();

    if (lessonError) throw lessonError;

    const courseId = lessonData.course_id;
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;

    const userId = userData.user?.id;
    if (!userId) throw new Error('User not authenticated');

    // Count completed lessons for this course
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('id')
      .eq('course_id', courseId);

    if (lessonsError) throw lessonsError;

    const { count, error: countError } = await supabase
      .from('user_lesson_progress')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .in('lesson_id', lessons.map(l => l.id))
      .eq('completed', true);

    if (countError) throw countError;

    const totalLessons = lessons.length;
    const completedLessons = count || 0;

    // Check if course progress record exists
    const { data: existingProgress, error: checkError } = await supabase
      .from('user_course_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    // Update or insert course progress
    if (existingProgress) {
      const { error: updateError } = await supabase
        .from('user_course_progress')
        .update({
          completed_lessons: completedLessons,
          last_updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('course_id', courseId);

      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase
        .from('user_course_progress')
        .insert({
          user_id: userId,
          course_id: courseId,
          completed_lessons: completedLessons,
          last_updated_at: new Date().toISOString()
        });

      if (insertError) throw insertError;
    }
  } catch (error) {
    console.error('Error updating course progress:', error);
  }
}

// Mock data functions for development and when tables don't exist
function getMockCourses(): Course[] {
  return [
    {
      id: '1',
      title: 'Fundamentals of Golf',
      description: 'Master the basic techniques and principles of golf',
      thumbnail_url: '/images/courses/fundamentals.jpg',
      total_lessons: 10,
      completed_lessons: 6,
      progress: 60,
      level: 'beginner'
    },
    {
      id: '2',
      title: 'Short Game Mastery',
      description: 'Improve your chipping, pitching, and bunker play',
      thumbnail_url: '/images/courses/short-game.jpg',
      total_lessons: 8,
      completed_lessons: 2,
      progress: 25,
      level: 'intermediate'
    },
    {
      id: '3',
      title: 'Advanced Putting',
      description: 'Take your putting to the next level with pro techniques',
      thumbnail_url: '/images/courses/putting.jpg',
      total_lessons: 5,
      completed_lessons: 0,
      progress: 0,
      level: 'advanced'
    },
    {
      id: '4',
      title: 'Mental Game Strategies',
      description: 'Develop mental toughness and focus on the course',
      thumbnail_url: '/images/courses/mental-game.jpg',
      total_lessons: 6,
      completed_lessons: 1,
      progress: 16.7,
      level: 'intermediate'
    },
    {
      id: '5',
      title: 'Tournament Preparation',
      description: 'Prepare like a pro for your next tournament',
      thumbnail_url: '/images/courses/tournament.jpg',
      total_lessons: 7,
      completed_lessons: 0,
      progress: 0,
      level: 'advanced'
    }
  ];
}

function getMockLessons(courseId: string): Lesson[] {
  const lessonSets: Record<string, Lesson[]> = {
    '1': [
      {
        id: '101',
        title: 'Grip Fundamentals',
        description: 'Learn the proper grip technique for maximum control',
        duration: 15,
        thumbnail_url: '/images/lessons/grip.jpg',
        video_url: '/videos/grip-fundamentals.mp4',
        course_id: '1',
        order: 1,
        completed: true,
        last_watched_at: '2025-04-10T14:30:00Z',
        watch_time: 850
      },
      {
        id: '102',
        title: 'Stance and Posture',
        description: 'Proper stance and posture for a solid foundation',
        duration: 12,
        thumbnail_url: '/images/lessons/stance.jpg',
        video_url: '/videos/stance-posture.mp4',
        course_id: '1',
        order: 2,
        completed: true,
        last_watched_at: '2025-04-11T10:15:00Z',
        watch_time: 720
      },
      {
        id: '103',
        title: 'The Takeaway',
        description: 'Master the first move in your swing',
        duration: 18,
        thumbnail_url: '/images/lessons/takeaway.jpg',
        video_url: '/videos/takeaway.mp4',
        course_id: '1',
        order: 3,
        completed: true,
        last_watched_at: '2025-04-12T16:45:00Z',
        watch_time: 1080
      },
      {
        id: '104',
        title: 'Backswing Mechanics',
        description: 'Key positions and movements in the backswing',
        duration: 22,
        thumbnail_url: '/images/lessons/backswing.jpg',
        video_url: '/videos/backswing.mp4',
        course_id: '1',
        order: 4,
        completed: true,
        last_watched_at: '2025-04-13T09:30:00Z',
        watch_time: 1320
      },
      {
        id: '105',
        title: 'Downswing Fundamentals',
        description: 'The critical transition and downswing sequence',
        duration: 25,
        thumbnail_url: '/images/lessons/downswing.jpg',
        video_url: '/videos/downswing.mp4',
        course_id: '1',
        order: 5,
        completed: true,
        last_watched_at: '2025-04-14T11:20:00Z',
        watch_time: 1500
      },
      {
        id: '106',
        title: 'Impact Position',
        description: 'Achieving the perfect impact position',
        duration: 20,
        thumbnail_url: '/images/lessons/impact.jpg',
        video_url: '/videos/impact.mp4',
        course_id: '1',
        order: 6,
        completed: true,
        last_watched_at: '2025-04-15T14:00:00Z',
        watch_time: 1200
      },
      {
        id: '107',
        title: 'Follow-Through',
        description: 'Completing your swing with proper follow-through',
        duration: 15,
        thumbnail_url: '/images/lessons/follow-through.jpg',
        video_url: '/videos/follow-through.mp4',
        course_id: '1',
        order: 7,
        completed: false,
        last_watched_at: '2025-04-16T10:45:00Z',
        watch_time: 450
      },
      {
        id: '108',
        title: 'Ball Position',
        description: 'Proper ball position for different clubs',
        duration: 18,
        thumbnail_url: '/images/lessons/ball-position.jpg',
        video_url: '/videos/ball-position.mp4',
        course_id: '1',
        order: 8,
        completed: false
      },
      {
        id: '109',
        title: 'Alignment Techniques',
        description: 'How to aim correctly for your target',
        duration: 16,
        thumbnail_url: '/images/lessons/alignment.jpg',
        video_url: '/videos/alignment.mp4',
        course_id: '1',
        order: 9,
        completed: false
      },
      {
        id: '110',
        title: 'Practice Drills',
        description: 'Essential drills to reinforce fundamentals',
        duration: 30,
        thumbnail_url: '/images/lessons/drills.jpg',
        video_url: '/videos/practice-drills.mp4',
        course_id: '1',
        order: 10,
        completed: false
      }
    ],
    '2': [
      {
        id: '201',
        title: 'Chipping Basics',
        description: 'Fundamentals of effective chipping',
        duration: 20,
        thumbnail_url: '/images/lessons/chipping.jpg',
        video_url: '/videos/chipping-basics.mp4',
        course_id: '2',
        order: 1,
        completed: true,
        last_watched_at: '2025-04-05T15:30:00Z',
        watch_time: 1200
      },
      {
        id: '202',
        title: 'Pitch Shot Techniques',
        description: 'Master various pitch shots around the green',
        duration: 25,
        thumbnail_url: '/images/lessons/pitching.jpg',
        video_url: '/videos/pitch-techniques.mp4',
        course_id: '2',
        order: 2,
        completed: true,
        last_watched_at: '2025-04-06T16:45:00Z',
        watch_time: 1500
      },
      // Additional lessons for course 2...
    ],
    '3': [
      {
        id: '301',
        title: 'Putting Stroke Mechanics',
        description: 'Develop a consistent and reliable putting stroke',
        duration: 22,
        thumbnail_url: '/images/lessons/putting-stroke.jpg',
        video_url: '/videos/putting-mechanics.mp4',
        course_id: '3',
        order: 1,
        completed: false
      },
      // Additional lessons for course 3...
    ],
    '4': [
      {
        id: '401',
        title: 'Pre-Shot Routine',
        description: 'Develop a consistent pre-shot routine for focus',
        duration: 18,
        thumbnail_url: '/images/lessons/pre-shot.jpg',
        video_url: '/videos/pre-shot-routine.mp4',
        course_id: '4',
        order: 1,
        completed: true,
        last_watched_at: '2025-04-01T11:20:00Z',
        watch_time: 1080
      },
      // Additional lessons for course 4...
    ],
    '5': [
      {
        id: '501',
        title: 'Tournament Preparation Overview',
        description: 'Strategic approach to tournament preparation',
        duration: 25,
        thumbnail_url: '/images/lessons/tournament-prep.jpg',
        video_url: '/videos/tournament-overview.mp4',
        course_id: '5',
        order: 1,
        completed: false
      },
      // Additional lessons for course 5...
    ]
  };

  return lessonSets[courseId] || [];
}
