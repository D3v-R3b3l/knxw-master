import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';
import Stripe from 'npm:stripe@12.18.0';

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  if (!(await base44.auth.isAuthenticated())) {
    return json({ error: 'Unauthorized' }, 401);
  }
  const secret = Deno.env.get('STRIPE_SECRET_KEY');
  if (!secret) return json({ error: 'Missing STRIPE_SECRET_KEY' }, 400);

  const stripe = new Stripe(secret, { apiVersion: '2023-10-16' });

  // Optional: prefer configured secrets for specific price IDs to ensure deterministic catalog
  const PRICE_DEV = Deno.env.get('STRIPE_PRICE_ID_DEVELOPER');
  const PRICE_GROWTH = Deno.env.get('STRIPE_PRICE_ID_GROWTH');
  const PRICE_PRO = Deno.env.get('STRIPE_PRICE_ID_PRO');

  try {
    const priceIds = [PRICE_DEV, PRICE_GROWTH, PRICE_PRO].filter(Boolean);

    let prices = [];
    if (priceIds.length) {
      // Fetch specific prices
      for (const id of priceIds) {
        try {
          const price = await stripe.prices.retrieve(id);
          const product = await stripe.products.retrieve(String(price.product));
          prices.push({ price, product });
        } catch (e) {
          // ignore bad ids
        }
      }
    } else {
      // Fallback: list all active recurring prices and attach product info
      const list = await stripe.prices.list({ active: true, limit: 10, expand: ['data.product'] });
      prices = list.data.map((p) => ({ price: p, product: p.product }));
    }

    // Normalize the catalog into plan cards
    const catalog = prices
      .filter(({ price }) => price.recurring)
      .map(({ price, product }) => ({
        plan_key: (product?.name || '').toLowerCase().includes('developer') ? 'developer'
          : (product?.name || '').toLowerCase().includes('growth') ? 'growth'
          : (product?.name || '').toLowerCase().includes('pro') ? 'pro'
          : product?.name?.toLowerCase().replace(/\s+/g, '_') || 'plan',
        product_id: product?.id,
        product_name: product?.name,
        description: product?.description || '',
        price_id: price.id, // not exposed to UI for selection; returned for admin display only
        currency: price.currency,
        interval: price.recurring?.interval,
        unit_amount: price.unit_amount,
        features: product?.marketing_features?.length ? product.marketing_features.map((f) => f.name ?? String(f)) : []
      }));

    return json({ catalog });
  } catch (e) {
    return json({ error: 'Failed to fetch products', details: e?.message || String(e) }, 500);
  }
});