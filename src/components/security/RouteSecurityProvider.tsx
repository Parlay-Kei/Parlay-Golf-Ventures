/**
 * RouteSecurityProvider Component
 * 
 * This component provides a security layer for the entire application,
 * enforcing route protection in production by checking if routes that
 * should be protected are properly wrapped with the ProtectedRoute component.
 */

import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRoles } from '@/hooks/useRoles';
import AccessDeniedFallback from './AccessDeniedFallback';
import { DEV_CONFIG } from '@/lib/config/env';

// Define protected route patterns and their requirements
const PROTECTED_ROUTES = [
  // Admin routes
  { pattern: /^\/admin\/dashboard/i, requireAdmin: true },
  { pattern: /^\/admin\/error-monitoring/i, requireAdmin: true },
  { pattern: /^\/admin\/beta-invites/i, requireAdmin: true },
  { pattern: /^\/admin\/academy/i, requireAdmin: true },
  
  // User-specific routes
  { pattern: /^\/dashboard/i, requiredRole: 'member' },
  { pattern: /^\/profile/i, requiredRole: 'member' },
  { pattern: /^\/billing/i, requiredRole: 'member' },
  
  // Academy routes
  { pattern: /^\/academy\/dashboard/i, requiredRole: 'academy-member' },
  { pattern: /^\/academy\/schedule-review/i, requiredRole: 'academy-member' },
  
  // Upload route
  { pattern: /^\/upload/i, requiredRole: 'student' },
  
  // Tournament route
  { pattern: /^\/tournament/i, requiredRole: 'tournament-participant' },
  
  // Contribution routes
  { pattern: /^\/contribute\/?$/i, requiredRole: 'content-creator' },
  { pattern: /^\/contribute\/.+/i, requiredRole: 'content-reviewer' },
  
  // Beta routes
  { pattern: /^\/beta\/.+/i, requiredRole: 'beta' },
  
  // Performance demo route
  { pattern: /^\/performance-demo/i, requireAdmin: true },
];

// Public routes that should never be blocked
const PUBLIC_ROUTES = [
  /^\/$/i,                     // Home
  /^\/login/i,                 // Login
  /^\/signup/i,                // Signup
  /^\/join-community/i,        // Join community
  /^\/join-free/i,             // Join free
  /^\/membership$/i,           // Membership info
  /^\/coming-soon/i,           // Coming soon pages
  /^\/community/i,             // Community
  /^\/search/i,                // Search
  /^\/news/i,                  // News
  /^\/request-password-reset/i, // Password reset request
  /^\/reset-password/i,        // Password reset
  /^\/verify-email/i,          // Email verification
  /^\/academy$/i,              // Academy home
  /^\/academy\/short-game-secrets/i, // Academy content
];

interface RouteSecurityProviderProps {
  children: React.ReactNode;
}

const RouteSecurityProvider: React.FC<RouteSecurityProviderProps> = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();
  const { hasRole, isAdmin, isLoadingRoles } = useRoles();
  const [securityViolation, setSecurityViolation] = useState<{
    routePath: string;
    requiredRole?: string;
    requireAdmin?: boolean;
  } | null>(null);
  
  useEffect(() => {
    // Skip security checks in development mode if bypass is enabled
    if (DEV_CONFIG.AUTH.BYPASS_AUTH) {
      setSecurityViolation(null);
      return;
    }
    
    // Check if the current route should be protected
    const currentPath = location.pathname;
    
    // Skip check for public routes
    const isPublicRoute = PUBLIC_ROUTES.some(pattern => pattern.test(currentPath));
    if (isPublicRoute) {
      setSecurityViolation(null);
      return;
    }
    
    // Find matching protected route pattern
    const matchedRoute = PROTECTED_ROUTES.find(route => route.pattern.test(currentPath));
    
    if (matchedRoute) {
      // If roles are still loading, don't make a decision yet
      if (isLoadingRoles) {
        return;
      }
      
      // This route should be protected, check if user has appropriate access
      const hasAccess = user && (
        (matchedRoute.requireAdmin && isAdmin()) ||
        (matchedRoute.requiredRole && hasRole(matchedRoute.requiredRole))
      );
      
      if (!hasAccess) {
        // Security violation detected - route should be protected but user doesn't have access
        setSecurityViolation({
          routePath: currentPath,
          requiredRole: matchedRoute.requiredRole,
          requireAdmin: matchedRoute.requireAdmin,
        });
        return;
      }
    }
    
    // No security violation
    setSecurityViolation(null);
  }, [location.pathname, user, hasRole, isAdmin, isLoadingRoles]);
  
  // If there's a security violation, show the access denied fallback
  if (securityViolation) {
    return (
      <AccessDeniedFallback
        routePath={securityViolation.routePath}
        requiredRole={securityViolation.requiredRole}
        requireAdmin={securityViolation.requireAdmin}
      />
    );
  }
  
  // No security violation, render children
  return <>{children}</>;
};

export default RouteSecurityProvider;
