/**
 * RoleBasedFeature Component
 * 
 * This component demonstrates how to use the useRoles hook to conditionally
 * render content based on user roles with proper loading states, error handling,
 * and fallback logic.
 */

import React from 'react';
import { useRoles } from '@/hooks/useRoles';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, CheckCircle, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DEV_CONFIG } from '@/lib/config/env';

interface RoleBasedFeatureProps {
  title: string;
  description: string;
  requiredRole?: string;
  requireAdmin?: boolean;
  fallbackRoles?: string[];
  children: React.ReactNode;
}

/**
 * A component that conditionally renders content based on user roles
 * with proper loading states, error handling, and fallback logic.
 */
const RoleBasedFeature: React.FC<RoleBasedFeatureProps> = ({
  title,
  description,
  requiredRole,
  requireAdmin = false,
  fallbackRoles = [],
  children
}) => {
  // Use the useRoles hook to check if the user has the required role
  const { 
    checkRole, 
    checkAdmin,
    isAuthenticated,
    refreshRoles,
    roles
  } = useRoles();
  
  // Determine if the user has access to this feature
  let accessResult = { hasRole: false, isLoading: false, error: null, source: '' as 'cache' | 'live' | 'mock' };
  
  if (requireAdmin) {
    accessResult = checkAdmin({ fallbackRoles });
  } else if (requiredRole) {
    accessResult = checkRole(requiredRole, { fallbackRoles });
  } else {
    // If no role is required, everyone has access
    accessResult = { hasRole: true, isLoading: false, error: null, source: 'cache' };
  }
  
  const { hasRole, isLoading, error, source } = accessResult;
  
  // If the user is not authenticated, show a login prompt
  if (!isAuthenticated) {
    return (
      <Card className="w-full shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-500" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="warning" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authentication Required</AlertTitle>
            <AlertDescription>
              You need to be logged in to access this feature.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <Button asChild variant="default">
            <a href="/login">Log In</a>
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  // If roles are still loading, show a loading state
  if (isLoading) {
    return (
      <Card className="w-full shadow-md">
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-3/4" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-full" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-24" />
        </CardFooter>
      </Card>
    );
  }
  
  // If there was an error checking roles
  if (error && !hasRole) {
    return (
      <Card className="w-full shadow-md border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Checking Permissions</AlertTitle>
            <AlertDescription>
              {error.message || 'There was an error checking your permissions.'}
              {DEV_CONFIG.AUTH.DEBUG_AUTH && (
                <div className="mt-2 text-xs bg-red-50 p-2 rounded">
                  <p className="font-semibold">Developer Info:</p>
                  <pre className="whitespace-pre-wrap">{error.stack}</pre>
                </div>
              )}
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => refreshRoles()}>
            Retry
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  // If the user doesn't have the required role
  if (!hasRole) {
    return (
      <Card className="w-full shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-500" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="warning" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Access Restricted</AlertTitle>
            <AlertDescription>
              {requireAdmin
                ? 'You need administrator privileges to access this feature.'
                : `You need the ${requiredRole} role to access this feature.`}
              
              {DEV_CONFIG.AUTH.DEBUG_AUTH && (
                <div className="mt-2 text-xs bg-amber-50 p-2 rounded">
                  <p className="font-semibold">Developer Info:</p>
                  <p>Current roles: {roles.length ? roles.join(', ') : 'none'}</p>
                  <p>Required role: {requireAdmin ? 'admin' : requiredRole}</p>
                  <p>Source: {source}</p>
                </div>
              )}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
  
  // If the user has the required role, show the content
  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-green-500" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {source === 'mock' && DEV_CONFIG.AUTH.DEBUG_AUTH && (
          <Alert variant="default" className="mb-4 bg-blue-50 border-blue-200">
            <CheckCircle className="h-4 w-4 text-blue-500" />
            <AlertTitle>Development Mode</AlertTitle>
            <AlertDescription>
              You're seeing this content because you're in development mode with mock roles.
              In production, this would require the {requireAdmin ? 'admin' : requiredRole} role.
            </AlertDescription>
          </Alert>
        )}
        {children}
      </CardContent>
    </Card>
  );
};

export default RoleBasedFeature;
