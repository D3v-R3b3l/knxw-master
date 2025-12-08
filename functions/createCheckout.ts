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

    // Stripe Price IDs - map both old and new tier names
    const priceIdMap = {
      // New tier names
      builder: Deno.env.get('STRIPE_PRICE_ID_DEVELOPER') || 'price_1RxOiNPXI4AuHlkXnpgSAkdv', // $0/mo
      scale: Deno.env.get('STRIPE_PRICE_ID_GROWTH') || 'price_1RxOkgPXI4AuHlkXhuWHXY42',     // $99/mo
      infrastructure: Deno.env.get('STRIPE_PRICE_ID_PRO') || 'price_1RxOlFPXI4AuHlkXQQHyZAPp', // $499/mo
      
      // Legacy tier names (backward compatibility)
      developer: Deno.env.get('STRIPE_PRICE_ID_DEVELOPER') || 'price_1RxOiNPXI4AuHlkXnpgSAkdv',
      growth: Deno.env.get('STRIPE_PRICE_ID_GROWTH') || 'price_1RxOkgPXI4AuHlkXhuWHXY42',
      pro: Deno.env.get('STRIPE_PRICE_ID_PRO') || 'price_1RxOlFPXI4AuHlkXQQHyZAPp'
    };

    const priceId = priceIdMap[plan_key];
    
    // Allow switching to builder/developer plan (free) without price ID
    if (plan_key !== 'developer' && plan_key !== 'builder' && !priceId) {
      return new Response(JSON.stringify({ error: 'Invalid plan key or price not configured' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Handle free builder plan (formerly developer)
    if (plan_key === 'developer' || plan_key === 'builder') {
      // Normalize to 'builder' for new naming
      const normalizedKey = 'builder';
      
      // Find existing subscription if any
      const existingSubs = await base44.asServiceRole.entities.BillingSubscription.filter({ user_id: user.id });
      
      if (existingSubs.length > 0) {
        await base44.asServiceRole.entities.BillingSubscription.update(existingSubs[0].id, {
          plan_key: normalizedKey,
          status: 'active',
          period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        });
      } else {
         await base44.asServiceRole.entities.BillingSubscription.create({
            user_id: user.id,
            plan_key: normalizedKey,
            status: 'active',
            period_start: new Date().toISOString(),
            period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
         });
      }
      
      // Also update user record
      await base44.asServiceRole.auth.updateUser(user.id, {
        user_metadata: {
           ...user.user_metadata,
           plan: normalizedKey
        }
      });

      return new Response(JSON.stringify({ 
        status: 'success',
        message: 'Builder plan activated',
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