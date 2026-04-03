/* eslint-disable no-undef */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const clientAppId = body?.client_app_id;
    if (!clientAppId) {
      return Response.json({ error: 'client_app_id is required' }, { status: 400 });
    }

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const rows = await base44.entities.MetricsHour.filter({
      client_app_id: clientAppId,
      timestamp: { '$gte': twentyFourHoursAgo }
    }, '-timestamp', 50);

    return Response.json({
      success: true,
      user: { id: user.id, role: user.role || null },
      count: rows.length,
      rows
    });
  } catch (error) {
    console.error('proveMetricsHourRead error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});