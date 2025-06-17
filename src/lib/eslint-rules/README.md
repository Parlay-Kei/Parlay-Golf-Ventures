# Custom ESLint Rules for Parlay Golf Ventures

## No Mock Data Import Rule

### Rule: `parlay/no-mock-data-import`

This rule ensures that mock data is only imported when the `USE_MOCK_DATA` configuration is set to true. This helps prevent accidental use of mock data in production builds.

### Rule Details

The rule checks for imports that appear to be mock data (containing terms like "mock", "fake", "dummy", etc.) and ensures they are only imported when properly guarded by a conditional check of `USE_MOCK_DATA`.

#### ❌ Examples of incorrect code for this rule:

```js
// Directly importing mock data without checking USE_MOCK_DATA
import { MOCK_PROFILES } from './mockData';

// Using mock data in a component without conditional check
import { mockUserData } from '../../lib/mockUserData';
```

#### ✅ Examples of correct code for this rule:

```js
// Importing mock data conditionally
import { DEV_CONFIG } from '@/lib/config/env';

let mockData;
if (DEV_CONFIG.DATABASE.USE_MOCK_DATA) {
  // Only import mock data when USE_MOCK_DATA is true
  mockData = await import('./mockData');
}

// Using the helper functions from devDataProvider
import { shouldUseMockData } from '@/lib/devDataProvider';

if (shouldUseMockData()) {
  // Only import mock data when shouldUseMockData returns true
  const { MOCK_PROFILES } = await import('./mockData');
}
```

### When Not To Use It

If you don't care about accidentally shipping mock data in production builds, you can disable this rule. However, this is generally not recommended.

### Further Reading

See the [DEV_CONFIG documentation](../../docs/DEV_CONFIG.md) for more information on the Mock vs Live data toggle functionality.
