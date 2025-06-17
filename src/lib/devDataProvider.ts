/**
 * Development Data Provider
 * 
 * This module provides a consistent interface for accessing data during development,
 * ensuring schema parity between mock data and production data.
 * 
 * It automatically detects development mode and provides mock data when tables
 * don't exist or when explicitly requested.
 */

import { supabase } from './supabase';
import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { DEV_CONFIG } from './config/env';

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// Helper function to determine if we should use mock data
export const shouldUseMockData = () => {
  return isDevelopment && DEV_CONFIG.DATABASE.USE_MOCK_DATA;
};

// Helper function to determine if we should try live data first
export const shouldTryLiveFirst = () => {
  return shouldUseMockData() && DEV_CONFIG.DATABASE.TRY_LIVE_FIRST && !DEV_CONFIG.DATABASE.FORCE_MOCK_DATA;
};

// Helper function to determine if we should force mock data
export const shouldForceMockData = () => {
  return shouldUseMockData() && DEV_CONFIG.DATABASE.FORCE_MOCK_DATA;
};

// Type definitions to ensure schema parity
export interface BaseRecord {
  id: string;
  created_at: string;
  updated_at?: string;
}

export interface Profile extends BaseRecord {
  user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  bio?: string;
  handicap?: number;
  role?: string;
  preferences?: Record<string, unknown>;
}

export interface ContentItem extends BaseRecord {
  title: string;
  description?: string;
  type: 'video' | 'article' | 'guide' | 'drill';
  status: 'draft' | 'pending' | 'active' | 'archived';
  author_id?: string;
  content?: string;
  media_url?: string;
  thumbnail_url?: string;
  tags?: string[];
  view_count?: number;
  like_count?: number;
}

export interface Tournament extends BaseRecord {
  name: string;
  description?: string;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  start_date: string;
  end_date?: string;
  location?: string;
  max_participants?: number;
  current_participants?: number;
  entry_fee?: number;
  prize_pool?: number;
}

export interface Submission extends BaseRecord {
  title: string;
  description?: string;
  type: 'video' | 'article' | 'guide' | 'drill';
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  author_id: string;
  content?: string;
  media_url?: string;
  thumbnail_url?: string;
  tags?: string[];
  feedback?: string;
  reviewer_id?: string;
}

