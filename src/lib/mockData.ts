/**
 * Mock Data Provider
 * 
 * This module provides mock data for development and testing purposes
 * when the actual database tables don't exist yet.
 */

import { supabase } from './supabase';

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// Mock data for content items
const MOCK_CONTENT = [
  { id: '1', title: 'Swing Analysis: Drive Technique', type: 'video', status: 'active', created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '2', title: 'Putting Fundamentals', type: 'article', status: 'active', created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '3', title: 'Course Management Tips', type: 'guide', status: 'active', created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '4', title: 'Sand Trap Recovery', type: 'video', status: 'pending', created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
];

// Mock data for tournaments
const MOCK_TOURNAMENTS = [
  { id: '1', name: 'Summer Championship 2025', status: 'upcoming', start_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), participants: 24 },
  { id: '2', name: 'Pro-Am Charity Event', status: 'upcoming', start_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), participants: 36 },
  { id: '3', name: 'Regional Qualifier', status: 'upcoming', start_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(), participants: 48 },
];

// Mock data for content submissions
const MOCK_SUBMISSIONS = [
  { id: '1', title: 'Advanced Chipping Techniques', type: 'video', status: 'pending', created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '2', title: 'Mental Game Strategies', type: 'article', status: 'pending', created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '3', title: 'Equipment Selection Guide', type: 'guide', status: 'pending', created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
];

// Mock data for user profiles
const MOCK_PROFILES = Array.from({ length: 1254 }, (_, i) => ({
  id: `user-${i + 1}`,
  email: `user${i + 1}@example.com`,
  created_at: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000).toISOString(),
}));

/**
 * Safe database query wrapper that falls back to mock data in development
 * @param tableName The table to query
 * @param mockData Mock data to return if table doesn't exist
 * @param queryFn Optional function to customize the query
 */
export async function safeQuery<T = unknown>(tableName: string, mockData: T[], queryFn?: (query: unknown) => unknown): Promise<{ data: T[]; error: unknown | null }> {
  if (!isDevelopment) {
    try {
      let query = supabase.from(tableName).select('*');
      
      if (queryFn) {
        query = queryFn(query);
      }
      
      const { data, error } = await query;
      
      if (error) {
        if (error.code === '42P01') { // Table doesn't exist error
          console.warn(`Table ${tableName} doesn't exist, using mock data`);
          return { data: mockData, error: null };
        }
        throw error;
      }
      
      return { data, error: null };
    } catch (error) {
      console.error(`Error fetching ${tableName}:`, error);
      return { data: mockData, error };
    }
  } else {
    // In development, just return mock data
    return { data: mockData, error: null };
  }
}

// Exported functions for different data types
export const mockDataService = {
  async getContent(customQuery?: (query: unknown) => unknown) {
    return safeQuery<typeof MOCK_CONTENT[0]>('content_items', MOCK_CONTENT, customQuery);
  },
  
  async getTournaments(customQuery?: (query: unknown) => unknown) {
    return safeQuery<typeof MOCK_TOURNAMENTS[0]>('tournaments', MOCK_TOURNAMENTS, customQuery);
  },
  
  async getContentSubmissions(customQuery?: (query: unknown) => unknown) {
    return safeQuery<typeof MOCK_SUBMISSIONS[0]>('content_submissions', MOCK_SUBMISSIONS, customQuery);
  },
  
  async getProfiles(customQuery?: (query: unknown) => unknown) {
    return safeQuery<typeof MOCK_PROFILES[0]>('profiles', MOCK_PROFILES, customQuery);
  },
  
  // Helper method to get counts for dashboard stats
  async getDashboardStats() {
    return {
      totalUsers: MOCK_PROFILES.length,
      pendingApprovals: MOCK_SUBMISSIONS.length,
      activeContent: MOCK_CONTENT.filter(item => item.status === 'active').length,
      upcomingTournaments: MOCK_TOURNAMENTS.filter(item => item.status === 'upcoming').length
    };
  }
};
