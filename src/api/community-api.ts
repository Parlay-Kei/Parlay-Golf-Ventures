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
 * @param crewId Optional crew ID to filter posts
 * @returns Array of community posts and total count
 */
export const getCommunityPosts = async (
  limit: number = 10,
  offset: number = 0,
  sortBy: SortOption = 'latest',
  crewId?: string
): Promise<{ posts: CommunityPost[]; total: number }> => {
  try {
    // Get current user for like status
    const { data: { session } } = await supabase.auth.getSession();
    const currentUserId = session?.user?.id;

    // Build query
    let query = supabase
      .from('community_posts')
      .select(`
        *,
        author:profiles!community_posts_user_id_fkey(
          username,
          full_name,
          avatar_url
        )
      `)
      .range(offset, offset + limit - 1);

    if (crewId) {
      query = query.eq('crew_id', crewId);
    }

    // Apply sorting
    let sortedQuery = query;
    switch (sortBy) {
      case 'latest':
        sortedQuery = query.order('created_at', { ascending: false });
        break;
      case 'popular':
        sortedQuery = query.order('likes_count', { ascending: false });
        break;
      case 'trending':
        sortedQuery = query.order('created_at', { ascending: false });
        break;
    }

    const { data: posts, error, count } = await sortedQuery;

    if (error) {
      throw new ApiError(
        `Error fetching community posts: ${error.message}`,
        500,
        { error }
      );
    }

    // Get like status for current user
    let postsWithLikes = (posts as CommunityPost[]) || [];
    if (currentUserId && postsWithLikes.length > 0) {
      const postIds = postsWithLikes.map(p => p.id);
      const { data: likes } = await supabase
        .from('post_likes')
        .select('post_id')
        .in('post_id', postIds)
        .eq('user_id', currentUserId);

      const likedPostIds = new Set((likes as Array<{ post_id: string }>)?.map(l => l.post_id) || []);
      postsWithLikes = postsWithLikes.map(post => ({
        ...post,
        is_liked_by_user: likedPostIds.has(post.id)
      }));
    }

    return {
      posts: postsWithLikes,
      total: count || 0
    };
  } catch (error) {
    console.error('Error fetching community posts:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Unknown error occurred while fetching posts',
      500,
      { error }
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
    // Get current user
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new ApiError('User not authenticated', 401);
    }

    // Create post
    const { data: post, error: postError } = await supabase
      .from('community_posts')
      .insert({
        user_id: session.user.id,
        content,
        likes_count: 0,
        comments_count: 0
      })
      .select(`
        *,
        author:profiles!community_posts_user_id_fkey(
          username,
          full_name,
          avatar_url
        )
      `)
      .single();

    if (postError) {
      throw new ApiError(
        `Error creating post: ${postError.message}`,
        500,
        { error: postError }
      );
    }

    return {
      ...(post as CommunityPost),
      is_liked_by_user: false
    };
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
    // Get current user
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new ApiError('User not authenticated', 401);
    }

    if (action === 'like') {
      // Add like
      const { error: likeError } = await supabase
        .from('post_likes')
        .insert({
          post_id: postId,
          user_id: session.user.id
        });

      if (likeError && likeError.code !== '23505') { // Ignore duplicate key errors
        throw new ApiError(
          `Error liking post: ${likeError.message}`,
          500,
          { error: likeError }
        );
      }

      // Update post like count
      await supabase.rpc('increment_post_likes', { post_id: postId });
    } else {
      // Remove like
      const { error: unlikeError } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', session.user.id);

      if (unlikeError) {
        throw new ApiError(
          `Error unliking post: ${unlikeError.message}`,
          500,
          { error: unlikeError }
        );
      }

      // Update post like count
      await supabase.rpc('decrement_post_likes', { post_id: postId });
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
    const { data: comments, error } = await supabase
      .from('comments')
      .select(`
        *,
        author:profiles!comments_user_id_fkey(
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new ApiError(
        `Error fetching comments: ${error.message}`,
        500,
        { error }
      );
    }

    return (comments as Comment[]) || [];
  } catch (error) {
    console.error('Error fetching post comments:', error);
    if (error instanceof ApiError) {
      throw error;
    }
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
    // Get current user
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new ApiError('User not authenticated', 401);
    }

    // Create comment
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        user_id: session.user.id,
        content
      })
      .select(`
        *,
        author:profiles!comments_user_id_fkey(
          username,
          full_name,
          avatar_url
        )
      `)
      .single();

    if (commentError) {
      throw new ApiError(
        `Error creating comment: ${commentError.message}`,
        500,
        { error: commentError }
      );
    }

    // Update post comment count
    await supabase.rpc('increment_post_comments', { post_id: postId });

    return comment as Comment;
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
