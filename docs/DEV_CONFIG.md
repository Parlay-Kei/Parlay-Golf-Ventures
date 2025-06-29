# Development Configuration Guide

## Mock vs Live Data Toggle

The Parlay Golf Ventures platform includes a flexible development configuration system that allows developers to control how the application interacts with the database during development. This is particularly useful for working on UI components without needing a complete database setup.

### Configuration Options

In `src/lib/config/env.ts`, the following options are available under `DEV_CONFIG.DATABASE`:

```typescript
DATABASE: {
  // Set to true to use mock data instead of real database calls
  USE_MOCK_DATA: IS_DEV_ENV,
  
  // Set to true to always use mock data even if database tables exist
  FORCE_MOCK_DATA: false,
  
  // Set to true to attempt real database calls first, then fall back to mock data
  // When false, mock data will be used exclusively if USE_MOCK_DATA is true
  TRY_LIVE_FIRST: true,
  
  // Set to true to log database operations
  DEBUG_DB: IS_DEV_ENV,
}
```

### Usage Modes

#### 1. Live Data Mode (Default in Production)

In production, the application always attempts to use real database connections. If `USE_MOCK_DATA` is false (default in production), mock data will never be used.

#### 2. Live First, Mock Fallback (Default in Development)

When `USE_MOCK_DATA` is true and `TRY_LIVE_FIRST` is true (default in development), the application will:

1. First attempt to connect to the real database
2. If the connection fails or tables don't exist, it will automatically fall back to mock data
3. This allows for a smooth development experience even when the database schema is incomplete

#### 3. Mock Data Only

When `USE_MOCK_DATA` is true and `TRY_LIVE_FIRST` is false, the application will:

1. Skip real database connections entirely
2. Use mock data for all operations
3. This is useful for UI development without any database dependency

#### 4. Force Mock Data

When `FORCE_MOCK_DATA` is true, the application will:

1. Always use mock data regardless of database availability
2. This overrides `TRY_LIVE_FIRST` setting
3. Useful for testing the mock data implementation or working offline

### Debugging

When `DEBUG_DB` is true, the application will log detailed information about database operations, including:

1. When mock data is being used
2. When fallbacks occur due to database errors
3. Details about the operations being performed

### Helper Functions

The `devDataProvider` exports several helper functions to check the current mode:

```typescript
// Check if mock data should be used at all
devDataProvider.shouldUseMockData()

// Check if we should try live data first before falling back to mock
devDataProvider.shouldTryLiveFirst()

// Check if we should force mock data regardless of database availability
devDataProvider.shouldForceMockData()
```

### Example Component

A demonstration component is available at `src/components/examples/MockDataToggleDemo.tsx` that shows how to use the "Mock vs Live" toggle in your own components. This component provides a UI for:

1. Toggling between different mock data modes
2. Visualizing the current configuration
3. Displaying data from the data provider with the current settings
4. Showing which data source (mock or live) was used

To use this component in your application, import and render it:

```tsx
import { MockDataToggleDemo } from '@/components/examples/MockDataToggleDemo';

// Then in your component:
<MockDataToggleDemo />
```

### Example: Configuring for Different Scenarios

#### Scenario 1: Working on UI with No Database

```typescript
// In src/lib/config/env.ts
DATABASE: {
  USE_MOCK_DATA: true,
  FORCE_MOCK_DATA: true,  // Always use mock data
  TRY_LIVE_FIRST: false,  // Don't try real DB first
  DEBUG_DB: true,         // See what's happening
}
```

#### Scenario 2: Working with Partial Database

```typescript
// In src/lib/config/env.ts
DATABASE: {
  USE_MOCK_DATA: true,
  FORCE_MOCK_DATA: false,  // Don't force mock data
  TRY_LIVE_FIRST: true,    // Try real DB first
  DEBUG_DB: true,          // See what's happening
}
```

#### Scenario 3: Production-like Testing

```typescript
// In src/lib/config/env.ts
DATABASE: {
  USE_MOCK_DATA: false,   // No mock data
  FORCE_MOCK_DATA: false,  // Don't force mock data
  TRY_LIVE_FIRST: true,    // Try real DB first
  DEBUG_DB: false,         // No debug logs
}
```

### Using in Your Components

To use the mock data configuration in your own components, follow this pattern:

```typescript
import { devDataProvider } from '@/lib/devDataProvider';
import { DEV_CONFIG } from '@/lib/config/env';

async function fetchData() {
  try {
    // Use the data provider methods which automatically handle mock data
    const result = await devDataProvider.profiles.getAll();
    
    // You can also check the current mode
    if (devDataProvider.shouldUseMockData()) {
      console.log('Using mock data mode');
    }
    
    return result.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
}

```

## Global Error Boundaries & Error Handling (2024 Update)

### Overview
The platform now implements a comprehensive global error boundary system to catch and handle errors at all critical UI boundaries, including:
- All top-level routes (pages)
- All dialogs and modals
- All Suspense/lazy-loaded async boundaries

All errors are reported to Sentry for monitoring, and user-friendly fallback UIs are shown to prevent white screens.

---

