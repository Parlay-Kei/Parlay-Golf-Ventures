/**
 * Rate Limiter Utility
 * 
 * This utility provides client-side rate limiting functionality to prevent spam submissions.
 * It uses localStorage to track request counts and timestamps.
 */

/**
 * Rate limiter configuration options
 */
export interface RateLimiterOptions {
  /** Maximum number of requests allowed within the time window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Unique identifier for this rate limiter instance */
  identifier: string;
}

/**
 * Default rate limits for different contributor types
 */
export const DEFAULT_RATE_LIMITS = {
  member: { maxRequests: 5, windowMs: 3600000 }, // 5 requests per hour for members
  guest: { maxRequests: 2, windowMs: 3600000 },  // 2 requests per hour for guests
  mentor: { maxRequests: 10, windowMs: 3600000 }, // 10 requests per hour for mentors
  creator: { maxRequests: 15, windowMs: 3600000 } // 15 requests per hour for content creators
};

/**
 * Client-side rate limiter class
 */
export class RateLimiter {
  private options: RateLimiterOptions;
  private storageKey: string;

  /**
   * Create a new rate limiter instance
   * @param options Rate limiter configuration options
   */
  constructor(options: RateLimiterOptions) {
    this.options = options;
    this.storageKey = `rate-limit:${options.identifier}`;
  }

  /**
   * Check if the rate limit has been exceeded
   * @returns Object containing whether the limit is exceeded and reset time
   */
  check(): { limited: boolean; resetTime: number } {
    const now = Date.now();
    const state = this.getState();
    
    // Remove requests outside the current time window
    const validRequests = state.requests.filter(
      timestamp => now - timestamp < this.options.windowMs
    );
    
    // Check if limit exceeded
    const limited = validRequests.length >= this.options.maxRequests;
    
    // Calculate reset time (when the oldest request will expire)
    const resetTime = validRequests.length > 0
      ? validRequests[0] + this.options.windowMs
      : now;
    
    return { limited, resetTime };
  }

  /**
   * Record a new request
   */
  increment(): void {
    const now = Date.now();
    const state = this.getState();
    
    // Add current timestamp to requests array
    state.requests.push(now);
    
    // Remove requests outside the current time window
    state.requests = state.requests.filter(
      timestamp => now - timestamp < this.options.windowMs
    );
    
    // Save updated state
    this.saveState(state);
  }

  /**
   * Reset the rate limiter state
   */
  reset(): void {
    localStorage.removeItem(this.storageKey);
  }

  /**
   * Get the current state from localStorage
   */
  private getState(): { requests: number[] } {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : { requests: [] };
    } catch (error) {
      console.error('Error retrieving rate limit state:', error);
      return { requests: [] };
    }
  }

  /**
   * Save the current state to localStorage
   */
  private saveState(state: { requests: number[] }): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving rate limit state:', error);
    }
  }
}

/**
 * Check if a contribution request is rate limited based on contributor type
 * @param contributorType The type of contributor making the request
 * @returns True if the request is rate limited, false otherwise
 */
export const checkRateLimit = (contributorType: string): boolean => {
  const limits = DEFAULT_RATE_LIMITS[contributorType as keyof typeof DEFAULT_RATE_LIMITS] || DEFAULT_RATE_LIMITS.guest;
  
  const rateLimiter = new RateLimiter({
    maxRequests: limits.maxRequests,
    windowMs: limits.windowMs,
    identifier: `contribution:${contributorType}`
  });
  
  const { limited } = rateLimiter.check();
  
  if (!limited) {
    rateLimiter.increment();
  }
  
  return limited;
};

/**
 * Format milliseconds into a human-readable time string
 * @param ms Time in milliseconds
 * @returns Formatted time string (e.g., "5 minutes")
 */
export const formatTimeRemaining = (ms: number): string => {
  const seconds = Math.ceil(ms / 1000);
  
  if (seconds < 60) {
    return `${seconds} second${seconds !== 1 ? 's' : ''}`;
  }
  
  const minutes = Math.ceil(seconds / 60);
  
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  
  const hours = Math.ceil(minutes / 60);
  return `${hours} hour${hours !== 1 ? 's' : ''}`;
};
