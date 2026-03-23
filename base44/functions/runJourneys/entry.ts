
import { createClientFromRequest } from 'npm:@base44/sdk@0.7.0';

function pickNext(nodesById, edgesBySource, nodeId, label) {
  const outs = edgesBySource[nodeId] || [];
  if (!outs.length) return null;
  if (label) {
    const found = outs.find(e => (e.label || '').toLowerCase() === label.toLowerCase());
    if (found) return found.target;
  }
  return outs[0]?.target || null;
}

async function evalCondition(base44, userId, node) {
  // Simple operators on profile or recent behavior
  const t = (node?.data?.type || 'profile');
  const field = node?.data?.field;
  const operator = node?.data?.operator || 'equals';
  const value = node?.data?.value;

  if (t === 'profile') {
    const profiles = await base44.entities.UserPsychographicProfile.filter({ user_id: userId }, '-last_analyzed', 1);
    const p = profiles[0] || {};
    const path = String(field || '').split('.');
    let cur = p;
    for (const k of path) {
      if (!cur) break;
      cur = cur[k];
    }
    const lhs = cur;
    switch (operator) {
      case 'equals': return lhs === value;
      case 'not_equals': return lhs !== value;
      case 'greater_than': return Number(lhs) > Number(value);
      case 'less_than': return Number(lhs) < Number(value);
      case 'contains': return Array.isArray(lhs) ? lhs.includes(value) : String(lhs || '').includes(String(value || ''));
      case 'not_contains': return Array.isArray(lhs) ? !lhs.includes(value) : !String(lhs || '').includes(String(value || ''));
      case 'exists': return lhs !== undefined && lhs !== null;
      case 'not_exists': return lhs === undefined || lhs === null;
      default: return false;
    }
  }

  if (t === 'behavior') {
    // Basic recency check on events
    const eventType = node?.data?.event_type;
    const withinMinutes = Number(node?.data?.within_minutes || 60);
    const since = new Date(Date.now() - withinMinutes * 60 * 1000).toISOString();
    const evs = await base44.entities.CapturedEvent.filter({ user_id: userId, event_type: eventType, timestamp: { "$gte": since } }, '-timestamp', 1);
    return evs.length > 0;
  }

  return false;
}