### ErrorBoundary Usage
- Use the `ErrorBoundary` component to wrap any React subtree (route, modal, dialog, etc.).
- For function components, use the `withErrorBoundary` HOC for convenience.
- Always provide a unique `routeName` prop for Sentry context.

**Example:**
```tsx
import withErrorBoundary from '@/components/withErrorBoundary';

function MyPage() {
  // ...
}

export default withErrorBoundary(MyPage, 'my-page');
```

---

### Async Error Handling
- All `Suspense`/lazy-loaded boundaries are wrapped with `ErrorBoundary`.
- If you add a new Suspense boundary, wrap it with `ErrorBoundary` and provide a `routeName`.

**Example:**
```tsx
import ErrorBoundary from '@/components/ErrorBoundary';

<ErrorBoundary routeName="my-suspense">
  <Suspense fallback={<MyLoader />}>
    <MyAsyncComponent />
  </Suspense>
</ErrorBoundary>
```

---

### Dialogs & Modals
- All dialogs and alert dialogs in `src/components/ui/dialog.tsx` and `src/components/ui/alert-dialog.tsx` are automatically wrapped with `ErrorBoundary`.
- If you create a custom modal, wrap its content with `ErrorBoundary`.

---

### Fallback UIs
- Fallback UIs are provided for general, dashboard, and admin errors.
- You can pass a custom `fallback` prop to `ErrorBoundary` for context-specific UI.

---

### Sentry Integration
- All errors caught by `ErrorBoundary` are reported to Sentry with route/component context.
- Sentry DSN is configured via `VITE_SENTRY_DSN` in your environment.
- See `src/lib/services/errorMonitoring.ts` for details.

---

### Manual Testing
- To test error boundaries, throw an error in a component and verify:
  - The fallback UI appears (no white screen)
  - The error is logged to Sentry
- Check the Sentry dashboard for error reports.

---

### Audit Coverage
- All top-level routes, dialogs, and async boundaries are protected.
- No user should see a blank/white screen on error.
- All errors are logged for monitoring and debugging.

---

For questions or to extend error handling, see `src/components/ErrorBoundary.tsx` and `src/components/withErrorBoundary.tsx`.

## Vite Dev Server Port Configuration

The Vite dev server is configured to run on port 8080 by default. If port 8080 is in use, Vite will attempt to use the next available port (e.g., 8081). To explicitly set the port, update the `server.port` value in `vite.config.ts` or use the `--port` flag when running `npm run dev`:

```bash
npm run dev -- --port=8080
```

If you encounter a port conflict, kill the process using the port or choose a different port.

---

## Supabase Table Verification Script

A script is provided to verify that all required Supabase tables exist and are correctly configured:

- Script: `scripts/verify-supabase-tables.js`
- Usage:
  ```bash
  npm run verify:supabase
  ```
- Purpose: Checks for missing or misconfigured tables, columns, and RLS policies. Run this after migrations or before deployment to ensure data integrity.

---

## Netlify Deployment & Environment Variables

To deploy to Netlify, ensure the following environment variables are set in the Netlify dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SENTRY_DSN`
- `VITE_STRIPE_PUBLIC_KEY`

Sentry monitoring is enabled in all environments where `VITE_SENTRY_DSN` is set. See the Sentry dashboard for error reports.

---

## Lint and TypeScript Policy

All lint and TypeScript errors must be resolved before merging to main. See `docs/developer-todo-list.md` for the zero-lint and zero-`any` policy. Run:

```bash
npm run lint
npm run type-check
```

---

## Mobile Navigation Accessibility

The mobile navigation menu now includes:
- Focus trap (keyboard focus stays within menu)
- Keyboard navigation (Tab, Shift+Tab, Arrow keys, Escape to close)
- Screen reader compatibility (ARIA roles and labels)
- Touch and mouse support

**Testing Checklist:**
- [x] Tab/Shift+Tab cycles through menu items
- [x] Arrow keys navigate between items
- [x] Escape closes the menu
- [x] Menu is announced by screen readers
- [x] Works on iOS, Android, and desktop browsers

---

## 2025 Bundle-Size & Dependency Optimization Audit

A comprehensive audit and optimization pass was completed in June 2025. The following improvements were made to minimize bundle size and maximize performance:

- **Manual chunking in Vite:** All major libraries (react, framer-motion, radix, stripe, supabase) are split into separate chunks for better caching and smaller initial loads.
- **Stripe and Supabase lazy-loading:** Stripe and Supabase clients are only loaded when needed (e.g., on checkout or file upload), not in the initial bundle.
- **No SendGrid, react-select, or axios in client:** Confirmed that no server-only or heavy client libraries are present in the browser bundle.
- **Optimal date-fns usage:** Only named imports are used, with no wildcard or unnecessary locale imports.
- **Radix UI per-component imports:** Only the components actually used are imported, not the whole suite.
- **Single version of tailwind-merge:** Confirmed only one version is present, avoiding duplication.

**Result:**
- The project is now highly optimized for bundle size and performance. All major sources of bloat have been addressed, and the codebase is ready for fast, efficient production builds.

---
