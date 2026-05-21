import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.21.0';

Deno.serve(async (req) => {
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
    const customerId = subs?.[0]?.stripe_customer_id;

    if (!customerId) {
      return Response.json({ invoices: [] });
    }

    const result = await stripe.invoices.list({
      customer: customerId,
      limit: 24,
      expand: ['data.charge']
    });

    const invoices = result.data.map(inv => ({
      id: inv.id,
      number: inv.number,
      date: inv.created,
      amount_due: inv.amount_due,
      amount_paid: inv.amount_paid,
      currency: inv.currency,
      status: inv.status,
      hosted_invoice_url: inv.hosted_invoice_url,
      invoice_pdf: inv.invoice_pdf,
      description: inv.description || inv.lines?.data?.[0]?.description || null
    }));

    return Response.json({ invoices });
  } catch (error) {
    console.error('getStripeInvoices error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});