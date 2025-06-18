// Remove the Supabase import - this is a pure mock API
import { ApiError } from './search-api';

export type CommunityPost = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  likes_count: number;
  comments_count: number;
  author: {
    username: string;
    full_name: string;
    avatar_url: string | null;
  };
  is_liked_by_user?: boolean;
};

export type Comment = {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  author: {
    username: string;
    full_name: string;
    avatar_url: string | null;
  };
};

export type SortOption = 'latest' | 'popular' | 'trending';

// Mock data for development
const MOCK_POSTS: CommunityPost[] = [
  {
    id: '1',
    user_id: '1',
    content: 'Just finished a great round at Pebble Beach! Shot my personal best of 82. The weather was perfect and the views were incredible.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    likes_count: 15,
    comments_count: 3,
    author: {
      username: 'golfpro',
      full_name: 'John Smith',
      avatar_url: 'https://i.pravatar.cc/150?img=1'
    },
    is_liked_by_user: false
  },
  {
    id: '2',
    user_id: '2',
    content: 'Looking for recommendations on a new driver. I currently use the TaylorMade SIM2 but I\'m thinking about upgrading. Any suggestions?',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    likes_count: 8,
    comments_count: 5,
    author: {
      username: 'golfenthusiast',
      full_name: 'Sarah Johnson',
      avatar_url: 'https://i.pravatar.cc/150?img=5'
    },
    is_liked_by_user: false
  },
  {
    id: '3',
    user_id: '3',
    content: 'Just enrolled in the Short Game Secrets course and I\'m already seeing improvements in my chipping! Can\'t wait to apply these techniques on the course this weekend.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    likes_count: 25,
    comments_count: 7,
    author: {
      username: 'newgolfer',
      full_name: 'Mike Wilson',
      avatar_url: 'https://i.pravatar.cc/150?img=3'
    },
    is_liked_by_user: false
  },
  {
    id: '4',
    user_id: '4',
    content: 'Has anyone tried the new Titleist Pro V1x? How does it compare to the previous version?',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    likes_count: 12,
    comments_count: 9,
    author: {
      username: 'gearhead',
      full_name: 'Alex Thompson',
      avatar_url: 'https://i.pravatar.cc/150?img=7'
    },
    is_liked_by_user: false
  },
  {
    id: '5',
    user_id: '5',
    content: 'Working on my swing tempo this week. Any drills you recommend for finding a consistent rhythm?',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(), // 4 days ago
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    likes_count: 18,
    comments_count: 11,
    author: {
      username: 'swingdoctor',
      full_name: 'Emily Davis',
      avatar_url: 'https://i.pravatar.cc/150?img=9'
    },
    is_liked_by_user: false
  }
];

const MOCK_COMMENTS: Record<string, Comment[]> = {
  '1': [
    {
      id: '101',
      post_id: '1',
      user_id: '2',
      content: 'Congrats on the personal best! Pebble Beach is on my bucket list.',
      created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
      author: {
        username: 'golfenthusiast',
        full_name: 'Sarah Johnson',
        avatar_url: 'https://i.pravatar.cc/150?img=5'
      }
    },
    {
      id: '102',
      post_id: '1',
      user_id: '3',
      content: 'What was the most challenging hole for you?',
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      author: {
        username: 'newgolfer',
        full_name: 'Mike Wilson',
        avatar_url: 'https://i.pravatar.cc/150?img=3'
      }
    },
    {
      id: '103',
      post_id: '1',
      user_id: '4',
      content: 'That\'s awesome! Did you take any photos?',
      created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
      author: {
        username: 'gearhead',
        full_name: 'Alex Thompson',
        avatar_url: 'https://i.pravatar.cc/150?img=7'
      }
    }
  ],
  '2': [
    {
      id: '201',
      post_id: '2',
      user_id: '1',
      content: 'I recently switched to the Callaway Paradym and love it. Great forgiveness and distance.',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(), // 20 hours ago
      author: {
        username: 'golfpro',
        full_name: 'John Smith',
        avatar_url: 'https://i.pravatar.cc/150?img=1'
      }
    },
    {
      id: '202',
      post_id: '2',
      user_id: '3',
      content: 'The Ping G430 is worth checking out. Very consistent and forgiving.',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(), // 18 hours ago
      author: {
        username: 'newgolfer',
        full_name: 'Mike Wilson',
        avatar_url: 'https://i.pravatar.cc/150?img=3'
      }
    }
  ]
};

// Store user-generated content in memory for the session
const userPosts: CommunityPost[] = [];
const userComments: Record<string, Comment[]> = {};
const userLikes: Record<string, string[]> = {}; // post_id -> user_ids

// Replace all supabase.auth.getUser() calls with a mock user
const MOCK_USER = {
  id: 'mock-user',
  username: 'mockuser',
  full_name: 'Mock User',
  avatar_url: null,
};

/**
 * Get community posts with pagination
 * @param limit Number of posts to fetch (default: 10)
 * @param offset Pagination offset (default: 0)
 * @param sortBy How to sort the posts (default: 'latest')
 * @returns Array of community posts and total count
 */
