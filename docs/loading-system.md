# Standardized Loading System

## Overview

This document outlines the standardized loading system for the Parlay Golf Ventures platform. The system provides a consistent approach to handling loading states, error states, and retry logic throughout the application.

## Components

### 1. `useLoadingOverlay` Hook

A versatile hook that provides a unified API for managing loading states, with support for both local component loading and global loading overlay.

```tsx
import { useLoadingOverlay } from '@/hooks/useLoadingOverlay';

function MyComponent() {
  const { 
    isLoading, 
    loadingMessage, 
    error, 
    startLoading, 
    stopLoading, 
    withLoading 
  } = useLoadingOverlay({
    defaultMessage: 'Loading data...',
    useGlobalOverlay: false, // Use local loading state by default
    minLoadingTime: 500,      // Prevent flickering
    retryCount: 3             // Auto-retry on failure
  });
  
  // Example: Load data with loading state
  const fetchData = async () => {
    try {
      const data = await withLoading(
        () => api.fetchData(),
        'Fetching latest data...'
      );
      setData(data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };
  
  return (
    <div>
      <button onClick={fetchData} disabled={isLoading}>
        Refresh Data
      </button>
      
      <LoadingState isLoading={isLoading} error={error}>
        {/* Content to show when not loading */}
        <DataDisplay data={data} />
      </LoadingState>
    </div>
  );
}
```

### 2. `LoadingState` Component

A standardized component for handling loading, error, and success states with consistent styling and behavior.

```tsx
import { LoadingState } from '@/components/ui/loading-state';

function ProductCard() {
  const { isLoading, error, loadingMessage } = useLoadingOverlay();
  
  return (
    <LoadingState
      isLoading={isLoading}
      error={error}
      variant="card"  // Options: 'card', 'text', 'image', 'spinner', 'inline'
      size="md"       // Options: 'sm', 'md', 'lg'
      loadingMessage={loadingMessage}
    >
      {/* Content to show when not loading */}
      <div className="product-card">
        <h3>{product.name}</h3>
        <p>{product.description}</p>
      </div>
    </LoadingState>
  );
}
```

### 3. `GlobalLoadingOverlay` Component

A full-screen loading overlay that connects to the global loading context.

```tsx
// Already included in App.tsx
import { GlobalLoadingOverlay } from '@/components/ui/loading-state';

function App() {
  return (
    <div className="app">
      <GlobalLoadingOverlay />
      {/* Rest of your app */}
    </div>
  );
}
```

## Usage Patterns

### 1. Component-Level Loading

For loading states that only affect a specific component:

```tsx
function UserProfile() {
  const { isLoading, error, withLoading } = useLoadingOverlay();
  const [profile, setProfile] = useState(null);
  
  const loadProfile = async () => {
    try {
      const data = await withLoading(
        () => api.getUserProfile(),
        'Loading profile...'
      );
      setProfile(data);
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };
  
  useEffect(() => {
    loadProfile();
  }, []);
  
  return (
    <LoadingState
      isLoading={isLoading}
      error={error}
      variant="card"
    >
      {profile && (
        <div>
          <h2>{profile.name}</h2>
          <p>{profile.bio}</p>
        </div>
      )}
    </LoadingState>
  );
}
```

### 2. Global Loading Overlay

For operations that should block the entire UI (like form submissions):

```tsx
function SubmitForm() {
  const { withLoading } = useLoadingOverlay({ 
    useGlobalOverlay: true  // This will use the global overlay
  });
  
  const handleSubmit = async (formData) => {
    try {
      await withLoading(
        () => api.submitForm(formData),
        'Submitting your information...'
      );
      toast.success('Form submitted successfully!');
    } catch (error) {
      toast.error('Failed to submit form');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit">Submit</button>
    </form>
  );
}
```

### 3. Inline Loading Indicators

For small UI elements like buttons:

```tsx
function FollowButton({ userId }) {
  const { isLoading, withLoading } = useLoadingOverlay();
  const [isFollowing, setIsFollowing] = useState(false);
  
  const toggleFollow = async () => {
    try {
      const result = await withLoading(
        () => isFollowing ? api.unfollowUser(userId) : api.followUser(userId)
      );
      setIsFollowing(result.isFollowing);
    } catch (error) {
      toast.error('Failed to update follow status');
    }
  };
  
  return (
    <button onClick={toggleFollow} disabled={isLoading}>
      <LoadingState
        isLoading={isLoading}
        variant="inline"
        size="sm"
        loadingMessage=""
      >
        {isFollowing ? 'Unfollow' : 'Follow'}
      </LoadingState>
    </button>
  );
}
```

## Best Practices

1. **Use Component-Level Loading by Default**: Only use the global overlay for operations that should block the entire UI.

2. **Set Appropriate Loading Messages**: Provide clear loading messages that describe what's happening.

3. **Handle Errors Gracefully**: Always handle errors and provide retry options when appropriate.

4. **Choose the Right Variant**: Use the appropriate loading variant based on the content being loaded:
   - `card`: For loading card-like components
   - `text`: For loading text content
   - `image`: For loading images
   - `spinner`: For general loading states
   - `inline`: For inline elements like buttons

5. **Set Minimum Loading Time**: For better UX, set a minimum loading time to prevent flickering for fast operations.

## Migration Guide

To migrate existing loading implementations to the new standardized system:

1. Replace `LoadingScreen` with `LoadingState` component
2. Replace direct uses of `useLoading()` with `useLoadingOverlay()`
3. Replace inline loading indicators with the `LoadingState` component using the `inline` variant
4. Replace loading skeletons with `LoadingState` using the appropriate variant

## Example Migration

### Before:

```tsx
import { useLoading } from '@/contexts/LoadingContext';

function ProductList() {
  const { isLoading, setLoading } = useLoading();
  const [products, setProducts] = useState([]);
  
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchProducts();
  }, []);
  
  if (isLoading) {
    return <div>Loading products...</div>;
  }
  
  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### After:

```tsx
import { useLoadingOverlay } from '@/hooks/useLoadingOverlay';
import { LoadingState } from '@/components/ui/loading-state';

function ProductList() {
  const { isLoading, error, withLoading } = useLoadingOverlay({
    defaultMessage: 'Loading products...'
  });
  const [products, setProducts] = useState([]);
  
  const fetchProducts = async () => {
    try {
      const data = await withLoading(
        () => api.getProducts()
      );
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };
  
  useEffect(() => {
    fetchProducts();
  }, []);
  
  return (
    <LoadingState
      isLoading={isLoading}
      error={error}
      variant="card"
      onRetry={fetchProducts}
    >
      <div>
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </LoadingState>
  );
}
```
