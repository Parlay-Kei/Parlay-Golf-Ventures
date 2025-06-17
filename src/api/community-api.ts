import { supabase } from '@/lib/supabase';
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
    // First, get the posts
    let query = supabase
      .from('community_posts')
      .select('*', { count: 'exact' })
      .limit(limit)
      .range(offset, offset + limit - 1);

    // Apply sorting
    switch (sortBy) {
      case 'latest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'popular':
        query = query.order('likes_count', { ascending: false });
        break;
      case 'trending':
        // For trending, we might want to consider recent posts with high engagement
        // This is a simplified version that considers both recency and popularity
        query = query.order('created_at', { ascending: false }).order('likes_count', { ascending: false });
        break;
    }

    const { data: posts, error, count } = await query;

    if (error) {
      if (error.code === '42P01') {
        // Table doesn't exist, return mock data
        console.warn('Community posts table not found, returning mock data');
        return getMockCommunityPosts(limit, offset, sortBy);
      }
      
      throw new ApiError(
        `Error fetching community posts: ${error.message}`,
        error.code === '42P01' ? 404 : 500,
        { limit, offset, sortBy, error }
      );
    }

    if (!posts || posts.length === 0) {
      return { posts: [], total: 0 };
    }

    // Get user IDs to fetch author information
    const userIds = [...new Set(posts.map(post => post.user_id))];

    // Fetch author information for all posts
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .in('id', userIds);

    if (usersError) {
      console.error('Error fetching user profiles:', usersError);
      // Continue with posts but without author info
    }

    // Get the current user's ID to check if they've liked each post
    const { data: { user } } = await supabase.auth.getUser();
    const currentUserId = user?.id;

    // If user is logged in, fetch their likes
    let userLikes: string[] = [];
    if (currentUserId) {
      const postIds = posts.map(post => post.id);
      const { data: likes, error: likesError } = await supabase
        .from('post_likes')
        .select('post_id')
        .eq('user_id', currentUserId)
        .in('post_id', postIds);

      if (!likesError && likes) {
        userLikes = likes.map(like => like.post_id);
      }
    }

    // Map posts with author information and like status
    const postsWithAuthors = posts.map(post => {
      const author = users?.find(user => user.id === post.user_id) || {
        username: 'unknown',
        full_name: 'Unknown User',
        avatar_url: null
      };

      return {
        ...post,
        author: {
          username: author.username,
          full_name: author.full_name,
          avatar_url: author.avatar_url
        },
        is_liked_by_user: userLikes.includes(post.id)
      };
    });

    return {
      posts: postsWithAuthors,
      total: count || postsWithAuthors.length
    };
  } catch (error) {
    console.error('Error fetching community posts:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Fallback to mock data for any error
    return getMockCommunityPosts(limit, offset, sortBy);
  }
};

/**
 * Create a new community post
 * @param content Post content
 * @returns The created post
 */
export const createCommunityPost = async (content: string): Promise<CommunityPost> => {
  try {
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new ApiError(
        'You must be logged in to create a post',
        401
      );
    }

    // Create the post
    const { data: post, error } = await supabase
      .from('community_posts')
      .insert({
        user_id: user.id,
        content,
        likes_count: 0,
        comments_count: 0
      })
      .select('*')
      .single();

    if (error) {
      if (error.code === '42P01') {
        // Table doesn't exist, return mock data
        console.warn('Community posts table not found, returning mock data');
        return getMockCreatedPost(content, user.id);
      }
      
      throw new ApiError(
        `Error creating community post: ${error.message}`,
        error.code === '42P01' ? 404 : 500,
        { content, error }
      );
    }

    if (!post) {
      throw new ApiError(
        'Failed to create post',
        500,
        { content }
      );
    }

    // Get the user's profile information
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('username, full_name, avatar_url')
      .eq('id', user.id)
      .single();

    // Return the post with author information
    return {
      ...post,
      author: {
        username: profile?.username || user.email?.split('@')[0] || 'user',
        full_name: profile?.full_name || 'User',
        avatar_url: profile?.avatar_url
      },
      is_liked_by_user: false
    };
  } catch (error) {
    console.error('Error creating community post:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Get the current user for mock data
    const { data: { user } } = await supabase.auth.getUser();
    return getMockCreatedPost(content, user?.id || 'mock-user-id');
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
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new ApiError(
        'You must be logged in to like posts',
        401
      );
    }

    // Check if the post exists
    const { data: post, error: postError } = await supabase
      .from('community_posts')
      .select('id, likes_count')
      .eq('id', postId)
      .single();

    if (postError) {
      if (postError.code === '42P01') {
        // Table doesn't exist, return mock success
        console.warn('Community posts table not found, returning mock success');
        return { success: true };
      }
      
      throw new ApiError(
        `Error finding post: ${postError.message}`,
        postError.code === '42P01' ? 404 : 500,
        { postId, action, error: postError }
      );
    }

    if (action === 'like') {
      // Add like record
      const { error: likeError } = await supabase
        .from('post_likes')
        .insert({ post_id: postId, user_id: user.id });

      if (likeError && likeError.code !== '23505') { // Ignore unique constraint violations
        if (likeError.code === '42P01') {
          // Table doesn't exist, return mock success
          console.warn('Post likes table not found, returning mock success');
          return { success: true };
        }
        
        throw new ApiError(
          `Error liking post: ${likeError.message}`,
          likeError.code === '42P01' ? 404 : 500,
          { postId, action, error: likeError }
        );
      }

      // Increment likes count
      await supabase
        .from('community_posts')
        .update({ likes_count: (post?.likes_count || 0) + 1 })
        .eq('id', postId);
    } else {
      // Remove like record
      const { error: unlikeError } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);

      if (unlikeError) {
        if (unlikeError.code === '42P01') {
          // Table doesn't exist, return mock success
          console.warn('Post likes table not found, returning mock success');
          return { success: true };
        }
        
        throw new ApiError(
          `Error unliking post: ${unlikeError.message}`,
          unlikeError.code === '42P01' ? 404 : 500,
          { postId, action, error: unlikeError }
        );
      }

      // Decrement likes count (ensure it doesn't go below 0)
      await supabase
        .from('community_posts')
        .update({ likes_count: Math.max(0, (post?.likes_count || 1) - 1) })
        .eq('id', postId);
    }

    return { success: true };
  } catch (error) {
    console.error(`Error ${action === 'like' ? 'liking' : 'unliking'} post:`, error);
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Return mock success for any other error
    return { success: true };
  }
};

