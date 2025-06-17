import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';

// Define the subscription tier types
export type SubscriptionTier = 'free' | 'driven' | 'breakthrough';

// Define the checkout session parameters
type CheckoutSessionParams = {
  customerId: string;
  tier: SubscriptionTier;
  customerEmail?: string;
};

/**
 * Creates a Stripe checkout session for subscription
 * @param params Parameters for creating the checkout session
 * @returns The checkout session URL
 */
export const createCheckoutSession = async (params: CheckoutSessionParams): Promise<string> => {
  const { customerId, tier, customerEmail } = params;
  
  // Get the appropriate price ID based on the subscription tier
  let priceId: string;
  
  switch (tier) {
    case 'driven':
      priceId = import.meta.env.VITE_STRIPE_DRIVEN_PRICE_ID;
      break;
    case 'breakthrough':
      priceId = import.meta.env.VITE_STRIPE_BREAKTHROUGH_PRICE_ID;
      break;
    default:
      throw new Error(`Invalid subscription tier: ${tier}`);
  }
  
  try {
    // Create the checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${window.location.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${window.location.origin}/subscription`,
      customer_email: customerEmail,
    });
    
    // Return the checkout URL
    return session.url || '';
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

/**
 * Retrieves a customer's subscription details
 * @param customerId The Stripe customer ID
 * @returns The subscription details
 */
export const getCustomerSubscription = async (customerId: string) => {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      expand: ['data.default_payment_method'],
    });
    
    return subscriptions.data[0] || null;
  } catch (error) {
    console.error('Error retrieving subscription:', error);
    throw error;
  }
};

/**
 * Cancels a customer's subscription
 * @param subscriptionId The Stripe subscription ID
 * @returns The canceled subscription
 */
export const cancelSubscription = async (subscriptionId: string) => {
  try {
    return await stripe.subscriptions.cancel(subscriptionId);
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
};
