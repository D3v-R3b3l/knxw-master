import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole;
    const body = await req.json();
    const apiKey = body?.apiKey || req.headers.get('X-API-Key') || req.headers.get('Authorization')?.replace('Bearer ', '');
    const { delivery_id, action_taken, response_data, response_time_seconds } = body || {};

    if (!apiKey || !delivery_id || !action_taken) {
      return json({ error: 'Missing required fields: apiKey, delivery_id and action_taken' }, 400);
    }

    const clientApps = await svc.entities.ClientApp.filter({ api_key: apiKey, status: 'active' }, null, 1);
    const clientApp = clientApps?.[0] || null;
    if (!clientApp) {
      return json({ error: 'Invalid API key' }, 403);
    }

    const deliveries = await svc.entities.EngagementDelivery.filter({ id: delivery_id }, null, 1);
    const delivery = deliveries?.[0] || null;
    if (!delivery) {
      return json({ error: 'Engagement delivery not found' }, 404);
    }

    if (delivery.client_app_id !== clientApp.id) {
      return json({ error: 'Delivery does not belong to this client app' }, 403);
    }

    const validActions = ['dismissed', 'responded', 'ignored', 'converted', 'clicked', 'replied'];
    if (!validActions.includes(action_taken)) {
      return json({ error: 'Invalid action_taken. Must be one of: ' + validActions.join(', ') }, 400);
    }

    await svc.entities.EngagementDelivery.update(delivery_id, {
      response: {
        action_taken,
        response_data: response_data || {},
        response_time_seconds: response_time_seconds || 0
      },
      delivery_status: 'delivered'
    });

    if ((action_taken === 'converted' || action_taken === 'clicked') && delivery.rule_id) {
      try {
        const rules = await svc.entities.EngagementRule.filter({ id: delivery.rule_id }, null, 1);
        const rule = rules?.[0] || null;
        if (rule) {
          await svc.entities.EngagementRule.update(delivery.rule_id, {
            analytics: {
              ...rule.analytics,
              conversion_count: (rule.analytics?.conversion_count || 0) + (action_taken === 'converted' ? 1 : 0)
            }
          });
        }
      } catch (error) {
        console.error('recordEngagementResponse analytics update failed:', error);
      }
    }

    return json({
      status: 'success',
      message: 'Engagement response recorded successfully',
      delivery_id,
      action_taken
    });
  } catch (error) {
    console.error('Error recording engagement response:', error);
    return json({ status: 'error', message: 'Failed to record engagement response', error: error.message }, 500);
  }
});