/**
 * Get comments for a post
 * @param postId Post ID
 * @returns Array of comments
 */
export const getPostComments = async (postId: string): Promise<Comment[]> => {
  try {
    // Fetch comments for the post
    const { data: comments, error } = await supabase
      .from('post_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      if (error.code === '42P01') {
        // Table doesn't exist, return mock data
        console.warn('Post comments table not found, returning mock data');
        return getMockComments(postId);
      }
      
      throw new ApiError(
        `Error fetching post comments: ${error.message}`,
        error.code === '42P01' ? 404 : 500,
        { postId, error }
      );
    }

    if (!comments || comments.length === 0) {
      return [];
    }

    // Get user IDs to fetch author information
    const userIds = [...new Set(comments.map(comment => comment.user_id))];

    // Fetch author information for all comments
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .in('id', userIds);

    if (usersError) {
      console.error('Error fetching user profiles for comments:', usersError);
      // Continue with comments but without author info
    }

    // Map comments with author information
    const commentsWithAuthors = comments.map(comment => {
      const author = users?.find(user => user.id === comment.user_id) || {
        username: 'unknown',
        full_name: 'Unknown User',
        avatar_url: null
      };

      return {
        ...comment,
        author: {
          username: author.username,
          full_name: author.full_name,
          avatar_url: author.avatar_url
        }
      };
    });

    return commentsWithAuthors;
  } catch (error) {
    console.error('Error fetching post comments:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Fallback to mock data
    return getMockComments(postId);
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
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new ApiError(
        'You must be logged in to comment',
        401
      );
    }

    // Create the comment
    const { data: comment, error } = await supabase
      .from('post_comments')
      .insert({
        post_id: postId,
        user_id: user.id,
        content
      })
      .select('*')
      .single();

    if (error) {
      if (error.code === '42P01') {
        // Table doesn't exist, return mock data
        console.warn('Post comments table not found, returning mock data');
        return getMockCreatedComment(postId, content, user.id);
      }
      
      throw new ApiError(
        `Error adding comment: ${error.message}`,
        error.code === '42P01' ? 404 : 500,
        { postId, content, error }
      );
    }

    if (!comment) {
      throw new ApiError(
        'Failed to add comment',
        500,
        { postId, content }
      );
    }

    // Increment comments count on the post
    await supabase
      .from('community_posts')
      .update({ comments_count: supabase.rpc('increment', { x: 1 }) })
      .eq('id', postId);

    // Get the user's profile information
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('username, full_name, avatar_url')
      .eq('id', user.id)
      .single();

    // Return the comment with author information
    return {
      ...comment,
      author: {
        username: profile?.username || user.email?.split('@')[0] || 'user',
        full_name: profile?.full_name || 'User',
        avatar_url: profile?.avatar_url
      }
    };
  } catch (error) {
    console.error('Error adding comment:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Get the current user for mock data
    const { data: { user } } = await supabase.auth.getUser();
    return getMockCreatedComment(postId, content, user?.id || 'mock-user-id');
  }
};

