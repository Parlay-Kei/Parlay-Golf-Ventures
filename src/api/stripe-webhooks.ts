import { supabase } from '@/lib/supabase';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';

type WebhookHandlerResponse = {
  success: boolean;
  message: string;
};

/**
 * Process a Stripe webhook event
 * @param event The Stripe webhook event
 * @returns Response indicating success or failure
 */
export const processWebhookEvent = async (event: Stripe.Event): Promise<WebhookHandlerResponse> => {
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        return await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
      
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        return await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
      
      case 'customer.subscription.deleted':
        return await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      
      case 'invoice.payment_succeeded':
        return await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
      
      case 'invoice.payment_failed':
        return await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
      
      case 'customer.created':
      case 'customer.updated':
        return await handleCustomerUpdated(event.data.object as Stripe.Customer);
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
        return { success: true, message: `Unhandled event type: ${event.type}` };
    }
  } catch (error) {
    console.error(`Error processing webhook event ${event.type}:`, error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error processing webhook'
    };
  }
};

/**
 * Handle checkout.session.completed event
 * @param session The checkout session
 * @returns Response indicating success or failure
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<WebhookHandlerResponse> {
  try {
    // Extract customer and metadata
    const customerId = session.customer as string;
    const userId = session.client_reference_id;
    
    if (!userId) {
      throw new Error('No user ID found in session metadata');
    }
    
    // Store customer ID in database if it doesn't exist
    const { data: existingCustomer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (customerError && customerError.code !== 'PGRST116') { // PGRST116 is "not found"
      throw new Error(`Error fetching customer: ${customerError.message}`);
    }
    
    if (!existingCustomer) {
      // Get customer email from Stripe
      const customer = await stripe.customers.retrieve(customerId);
      
      // Insert new customer record
      const { error: insertError } = await supabase
        .from('customers')
        .insert({
          id: userId,
          stripe_customer_id: customerId,
          email: customer.email || session.customer_email,
        });
      
      if (insertError) {
        throw new Error(`Error inserting customer: ${insertError.message}`);
      }
    }
    
    return { success: true, message: 'Checkout session completed successfully' };
  } catch (error) {
    console.error('Error handling checkout.session.completed:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error handling checkout session'
    };
  }
}

/**
 * Handle customer.subscription.created and customer.subscription.updated events
 * @param subscription The subscription object
 * @returns Response indicating success or failure
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<WebhookHandlerResponse> {
  try {
    // Get customer ID from subscription
    const customerId = subscription.customer as string;
    
    // Find user ID from customer ID
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single();
    
    if (customerError) {
      throw new Error(`Error finding user for customer ${customerId}: ${customerError.message}`);
    }
    
    const userId = customer.id;
    
    // Get price details to determine tier
    const priceId = subscription.items.data[0].price.id;
    const { data: price, error: priceError } = await supabase
      .from('prices')
      .select('tier')
      .eq('stripe_price_id', priceId)
      .single();
    
    if (priceError) {
      // If price not found in our database, fetch from Stripe
      const stripePrice = await stripe.prices.retrieve(priceId);
      const productId = stripePrice.product as string;
      const product = await stripe.products.retrieve(productId);
      
      // Determine tier from product name or metadata
      let tier = 'free';
      if (product.name.toLowerCase().includes('driven')) {
        tier = 'driven';
      } else if (product.name.toLowerCase().includes('aspiring')) {
        tier = 'aspiring';
      } else if (product.name.toLowerCase().includes('breakthrough')) {
        tier = 'breakthrough';
      }
      
      // Insert the price into our database
      await supabase
        .from('prices')
        .insert({
          stripe_price_id: priceId,
          stripe_product_id: productId,
          tier,
          currency: stripePrice.currency,
          unit_amount: stripePrice.unit_amount || 0,
          interval: stripePrice.recurring?.interval || 'month',
          interval_count: stripePrice.recurring?.interval_count || 1,
        });
      
      // Use the determined tier
      price = { tier };
    }
    
    // Update or insert subscription record
    const { data: existingSub, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('stripe_subscription_id', subscription.id)
      .single();
    
    const subscriptionData = {
      user_id: userId,
      stripe_subscription_id: subscription.id,
      stripe_price_id: priceId,
      tier: price.tier,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
      updated_at: new Date().toISOString()
    };
    
    if (subError && subError.code === 'PGRST116') { // Not found
      // Insert new subscription
      const { error: insertError } = await supabase
        .from('subscriptions')
        .insert(subscriptionData);
      
      if (insertError) {
        throw new Error(`Error inserting subscription: ${insertError.message}`);
      }
    } else if (!subError) {
      // Update existing subscription
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update(subscriptionData)
        .eq('id', existingSub.id);
      
      if (updateError) {
        throw new Error(`Error updating subscription: ${updateError.message}`);
      }
    } else {
      throw new Error(`Error checking for existing subscription: ${subError.message}`);
    }
    
    // Update user profile with new tier
    if (subscription.status === 'active') {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ tier: price.tier })
        .eq('id', userId);
      
      if (profileError) {
        console.error(`Error updating user profile tier: ${profileError.message}`);
        // Continue anyway, as the trigger should handle this
      }
    }
    
    return { 
      success: true, 
      message: `Subscription ${existingSub ? 'updated' : 'created'} successfully` 
    };
  } catch (error) {
    console.error('Error handling subscription update:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error handling subscription update'
    };
  }
}

/**
 * Handle customer.subscription.deleted event
 * @param subscription The subscription object
 * @returns Response indicating success or failure
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<WebhookHandlerResponse> {
  try {
    // Update subscription status to canceled
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        canceled_at: new Date(subscription.canceled_at || Date.now()).toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscription.id);
    
    if (updateError) {
      throw new Error(`Error updating subscription status: ${updateError.message}`);
    }
    
    // Get user ID from subscription
    const { data: sub, error: subError } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_subscription_id', subscription.id)
      .single();
    
    if (subError) {
      throw new Error(`Error finding subscription: ${subError.message}`);
    }
    
    // Update user profile tier to free
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ tier: 'free' })
      .eq('id', sub.user_id);
    
    if (profileError) {
      console.error(`Error updating user profile tier: ${profileError.message}`);
      // Continue anyway, as the trigger should handle this
    }
    
    return { success: true, message: 'Subscription canceled successfully' };
  } catch (error) {
    console.error('Error handling subscription deletion:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error handling subscription deletion'
    };
  }
}

/**
 * Handle invoice.payment_succeeded event
 * @param invoice The invoice object
 * @returns Response indicating success or failure
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<WebhookHandlerResponse> {
  try {
    // Only process subscription invoices
    if (!invoice.subscription) {
      return { success: true, message: 'Not a subscription invoice' };
    }
    
    // Get customer ID from invoice
    const customerId = invoice.customer as string;
    
    // Find user ID from customer ID
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single();
    
    if (customerError) {
      throw new Error(`Error finding user for customer ${customerId}: ${customerError.message}`);
    }
    
    // Store invoice in database
    const { error: insertError } = await supabase
      .from('invoices')
      .insert({
        user_id: customer.id,
        stripe_invoice_id: invoice.id,
        stripe_subscription_id: invoice.subscription,
        amount_due: invoice.amount_due,
        amount_paid: invoice.amount_paid,
        currency: invoice.currency,
        status: invoice.status,
        invoice_pdf: invoice.invoice_pdf,
        hosted_invoice_url: invoice.hosted_invoice_url
      });
    
    if (insertError) {
      throw new Error(`Error inserting invoice: ${insertError.message}`);
    }
    
    return { success: true, message: 'Invoice recorded successfully' };
  } catch (error) {
    console.error('Error handling invoice payment succeeded:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error handling invoice payment'
    };
  }
}

/**
 * Handle invoice.payment_failed event
 * @param invoice The invoice object
 * @returns Response indicating success or failure
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<WebhookHandlerResponse> {
  try {
    // Only process subscription invoices
    if (!invoice.subscription) {
      return { success: true, message: 'Not a subscription invoice' };
    }
    
    // Get customer ID from invoice
    const customerId = invoice.customer as string;
    
    // Find user ID from customer ID
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single();
    
    if (customerError) {
      throw new Error(`Error finding user for customer ${customerId}: ${customerError.message}`);
    }
    
    // Store invoice in database
    const { error: insertError } = await supabase
      .from('invoices')
      .insert({
        user_id: customer.id,
        stripe_invoice_id: invoice.id,
        stripe_subscription_id: invoice.subscription,
        amount_due: invoice.amount_due,
        amount_paid: invoice.amount_paid,
        currency: invoice.currency,
        status: invoice.status,
        invoice_pdf: invoice.invoice_pdf,
        hosted_invoice_url: invoice.hosted_invoice_url
      });
    
    if (insertError) {
      throw new Error(`Error inserting invoice: ${insertError.message}`);
    }
    
    // TODO: Send email notification to user about failed payment
    
    return { success: true, message: 'Failed invoice recorded successfully' };
  } catch (error) {
    console.error('Error handling invoice payment failed:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error handling invoice payment failure'
    };
  }
}

/**
 * Handle customer.created and customer.updated events
 * @param customer The customer object
 * @returns Response indicating success or failure
 */
async function handleCustomerUpdated(customer: Stripe.Customer): Promise<WebhookHandlerResponse> {
  try {
    // Find user ID from customer ID
    const { data: existingCustomer, error: customerError } = await supabase
      .from('customers')
      .select('id')
      .eq('stripe_customer_id', customer.id)
      .single();
    
    if (customerError && customerError.code !== 'PGRST116') { // Not found is ok
      throw new Error(`Error finding customer: ${customerError.message}`);
    }
    
    if (!existingCustomer) {
      // This is a customer created outside our system, we can't link it to a user
      return { success: true, message: 'Customer not linked to a user in our system' };
    }
    
    // Update customer record
    const { error: updateError } = await supabase
      .from('customers')
      .update({
        email: customer.email,
        updated_at: new Date().toISOString()
      })
      .eq('stripe_customer_id', customer.id);
    
    if (updateError) {
      throw new Error(`Error updating customer: ${updateError.message}`);
    }
    
    return { success: true, message: 'Customer updated successfully' };
  } catch (error) {
    console.error('Error handling customer update:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error handling customer update'
    };
  }
}
