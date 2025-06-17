/**
 * Performance Monitoring Service
 * 
 * This service provides utilities for monitoring and reporting application performance metrics,
 * including:
 * - Page load times
 * - Component render times
 * - Network request performance
 * - Resource loading performance
 * - Memory usage
 */

import { captureException } from '@/lib/services/errorMonitoring';

// Types for performance metrics
export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count' | 'percent';
  timestamp: number;
  tags?: Record<string, string>;
}

export interface PageLoadMetrics {
  timeToFirstByte: number;
  domContentLoaded: number;
  windowLoaded: number;
  firstPaint: number;
  firstContentfulPaint: number;
  largestContentfulPaint?: number;
  firstInputDelay?: number;
  cumulativeLayoutShift?: number;
  timeToInteractive?: number;
}

// Configuration
interface PerformanceMonitoringConfig {
  enabled: boolean;
  sampleRate: number; // 0-1, percentage of sessions to monitor
  reportingEndpoint?: string; // Optional endpoint to send metrics to
  logToConsole: boolean;
  trackResourceTiming: boolean;
  trackUserTiming: boolean;
  trackMemory: boolean;
}

const defaultConfig: PerformanceMonitoringConfig = {
  enabled: import.meta.env.MODE === 'production',
  sampleRate: 0.1, // Monitor 10% of sessions by default
  logToConsole: import.meta.env.MODE !== 'production',
  trackResourceTiming: true,
  trackUserTiming: true,
  trackMemory: true,
};

class PerformanceMonitoringService {
  private config: PerformanceMonitoringConfig;
  private metrics: PerformanceMetric[] = [];
  private isMonitoring: boolean = false;
  private sessionId: string;