export interface Notification extends BaseRecord {
  user_id?: string;
  title: string;
  message: string;
  type: 'system' | 'content' | 'user' | 'tournament';
  read: boolean;
  action_url?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface Subscription extends BaseRecord {
  user_id: string;
  plan_id: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  stripe_subscription_id: string;
  stripe_customer_id: string;
}

export interface Customer extends BaseRecord {
  user_id: string;
  stripe_customer_id: string;
  email: string;
  name?: string;
  phone?: string;
  address?: Record<string, unknown>;
  payment_method_id?: string;
}

export interface PaymentMethod extends BaseRecord {
  customer_id: string;
  stripe_payment_method_id: string;
  type: 'card' | 'bank_account';
  last4: string;
  exp_month?: number;
  exp_year?: number;
  is_default: boolean;
}

export interface Invoice extends BaseRecord {
  subscription_id: string;
  user_id: string;
  stripe_invoice_id: string;
  amount: number;
  status: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void';
  due_date: string;
  paid_at?: string;
  pdf_url?: string;
}

export interface BetaInvite extends BaseRecord {
  code: string;
  email?: string;
  status: 'unused' | 'sent' | 'used';
  expires_at?: string;
  used_at?: string;
  used_by?: string;
}

export interface BetaUser extends BaseRecord {
  user_id: string;
  invite_code: string;
  status: 'active' | 'inactive';
  feedback_count?: number;
}

export interface BetaFeedback extends BaseRecord {
  user_id: string;
  category: 'bug' | 'feature' | 'improvement' | 'other';
  title: string;
  description: string;
  status: 'new' | 'in_review' | 'planned' | 'completed' | 'declined';
  priority?: 'low' | 'medium' | 'high';
  response?: string;
}

export interface AuditLog extends BaseRecord {
  user_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
}

// Mock data generators
const generateId = () => Math.random().toString(36).substring(2, 15);

const generateDate = (daysOffset = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString();
};

const generateRandomItem = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

// Mock data collections
const MOCK_PROFILES: Profile[] = Array.from({ length: 50 }, (_, i) => ({
  id: `profile-${i + 1}`,
  user_id: `user-${i + 1}`,
  email: `user${i + 1}@example.com`,
  first_name: ['John', 'Jane', 'Michael', 'Emily', 'David', 'Sarah'][i % 6],
  last_name: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller'][i % 6],
  avatar_url: i % 3 === 0 ? `https://randomuser.me/api/portraits/${i % 2 ? 'men' : 'women'}/${i % 70}.jpg` : undefined,
  bio: i % 4 === 0 ? `Golf enthusiast with ${5 + i % 20} years of experience.` : undefined,
  handicap: i % 3 === 0 ? Math.floor(Math.random() * 30) : undefined,
  role: generateRandomItem(['member', 'student', 'mentor', 'content-creator', 'admin']),
  created_at: generateDate(-Math.floor(Math.random() * 365)),
  updated_at: generateDate(-Math.floor(Math.random() * 30)),
}));

const MOCK_CONTENT_ITEMS: ContentItem[] = [
  {
    id: 'content-1',
    title: 'Mastering Your Drive: Distance and Accuracy',
    description: 'Learn how to maximize your driving distance while maintaining accuracy.',
    type: 'video',
    status: 'active',
    author_id: 'user-5',
    media_url: 'https://example.com/videos/mastering-drive.mp4',
    thumbnail_url: 'https://example.com/thumbnails/mastering-drive.jpg',
    tags: ['driving', 'technique', 'beginner'],
    view_count: 1245,
    like_count: 87,
    created_at: generateDate(-45),
    updated_at: generateDate(-2),
  },
  {
    id: 'content-2',
    title: 'Putting Fundamentals: The Perfect Stroke',
    description: 'Master the fundamentals of putting with these proven techniques.',
    type: 'article',
    status: 'active',
    author_id: 'user-8',
    content: 'Putting is often considered the most important aspect of golf...',
    thumbnail_url: 'https://example.com/thumbnails/putting-fundamentals.jpg',
    tags: ['putting', 'technique', 'beginner'],
    view_count: 982,
    like_count: 65,
    created_at: generateDate(-30),
    updated_at: generateDate(-5),
  },
  {
    id: 'content-3',
    title: 'Sand Trap Recovery: Advanced Techniques',
    description: 'Learn how to escape sand traps like a pro with these advanced techniques.',
    type: 'video',
    status: 'active',
    author_id: 'user-12',
    media_url: 'https://example.com/videos/sand-trap-recovery.mp4',
    thumbnail_url: 'https://example.com/thumbnails/sand-trap-recovery.jpg',
    tags: ['bunker', 'technique', 'advanced'],
    view_count: 756,
    like_count: 43,
    created_at: generateDate(-20),
    updated_at: generateDate(-1),
  },
  {
    id: 'content-4',
    title: 'Course Management: Strategic Play',
    description: 'Improve your scores with better course management and strategic decision-making.',
    type: 'guide',
    status: 'active',
    author_id: 'user-3',
    content: 'Course management is the art of playing to your strengths...',
    thumbnail_url: 'https://example.com/thumbnails/course-management.jpg',
    tags: ['strategy', 'course-management', 'intermediate'],
    view_count: 1102,
    like_count: 91,
    created_at: generateDate(-15),
    updated_at: generateDate(-3),
  },
  {
    id: 'content-5',
    title: 'Mental Game: Focus and Confidence',
    description: 'Develop the mental strength needed to perform under pressure.',
    type: 'article',
    status: 'pending',
    author_id: 'user-7',
    content: 'The mental aspect of golf is often overlooked but is crucial for success...',
    thumbnail_url: 'https://example.com/thumbnails/mental-game.jpg',
    tags: ['mental-game', 'psychology', 'intermediate'],
    view_count: 0,
    like_count: 0,
    created_at: generateDate(-2),
    updated_at: generateDate(-1),
  },
];

const MOCK_TOURNAMENTS: Tournament[] = [
  {
    id: 'tournament-1',
    name: 'Summer Championship 2025',
    description: 'Annual summer championship with prizes for all skill levels.',
    status: 'upcoming',
    start_date: generateDate(30),
    end_date: generateDate(32),
    location: 'Pebble Beach Golf Links, California',
    max_participants: 100,
    current_participants: 67,
    entry_fee: 150,
    prize_pool: 5000,
    created_at: generateDate(-60),
    updated_at: generateDate(-5),
  },
  {
    id: 'tournament-2',
    name: 'Pro-Am Charity Event',
    description: 'Play alongside professionals in this charity fundraiser.',
    status: 'upcoming',
    start_date: generateDate(45),
    end_date: generateDate(45),
    location: 'TPC Sawgrass, Florida',
    max_participants: 50,
    current_participants: 32,
    entry_fee: 250,
    prize_pool: 10000,
    created_at: generateDate(-45),
    updated_at: generateDate(-2),
  },
  {
    id: 'tournament-3',
    name: 'Regional Qualifier',
    description: 'Qualify for the national championship through this regional event.',
    status: 'upcoming',
    start_date: generateDate(60),
    end_date: generateDate(61),
    location: 'Bethpage Black, New York',
    max_participants: 80,
    current_participants: 45,
    entry_fee: 100,
    prize_pool: 3000,
    created_at: generateDate(-30),
    updated_at: generateDate(-1),
  },
];

const MOCK_SUBMISSIONS: Submission[] = [
  {
    id: 'submission-1',
    title: 'Advanced Chipping Techniques',
    description: 'A comprehensive guide to improving your short game with advanced chipping techniques.',
    type: 'video',
    status: 'pending',
    author_id: 'user-15',
    media_url: 'https://example.com/videos/advanced-chipping.mp4',
    thumbnail_url: 'https://example.com/thumbnails/advanced-chipping.jpg',
    tags: ['chipping', 'short-game', 'advanced'],
    created_at: generateDate(-3),
    updated_at: generateDate(-3),
  },
  {
    id: 'submission-2',
    title: 'Mental Game Strategies',
    description: 'Psychological techniques to improve focus and performance under pressure.',
    type: 'article',
    status: 'pending',
    author_id: 'user-22',
    content: 'The mental aspect of golf is often what separates good players from great ones...',
    thumbnail_url: 'https://example.com/thumbnails/mental-strategies.jpg',
    tags: ['mental-game', 'psychology', 'intermediate'],
    created_at: generateDate(-5),
    updated_at: generateDate(-5),
  },
  {
    id: 'submission-3',
    title: 'Equipment Selection Guide',
    description: 'How to choose the right clubs for your game and skill level.',
    type: 'guide',
    status: 'pending',
    author_id: 'user-8',
    content: 'Selecting the right equipment can make a significant difference in your game...',
    thumbnail_url: 'https://example.com/thumbnails/equipment-guide.jpg',
    tags: ['equipment', 'clubs', 'beginner'],
    created_at: generateDate(-7),
    updated_at: generateDate(-7),
  },
];

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notification-1',
    title: 'New User Registration',
    message: 'John Smith has joined the platform.',
    type: 'user',
    read: false,
    priority: 'low',
    created_at: generateDate(-1),
  },
  {
    id: 'notification-2',
    title: 'Content Submission',
    message: 'New content has been submitted for review: Advanced Chipping Techniques',
    type: 'content',
    read: false,
    action_url: '/admin/content/submissions',
    priority: 'medium',
    created_at: generateDate(-2),
  },
  {
    id: 'notification-3',
    title: 'Tournament Registration',
    message: 'Summer Championship 2025 has reached 50% capacity.',
    type: 'tournament',
    read: false,
    action_url: '/admin/tournaments',
    priority: 'medium',
    created_at: generateDate(-3),
  },
  {
    id: 'notification-4',
    title: 'System Update',
    message: 'The platform will undergo maintenance on Saturday night.',
    type: 'system',
    read: true,
    priority: 'high',
    created_at: generateDate(-5),
  },
];

