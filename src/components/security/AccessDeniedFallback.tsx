/**
 * AccessDeniedFallback Component
 * 
 * This component provides a secure fallback for routes that should be protected
 * but aren't properly wrapped with the ProtectedRoute component.
 * In production, it displays a 403 Forbidden error page.
 * In development, it shows a warning with debugging information.
 */

import React from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { AlertTriangle, ShieldAlert, ArrowLeft } from 'lucide-react';
import { DEV_CONFIG } from '@/lib/config/env';

interface AccessDeniedFallbackProps {
  routePath: string;
  requiredRole?: string;
  requireAdmin?: boolean;
}

const AccessDeniedFallback: React.FC<AccessDeniedFallbackProps> = ({
  routePath,
  requiredRole,
  requireAdmin,
}) => {
  const location = useLocation();
  
  // In development mode, show a warning with debugging information
  if (DEV_CONFIG.AUTH.BYPASS_AUTH) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-amber-50 p-4">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8 border-l-4 border-amber-500">
          <div className="flex items-center mb-6">
            <AlertTriangle className="h-10 w-10 text-amber-500 mr-4" />
            <h1 className="text-2xl font-bold text-gray-800">Protected Route Warning</h1>
          </div>
          
          <div className="space-y-4 mb-6">
            <p className="text-gray-700">
              This route should be protected but isn't properly wrapped with the <code className="bg-gray-100 px-1 py-0.5 rounded">ProtectedRoute</code> component.
            </p>
            
            <div className="bg-gray-100 p-4 rounded-md">
              <h3 className="font-semibold mb-2">Route Details:</h3>
              <ul className="space-y-2 text-sm">
                <li><span className="font-medium">Path:</span> {routePath}</li>
                <li><span className="font-medium">Current Location:</span> {location.pathname}</li>
                {requiredRole && (
                  <li><span className="font-medium">Required Role:</span> {requiredRole}</li>
                )}
                <li><span className="font-medium">Admin Required:</span> {requireAdmin ? 'Yes' : 'No'}</li>
              </ul>
            </div>
            
            <div className="bg-amber-100 p-4 rounded-md">
              <h3 className="font-semibold mb-2">Developer Note:</h3>
              <p className="text-sm">
                In production, this would show a 403 Forbidden error. Please wrap this route with the <code className="bg-amber-200 px-1 py-0.5 rounded">ProtectedRoute</code> component with appropriate role requirements.
              </p>
              <pre className="bg-gray-800 text-white p-3 rounded-md mt-2 text-xs overflow-x-auto">
                {`<Route path="${routePath}" element={
  <ProtectedRoute${requireAdmin ? ' requireAdmin={true}' : ''}${requiredRole ? ` requiredRole="${requiredRole}"` : ''}>
    <YourComponent />
  </ProtectedRoute>
} />`}
              </pre>
            </div>
          </div>
          
          <div className="flex justify-between">
            <Button asChild variant="outline">
              <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" /> Return to Home</Link>
            </Button>
            <Button asChild>
              <Link to="/login">Go to Login</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // In production, show a 403 Forbidden error
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <ShieldAlert className="h-16 w-16 text-red-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">403</h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Access Denied</h2>
        <p className="text-gray-600 mb-8">
          You don't have permission to access this page. Please log in with an account that has the required permissions.
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-3">
          <Button asChild variant="outline">
            <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" /> Return to Home</Link>
          </Button>
          <Button asChild>
            <Link to="/login">Go to Login</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AccessDeniedFallback;