  constructor(config: Partial<PerformanceMonitoringConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.sessionId = this.generateSessionId();
    
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
   * Initialize performance monitoring
   */
  private initializeMonitoring(): void {
    try {
      // Set up page load performance monitoring
      this.monitorPageLoad();
      
      // Set up resource timing monitoring if enabled
      if (this.config.trackResourceTiming) {
        this.monitorResourceTiming();
      }
      
      // Set up memory monitoring if enabled
      if (this.config.trackMemory) {
        this.monitorMemory();
      }
      
      // Log initialization
      if (this.config.logToConsole) {
        console.log('[Performance] Monitoring initialized', { sessionId: this.sessionId });
      }
    } catch (error) {
      captureException(error, { context: 'PerformanceMonitoring.initializeMonitoring' });
      console.error('[Performance] Failed to initialize monitoring:', error);
    }
  }

  /**
   * Monitor page load performance metrics
   */
  private monitorPageLoad(): void {
    try {
      // Listen for the window load event to collect initial metrics
      window.addEventListener('load', () => {
        // Use setTimeout to ensure all load events have fired
        setTimeout(() => {
          this.collectPageLoadMetrics();
        }, 0);
      });

      // Monitor web vitals if available
      this.monitorWebVitals();
    } catch (error) {
      captureException(error, { context: 'PerformanceMonitoring.monitorPageLoad' });
      console.error('[Performance] Failed to set up page load monitoring:', error);
    }
  }

  /**
   * Collect page load performance metrics
   */
  private collectPageLoadMetrics(): void {
    try {
      if (!performance || !performance.timing) {
        console.warn('[Performance] Performance API not available');
        return;
      }

      const timing = performance.timing;
      
      // Calculate basic timing metrics
      const timeToFirstByte = timing.responseStart - timing.navigationStart;
      const domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
      const windowLoaded = timing.loadEventEnd - timing.navigationStart;
      
      // Get paint timing if available
      let firstPaint = 0;
      let firstContentfulPaint = 0;
      
      const paintEntries = performance.getEntriesByType('paint');
      if (paintEntries.length) {
        const fpEntry = paintEntries.find(entry => entry.name === 'first-paint');
        const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        
        if (fpEntry) firstPaint = fpEntry.startTime;
        if (fcpEntry) firstContentfulPaint = fcpEntry.startTime;
      }
      
      // Record metrics
      this.recordMetric({
        name: 'page_load.ttfb',
        value: timeToFirstByte,
        unit: 'ms',
        timestamp: Date.now(),
        tags: { page: window.location.pathname }
      });
      
      this.recordMetric({
        name: 'page_load.dom_content_loaded',
        value: domContentLoaded,
        unit: 'ms',
        timestamp: Date.now(),
        tags: { page: window.location.pathname }
      });
      
      this.recordMetric({
        name: 'page_load.window_loaded',
        value: windowLoaded,
        unit: 'ms',
        timestamp: Date.now(),
        tags: { page: window.location.pathname }
      });
      
      if (firstPaint > 0) {
        this.recordMetric({
          name: 'page_load.first_paint',
          value: firstPaint,
          unit: 'ms',
          timestamp: Date.now(),
          tags: { page: window.location.pathname }
        });
      }
      
      if (firstContentfulPaint > 0) {
        this.recordMetric({
          name: 'page_load.first_contentful_paint',
          value: firstContentfulPaint,
          unit: 'ms',
          timestamp: Date.now(),
          tags: { page: window.location.pathname }
        });
      }
      
      // Log metrics if enabled
      if (this.config.logToConsole) {
        console.log('[Performance] Page load metrics:', {
          timeToFirstByte,
          domContentLoaded,
          windowLoaded,
          firstPaint,
          firstContentfulPaint,
          page: window.location.pathname
        });
      }
      
      // Send metrics to reporting endpoint if configured
      this.reportMetrics();
    } catch (error) {
      captureException(error, { context: 'PerformanceMonitoring.collectPageLoadMetrics' });
      console.error('[Performance] Failed to collect page load metrics:', error);
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
      
      // For now, we'll just log that this feature would be implemented
      if (this.config.logToConsole) {
        console.log('[Performance] Web Vitals monitoring would be implemented here');
      }
    } catch (error) {
      captureException(error, { context: 'PerformanceMonitoring.monitorWebVitals' });
      console.error('[Performance] Failed to set up Web Vitals monitoring:', error);
    }
  }

  /**
   * Monitor resource timing
   */
  private monitorResourceTiming(): void {
    try {
      // Create a PerformanceObserver to monitor resource timing entries
      if (typeof PerformanceObserver !== 'undefined') {
        const resourceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          
          // Process each resource timing entry
          entries.forEach(entry => {
            // Cast entry to PerformanceResourceTiming to access resource-specific properties
            const resourceEntry = entry as PerformanceResourceTiming;
            
            // Only track certain resource types to avoid overwhelming with data
            if (
              resourceEntry.initiatorType === 'script' ||
              resourceEntry.initiatorType === 'link' ||
              resourceEntry.initiatorType === 'img' ||
              resourceEntry.initiatorType === 'fetch' ||
              resourceEntry.initiatorType === 'xmlhttprequest'
            ) {
              const duration = resourceEntry.duration;
              const size = resourceEntry.transferSize || 0;
              
              this.recordMetric({
                name: `resource.${resourceEntry.initiatorType}.duration`,
                value: duration,
                unit: 'ms',
                timestamp: Date.now(),
                tags: {
                  url: resourceEntry.name.split('?')[0], // Remove query params
                  initiatorType: resourceEntry.initiatorType
                }
              });
              
              if (size > 0) {
                this.recordMetric({
                  name: `resource.${resourceEntry.initiatorType}.size`,
                  value: size,
                  unit: 'bytes',
                  timestamp: Date.now(),
                  tags: {
                    url: resourceEntry.name.split('?')[0], // Remove query params
                    initiatorType: resourceEntry.initiatorType
                  }
                });
              }
            }
          });
        });
        
        // Start observing resource timing entries
        resourceObserver.observe({ entryTypes: ['resource'] });
      } else {
        console.warn('[Performance] PerformanceObserver not supported');
      }
    } catch (error) {
      captureException(error, { context: 'PerformanceMonitoring.monitorResourceTiming' });
      console.error('[Performance] Failed to set up resource timing monitoring:', error);
    }
  }

  /**
   * Monitor memory usage
   */
  private monitorMemory(): void {
    try {
      // Check if memory API is available
      if (performance && (performance as unknown as { memory?: unknown }).memory) {
        // Set up interval to periodically check memory usage
        const memoryCheckInterval = setInterval(() => {
          const memory = (performance as unknown as { memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
          if (memory) {
            this.recordMetric({
              name: 'memory.used_js_heap_size',
              value: memory.usedJSHeapSize,
              unit: 'bytes',
              timestamp: Date.now()
            });
            this.recordMetric({
              name: 'memory.total_js_heap_size',
              value: memory.totalJSHeapSize,
              unit: 'bytes',
              timestamp: Date.now()
            });
            // Calculate heap usage percentage
            const heapUsagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
            this.recordMetric({
              name: 'memory.heap_usage_percent',
              value: heapUsagePercent,
              unit: 'percent',
              timestamp: Date.now()
            });
            // Log memory metrics if enabled
            if (this.config.logToConsole) {
              console.log('[Performance] Memory metrics:', {
                usedJSHeapSize: this.formatBytes(memory.usedJSHeapSize),
                totalJSHeapSize: this.formatBytes(memory.totalJSHeapSize),
                jsHeapSizeLimit: this.formatBytes(memory.jsHeapSizeLimit),
                heapUsagePercent: `${heapUsagePercent.toFixed(2)}%`
              });
            }
          }
        }, 10000); // Check every 10 seconds
        // Clean up interval on page unload
        window.addEventListener('beforeunload', () => {
          clearInterval(memoryCheckInterval);
        });
      } else {
        console.warn('[Performance] Memory API not available');
      }
    } catch (error) {
      captureException(error, { context: 'PerformanceMonitoring.monitorMemory' });
      console.error('[Performance] Failed to set up memory monitoring:', error);
    }
  }

  /**
   * Format bytes to a human-readable string
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Record a performance metric
   */
  public recordMetric(metric: PerformanceMetric): void {
    if (!this.isMonitoring) return;
    
    try {
      // Add metric to the collection
      this.metrics.push(metric);
      
      // Log metric if enabled
      if (this.config.logToConsole) {
        console.log(`[Performance] ${metric.name}: ${metric.value}${metric.unit}`, metric.tags || {});
      }
    } catch (error) {
      captureException(error, { context: 'PerformanceMonitoring.recordMetric' });
      console.error('[Performance] Failed to record metric:', error);
    }
  }

  /**
   * Measure the execution time of a function
   */
  public measureFunction<T>(name: string, fn: () => T, tags?: Record<string, string>): T {
    if (!this.isMonitoring) return fn();
    
    try {
      const start = performance.now();
      const result = fn();
      const duration = performance.now() - start;
      
      this.recordMetric({
        name: `function.${name}.duration`,
        value: duration,
        unit: 'ms',
        timestamp: Date.now(),
        tags
      });
      
      return result;
    } catch (error) {
      captureException(error, { context: 'PerformanceMonitoring.measureFunction' });
      console.error('[Performance] Error measuring function:', error);
      throw error; // Re-throw to preserve original error
    }
  }

  /**
   * Measure the execution time of an async function
   */
  public async measureAsyncFunction<T>(
    name: string,
    fn: () => Promise<T>,
    tags?: Record<string, string>
  ): Promise<T> {
    if (!this.isMonitoring) return fn();
    
    try {
      const start = performance.now();
      const result = await fn();
      const duration = performance.now() - start;
      
      this.recordMetric({
        name: `async_function.${name}.duration`,
        value: duration,
        unit: 'ms',
        timestamp: Date.now(),
        tags
      });
      
      return result;
    } catch (error) {
      captureException(error, { context: 'PerformanceMonitoring.measureAsyncFunction' });
      console.error('[Performance] Error measuring async function:', error);
      throw error; // Re-throw to preserve original error
    }
  }

  /**
   * Create a performance mark
   */
  public mark(name: string): void {
    if (!this.isMonitoring || !this.config.trackUserTiming) return;
    
    try {
      performance.mark(name);
    } catch (error) {
      captureException(error, { context: 'PerformanceMonitoring.mark' });
      console.error('[Performance] Failed to create mark:', error);
    }
  }

  /**
   * Measure time between two marks
   */
  public measure(name: string, startMark: string, endMark: string): void {
    if (!this.isMonitoring || !this.config.trackUserTiming) return;
    
    try {
      performance.measure(name, startMark, endMark);
      
      const measures = performance.getEntriesByName(name, 'measure');
      if (measures.length > 0) {
        const duration = measures[0].duration;
        
        this.recordMetric({
          name: `measure.${name}`,
          value: duration,
          unit: 'ms',
          timestamp: Date.now()
        });
      }
    } catch (error) {
      captureException(error, { context: 'PerformanceMonitoring.measure' });
      console.error('[Performance] Failed to create measure:', error);
    }
  }

  /**
   * Report metrics to the configured endpoint
   */
  public reportMetrics(): void {
    if (!this.isMonitoring || !this.config.reportingEndpoint || this.metrics.length === 0) return;
    
    try {
      const payload = {
        sessionId: this.sessionId,
        timestamp: Date.now(),
        metrics: this.metrics,
        userAgent: navigator.userAgent,
        url: window.location.href
      };
      
      // Send metrics to the reporting endpoint
      fetch(this.config.reportingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        // Use keepalive to ensure the request completes even if the page is unloading
        keepalive: true
      }).catch(error => {
        console.error('[Performance] Failed to report metrics:', error);
      });
      
      // Clear reported metrics
      this.metrics = [];
    } catch (error) {
      captureException(error, { context: 'PerformanceMonitoring.reportMetrics' });
      console.error('[Performance] Failed to report metrics:', error);
    }
  }
}

