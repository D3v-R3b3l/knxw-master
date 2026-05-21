import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.21.0';

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
  return { psychographic_credits: 0, s3_exports: 0, eventbridge_events: 0, ses_emails: 0, conversions_forwarded: 0 };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    if (!(await base44.auth.isAuthenticated())) {
      return json({ error: 'Unauthorized' }, 401);
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient()
    });

    const { plan_key, mode } = await req.json();
    const user = await base44.auth.me();
    const svc = base44.asServiceRole;
    const normalizedPlanKey = normalizePlanKey(plan_key);

    if (!normalizedPlanKey) {
      return json({ error: 'plan_key is required' }, 400);
    }

    const priceIdMap = {
      developer: Deno.env.get('STRIPE_PRICE_ID_DEVELOPER') || null,
      growth:    Deno.env.get('STRIPE_PRICE_ID_GROWTH')    || null,
      pro:       Deno.env.get('STRIPE_PRICE_ID_PRO')       || null
    };

    const existingSubs = await svc.entities.BillingSubscription.filter({ user_id: user.id }, null, 1);
    const existingSub = existingSubs?.[0] || null;

    // ── Developer (free) plan ──────────────────────────────────────────────
    if (normalizedPlanKey === 'developer') {
      if (existingSub?.stripe_subscription_id) {
        try {
          await stripe.subscriptions.update(existingSub.stripe_subscription_id, { cancel_at_period_end: true });
        } catch (err) {
          console.warn('createCheckout downgrade cancel warning:', err.message);
        }
        const redirectUrl = `${new URL(req.url).origin}/Settings?tab=billing&subscription=downgrade_scheduled`;
        return json({ status: 'success', message: 'Downgrade scheduled at period end.', redirect_url: redirectUrl });
      }

      const payload = {
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
        await svc.entities.BillingSubscription.update(existingSub.id, payload);
      } else {
        await svc.entities.BillingSubscription.create(payload);
      }

      // Sync to User entity
      await svc.entities.User.update(user.id, {
        current_plan_key: 'developer',
        plan_status: 'active',
        subscription_updated_at: new Date().toISOString()
      }).catch(e => console.error('User sync failed:', e.message));

      return json({ status: 'success', message: 'Developer plan activated.', redirect_url: `${new URL(req.url).origin}/Dashboard` });
    }

    // ── Paid plans ─────────────────────────────────────────────────────────
    const priceId = priceIdMap[normalizedPlanKey];
    if (!priceId) {
      return json({ error: `No Stripe price ID configured for plan: ${normalizedPlanKey}` }, 400);
    }

    // Find or create Stripe customer
    let customerId = existingSub?.stripe_customer_id || null;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { base44_user_id: user.id, user_email: user.email }
      });
      customerId = customer.id;
    }

    // Upgrade/downgrade existing active subscription in-place (no new checkout)
    if (existingSub?.stripe_subscription_id && ['active', 'trialing', 'past_due'].includes(existingSub.status)) {
      const currentSub = await stripe.subscriptions.retrieve(existingSub.stripe_subscription_id);
      const currentItemId = currentSub.items.data[0]?.id;
      if (currentItemId) {
        await stripe.subscriptions.update(existingSub.stripe_subscription_id, {
          items: [{ id: currentItemId, price: priceId }],
          metadata: { base44_user_id: user.id, plan_key: normalizedPlanKey },
          proration_behavior: 'create_prorations'
        });
        await svc.entities.BillingSubscription.update(existingSub.id, {
          plan_key: normalizedPlanKey,
          stripe_customer_id: customerId
        });
        return json({
          status: 'success',
          message: 'Subscription updated. Changes take effect immediately.',
          redirect_url: `${new URL(req.url).origin}/Settings?tab=billing&subscription=updated`
        });
      }
    }

    // Ensure BillingSubscription row exists before Stripe redirect
    // (webhook will overwrite once payment confirms)
    const subPayload = {
      user_id: user.id,
      plan_key: normalizedPlanKey,
      status: 'incomplete',
      stripe_customer_id: customerId,
      stripe_subscription_id: existingSub?.stripe_subscription_id || null,
      usage_this_period: existingSub?.usage_this_period || emptyUsage(),
      period_start: existingSub?.period_start || new Date().toISOString(),
      period_end: existingSub?.period_end || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };
    if (existingSub) {
      await svc.entities.BillingSubscription.update(existingSub.id, subPayload);
    } else {
      await svc.entities.BillingSubscription.create(subPayload);
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: mode || 'subscription',
      success_url: `${new URL(req.url).origin}/Dashboard?subscription=success&plan=${normalizedPlanKey}`,
      cancel_url: `${new URL(req.url).origin}/Settings?tab=billing&subscription=canceled`,
      customer: customerId,
      metadata: { base44_user_id: user.id, user_email: user.email, plan_key: normalizedPlanKey },
      subscription_data: {
        metadata: { base44_user_id: user.id, plan_key: normalizedPlanKey }
      }
    });

    return json({ checkout_url: session.url, session_id: session.id });
  } catch (error) {
    console.error('createCheckout error:', error);
    return json({ error: 'Failed to create checkout session', details: error.message }, 500);
  }
});