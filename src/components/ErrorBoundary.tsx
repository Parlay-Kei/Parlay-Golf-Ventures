import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { captureException, setExtraContext } from '@/lib/services/errorMonitoring';
import { ErrorType } from '@/lib/utils/errorHandler';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  routeName?: string; // Name of the route for error reporting
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary Component
 * 
 * A React error boundary that catches errors in its child component tree,
 * logs them to Sentry, and displays a fallback UI.
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Set additional context for better error analysis
    setExtraContext('component', this.props.routeName || 'unknown');
    setExtraContext('react-stack', errorInfo.componentStack);
    
    // Capture the error in Sentry
    captureException(error, {
      type: ErrorType.UNKNOWN,
      componentStack: errorInfo.componentStack,
      routeName: this.props.routeName,
      location: window.location.href,
      timestamp: new Date().toISOString()
    });
    
    // Update state with error details
    this.setState({
      errorInfo
    });
    
    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by ErrorBoundary:', error);
      console.error('Component stack:', errorInfo.componentStack);
    }
  }

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Default fallback UI
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
          <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-pgv-forest mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-6">
              We're sorry, but an error occurred while rendering this page. Our team has been notified.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={this.handleReload}
                className="bg-pgv-gold hover:bg-pgv-gold-dark text-pgv-forest"
              >
                Reload Page
              </Button>
              <Button asChild variant="outline">
                <Link to="/">Return to Home</Link>
              </Button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-6 p-4 bg-red-50 rounded text-left overflow-auto max-h-[300px]">
                <p className="font-mono text-sm text-red-800 mb-2">{this.state.error.toString()}</p>
                {this.state.errorInfo && (
                  <pre className="font-mono text-xs text-red-700 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    // When there's no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
