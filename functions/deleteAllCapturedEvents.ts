import { createClientFromRequest } from 'npm:@base44/sdk@0.7.0';
import { logError, logTrace } from './traceLogger.js';

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

Deno.serve(async (req) => {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();
  const base44 = createClientFromRequest(req);

  try {
    // Authentication & Authorization
    if (!(await base44.auth.isAuthenticated())) {
      await logError(base44, requestId, 'deleteAllCapturedEvents', 'Unauthorized access attempt', 401);
      return json({ error: 'Unauthorized' }, 401);
    }
    
    const me = await base44.auth.me();
    if (!me || me.role !== 'admin') {
      await logError(base44, requestId, 'deleteAllCapturedEvents', `Forbidden: User ${me?.email || 'unknown'} attempted admin action`, 403);
      return json({ error: 'Forbidden: Admin role required.' }, 403);
    }

    const svc = base44.asServiceRole;
    let totalDeleted = 0;
    const batchSize = 1000;
    const maxPasses = 500;

    for (let i = 0; i < maxPasses; i++) {
      let eventsToDelete = [];
      try {
        const batch = await svc.entities.CapturedEvent.filter({}, '-created_date', batchSize);
        eventsToDelete = Array.isArray(batch) ? batch : [];
      } catch (e) {
        console.error(`Purge Error: Failed to fetch batch on pass ${i}`, e);
        await logError(base44, requestId, 'deleteAllCapturedEvents', `Batch fetch failed: ${e.message}`, 500);
        return json({ error: 'Failed during event fetch.', deleted: totalDeleted, details: e.message }, 500);
      }

      if (eventsToDelete.length === 0) {
        break;
      }

      const deletePromises = eventsToDelete.map(event =>
        svc.entities.CapturedEvent.delete(event.id).catch(err => {
          console.warn(`Purge Warning: Failed to delete event ${event.id}`, err);
          return null;
        })
      );

      const results = await Promise.all(deletePromises);
      const successfulDeletes = results.filter(r => r !== null).length;
      totalDeleted += successfulDeletes;

      await sleep(50);
    }

    // Audit Logging
    try {
      await svc.entities.AuditLog.create({
        timestamp: new Date().toISOString(),
        org_id: me.current_org_id || 'default',
        user_id: me.id,
        action: 'delete',
        table_name: 'CapturedEvent',
        record_id: '*',
        before: {},
        after: { totalDeleted },
        request_id: requestId,
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
      });
    } catch (auditError) {
      console.warn("Audit log failed during purge:", auditError);
      await logError(base44, requestId, 'deleteAllCapturedEvents', `Audit log failed: ${auditError.message}`, 0);
    }

    await logTrace(base44, requestId, me.id, 'deleteAllCapturedEvents', Date.now() - startTime, null, { totalDeleted });

    return json({ status: 'ok', deleted: totalDeleted });
  } catch (error) {
    await logError(base44, requestId, 'deleteAllCapturedEvents', error.message, 500);
    return json({ error: 'Internal server error', details: error.message }, 500);
  }
});