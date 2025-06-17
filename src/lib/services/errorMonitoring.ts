/**
 * Error Monitoring Service
 * 
 * This service initializes and configures Sentry for error monitoring.
 * It provides methods for tracking errors and setting user context.
 */

import * as Sentry from '@sentry/browser';

/**
 * Initialize the error monitoring service
 */
export const initializeErrorMonitoring = () => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  
  if (!dsn) {
    console.warn('Sentry DSN not provided. Error monitoring will not be enabled.');
    return;
  }
  
  Sentry.init({
    dsn,
    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
    environment: import.meta.env.MODE || 'development',
    release: import.meta.env.VITE_APP_VERSION || '1.0.0',
    // Don't send personally identifiable information by default
    sendDefaultPii: false
  });
  
  console.log(`Error monitoring initialized in ${import.meta.env.MODE || 'development'} environment`);
};

/**
 * Set user information for error context
 * @param user User information
 */
export const setUserContext = (user: { id: string; email?: string; role?: string }) => {
  if (!user) return;
  
  Sentry.setUser({
    id: user.id,
    // Only include email if explicitly enabled for PII
    ...(import.meta.env.VITE_ENABLE_PII_TRACKING === 'true' && user.email ? { email: user.email } : {}),
    role: user.role || 'user'
  });
};

/**
 * Clear user context when logging out
 */
export const clearUserContext = () => {
  Sentry.setUser(null);
};

/**
 * Manually capture an exception
 * @param error Error object
 * @param context Additional context information
 */
export const captureException = (error: Error, context?: Record<string, unknown>) => {
  Sentry.captureException(error, {
    extra: context
  });
};

/**
 * Set extra context information for the current scope
 * @param key Context key
 * @param value Context value
 */
export const setExtraContext = (key: string, value: unknown) => {
  Sentry.setExtra(key, value);
};

/**
 * Add breadcrumb to track user actions
 * @param message Breadcrumb message
 * @param category Breadcrumb category
 * @param data Additional data
 */
export const addBreadcrumb = (message: string, category?: string, data?: Record<string, unknown>) => {
  Sentry.addBreadcrumb({
    message,
    category: category || 'user-action',
    data
  });
};
