/**
 * useRoles Hook
 * 
 * A custom hook that provides a unified interface for checking, caching, and handling fallback logic
 * for user roles. This hook builds on the existing role management system while providing a more
 * convenient API for use throughout the application.
 */

import { useAuth } from '@/contexts/AuthContext';
import { useCallback, useMemo } from 'react';
import { DEV_CONFIG } from '@/lib/config/env';

export type RoleCheckResult = {
  hasRole: boolean;
  isLoading: boolean;
  error: Error | null;
  source: 'cache' | 'live' | 'mock';
};

export type RoleOptions = {
  /** Force a refresh of role data from the database */
  forceRefresh?: boolean;
  /** Allow mock roles in development mode */
  allowMockRoles?: boolean;
  /** Custom fallback roles to use if no roles are found */
  fallbackRoles?: string[];
  /** Whether to throw errors instead of handling them gracefully */
  throwErrors?: boolean;
};

/**
 * Hook for checking user roles with caching and fallback logic
 */
export function useRoles() {
  const { 
    user, 
    hasRole: authHasRole, 
    isAdmin: authIsAdmin,
    refreshUserRoles,
    userRoles,
    isLoadingRoles,
    roleError
  } = useAuth();

  /**
   * Check if the current user has a specific role
   * 
   * @param role The role to check for
   * @param options Options for role checking
   * @returns An object containing the result of the role check
   */
  const checkRole = useCallback((role: string, options: RoleOptions = {}): RoleCheckResult => {
    const {
      forceRefresh = false,
      allowMockRoles = true,
      fallbackRoles = [],
      throwErrors = false
    } = options;
    
    // If force refresh is requested, trigger a refresh
    if (forceRefresh && user) {
      refreshUserRoles();
    }
    
    // Check for development mode and mock roles
    if (DEV_CONFIG.AUTH.BYPASS_AUTH && allowMockRoles) {
      const mockRoles = DEV_CONFIG.AUTH.MOCK_ROLES || [];
      const hasMockRole = mockRoles.includes(role);
      
      if (DEV_CONFIG.AUTH.DEBUG_AUTH) {
        console.log(`[Auth Debug] Using mock roles: ${mockRoles.join(', ')}`);
        console.log(`[Auth Debug] User ${hasMockRole ? 'has' : 'does not have'} mock role: ${role}`);
      }
      
      return {
        hasRole: hasMockRole,
        isLoading: false,
        error: null,
        source: 'mock'
      };
    }
    
    // Check for errors
    if (roleError) {
      if (throwErrors) {
        throw roleError;
      }
      
      // If we have fallback roles, use them
      if (fallbackRoles.length > 0) {
        const hasFallbackRole = fallbackRoles.includes(role);
        
        if (DEV_CONFIG.AUTH.DEBUG_AUTH) {
          console.log(`[Auth Debug] Using fallback roles due to error: ${fallbackRoles.join(', ')}`);
          console.log(`[Auth Debug] User ${hasFallbackRole ? 'has' : 'does not have'} fallback role: ${role}`);
        }
        
        return {
          hasRole: hasFallbackRole,
          isLoading: false,
          error: roleError,
          source: 'mock'
        };
      }
      
      return {
        hasRole: false,
        isLoading: false,
        error: roleError,
        source: 'live'
      };
    }
    
    // If roles are still loading, return loading state
    if (isLoadingRoles) {
      return {
        hasRole: false,
        isLoading: true,
        error: null,
        source: 'live'
      };
    }
    
    // Use the existing hasRole function from AuthContext
    const hasSpecificRole = authHasRole(role);
    
    if (DEV_CONFIG.AUTH.DEBUG_AUTH) {
      console.log(`[Auth Debug] User ${hasSpecificRole ? 'has' : 'does not have'} role: ${role}`);
      console.log(`[Auth Debug] Available roles: ${userRoles?.join(', ') || 'none'}`);
    }
    
    return {
      hasRole: hasSpecificRole,
      isLoading: false,
      error: null,
      source: 'cache'
    };
  }, [user, authHasRole, refreshUserRoles, userRoles, isLoadingRoles, roleError]);
  
  /**
   * Check if the current user has admin privileges
   * 
   * @param options Options for role checking
   * @returns An object containing the result of the admin check
   */
  const checkAdmin = useCallback((options: RoleOptions = {}): RoleCheckResult => {
    const {
      forceRefresh = false,
      allowMockRoles = true,
      throwErrors = false
    } = options;
    
    // If force refresh is requested, trigger a refresh
    if (forceRefresh && user) {
      refreshUserRoles();
    }
    
    // Check for development mode and mock admin
    if (DEV_CONFIG.AUTH.BYPASS_AUTH && allowMockRoles) {
      const isMockAdmin = DEV_CONFIG.AUTH.MOCK_ADMIN || false;
      
      if (DEV_CONFIG.AUTH.DEBUG_AUTH) {
        console.log(`[Auth Debug] Using mock admin status: ${isMockAdmin}`);
      }
      
      return {
        hasRole: isMockAdmin,
        isLoading: false,
        error: null,
        source: 'mock'
      };
    }
    
    // Check for errors
    if (roleError) {
      if (throwErrors) {
        throw roleError;
      }
      
      return {
        hasRole: false,
        isLoading: false,
        error: roleError,
        source: 'live'
      };
    }
    
    // If roles are still loading, return loading state
    if (isLoadingRoles) {
      return {
        hasRole: false,
        isLoading: true,
        error: null,
        source: 'live'
      };
    }
    
    // Use the existing isAdmin value from AuthContext
    if (DEV_CONFIG.AUTH.DEBUG_AUTH) {
      console.log(`[Auth Debug] User ${authIsAdmin ? 'is' : 'is not'} an admin`);
    }
    
    return {
      hasRole: authIsAdmin,
      isLoading: false,
      error: null,
      source: 'cache'
    };
  }, [user, authIsAdmin, refreshUserRoles, isLoadingRoles, roleError]);
  
  /**
   * Check if the current user has any of the specified roles
   * 
   * @param roles Array of roles to check for
   * @param options Options for role checking
   * @returns An object containing the result of the role check
   */
  const checkAnyRole = useCallback((roles: string[], options: RoleOptions = {}): RoleCheckResult => {
    if (roles.length === 0) {
      return {
        hasRole: false,
        isLoading: false,
        error: new Error('No roles specified for checkAnyRole'),
        source: 'mock'
      };
    }
    
    // Check each role
    for (const role of roles) {
      const result = checkRole(role, options);
      
      // If loading, return loading state
      if (result.isLoading) {
        return result;
      }
      
      // If has role, return true
      if (result.hasRole) {
        return result;
      }
    }
    
    // If no roles match, return false
    return {
      hasRole: false,
      isLoading: false,
      error: null,
      source: 'cache'
    };
  }, [checkRole]);
  
  /**
   * Check if the current user has all of the specified roles
   * 
   * @param roles Array of roles to check for
   * @param options Options for role checking
   * @returns An object containing the result of the role check
   */
  const checkAllRoles = useCallback((roles: string[], options: RoleOptions = {}): RoleCheckResult => {
    if (roles.length === 0) {
      return {
        hasRole: false,
        isLoading: false,
        error: new Error('No roles specified for checkAllRoles'),
        source: 'mock'
      };
    }
    
    let isLoading = false;
    
    // Check each role
    for (const role of roles) {
      const result = checkRole(role, options);
      
      // If loading, mark as loading but continue checking
      if (result.isLoading) {
        isLoading = true;
        continue;
      }
      
      // If doesn't have role, return false immediately
      if (!result.hasRole) {
        return result;
      }
    }
    
    // If any role check is still loading, return loading state
    if (isLoading) {
      return {
        hasRole: false,
        isLoading: true,
        error: null,
        source: 'live'
      };
    }
    
    // If all roles match, return true
    return {
      hasRole: true,
      isLoading: false,
      error: null,
      source: 'cache'
    };
  }, [checkRole]);
  
  /**
   * Force a refresh of all role data
   */
  const refreshRoles = useCallback(() => {
    if (user) {
      if (DEV_CONFIG.AUTH.DEBUG_AUTH) {
        console.log('[Auth Debug] Forcing refresh of user roles');
      }
      refreshUserRoles();
    } else {
      if (DEV_CONFIG.AUTH.DEBUG_AUTH) {
        console.log('[Auth Debug] Cannot refresh roles - no user logged in');
      }
    }
  }, [user, refreshUserRoles]);
  
  return useMemo(() => ({
    // Core role checking functions
    checkRole,
    checkAdmin,
    checkAnyRole,
    checkAllRoles,
    
    // Convenience methods that return just the boolean result
    hasRole: (role: string, options?: RoleOptions) => checkRole(role, options).hasRole,
    isAdmin: (options?: RoleOptions) => checkAdmin(options).hasRole,
    hasAnyRole: (roles: string[], options?: RoleOptions) => checkAnyRole(roles, options).hasRole,
    hasAllRoles: (roles: string[], options?: RoleOptions) => checkAllRoles(roles, options).hasRole,
    
    // Role management
    refreshRoles,
    
    // Role data
    roles: userRoles || [],
    isLoadingRoles,
    roleError,
    
    // User data
    user,
    isAuthenticated: !!user,
  }), [
    checkRole,
    checkAdmin,
    checkAnyRole,
    checkAllRoles,
    refreshRoles,
    userRoles,
    isLoadingRoles,
    roleError,
    user
  ]);
}