const MOCK_SUBSCRIPTIONS: Subscription[] = Array.from({ length: 20 }, (_, i) => ({
  id: `subscription-${i + 1}`,
  user_id: `user-${i + 1}`,
  plan_id: generateRandomItem(['basic', 'pro', 'elite']),
  status: generateRandomItem(['active', 'active', 'active', 'canceled', 'past_due']),
  current_period_start: generateDate(-30),
  current_period_end: generateDate(30),
  cancel_at_period_end: Math.random() > 0.8,
  stripe_subscription_id: `sub_${generateId()}`,
  stripe_customer_id: `cus_${generateId()}`,
  created_at: generateDate(-Math.floor(Math.random() * 365)),
  updated_at: generateDate(-Math.floor(Math.random() * 30)),
}));

const MOCK_CUSTOMERS: Customer[] = Array.from({ length: 20 }, (_, i) => ({
  id: `customer-${i + 1}`,
  user_id: `user-${i + 1}`,
  stripe_customer_id: `cus_${generateId()}`,
  email: `user${i + 1}@example.com`,
  name: `${['John', 'Jane', 'Michael', 'Emily', 'David', 'Sarah'][i % 6]} ${['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller'][i % 6]}`,
  phone: Math.random() > 0.5 ? `+1${Math.floor(Math.random() * 1000000000)}` : undefined,
  address: Math.random() > 0.5 ? {
    line1: `${Math.floor(Math.random() * 1000) + 1} Main St`,
    city: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][i % 5],
    state: ['NY', 'CA', 'IL', 'TX', 'AZ'][i % 5],
    postal_code: `${Math.floor(Math.random() * 90000) + 10000}`,
    country: 'US',
  } : undefined,
  created_at: generateDate(-Math.floor(Math.random() * 365)),
  updated_at: generateDate(-Math.floor(Math.random() * 30)),
}));

const MOCK_PAYMENT_METHODS: PaymentMethod[] = Array.from({ length: 15 }, (_, i) => ({
  id: `payment-method-${i + 1}`,
  customer_id: `customer-${(i % 10) + 1}`,
  stripe_payment_method_id: `pm_${generateId()}`,
  type: 'card',
  last4: `${Math.floor(Math.random() * 9000) + 1000}`.slice(-4),
  exp_month: Math.floor(Math.random() * 12) + 1,
  exp_year: 2025 + Math.floor(Math.random() * 5),
  is_default: i % 10 === 0,
  created_at: generateDate(-Math.floor(Math.random() * 365)),
  updated_at: generateDate(-Math.floor(Math.random() * 30)),
}));

const MOCK_INVOICES: Invoice[] = Array.from({ length: 30 }, (_, i) => ({
  id: `invoice-${i + 1}`,
  subscription_id: `subscription-${(i % 20) + 1}`,
  user_id: `user-${(i % 20) + 1}`,
  stripe_invoice_id: `in_${generateId()}`,
  amount: Math.floor(Math.random() * 15000) / 100,
  status: generateRandomItem(['paid', 'paid', 'paid', 'paid', 'open', 'draft']),
  due_date: generateDate(Math.floor(Math.random() * 30)),
  paid_at: Math.random() > 0.2 ? generateDate(-Math.floor(Math.random() * 30)) : undefined,
  pdf_url: `https://example.com/invoices/invoice-${i + 1}.pdf`,
  created_at: generateDate(-Math.floor(Math.random() * 365)),
  updated_at: generateDate(-Math.floor(Math.random() * 30)),
}));

