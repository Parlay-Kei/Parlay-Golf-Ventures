# Performance Optimizations for Parlay Golf Ventures

## Table of Contents

- [Introduction](#introduction)
- [Basic Optimizations](#basic-optimizations)
  - [Code Splitting and Lazy Loading](#code-splitting-and-lazy-loading)
  - [Image Optimization](#image-optimization)
  - [Bundle Optimization](#bundle-optimization)
  - [Font Optimization](#font-optimization)
  - [API Performance](#api-performance)
  - [Offline Support](#offline-support)
  - [Performance Monitoring](#performance-monitoring)
- [Advanced Optimizations](#advanced-optimizations)
  - [Server-Side Rendering (SSR)](#server-side-rendering-ssr)
  - [Content Delivery Network (CDN)](#content-delivery-network-cdn)
  - [HTTP/2 Support](#http2-support)
  - [Real User Monitoring (RUM)](#real-user-monitoring-rum)
- [Usage Guide](#usage-guide)
  - [Development](#development)
  - [Production](#production)
  - [CDN Deployment](#cdn-deployment)
  - [Monitoring](#monitoring)
- [Performance Testing](#performance-testing)
- [Future Optimizations](#future-optimizations)

## Introduction

This document outlines the performance optimizations implemented in the Parlay Golf Ventures platform. These optimizations aim to improve load times, reduce bundle sizes, enhance user experience, and provide better performance insights.

## Basic Optimizations

### Code Splitting and Lazy Loading

We've implemented code splitting and lazy loading to reduce the initial bundle size and improve load times:

- **Route-based code splitting**: All non-essential components are loaded on-demand using React.lazy()
- **Suspense fallbacks**: Loading components are shown while chunks are being loaded
- **Prefetching**: Common routes are prefetched when the browser is idle

```jsx
// Example from App.tsx
const Dashboard = lazy(() => import("./pages/Dashboard"));

// Inside render
<Suspense fallback={<PageLoader />}>
  <Routes>
    <Route path="/dashboard" element={<Dashboard />} />
    {/* Other routes */}
  </Routes>
</Suspense>
```

### Image Optimization

We've implemented comprehensive image optimization to reduce bandwidth usage and improve load times:

- **OptimizedImage component**: A reusable component that provides:
  - Lazy loading of images
  - WebP format support with fallbacks
  - Blur-up loading effects
  - Error handling
- **Image optimization scripts**: Tools to convert and resize images
- **Responsive images**: Different sizes for different devices

```jsx
// Example usage of OptimizedImage
<OptimizedImage 
  src="/images/golf-course.jpg" 
  alt="Golf Course" 
  width={400} 
  height={300} 
  className="rounded-md" 
  placeholder="blur"
  blurDataURL="data:image/svg+xml;base64,..."
/>
```

### Bundle Optimization

We've optimized the JavaScript bundles to improve load times and caching:

- **Bundle analyzer**: Added rollup-plugin-visualizer to identify large dependencies
- **Manual chunk splitting**: Configured in Vite to separate vendor code for better caching
- **Build optimization**: Proper source map and minification settings

```js
// Example from vite.config.ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor-react': ['react', 'react-dom', 'react-router-dom'],
        'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        'vendor-utils': ['date-fns', 'zod', 'zustand'],
      },
    },
  },
}
```

### Font Optimization

We've optimized font loading to prevent layout shifts and improve perceived performance:

- **Font preloading**: Critical fonts are preloaded in the head
- **Font-display: swap**: Prevents invisible text during font loading
- **Self-hosted fonts**: Reduced dependency on third-party services
- **Fallback font stacks**: Prevents layout shifts during font loading

```html
<!-- Example from index.html -->
<link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossorigin />

<style>
  @font-face {
    font-family: 'Inter';
    font-style: normal;
    font-weight: 100 900;
    font-display: swap;
    src: url('/fonts/inter-var.woff2') format('woff2');
  }
</style>
```

### API Performance

We've implemented API caching to reduce network requests and improve responsiveness:

- **API cache utility**: Caches API responses to reduce redundant network requests
- **Multiple caching strategies**: Both memory and localStorage caching
- **Cache invalidation**: Based on time and version

```ts
// Example usage of API cache
const { data, loading, error, refetch } = useCachedApi<UserProfile>(
  '/api/user/profile',
  { userId: currentUser.id },
  { headers: { Authorization: `Bearer ${token}` } },
  { maxAge: 300000 } // 5 minutes
);
```

### Offline Support

We've implemented offline capabilities to improve user experience on poor connections:

- **Service worker**: Caches assets and API responses
- **Offline fallback page**: Shown when the user is offline
- **Background syncing**: For offline form submissions

```js
// Example from service-worker.js
self.addEventListener('fetch', (event) => {
  // Different caching strategies based on request type
  if (isApiRequest(url)) {
    // API requests: Network first, fallback to cache
    event.respondWith(networkFirstStrategy(event.request, API_CACHE_NAME));
  } else if (isImageRequest(url)) {
    // Image requests: Cache first, fallback to network
    event.respondWith(cacheFirstStrategy(event.request, IMAGES_CACHE_NAME));
  }
});
```

### Performance Monitoring

We've implemented performance monitoring to track and analyze performance metrics:

- **Performance monitoring service**: Tracks page load times, resource loading, and memory usage
- **Component performance hooks**: For measuring component render times
- **Preloading utilities**: For critical resources

```ts
// Example usage of performance monitoring
const perf = usePerformanceMonitoring('DashboardPage');

// Measure function execution time
const result = perf.measureFunction('loadData', () => {
  // Function to measure
  return processData(rawData);
});

// Measure async function execution time
const apiData = await perf.measureAsyncFunction('fetchData', async () => {
  return await api.getData();
});
```

## Advanced Optimizations

### Server-Side Rendering (SSR)

We've implemented server-side rendering to improve initial load times and SEO:

- **Express server**: For rendering React on the server
- **Hydration**: Client-side hydration for interactive components
- **Build configuration**: Supports both client and server builds

```jsx
// Example from server/entry-server.jsx
export async function render(url) {
  const appHtml = renderToString(
    <StaticRouter location={url}>
      <FeatureProvider>
        <App />
      </FeatureProvider>
    </StaticRouter>
  );

  return { html: appHtml, preloadLinks, headTags };
}
```

### Content Delivery Network (CDN)

We've implemented CDN support to improve global performance:

- **Multi-provider support**: AWS CloudFront, Cloudflare, and Fastly
- **Deployment scripts**: For pushing assets to CDN
- **Cache configuration**: Optimal settings for different asset types
- **Security headers**: For CDN-served content

```js
// Example from cdn-config.js
module.exports = {
  // CDN provider - can be 'cloudflare', 'aws', or 'fastly'
  provider: process.env.CDN_PROVIDER || 'cloudflare',
  
  // CDN URL - the base URL for the CDN
  cdnUrl: process.env.CDN_URL || 'https://assets.parlayventures.com',
  
  // Cache configuration
  cache: {
    // Cache TTL in seconds
    defaultTtl: 86400, // 1 day
    
    // Cache TTL for specific file types
    ttlByExtension: {
      '.js': 31536000, // 1 year
      '.css': 31536000, // 1 year
      // Other extensions...
    },
  },
};
```

### HTTP/2 Support

We've implemented HTTP/2 support to reduce network latency:

- **HTTP/2 configuration**: In both development and production
- **Server push**: For critical assets
- **Multiplexing**: Reduces connection overhead

```js
// Example from server/index.js
app.use((req, res, next) => {
  // Only apply to HTML requests
  if (req.path.endsWith('.html') || req.path === '/') {
    // Add Link headers for preloading critical assets
    res.setHeader('Link', [
      '</fonts/inter-var.woff2>; rel=preload; as=font; crossorigin; importance=high',
      '</assets/main.css>; rel=preload; as=style',
      '</assets/main.js>; rel=preload; as=script',
    ]);
  }
  next();
});
```

### Real User Monitoring (RUM)

We've implemented real user monitoring to collect performance data from actual users:

- **Navigation tracking**: Page load and navigation events
- **Interaction tracking**: User clicks and form submissions
- **Error tracking**: JavaScript errors and API failures
- **Resource tracking**: Loading performance of scripts, styles, and images

```ts
// Example from rum.ts
const rum = new RealUserMonitoring();

// Set user information
rum.setUser({
  id: user.id,
  username: user.username,
  role: user.role,
});

// Record a custom event
rum.recordEvent('feature_used', {
  featureId: 'swing-analysis',
  duration: 120,
});
```

## Usage Guide

### Development

For development, use the standard development server:

```bash
npm run dev
```

### Production

For production builds with all optimizations:

```bash
# Build both client and server bundles
npm run build

# Start the SSR server
npm run serve
```

### CDN Deployment

To deploy assets to a CDN:

1. Set up your CDN provider credentials as environment variables
2. Run the deployment script:

```bash
npm run deploy:cdn
```

For a complete deployment including build, optimization, CDN deployment, and server start:

```bash
npm run deploy
```

### Monitoring

Performance metrics are available in the browser console during development. In production, they are sent to the configured reporting endpoint.

## Performance Testing

We recommend regularly testing performance using the following tools:

- **Lighthouse**: For overall performance scoring
- **WebPageTest**: For detailed performance analysis
- **Chrome DevTools**: For local performance profiling
- **Real User Monitoring**: For actual user performance data

## Future Optimizations

Potential future optimizations include:

- **Streaming SSR**: For even faster initial page loads
- **Partial hydration**: To reduce client-side JavaScript
- **Edge computing**: To move more logic closer to users
- **Predictive prefetching**: Based on user navigation patterns

---

For questions or suggestions regarding performance optimizations, please contact the development team.
