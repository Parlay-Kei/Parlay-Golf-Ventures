const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = process.env.PORT || 3001;

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY);

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Middleware
app.use(cors());
// Use raw body for Stripe webhook signature verification
app.use(
  '/webhook',
  bodyParser.raw({ type: 'application/json' })
);
app.use(bodyParser.json());

// Helper function to determine subscription tier based on price ID
const getTierFromPriceId = async (priceId) => {
  try {
    const price = await stripe.prices.retrieve(priceId);
    const productId = price.product;
    const product = await stripe.products.retrieve(productId);
    
    // Check product metadata or name to determine tier
    if (product.metadata.tier) {
      return product.metadata.tier;
    }
    
    // Fallback to checking product name
    const productName = product.name.toLowerCase();
    if (productName.includes('driven')) return 'driven';
    if (productName.includes('aspiring')) return 'aspiring';
    if (productName.includes('breakthrough')) return 'breakthrough';
    
    return 'unknown';
  } catch (error) {
    console.error('Error determining tier:', error);
    return 'unknown';
  }
};

// Helper function to update subscription in database
const updateSubscriptionInDatabase = async (subscription, userId) => {
  try {
    // Get the price ID from the subscription
    const priceId = subscription.items.data[0].price.id;
    
    // Determine the tier based on the price ID
    const tier = await getTierFromPriceId(priceId);
    
    // Prepare subscription data
    const subscriptionData = {
      user_id: userId,
      stripe_subscription_id: subscription.id,
      status: subscription.status,
      tier: tier,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString()
    };
    
    // Check if subscription already exists
    const { data: existingSubscription, error: fetchError } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('stripe_subscription_id', subscription.id)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error checking existing subscription:', fetchError);
    }
    
    // Update or insert subscription
    if (existingSubscription) {
      // Update existing subscription
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update(subscriptionData)
        .eq('id', existingSubscription.id);
      
      if (updateError) {
        console.error('Error updating subscription:', updateError);
      }
    } else {
      // Insert new subscription
      const { error: insertError } = await supabase
        .from('subscriptions')
        .insert({
          ...subscriptionData,
          created_at: new Date().toISOString()
        });
      
      if (insertError) {
        console.error('Error inserting subscription:', insertError);
      }
    }
  } catch (error) {
    console.error('Error updating subscription in database:', error);
  }
};

// Webhook endpoint for Stripe events
app.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  let event;

  try {
    // Verify the event came from Stripe
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  console.log(`Received event: ${event.type}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.client_reference_id || session.metadata?.userId;
        
        if (!userId) {
          console.error('No user ID found in session');
          break;
        }
        
        console.log(`Checkout completed for user ${userId}`);
        
        // Get subscription ID from the session
        const subscriptionId = session.subscription;
        
        if (!subscriptionId) {
          console.error('No subscription ID found in session');
          break;
        }
        
        // Retrieve the subscription details
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        
        // Update subscription in database
        await updateSubscriptionInDatabase(subscription, userId);
        
        break;
      }
      
      case 'invoice.paid': {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;
        
        if (!subscriptionId) {
          console.error('No subscription ID found in invoice');
          break;
        }
        
        // Retrieve the subscription details
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        
        // Get the customer ID
        const customerId = invoice.customer;
        
        // Find the user ID associated with this customer
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();
        
        if (userError) {
          console.error('Error finding user for customer:', userError);
          break;
        }
        
        const userId = userData.id;
        
        // Update subscription in database
        await updateSubscriptionInDatabase(subscription, userId);
        
        break;
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        
        // Find the user ID associated with this customer
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();
        
        if (userError) {
          console.error('Error finding user for customer:', userError);
          break;
        }
        
        const userId = userData.id;
        
        // Update subscription in database
        await updateSubscriptionInDatabase(subscription, userId);
        
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        
        // Find the user ID associated with this customer
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();
        
        if (userError) {
          console.error('Error finding user for customer:', userError);
          break;
        }
        
        const userId = userData.id;
        
        // Update subscription status to canceled
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscription.id);
        
        if (updateError) {
          console.error('Error updating subscription to canceled:', updateError);
        }
        
        break;
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error(`Error processing webhook event: ${error.message}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.send({ received: true });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.send({ status: 'ok' });
});

// Start the server
app.listen(port, () => {
  console.log(`Webhook server listening at http://localhost:${port}`);
});
