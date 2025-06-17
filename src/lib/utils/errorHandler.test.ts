import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleApiError, ApiError, ErrorType } from './errorHandler';
import { captureException } from '@/lib/services/errorMonitoring';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

vi.mock('@/lib/services/errorMonitoring', () => ({
  captureException: vi.fn(),
}));

describe('Error Handler Utility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle ApiError with authentication error', () => {
    const error = new ApiError('Auth failed', 'AUTH_ERROR', { status: 401 });
    const result = handleApiError(error);
    
    expect(result.type).toBe(ErrorType.AUTHENTICATION);
    expect(result.message).toBe('Authentication error. Please sign in again.');
    expect(toast.error).toHaveBeenCalledWith('Authentication error. Please sign in again.');
    expect(captureException).toHaveBeenCalledWith(error, expect.any(Object));
  });

  it('should handle ApiError with not found error', () => {
    const error = new ApiError('Not found', 'NOT_FOUND', { status: 404 });
    const result = handleApiError(error);
    
    expect(result.type).toBe(ErrorType.NOT_FOUND);
    expect(result.message).toBe('The requested resource was not found.');
    expect(toast.error).toHaveBeenCalledWith('The requested resource was not found.');
    expect(captureException).toHaveBeenCalledWith(error, expect.any(Object));
  });

  it('should handle ApiError with rate limit error', () => {
    const error = new ApiError('Rate limit exceeded', 'RATE_LIMIT_EXCEEDED', { status: 429 });
    const result = handleApiError(error);
    
    expect(result.type).toBe(ErrorType.RATE_LIMIT);
    expect(result.message).toBe('Rate limit exceeded');
    expect(toast.error).toHaveBeenCalledWith('Rate limit exceeded');
    expect(captureException).not.toHaveBeenCalled();
  });

  it('should handle network errors', () => {
    const error = new Error('Failed to fetch');
    error.name = 'AbortError';
    const result = handleApiError(error);
    
    expect(result.type).toBe(ErrorType.NETWORK_ERROR);
    expect(result.message).toBe('Network error. Please check your connection and try again.');
    expect(toast.error).toHaveBeenCalledWith('Network error. Please check your connection and try again.');
    expect(captureException).toHaveBeenCalledWith(error, expect.any(Object));
  });

  it('should use fallback message for unknown errors', () => {
    const error = new Error();
    const fallbackMessage = 'Something went wrong';
    const result = handleApiError(error, fallbackMessage);
    
    expect(result.type).toBe(ErrorType.UNKNOWN);
    expect(result.message).toBe(fallbackMessage);
    expect(toast.error).toHaveBeenCalledWith(fallbackMessage);
    expect(captureException).toHaveBeenCalledWith(error, expect.any(Object));
  });

  it('should not show toast when showToast is false', () => {
    const error = new Error('Test error');
    handleApiError(error, 'Fallback message', false);
    
    expect(toast.error).not.toHaveBeenCalled();
  });
});
