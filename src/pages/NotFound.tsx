import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileX, Home } from 'lucide-react';
import { captureException } from '@/lib/services/errorMonitoring';
import ErrorBoundary from '@/components/ErrorBoundary';
import { ContentPageFallback } from '@/components/fallbacks';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import withErrorBoundary from '@/components/withErrorBoundary';

const NotFoundContent: React.FC = () => {
  useEffect(() => {
    // Report 404 error to Sentry with page information
    captureException(new Error('404 Page Not Found'), {
      tags: {
        errorType: '404',
        location: window.location.pathname
      },
      extra: {
        referrer: document.referrer,
        userAgent: navigator.userAgent
      }
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="text-center max-w-md">
        <div className="bg-pgv-forest text-white p-4 rounded-t-lg">
          <FileX className="h-12 w-12 mx-auto mb-2" />
          <h1 className="text-3xl font-bold">Page Not Found</h1>
          <p className="text-white/80">We couldn't find the page you were looking for</p>
        </div>
        
        <div className="bg-white p-6 rounded-b-lg shadow-md border border-gray-200 border-t-0">
          <p className="text-gray-600 mb-6">
            The page you requested does not exist or may have been moved. 
            Please check the URL or return to the homepage.
          </p>
          
          <Button asChild className="bg-pgv-forest hover:bg-pgv-forest-dark w-full mb-2">
            <Link to="/">
              <Home className="h-4 w-4 mr-2" />
              Return to Homepage
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <ErrorBoundary 
        routeName="not-found" 
        fallback={<ContentPageFallback title="Navigation Error" />}
      >
        <NotFoundContent />
      </ErrorBoundary>
      <Footer />
    </div>
  );
};

export default withErrorBoundary(NotFound, 'not-found');
