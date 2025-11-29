import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"), {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  if (!(await base44.auth.isAuthenticated())) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { plan_key, mode } = await req.json();
    const user = await base44.auth.me();

    if (!plan_key) {
      return new Response(JSON.stringify({ error: 'plan_key is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const priceIdMap = {
      developer: Deno.env.get('STRIPE_PRICE_ID_DEVELOPER'),
      growth: Deno.env.get('STRIPE_PRICE_ID_GROWTH'),
      pro: Deno.env.get('STRIPE_PRICE_ID_PRO')
    };

    const priceId = priceIdMap[plan_key];
    
    // Allow switching to developer plan (free) without price ID
    if (plan_key !== 'developer' && !priceId) {
      return new Response(JSON.stringify({ error: 'Invalid plan key or price not configured' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Handle free developer plan
    if (plan_key === 'developer') {
      // Find existing subscription if any
      const existingSubs = await base44.asServiceRole.entities.BillingSubscription.filter({ user_id: user.id });
      
      if (existingSubs.length > 0) {
        await base44.asServiceRole.entities.BillingSubscription.update(existingSubs[0].id, {
          plan_key: 'developer',
          status: 'active',
          period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        });
      } else {
         await base44.asServiceRole.entities.BillingSubscription.create({
            user_id: user.id,
            plan_key: 'developer',
            status: 'active',
            period_start: new Date().toISOString(),
            period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
         });
      }
      
      // Also update user record
      await base44.asServiceRole.auth.updateUser(user.id, {
        user_metadata: {
           ...user.user_metadata,
           plan: 'developer'
        }
      });

      return new Response(JSON.stringify({ 
        status: 'success',
        message: 'Developer plan activated',
        redirect_url: `${new URL(req.url).origin}/Dashboard`
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create Stripe checkout for paid plans
    // Determine mode: default to 'subscription' unless explicit or implied otherwise
    const checkoutMode = mode || 'subscription';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: checkoutMode,
      success_url: `${new URL(req.url).origin}/Dashboard?subscription=success&plan=${plan_key}`,
      cancel_url: `${new URL(req.url).origin}/Settings?tab=billing&subscription=canceled`,
      customer_email: user.email,
      metadata: {
        base44_user_id: user.id,
        user_email: user.email,
        plan_key: plan_key
      },
      subscription_data: checkoutMode === 'subscription' ? {
        metadata: {
          base44_user_id: user.id,
          plan_key: plan_key
        }
      } : undefined
    });

    return new Response(JSON.stringify({ 
      checkout_url: session.url,
      session_id: session.id
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Checkout creation error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to create checkout session',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});