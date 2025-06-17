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

exports.handler = async (event, context) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    };
  }

  try {
    // Extract userId from path parameter
    const userId = event.path.split('/').pop();
    
    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing user ID' }),
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      };
    }
    
    // Get user's customer ID
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user:', userError);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Error fetching user data' }),
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      };
    }

    if (!userData?.stripe_customer_id) {
      return {
        statusCode: 200,
        body: JSON.stringify({ subscription: null }),
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      };
    }

    // Get active subscriptions for the customer
    const subscriptions = await stripe.subscriptions.list({
      customer: userData.stripe_customer_id,
      status: 'active',
      expand: ['data.default_payment_method']
    });

    if (subscriptions.data.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({ subscription: null }),
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ subscription: subscriptions.data[0] }),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    };
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    };
  }
};
