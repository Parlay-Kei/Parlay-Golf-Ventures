/**
 * Real User Monitoring (RUM)
 * 
 * This module implements real user monitoring to collect performance metrics
 * from actual users of the Parlay Golf Ventures platform.
 */

import { captureException } from '@/lib/services/errorMonitoring';
import { performanceMonitoring } from '@/lib/services/performanceMonitoring';

// Configuration
interface RUMConfig {
  enabled: boolean;
  sampleRate: number; // 0-1, percentage of sessions to monitor
  reportingEndpoint: string;
  applicationId: string;
  environment: string;
}

const defaultConfig: RUMConfig = {
  enabled: import.meta.env.MODE === 'production',
  sampleRate: 0.1, // Monitor 10% of sessions by default
  reportingEndpoint: import.meta.env.VITE_RUM_ENDPOINT || 'https://rum-api.parlayventures.com/collect',
  applicationId: 'pgv-web',
  environment: import.meta.env.MODE || 'development',
};

// Session and user information
interface UserInfo {
  id?: string;
  username?: string;
  email?: string;
  role?: string;
}

class RealUserMonitoring {
  private config: RUMConfig;
  private sessionId: string;
  private pageLoadTimestamp: number;
  private isMonitoring: boolean;
  private userInfo: UserInfo = {};
  private navigationEntries: PerformanceNavigationTiming[] = [];
  private resourceEntries: PerformanceResourceTiming[] = [];
  private interactionEvents: Array<{ name: string; startTime: number; duration: number }> = [];
  private errorEvents: Array<{ message: string; source: string; timestamp: number }> = [];

