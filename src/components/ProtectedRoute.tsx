import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingState } from '@/components/ui/loading-state';
import { DEV_CONFIG } from '@/lib/config/env';

type ProtectedRouteProps = {
  children: ReactNode;
  requireAdmin?: boolean;
  requiredRole?: string;
};

export default function ProtectedRoute({ 
  children, 
  requireAdmin = false, 
  requiredRole,
}: ProtectedRouteProps) {
  const { user, isLoading, isAdmin, hasRole } = useAuth();
  const location = useLocation();
  
  // Development mode logging
  useEffect(() => {
    if (DEV_CONFIG.AUTH.DEBUG_AUTH) {
      console.log(`[Auth Debug] Protected route accessed: ${location.pathname}`);
      console.log(`[Auth Debug] Auth bypass enabled: ${DEV_CONFIG.AUTH.BYPASS_AUTH}`);
      console.log(`[Auth Debug] User authenticated: ${user ? 'YES' : 'NO'}`);
      if (user) {
        console.log(`[Auth Debug] User ID: ${user.id}`);
        console.log(`[Auth Debug] Is admin: ${isAdmin ? 'YES' : 'NO'}`);
      }
    }
  }, [location.pathname, user, isAdmin]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <LoadingState
        isLoading={true}
        variant="spinner"
        size="lg"
        loadingMessage="Verifying access..."
        fillContainer={true}
      >
        {null}
      </LoadingState>
    );
  }

  // Always allow access in development mode
  if (DEV_CONFIG.AUTH.BYPASS_AUTH) {
    if (DEV_CONFIG.AUTH.DEBUG_AUTH) {
      console.log(`[Auth Debug] Bypassing authentication for protected route: ${location.pathname}`);
    }
    return <>{children}</>;
  }

  // Production authentication flow
  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    // Redirect to home if not an admin
    return <Navigate to="/" replace />;
  }

  if (requiredRole && !hasRole(requiredRole) && !isAdmin) {
    // Redirect to home if user doesn't have the required role
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
