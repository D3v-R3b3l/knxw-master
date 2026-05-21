import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.21.0';

Deno.serve(async (req) => {
  const traceId = crypto.randomUUID();
  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient()
    });

    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subs = await base44.asServiceRole.entities.BillingSubscription.filter({ user_id: user.id }, null, 1);
    const sub = subs?.[0];

    if (!sub?.stripe_customer_id) {
      return Response.json({ error: 'No Stripe customer found for this account.' }, { status: 404 });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${new URL(req.url).origin}/Settings?tab=billing`
    });

    return Response.json({ url: portalSession.url });
  } catch (error) {
    console.error(`[${traceId}] createPortalSession failed:`, error);
    return Response.json({ error: 'Failed to open billing portal.', details: error.message, trace_id: traceId }, { status: 500 });
  }
});