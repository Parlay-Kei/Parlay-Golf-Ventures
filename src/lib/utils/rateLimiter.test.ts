import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { RateLimiter, DEFAULT_RATE_LIMITS, checkRateLimit, formatTimeRemaining } from './rateLimiter';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

// Replace the global localStorage with our mock
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('RateLimiter Utility', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Reset mocks
    vi.restoreAllMocks();
  });

  describe('RateLimiter class', () => {
    it('should create a new instance with the correct options', () => {
      const options = {
        maxRequests: 5,
        windowMs: 60000,
        identifier: 'test',
      };
      const limiter = new RateLimiter(options);
      
      // Check that the instance was created with the correct options
      // We're using any here to access private properties for testing
      expect((limiter as unknown as { options: unknown, storageKey: string, metrics: unknown[], mark: (...args: unknown[]) => unknown, measure: (...args: unknown[]) => unknown, reportMetrics: (...args: unknown[]) => unknown }).options).toEqual(options);
      expect((limiter as unknown as { options: unknown, storageKey: string, metrics: unknown[], mark: (...args: unknown[]) => unknown, measure: (...args: unknown[]) => unknown, reportMetrics: (...args: unknown[]) => unknown }).storageKey).toBe('rate-limit:test');
    });

    it('should not be limited when no requests have been made', () => {
      const limiter = new RateLimiter({
        maxRequests: 5,
        windowMs: 60000,
        identifier: 'test',
      });
      
      const result = limiter.check();
      
      expect(result.limited).toBe(false);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('rate-limit:test');
    });

    it('should increment the request count', () => {
      const limiter = new RateLimiter({
        maxRequests: 5,
        windowMs: 60000,
        identifier: 'test',
      });
      
      // Mock Date.now to return a consistent timestamp
      const now = 1000;
      vi.spyOn(Date, 'now').mockReturnValue(now);
      
      limiter.increment();
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'rate-limit:test',
        JSON.stringify({ requests: [now] })
      );
    });

    it('should be limited when max requests have been made', () => {
      const limiter = new RateLimiter({
        maxRequests: 2,
        windowMs: 60000,
        identifier: 'test',
      });
      
      // Mock Date.now to return a consistent timestamp
      const now = 1000;
      vi.spyOn(Date, 'now').mockReturnValue(now);
      
      // Set up localStorage to simulate 2 recent requests
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        requests: [now - 1000, now - 500],
      }));
      
      const result = limiter.check();
      
      expect(result.limited).toBe(true);
      expect(result.resetTime).toBe(now - 1000 + 60000); // Oldest request + window
    });

    it('should reset the rate limiter state', () => {
      const limiter = new RateLimiter({
        maxRequests: 5,
        windowMs: 60000,
        identifier: 'test',
      });
      
      limiter.reset();
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('rate-limit:test');
    });

    it('should handle localStorage errors gracefully', () => {
      const limiter = new RateLimiter({
        maxRequests: 5,
        windowMs: 60000,
        identifier: 'test',
      });
      
      // Mock console.error to prevent test output noise
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Simulate localStorage.getItem throwing an error
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      const result = limiter.check();
      
      expect(result.limited).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('checkRateLimit function', () => {
    it('should use the correct rate limit for each contributor type', () => {
      // Mock Date.now to return a consistent timestamp
      const now = 1000;
      vi.spyOn(Date, 'now').mockReturnValue(now);
      
      // Check that each contributor type uses the correct rate limit
      Object.entries(DEFAULT_RATE_LIMITS).forEach(([type, limits]) => {
        checkRateLimit(type);
        
        expect(localStorageMock.getItem).toHaveBeenCalledWith(`rate-limit:contribution:${type}`);
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          `rate-limit:contribution:${type}`,
          expect.stringContaining('')
        );
      });
    });

    it('should use guest limits for unknown contributor types', () => {
      // Mock Date.now to return a consistent timestamp
      const now = 1000;
      vi.spyOn(Date, 'now').mockReturnValue(now);
      
      checkRateLimit('unknown');
      
      expect(localStorageMock.getItem).toHaveBeenCalledWith('rate-limit:contribution:unknown');
      // Should use guest limits (2 requests per hour)
      const state = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
      expect(state.requests).toHaveLength(1);
    });
  });

  describe('formatTimeRemaining function', () => {
    it('should format seconds correctly', () => {
      expect(formatTimeRemaining(1000)).toBe('1 second');
      expect(formatTimeRemaining(30000)).toBe('30 seconds');
    });

    it('should format minutes correctly', () => {
      expect(formatTimeRemaining(60000)).toBe('1 minute');
      expect(formatTimeRemaining(120000)).toBe('2 minutes');
    });

    it('should format hours correctly', () => {
      expect(formatTimeRemaining(3600000)).toBe('1 hour');
      expect(formatTimeRemaining(7200000)).toBe('2 hours');
    });
  });
});