// Create and export a singleton instance
export const performanceMonitoring = new PerformanceMonitoringService();

/**
 * React hook for measuring component render time
 * @param componentName Name of the component to measure
 */
export const usePerformanceMonitoring = (componentName: string) => {
  return {
    /**
     * Measure the execution time of a function
     */
    measureFunction: <T>(name: string, fn: () => T, tags?: Record<string, string>): T => {
      return performanceMonitoring.measureFunction(
        `${componentName}.${name}`,
        fn,
        { component: componentName, ...tags }
      );
    },
    
    /**
     * Measure the execution time of an async function
     */
    measureAsyncFunction: <T>(
      name: string,
      fn: () => Promise<T>,
      tags?: Record<string, string>
    ): Promise<T> => {
      return performanceMonitoring.measureAsyncFunction(
        `${componentName}.${name}`,
        fn,
        { component: componentName, ...tags }
      );
    },
    
    /**
     * Create a performance mark
     */
    mark: (name: string): void => {
      performanceMonitoring.mark(`${componentName}.${name}`);
    },
    
    /**
     * Measure time between two marks
     */
    measure: (name: string, startMark: string, endMark: string): void => {
      performanceMonitoring.measure(
        `${componentName}.${name}`,
        `${componentName}.${startMark}`,
        `${componentName}.${endMark}`
      );
    },
    
    /**
     * Record a custom performance metric
     */
    recordMetric: (name: string, value: number, unit: 'ms' | 'bytes' | 'count' | 'percent', tags?: Record<string, string>): void => {
      performanceMonitoring.recordMetric({
        name: `${componentName}.${name}`,
        value,
        unit,
        timestamp: Date.now(),
        tags: { component: componentName, ...tags }
      });
    }
  };
};
