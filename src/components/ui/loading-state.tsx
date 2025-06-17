import React from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface LoadingStateProps {
  /**
   * Whether the content is currently loading
   */
  isLoading: boolean;
  
  /**
   * Error object if loading failed
   */
  error?: Error | null;
  
  /**
   * The content to render when not loading
   */
  children: React.ReactNode;
  
  /**
   * Custom loading component to show instead of the default spinner
   */
  loadingFallback?: React.ReactNode;
  
  /**
   * Custom error component to show instead of the default error message
   */
  errorFallback?: React.ReactNode;
  
  /**
   * Loading variant that determines the skeleton appearance
   */
  variant?: 'card' | 'text' | 'image' | 'spinner' | 'inline';
  
  /**
   * Size of the loading indicator
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Custom loading message
   */
  loadingMessage?: string;
  
  /**
   * Whether to show the loading message
   */
  showMessage?: boolean;
  
  /**
   * Number of retry attempts made
   */
  retryAttempts?: number;
  
  /**
   * Maximum number of retry attempts
   */
  retryCount?: number;
  
  /**
   * Callback to retry the operation
   */
  onRetry?: () => void;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Whether to fill the parent container
   */
  fillContainer?: boolean;
}

/**
 * LoadingState Component
 * 
 * A standardized component for handling loading, error, and success states
 * with consistent styling and behavior throughout the application.
 */
export function LoadingState({
  isLoading,
  error,
  children,
  loadingFallback,
  errorFallback,
  variant = 'card',
  size = 'md',
  loadingMessage,
  showMessage = true,
  retryAttempts = 0,
  retryCount = 3,
  onRetry,
  className,
  fillContainer = false,
}: LoadingStateProps) {
  // Handle error state
  if (error) {
    if (errorFallback) {
      return <>{errorFallback}</>;
    }
    
    return (
      <div className={cn(
        'rounded-lg border border-red-200 bg-red-50 p-4',
        fillContainer && 'h-full w-full flex items-center justify-center',
        className
      )}>
        <div className='flex items-center gap-3'>
          <AlertCircle className='h-5 w-5 text-red-600 flex-shrink-0' />
          <div className='flex-1'>
            <p className='font-medium text-red-800'>Error loading content</p>
            <p className='text-sm text-red-600'>{error.message}</p>
            {onRetry && retryAttempts < retryCount && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onRetry}
                className="mt-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
              >
                Retry ({retryAttempts + 1}/{retryCount})
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Handle loading state
  if (isLoading) {
    if (loadingFallback) {
      return <>{loadingFallback}</>;
    }

    // Different loading indicators based on variant
    switch (variant) {
      case 'spinner':
        return (
          <div className={cn(
            'flex flex-col items-center justify-center gap-3 p-4',
            fillContainer && 'h-full w-full',
            className
          )}>
            <div className="relative">
              <div className={cn(
                'rounded-full border-2 border-t-transparent animate-spin',
                size === 'sm' && 'h-6 w-6 border-2',
                size === 'md' && 'h-8 w-8 border-3',
                size === 'lg' && 'h-12 w-12 border-4',
              )} style={{ borderTopColor: 'transparent', borderColor: 'var(--pgv-gold)' }} />
            </div>
            {showMessage && loadingMessage && (
              <p className={cn(
                'text-muted-foreground',
                size === 'sm' && 'text-xs',
                size === 'md' && 'text-sm',
                size === 'lg' && 'text-base',
              )}>{loadingMessage}</p>
            )}
          </div>
        );
        
      case 'inline':
        return (
          <span className={cn(
            'inline-flex items-center gap-2',
            className
          )}>
            <div className={cn(
              'rounded-full border-2 border-t-transparent animate-spin',
              size === 'sm' && 'h-3 w-3 border-1',
              size === 'md' && 'h-4 w-4 border-2',
              size === 'lg' && 'h-5 w-5 border-2',
            )} style={{ borderTopColor: 'transparent', borderColor: 'var(--pgv-gold)' }} />
            {showMessage && loadingMessage && (
              <span className={cn(
                'text-muted-foreground',
                size === 'sm' && 'text-xs',
                size === 'md' && 'text-sm',
                size === 'lg' && 'text-base',
              )}>{loadingMessage}</span>
            )}
          </span>
        );
        
      case 'card':
        return (
          <div className={cn('space-y-4', className)}>
            <Skeleton className={cn(
              'h-8 w-3/4',
              size === 'sm' && 'h-6',
              size === 'lg' && 'h-10'
            )} />
            <Skeleton className={cn(
              'h-4 w-full',
              size === 'sm' && 'h-3',
              size === 'lg' && 'h-5'
            )} />
            <Skeleton className={cn(
              'h-32 w-full',
              size === 'sm' && 'h-24',
              size === 'lg' && 'h-40'
            )} />
          </div>
        );
        
      case 'text':
        return (
          <div className={cn('space-y-2', className)}>
            <Skeleton className={cn(
              'h-4 w-full',
              size === 'sm' && 'h-3',
              size === 'lg' && 'h-5'
            )} />
            <Skeleton className={cn(
              'h-4 w-5/6',
              size === 'sm' && 'h-3',
              size === 'lg' && 'h-5'
            )} />
            <Skeleton className={cn(
              'h-4 w-4/6',
              size === 'sm' && 'h-3',
              size === 'lg' && 'h-5'
            )} />
          </div>
        );
        
      case 'image':
        return (
          <Skeleton className={cn(
            'h-48 w-full rounded-md',
            size === 'sm' && 'h-32',
            size === 'lg' && 'h-64',
            className
          )} />
        );
    }
  }

  // Render children when not loading and no error
  return <>{children}</>;
}

/**
 * LoadingOverlay Component
 * 
 * A full-screen loading overlay with spinner and message
 */
export function LoadingOverlay({
  isLoading,
  loadingMessage = 'Loading...',
  showMessage = true,
  size = 'lg',
  className,
}: {
  isLoading: boolean;
  loadingMessage?: string;
  showMessage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  if (!isLoading) return null;
  
  return (
    <div className={cn(
      'fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm',
      className
    )}>
      <LoadingState
        isLoading={true}
        variant="spinner"
        size={size}
        loadingMessage={loadingMessage}
        showMessage={showMessage}
      >
        {null}
      </LoadingState>
    </div>
  );
}

/**
 * GlobalLoadingOverlay Component
 * 
 * A component that connects to the global loading context
 * and displays a full-screen loading overlay when active
 */
export function GlobalLoadingOverlay({ message }: { message?: string }) {
  const { isLoading, loadingMessage } = useLoadingOverlay({ useGlobalOverlay: true });
  
  return (
    <LoadingOverlay
      isLoading={isLoading}
      loadingMessage={message || loadingMessage}
    />
  );
}

// Import at the end to avoid circular dependencies
import { useLoadingOverlay } from '@/hooks/useLoadingOverlay';
