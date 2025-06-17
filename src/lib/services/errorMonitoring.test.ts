import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as Sentry from '@sentry/browser';
import {
  initializeErrorMonitoring,
  setUserContext,
  clearUserContext,
  captureException,
  setExtraContext,
  addBreadcrumb
} from './errorMonitoring';

// Mock Sentry
vi.mock('@sentry/browser', () => ({
  init: vi.fn(),
  setUser: vi.fn(),
  captureException: vi.fn(),
  setExtra: vi.fn(),
  addBreadcrumb: vi.fn(),
}));

describe('Error Monitoring Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console methods to prevent test output noise
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    // Reset environment variables before each test
    vi.stubEnv('VITE_SENTRY_DSN', '');
    vi.stubEnv('VITE_ENABLE_PII_TRACKING', 'false');
    vi.stubEnv('MODE', 'test');
    vi.stubEnv('VITE_APP_VERSION', '0.1.0-beta');
  });
  
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('initializeErrorMonitoring', () => {
    it('should initialize Sentry with the correct configuration when DSN is provided', () => {
      // Set environment variables for this test
      vi.stubEnv('VITE_SENTRY_DSN', 'https://test-dsn@sentry.io/123456');
      vi.stubEnv('MODE', 'production');
      vi.stubEnv('VITE_APP_VERSION', '1.2.3');
      
      initializeErrorMonitoring();
      
      expect(Sentry.init).toHaveBeenCalledWith({
        dsn: 'https://test-dsn@sentry.io/123456',
        tracesSampleRate: 1.0,
        environment: 'production',
        release: '1.2.3',
        sendDefaultPii: false
      });
      expect(console.log).toHaveBeenCalledWith('Error monitoring initialized in production environment');
    });
    
    it('should not initialize Sentry when DSN is not provided', () => {
      // Ensure DSN is empty
      vi.stubEnv('VITE_SENTRY_DSN', '');
      
      initializeErrorMonitoring();
      
      expect(Sentry.init).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith('Sentry DSN not provided. Error monitoring will not be enabled.');
    });
  });

  describe('setUserContext', () => {
    it('should set user context with ID and role but without email when PII tracking is disabled', () => {
      // Ensure PII tracking is disabled
      vi.stubEnv('VITE_ENABLE_PII_TRACKING', 'false');
      
      const user = { id: 'user-123', email: 'user@example.com', role: 'admin' };
      setUserContext(user);
      
      expect(Sentry.setUser).toHaveBeenCalledWith({
        id: 'user-123',
        role: 'admin'
      });
    });
    
    it('should include email in user context when PII tracking is enabled', () => {
      // Enable PII tracking
      vi.stubEnv('VITE_ENABLE_PII_TRACKING', 'true');
      
      const user = { id: 'user-123', email: 'user@example.com', role: 'admin' };
      setUserContext(user);
      
      expect(Sentry.setUser).toHaveBeenCalledWith({
        id: 'user-123',
        email: 'user@example.com',
        role: 'admin'
      });
    });
    
    it('should use default role when not provided', () => {
      const user = { id: 'user-123' };
      setUserContext(user);
      
      expect(Sentry.setUser).toHaveBeenCalledWith({
        id: 'user-123',
        role: 'user'
      });
    });
    
    it('should not set user context when user is null', () => {
      setUserContext(null as unknown as UserContextType);
      
      expect(Sentry.setUser).not.toHaveBeenCalled();
    });
  });

  describe('clearUserContext', () => {
    it('should clear user context', () => {
      clearUserContext();
      
      expect(Sentry.setUser).toHaveBeenCalledWith(null);
    });
  });

  describe('captureException', () => {
    it('should capture exception with additional context', () => {
      const error = new Error('Test error');
      const context = { component: 'TestComponent', action: 'submit' };
      
      captureException(error, context);
      
      expect(Sentry.captureException).toHaveBeenCalledWith(error, {
        extra: context
      });
    });
    
    it('should capture exception without context', () => {
      const error = new Error('Test error');
      
      captureException(error);
      
      expect(Sentry.captureException).toHaveBeenCalledWith(error, {
        extra: undefined
      });
    });
  });

  describe('setExtraContext', () => {
    it('should set extra context information', () => {
      setExtraContext('component', 'LoginForm');
      
      expect(Sentry.setExtra).toHaveBeenCalledWith('component', 'LoginForm');
    });
  });

  describe('addBreadcrumb', () => {
    it('should add breadcrumb with default category when not provided', () => {
      addBreadcrumb('User clicked login button');
      
      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        message: 'User clicked login button',
        category: 'user-action',
        data: undefined
      });
    });
    
    it('should add breadcrumb with custom category and data', () => {
      const data = { buttonId: 'login-btn', timestamp: Date.now() };
      
      addBreadcrumb('User clicked login button', 'ui.interaction', data);
      
      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        message: 'User clicked login button',
        category: 'ui.interaction',
        data
      });
    });
  });
});
