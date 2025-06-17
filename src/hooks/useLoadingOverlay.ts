import { useLoading } from '@/contexts/LoadingContext';
import { useCallback, useState } from 'react';

export interface UseLoadingOverlayOptions {
  /**
   * Default loading message
   */
  defaultMessage?: string;
  
  /**
   * Minimum time to show loading state in milliseconds
   */
  minLoadingTime?: number;
  
  /**
   * Whether to use the global loading overlay
   */
  useGlobalOverlay?: boolean;
  
  /**
   * Whether to show the loading spinner
   */
  showSpinner?: boolean;
  
  /**
   * Whether to show the loading message
   */
  showMessage?: boolean;
  
  /**
   * Number of retry attempts for failed operations
   */
  retryCount?: number;
  
  /**
   * Delay between retry attempts in milliseconds
   */
  retryDelay?: number;
}

/**
 * Hook for managing loading states with consistent behavior
 * 
 * This hook provides a unified API for handling loading states, including:
 * - Local component loading state
 * - Global loading overlay
 * - Automatic retry logic
 * - Minimum loading time to prevent flickering
 */
export function useLoadingOverlay(options: UseLoadingOverlayOptions = {}) {
  const {
    defaultMessage = 'Loading...',
    minLoadingTime = 500,
    useGlobalOverlay = false,
    showSpinner = true,
    showMessage = true,
    retryCount = 3,
    retryDelay = 1000
  } = options;
  
  // Access the global loading context
  const globalLoading = useLoading();
  
  // Local loading state for component-level loading
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [loadingMessage, setLoadingMessage] = useState(defaultMessage);
  const [retryAttempts, setRetryAttempts] = useState(0);

  /**
   * Start the loading state
   */
  const startLoading = useCallback((customMessage?: string) => {
    const message = customMessage || defaultMessage;
    
    if (useGlobalOverlay) {
      globalLoading.setLoading(true, message);
    } else {
      setIsLoading(true);
      setLoadingMessage(message);
    }
    
    setError(null);
  }, [defaultMessage, globalLoading, useGlobalOverlay]);

  /**
   * Stop the loading state
   */
  const stopLoading = useCallback(() => {
    if (useGlobalOverlay) {
      globalLoading.setLoading(false);
    } else {
      setIsLoading(false);
    }
    
    setLoadingMessage(defaultMessage);
  }, [defaultMessage, globalLoading, useGlobalOverlay]);

  /**
   * Execute an async operation with loading state
   */
  const withLoading = useCallback(async <T>(
    operation: () => Promise<T>,
    customMessage?: string
  ): Promise<T> => {
    const startTime = Date.now();
    startLoading(customMessage);
    setRetryAttempts(0);

    try {
      const result = await operation();
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);

      // Ensure minimum loading time to prevent flickering
      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }

      stopLoading();
      return result;
    } catch (error) {
      // Implement retry logic
      if (retryAttempts < retryCount) {
        setRetryAttempts(prev => prev + 1);
        const retryMessage = `Retrying... (${retryAttempts + 1}/${retryCount})`;
        
        if (useGlobalOverlay) {
          globalLoading.setLoading(true, retryMessage);
        } else {
          setLoadingMessage(retryMessage);
        }
        
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return withLoading(operation, customMessage);
      }

      // If all retries fail, set error and stop loading
      setError(error as Error);
      stopLoading();
      throw error;
    }
  }, [startLoading, stopLoading, minLoadingTime, retryCount, retryDelay, retryAttempts, useGlobalOverlay, globalLoading]);

  return {
    // Loading state
    isLoading: useGlobalOverlay ? globalLoading.isLoading : isLoading,
    loadingMessage: useGlobalOverlay ? globalLoading.loadingMessage : loadingMessage,
    error,
    retryAttempts,
    
    // Actions
    startLoading,
    stopLoading,
    withLoading,
    
    // Configuration
    showSpinner,
    showMessage
  };
}
