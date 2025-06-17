import { supabase } from '@/lib/supabase';
import { getPriceIdFromTier } from '@/lib/stripe';
import type { SubscriptionTier } from './stripe-checkout';

// Use Netlify Functions when deployed, otherwise use local development server
const isProduction = import.meta.env.PROD;
const API_URL = isProduction ? '/.netlify/functions' : (import.meta.env.VITE_API_URL || 'http://localhost:3000');

export interface SubscriptionDetails {
  id: string;
  status: string;
  current_period_end: number;
  cancel_at_period_end: boolean;
  customer: string;
  items: {
    data: Array<{
      id: string;
      price: {
        id: string;
        product: string;
        unit_amount: number;
        currency: string;
      };
    }>;
  };
}

/**
 * Creates a checkout session for a subscription
 * @param tier The subscription tier
 * @returns URL to the checkout page
 */
export const createCheckoutSession = async (tier: SubscriptionTier): Promise<string> => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get price ID for the selected tier
    const priceId = getPriceIdFromTier(tier);
    if (!priceId) {
      throw new Error(`Invalid subscription tier: ${tier}`);
    }

    // Call the server API to create a checkout session
    const response = await fetch(`${API_URL}/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId,
        userId: user.id,
        customerEmail: user.email,
        returnUrl: window.location.origin
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create checkout session');
    }

    const { url } = await response.json();
    return url;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

/**
 * Retrieves the current user's subscription details
 * @returns The subscription details
 */
export const getUserSubscription = async () => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Call the server API to get subscription details
    const response = await fetch(`${API_URL}/subscription/${user.id}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch subscription');
    }

    const data = await response.json();
    return data.subscription;
  } catch (error) {
    console.error('Error fetching subscription:', error);
    throw error;
  }
};

/**
 * Cancels the user's subscription
 * @param subscriptionId The Stripe subscription ID to cancel
 * @returns The updated subscription
 */
export const cancelSubscription = async (subscriptionId: string): Promise<SubscriptionDetails> => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Call the server API to cancel the subscription
    const response = await fetch(`${API_URL}/cancel-subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscriptionId,
        userId: user.id
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to cancel subscription');
    }

    const data = await response.json();
    return data.subscription;
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
};

/**
 * Creates a Stripe customer portal session for managing subscriptions
 * @param customerId The Stripe customer ID
 * @returns URL to the customer portal
 */
export const createPortalSession = async (customerId: string): Promise<string> => {
  try {
    // Call the server API to create a portal session
    const response = await fetch(`${API_URL}/create-portal-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerId,
        returnUrl: window.location.origin + '/dashboard'
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create portal session');
    }

    const { url } = await response.json();
    return url;
  } catch (error) {
    console.error('Error creating portal session:', error);
    throw error;
  }
};
