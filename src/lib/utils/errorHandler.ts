/**
 * Error Handler Utility
 * 
 * This utility provides centralized error handling for the application.
 * It integrates with toast notifications and Sentry for error monitoring.
 */

import { toast } from 'sonner';
import { captureException } from '@/lib/services/errorMonitoring';

/**
 * Standard error types that can occur in the application
 */
export enum ErrorType {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  NOT_FOUND = 'not_found',
  SERVER_ERROR = 'server_error',
  NETWORK_ERROR = 'network_error',
  RATE_LIMIT = 'rate_limit',
  UNKNOWN = 'unknown'
}

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  code: string;
  details: Record<string, unknown>;
  status?: number;

  constructor(message: string, code: string = 'UNKNOWN_ERROR', details: Record<string, unknown> = {}) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
    this.status = details.status as number | undefined;
  }
}

/**
 * Error response structure
 */
export interface ErrorResponse {
  type: ErrorType;
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

/**
 * Handle API errors with consistent error messages and reporting
 * @param error The error object
 * @param fallbackMessage A fallback message if the error doesn't have one
 * @param showToast Whether to show a toast notification
 * @returns Standardized error response
 */
export const handleApiError = (error: unknown, fallbackMessage: string = 'An error occurred', showToast: boolean = true): ErrorResponse => {
  let errorResponse: ErrorResponse;

  // Determine error type and create standardized response
  if (error instanceof ApiError) {
    // Handle our custom ApiError
    const statusCode = error.status || 500;
    
    if (statusCode === 401 || statusCode === 403) {
      errorResponse = {
        type: ErrorType.AUTHENTICATION,
        message: 'Authentication error. Please sign in again.',
        code: error.code,
        details: error.details
      };
    } else if (statusCode === 404) {
      errorResponse = {
        type: ErrorType.NOT_FOUND,
        message: 'The requested resource was not found.',
        code: error.code,
        details: error.details
      };
    } else if (statusCode === 429 || error.code === 'RATE_LIMIT_EXCEEDED') {
      errorResponse = {
        type: ErrorType.RATE_LIMIT,
        message: error.message || 'Too many requests. Please try again later.',
        code: error.code,
        details: error.details
      };
    } else if (statusCode >= 400 && statusCode < 500) {
      errorResponse = {
        type: ErrorType.VALIDATION,
        message: error.message || fallbackMessage,
        code: error.code,
        details: error.details
      };
    } else {
      errorResponse = {
        type: ErrorType.SERVER_ERROR,
        message: error.message || 'Server error. Please try again later.',
        code: error.code,
        details: error.details
      };
    }
  } else if (
    typeof error === 'object' && error !== null &&
    ('code' in error && (error as { code?: string }).code === 'PGRST301' ||
      ('message' in error && typeof (error as { message?: string }).message === 'string' && (error as { message: string }).message.includes('JWT')))
  ) {
    // Handle Supabase auth errors
    errorResponse = {
      type: ErrorType.AUTHENTICATION,
      message: 'Your session has expired. Please sign in again.',
      code: (error as { code?: string }).code,
      details: error as Record<string, unknown>
    };
  } else if (
    typeof error === 'object' && error !== null &&
    'code' in error && (error as { code?: string }).code === 'PGRST404'
  ) {
    // Handle Supabase not found errors
    errorResponse = {
      type: ErrorType.NOT_FOUND,
      message: 'The requested resource was not found.',
      code: (error as { code?: string }).code,
      details: error as Record<string, unknown>
    };
  } else if (
    typeof error === 'object' && error !== null &&
    'name' in error && (error as { name?: string }).name === 'AbortError' ||
    ('message' in error && typeof (error as { message?: string }).message === 'string' && (error as { message: string }).message.includes('network'))
  ) {
    // Handle network errors
    errorResponse = {
      type: ErrorType.NETWORK_ERROR,
      message: 'Network error. Please check your connection and try again.',
      details: error as Record<string, unknown>
    };
  } else if (
    typeof error === 'object' && error !== null &&
    'message' in error && typeof (error as { message?: string }).message === 'string' && (error as { message: string }).message.includes('rate limit')
  ) {
    // Handle rate limit errors
    errorResponse = {
      type: ErrorType.RATE_LIMIT,
      message: 'Rate limit exceeded. Please try again later.',
      details: error as Record<string, unknown>
    };
  } else {
    // Handle generic errors
    errorResponse = {
      type: ErrorType.UNKNOWN,
      message: (typeof error === 'object' && error !== null && 'message' in error && typeof (error as { message?: string }).message === 'string') ? (error as { message: string }).message : fallbackMessage,
      details: error as Record<string, unknown>
    };
  }

  // Log the error to console
  console.error('API Error:', errorResponse);
  
  // Report to Sentry if it's not a validation or rate limit error
  if (
    errorResponse.type !== ErrorType.VALIDATION &&
    errorResponse.type !== ErrorType.RATE_LIMIT
  ) {
    captureException(error, {
      errorType: errorResponse.type,
      errorCode: errorResponse.code,
      errorMessage: errorResponse.message
    });
  }
  
  // Show toast notification if enabled
  if (showToast) {
    toast.error(errorResponse.message);
  }
  
  return errorResponse;
};

/**
 * Higher-order function that wraps an async function with error handling
 * @param fn The async function to wrap
 * @param fallbackMessage A fallback message if the error doesn't have one
 * @returns The wrapped function with error handling
 */
export const withErrorHandling = <T, Args extends unknown[]>(
  fn: (...args: Args) => Promise<T>,
  fallbackMessage: string = 'An error occurred'
) => {
  return async (...args: Args): Promise<T> => {
    try {
      return await fn(...args);
    } catch (error) {
      handleApiError(error, fallbackMessage);
      throw error;
    }
  };
};