async function execAction(base44, ctx, node) {
  const type = node?.data?.type || 'engagement';
  if (type === 'engagement') {
    // Create an EngagementDelivery record using template if provided
    const rendered = {
      title: node?.data?.title || 'Journey Action',
      message: node?.data?.message || 'Triggered by Journey',
      meta: { journey_id: ctx.journey_id, version: ctx.version, node_id: node.id }
    };
    await base44.entities.EngagementDelivery.create({
      user_id: ctx.user_id,
      rule_id: node?.data?.rule_id || 'journey',
      template_id: node?.data?.template_id || 'journey',
      client_app_id: node?.data?.client_app_id || '',
      session_id: ctx.session_id || '',
      delivery_channel: "in_app",
      delivery_context: { page_url: ctx.event?.event_payload?.url, conditions_met: ['journey'] },
      rendered_content: rendered,
      delivery_status: "delivered"
    });
    return;
  }

  if (type === 'email') {
    await base44.entities.EngagementDelivery.create({
      user_id: ctx.user_id,
      rule_id: "email",
      template_id: node?.data?.template_id || '',
      client_app_id: node?.data?.client_app_id || '',
      session_id: ctx.session_id || '',
      delivery_channel: "email",
      delivery_context: { subject: node?.data?.subject || node?.data?.title || '', journey_id: ctx.journey_id },
      rendered_content: { title: node?.data?.subject || '', message: node?.data?.message || '' },
      delivery_status: "delivered"
    });
    return;
  }

  if (type === 'sms') {
    const delivery = await base44.entities.EngagementDelivery.create({
      user_id: ctx.user_id,
      rule_id: "sms",
      template_id: node?.data?.template_id || '',
      client_app_id: node?.data?.client_app_id || '',
      session_id: ctx.session_id || '',
      delivery_channel: "sms",
      delivery_context: { journey_id: ctx.journey_id },
      rendered_content: { message: node?.data?.message || '' },
      delivery_status: "pending"
    });

    const to = node?.data?.phone_number;
    if (ctx.workspace_id && to) {
      try {
        const res = await base44.functions.invoke('sendSms', {
          workspace_id: ctx.workspace_id,
          to,
          body: node?.data?.message || '',
          from_override: node?.data?.from_number || undefined
        });
        const data = await res.json();
        if (res.ok && data?.success) {
          await base44.entities.EngagementDelivery.update(delivery.id, {
            delivery_status: "delivered",
            delivery_context: { ...delivery.delivery_context, provider_message_id: data.message_sid, provider_response: data }
          });
        } else {
          await base44.entities.EngagementDelivery.update(delivery.id, {
            delivery_status: "failed",
            delivery_context: { ...delivery.delivery_context, provider_response: data }
          });
        }
      } catch (e) {
        await base44.entities.EngagementDelivery.update(delivery.id, { delivery_status: "failed", delivery_context: { error: String(e?.message || e) } });
      }
    } else {
      await base44.entities.EngagementDelivery.update(delivery.id, { delivery_status: "failed", delivery_context: { error: "workspace_id or phone_number missing" } });
    }
    return;
  }

  if (type === 'push') {
    const delivery = await base44.entities.EngagementDelivery.create({
      user_id: ctx.user_id,
      rule_id: "push",
      template_id: node?.data?.template_id || '',
      client_app_id: node?.data?.client_app_id || '',
      session_id: ctx.session_id || '',
      delivery_channel: "push",
      delivery_context: { journey_id: ctx.journey_id },
      rendered_content: { title: node?.data?.title || '', message: node?.data?.message || '' },
      delivery_status: "pending"
    });

    const targetType = node?.data?.target_type || 'player_id';
    const targetValue = node?.data?.target_value;
    if (ctx.workspace_id && targetValue) {
      try {
        const res = await base44.functions.invoke('sendPush', {
          workspace_id: ctx.workspace_id,
          title: node?.data?.title || '',
          message: node?.data?.message || '',
          target_type: targetType,
          target_value: targetValue
        });
        const data = await res.json();
        if (res.ok && data?.success) {
          await base44.entities.EngagementDelivery.update(delivery.id, {
            delivery_status: "delivered",
            delivery_context: { ...delivery.delivery_context, provider_message_id: data.notification_id, provider_response: data }
          });
        } else {
          await base44.entities.EngagementDelivery.update(delivery.id, {
            delivery_status: "failed",
            delivery_context: { ...delivery.delivery_context, provider_response: data }
          });
        }
      } catch (e) {
        await base44.entities.EngagementDelivery.update(delivery.id, { delivery_status: "failed", delivery_context: { error: String(e?.message || e) } });
      }
    } else {
      await base44.entities.EngagementDelivery.update(delivery.id, { delivery_status: "failed", delivery_context: { error: "workspace_id or target_value missing" } });
    }
    return;
  }
}

