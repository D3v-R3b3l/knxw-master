import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

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
  try {
    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole;
    const payload = await req.json().catch(() => ({}));

    const userId = payload?.user_id || payload?.data?.id || payload?.event?.entity_id;
    const planKey = payload?.plan_key || 'developer';
    const status = payload?.status || 'active';

    if (!userId) {
      return Response.json({ error: 'user_id is required' }, { status: 400 });
    }

    const existing = await svc.entities.BillingSubscription.filter({ user_id: userId }, null, 1);
    const periodStart = new Date().toISOString();
    const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    if (existing?.[0]) {
      return Response.json({ success: true, billing_subscription_id: existing[0].id, created: false, subscription: existing[0] });
    }

    const created = await svc.entities.BillingSubscription.create({
      user_id: userId,
      plan_key: planKey,
      status,
      usage_this_period: emptyUsage(),
      period_start: periodStart,
      period_end: periodEnd
    });

    return Response.json({ success: true, billing_subscription_id: created.id, created: true, subscription: created });
  } catch (error) {
    console.error('ensureBillingSubscription error:', error);
    return Response.json({ error: error.message || String(error) }, { status: 500 });
  }
});