export const getCommunityPosts = async (
  limit: number = 10,
  offset: number = 0,
  sortBy: SortOption = 'latest'
): Promise<{ posts: CommunityPost[]; total: number }> => {
  try {
    // Combine mock and user-generated posts
    const allPosts = [...MOCK_POSTS, ...userPosts];
    
    // Create a mutable copy for sorting
    const sortedPosts = [...allPosts];
    
    // Sort posts
    switch (sortBy) {
      case 'latest':
        sortedPosts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'popular':
        sortedPosts.sort((a, b) => b.likes_count - a.likes_count);
        break;
      case 'trending':
        // Trending combines recency and popularity
        sortedPosts.sort((a, b) => {
          const recencyA = new Date(a.created_at).getTime();
          const recencyB = new Date(b.created_at).getTime();
          const popularityA = a.likes_count * 2 + a.comments_count;
          const popularityB = b.likes_count * 2 + b.comments_count;
          
          // Weight: 60% recency, 40% popularity
          return (0.6 * (recencyB - recencyA) + 0.4 * (popularityB - popularityA));
        });
        break;
    }
    
    // Apply pagination
    const paginatedPosts = sortedPosts.slice(offset, offset + limit);
    
    return {
      posts: paginatedPosts,
      total: allPosts.length
    };
  } catch (error) {
    console.error('Error fetching community posts:', error);
    throw new ApiError(
      error instanceof Error ? error.message : 'Unknown error occurred while fetching posts',
      500,
      { limit, error }
    );
  }
};

/**
 * Create a new community post
 * @param content Post content
 * @returns The created post
 */
export const createCommunityPost = async (content: string): Promise<CommunityPost> => {
  try {
    // Create new post
    const newPost: CommunityPost = {
      id: `user-${Date.now()}`,
      user_id: MOCK_USER.id,
      content,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      likes_count: 0,
      comments_count: 0,
      author: {
        username: MOCK_USER.username,
        full_name: MOCK_USER.full_name,
        avatar_url: MOCK_USER.avatar_url
      },
      is_liked_by_user: false
    };
    
    // Add to user posts
    userPosts.unshift(newPost);
    
    return newPost;
  } catch (error) {
    console.error('Error creating community post:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Unknown error occurred while creating post',
      500,
      { error }
    );
  }
};

/**
 * Like or unlike a community post
 * @param postId Post ID
 * @param action 'like' or 'unlike'
 * @returns Success status
 */
export const togglePostLike = async (
  postId: string,
  action: 'like' | 'unlike'
): Promise<{ success: boolean }> => {
  try {
    // Initialize likes array for this post if it doesn't exist
    if (!userLikes[postId]) {
      userLikes[postId] = [];
    }
    
    if (action === 'like') {
      // Add like if not already liked
      if (!userLikes[postId].includes(MOCK_USER.id)) {
        userLikes[postId].push(MOCK_USER.id);
        
        // Update post like count
        const postToUpdate = [...MOCK_POSTS, ...userPosts].find(p => p.id === postId);
        if (postToUpdate) {
          postToUpdate.likes_count += 1;
        }
      }
    } else {
      // Remove like
      userLikes[postId] = userLikes[postId].filter(id => id !== MOCK_USER.id);
      
      // Update post like count
      const postToUpdate = [...MOCK_POSTS, ...userPosts].find(p => p.id === postId);
      if (postToUpdate && postToUpdate.likes_count > 0) {
        postToUpdate.likes_count -= 1;
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error(`Error ${action === 'like' ? 'liking' : 'unliking'} post:`, error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : `Unknown error occurred while ${action === 'like' ? 'liking' : 'unliking'} post`,
      500,
      { error }
    );
  }
};

/**
 * Get comments for a post
 * @param postId Post ID
 * @returns Array of comments
 */
export const getPostComments = async (postId: string): Promise<Comment[]> => {
  try {
    // Combine mock and user comments
    const mockComments = MOCK_COMMENTS[postId] || [];
    const userPostComments = userComments[postId] || [];
    
    // Sort by created_at
    return [...mockComments, ...userPostComments].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  } catch (error) {
    console.error('Error fetching post comments:', error);
    throw new ApiError(
      error instanceof Error ? error.message : 'Unknown error occurred while fetching comments',
      500,
      { error }
    );
  }
};

/**
 * Add a comment to a post
 * @param postId Post ID
 * @param content Comment content
 * @returns The created comment
 */
export const addComment = async (postId: string, content: string): Promise<Comment> => {
  try {
    // Create new comment
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      post_id: postId,
      user_id: MOCK_USER.id,
      content,
      created_at: new Date().toISOString(),
      author: {
        username: MOCK_USER.username,
        full_name: MOCK_USER.full_name,
        avatar_url: MOCK_USER.avatar_url
      }
    };
    
    // Initialize comments array for this post if it doesn't exist
    if (!userComments[postId]) {
      userComments[postId] = [];
    }
    
    // Add to user comments
    userComments[postId].push(newComment);
    
    // Update post comment count
    const postToUpdate = [...MOCK_POSTS, ...userPosts].find(p => p.id === postId);
    if (postToUpdate) {
      postToUpdate.comments_count += 1;
    }
    
    return newComment;
  } catch (error) {
    console.error('Error adding comment:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Unknown error occurred while adding comment',
      500,
      { error }
    );
  }
};
