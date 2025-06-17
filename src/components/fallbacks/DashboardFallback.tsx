import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Fallback UI for Dashboard components when they encounter errors
 * Provides a user-friendly error message and recovery options
 */
const DashboardFallback: React.FC = () => {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-pgv-gold/20 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-pgv-forest to-pgv-forest-dark text-white">
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Dashboard Temporarily Unavailable
          </CardTitle>
          <CardDescription className="text-white/80">
            We're experiencing a technical issue with this dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 pb-2">
          <div className="space-y-4">
            <p className="text-gray-600">
              Our team has been notified of this issue and is working to resolve it. 
              In the meantime, you can try refreshing the page or explore other sections of the platform.
            </p>
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 text-sm text-amber-700">
              <p className="font-medium">Your data is safe</p>
              <p>This is just a temporary display issue and does not affect your account or data.</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3 pt-2 pb-6">
          <Button 
            onClick={handleReload}
            className="w-full sm:w-auto bg-pgv-forest hover:bg-pgv-forest-dark flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Reload Dashboard
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto border-pgv-forest text-pgv-forest hover:bg-pgv-forest/5">
            <Link to="/">Return to Home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DashboardFallback;
