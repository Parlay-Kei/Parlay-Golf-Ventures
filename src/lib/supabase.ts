import { createClient, SupabaseClient, AuthChangeEvent, Session, User, UserResponse, AuthError } from '@supabase/supabase-js'
import { IS_DEV_ENV, DEV_CONFIG } from './config/env'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Define interfaces for better type safety
interface MockAuthSubscription {
  unsubscribe: () => void;
}

interface MockAuthStateChangeResponse {
  data: {
    subscription: MockAuthSubscription;
  };
}

interface MockAuthResponse {
  error: AuthError | null;
  data: {
    user: User | null;
    session: Session | null;
  };
}

// Mock query builder that matches real Supabase client's method chain signatures
interface MockQueryBuilder {
  eq: (column: string, value: string | number | boolean) => MockQueryBuilder;
  in: (column: string, values: (string | number | boolean)[]) => MockQueryBuilder;
  containedBy: (column: string, values: (string | number | boolean)[]) => MockQueryBuilder;
  textSearch: (column: string, query: string, options?: Record<string, unknown>) => MockQueryBuilder;
  single: () => Promise<{ data: unknown | null; error: AuthError | null }>;
  order: (column: string, options?: Record<string, unknown>) => MockQueryBuilder;
  limit: (count: number) => MockQueryBuilder;
  range: (from: number, to: number) => MockQueryBuilder;
  select: (columns?: string | string[], options?: Record<string, unknown>) => MockQueryBuilder;
  // The final method that returns a Promise
  then: (onfulfilled: (value: { data: unknown[]; error: AuthError | null; count?: number }) => unknown) => Promise<unknown>;
  // Add Promise methods to make it compatible with real client
  catch: (onrejected: (reason: unknown) => unknown) => Promise<unknown>;
  finally: (onfinally: () => void) => Promise<unknown>;
  [Symbol.toStringTag]: string;
}

interface MockTableBuilder {
  select: (columns?: string) => MockQueryBuilder;
  insert: (values: Record<string, unknown>) => MockQueryBuilder;
  update: (values: Record<string, unknown>) => MockQueryBuilder;
  delete: () => MockQueryBuilder;
  upsert: (values: Record<string, unknown>) => MockQueryBuilder;
}

interface MockStorageBucket {
  upload: () => Promise<{ data: unknown | null; error: AuthError | null }>;
  download: () => Promise<{ data: unknown | null; error: AuthError | null }>;
  getPublicUrl: () => { data: { publicUrl: string } };
  list: () => Promise<{ data: unknown[]; error: AuthError | null }>;
  remove: () => Promise<{ data: unknown | null; error: AuthError | null }>;
}

interface MockSupabaseClient {
  auth: {
    getSession: () => Promise<{ data: { session: Session | null } }>;
    onAuthStateChange: (callback: (event: AuthChangeEvent, session: Session | null) => void) => MockAuthStateChangeResponse;
    signInWithPassword: () => Promise<MockAuthResponse>;
    signUp: () => Promise<MockAuthResponse>;
    signOut: () => Promise<{ error: AuthError | null }>;
    resetPasswordForEmail: () => Promise<{ error: AuthError | null }>;
    updateUser: (data: Record<string, unknown>) => Promise<{ error: AuthError | null; data: UserResponse | null }>;
  };
  from: (table: string) => MockTableBuilder;
  rpc: (fn: string, params: Record<string, unknown>) => Promise<{ data: unknown | null; error: AuthError | null }>;
  storage: {
    from: (bucket: string) => MockStorageBucket;
  };
}

// Create a mock query builder that matches real Supabase client's method chain
const createMockQueryBuilder = (): MockQueryBuilder => {
  const builder: MockQueryBuilder = {
    eq: (column, value) => builder,
    in: (column, values) => builder,
    containedBy: (column, values) => builder,
    textSearch: (column, query, options) => builder,
    single: () => Promise.resolve({ data: null, error: null }),
    order: (column, options) => builder,
    limit: (count) => builder,
    range: (from, to) => builder,
    select: (columns, options) => builder,
    then: (onfulfilled) => Promise.resolve(onfulfilled({ data: [], error: null, count: 0 })),
    catch: (onrejected) => Promise.resolve(onrejected(new Error('Mock error'))),
    finally: (onfinally) => {
      onfinally();
      return Promise.resolve({ data: [], error: null, count: 0 });
    },
    [Symbol.toStringTag]: 'MockQueryBuilder'
  };
  return builder;
};

// Create a more robust mock Supabase client for development when environment variables are missing
const createMockClient = (): MockSupabaseClient => {
  console.warn('Using mock Supabase client in development mode');
  
  // Return a mock client with the same API shape but no actual functionality
  return {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: (callback: (event: AuthChangeEvent, session: Session | null) => void) => {
        // Return a mock subscription that does nothing
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
      signInWithPassword: () => Promise.resolve({ error: null, data: { user: null, session: null } }),
      signUp: () => Promise.resolve({ error: null, data: { user: null, session: null } }),
      signOut: () => Promise.resolve({ error: null }),
      resetPasswordForEmail: () => Promise.resolve({ error: null }),
      updateUser: () => Promise.resolve({ error: null, data: { user: null } })
    },
    from: (table: string) => ({
      select: (columns: string = '*') => createMockQueryBuilder(),
      insert: (values: Record<string, unknown>) => createMockQueryBuilder(),
      update: (values: Record<string, unknown>) => createMockQueryBuilder(),
      delete: () => createMockQueryBuilder(),
      upsert: (values: Record<string, unknown>) => createMockQueryBuilder()
    }),
    rpc: (fn: string, params: Record<string, unknown>) => Promise.resolve({ data: null, error: null }),
    storage: {
      from: (bucket: string) => ({
        upload: () => Promise.resolve({ data: null, error: null }),
        download: () => Promise.resolve({ data: null, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: 'https://example.com/mock-image.jpg' } }),
        list: () => Promise.resolve({ data: [], error: null }),
        remove: () => Promise.resolve({ data: null, error: null })
      })
    }
  };
};

// Initialize Supabase client with enhanced error handling
let supabase: SupabaseClient | MockSupabaseClient;

try {
  if (!supabaseUrl || !supabaseAnonKey) {
    if (IS_DEV_ENV) {
      console.warn('Missing Supabase environment variables. Using mock client in development mode.');
      supabase = createMockClient();
    } else {
      console.error('Missing Supabase environment variables in production environment.');
      // In production, still create a mock client but log the error
      // This prevents the app from crashing completely
      supabase = createMockClient();
    }
  } else {
    // Create the real Supabase client with the provided credentials
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('Supabase client initialized successfully');
  }
} catch (error) {
  console.error('Error initializing Supabase client:', error);
  
  // Always create a mock client on error to prevent app crashes
  console.warn('Using mock Supabase client due to initialization error');
  supabase = createMockClient();
}

export { supabase }