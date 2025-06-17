/**
 * Environment configuration constants
 * 
 * This file centralizes all environment-related constants and flags
 * to ensure consistent behavior across the application.
 */

// Development environment detection
export const IS_DEV_ENV = process.env.NODE_ENV === 'development';

// Development mode configuration
export const DEV_CONFIG = {
  // Authentication bypass settings
  AUTH: {
    // Set to true to bypass authentication in development mode
    BYPASS_AUTH: true, // Changed to true to bypass auth flow
    
    // Set to true to use mock roles instead of fetching from database
    MOCK_ROLES: true, // Keep true to avoid database errors
    
    // Default roles to use when MOCK_ROLES is true
    DEFAULT_ROLES: ['user', 'admin', 'mentor'],
    
    // Default profile role to use when MOCK_ROLES is true
    DEFAULT_PROFILE_ROLE: 'admin',
    
    // Set to true to log authentication debug info
    DEBUG_AUTH: true, // Enable debug logging
  },
  
  // Database settings
  DATABASE: {
    // Set to true to use mock data instead of real database calls
    USE_MOCK_DATA: true, // Keep true to avoid database errors
    
    // Set to true to always use mock data even if database tables exist
    FORCE_MOCK_DATA: true, // Keep true to avoid any database errors
    
    // Set to true to attempt real database calls first, then fall back to mock data
    // When false, mock data will be used exclusively if USE_MOCK_DATA is true
    TRY_LIVE_FIRST: false, // Keep false to avoid database connection attempts
    
    // Set to true to log database operations
    DEBUG_DB: true, // Enable debug logging
  },
  
  // Error monitoring settings
  ERROR_MONITORING: {
    // Set to true to enable error monitoring in development
    ENABLED: true, // Enable error monitoring
    
    // Set to true to log errors to console instead of sending to monitoring service
    LOG_TO_CONSOLE: true,
  },
  
  // Logging settings
  LOGGING: {
    // Set to true to enable verbose logging
    VERBOSE: true, // Enable verbose logging to help diagnose issues
    
    // Set minimum log level in development
    MIN_LEVEL: 'debug',
  },
};

// Production feature flags
export const FEATURES = {
  // Beta features
  BETA: {
    // Set to true to enable beta features
    ENABLED: true,
  },
  
  // SSR features
  SSR: {
    // Set to true to enable server-side rendering
    ENABLED: false, // Disable SSR to avoid hydration issues
    
    // Set to true to disable hydration warnings
    SUPPRESS_WARNINGS: true, // Suppress hydration warnings
  },
};
