import React from 'react';
import ErrorBoundary from './ErrorBoundary';

/**
 * Higher-order component that wraps a component with an ErrorBoundary
 * @param Component The component to wrap
 * @param routeName Name of the route for error reporting
 * @param fallback Optional custom fallback UI
 * @returns The wrapped component with error boundary
 */
const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  routeName?: string,
  fallback?: React.ReactNode
) => {
  const WithErrorBoundary = (props: P) => {
    return (
      <ErrorBoundary routeName={routeName} fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };

  // Set display name for better debugging
  const displayName = Component.displayName || Component.name || 'Component';
  WithErrorBoundary.displayName = `WithErrorBoundary(${displayName})`;

  return WithErrorBoundary;
};

export default withErrorBoundary;
