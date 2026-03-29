import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * Returns GameUsageEvent stats scoped to the calling user's owned apps.
 * Uses owner_user_id field (stamped by gamedev/events writer via ClientApp lookup).
 * Legacy rows without owner_user_id are excluded from non-admin reads.
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
      events = await base44.asServiceRole.entities.GameUsageEvent.filter(
        { timestamp: { $gte: cutoff } },
        '-timestamp',
        2000
      );
    } else {
      // Scope by owner_user_id — stamped by gamedev/events writer via ClientApp lookup.
      // Legacy rows without this field will not match and are correctly excluded.
      events = await base44.asServiceRole.entities.GameUsageEvent.filter(
        { owner_user_id: user.id, timestamp: { $gte: cutoff } },
        '-timestamp',
        1000
      );
    }

    return Response.json({ success: true, data: { events } });
  } catch (error) {
    console.error('[getMyUsageStats] error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});