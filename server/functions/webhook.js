const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY);

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper function to determine subscription tier based on price ID
function getTierFromPriceId(priceId) {
  const priceTierMap = {
    // Basic tier price IDs
    'price_basic_monthly': 'basic',
    'price_basic_yearly': 'basic',
    
    // Pro tier price IDs
    'price_pro_monthly': 'pro',
    'price_pro_yearly': 'pro',
    
    // Premium tier price IDs
    'price_premium_monthly': 'premium',
    'price_premium_yearly': 'premium',
  };
  
  return priceTierMap[priceId] || 'unknown';
}

// Helper function to update subscription in database
async function updateSubscriptionInDatabase(subscription, userId) {
  try {
    const customerId = subscription.customer;
    const subscriptionId = subscription.id;
    const status = subscription.status;
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
    const currentPeriodStart = new Date(subscription.current_period_start * 1000);
    const cancelAtPeriodEnd = subscription.cancel_at_period_end;
    
    // Get the price ID from the subscription
    const priceId = subscription.items.data[0].price.id;
    
    // Determine the tier based on the price ID
    const tier = getTierFromPriceId(priceId);
    
    // Check if a subscription record already exists for this user
    const { data: existingSubscription, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error fetching existing subscription:', fetchError);
      return { success: false, error: fetchError };
    }
    
    let result;
    
    if (existingSubscription) {
      // Update existing subscription
      result = await supabase
        .from('subscriptions')
        .update({
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          status,
          tier,
          current_period_end: currentPeriodEnd.toISOString(),
          current_period_start: currentPeriodStart.toISOString(),
          cancel_at_period_end: cancelAtPeriodEnd,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
    } else {
      // Create new subscription
      result = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          status,
          tier,
          current_period_end: currentPeriodEnd.toISOString(),
          current_period_start: currentPeriodStart.toISOString(),
          cancel_at_period_end: cancelAtPeriodEnd,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
    }
    
    if (result.error) {
      console.error('Error updating subscription in database:', result.error);
      return { success: false, error: result.error };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error in updateSubscriptionInDatabase:', error);
    return { success: false, error };
  }
}

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  const sig = event.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let stripeEvent;

  try {
    // Verify the event with Stripe
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      endpointSecret
    );
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: `Webhook Error: ${err.message}` }),
    };
  }

  // Handle the event based on its type
  try {
    switch (stripeEvent.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = stripeEvent.data.object;
        console.log(`Subscription ${stripeEvent.type}:`, subscription.id);
        
        // Get the customer ID
        const customerId = subscription.customer;
        
        // Look up the user ID from the customers table
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single();
        
        if (customerError) {
          console.error('Error fetching customer:', customerError);
          return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Error processing webhook' }),
          };
        }
        
        const userId = customerData.user_id;
        
        // Update the subscription in the database
        const result = await updateSubscriptionInDatabase(subscription, userId);
        
        if (!result.success) {
          console.error('Failed to update subscription in database');
          return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Error updating subscription' }),
          };
        }
        break;
        
      case 'customer.subscription.deleted':
        const deletedSubscription = stripeEvent.data.object;
        console.log('Subscription deleted:', deletedSubscription.id);
        
        // Get the customer ID
        const deletedCustomerId = deletedSubscription.customer;
        
        // Look up the user ID from the customers table
        const { data: deletedCustomerData, error: deletedCustomerError } = await supabase
          .from('customers')
          .select('user_id')
          .eq('stripe_customer_id', deletedCustomerId)
          .single();
        
        if (deletedCustomerError) {
          console.error('Error fetching customer for deleted subscription:', deletedCustomerError);
          return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Error processing webhook' }),
          };
        }
        
        const deletedUserId = deletedCustomerData.user_id;
        
        // Update the subscription status to 'canceled' in the database
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            updated_at: new Date().toISOString()
          })
          .eq('user_id', deletedUserId);
        
        if (updateError) {
          console.error('Error updating deleted subscription:', updateError);
          return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Error updating subscription' }),
          };
        }
        break;
        
      // Add more event types as needed
      
      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true }),
    };
  } catch (error) {
    console.error('Error processing webhook:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error processing webhook' }),
    };
  }
};
