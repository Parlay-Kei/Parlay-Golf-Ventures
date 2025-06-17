/**
 * Authentication Service
 * 
 * Centralizes authentication and role management logic for the Parlay Golf Ventures platform.
 * This service handles user roles from multiple sources and provides a unified interface
 * for role-based access control throughout the application.
 */

import { supabase } from '@/lib/supabase';
import { DEV_CONFIG } from '@/lib/config/env';

// Define types for role information
export interface UserRoleInfo {
  roles: string[];        // Roles from the user_roles table
  profileRole?: string;   // Role from the user_profiles table
  isAdmin: boolean;       // Whether the user has admin privileges
  isMentor: boolean;      // Whether the user has mentor privileges
  isContentCreator: boolean; // Whether the user has content creator privileges
  lastFetched?: number;   // Timestamp when the roles were last fetched
}

// Mock role data for development mode
const MOCK_ROLES: UserRoleInfo = {
  roles: ['member', 'beta'],
  profileRole: 'member',
  isAdmin: true,
  isMentor: false,
  isContentCreator: false,
  lastFetched: Date.now()
};

// In-memory cache for role information
const roleCache = new Map<string, UserRoleInfo>();

// Cache expiration time in milliseconds (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000;

/**
 * Fetches all role information for a user from multiple sources
 * 
 * @param userId The user's ID
 * @param forceRefresh Whether to force a refresh of the cache
 * @returns A UserRoleInfo object containing all role information
 */
export async function fetchUserRoleInfo(userId: string, forceRefresh = false): Promise<UserRoleInfo> {
  // In development mode, return mock roles if configured
  if (DEV_CONFIG.AUTH.BYPASS_AUTH) {
    if (DEV_CONFIG.AUTH.DEBUG_AUTH) {
      console.log(`[Auth Debug] Using mock roles for user ${userId} in development mode`);
    }
    return MOCK_ROLES;
  }
  
  // Check cache first if not forcing a refresh
  if (!forceRefresh) {
    const cachedRoles = roleCache.get(userId);
    if (cachedRoles && isRoleCacheValid(cachedRoles)) {
      if (DEV_CONFIG.AUTH.DEBUG_AUTH) {
        console.log(`[Auth Debug] Using cached roles for user ${userId}`);
      }
      return cachedRoles;
    }
  }
  
  try {
    // Fetch roles from both sources in parallel for better performance
    const [rolesResult, profileResult] = await Promise.all([
      fetchRolesFromUserRolesTable(userId),
      fetchRoleFromUserProfile(userId)
    ]);
    
    const roles = rolesResult.roles;
    const profileRole = profileResult.role;
    
    // Determine role flags
    const isAdmin = roles.includes('admin');
    const isMentor = roles.includes('mentor');
    const isContentCreator = roles.includes('creator') || roles.includes('content-creator');
    
    // Create the role info with timestamp
    const roleInfo: UserRoleInfo = {
      roles,
      profileRole,
      isAdmin,
      isMentor,
      isContentCreator,
      lastFetched: Date.now()
    };
    
    // Cache the role info
    roleCache.set(userId, roleInfo);
    
    if (DEV_CONFIG.AUTH.DEBUG_AUTH) {
      console.log(`[Auth Debug] Fetched and cached roles for user ${userId}`);
    }
    
    return roleInfo;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error fetching user role information:', errorMessage);
    // Return default role info (no roles/permissions) on error
    return {
      roles: [],
      profileRole: undefined,
      isAdmin: false,
      isMentor: false,
      isContentCreator: false,
      lastFetched: Date.now()
    };
  }
}

/**
 * Checks if a role cache entry is still valid
 * 
 * @param roleInfo The cached role information
 * @returns Whether the cache entry is still valid
 */
function isRoleCacheValid(roleInfo: UserRoleInfo): boolean {
  if (!roleInfo.lastFetched) return false;
  
  const now = Date.now();
  const age = now - roleInfo.lastFetched;
  
  return age < CACHE_EXPIRATION;
}

/**
 * Clears the role cache for a specific user or all users
 * 
 * @param userId Optional user ID to clear cache for a specific user
 */
export function clearRoleCache(userId?: string): void {
  if (userId) {
    roleCache.delete(userId);
    if (DEV_CONFIG.AUTH.DEBUG_AUTH) {
      console.log(`[Auth Debug] Cleared role cache for user ${userId}`);
    }
  } else {
    roleCache.clear();
    if (DEV_CONFIG.AUTH.DEBUG_AUTH) {
      console.log(`[Auth Debug] Cleared entire role cache`);
    }
  }
}

/**
 * Checks if a user has a specific role
 * 
 * @param roleInfo The user's role information
 * @param role The role to check for
 * @returns Whether the user has the specified role
 */
export function hasRole(roleInfo: UserRoleInfo, role: string): boolean {
  // Admins have access to everything
  if (roleInfo.isAdmin) return true;
  
  // Check for specific roles
  if (role === 'admin') return roleInfo.isAdmin;
  if (role === 'mentor') return roleInfo.isMentor;
  if (role === 'creator' || role === 'content-creator') return roleInfo.isContentCreator;
  
  // Check in roles array
  if (roleInfo.roles.includes(role)) return true;
  
  // Check profile role
  return roleInfo.profileRole === role;
}

/**
 * Gets the user's primary role
 * 
 * @param roleInfo The user's role information
 * @returns The user's primary role
 */
export function getPrimaryRole(roleInfo: UserRoleInfo): string | undefined {
  if (roleInfo.isAdmin) return 'admin';
  if (roleInfo.isMentor) return 'mentor';
  if (roleInfo.isContentCreator) return 'creator';
  return roleInfo.profileRole;
}

/**
 * Helper function to fetch roles from the user_roles table
 * 
 * @param userId The user's ID
 * @returns An object containing the roles array
 */
async function fetchRolesFromUserRolesTable(userId: string): Promise<{ roles: string[] }> {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);
    
    if (error) throw error;
    
    const roles = data?.map(item => item.role) || [];
    return { roles };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error fetching roles from user_roles table:', errorMessage);
    return { roles: [] };
  }
}

/**
 * Helper function to fetch role from the user_profiles table
 * 
 * @param userId The user's ID
 * @returns An object containing the profile role
 */
async function fetchRoleFromUserProfile(userId: string): Promise<{ role?: string }> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      // Don't throw on not found errors, just return undefined role
      if (error.code === 'PGRST116') {
        return { role: undefined };
      }
      throw error;
    }
    
    return { role: data?.role };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error fetching role from user_profiles table:', errorMessage);
    return { role: undefined };
  }
}
