import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { captureException } from '@/lib/services/errorMonitoring';

interface AdminToolsFallbackProps {
  error?: Error;
  resetErrorBoundary?: () => void;
}

/**
 * Specialized fallback UI for Admin Tools when they encounter errors
 * Provides admin-specific error information and recovery options
 */
const AdminToolsFallback: React.FC<AdminToolsFallbackProps> = ({ error, resetErrorBoundary }) => {
  const handleReload = () => {
    if (resetErrorBoundary) {
      resetErrorBoundary();
    } else {
      window.location.reload();
    }
  };

  const handleReportIssue = () => {
    // Capture the error in Sentry with additional context
    if (error) {
      captureException(error, {
        component: 'AdminTools',
        location: window.location.href,
        timestamp: new Date().toISOString(),
        userAction: 'Manually reported from AdminToolsFallback'
      });
    }
    
    // Show confirmation to admin
    alert('This issue has been reported to the development team.');
  };

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-red-200 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-pgv-rust to-pgv-rust/90 text-white">
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5" />
            Admin Tool Error
          </CardTitle>
          <CardDescription className="text-white/80">
            An error occurred in the admin interface
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 pb-2">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-gray-700">
                This admin tool encountered an error. The development team has been automatically notified.
              </p>
            </div>
            
            {error && process.env.NODE_ENV === 'development' && (
              <div className="bg-gray-50 border border-gray-200 rounded p-3 overflow-auto max-h-[150px] text-xs font-mono">
                <p className="font-semibold text-red-600">{error.name}: {error.message}</p>
                <p className="text-gray-700 mt-1">{error.stack}</p>
              </div>
            )}
            
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 text-sm text-blue-700">
              <p className="font-medium">Administrator Options</p>
              <p>You can try reloading the tool, return to the admin dashboard, or manually report this issue.</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-3 pt-2 pb-6">
          <Button 
            onClick={handleReload}
            className="bg-pgv-forest hover:bg-pgv-forest-dark flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Reload Tool
          </Button>
          <Button 
            onClick={handleReportIssue}
            variant="outline" 
            className="border-pgv-rust text-pgv-rust hover:bg-pgv-rust/5"
          >
            Report Issue
          </Button>
          <Button asChild variant="ghost" className="w-full sm:w-auto text-gray-600 hover:text-gray-900">
            <Link to="/admin/dashboard">Return to Admin Dashboard</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminToolsFallback;
