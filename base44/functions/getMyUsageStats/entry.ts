import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * Returns GameUsageEvent stats scoped to the calling user's owned ClientApps.
 * Non-admin users can only see events for tenant_ids matching their own app IDs.
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
      // Non-admins: scope to their own ClientApps (owner_id = user.id)
      const ownedApps = await base44.asServiceRole.entities.ClientApp.filter(
        { owner_id: user.id },
        null,
        100
      );

      if (ownedApps.length === 0) {
        return Response.json({ success: true, data: { events: [], tenant_ids: [] } });
      }

      const ownedAppIds = ownedApps.map(a => a.id);

      // Fetch events only for owned tenant_ids — enforces tenant isolation server-side
      const perAppFetches = await Promise.all(
        ownedAppIds.map(appId =>
          base44.asServiceRole.entities.GameUsageEvent.filter(
            { tenant_id: appId, timestamp: { $gte: cutoff } },
            '-timestamp',
            500
          )
        )
      );

      events = perAppFetches.flat();
      events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    return Response.json({ success: true, data: { events } });
  } catch (error) {
    console.error('[getMyUsageStats] error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});