/**
 * API Cache Utility
 * 
 * This utility provides functions for caching API responses to improve performance
 * by reducing network requests for frequently accessed data.
 */

import { useState, useEffect, useCallback } from 'react';

// Cache configuration interface
interface CacheConfig {
  // Maximum age of cached items in milliseconds
  maxAge: number;
  // Whether to use memory cache
  useMemory: boolean;
  // Whether to use localStorage cache
  useStorage: boolean;
  // Cache version (increment when API changes to invalidate old caches)
  version: string;
}

// Default cache configuration
const defaultConfig: CacheConfig = {
  maxAge: 5 * 60 * 1000, // 5 minutes
  useMemory: true,
  useStorage: true,
  version: '1.0.0',
};

// Cache item interface
interface CacheItem<T> {
  data: T;
  timestamp: number;
  version: string;
}

// In-memory cache
const memoryCache = new Map<string, CacheItem<unknown>>();

/**
 * Get cache key for a URL and params
 * @param url API URL
 * @param params Optional query parameters
 * @returns Cache key string
 */
const getCacheKey = (url: string, params?: Record<string, unknown>): string => {
  if (!params) {
    return url;
  }
  
  // Sort params to ensure consistent cache keys
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {} as Record<string, unknown>);
  
  return `${url}:${JSON.stringify(sortedParams)}`;
};

/**
 * Store data in cache
 * @param key Cache key
 * @param data Data to cache
 * @param config Cache configuration
 */
const setCache = <T>(key: string, data: T, config: CacheConfig): void => {
  const cacheItem: CacheItem<T> = {
    data,
    timestamp: Date.now(),
    version: config.version,
  };
  
  // Store in memory cache if enabled
  if (config.useMemory) {
    memoryCache.set(key, cacheItem as CacheItem<unknown>);
  }
  
  // Store in localStorage if enabled
  if (config.useStorage && typeof window !== 'undefined') {
    try {
      localStorage.setItem(
        `api-cache:${key}`,
        JSON.stringify(cacheItem)
      );
    } catch (error) {
      console.error('Error storing in localStorage:', error);
    }
  }
};

/**
 * Get data from cache
 * @param key Cache key
 * @param config Cache configuration
 * @returns Cached data or null if not found or expired
 */
const getCache = <T>(key: string, config: CacheConfig): T | null => {
  // Try memory cache first if enabled
  if (config.useMemory && memoryCache.has(key)) {
    const item = memoryCache.get(key) as CacheItem<T>;
    
    // Check if cache is valid
    if (
      item.version === config.version &&
      Date.now() - item.timestamp < config.maxAge
    ) {
      return item.data;
    }
    
    // Remove expired item from memory cache
    memoryCache.delete(key);
  }
  
  // Try localStorage if enabled
  if (config.useStorage && typeof window !== 'undefined') {
    try {
      const storedItem = localStorage.getItem(`api-cache:${key}`);
      
      if (storedItem) {
        const item = JSON.parse(storedItem) as CacheItem<T>;
        
        // Check if cache is valid
        if (
          item.version === config.version &&
          Date.now() - item.timestamp < config.maxAge
        ) {
          // Also update memory cache if enabled
          if (config.useMemory) {
            memoryCache.set(key, item as CacheItem<unknown>);
          }
          
          return item.data;
        }
        
        // Remove expired item from localStorage
        localStorage.removeItem(`api-cache:${key}`);
      }
    } catch (error) {
      console.error('Error retrieving from localStorage:', error);
    }
  }
  
  return null;
};

/**
 * Clear all cached data
 * @param config Cache configuration
 */
export const clearCache = (config: Partial<CacheConfig> = {}): void => {
  const mergedConfig = { ...defaultConfig, ...config };
  
  // Clear memory cache
  if (mergedConfig.useMemory) {
    memoryCache.clear();
  }
  
  // Clear localStorage cache
  if (mergedConfig.useStorage && typeof window !== 'undefined') {
    try {
      const keysToRemove: string[] = [];
      
      // Find all cache keys in localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('api-cache:')) {
          keysToRemove.push(key);
        }
      }
      
      // Remove all cache items
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Error clearing localStorage cache:', error);
    }
  }
};

/**
 * Clear specific cached data
 * @param url API URL to clear from cache
 * @param params Optional query parameters
 * @param config Cache configuration
 */
export const clearCacheForUrl = (
  url: string,
  params?: Record<string, unknown>,
  config: Partial<CacheConfig> = {}
): void => {
  const mergedConfig = { ...defaultConfig, ...config };
  const cacheKey = getCacheKey(url, params);
  
  // Clear from memory cache
  if (mergedConfig.useMemory) {
    memoryCache.delete(cacheKey);
  }
  
  // Clear from localStorage cache
  if (mergedConfig.useStorage && typeof window !== 'undefined') {
    try {
      localStorage.removeItem(`api-cache:${cacheKey}`);
    } catch (error) {
      console.error('Error clearing localStorage cache for URL:', error);
    }
  }
};

/**
 * Fetch data from API with caching
 * @param url API URL
 * @param params Optional query parameters
 * @param options Fetch options
 * @param cacheConfig Cache configuration
 * @returns Promise resolving to the API response data
 */
export const fetchWithCache = async <T>(
  url: string,
  params?: Record<string, unknown>,
  options?: RequestInit,
  cacheConfig: Partial<CacheConfig> = {}
): Promise<T> => {
  const config = { ...defaultConfig, ...cacheConfig };
  const cacheKey = getCacheKey(url, params);
  
  // Try to get from cache first
  const cachedData = getCache<T>(cacheKey, config);
  if (cachedData !== null) {
    return cachedData;
  }
  
  // Build URL with query parameters
  let fetchUrl = url;
  if (params) {
    const queryString = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      queryString.append(key, String(value));
    });
    
    fetchUrl = `${url}?${queryString.toString()}`;
  }
  
  // Fetch data from API
  const response = await fetch(fetchUrl, options);
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  
  // Cache the response
  setCache(cacheKey, data, config);
  
  return data as T;
};

/**
 * Hook to use cached API data in React components
 * @param url API URL
 * @param params Optional query parameters
 * @param options Fetch options
 * @param cacheConfig Cache configuration
 * @returns Object containing data, loading state, error, and refetch function
 */
export const useCachedApi = <T>(
  url: string,
  params?: Record<string, unknown>,
  options?: RequestInit,
  cacheConfig: Partial<CacheConfig> = {}
) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const fetchData = useCallback(async (skipCache = false) => {
    setLoading(true);
    setError(null);
    
    try {
      // If skipCache is true, clear the cache for this URL first
      if (skipCache) {
        clearCacheForUrl(url, params, cacheConfig);
      }
      
      const result = await fetchWithCache<T>(url, params, options, cacheConfig);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [url, params, options, cacheConfig]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  return { data, loading, error, refetch: fetchData };
};
