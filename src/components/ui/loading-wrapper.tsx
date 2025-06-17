import { ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ErrorBoundary } from 'react-error-boundary';

interface LoadingWrapperProps {
  isLoading: boolean;
  error?: Error | null;
  retryAttempts?: number;
  retryCount?: number;
  variant?: 'card' | 'text' | 'image';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children: ReactNode;
  fallback?: ReactNode;
  onRetry?: () => void;
}

export function LoadingWrapper({
  isLoading,
  error,
  retryAttempts = 0,
  retryCount = 3,
  variant = 'card',
  size = 'md',
  className,
  children,
  fallback,
  onRetry
}: LoadingWrapperProps) {
  if (error) {
    return (
      <div className={cn('p-4 rounded-lg border border-red-200 bg-red-50', className)}>
        <div className='flex items-center gap-2 text-red-600'>
          <AlertCircle className='h-5 w-5' />
          <div>
            <p className='font-medium'>Error loading content</p>
            <p className='text-sm'>{error.message}</p>
            {retryAttempts < retryCount && onRetry && (
              <button
                className='mt-2 text-sm text-red-600 hover:text-red-700 underline'
                onClick={onRetry}
              >
                Retry ({retryAttempts + 1}/{retryCount})
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    if (fallback) {
      return <>{fallback}</>;
    }

    switch (variant) {
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
            'aspect-video w-full',
            size === 'sm' && 'aspect-square',
            size === 'lg' && 'aspect-[16/9]'
          )} />
        );
      default:
        return null;
    }
  }

  return <>{children}</>;
}

interface LoadingBoundaryProps {
  isLoading: boolean;
  error?: Error | null;
  retryAttempts?: number;
  retryCount?: number;
  children: ReactNode;
  fallback?: ReactNode;
  onRetry?: () => void;
}

export function LoadingBoundary({
  isLoading,
  error,
  retryAttempts = 0,
  retryCount = 3,
  children,
  fallback,
  onRetry
}: LoadingBoundaryProps) {
  if (error) {
    return (
      <div className='p-4 rounded-lg border border-red-200 bg-red-50'>
        <div className='flex items-center gap-2 text-red-600'>
          <AlertCircle className='h-5 w-5' />
          <div>
            <p className='font-medium'>Error loading content</p>
            <p className='text-sm'>{error.message}</p>
            {retryAttempts < retryCount && onRetry && (
              <button
                className='mt-2 text-sm text-red-600 hover:text-red-700 underline'
                onClick={onRetry}
              >
                Retry ({retryAttempts + 1}/{retryCount})
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <>{fallback || <div className='flex justify-center py-8'>Loading...</div>}</>;
  }

  return <>{children}</>;
}

// If Suspense is used, wrap it with ErrorBoundary for async error handling.
// ... existing code ... 