import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function emptyUsage() {
  return { psychographic_credits: 0, s3_exports: 0, eventbridge_events: 0, ses_emails: 0, conversions_forwarded: 0 };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole;

    // Supports both direct calls (authenticated user) and entity automation payloads
    let userId;
    const payload = await req.json().catch(() => ({}));
    const isAutomation = payload?.event?.entity_name === 'User' && payload?.event?.entity_id;

    if (isAutomation) {
      userId = payload.event.entity_id;
    } else {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
      userId = user.id;
    }

    const existing = await svc.entities.BillingSubscription.filter({ user_id: userId }, null, 1);
    if (existing?.[0]) {
      return Response.json({ success: true, created: false, subscription: existing[0] });
    }

    const created = await svc.entities.BillingSubscription.create({
      user_id: userId,
      plan_key: 'developer',
      status: 'active',
      usage_this_period: emptyUsage(),
      period_start: new Date().toISOString(),
      period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    });

    // Also set on the User record so FeatureGate reads it immediately
    await svc.entities.User.update(userId, {
      current_plan_key: 'developer',
      plan_status: 'active',
      subscription_updated_at: new Date().toISOString()
    }).catch(e => console.error('ensureBillingSubscription User sync failed:', e.message));

    return Response.json({ success: true, created: true, subscription: created });
  } catch (error) {
    console.error('ensureBillingSubscription error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});