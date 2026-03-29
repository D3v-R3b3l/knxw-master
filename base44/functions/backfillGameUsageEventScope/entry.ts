import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * One-time backfill: stamps client_app_id and owner_user_id onto existing
 * GameUsageEvent records that were written before the gamedev/events.js fix.
 * 
 * Strategy: for each event with api_key_id, look up the ApiKey record to get
 * the tenant_id, then find the matching ClientApp. Because old rows used
 * req.tenantId (platform-level) as tenant_id and that value is not a ClientApp.id,
 * rows without a resolvable api_key_id cannot be backfilled and will be left
 * with null client_app_id (they are excluded from non-admin reads).
 * 
 * Admin-only. Run manually once.
 */
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  try {
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const svc = base44.asServiceRole;

    // Fetch GameUsageEvents missing client_app_id — up to 2000
    const events = await svc.entities.GameUsageEvent.list('-timestamp', 2000);
    const toBackfill = events.filter(e => !e.client_app_id && e.api_key_id);

    let filled = 0;
    let unresolvable = 0;
    let errors = 0;

    // Build a cache to avoid duplicate lookups
    const apiKeyCache = {};

    for (const evt of toBackfill) {
      try {
        if (!apiKeyCache[evt.api_key_id]) {
          const keys = await svc.entities.ApiKey.filter({ id: evt.api_key_id }, null, 1);
          apiKeyCache[evt.api_key_id] = keys?.[0] || null;
        }
        const apiKeyRecord = apiKeyCache[evt.api_key_id];
        if (!apiKeyRecord?.tenant_id) {
          unresolvable++;
          continue;
        }

        // ApiKey.tenant_id should be the ClientApp ID
        const apps = await svc.entities.ClientApp.filter({ id: apiKeyRecord.tenant_id }, null, 1);
        const app = apps?.[0] || null;
        if (!app) {
          unresolvable++;
          continue;
        }

        await svc.entities.GameUsageEvent.update(evt.id, {
          client_app_id: app.id,
          owner_user_id: app.owner_id
        });
        filled++;
      } catch (err) {
        console.error(`[backfillGameUsageEventScope] event ${evt.id}:`, err.message);
        errors++;
      }
    }

    return Response.json({
      success: true,
      total_events: events.length,
      needed_backfill: toBackfill.length,
      filled,
      unresolvable,
      errors
    });
  } catch (error) {
    console.error('[backfillGameUsageEventScope] Fatal:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});