const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = process.env.PORT || 3000;

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
app.use(bodyParser.json());

// Create a checkout session
app.post('/create-checkout-session', async (req, res) => {
  try {
    const { priceId, userId, customerEmail, returnUrl } = req.body;
    
    if (!priceId || !userId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Check if user already has a Stripe customer ID
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    if (userError && userError.code !== 'PGRST116') {
      console.error('Error fetching user:', userError);
      return res.status(500).json({ error: 'Error fetching user data' });
    }

    let customerId = userData?.stripe_customer_id;

    // If no customer ID exists, create a new customer
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: customerEmail,
        metadata: {
          userId: userId
        }
      });
      
      customerId = customer.id;
      
      // Save the customer ID to the user's profile
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          stripe_customer_id: customerId,
          updated_at: new Date().toISOString()
        });
      
      if (updateError) {
        console.error('Error updating user profile:', updateError);
      }
    }

    // Create the checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1
      }],
      mode: 'subscription',
      success_url: `${returnUrl || process.env.CLIENT_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnUrl || process.env.CLIENT_URL}/subscription`,
      client_reference_id: userId,
      metadata: {
        userId: userId
      }
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get subscription details
app.get('/subscription/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user's customer ID
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user:', userError);
      return res.status(500).json({ error: 'Error fetching user data' });
    }

    if (!userData?.stripe_customer_id) {
      return res.json({ subscription: null });
    }

    // Get active subscriptions for the customer
    const subscriptions = await stripe.subscriptions.list({
      customer: userData.stripe_customer_id,
      status: 'active',
      expand: ['data.default_payment_method']
    });

    if (subscriptions.data.length === 0) {
      return res.json({ subscription: null });
    }

    res.json({ subscription: subscriptions.data[0] });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ error: error.message });
  }
});

// Cancel subscription
app.post('/cancel-subscription', async (req, res) => {
  try {
    const { subscriptionId, userId } = req.body;
    
    if (!subscriptionId || !userId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Cancel at period end instead of immediately
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    });

    // Update subscription in database
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        cancel_at_period_end: true,
        status: 'canceling',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('stripe_subscription_id', subscriptionId);

    if (updateError) {
      console.error('Error updating subscription in database:', updateError);
    }

    res.json({ subscription });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a portal session for managing subscriptions
app.post('/create-portal-session', async (req, res) => {
  try {
    const { customerId, returnUrl } = req.body;
    
    if (!customerId) {
      return res.status(400).json({ error: 'Missing customer ID' });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || `${process.env.CLIENT_URL}/dashboard`
    });

    res.json({ url: portalSession.url });
  } catch (error) {
    console.error('Error creating portal session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.send({ status: 'ok' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