  constructor(config: Partial<RUMConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.sessionId = this.generateSessionId();
    this.pageLoadTimestamp = Date.now();
    
    // Determine if this session should be monitored based on sample rate
    this.isMonitoring = this.config.enabled && Math.random() < this.config.sampleRate;
    
    if (this.isMonitoring) {
      this.initializeMonitoring();
    }
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  /**
   * Initialize monitoring
   */
  private initializeMonitoring(): void {
    try {
      console.log('[RUM] Initializing real user monitoring');
      
      // Monitor page navigation events
      this.monitorNavigation();
      
      // Monitor user interactions
      this.monitorUserInteractions();
      
      // Monitor errors
      this.monitorErrors();
      
      // Monitor resource loading
      this.monitorResources();
      
      // Monitor web vitals
      this.monitorWebVitals();
      
      // Set up periodic reporting
      this.setupPeriodicReporting();
      
      // Report on page unload
      window.addEventListener('beforeunload', () => {
        this.reportRUMData();
      });
      
      // Report initial page load after a short delay
      setTimeout(() => {
        this.collectNavigationTiming();
        this.reportRUMData();
      }, 3000);
    } catch (error) {
      captureException(error, { context: 'RUM.initializeMonitoring' });
      console.error('[RUM] Failed to initialize monitoring:', error);
    }
  }

  /**
   * Monitor page navigation events
   */
  private monitorNavigation(): void {
    try {
      // Listen for route changes in single-page applications
      const originalPushState = history.pushState;
      const originalReplaceState = history.replaceState;
      
      // Override pushState
      history.pushState = (...args) => {
        originalPushState.apply(history, args);
        this.handleRouteChange();
      };
      
      // Override replaceState
      history.replaceState = (...args) => {
        originalReplaceState.apply(history, args);
        this.handleRouteChange();
      };
      
      // Listen for popstate events (back/forward navigation)
      window.addEventListener('popstate', () => {
        this.handleRouteChange();
      });
    } catch (error) {
      captureException(error, { context: 'RUM.monitorNavigation' });
      console.error('[RUM] Failed to set up navigation monitoring:', error);
    }
  }

  /**
   * Handle route changes in single-page applications
   */
  private handleRouteChange(): void {
    try {
      // Report data for the previous page
      this.reportRUMData();
      
      // Reset metrics for the new page
      this.pageLoadTimestamp = Date.now();
      this.navigationEntries = [];
      this.resourceEntries = [];
      this.interactionEvents = [];
      
      // Collect new navigation timing after a short delay
      setTimeout(() => {
        this.collectNavigationTiming();
        this.reportRUMData();
      }, 1000);
    } catch (error) {
      captureException(error, { context: 'RUM.handleRouteChange' });
      console.error('[RUM] Failed to handle route change:', error);
    }
  }

  /**
   * Collect navigation timing data
   */
  private collectNavigationTiming(): void {
    try {
      if (performance && performance.getEntriesByType) {
        const navigationEntries = performance.getEntriesByType('navigation');
        if (navigationEntries.length > 0) {
          this.navigationEntries = navigationEntries as PerformanceNavigationTiming[];
        }
      }
    } catch (error) {
      captureException(error, { context: 'RUM.collectNavigationTiming' });
      console.error('[RUM] Failed to collect navigation timing:', error);
    }
  }

  /**
   * Monitor user interactions
   */
  private monitorUserInteractions(): void {
    try {
      // Track clicks
      document.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        const tagName = target.tagName.toLowerCase();
        const id = target.id;
        const className = target.className;
        const text = target.textContent?.trim().substring(0, 50);
        
        this.recordInteraction('click', {
          tagName,
          id,
          className,
          text,
          path: this.getElementPath(target),
        });
      });
      
      // Track form submissions
      document.addEventListener('submit', (event) => {
        const form = event.target as HTMLFormElement;
        const id = form.id;
        const action = form.action;
        
        this.recordInteraction('form_submit', {
          id,
          action,
          path: this.getElementPath(form),
        });
      });
    } catch (error) {
      captureException(error, { context: 'RUM.monitorUserInteractions' });
      console.error('[RUM] Failed to set up interaction monitoring:', error);
    }
  }

  /**
   * Get the DOM path of an element
   */
  private getElementPath(element: HTMLElement): string {
    try {
      const path: string[] = [];
      let currentElement: HTMLElement | null = element;
      
      while (currentElement && currentElement !== document.body) {
        let identifier = currentElement.tagName.toLowerCase();
        
        if (currentElement.id) {
          identifier += `#${currentElement.id}`;
        } else if (currentElement.className) {
          const classes = Array.from(currentElement.classList).join('.');
          if (classes) {
            identifier += `.${classes}`;
          }
        }
        
        path.unshift(identifier);
        currentElement = currentElement.parentElement;
        
        // Limit path length
        if (path.length >= 5) {
          break;
        }
      }
      
      return path.join(' > ');
    } catch (error) {
      return 'unknown';
    }
  }

  /**
   * Record a user interaction
   */
  private recordInteraction(name: string, details: Record<string, unknown>): void {
    try {
      const startTime = performance.now();
      const timestamp = Date.now();
      
      // Record the interaction
      this.interactionEvents.push({
        name,
        startTime,
        duration: 0, // Will be updated when the interaction completes
      });
      
      // Also record in performance monitoring
      performanceMonitoring.recordMetric({
        name: `interaction.${name}`,
        value: 0, // Will be updated when the interaction completes
        unit: 'ms',
        timestamp,
        tags: details,
      });
      
      // Use setTimeout to measure the duration after the event has been processed
      setTimeout(() => {
        const duration = performance.now() - startTime;
        
        // Update the interaction duration
        const interaction = this.interactionEvents[this.interactionEvents.length - 1];
        if (interaction) {
          interaction.duration = duration;
        }
        
        // Update the performance metric
        performanceMonitoring.recordMetric({
          name: `interaction.${name}`,
          value: duration,
          unit: 'ms',
          timestamp,
          tags: details,
        });
      }, 0);
    } catch (error) {
      captureException(error, { context: 'RUM.recordInteraction' });
      console.error('[RUM] Failed to record interaction:', error);
    }
  }

  /**
   * Monitor errors
   */
  private monitorErrors(): void {
    try {
      // Listen for unhandled errors
      window.addEventListener('error', (event) => {
        this.recordError(event.message, event.filename);
      });
      
      // Listen for unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        this.recordError(`Unhandled Promise Rejection: ${event.reason}`, 'promise');
      });
    } catch (error) {
      captureException(error, { context: 'RUM.monitorErrors' });
      console.error('[RUM] Failed to set up error monitoring:', error);
    }
  }

  /**
   * Record an error
   */
  private recordError(message: string, source: string): void {
    try {
      this.errorEvents.push({
        message,
        source,
        timestamp: Date.now(),
      });
    } catch (error) {
      captureException(error, { context: 'RUM.recordError' });
      console.error('[RUM] Failed to record error:', error);
    }
  }

  /**
   * Monitor resource loading
   */
  private monitorResources(): void {
    try {
      if (typeof PerformanceObserver !== 'undefined') {
        // Create observer for resource timing entries
        const resourceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          
          // Add new resource entries to the collection
          this.resourceEntries = [
            ...this.resourceEntries,
            ...entries as PerformanceResourceTiming[],
          ];
          
          // Limit the number of entries to avoid excessive memory usage
          if (this.resourceEntries.length > 100) {
            this.resourceEntries = this.resourceEntries.slice(-100);
          }
        });
        
        // Start observing resource timing entries
        resourceObserver.observe({ entryTypes: ['resource'] });
      }
    } catch (error) {
      captureException(error, { context: 'RUM.monitorResources' });
      console.error('[RUM] Failed to set up resource monitoring:', error);
    }
  }

  /**
   * Monitor Web Vitals metrics
   */
  private monitorWebVitals(): void {
    try {
      // This is a placeholder for Web Vitals integration
      // In a real implementation, you would import and use the web-vitals library
      // Example: import { getCLS, getFID, getLCP } from 'web-vitals';
      console.log('[RUM] Web Vitals monitoring would be implemented here');
    } catch (error) {
      captureException(error, { context: 'RUM.monitorWebVitals' });
      console.error('[RUM] Failed to set up Web Vitals monitoring:', error);
    }
  }

  /**
   * Set up periodic reporting
   */
  private setupPeriodicReporting(): void {
    try {
      // Report data every 60 seconds
      setInterval(() => {
        this.reportRUMData();
      }, 60000);
    } catch (error) {
      captureException(error, { context: 'RUM.setupPeriodicReporting' });
      console.error('[RUM] Failed to set up periodic reporting:', error);
    }
  }

  /**
   * Report RUM data to the server
   */
  private reportRUMData(): void {
    try {
      if (!this.isMonitoring || this.navigationEntries.length === 0) {
        return;
      }
      
      // Prepare the RUM data payload
      const payload = {
        sessionId: this.sessionId,
        timestamp: Date.now(),
        url: window.location.href,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        devicePixelRatio: window.devicePixelRatio,
        connection: this.getConnectionInfo(),
        user: this.userInfo,
        pageLoad: this.getPageLoadMetrics(),
        resources: this.getResourceMetrics(),
        interactions: this.interactionEvents,
        errors: this.errorEvents,
        application: {
          id: this.config.applicationId,
          environment: this.config.environment,
          version: import.meta.env.VITE_APP_VERSION || 'unknown',
        },
      };
      
      // Send the data to the reporting endpoint
      fetch(this.config.reportingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        // Use keepalive to ensure the request completes even if the page is unloading
        keepalive: true,
      }).catch(error => {
        console.error('[RUM] Failed to report data:', error);
      });
      
      // Clear the error events after reporting
      this.errorEvents = [];
    } catch (error) {
      captureException(error, { context: 'RUM.reportRUMData' });
      console.error('[RUM] Failed to report data:', error);
    }
  }

  /**
   * Get connection information
   */
  private getConnectionInfo(): Record<string, unknown> {
    try {
      type NetworkInformation = {
        effectiveType?: string;
        downlink?: number;
        rtt?: number;
        saveData?: boolean;
      };
      const nav = navigator as Navigator & { connection?: NetworkInformation };
      const connection = nav.connection;
      if (connection) {
        return {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData,
        };
      }
    } catch (error) {
      // Ignore errors
    }
    return {};
  }

  /**
   * Get page load metrics
   */
  private getPageLoadMetrics(): Record<string, unknown> {
    try {
      if (this.navigationEntries.length === 0) {
        return {};
      }
      
      const entry = this.navigationEntries[0];
      
      return {
        loadTime: entry.loadEventEnd - entry.startTime,
        domContentLoaded: entry.domContentLoadedEventEnd - entry.startTime,
        firstByte: entry.responseStart - entry.requestStart,
        dnsLookup: entry.domainLookupEnd - entry.domainLookupStart,
        tcpConnect: entry.connectEnd - entry.connectStart,
        redirect: entry.redirectEnd - entry.redirectStart,
        pageLoadTimestamp: this.pageLoadTimestamp,
      };
    } catch (error) {
      captureException(error, { context: 'RUM.getPageLoadMetrics' });
      return {};
    }
  }

  /**
   * Get resource metrics
   */
  private getResourceMetrics(): Record<string, unknown>[] {
    try {
      // Limit the number of resources to report
      const maxResources = 20;
      const resources = this.resourceEntries.slice(-maxResources);
      
      return resources.map(entry => ({
        name: entry.name,
        initiatorType: entry.initiatorType,
        duration: entry.duration,
        transferSize: entry.transferSize,
        startTime: entry.startTime,
      }));
    } catch (error) {
      captureException(error, { context: 'RUM.getResourceMetrics' });
      return [];
    }
  }

  /**
   * Set user information
   */
  public setUser(userInfo: UserInfo): void {
    try {
      this.userInfo = { ...userInfo };
    } catch (error) {
      captureException(error, { context: 'RUM.setUser' });
      console.error('[RUM] Failed to set user information:', error);
    }
  }

  /**
   * Clear user information
   */
  public clearUser(): void {
    try {
      this.userInfo = {};
    } catch (error) {
      captureException(error, { context: 'RUM.clearUser' });
      console.error('[RUM] Failed to clear user information:', error);
    }
  }

  /**
   * Record a custom event
   */
  public recordEvent(name: string, details: Record<string, unknown> = {}): void {
    try {
      if (!this.isMonitoring) {
        return;
      }
      
      // Record the event in performance monitoring
      performanceMonitoring.recordMetric({
        name: `custom_event.${name}`,
        value: 1,
        unit: 'count',
        timestamp: Date.now(),
        tags: details,
      });
    } catch (error) {
      captureException(error, { context: 'RUM.recordEvent' });
      console.error('[RUM] Failed to record event:', error);
    }
  }
}

// Create and export a singleton instance
export const rum = new RealUserMonitoring();

// Export a hook for React components
export const useRUM = () => {
  return {
    /**
     * Record a custom event
     */
    recordEvent: (name: string, details: Record<string, unknown> = {}) => {
      rum.recordEvent(name, details);
    },
    
    /**
     * Set user information
     */
    setUser: (userInfo: UserInfo) => {
      rum.setUser(userInfo);
    },
    
    /**
     * Clear user information
     */
    clearUser: () => {
      rum.clearUser();
    },
  };
};
