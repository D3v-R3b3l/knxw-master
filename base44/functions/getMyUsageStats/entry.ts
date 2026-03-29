import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * Returns GameUsageEvent stats scoped to the calling user's owned ClientApps.
 *
 * IMPORTANT — tenant_id identity:
 * GameUsageEvent.tenant_id is written as `req.tenantId || 'anonymous'` in
 * functions/api/v1/gamedev/events.js. That value is the Base44 request-level
 * tenantId, which is NOT the same as ClientApp.id. There is currently no
 * reliable per-owner field on GameUsageEvent that can be used to scope reads
 * for non-admin users. Until the gamedev/events writer is updated to stamp
 * a stable owner-linked field (e.g. client_app_id), non-admin users will
 * receive an empty result set here. This is a known gap documented below.
 *
 * Admin users receive all events for the requested time window.
 */
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  try {
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const hours = Math.min(Math.max(parseInt(body.hours || 24, 10), 1), 720);
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

    let events = [];

    if (user.role === 'admin') {
      // Admins see all events globally
      events = await base44.asServiceRole.entities.GameUsageEvent.filter(
        { timestamp: { $gte: cutoff } },
        '-timestamp',
        2000
      );
    } else {
      // Non-admins: GameUsageEvent.tenant_id is set to req.tenantId (a Base44
      // platform-level tenant identifier), NOT ClientApp.id. Scoping by
      // ClientApp.id would produce no matches. Until gamedev/events stamps
      // a reliable owner-linked field on GameUsageEvent, non-admin reads
      // return empty to avoid cross-tenant leakage. See known gap comment above.
      events = [];
    }

    return Response.json({ success: true, data: { events } });
  } catch (error) {
    console.error('[getMyUsageStats] error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});