// Mock data functions
function getMockCommunityPosts(
  limit: number = 10,
  offset: number = 0,
  sortBy: SortOption = 'latest'
): { posts: CommunityPost[]; total: number } {
  // Sample mock data
  const mockPosts: CommunityPost[] = [
    {
      id: '1',
      user_id: 'user-1',
      content: 'Just finished a round at Pebble Beach! What an incredible experience. The views were breathtaking, and I managed to shoot my personal best. Has anyone else played there recently?',
      created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      updated_at: new Date(Date.now() - 3600000).toISOString(),
      likes_count: 24,
      comments_count: 5,
      author: {
        username: 'golfpro',
        full_name: 'Alex Johnson',
        avatar_url: 'https://randomuser.me/api/portraits/men/32.jpg'
      },
      is_liked_by_user: false
    },
    {
      id: '2',
      user_id: 'user-2',
      content: 'Looking for recommendations on the best golf courses in Scotland. Planning a trip there next month and want to make the most of it!',
      created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      updated_at: new Date(Date.now() - 86400000).toISOString(),
      likes_count: 15,
      comments_count: 8,
      author: {
        username: 'traveler',
        full_name: 'Sarah Williams',
        avatar_url: 'https://randomuser.me/api/portraits/women/44.jpg'
      },
      is_liked_by_user: true
    },
    {
      id: '3',
      user_id: 'user-3',
      content: 'Just got fitted for a new driver and gained 15 yards off the tee! Definitely recommend getting a proper fitting if you haven\'t already.',
      created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      updated_at: new Date(Date.now() - 172800000).toISOString(),
      likes_count: 32,
      comments_count: 12,
      author: {
        username: 'techgolfer',
        full_name: 'Mike Chen',
        avatar_url: 'https://randomuser.me/api/portraits/men/22.jpg'
      },
      is_liked_by_user: false
    },
    {
      id: '4',
      user_id: 'user-4',
      content: 'Anyone tried the new TaylorMade irons? Thinking about upgrading my set and would love some feedback.',
      created_at: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
      updated_at: new Date(Date.now() - 259200000).toISOString(),
      likes_count: 18,
      comments_count: 7,
      author: {
        username: 'equipmentjunkie',
        full_name: 'Tom Davis',
        avatar_url: 'https://randomuser.me/api/portraits/men/41.jpg'
      },
      is_liked_by_user: false
    },
    {
      id: '5',
      user_id: 'user-5',
      content: 'Just broke 80 for the first time! So excited about my progress. The lessons from this platform have been incredibly helpful.',
      created_at: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
      updated_at: new Date(Date.now() - 345600000).toISOString(),
      likes_count: 45,
      comments_count: 15,
      author: {
        username: 'newgolfer',
        full_name: 'Emily Roberts',
        avatar_url: 'https://randomuser.me/api/portraits/women/33.jpg'
      },
      is_liked_by_user: true
    }
  ];
  
  // Sort posts based on sortBy parameter
  const sortedPosts = [...mockPosts];
  switch (sortBy) {
    case 'latest':
      sortedPosts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      break;
    case 'popular':
      sortedPosts.sort((a, b) => b.likes_count - a.likes_count);
      break;
    case 'trending':
      // For trending, consider both recency and popularity
      sortedPosts.sort((a, b) => {
        const aScore = b.likes_count * 0.7 + b.comments_count * 0.3;
        const bScore = a.likes_count * 0.7 + a.comments_count * 0.3;
        return aScore - bScore;
      });
      break;
  }
  
  // Apply pagination
  const paginatedPosts = sortedPosts.slice(offset, offset + limit);
  
  return {
    posts: paginatedPosts,
    total: mockPosts.length
  };
}

function getMockCreatedPost(content: string, userId: string): CommunityPost {
  return {
    id: `mock-${Date.now()}`,
    user_id: userId,
    content,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    likes_count: 0,
    comments_count: 0,
    author: {
      username: 'current_user',
      full_name: 'Current User',
      avatar_url: null
    },
    is_liked_by_user: false
  };
}

function getMockComments(postId: string): Comment[] {
  return [
    {
      id: `${postId}-comment-1`,
      post_id: postId,
      user_id: 'user-6',
      content: 'Great post! I completely agree with your thoughts on this.',
      created_at: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
      author: {
        username: 'golfenthusiast',
        full_name: 'John Smith',
        avatar_url: 'https://randomuser.me/api/portraits/men/52.jpg'
      }
    },
    {
      id: `${postId}-comment-2`,
      post_id: postId,
      user_id: 'user-7',
      content: 'I had a similar experience last weekend. It really makes a difference!',
      created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      author: {
        username: 'golfqueen',
        full_name: 'Lisa Johnson',
        avatar_url: 'https://randomuser.me/api/portraits/women/28.jpg'
      }
    },
    {
      id: `${postId}-comment-3`,
      post_id: postId,
      user_id: 'user-8',
      content: 'Have you tried the technique mentioned in last week\'s lesson? It might help with that issue.',
      created_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
      author: {
        username: 'coachpro',
        full_name: 'Mark Wilson',
        avatar_url: 'https://randomuser.me/api/portraits/men/64.jpg'
      }
    }
  ];
}

function getMockCreatedComment(postId: string, content: string, userId: string): Comment {
  return {
    id: `${postId}-comment-${Date.now()}`,
    post_id: postId,
    user_id: userId,
    content,
    created_at: new Date().toISOString(),
    author: {
      username: 'current_user',
      full_name: 'Current User',
      avatar_url: null
    }
  };
}
