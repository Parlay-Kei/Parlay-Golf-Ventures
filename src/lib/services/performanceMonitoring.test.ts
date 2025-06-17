/**
 * Tests for Performance Monitoring Service
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { performanceMonitoring, PerformanceMetric } from './performanceMonitoring';

// Mock the performance API
const mockPerformance = {
  now: vi.fn().mockReturnValue(100),
  mark: vi.fn(),
  measure: vi.fn(),
  getEntriesByName: vi.fn().mockReturnValue([{ duration: 50 }]),
  timing: {
    navigationStart: 0,
    responseStart: 100,
    domContentLoadedEventEnd: 300,
    loadEventEnd: 500
  },
  getEntriesByType: vi.fn().mockReturnValue([
    { name: 'first-paint', startTime: 200 },
    { name: 'first-contentful-paint', startTime: 250 }
  ])
};

// Mock the error monitoring service
vi.mock('./errorMonitoring', () => ({
  captureException: vi.fn()
}));

describe('Performance Monitoring Service', () => {
  // Store original global objects
  const originalPerformance = global.performance;
  const originalFetch = global.fetch;
  const originalConsole = global.console;
  
  // Mocked metrics array
  let recordedMetrics: PerformanceMetric[] = [];
  
  beforeEach(() => {
    // Mock global objects
    global.performance = mockPerformance as unknown as typeof performance;
    global.fetch = vi.fn().mockResolvedValue({ ok: true }) as unknown as typeof fetch;
    global.console = {
      ...console,
      log: vi.fn(),
      warn: vi.fn(),
      error: vi.fn()
    } as unknown as typeof console;
    
    // Spy on recordMetric method
    vi.spyOn(performanceMonitoring as unknown as typeof performanceMonitoring, 'recordMetric').mockImplementation((metric: PerformanceMetric) => {
      recordedMetrics.push(metric);
    });
    
    // Reset metrics array
    recordedMetrics = [];
  });
  
  afterEach(() => {
    // Restore original global objects
    global.performance = originalPerformance;
    global.fetch = originalFetch;
    global.console = originalConsole;
    
    // Clear all mocks
    vi.clearAllMocks();
  });
  
  it('should measure function execution time', () => {
    // Arrange
    const testFn = vi.fn().mockReturnValue('result');
    
    // Act
    const result = (performanceMonitoring as unknown as typeof performanceMonitoring).measureFunction('test', testFn, { tag: 'value' });
    
    // Assert
    expect(testFn).toHaveBeenCalledTimes(1);
    expect(result).toBe('result');
    expect(global.performance.now).toHaveBeenCalledTimes(2);
    expect(recordedMetrics.length).toBe(1);
    expect(recordedMetrics[0].name).toBe('function.test.duration');
    expect(recordedMetrics[0].unit).toBe('ms');
    expect(recordedMetrics[0].tags).toEqual({ tag: 'value' });
  });
  
  it('should measure async function execution time', async () => {
    // Arrange
    const testAsyncFn = vi.fn().mockResolvedValue('async result');
    
    // Act
    const result = await (performanceMonitoring as unknown as typeof performanceMonitoring).measureAsyncFunction('async_test', testAsyncFn);
    
    // Assert
    expect(testAsyncFn).toHaveBeenCalledTimes(1);
    expect(result).toBe('async result');
    expect(global.performance.now).toHaveBeenCalledTimes(2);
    expect(recordedMetrics.length).toBe(1);
    expect(recordedMetrics[0].name).toBe('async_function.async_test.duration');
    expect(recordedMetrics[0].unit).toBe('ms');
  });
  
  it('should create performance marks', () => {
    // Act
    (performanceMonitoring as unknown as typeof performanceMonitoring).mark('test_mark');
    
    // Assert
    expect(global.performance.mark).toHaveBeenCalledTimes(1);
    expect(global.performance.mark).toHaveBeenCalledWith('test_mark');
  });
  
  it('should measure time between marks', () => {
    // Act
    (performanceMonitoring as unknown as typeof performanceMonitoring).measure('test_measure', 'start_mark', 'end_mark');
    
    // Assert
    expect(global.performance.measure).toHaveBeenCalledTimes(1);
    expect(global.performance.measure).toHaveBeenCalledWith('test_measure', 'start_mark', 'end_mark');
    expect(global.performance.getEntriesByName).toHaveBeenCalledWith('test_measure', 'measure');
    expect(recordedMetrics.length).toBe(1);
    expect(recordedMetrics[0].name).toBe('measure.test_measure');
    expect(recordedMetrics[0].value).toBe(50);
  });
  
  it('should report metrics when endpoint is configured', () => {
    // Arrange
    (performanceMonitoring as unknown as typeof performanceMonitoring).config.reportingEndpoint = 'https://example.com/metrics';
    (performanceMonitoring as unknown as typeof performanceMonitoring).metrics = [
      { name: 'test_metric', value: 100, unit: 'ms', timestamp: Date.now() }
    ];
    
    // Act
    (performanceMonitoring as unknown as typeof performanceMonitoring).reportMetrics();
    
    // Assert
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://example.com/metrics',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true
      })
    );
    
    // Check that metrics were cleared
    expect((performanceMonitoring as unknown as typeof performanceMonitoring).metrics.length).toBe(0);
  });
  
  it('should handle errors gracefully', () => {
    // Arrange
    const error = new Error('Test error');
    global.performance.mark = vi.fn().mockImplementation(() => {
      throw error;
    });
    
    // Act - this should not throw
    (performanceMonitoring as unknown as typeof performanceMonitoring).mark('error_mark');
    
    // Assert
    expect(global.console.error).toHaveBeenCalledWith(
      '[Performance] Failed to create mark:',
      error
    );
  });
});