const MOCK_BETA_INVITES: BetaInvite[] = Array.from({ length: 50 }, (_, i) => ({
  id: `beta-invite-${i + 1}`,
  code: `BETA${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
  email: i % 3 === 0 ? `invite${i + 1}@example.com` : undefined,
  status: generateRandomItem(['unused', 'unused', 'sent', 'used']),
  expires_at: generateDate(30),
  used_at: i % 4 === 0 ? generateDate(-Math.floor(Math.random() * 30)) : undefined,
  used_by: i % 4 === 0 ? `user-${Math.floor(Math.random() * 20) + 1}` : undefined,
  created_at: generateDate(-Math.floor(Math.random() * 90)),
  updated_at: generateDate(-Math.floor(Math.random() * 30)),
}));

const MOCK_BETA_USERS: BetaUser[] = Array.from({ length: 25 }, (_, i) => ({
  id: `beta-user-${i + 1}`,
  user_id: `user-${i + 1}`,
  invite_code: MOCK_BETA_INVITES[i].code,
  status: 'active',
  feedback_count: Math.floor(Math.random() * 5),
  created_at: generateDate(-Math.floor(Math.random() * 90)),
  updated_at: generateDate(-Math.floor(Math.random() * 30)),
}));

const MOCK_BETA_FEEDBACK: BetaFeedback[] = Array.from({ length: 15 }, (_, i) => ({
  id: `feedback-${i + 1}`,
  user_id: `user-${Math.floor(Math.random() * 25) + 1}`,
  category: generateRandomItem(['bug', 'feature', 'improvement', 'other']),
  title: [
    'Navigation is confusing',
    'Add dark mode support',
    'Video playback issues',
    'Improve loading times',
    'Add social sharing',
  ][i % 5],
  description: `Detailed description for feedback item ${i + 1}...`,
  status: generateRandomItem(['new', 'in_review', 'planned', 'completed', 'declined']),
  priority: generateRandomItem(['low', 'medium', 'high']),
  response: i % 3 === 0 ? 'Thank you for your feedback. We are working on this issue.' : undefined,
  created_at: generateDate(-Math.floor(Math.random() * 90)),
  updated_at: generateDate(-Math.floor(Math.random() * 30)),
}));

const MOCK_AUDIT_LOGS: AuditLog[] = Array.from({ length: 100 }, (_, i) => ({
  id: `audit-${i + 1}`,
  user_id: `user-${Math.floor(Math.random() * 25) + 1}`,
  action: generateRandomItem(['create', 'update', 'delete', 'view', 'login', 'logout']),
  resource_type: generateRandomItem(['user', 'content', 'tournament', 'subscription', 'payment']),
  resource_id: `${generateRandomItem(['user', 'content', 'tournament', 'subscription', 'payment'])}-${Math.floor(Math.random() * 25) + 1}`,
  details: { ip: `192.168.1.${Math.floor(Math.random() * 255)}` },
  ip_address: `192.168.1.${Math.floor(Math.random() * 255)}`,
  user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  created_at: generateDate(-Math.floor(Math.random() * 90)),
}));

// Map mock data to table names
const mockDataMap = {
  profiles: MOCK_PROFILES,
  content_items: MOCK_CONTENT_ITEMS,
  tournaments: MOCK_TOURNAMENTS,
  content_submissions: MOCK_SUBMISSIONS,
  notifications: MOCK_NOTIFICATIONS,
  admin_notifications: MOCK_NOTIFICATIONS,
  subscriptions: MOCK_SUBSCRIPTIONS,
  customers: MOCK_CUSTOMERS,
  payment_methods: MOCK_PAYMENT_METHODS,
  invoices: MOCK_INVOICES,
  beta_invites: MOCK_BETA_INVITES,
  beta_users: MOCK_BETA_USERS,
  beta_feedback: MOCK_BETA_FEEDBACK,
  audit_logs: MOCK_AUDIT_LOGS,
};

// Core database access functions

/**
 * Safe database query wrapper that falls back to mock data in development
 * @param tableName The table to query
 * @param mockData Mock data to use if table doesn't exist
 * @param queryFn Optional function to customize the query
 */
async function safeQuery<T>(tableName: string, queryFn?: (query: PostgrestFilterBuilder<unknown, unknown, unknown>) => PostgrestFilterBuilder<unknown, unknown, unknown>): Promise<{ data: T[] | null; error: unknown }> {
  // Use mock data if we're in development mode and mock data is enabled
  if (isDevelopment && DEV_CONFIG.DATABASE.USE_MOCK_DATA) {
    // If we're not trying live data first or if we're forcing mock data
    if (!DEV_CONFIG.DATABASE.TRY_LIVE_FIRST || DEV_CONFIG.DATABASE.FORCE_MOCK_DATA) {
      if (DEV_CONFIG.DATABASE.DEBUG_DB) {
        console.log(`[DEV] Using mock data for table: ${tableName}`);  
      }
      const mockData = mockDataMap[tableName as keyof typeof mockDataMap] || [];
      
      // Simulate a delay to mimic network request
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return { data: mockData as T[], error: null };
    }
  }
  
  // Try to use real data if we're in production or if TRY_LIVE_FIRST is true
  try {
    let query = supabase.from(tableName).select('*');
    
    if (queryFn) {
      query = queryFn(query);
    }
    
    const { data, error } = await query;
    
    // If there's an error (like table doesn't exist), fall back to mock data
    if (error) {
      if (isDevelopment && DEV_CONFIG.DATABASE.USE_MOCK_DATA) {
        if (DEV_CONFIG.DATABASE.DEBUG_DB) {
          console.warn(`Error querying ${tableName}:`, error.message);
          console.log(`Falling back to mock data for ${tableName}`);
        }
        
        const mockData = mockDataMap[tableName as keyof typeof mockDataMap] || [];
        return { data: mockData as T[], error: null };
      }
      return { data: null, error };
    }
    
    return { data, error };
  } catch (error) {
    if (isDevelopment && DEV_CONFIG.DATABASE.USE_MOCK_DATA) {
      if (DEV_CONFIG.DATABASE.DEBUG_DB) {
        console.error(`Exception querying ${tableName}:`, error);
        console.log(`Falling back to mock data for ${tableName}`);
      }
      
      const mockData = mockDataMap[tableName as keyof typeof mockDataMap] || [];
      return { data: mockData as T[], error: null };
    }
    return { data: null, error };
  }
}

/**
 * Safe database update wrapper that simulates updates in development
 * @param tableName The table to update
 * @param id The ID of the record to update
 * @param data The data to update
 */
async function safeUpdate<T extends { id?: string; updated_at?: string }>(tableName: string, id: string, data: Partial<T>): Promise<{ data: T | null; error: unknown }> {
  // In development with mock data enabled, simulate a successful update
  if (isDevelopment && DEV_CONFIG.DATABASE.USE_MOCK_DATA) {
    // If we're not trying live data first or if we're forcing mock data
    if (!DEV_CONFIG.DATABASE.TRY_LIVE_FIRST || DEV_CONFIG.DATABASE.FORCE_MOCK_DATA) {
      if (DEV_CONFIG.DATABASE.DEBUG_DB) {
        console.log(`[DEV] Simulating update in ${tableName} for ID ${id}:`, data);
      }
      
      // Simulate a delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Create a simulated updated record
      const updatedData = { 
        ...data, 
        id,
        updated_at: new Date().toISOString()
      } as T;
      
      return { data: updatedData, error: null };
    }
  }
  
  // Try to update real data if we're in production or if TRY_LIVE_FIRST is true
  try {
    const { data: updatedData, error } = await supabase
      .from(tableName)
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    // If there's an error, simulate a successful update
    if (error) {
      if (isDevelopment && DEV_CONFIG.DATABASE.USE_MOCK_DATA) {
        if (DEV_CONFIG.DATABASE.DEBUG_DB) {
          console.warn(`Error updating ${tableName}:`, error.message);
          console.log(`Simulating update for ${tableName}`);
        }
        
        const simulatedData = { 
          ...data, 
          id,
          updated_at: new Date().toISOString()
        } as T;
        
        return { data: simulatedData, error: null };
      }
      return { data: null, error };
    }
    
    return { data: updatedData, error };
  } catch (error) {
    if (isDevelopment && DEV_CONFIG.DATABASE.USE_MOCK_DATA) {
      if (DEV_CONFIG.DATABASE.DEBUG_DB) {
        console.error(`Exception updating ${tableName}:`, error);
        console.log(`Simulating update for ${tableName}`);
      }
      
      const simulatedData = { 
        ...data, 
        id,
        updated_at: new Date().toISOString()
      } as T;
      
      return { data: simulatedData, error: null };
    }
    return { data: null, error };
  }
}

/**
 * Safe database insert wrapper that simulates insertion in development
 * @param tableName The table to insert into
 * @param data The data to insert
 */
async function safeInsert<T extends { id?: string; created_at?: string; updated_at?: string }>(tableName: string, data: T): Promise<{ data: T | null; error: unknown }> {
  // In development with mock data enabled, simulate a successful insert
  if (isDevelopment && DEV_CONFIG.DATABASE.USE_MOCK_DATA) {
    // If we're not trying live data first or if we're forcing mock data
    if (!DEV_CONFIG.DATABASE.TRY_LIVE_FIRST || DEV_CONFIG.DATABASE.FORCE_MOCK_DATA) {
      if (DEV_CONFIG.DATABASE.DEBUG_DB) {
        console.log(`[DEV] Simulating insert into ${tableName}:`, data);
      }
      
      // Simulate a delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Generate an ID if one wasn't provided
      const insertedData = { 
        ...data, 
        id: data.id || `${tableName.slice(0, 3)}_${generateId()}`,
        created_at: data.created_at || new Date().toISOString(),
        updated_at: data.updated_at || new Date().toISOString()
      };
      
      return { data: insertedData as T, error: null };
    }
  }
  
  // Try to insert real data if we're in production or if TRY_LIVE_FIRST is true
  try {
    const { data: insertedData, error } = await supabase.from(tableName).insert(data).select().single();
    
    // If there's an error (like table doesn't exist), simulate a successful insert
    if (error) {
      if (isDevelopment && DEV_CONFIG.DATABASE.USE_MOCK_DATA) {
        if (DEV_CONFIG.DATABASE.DEBUG_DB) {
          console.warn(`Error inserting into ${tableName}:`, error.message);
          console.log(`Simulating insert for ${tableName}`);
        }
        
        const simulatedData = { 
          ...data, 
          id: data.id || `${tableName.slice(0, 3)}_${generateId()}`,
          created_at: data.created_at || new Date().toISOString(),
          updated_at: data.updated_at || new Date().toISOString()
        };
        
        return { data: simulatedData as T, error: null };
      }
      return { data: null, error };
    }
    
    return { data: insertedData, error };
  } catch (error) {
    if (isDevelopment && DEV_CONFIG.DATABASE.USE_MOCK_DATA) {
      if (DEV_CONFIG.DATABASE.DEBUG_DB) {
        console.error(`Exception inserting into ${tableName}:`, error);
        console.log(`Simulating insert for ${tableName}`);
      }
      
      const simulatedData = { 
        ...data, 
        id: data.id || `${tableName.slice(0, 3)}_${generateId()}`,
        created_at: data.created_at || new Date().toISOString(),
        updated_at: data.updated_at || new Date().toISOString()
      };
      
      return { data: simulatedData as T, error: null };
    }
    return { data: null, error };
  }
}

/**
 * Safe database delete wrapper that simulates deletion in development
 * @param tableName The table to delete from
 * @param id The ID of the record to delete
 */
async function safeDelete(tableName: string, id: string): Promise<{ success: boolean; error: unknown }> {
  // In development with mock data enabled, simulate a successful delete
  if (isDevelopment && DEV_CONFIG.DATABASE.USE_MOCK_DATA) {
    // If we're not trying live data first or if we're forcing mock data
    if (!DEV_CONFIG.DATABASE.TRY_LIVE_FIRST || DEV_CONFIG.DATABASE.FORCE_MOCK_DATA) {
      if (DEV_CONFIG.DATABASE.DEBUG_DB) {
        console.log(`[DEV] Simulating delete from ${tableName} for ID ${id}`);
      }
      
      // Simulate a delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return { success: true, error: null };
    }
  }
  
  // Try to delete real data if we're in production or if TRY_LIVE_FIRST is true
  try {
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id);
    
    // If there's an error, log it but still simulate success
    if (error) {
      if (isDevelopment && DEV_CONFIG.DATABASE.USE_MOCK_DATA) {
        if (DEV_CONFIG.DATABASE.DEBUG_DB) {
          console.warn(`Error deleting from ${tableName}:`, error.message);
          console.log(`Simulating delete for ${tableName}`);
        }
        
        return { success: true, error: null };
      }
      return { success: false, error };
    }
    
    return { success: true, error: null };
  } catch (error) {
    if (isDevelopment && DEV_CONFIG.DATABASE.USE_MOCK_DATA) {
      if (DEV_CONFIG.DATABASE.DEBUG_DB) {
        console.error(`Exception deleting from ${tableName}:`, error);
        console.log(`Simulating delete for ${tableName}`);
      }
      return { success: true, error: null };
    }
    return { success: false, error };
  }
}

// Export the devDataProvider with specific methods for each table
export const devDataProvider = {
  // General methods
  isDevelopment,
  shouldUseMockData,
  shouldTryLiveFirst,
  shouldForceMockData,
  safeQuery,
  safeInsert,
  safeUpdate,
  safeDelete,
  
  // Profiles
  profiles: {
    getAll: async (queryFn?: (query: PostgrestFilterBuilder<unknown, unknown, unknown>) => PostgrestFilterBuilder<unknown, unknown, unknown>) => safeQuery<Profile>('profiles', queryFn),
    getById: async (id: string) => {
      const { data, error } = await safeQuery<Profile>('profiles', 
        query => query.eq('id', id).single());
      return { data: data?.[0] || null, error };
    },
    getByUserId: async (userId: string) => {
      const { data, error } = await safeQuery<Profile>('profiles', 
        query => query.eq('user_id', userId).single());
      return { data: data?.[0] || null, error };
    },
    create: async (profile: Omit<Profile, 'id' | 'created_at'>) => 
      safeInsert<Profile>('profiles', profile as Profile),
    update: async (id: string, profile: Partial<Profile>) => 
      safeUpdate<Profile>('profiles', id, profile),
    delete: async (id: string) => safeDelete('profiles', id),
  },
  
  // Content
  content: {
    getAll: async (queryFn?: (query: PostgrestFilterBuilder<unknown, unknown, unknown>) => PostgrestFilterBuilder<unknown, unknown, unknown>) => safeQuery<ContentItem>('content_items', queryFn),
    getById: async (id: string) => {
      const { data, error } = await safeQuery<ContentItem>('content_items', 
        query => query.eq('id', id).single());
      return { data: data?.[0] || null, error };
    },
    getByStatus: async (status: ContentItem['status']) => {
      return safeQuery<ContentItem>('content_items', 
        query => query.eq('status', status));
    },
    create: async (item: Omit<ContentItem, 'id' | 'created_at'>) => 
      safeInsert<ContentItem>('content_items', item as ContentItem),
    update: async (id: string, item: Partial<ContentItem>) => 
      safeUpdate<ContentItem>('content_items', id, item),
    delete: async (id: string) => safeDelete('content_items', id),
  },
  
  // Tournaments
  tournaments: {
    getAll: async (queryFn?: (query: PostgrestFilterBuilder<unknown, unknown, unknown>) => PostgrestFilterBuilder<unknown, unknown, unknown>) => safeQuery<Tournament>('tournaments', queryFn),
    getById: async (id: string) => {
      const { data, error } = await safeQuery<Tournament>('tournaments', 
        query => query.eq('id', id).single());
      return { data: data?.[0] || null, error };
    },
    getUpcoming: async () => {
      return safeQuery<Tournament>('tournaments', 
        query => query.eq('status', 'upcoming').order('start_date', { ascending: true }));
    },
    create: async (tournament: Omit<Tournament, 'id' | 'created_at'>) => 
      safeInsert<Tournament>('tournaments', tournament as Tournament),
    update: async (id: string, tournament: Partial<Tournament>) => 
      safeUpdate<Tournament>('tournaments', id, tournament),
    delete: async (id: string) => safeDelete('tournaments', id),
  },
  
  // Submissions
  submissions: {
    getAll: async (queryFn?: (query: PostgrestFilterBuilder<unknown, unknown, unknown>) => PostgrestFilterBuilder<unknown, unknown, unknown>) => safeQuery<Submission>('content_submissions', queryFn),
    getById: async (id: string) => {
      const { data, error } = await safeQuery<Submission>('content_submissions', 
        query => query.eq('id', id).single());
      return { data: data?.[0] || null, error };
    },
    getPending: async () => {
      return safeQuery<Submission>('content_submissions', 
        query => query.eq('status', 'pending').order('created_at', { ascending: false }));
    },
    create: async (submission: Omit<Submission, 'id' | 'created_at'>) => 
      safeInsert<Submission>('content_submissions', submission as Submission),
    update: async (id: string, submission: Partial<Submission>) => 
      safeUpdate<Submission>('content_submissions', id, submission),
    delete: async (id: string) => safeDelete('content_submissions', id),
  },
  
  // Notifications
  notifications: {
    getAll: async (queryFn?: (query: PostgrestFilterBuilder<unknown, unknown, unknown>) => PostgrestFilterBuilder<unknown, unknown, unknown>) => safeQuery<Notification>('notifications', queryFn),
    getById: async (id: string) => {
      const { data, error } = await safeQuery<Notification>('notifications', 
        query => query.eq('id', id).single());
      return { data: data?.[0] || null, error };
    },
    getForUser: async (userId: string) => {
      return safeQuery<Notification>('notifications', 
        query => query.eq('user_id', userId).order('created_at', { ascending: false }));
    },
    getAdminNotifications: async () => {
      return safeQuery<Notification>('admin_notifications', 
        query => query.order('created_at', { ascending: false }));
    },
    create: async (notification: Omit<Notification, 'id' | 'created_at'>) => 
      safeInsert<Notification>('notifications', notification as Notification),
    createAdminNotification: async (notification: Omit<Notification, 'id' | 'created_at'>) => 
      safeInsert<Notification>('admin_notifications', notification as Notification),
    markAsRead: async (id: string) => 
      safeUpdate<Notification>('notifications', id, { read: true }),
    delete: async (id: string) => safeDelete('notifications', id),
  },
  
  // Subscriptions and Billing
  subscriptions: {
    getAll: async (queryFn?: (query: PostgrestFilterBuilder<unknown, unknown, unknown>) => PostgrestFilterBuilder<unknown, unknown, unknown>) => safeQuery<Subscription>('subscriptions', queryFn),
    getById: async (id: string) => {
      const { data, error } = await safeQuery<Subscription>('subscriptions', 
        query => query.eq('id', id).single());
      return { data: data?.[0] || null, error };
    },
    getByUserId: async (userId: string) => {
      const { data, error } = await safeQuery<Subscription>('subscriptions', 
        query => query.eq('user_id', userId).single());
      return { data: data?.[0] || null, error };
    },
    create: async (subscription: Omit<Subscription, 'id' | 'created_at'>) => 
      safeInsert<Subscription>('subscriptions', subscription as Subscription),
    update: async (id: string, subscription: Partial<Subscription>) => 
      safeUpdate<Subscription>('subscriptions', id, subscription),
    cancel: async (id: string) => 
      safeUpdate<Subscription>('subscriptions', id, { 
        status: 'canceled', 
        cancel_at_period_end: true 
      }),
  },
  
  // Customers
  customers: {
    getAll: async (queryFn?: (query: PostgrestFilterBuilder<unknown, unknown, unknown>) => PostgrestFilterBuilder<unknown, unknown, unknown>) => safeQuery<Customer>('customers', queryFn),
    getById: async (id: string) => {
      const { data, error } = await safeQuery<Customer>('customers', 
        query => query.eq('id', id).single());
      return { data: data?.[0] || null, error };
    },
    getByUserId: async (userId: string) => {
      const { data, error } = await safeQuery<Customer>('customers', 
        query => query.eq('user_id', userId).single());
      return { data: data?.[0] || null, error };
    },
    create: async (customer: Omit<Customer, 'id' | 'created_at'>) => 
      safeInsert<Customer>('customers', customer as Customer),
    update: async (id: string, customer: Partial<Customer>) => 
      safeUpdate<Customer>('customers', id, customer),
  },
  
  // Payment Methods
  paymentMethods: {
    getAll: async (queryFn?: (query: PostgrestFilterBuilder<unknown, unknown, unknown>) => PostgrestFilterBuilder<unknown, unknown, unknown>) => safeQuery<PaymentMethod>('payment_methods', queryFn),
    getById: async (id: string) => {
      const { data, error } = await safeQuery<PaymentMethod>('payment_methods', 
        query => query.eq('id', id).single());
      return { data: data?.[0] || null, error };
    },
    getByCustomerId: async (customerId: string) => {
      return safeQuery<PaymentMethod>('payment_methods', 
        query => query.eq('customer_id', customerId));
    },
    create: async (paymentMethod: Omit<PaymentMethod, 'id' | 'created_at'>) => 
      safeInsert<PaymentMethod>('payment_methods', paymentMethod as PaymentMethod),
    update: async (id: string, paymentMethod: Partial<PaymentMethod>) => 
      safeUpdate<PaymentMethod>('payment_methods', id, paymentMethod),
    delete: async (id: string) => safeDelete('payment_methods', id),
  },
  
  // Invoices
  invoices: {
    getAll: async (queryFn?: (query: PostgrestFilterBuilder<unknown, unknown, unknown>) => PostgrestFilterBuilder<unknown, unknown, unknown>) => safeQuery<Invoice>('invoices', queryFn),
    getById: async (id: string) => {
      const { data, error } = await safeQuery<Invoice>('invoices', 
        query => query.eq('id', id).single());
      return { data: data?.[0] || null, error };
    },
    getByUserId: async (userId: string) => {
      return safeQuery<Invoice>('invoices', 
        query => query.eq('user_id', userId).order('created_at', { ascending: false }));
    },
    create: async (invoice: Omit<Invoice, 'id' | 'created_at'>) => 
      safeInsert<Invoice>('invoices', invoice as Invoice),
    update: async (id: string, invoice: Partial<Invoice>) => 
      safeUpdate<Invoice>('invoices', id, invoice),
  },
  
  // Beta
  beta: {
    // Beta Invites
    invites: {
      getAll: async (queryFn?: (query: PostgrestFilterBuilder<unknown, unknown, unknown>) => PostgrestFilterBuilder<unknown, unknown, unknown>) => safeQuery<BetaInvite>('beta_invites', queryFn),
      getById: async (id: string) => {
        const { data, error } = await safeQuery<BetaInvite>('beta_invites', 
          query => query.eq('id', id).single());
        return { data: data?.[0] || null, error };
      },
      getByCode: async (code: string) => {
        const { data, error } = await safeQuery<BetaInvite>('beta_invites', 
          query => query.eq('code', code).single());
        return { data: data?.[0] || null, error };
      },
      create: async (invite: Omit<BetaInvite, 'id' | 'created_at'>) => 
        safeInsert<BetaInvite>('beta_invites', invite as BetaInvite),
      update: async (id: string, invite: Partial<BetaInvite>) => 
        safeUpdate<BetaInvite>('beta_invites', id, invite),
      markAsUsed: async (id: string, userId: string) => 
        safeUpdate<BetaInvite>('beta_invites', id, { 
          status: 'used', 
          used_at: new Date().toISOString(), 
          used_by: userId 
        }),
    },
    
    // Beta Users
    users: {
      getAll: async (queryFn?: (query: PostgrestFilterBuilder<unknown, unknown, unknown>) => PostgrestFilterBuilder<unknown, unknown, unknown>) => safeQuery<BetaUser>('beta_users', queryFn),
      getById: async (id: string) => {
        const { data, error } = await safeQuery<BetaUser>('beta_users', 
          query => query.eq('id', id).single());
        return { data: data?.[0] || null, error };
      },
      getByUserId: async (userId: string) => {
        const { data, error } = await safeQuery<BetaUser>('beta_users', 
          query => query.eq('user_id', userId).single());
        return { data: data?.[0] || null, error };
      },
      create: async (betaUser: Omit<BetaUser, 'id' | 'created_at'>) => 
        safeInsert<BetaUser>('beta_users', betaUser as BetaUser),
      update: async (id: string, betaUser: Partial<BetaUser>) => 
        safeUpdate<BetaUser>('beta_users', id, betaUser),
    },
    
    // Beta Feedback
    feedback: {
      getAll: async (queryFn?: (query: PostgrestFilterBuilder<unknown, unknown, unknown>) => PostgrestFilterBuilder<unknown, unknown, unknown>) => safeQuery<BetaFeedback>('beta_feedback', queryFn),
      getById: async (id: string) => {
        const { data, error } = await safeQuery<BetaFeedback>('beta_feedback', 
          query => query.eq('id', id).single());
        return { data: data?.[0] || null, error };
      },
      getByUserId: async (userId: string) => {
        return safeQuery<BetaFeedback>('beta_feedback', 
          query => query.eq('user_id', userId).order('created_at', { ascending: false }));
      },
      create: async (feedback: Omit<BetaFeedback, 'id' | 'created_at'>) => 
        safeInsert<BetaFeedback>('beta_feedback', feedback as BetaFeedback),
      update: async (id: string, feedback: Partial<BetaFeedback>) => 
        safeUpdate<BetaFeedback>('beta_feedback', id, feedback),
    },
  },
  
  // Audit Logs
  auditLogs: {
    getAll: async (queryFn?: (query: PostgrestFilterBuilder<unknown, unknown, unknown>) => PostgrestFilterBuilder<unknown, unknown, unknown>) => safeQuery<AuditLog>('audit_logs', queryFn),
    getById: async (id: string) => {
      const { data, error } = await safeQuery<AuditLog>('audit_logs', 
        query => query.eq('id', id).single());
      return { data: data?.[0] || null, error };
    },
    getByUserId: async (userId: string) => {
      return safeQuery<AuditLog>('audit_logs', 
        query => query.eq('user_id', userId).order('created_at', { ascending: false }));
    },
    create: async (log: Omit<AuditLog, 'id' | 'created_at'>) => 
      safeInsert<AuditLog>('audit_logs', log as AuditLog),
  },
  
  // Dashboard Stats
  getDashboardStats: async (): Promise<{
    totalUsers: number;
    pendingApprovals: number;
    activeContent: number;
    upcomingTournaments: number;
  }> => {
    // Use mock data if we're in development mode and mock data is enabled
    if (shouldUseMockData()) {
      // If we're not trying live data first or if we're forcing mock data
      if (!DEV_CONFIG.DATABASE.TRY_LIVE_FIRST || DEV_CONFIG.DATABASE.FORCE_MOCK_DATA) {
        if (DEV_CONFIG.DATABASE.DEBUG_DB) {
          console.log('[DEV] Using mock dashboard stats');
        }
        
        // Simulate a delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        return {
          totalUsers: MOCK_PROFILES.length,
          pendingApprovals: MOCK_SUBMISSIONS.filter(s => s.status === 'pending').length,
          activeContent: MOCK_CONTENT_ITEMS.filter(c => c.status === 'active').length,
          upcomingTournaments: MOCK_TOURNAMENTS.filter(t => t.status === 'upcoming').length,
        };
      }
    }
    
    try {
      // Try to get real stats from database
      const [usersResult, approvalsResult, contentResult, tournamentsResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('content_submissions').select('id').eq('status', 'pending'),
        supabase.from('content_items').select('id').eq('status', 'active'),
        supabase.from('tournaments').select('id').eq('status', 'upcoming'),
      ]);
      
      // If any query fails, fall back to mock data if enabled
      if (usersResult.error || approvalsResult.error || contentResult.error || tournamentsResult.error) {
        if (shouldUseMockData()) {
          if (DEV_CONFIG.DATABASE.DEBUG_DB) {
            console.warn('Error getting dashboard stats, falling back to mock data');
          }
          
          return {
            totalUsers: MOCK_PROFILES.length,
            pendingApprovals: MOCK_SUBMISSIONS.filter(s => s.status === 'pending').length,
            activeContent: MOCK_CONTENT_ITEMS.filter(c => c.status === 'active').length,
            upcomingTournaments: MOCK_TOURNAMENTS.filter(t => t.status === 'upcoming').length,
          };
        }
        
        // If mock data is not enabled, return zeros
        return {
          totalUsers: 0,
          pendingApprovals: 0,
          activeContent: 0,
          upcomingTournaments: 0,
        };
      }
      
      return {
        totalUsers: usersResult.count || 0,
        pendingApprovals: approvalsResult.data?.length || 0,
        activeContent: contentResult.data?.length || 0,
        upcomingTournaments: tournamentsResult.data?.length || 0,
      };
    } catch (error) {
      if (shouldUseMockData()) {
        if (DEV_CONFIG.DATABASE.DEBUG_DB) {
          console.error('Exception getting dashboard stats:', error);
          console.log('Falling back to mock dashboard stats');
        }
        
        return {
          totalUsers: MOCK_PROFILES.length,
          pendingApprovals: MOCK_SUBMISSIONS.filter(s => s.status === 'pending').length,
          activeContent: MOCK_CONTENT_ITEMS.filter(c => c.status === 'active').length,
          upcomingTournaments: MOCK_TOURNAMENTS.filter(t => t.status === 'upcoming').length,
        };
      }
      
      // If mock data is not enabled, return zeros
      return {
        totalUsers: 0,
        pendingApprovals: 0,
        activeContent: 0,
        upcomingTournaments: 0,
      };
    }
  },
};
