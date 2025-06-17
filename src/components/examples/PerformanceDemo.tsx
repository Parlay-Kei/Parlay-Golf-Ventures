/**
 * Performance Demo Component
 * 
 * This component demonstrates the various performance optimization techniques
 * implemented in the Parlay Golf Ventures platform, including:
 * - Code splitting and lazy loading
 * - Optimized image loading
 * - Performance monitoring
 * - Preloading critical resources
 */

import React, { useState, useEffect, useCallback } from 'react';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { usePerformanceMonitoring } from '@/lib/services/performanceMonitoring';
import { preloadCriticalResources, addPreloadHints } from '@/lib/utils/preloadUtils';
import { getResponsiveImageSrc, getImagePlaceholder } from '@/lib/utils/imageUtils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorBoundary } from 'react-error-boundary';

const PerformanceDemo = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<Array<{name: string, value: string}>>([]);
  
  // Use the performance monitoring hook
  const perf = usePerformanceMonitoring('PerformanceDemo');
  
  // Load resources and measure performance
  const loadResources = useCallback(async () => {
    setIsLoading(true);
    
    // Create a performance mark for component mount
    perf.mark('mount');
    
    // Simulate loading resources
    await perf.measureAsyncFunction('loadResources', async () => {
      // Preload critical resources
      preloadCriticalResources({
        images: ['/images/hero-bg.jpg'],
        fonts: [
          { family: 'Inter', weight: 400 },
          { family: 'Inter', weight: 700 }
        ]
      });
      
      // Add preload hints for additional resources
      addPreloadHints({
        images: ['/images/background.jpg'],
        fonts: [
          { url: '/fonts/inter.woff2', type: 'font/woff2' }
        ]
      });
      
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 1000));
    });
    
    setIsLoading(false);
    
    // Create a performance mark for resources loaded
    perf.mark('resourcesLoaded');
    
    // Measure time between mount and resources loaded
    perf.measure('initialLoad', 'mount', 'resourcesLoaded');
  }, []);
  
  useEffect(() => {
    loadResources();
    
    // Cleanup function
    return () => {
      // Record component unmount metric
      perf.recordMetric('unmount', performance.now(), 'ms');
    };
  }, [loadResources, perf]);
  
  // Simulate collecting performance metrics
  useEffect(() => {
    if (!isLoading) {
      // Generate some example metrics
      const exampleMetrics = [
        { name: 'First Contentful Paint', value: '0.8s' },
        { name: 'Largest Contentful Paint', value: '1.2s' },
        { name: 'Cumulative Layout Shift', value: '0.02' },
        { name: 'First Input Delay', value: '15ms' },
        { name: 'Time to Interactive', value: '1.5s' },
        { name: 'Total Blocking Time', value: '120ms' }
      ];
      
      setMetrics(exampleMetrics);
    }
  }, [isLoading]);
  
  // Simulate a heavy computation
  const runHeavyComputation = () => {
    perf.measureFunction('heavyComputation', () => {
      // Simulate a heavy computation
      let result = 0;
      for (let i = 0; i < 1000000; i++) {
        result += Math.sqrt(i);
      }
      return result;
    });
    
    alert('Heavy computation completed! Check the console for performance metrics.');
  };
  
  // Simulate an async operation
  const fetchData = async () => {
    try {
      const result = await perf.measureAsyncFunction('fetchData', async () => {
        // Simulate a network request
        await new Promise(resolve => setTimeout(resolve, 1500));
        return { success: true, data: 'Sample data' };
      });
      
      alert(`Data fetched successfully: ${JSON.stringify(result)}`);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Performance Optimization Demo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Optimized Image Loading</CardTitle>
            <CardDescription>
              Demonstrates lazy loading, WebP format, and blur-up loading effect
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <OptimizedImage 
                src="/images/golf-course.jpg" 
                alt="Golf Course" 
                width={400} 
                height={300} 
                className="rounded-md" 
                placeholder="blur"
                blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMjA4MDIwIi8+PC9zdmc+"
              />
              <p className="text-sm text-gray-500">
                This image uses the OptimizedImage component which automatically:
                <ul className="list-disc pl-5 mt-2">
                  <li>Lazy loads images for better performance</li>
                  <li>Uses WebP format with fallback for older browsers</li>
                  <li>Provides a blur-up loading effect</li>
                  <li>Handles image loading errors gracefully</li>
                </ul>
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>
              Key performance metrics for this page
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-pgv-green"></div>
              </div>
            ) : (
              <div className="space-y-2">
                {metrics.map((metric, index) => (
                  <div key={index} className="flex justify-between items-center border-b pb-2">
                    <span className="font-medium">{metric.name}</span>
                    <span className="text-pgv-green font-mono">{metric.value}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Performance Monitoring Demo</CardTitle>
          <CardDescription>
            Test the performance monitoring utilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Click the buttons below to test different performance monitoring features. Check the browser console to see the performance metrics being logged.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button onClick={runHeavyComputation}>
              Run Heavy Computation
            </Button>
            <Button onClick={fetchData} variant="outline">
              Simulate API Request
            </Button>
          </div>
        </CardContent>
        <CardFooter className="text-sm text-gray-500">
          The performance monitoring service tracks function execution time, async operations, resource loading, and more.
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Code Splitting Benefits</CardTitle>
          <CardDescription>
            How code splitting and lazy loading improve performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>
              Parlay Golf Ventures implements code splitting and lazy loading to improve performance in the following ways:
            </p>
            <ul className="list-disc pl-5">
              <li><strong>Smaller initial bundle size</strong> - Only load what's needed for the current page</li>
              <li><strong>Faster initial page load</strong> - Reduces time to interactive</li>
              <li><strong>Improved caching</strong> - Smaller chunks are more cache-friendly</li>
              <li><strong>Reduced memory usage</strong> - Only load components when needed</li>
              <li><strong>Better mobile experience</strong> - Especially important for users on slower connections</li>
            </ul>
            <p className="text-sm text-gray-500 mt-4">
              All routes in the application use lazy loading with Suspense, and the OptimizedImage component further improves performance by optimizing image loading.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceDemo;
