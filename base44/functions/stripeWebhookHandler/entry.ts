import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
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

function emptyUsage() {
  return {
    psychographic_credits: 0,
    s3_exports: 0,
    eventbridge_events: 0,
    ses_emails: 0,
    conversions_forwarded: 0
  };
}

function getPlanKeyFromPriceId(priceId) {
  if (priceId === Deno.env.get('STRIPE_PRICE_ID_GROWTH')) return 'growth';
  if (priceId === Deno.env.get('STRIPE_PRICE_ID_PRO')) return 'pro';
  if (priceId === Deno.env.get('STRIPE_PRICE_ID_DEVELOPER')) return 'developer';
  return 'developer';
}

Deno.serve(async (req) => {
  const requestId = crypto.randomUUID();

  try {
    const base44 = createClientFromRequest(req);
    const rawBody = await req.text();
    const signature = req.headers.get('stripe-signature');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    if (!signature || !webhookSecret) {
      console.error(`[${requestId}] Missing stripe signature or STRIPE_WEBHOOK_SECRET`);
      return new Response('Missing stripe signature', { status: 400 });
    }

    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret);
    } catch (error) {
      console.error(`[${requestId}] Webhook verification failed:`, error.message);
      return new Response(`Webhook Error: ${error.message}`, { status: 400 });
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

    return json({ received: true, processed: true });
  } catch (error) {
    console.error(`[${requestId}] stripeWebhookHandler failed:`, error);
    return json({ error: 'Internal server error', details: error.message }, 500);
  }
});

async function findBillingRecord(svc, subscription, userId) {
  let records = [];

  if (subscription?.id) {
    records = await svc.entities.BillingSubscription.filter({ stripe_subscription_id: subscription.id }, null, 1);
  }

  if (!records?.length && userId) {
    records = await svc.entities.BillingSubscription.filter({ user_id: userId }, null, 1);
  }

  if (!records?.length && subscription?.customer) {
    records = await svc.entities.BillingSubscription.filter({ stripe_customer_id: subscription.customer }, null, 1);
  }

  return records?.[0] || null;
}

async function handleSubscriptionChange(svc, subscription) {
  const userId = subscription.metadata?.base44_user_id || null;
  const billingRecord = await findBillingRecord(svc, subscription, userId);
  const priceId = subscription.items.data[0]?.price?.id;
  const planKey = getPlanKeyFromPriceId(priceId);
  const periodStart = new Date(subscription.current_period_start * 1000).toISOString();
  const periodEnd = new Date(subscription.current_period_end * 1000).toISOString();
  const usageThisPeriod = billingRecord && billingRecord.period_end !== periodEnd
    ? emptyUsage()
    : (billingRecord?.usage_this_period || emptyUsage());

  const payload = {
    user_id: billingRecord?.user_id || userId,
    plan_key: subscription.status === 'canceled' ? 'developer' : planKey,
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

  // Sync canonical plan key to User entity so FeatureGate reads a consistent value.
  // This is the single authoritative write path from Stripe into the user record.
  if (payload.user_id) {
    try {
      await svc.entities.User.update(payload.user_id, {
        current_plan_key: payload.plan_key,
        plan_status: payload.status,
        subscription_updated_at: new Date().toISOString()
      });
    } catch (userUpdateErr) {
      // Log but do not fail the webhook — BillingSubscription is still the fallback source.
      console.error(`[stripeWebhookHandler] Failed to sync current_plan_key to User ${payload.user_id}:`, userUpdateErr.message);
    }
  }

  return record;
}

async function handleInvoiceEvent(svc, eventType, invoice) {
  const records = await svc.entities.BillingSubscription.filter({ stripe_customer_id: invoice.customer }, null, 1);
  const record = records?.[0] || null;
  if (!record) return null;

  await svc.entities.BillingSubscription.update(record.id, {
    last_invoice_url: invoice.hosted_invoice_url || record.last_invoice_url,
    status: eventType === 'invoice.payment_failed' ? 'past_due' : record.status
  });

  return record;
}

async function handleCheckoutCompleted(svc, session) {
  let userId = session.metadata?.base44_user_id;

  // Fallback 1: resolve via existing BillingSubscription linked to this customer ID.
  if (!userId && session.customer) {
    const custRecords = await svc.entities.BillingSubscription.filter(
      { stripe_customer_id: session.customer }, null, 1
    );
    userId = custRecords?.[0]?.user_id || null;
    if (userId) {
      console.log(`[stripeWebhookHandler] checkout resolved user ${userId} via stripe_customer_id fallback. Session: ${session.id}`);
    }
  }

  if (!userId) {
    // Cannot resolve user via any path — write to remediation entity for admin follow-up.
    console.error(`[stripeWebhookHandler] checkout.session.completed UNRESOLVABLE. Session: ${session.id}, customer: ${session.customer}, subscription: ${session.subscription}`);
    await svc.entities.SubscriptionSyncRemediation.create({
      stripe_session_id: session.id,
      stripe_customer_id: session.customer || null,
      stripe_subscription_id: session.subscription || null,
      reason: 'missing_metadata_base44_user_id',
      raw_metadata: session.metadata || {},
      resolution_status: 'pending'
    }).catch(err => console.error('[stripeWebhookHandler] Failed to write remediation record:', err.message));
    return null;
  }

  const records = await svc.entities.BillingSubscription.filter({ user_id: userId }, null, 1);
  const record = records?.[0] || null;
  const planKey = session.metadata?.plan_key || record?.plan_key || 'developer';

  // checkout.session.completed means payment succeeded — status is 'active'.
  // The subsequent customer.subscription.created will overwrite this but we must
  // not leave the user in 'incomplete' state between the two events.
  const checkoutStatus = 'active';

  const payload = {
    user_id: userId,
    plan_key: planKey,
    status: checkoutStatus,
    stripe_customer_id: session.customer || record?.stripe_customer_id || null,
    stripe_subscription_id: session.subscription || record?.stripe_subscription_id || null,
    usage_this_period: record?.usage_this_period || emptyUsage(),
    period_start: record?.period_start || new Date().toISOString(),
    period_end: record?.period_end || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  };

  let savedRecord;
  if (record) {
    await svc.entities.BillingSubscription.update(record.id, payload);
    savedRecord = record;
  } else {
    savedRecord = await svc.entities.BillingSubscription.create(payload);
  }

  // Sync User entity immediately so FeatureGate and SubscriptionGate agree
  // without waiting for the subsequent customer.subscription.created webhook.
  try {
    await svc.entities.User.update(userId, {
      current_plan_key: planKey,
      plan_status: checkoutStatus,
      subscription_updated_at: new Date().toISOString()
    });
  } catch (userUpdateErr) {
    console.error(`[stripeWebhookHandler] checkout sync to User ${userId} failed:`, userUpdateErr.message);
  }

  return savedRecord;
}