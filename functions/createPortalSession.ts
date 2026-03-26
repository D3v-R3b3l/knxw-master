import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"), {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const traceId = crypto.randomUUID();

    try {
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Find the user's Stripe Customer ID from their billing subscription record
        // Using asServiceRole to ensure we can read the record even if RLS is strict (though user should be able to read own)
        const subscriptions = await base44.asServiceRole.entities.BillingSubscription.filter({ user_id: user.id }, null, 1);
        const subscription = subscriptions[0] || null;
        
        if (!subscription || !subscription.stripe_customer_id) {
            return Response.json({ error: 'No active billing subscription found for this user.' }, { status: 404 });
        }
        
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: subscription.stripe_customer_id,
            return_url: `${new URL(req.url).origin}/Settings`,
        });

        return Response.json({ url: portalSession.url });

    } catch (error) {
        console.error(`[${traceId}] Failed to create Stripe portal session:`, error);
        return Response.json({ error: 'Failed to create customer portal session.', details: error.message, trace_id: traceId }, { status: 500 });
    }
});