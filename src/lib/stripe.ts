import { loadStripe } from '@stripe/stripe-js';
import Stripe from 'stripe';
import { IS_DEV_ENV } from './config/env';

// Load Stripe publishable key from environment variables
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripeSecretKey = import.meta.env.VITE_STRIPE_SECRET_KEY;

// Check if keys are valid (not placeholder values)
const isValidPublishableKey = stripePublishableKey && !stripePublishableKey.includes('your_publishable_key');
const isValidSecretKey = stripeSecretKey && !stripeSecretKey.includes('your_secret_key');

if (!isValidPublishableKey) {
  console.warn('Using mock Stripe client - Missing valid Stripe publishable key. Check your .env file.');
}

// Initialize Stripe client for frontend
export const stripePromise = isValidPublishableKey 
  ? loadStripe(stripePublishableKey)
  : Promise.resolve(createMockStripeClient());

// Initialize Stripe client for backend API calls (used in API routes)
export const stripe = isValidSecretKey
  ? new Stripe(stripeSecretKey, { apiVersion: '2025-03-31.basil' })
  : createMockStripeBackend();

// Create a mock Stripe client for development
function createMockStripeClient(): unknown {
  console.log('Using mock Stripe client in development mode');
  return {
    elements: () => ({}),
    createPaymentMethod: () => Promise.resolve({ paymentMethod: { id: 'pm_mock' } }),
    confirmCardPayment: () => Promise.resolve({ paymentIntent: { status: 'succeeded' } }),
    // Add other methods as needed
  };
}

// Create a mock Stripe backend for development
function createMockStripeBackend(): unknown {
  console.log('Using mock Stripe backend in development mode');
  return {
    checkout: {
      sessions: {
        create: () => Promise.resolve({ id: 'cs_mock', url: 'https://example.com/checkout' }),
      }
    },
    customers: {
      retrieve: () => Promise.resolve({ id: 'cus_mock', email: 'mock@example.com' }),
    },
    subscriptions: {
      list: () => Promise.resolve({ data: [] }),
      cancel: () => Promise.resolve({ id: 'sub_mock', status: 'canceled' }),
    },
    prices: {
      retrieve: () => Promise.resolve({ 
        id: 'price_mock', 
        product: 'prod_mock',
        currency: 'usd',
        unit_amount: 1999,
        recurring: { interval: 'month', interval_count: 1 }
      }),
    },
    products: {
      retrieve: () => Promise.resolve({ id: 'prod_mock', name: 'Mock Product' }),
    },
    // Add other methods as needed
  };
}

// Define product IDs for each subscription tier
export const STRIPE_PRODUCTS = {
  DRIVEN: import.meta.env.VITE_STRIPE_DRIVEN_PRICE_ID,
  ASPIRING: import.meta.env.VITE_STRIPE_ASPIRING_PRICE_ID,
  BREAKTHROUGH: import.meta.env.VITE_STRIPE_BREAKTHROUGH_PRICE_ID,
};

// Helper function to get price ID from tier
export function getPriceIdFromTier(tier: string): string | null {
  switch (tier) {
    case 'driven':
      return STRIPE_PRODUCTS.DRIVEN;
    case 'aspiring':
      return STRIPE_PRODUCTS.ASPIRING;
    case 'breakthrough':
      return STRIPE_PRODUCTS.BREAKTHROUGH;
    default:
      return null;
  }
}
