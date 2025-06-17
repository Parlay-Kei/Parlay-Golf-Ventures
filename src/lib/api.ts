/**
 * API utility functions for making requests to backend services
 * This file provides a centralized way to handle API calls with error handling
 */

import { supabase } from './supabase';
import { toast } from '@/components/ui/use-toast';
import { DEV_CONFIG } from './config/env';

// Basic API response type
interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
  status: number;
}

// API error interface
interface ApiError extends Error {
  status?: number;
  code?: string;
}

// Request options interface
interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

// Database query function type
type QueryFunction<T> = () => Promise<{ data: T | null; error: Error | null }>;

// Error handler function
const handleApiError = (error: unknown, endpoint: string): ApiResponse<never> => {
  const apiError = error as ApiError;
  console.error(`API Error (${endpoint}):`, apiError);
  
  // Show toast notification for user feedback
  toast({
    title: 'Error',
    description: apiError.message || 'An unexpected error occurred',
    variant: 'destructive',
  });
  
  return {
    data: null,
    error: apiError,
    status: apiError.status || 500
  };
};

// Generic GET request function
const get = async <T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> => {
  try {
    if (DEV_CONFIG.LOGGING.VERBOSE) {
      console.log(`API GET: ${endpoint}`);
    }
    
    // In development mode with mock data enabled, return mock data
    if (DEV_CONFIG.DATABASE.USE_MOCK_DATA) {
      console.log(`Using mock data for ${endpoint}`);
      return {
        data: {} as T,
        error: null,
        status: 200
      };
    }
    
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      ...options
    });
    
    const data = await response.json();
    
    return {
      data,
      error: null,
      status: response.status
    };
  } catch (error) {
    return handleApiError(error, endpoint);
  }
};

// Generic POST request function
const post = async <T>(endpoint: string, body: Record<string, unknown>, options: RequestOptions = {}): Promise<ApiResponse<T>> => {
  try {
    if (DEV_CONFIG.LOGGING.VERBOSE) {
      console.log(`API POST: ${endpoint}`, body);
    }
    
    // In development mode with mock data enabled, return mock data
    if (DEV_CONFIG.DATABASE.USE_MOCK_DATA) {
      console.log(`Using mock data for ${endpoint}`);
      return {
        data: {} as T,
        error: null,
        status: 200
      };
    }
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      ...options
    });
    
    const data = await response.json();
    
    return {
      data,
      error: null,
      status: response.status
    };
  } catch (error) {
    return handleApiError(error, endpoint);
  }
};

// Supabase wrapper for database operations
const db = {
  // Generic query function that falls back to mock data if tables don't exist
  query: async <T>(tableName: string, queryFn: QueryFunction<T>): Promise<ApiResponse<T>> => {
    try {
      if (DEV_CONFIG.DATABASE.USE_MOCK_DATA) {
        console.log(`Using mock data for database query on ${tableName}`);
        return {
          data: {} as T,
          error: null,
          status: 200
        };
      }
      
      const result = await queryFn();
      
      if (result.error) {
        throw result.error;
      }
      
      return {
        data: result.data as T,
        error: null,
        status: 200
      };
    } catch (error) {
      const apiError = error as ApiError;
      // Check if the error is related to missing tables
      if (apiError.message?.includes('does not exist') && DEV_CONFIG.DATABASE.TRY_LIVE_FIRST) {
        console.warn(`Table ${tableName} does not exist, falling back to mock data`);
        return {
          data: {} as T,
          error: null,
          status: 200
        };
      }
      
      return handleApiError(error, `db.query(${tableName})`);
    }
  }
};

// Export the API utilities
export const api = {
  get,
  post,
  db
};
