import { supabase } from '@/lib/supabase';

export type SearchResult = {
  id: string;
  title: string;
  type: 'lesson' | 'article' | 'video' | 'community';
  description?: string;
  thumbnail_url?: string;
  url: string;
  created_at: string;
  author?: string;
  tier: 'free' | 'driven' | 'aspiring' | 'breakthrough';
  tags?: string[];
  category?: string;
};

export type SearchFilters = {
  type?: ('lesson' | 'article' | 'video' | 'community')[];
  tier?: ('free' | 'driven' | 'aspiring' | 'breakthrough')[];
  category?: string[];
  tags?: string[];
};

export interface ApiErrorContext {
  query?: string;
  filters?: SearchFilters;
  limit?: number;
  error?: unknown;
}

export class ApiError extends Error {
  status: number;
  context?: ApiErrorContext;

  constructor(message: string, status: number = 500, context?: ApiErrorContext) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.context = context;
  }
}

/**
 * Search for content across the platform
 * @param query Search query string
 * @param filters Optional filters to apply
 * @param limit Number of results to return (default: 20)
 * @param offset Pagination offset (default: 0)
 * @returns Array of search results
 */
export const searchContent = async (
  query: string,
  filters: SearchFilters = {},
  limit: number = 20,
  offset: number = 0
): Promise<{ results: SearchResult[]; total: number }> => {
  try {
    // Build the base query
    let searchQuery = (supabase
      .from('search_view') as any
    )
      .select('*', { count: 'exact' })
      .limit(limit)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    // Add text search if query is provided
    if (query && query.trim() !== '') {
      searchQuery = searchQuery.textSearch('search_vector', query, {
        type: 'websearch',
        config: 'english'
      });
    }

    // Apply filters
    if (filters.type && filters.type.length > 0) {
      searchQuery = searchQuery.in('type', filters.type);
    }

    if (filters.tier && filters.tier.length > 0) {
      searchQuery = searchQuery.in('tier', filters.tier);
    }

    if (filters.category && filters.category.length > 0) {
      searchQuery = searchQuery.in('category', filters.category);
    }

    if (filters.tags && filters.tags.length > 0) {
      // For tags, we need to use containedBy since tags are stored as an array
      searchQuery = searchQuery.containedBy('tags', filters.tags);
    }

    // Execute the query
    const result = await searchQuery;
    let searchData: unknown[] | null = null;
    let searchError: unknown = null;
    let count: number | undefined = undefined;
    if (typeof result === 'object' && result !== null) {
      if ('data' in result) searchData = (result as { data: unknown[] | null }).data;
      if ('error' in result) searchError = (result as { error: unknown }).error;
      if ('count' in result) count = (result as { count?: number }).count;
    }

    if (searchError) {
      const errObj = typeof searchError === 'object' && searchError !== null ? searchError as Record<string, unknown> : {};
      if ('code' in errObj && errObj.code === '42P01') {
        // Table doesn't exist, return mock data
        console.warn('Search view not found, returning mock data');
        return getMockSearchResults(query, filters, limit, offset);
      }
      const message = 'message' in errObj && typeof errObj.message === 'string' ? errObj.message : 'Unknown error';
      const code = 'code' in errObj && typeof errObj.code === 'string' ? errObj.code : undefined;
      throw new ApiError(
        `Error searching content: ${message}`,
        code === '42P01' ? 404 : 500,
        { query, filters, error: searchError }
      );
    }

    if (!searchData) {
      return {
        results: [],
        total: 0
      };
    }

    return {
      results: searchData as SearchResult[],
      total: count || 0
    };
  } catch (error) {
    console.error('Error searching content:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Fallback to mock data for any error
    return getMockSearchResults(query, filters, limit, offset);
  }
};

/**
 * Get popular search tags
 * @param limit Number of tags to return (default: 10)
 * @returns Array of popular tags
 */
export const getPopularTags = async (limit: number = 10): Promise<string[]> => {
  try {
    const popularTagsResult = await (supabase
      .from('popular_tags') as any)
      .select('tag, count')
      .order('count', { ascending: false })
      .limit(limit);
    let tagsData: { tag: string }[] | null = null;
    let tagsError: unknown = null;
    if (typeof popularTagsResult === 'object' && popularTagsResult !== null) {
      if ('data' in popularTagsResult) tagsData = (popularTagsResult as { data: { tag: string }[] | null }).data;
      if ('error' in popularTagsResult) tagsError = (popularTagsResult as { error: unknown }).error;
    }

    if (tagsError) {
      const errObj = typeof tagsError === 'object' && tagsError !== null ? tagsError as Record<string, unknown> : {};
      if ('code' in errObj && errObj.code === '42P01') {
        // Table doesn't exist, return mock data
        console.warn('Popular tags table not found, returning mock data');
        return getMockPopularTags();
      }
      const message = 'message' in errObj && typeof errObj.message === 'string' ? errObj.message : 'Unknown error';
      const code = 'code' in errObj && typeof errObj.code === 'string' ? errObj.code : undefined;
      throw new ApiError(
        `Error fetching popular tags: ${message}`,
        code === '42P01' ? 404 : 500,
        { limit, error: tagsError }
      );
    }

    if (!tagsData || tagsData.length === 0) {
      return [];
    }

    return tagsData.map((item: { tag: string }) => item.tag);
  } catch (error) {
    console.error('Error fetching popular tags:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Fallback to mock data
    return getMockPopularTags();
  }
};

/**
 * Get content categories
 * @returns Array of content categories
 */
export const getContentCategories = async (): Promise<string[]> => {
  try {
    const contentCategoriesResult = await (supabase
      .from('content_categories') as any)
      .select('name')
      .order('name');
    let categoriesData: { name: string }[] | null = null;
    let categoriesError: unknown = null;
    if (typeof contentCategoriesResult === 'object' && contentCategoriesResult !== null) {
      if ('data' in contentCategoriesResult) categoriesData = (contentCategoriesResult as { data: { name: string }[] | null }).data;
      if ('error' in contentCategoriesResult) categoriesError = (contentCategoriesResult as { error: unknown }).error;
    }

    if (categoriesError) {
      const errObj = typeof categoriesError === 'object' && categoriesError !== null ? categoriesError as Record<string, unknown> : {};
      if ('code' in errObj && errObj.code === '42P01') {
        // Table doesn't exist, return mock data
        console.warn('Content categories table not found, returning mock data');
        return getMockContentCategories();
      }
      const message = 'message' in errObj && typeof errObj.message === 'string' ? errObj.message : 'Unknown error';
      const code = 'code' in errObj && typeof errObj.code === 'string' ? errObj.code : undefined;
      throw new ApiError(
        `Error fetching content categories: ${message}`,
        code === '42P01' ? 404 : 500,
        { error: categoriesError }
      );
    }

    if (!categoriesData || categoriesData.length === 0) {
      return [];
    }

    return categoriesData.map((category: { name: string }) => category.name);
  } catch (error) {
    console.error('Error fetching content categories:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Fallback to mock data
    return getMockContentCategories();
  }
};

// Mock data functions
function getMockSearchResults(
  query: string,
  filters: SearchFilters = {},
  limit: number = 20,
  offset: number = 0
): { results: SearchResult[]; total: number } {
  // Sample mock data
  const mockResults: SearchResult[] = [
    {
      id: '1',
      title: 'Getting Started with Golf',
      type: 'lesson',
      description: 'Learn the basics of golf including stance, grip, and swing fundamentals.',
      thumbnail_url: '/images/lessons/getting-started.jpg',
      url: '/academy/fundamentals/getting-started',
      created_at: new Date().toISOString(),
      author: 'John Smith',
      tier: 'free',
      tags: ['beginner', 'fundamentals', 'basics'],
      category: 'Swing Fundamentals'
    },
    {
      id: '2',
      title: 'Advanced Putting Techniques',
      type: 'video',
      description: 'Master the art of putting with these advanced techniques from pro golfers.',
      thumbnail_url: '/images/videos/putting-techniques.jpg',
      url: '/academy/short-game/putting-techniques',
      created_at: new Date().toISOString(),
      author: 'Emily Johnson',
      tier: 'driven',
      tags: ['putting', 'short game', 'advanced'],
      category: 'Short Game'
    },
    {
      id: '3',
      title: 'Mental Game: Focus Under Pressure',
      type: 'article',
      description: 'Learn strategies to maintain focus and perform your best under tournament pressure.',
      thumbnail_url: '/images/articles/mental-game.jpg',
      url: '/articles/mental-game-focus',
      created_at: new Date().toISOString(),
      author: 'Dr. Michael Chen',
      tier: 'aspiring',
      tags: ['mental game', 'tournament', 'focus'],
      category: 'Mental Game'
    },
    {
      id: '4',
      title: 'Best Drills for Distance Control',
      type: 'lesson',
      description: 'Practice these drills to improve your distance control with irons and wedges.',
      thumbnail_url: '/images/lessons/distance-control.jpg',
      url: '/academy/iron-play/distance-control',
      created_at: new Date().toISOString(),
      author: 'Sarah Williams',
      tier: 'driven',
      tags: ['irons', 'distance control', 'practice'],
      category: 'Iron Play'
    },
    {
      id: '5',
      title: 'Tournament Preparation Guide',
      type: 'article',
      description: 'A comprehensive guide to preparing for tournaments at any level.',
      thumbnail_url: '/images/articles/tournament-prep.jpg',
      url: '/articles/tournament-preparation',
      created_at: new Date().toISOString(),
      author: 'Tom Davis',
      tier: 'breakthrough',
      tags: ['tournament', 'preparation', 'competition'],
      category: 'Tournament Preparation'
    },
    {
      id: '6',
      title: 'Anyone tried the new TaylorMade driver?',
      type: 'community',
      description: 'Looking for feedback on the latest TaylorMade driver. Has anyone tried it yet?',
      url: '/community/post/123',
      created_at: new Date().toISOString(),
      author: 'GolfEnthusiast',
      tier: 'free',
      tags: ['equipment', 'drivers', 'taylormade'],
      category: 'Community'
    }
  ];
  
  // Filter results based on query and filters
  let filtered = [...mockResults];
  
  if (query) {
    const lowerQuery = query.toLowerCase();
    filtered = filtered.filter(item => 
      item.title.toLowerCase().includes(lowerQuery) ||
      (item.description && item.description.toLowerCase().includes(lowerQuery)) ||
      (item.tags && item.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
    );
  }
  
  if (filters.type && filters.type.length > 0) {
    filtered = filtered.filter(item => filters.type?.includes(item.type));
  }
  
  if (filters.tier && filters.tier.length > 0) {
    filtered = filtered.filter(item => filters.tier?.includes(item.tier));
  }
  
  if (filters.category && filters.category.length > 0) {
    filtered = filtered.filter(item => item.category && filters.category?.includes(item.category));
  }
  
  if (filters.tags && filters.tags.length > 0) {
    filtered = filtered.filter(item => 
      (item.tags ?? []).length > 0 && (filters.tags ?? []).some(tag => (item.tags ?? []).includes(tag))
    );
  }
  
  // Apply pagination
  const paginatedResults = filtered.slice(offset, offset + limit);
  
  return {
    results: paginatedResults,
    total: filtered.length
  };
}

function getMockPopularTags(): string[] {
  return [
    'beginner',
    'putting',
    'driver',
    'short game',
    'mental game',
    'tournament',
    'equipment',
    'swing',
    'drills',
    'practice',
    'fitness',
    'course management',
    'rules',
    'wedges',
    'irons'
  ];
}

function getMockContentCategories(): string[] {
  return [
    'Swing Fundamentals',
    'Short Game',
    'Course Management',
    'Mental Game',
    'Physical Training',
    'Equipment',
    'Rules & Etiquette',
    'Tournament Preparation',
    'Beginner Basics',
    'Advanced Techniques',
    'Community'
  ];
}
