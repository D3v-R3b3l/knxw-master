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
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json().catch(() => ({}));
    const requestedUserId = payload?.user_id || payload?.data?.id || payload?.event?.entity_id || null;
    const isUserAutomation = payload?.event?.entity_name === 'User' && payload?.event?.entity_id;
    if (requestedUserId && requestedUserId !== user.id && !isUserAutomation) {
      return Response.json({ error: 'Forbidden: cannot create billing records for another user' }, { status: 403 });
    }

    const userId = isUserAutomation ? requestedUserId : user.id;
    const planKey = payload?.plan_key || 'developer';
    const status = payload?.status || 'active';

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