import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FileX, Home, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ContentPageFallbackProps {
  title?: string;
  resetErrorBoundary?: () => void;
}

/**
 * Fallback UI for content pages like StorePage when they encounter errors
 * Provides a user-friendly error message and recovery options
 */
const ContentPageFallback: React.FC<ContentPageFallbackProps> = ({ 
  title = 'Content Temporarily Unavailable',
  resetErrorBoundary 
}) => {
  const handleReload = () => {
    if (resetErrorBoundary) {
      resetErrorBoundary();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-pgv-gold/20 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-pgv-gold-dark to-pgv-gold text-pgv-forest">
          <CardTitle className="flex items-center gap-2">
            <FileX className="h-5 w-5" />
            {title}
          </CardTitle>
          <CardDescription className="text-pgv-forest/80">
            We're having trouble displaying this content
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 pb-2">
          <div className="space-y-4">
            <p className="text-gray-600">
              We apologize for the inconvenience. This page encountered an error while loading.
              Our team has been automatically notified and is working to resolve the issue.
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 text-sm text-blue-700">
              <p>You can try refreshing the page or explore other sections of the platform.</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3 pt-2 pb-6">
          <Button 
            onClick={handleReload}
            className="w-full sm:w-auto bg-pgv-gold hover:bg-pgv-gold-dark text-pgv-forest flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Page
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto border-pgv-forest text-pgv-forest hover:bg-pgv-forest/5">
            <Link to="/">
              <Home className="h-4 w-4 mr-2" />
              Return to Home
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ContentPageFallback;
