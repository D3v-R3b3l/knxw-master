import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient()
});

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

function normalizePlanKey(planKey) {
  if (planKey === 'builder') return 'developer';
  if (planKey === 'scale') return 'growth';
  if (planKey === 'infrastructure') return 'pro';
  return planKey;
}

function emptyUsage() {
  return {
    psychographic_credits: 0,
    s3_exports: 0,
    eventbridge_events: 0,
    ses_emails: 0,
    conversions_forwarded: 0
  };
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  if (!(await base44.auth.isAuthenticated())) {
    return json({ error: 'Unauthorized' }, 401);
  }

  try {
    const { plan_key, mode } = await req.json();
    const user = await base44.auth.me();
    const svc = base44.asServiceRole;
    const normalizedPlanKey = normalizePlanKey(plan_key);

    if (!normalizedPlanKey) {
      return json({ error: 'plan_key is required' }, 400);
    }

    const priceIdMap = {
      developer: Deno.env.get('STRIPE_PRICE_ID_DEVELOPER') || null,
      growth: Deno.env.get('STRIPE_PRICE_ID_GROWTH') || null,
      pro: Deno.env.get('STRIPE_PRICE_ID_PRO') || null
    };

    const existingSubs = await svc.entities.BillingSubscription.filter({ user_id: user.id }, null, 1);
    const existingSub = existingSubs?.[0] || null;

    if (normalizedPlanKey === 'developer') {
      if (existingSub?.stripe_subscription_id) {
        try {
          await stripe.subscriptions.update(existingSub.stripe_subscription_id, { cancel_at_period_end: true });
        } catch (error) {
          console.warn('createCheckout downgrade cancel warning:', error.message);
        }

        const redirectUrl = `${new URL(req.url).origin}/Settings?tab=billing&subscription=downgrade_scheduled`;
        return json({
          status: 'success',
          message: 'Paid subscription downgrade scheduled. Stripe remains authoritative until the subscription ends.',
          redirect_url: redirectUrl,
          url: redirectUrl
        });
      }

      const subscriptionPayload = {
        user_id: user.id,
        plan_key: 'developer',
        status: 'active',
        usage_this_period: existingSub?.usage_this_period || emptyUsage(),
        stripe_customer_id: existingSub?.stripe_customer_id || null,
        stripe_subscription_id: null,
        period_start: new Date().toISOString(),
        period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };

      if (existingSub) {
        await svc.entities.BillingSubscription.update(existingSub.id, subscriptionPayload);
      } else {
        await svc.entities.BillingSubscription.create(subscriptionPayload);
      }

      const redirectUrl = `${new URL(req.url).origin}/Dashboard`;
      return json({
        status: 'success',
        message: 'Developer plan activated',
        redirect_url: redirectUrl,
        url: redirectUrl
      });
    }

    const priceId = priceIdMap[normalizedPlanKey];
    if (!priceId) {
      return json({ error: 'Invalid plan key or price not configured' }, 400);
    }

    let customerId = existingSub?.stripe_customer_id || null;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          base44_user_id: user.id,
          user_email: user.email
        }
      });
      customerId = customer.id;
    }

    if (existingSub?.stripe_subscription_id && ['active', 'trialing', 'past_due'].includes(existingSub.status)) {
      const currentSubscription = await stripe.subscriptions.retrieve(existingSub.stripe_subscription_id);
      const currentItemId = currentSubscription.items.data[0]?.id;

      if (currentItemId) {
        await stripe.subscriptions.update(existingSub.stripe_subscription_id, {
          items: [{ id: currentItemId, price: priceId }],
          metadata: {
            ...(currentSubscription.metadata || {}),
            base44_user_id: user.id,
            plan_key: normalizedPlanKey
          },
          proration_behavior: 'create_prorations'
        });

        if (!existingSub.stripe_customer_id) {
          await svc.entities.BillingSubscription.update(existingSub.id, {
            stripe_customer_id: customerId,
            stripe_subscription_id: existingSub.stripe_subscription_id
          });
        }

        const redirectUrl = `${new URL(req.url).origin}/Settings?tab=billing&subscription=updated`;
        return json({
          status: 'success',
          message: 'Subscription update initiated. Stripe webhook sync remains authoritative.',
          redirect_url: redirectUrl,
          url: redirectUrl
        });
      }
    }

    const subscriptionPayload = {
      user_id: user.id,
      plan_key: normalizedPlanKey,
      status: existingSub?.status === 'active' ? 'active' : 'incomplete',
      stripe_customer_id: customerId,
      stripe_subscription_id: existingSub?.stripe_subscription_id || null,
      usage_this_period: existingSub?.usage_this_period || emptyUsage(),
      period_start: existingSub?.period_start || new Date().toISOString(),
      period_end: existingSub?.period_end || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    if (existingSub) {
      await svc.entities.BillingSubscription.update(existingSub.id, subscriptionPayload);
    } else {
      await svc.entities.BillingSubscription.create(subscriptionPayload);
    }

    const checkoutMode = mode || 'subscription';
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: checkoutMode,
      success_url: `${new URL(req.url).origin}/Dashboard?subscription=success&plan=${normalizedPlanKey}`,
      cancel_url: `${new URL(req.url).origin}/Settings?tab=billing&subscription=canceled`,
      customer: customerId,
      metadata: {
        base44_user_id: user.id,
        user_email: user.email,
        plan_key: normalizedPlanKey
      },
      subscription_data: checkoutMode === 'subscription' ? {
        metadata: {
          base44_user_id: user.id,
          plan_key: normalizedPlanKey
        }
      } : undefined
    });

    return json({ checkout_url: session.url, url: session.url, session_id: session.id });
  } catch (error) {
    console.error('Checkout creation error:', error);
    return json({ error: 'Failed to create checkout session', details: error.message }, 500);
  }
});