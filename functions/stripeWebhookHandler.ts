import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

Deno.serve(async (req) => {
  const requestId = crypto.randomUUID();
  
  try {
    const base44 = createClientFromRequest(req);
    
    // Read raw body before any processing
    const rawBody = await req.text();
    const sig = req.headers.get('stripe-signature');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (!sig || !webhookSecret) {
      console.error(`[${requestId}] Missing signature or webhook secret`);
      return new Response('Missing signature', { status: 400 });
    }
    
    let event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (err) {
      console.error(`[${requestId}] Webhook signature verification failed: ${err.message}`);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }
    
    // Use service role for all operations in webhook
    const svc = base44.asServiceRole;
    
    let result = null;
    
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        result = await handleSubscriptionChange(svc, event);
        break;
      case 'invoice.payment_succeeded':
      case 'invoice.payment_failed':
        result = await handlePaymentEvent(svc, event);
        break;
      case 'checkout.session.completed':
        result = await handleCheckoutCompleted(svc, event);
        break;
      default:
        console.log(`[${requestId}] Unhandled event type: ${event.type}`);
    }
    
    return new Response(JSON.stringify({ received: true, processed: !!result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error(`[${requestId}] Internal error:`, error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

async function handleSubscriptionChange(svc, event) {
  const subscription = event.data.object;
  const customerId = subscription.customer;
  const userId = subscription.metadata?.base44_user_id; // Use metadata if available for more reliable lookup
  
  // Find subscription record
  let billingRecords = [];
  
  if (userId) {
      billingRecords = await svc.entities.BillingSubscription.filter({ user_id: userId });
  } 
  
  if (billingRecords.length === 0) {
      billingRecords = await svc.entities.BillingSubscription.filter({ stripe_customer_id: customerId });
  }
  
  // If still no record and we have userId (new subscription), create one
  if (billingRecords.length === 0 && userId) {
      const newSub = await svc.entities.BillingSubscription.create({
          user_id: userId,
          stripe_customer_id: customerId,
          plan_key: 'developer', // Will be updated below
          status: subscription.status,
          stripe_subscription_id: subscription.id,
          period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          period_end: new Date(subscription.current_period_end * 1000).toISOString()
      });
      billingRecords = [newSub];
  }

  if (billingRecords.length === 0) {
    console.warn(`No billing record found for customer ${customerId} or user ${userId}`);
    return null;
  }
  
  const billingRecord = billingRecords[0];
  
  // Determine plan key from price ID
  let planKey = 'developer';
  const priceId = subscription.items.data[0]?.price?.id;
  
  const growthPriceId = Deno.env.get('STRIPE_PRICE_ID_GROWTH');
  const proPriceId = Deno.env.get('STRIPE_PRICE_ID_PRO');
  
  if (priceId === growthPriceId) planKey = 'growth';
  else if (priceId === proPriceId) planKey = 'pro';
  
  // Update subscription
  await svc.entities.BillingSubscription.update(billingRecord.id, {
    plan_key: planKey,
    status: subscription.status,
    stripe_customer_id: customerId, // Ensure this is set
    stripe_subscription_id: subscription.id,
    period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    period_end: new Date(subscription.current_period_end * 1000).toISOString()
  });
  
  // Update user metadata as well
  await svc.auth.updateUser(billingRecord.user_id, {
      user_metadata: { plan: planKey }
  });
  
  return { updated: true };
}

async function handlePaymentEvent(svc, event) {
  const invoice = event.data.object;
  const customerId = invoice.customer;
  
  const billingRecords = await svc.entities.BillingSubscription.filter({
    stripe_customer_id: customerId
  });
  
  if (billingRecords.length > 0) {
    await svc.entities.BillingSubscription.update(billingRecords[0].id, {
      last_invoice_url: invoice.hosted_invoice_url
    });
  }
  
  return { processed: true };
}

async function handleCheckoutCompleted(svc, event) {
  const session = event.data.object;
  const userId = session.metadata?.base44_user_id;
  
  if (!userId) return null;
  
  // Ensure customer ID is linked if subscription creation happened too fast or failed
  if (session.mode === 'subscription' || session.mode === 'payment') {
      // We can update customer ID here just in case
      const billingRecords = await svc.entities.BillingSubscription.filter({ user_id: userId });
      if (billingRecords.length > 0 && session.customer) {
          await svc.entities.BillingSubscription.update(billingRecords[0].id, {
             stripe_customer_id: session.customer
          });
      }
  }
  return { processed: true };
}