async function traverse(base44, journey, version, schema, ctx, startNodeId) {
  const nodesById = Object.fromEntries((schema.nodes || []).map(n => [n.id, n]));
  const edgesBySource = {};
  (schema.edges || []).forEach(e => {
    if (!edgesBySource[e.source]) edgesBySource[e.source] = [];
    edgesBySource[e.source].push(e);
  });

  let cursorId = startNodeId;
  const visited = new Set();
  while (cursorId) {
    if (visited.has(cursorId)) break; // prevent cycles
    visited.add(cursorId);

    const node = nodesById[cursorId];
    if (!node) break;

    if (node.type === 'condition') {
      const result = await evalCondition(base44, ctx.user_id, node);
      cursorId = pickNext(nodesById, edgesBySource, node.id, result ? 'true' : 'false');
      continue;
    }

    if (node.type === 'action') {
      await execAction(base44, ctx, node);
      cursorId = pickNext(nodesById, edgesBySource, node.id);
      continue;
    }

    if (node.type === 'wait') {
      const delaySec = Number(node?.data?.delay_seconds || 0);
      if (delaySec > 0) {
        const runAt = new Date(Date.now() + delaySec * 1000).toISOString();
        await base44.entities.JourneyTask.create({
          journey_id: journey.id,
          version,
          user_id: ctx.user_id,
          resume_node_id: pickNext(nodesById, edgesBySource, node.id) || '',
          context: ctx,
          run_at: runAt,
          status: "pending"
        });
        // stop traversal now; will resume via scheduled task
        return;
      } else {
        cursorId = pickNext(nodesById, edgesBySource, node.id);
        continue;
      }
    }

    if (node.type === 'goal') {
      // End of path
      return;
    }

    if (node.type === 'trigger') {
      // triggers are only evaluated at entry; move to next
      cursorId = pickNext(nodesById, edgesBySource, node.id);
      continue;
    }

    // Unknown -> move along
    cursorId = pickNext(nodesById, edgesBySource, node.id);
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await req.json();
    const { user_id, event, process_due = false, workspace_id } = payload || {};
    const nowIso = new Date().toISOString();

    // Process due wait tasks if requested
    if (process_due) {
      const due = await base44.asServiceRole.entities.JourneyTask.filter({ status: "pending", run_at: { "$lte": nowIso } }, 'run_at', 50);
      for (const t of due) {
        try {
          const versions = await base44.entities.JourneyVersion.filter({ journey_id: t.journey_id, version: t.version }, null, 1);
          const v = versions[0];
          if (!v) {
            await base44.asServiceRole.entities.JourneyTask.update(t.id, { status: 'failed', last_error: 'Version not found' });
            continue;
          }
          const schema = v.schema || {};
          const ctx = t.context || {};
          await traverse(base44, { id: t.journey_id }, t.version, schema, ctx, t.resume_node_id);
          await base44.asServiceRole.entities.JourneyTask.update(t.id, { status: 'completed' });
        } catch (e) {
          await base44.asServiceRole.entities.JourneyTask.update(t.id, { status: 'failed', last_error: String(e?.message || e) });
        }
      }
    }

    // Runtime evaluation for an incoming event (real-time)
    if (user_id && event) {
      const journeys = await base44.entities.Journey.filter({ status: "active" }, '-updated_date', 200);
      const versions = await Promise.all(journeys.map(async (j) => {
        if (!j.published_version) return null;
        const vs = await base44.entities.JourneyVersion.filter({ journey_id: j.id, version: j.published_version, status: "published" }, null, 1);
        return vs[0] ? { journey: j, version: j.published_version, schema: vs[0].schema } : null;
      }));
      const published = versions.filter(Boolean);

      // Evaluate triggers
      for (const item of published) {
        const { journey, version, schema } = item;
        const triggers = (schema.nodes || []).filter(n => n.type === 'trigger');
        for (const trig of triggers) {
          const tType = trig?.data?.trigger_type || 'event';
          let matches = false;
          if (tType === 'event') {
            matches = (trig?.data?.event_type || '') === (event?.event_type || '');
          } else if (tType === 'motive') {
            const profiles = await base44.entities.UserPsychographicProfile.filter({ user_id }, '-last_analyzed', 1);
            const p = profiles[0] || {};
            matches = (p?.motivation_stack || []).includes(trig?.data?.motive);
          } else if (tType === 'trait') {
            const profiles = await base44.entities.UserPsychographicProfile.filter({ user_id }, '-last_analyzed', 1);
            const p = profiles[0] || {};
            const field = trig?.data?.field;
            const expected = trig?.data?.value;
            const path = String(field || '').split('.');
            let cur = p;
            for (const k of path) cur = cur?.[k];
            matches = cur === expected;
          }
          if (matches) {
            const ctx = { user_id, event, journey_id: journey.id, version, session_id: event?.session_id, workspace_id };
            await traverse(base44, journey, version, schema, ctx, trig.id);
          }
        }
      }
    }

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
