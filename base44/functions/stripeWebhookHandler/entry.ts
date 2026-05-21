import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.21.0';

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

function emptyUsage() {
  return { psychographic_credits: 0, s3_exports: 0, eventbridge_events: 0, ses_emails: 0, conversions_forwarded: 0 };
}

Deno.serve(async (req) => {
  const requestId = crypto.randomUUID();

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient()
    });

    const base44 = createClientFromRequest(req);
    const rawBody = await req.text();
    const signature = req.headers.get('stripe-signature');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    if (!signature || !webhookSecret) {
      console.error(`[${requestId}] Missing stripe-signature or STRIPE_WEBHOOK_SECRET`);
      return new Response('Missing stripe signature', { status: 400 });
    }

    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret);
    } catch (err) {
      console.error(`[${requestId}] Webhook verification failed:`, err.message);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    const svc = base44.asServiceRole;

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionChange(svc, event.data.object);
        break;
      case 'invoice.payment_succeeded':
      case 'invoice.payment_failed':
        await handleInvoiceEvent(svc, event.type, event.data.object);
        break;
      case 'checkout.session.completed':
        await handleCheckoutCompleted(svc, event.data.object);
        break;
      default:
        console.log(`[${requestId}] Unhandled Stripe event: ${event.type}`);
    }

    return json({ received: true });
  } catch (error) {
    console.error(`[${requestId}] stripeWebhookHandler failed:`, error);
    return json({ error: 'Internal server error', details: error.message }, 500);
  }
});

// ── Helpers ──────────────────────────────────────────────────────────────────

function getPlanKeyFromPriceId(priceId) {
  if (priceId === Deno.env.get('STRIPE_PRICE_ID_GROWTH'))    return 'growth';
  if (priceId === Deno.env.get('STRIPE_PRICE_ID_PRO'))       return 'pro';
  if (priceId === Deno.env.get('STRIPE_PRICE_ID_DEVELOPER')) return 'developer';
  return null;
}

async function findBillingRecord(svc, subscription, userId) {
  if (subscription?.id) {
    const r = await svc.entities.BillingSubscription.filter({ stripe_subscription_id: subscription.id }, null, 1);
    if (r?.length) return r[0];
  }
  if (userId) {
    const r = await svc.entities.BillingSubscription.filter({ user_id: userId }, null, 1);
    if (r?.length) return r[0];
  }
  if (subscription?.customer) {
    const r = await svc.entities.BillingSubscription.filter({ stripe_customer_id: subscription.customer }, null, 1);
    if (r?.length) return r[0];
  }
  return null;
}

async function syncUserPlan(svc, userId, planKey, status) {
  if (!userId) return;
  await svc.entities.User.update(userId, {
    current_plan_key: planKey,
    plan_status: status,
    subscription_updated_at: new Date().toISOString()
  }).catch(e => console.error(`[stripeWebhookHandler] User sync failed for ${userId}:`, e.message));
}

async function handleSubscriptionChange(svc, subscription) {
  const userId = subscription.metadata?.base44_user_id || null;
  const billingRecord = await findBillingRecord(svc, subscription, userId);
  const priceId = subscription.items.data[0]?.price?.id;
  const resolvedPlanKey = getPlanKeyFromPriceId(priceId);

  if (!resolvedPlanKey) {
    console.error(`[stripeWebhookHandler] Unknown price_id: ${priceId} — writing remediation record`);
    await svc.entities.SubscriptionSyncRemediation.create({
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer || null,
      stripe_session_id: null,
      reason: 'unknown_price_id',
      raw_metadata: { price_id: priceId, metadata: subscription.metadata || {} },
      resolution_status: 'pending'
    }).catch(e => console.error('remediation write failed:', e.message));
    return billingRecord;
  }

  const planKey = subscription.status === 'canceled' ? 'developer' : resolvedPlanKey;
  const periodStart = new Date(subscription.current_period_start * 1000).toISOString();
  const periodEnd   = new Date(subscription.current_period_end   * 1000).toISOString();

  // Reset usage on new billing period
  const usageThisPeriod = (billingRecord && billingRecord.period_end !== periodEnd)
    ? emptyUsage()
    : (billingRecord?.usage_this_period || emptyUsage());

  const payload = {
    user_id: billingRecord?.user_id || userId,
    plan_key: planKey,
    status: subscription.status,
    stripe_customer_id: subscription.customer,
    stripe_subscription_id: subscription.id,
    usage_this_period: usageThisPeriod,
    period_start: periodStart,
    period_end: periodEnd
  };

  let record = billingRecord;
  if (record) {
    await svc.entities.BillingSubscription.update(record.id, payload);
  } else if (payload.user_id) {
    record = await svc.entities.BillingSubscription.create(payload);
  }

  await syncUserPlan(svc, payload.user_id, planKey, subscription.status);
  return record;
}

async function handleInvoiceEvent(svc, eventType, invoice) {
  const records = await svc.entities.BillingSubscription.filter({ stripe_customer_id: invoice.customer }, null, 1);
  const record = records?.[0];
  if (!record) return;

  const updates = { last_invoice_url: invoice.hosted_invoice_url || record.last_invoice_url };
  if (eventType === 'invoice.payment_failed') updates.status = 'past_due';

  await svc.entities.BillingSubscription.update(record.id, updates);
  if (eventType === 'invoice.payment_failed') {
    await syncUserPlan(svc, record.user_id, record.plan_key, 'past_due');
  }
}

async function handleCheckoutCompleted(svc, session) {
  let userId = session.metadata?.base44_user_id || null;

  if (!userId && session.customer) {
    const r = await svc.entities.BillingSubscription.filter({ stripe_customer_id: session.customer }, null, 1);
    userId = r?.[0]?.user_id || null;
  }

  if (!userId) {
    console.error(`[stripeWebhookHandler] Cannot resolve user for session ${session.id}`);
    await svc.entities.SubscriptionSyncRemediation.create({
      stripe_session_id: session.id,
      stripe_customer_id: session.customer || null,
      stripe_subscription_id: session.subscription || null,
      reason: 'missing_metadata_base44_user_id',
      raw_metadata: session.metadata || {},
      resolution_status: 'pending'
    }).catch(e => console.error('remediation write failed:', e.message));
    return;
  }

  const records = await svc.entities.BillingSubscription.filter({ user_id: userId }, null, 1);
  const record = records?.[0];
  const planKey = session.metadata?.plan_key || record?.plan_key || 'developer';

  const payload = {
    user_id: userId,
    plan_key: planKey,
    status: 'active',
    stripe_customer_id: session.customer || record?.stripe_customer_id || null,
    stripe_subscription_id: session.subscription || record?.stripe_subscription_id || null,
    usage_this_period: record?.usage_this_period || emptyUsage(),
    period_start: record?.period_start || new Date().toISOString(),
    period_end: record?.period_end || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  };

  if (record) {
    await svc.entities.BillingSubscription.update(record.id, payload);
  } else {
    await svc.entities.BillingSubscription.create(payload);
  }

  await syncUserPlan(svc, userId, planKey, 'active');
}