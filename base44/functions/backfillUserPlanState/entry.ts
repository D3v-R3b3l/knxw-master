import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * One-time backfill: syncs current_plan_key, plan_status, and subscription_updated_at
 * onto User records where these fields are null, stale, or missing.
 * 
 * Sources: BillingSubscription records with active/trialing/past_due status.
 * Admin-only. Run manually once via dashboard or test_backend_function.
 */
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  try {
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const svc = base44.asServiceRole;

    // Fetch all BillingSubscription records — up to 2000
    const allSubs = await svc.entities.BillingSubscription.list('-updated_date', 2000);

    let synced = 0;
    let skipped = 0;
    let errors = 0;

    for (const sub of allSubs) {
      if (!sub.user_id) {
        skipped++;
        continue;
      }

      try {
        // Only sync active/trialing/past_due subs; canceled subs sync as developer
        const planKey = ['active', 'trialing', 'past_due'].includes(sub.status)
          ? (sub.plan_key || 'developer')
          : 'developer';
        const planStatus = sub.status || 'active';

        await svc.entities.User.update(sub.user_id, {
          current_plan_key: planKey,
          plan_status: planStatus,
          subscription_updated_at: sub.updated_date || new Date().toISOString()
        });

        synced++;
      } catch (err) {
        console.error(`[backfillUserPlanState] Failed for user ${sub.user_id}:`, err.message);
        errors++;
      }
    }

    return Response.json({
      success: true,
      total_subscriptions: allSubs.length,
      synced,
      skipped,
      errors
    });
  } catch (error) {
    console.error('[backfillUserPlanState] Fatal:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});