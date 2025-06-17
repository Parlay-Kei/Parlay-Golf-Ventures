# Coding Standards

## Overview

This document outlines the coding standards and best practices for the Parlay Golf Ventures platform. These standards ensure code consistency, maintainability, and quality across the entire codebase.

## Table of Contents

1. [General Principles](#general-principles)
2. [TypeScript Standards](#typescript-standards)
3. [React Standards](#react-standards)
4. [JavaScript Standards](#javascript-standards)
5. [ESLint Configuration](#eslint-configuration)
6. [File Organization](#file-organization)
7. [Naming Conventions](#naming-conventions)
8. [Error Handling](#error-handling)
9. [Performance Guidelines](#performance-guidelines)
10. [Testing Standards](#testing-standards)

## General Principles

### Code Quality
- Write self-documenting code with clear variable and function names
- Keep functions small and focused on a single responsibility
- Use meaningful comments to explain complex logic
- Follow the DRY (Don't Repeat Yourself) principle
- Prioritize readability over cleverness

### Consistency
- Follow established patterns in the codebase
- Use consistent formatting and indentation
- Maintain consistent naming conventions
- Follow the same error handling patterns

## TypeScript Standards

### Type Safety
- **Avoid `any` types**: Use proper TypeScript interfaces and types
- **Use strict mode**: Enable strict TypeScript configuration when possible
- **Define interfaces**: Create interfaces for all data structures
- **Use generics**: Leverage TypeScript generics for reusable components

### Interface Definitions
```typescript
// ✅ Good: Proper interface definition
interface User {
  id: string;
  email: string;
  name: string;
  tier: 'free' | 'driven' | 'aspiring' | 'breakthrough';
  created_at: string;
}

// ❌ Bad: Using any type
interface User {
  id: any;
  email: any;
  name: any;
  tier: any;
  created_at: any;
}
```

### Error Handling
```typescript
// ✅ Good: Proper error interface
interface ApiError extends Error {
  status?: number;
  code?: string;
  context?: Record<string, unknown>;
}

// ✅ Good: Typed error handling
try {
  const result = await apiCall();
  return result;
} catch (error) {
  const apiError = error as ApiError;
  console.error('API Error:', apiError.message, apiError.status);
  throw apiError;
}

// ❌ Bad: Untyped error handling
try {
  const result = await apiCall();
  return result;
} catch (error: any) {
  console.error('Error:', error);
  throw error;
}
```

## React Standards

### Component Structure
- Use functional components with hooks
- Keep components focused and single-purpose
- Use proper TypeScript interfaces for props
- Implement proper error boundaries

### Hooks Best Practices
```typescript
// ✅ Good: Proper useEffect dependencies
useEffect(() => {
  const fetchData = async () => {
    const data = await api.getData();
    setData(data);
  };
  
  fetchData();
}, [api]); // Include all dependencies

// ✅ Good: Memoized callbacks
const handleClick = useCallback(() => {
  setCount(prev => prev + 1);
}, []); // Empty dependency array for stable reference

// ❌ Bad: Missing dependencies
useEffect(() => {
  fetchData(); // Missing fetchData in dependencies
}, []); // This will cause linting warnings
```

### State Management
```typescript
// ✅ Good: Proper state typing
const [user, setUser] = useState<User | null>(null);
const [loading, setLoading] = useState<boolean>(false);
const [error, setError] = useState<string | null>(null);

// ❌ Bad: Untyped state
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
```

## JavaScript Standards

### Variable Declarations
- **Use `const` by default**: Only use `let` when variables are reassigned
- **Prefer-const rule enforced**: ESLint will catch incorrect `let` usage
- **Clear variable intent**: Makes code more readable and maintainable

```javascript
// ✅ Good: Proper variable declarations
const API_BASE_URL = 'https://api.parlayventures.com';
const DEFAULT_TIMEOUT = 5000;

let currentUser = null; // Will be reassigned
let queryBuilder = supabase.from('users'); // Will be reassigned

// ❌ Bad: Using let for constants
let API_BASE_URL = 'https://api.parlayventures.com';
let DEFAULT_TIMEOUT = 5000;
```

### Variable Declaration Patterns
The codebase follows these patterns for variable declarations:

**Correctly Used `let` Declarations (Should Remain as `let`):**
- **Query builders**: `queryBuilder`, `searchQuery`, `query` - reassigned in conditional blocks
- **Filter variables**: `typeFilter`, `tier`, `allPosts`, `filtered` - reassigned based on conditions
- **Loop variables**: `i` in for loops, `result` in computation loops
- **State variables**: `count`, `success`, `results` - modified during execution
- **Access result objects**: `accessResult` - reassigned in conditional logic

**Use `const` for:**
- Configuration values
- Imported modules
- Function declarations
- Object/array literals that won't be reassigned
- Computed values that don't change

```javascript
// ✅ Good: Const for immutable values
const config = {
  apiUrl: 'https://api.parlayventures.com',
  timeout: 5000
};

const userRoles = ['admin', 'user', 'moderator'];

// ✅ Good: Let for reassigned variables
let currentFilter = 'all';
if (user.isAdmin) {
  currentFilter = 'admin';
}

// ❌ Bad: Let for constants
let config = {
  apiUrl: 'https://api.parlayventures.com',
  timeout: 5000
};
```

### Function Declarations
```javascript
// ✅ Good: Arrow functions for callbacks
const handleSubmit = (event) => {
  event.preventDefault();
  submitForm();
};

// ✅ Good: Function declarations for named functions
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ❌ Bad: Inconsistent function styles
var handleSubmit = function(event) {
  event.preventDefault();
  submitForm();
};
```

### Async/Await
```javascript
// ✅ Good: Proper async/await usage
async function fetchUserData(userId) {
  try {
    const response = await api.getUser(userId);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw error;
  }
}

// ❌ Bad: Promise chains
function fetchUserData(userId) {
  return api.getUser(userId)
    .then(response => response.data)
    .catch(error => {
      console.error('Failed to fetch user:', error);
      throw error;
    });
}
```

## ESLint Configuration

### Current Rules
```javascript
{
  rules: {
    ...reactHooks.configs.recommended.rules,
    "react-refresh/only-export-components": [
      "warn",
      { allowConstantExport: true },
    ],
    "@typescript-eslint/no-unused-vars": "off",
    "parlay/no-mock-data-import": "warn",
    "prefer-const": "error", // ✅ Enforces const declarations
  },
}
```

### Rule Explanations
- **prefer-const**: Enforces const declarations for variables that are never reassigned
- **react-hooks/exhaustive-deps**: Ensures all useEffect dependencies are properly declared
- **@typescript-eslint/no-explicit-any**: Prevents usage of `any` types
- **parlay/no-mock-data-import**: Warns about importing mock data in production

### Prefer-Const Rule Details
The `prefer-const` rule is configured as an error and will:

- **Enforce best practices**: Automatically suggests `const` for variables that are never reassigned
- **Improve code clarity**: Makes it clear which variables are immutable
- **Prevent accidental reassignment**: Catches cases where variables should be const but are declared as let
- **Better performance**: Const declarations can sometimes be optimized better by JavaScript engines

**Examples of what the rule catches:**
```javascript
// ❌ Bad: Will trigger prefer-const error
let API_URL = 'https://api.parlayventures.com';
let userConfig = { theme: 'dark' };

// ✅ Good: No prefer-const error
const API_URL = 'https://api.parlayventures.com';
const userConfig = { theme: 'dark' };

// ✅ Good: Let is correct here (variable is reassigned)
let currentUser = null;
if (isAuthenticated) {
  currentUser = getUserData();
}
```

### Running ESLint
```bash
# Check all files
npx eslint .

# Check specific file
npx eslint src/components/MyComponent.tsx

# Auto-fix issues
npx eslint . --fix

# Check only prefer-const rule
npx eslint . --rule "prefer-const: error"
```

## File Organization

### Directory Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components
│   ├── forms/          # Form components
│   └── layout/         # Layout components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── contexts/           # React contexts
├── lib/                # Utility libraries
│   ├── api/            # API utilities
│   ├── auth/           # Authentication utilities
│   └── utils/          # General utilities
├── types/              # TypeScript type definitions
└── styles/             # Global styles
```

### File Naming
- Use PascalCase for component files: `UserProfile.tsx`
- Use camelCase for utility files: `apiUtils.ts`
- Use kebab-case for CSS files: `user-profile.css`
- Use descriptive names that indicate the file's purpose

## Naming Conventions

### Variables and Functions
```typescript
// ✅ Good: Descriptive names
const userProfile = getUserProfile();
const isAuthenticated = checkAuthentication();
const handleUserLogin = async (credentials: LoginCredentials) => {};

// ❌ Bad: Unclear names
const data = getData();
const flag = checkFlag();
const func = async (params: any) => {};
```

### Constants
```typescript
// ✅ Good: UPPER_SNAKE_CASE for constants
const API_BASE_URL = 'https://api.parlayventures.com';
const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_TIMEOUT = 5000;

// ❌ Bad: Mixed case for constants
const apiBaseUrl = 'https://api.parlayventures.com';
const maxRetryAttempts = 3;
```

### Interfaces and Types
```typescript
// ✅ Good: PascalCase for interfaces
interface UserProfile {
  id: string;
  name: string;
  email: string;
}

type UserRole = 'admin' | 'user' | 'moderator';

// ❌ Bad: camelCase for interfaces
interface userProfile {
  id: string;
  name: string;
  email: string;
}
```

## Error Handling

### Consistent Error Patterns
```typescript
// ✅ Good: Proper error handling
try {
  const result = await apiCall();
  return result;
} catch (error) {
  if (error instanceof ApiError) {
    console.error('API Error:', error.message, error.status);
    throw error;
  }
  
  console.error('Unexpected error:', error);
  throw new Error('An unexpected error occurred');
}

// ❌ Bad: Generic error handling
try {
  const result = await apiCall();
  return result;
} catch (error: any) {
  console.error('Error:', error);
  throw error;
}
```

### Error Boundaries
```typescript
// ✅ Good: Typed error boundary
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}
```

## Performance Guidelines

### React Performance
- Use `React.memo` for expensive components
- Implement `useCallback` for stable function references
- Use `useMemo` for expensive calculations
- Avoid creating objects in render functions

```typescript
// ✅ Good: Optimized component
const ExpensiveComponent = React.memo(({ data, onUpdate }: Props) => {
  const processedData = useMemo(() => {
    return data.map(item => ({ ...item, processed: true }));
  }, [data]);

  const handleUpdate = useCallback((id: string) => {
    onUpdate(id);
  }, [onUpdate]);

  return (
    <div>
      {processedData.map(item => (
        <Item key={item.id} item={item} onUpdate={handleUpdate} />
      ))}
    </div>
  );
});

// ❌ Bad: Unoptimized component
const ExpensiveComponent = ({ data, onUpdate }: Props) => {
  const processedData = data.map(item => ({ ...item, processed: true })); // Recreated on every render

  const handleUpdate = (id: string) => { // New function on every render
    onUpdate(id);
  };

  return (
    <div>
      {processedData.map(item => (
        <Item key={item.id} item={item} onUpdate={handleUpdate} />
      ))}
    </div>
  );
};
```

### Bundle Optimization
- Use dynamic imports for code splitting
- Implement lazy loading for routes
- Optimize images and assets
- Use tree shaking effectively

```typescript
// ✅ Good: Code splitting
const LazyComponent = React.lazy(() => import('./LazyComponent'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <LazyComponent />
    </Suspense>
  );
}

// ❌ Bad: No code splitting
import LazyComponent from './LazyComponent'; // Loaded immediately
```

## Testing Standards

### Unit Testing
- Write tests for all utility functions
- Test component behavior, not implementation
- Use meaningful test descriptions
- Maintain good test coverage

```typescript
// ✅ Good: Comprehensive test
describe('UserProfile', () => {
  it('should display user information when data is loaded', () => {
    const mockUser = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com'
    };

    render(<UserProfile user={mockUser} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('should show loading state when user data is not available', () => {
    render(<UserProfile user={null} />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});

// ❌ Bad: Incomplete test
describe('UserProfile', () => {
  it('should work', () => {
    render(<UserProfile />);
    // No assertions
  });
});
```

### Integration Testing
- Test component interactions
- Verify API calls and responses
- Test error scenarios
- Ensure proper state management

## Code Review Checklist

### Before Submitting
- [ ] Code follows established patterns
- [ ] All TypeScript errors are resolved
- [ ] ESLint passes without errors
- [ ] Tests are written and passing
- [ ] Error handling is implemented
- [ ] Performance considerations are addressed
- [ ] Documentation is updated

### During Review
- [ ] Code is readable and maintainable
- [ ] Proper error handling is in place
- [ ] Performance implications are considered
- [ ] Security concerns are addressed
- [ ] Accessibility requirements are met

## Resources

### Documentation
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [ESLint Rules](https://eslint.org/docs/rules/)

### Tools
- TypeScript Compiler
- ESLint with TypeScript support
- Prettier for code formatting
- Jest for testing

### Team Guidelines
- Always use `const` unless variable reassignment is required
- Create proper interfaces for all data structures
- Implement consistent error handling patterns
- Use proper typing for all component props and state
- Write tests for new functionality
- Update documentation when making changes
