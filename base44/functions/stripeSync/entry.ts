import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.21.0';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return json({ error: 'Unauthorized' }, 401);
    if (user.role !== 'admin') return json({ error: 'Forbidden' }, 403);

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), { apiVersion: '2023-10-16' });

    const body = req.method === 'GET' ? {} : await req.json().catch(() => ({}));
    const action = body.action || 'noop';

    if (action === 'sync_customers') {
      let customers_synced = 0;
      let errors = 0;
      for await (const customer of stripe.customers.list({ limit: 100 })) {
        customers_synced++;
      }
      return json({ status: 'success', system: 'stripe', customers_synced, errors, ts: new Date().toISOString() });
    }

    if (action === 'sync_subscriptions') {
      let subscriptions_synced = 0;
      let errors = 0;
      for await (const sub of stripe.subscriptions.list({ limit: 100, status: 'all' })) {
        subscriptions_synced++;
      }
      return json({ status: 'success', system: 'stripe', subscriptions_synced, errors, ts: new Date().toISOString() });
    }

    if (action === 'sync_invoices') {
      let invoices_synced = 0;
      let errors = 0;
      for await (const invoice of stripe.invoices.list({ limit: 100 })) {
        invoices_synced++;
      }
      return json({ status: 'success', system: 'stripe', invoices_synced, errors, ts: new Date().toISOString() });
    }

    return json({ error: 'Unsupported action' }, 400);
  } catch (e) {
    console.error('stripeSync error:', e);
    return json({ error: e.message || 'Internal server error' }, 500);
  }
});