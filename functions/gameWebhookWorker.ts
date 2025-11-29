/**
 * GameDev Webhook Worker - Processes and delivers outbound webhooks
 * Implements HMAC-SHA256 signing with replay protection
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import { createHmac } from 'node:crypto';

function signPayload(payload, secret) {
  const hmac = createHmac('sha256', secret);
  hmac.update(JSON.stringify(payload));
  return 'sha256=' + hmac.digest('hex');
}

async function deliverWebhook(endpoint, payload, retryCount = 0) {
  const maxRetries = 3;
  const signature = signPayload(payload, endpoint.signing_secret);
  
  try {
    const response = await fetch(endpoint.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-knXw-Signature': signature,
        'X-knXw-Event-Type': payload.event_type,
        'X-knXw-Delivery-ID': payload.delivery_id,
        'X-knXw-Timestamp': payload.timestamp,
        'User-Agent': 'knXw-Webhooks/1.0'
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    return {
      success: response.ok,
      statusCode: response.status,
      responseBody: response.ok ? null : await response.text().catch(() => 'Unable to read response')
    };
  } catch (error) {
    if (retryCount < maxRetries) {
      const backoffMs = Math.pow(2, retryCount) * 1000;
      await new Promise(resolve => setTimeout(resolve, backoffMs));
      return deliverWebhook(endpoint, payload, retryCount + 1);
    }
    
    return {
      success: false,
      statusCode: 0,
      error: error.message
    };
  }
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json', 'Allow': 'POST' }
      });
    }

    const body = await req.json();
    const { event_type, player_id, tenant_id, data } = body;

    if (!event_type || !player_id || !tenant_id) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Missing required fields: event_type, player_id, tenant_id' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Find active webhook endpoints for this tenant and event type
    const endpoints = await base44.asServiceRole.entities.GameWebhookEndpoint.filter({
      tenant_id,
      status: 'active'
    });

    const relevantEndpoints = endpoints.filter(endpoint => 
      endpoint.event_types.includes(event_type)
    );

    if (relevantEndpoints.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No active endpoints configured for this event type',
        delivered: 0
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create delivery records and send webhooks
    const deliveryPromises = relevantEndpoints.map(async (endpoint) => {
      const deliveryId = crypto.randomUUID();
      const timestamp = new Date().toISOString();

      const payload = {
        event_type,
        delivery_id: deliveryId,
        timestamp,
        player_id,
        tenant_id,
        data
      };

      // Create delivery record
      const delivery = await base44.asServiceRole.entities.GameWebhookDelivery.create({
        webhook_endpoint_id: endpoint.id,
        event_type,
        payload,
        status: 'pending',
        attempt_count: 0
      });

      // Attempt delivery
      const result = await deliverWebhook(endpoint, payload);

      // Update delivery record
      const updateData = {
        status: result.success ? 'delivered' : 'failed',
        attempt_count: 1,
        last_attempt_at: new Date().toISOString(),
        response_code: result.statusCode,
        error_message: result.error || result.responseBody
      };

      if (result.success) {
        updateData.delivered_at = new Date().toISOString();
        
        // Update endpoint last delivery timestamp
        await base44.asServiceRole.entities.GameWebhookEndpoint.update(endpoint.id, {
          last_delivery_at: new Date().toISOString(),
          failure_count: 0
        });
      } else {
        // Increment failure count
        await base44.asServiceRole.entities.GameWebhookEndpoint.update(endpoint.id, {
          failure_count: (endpoint.failure_count || 0) + 1
        });

        // Disable endpoint after 10 consecutive failures
        if ((endpoint.failure_count || 0) >= 9) {
          await base44.asServiceRole.entities.GameWebhookEndpoint.update(endpoint.id, {
            status: 'failed'
          });
        }
      }

      await base44.asServiceRole.entities.GameWebhookDelivery.update(delivery.id, updateData);

      return { endpoint: endpoint.url, success: result.success, statusCode: result.statusCode };
    });

    const results = await Promise.all(deliveryPromises);
    const successCount = results.filter(r => r.success).length;

    return new Response(JSON.stringify({ 
      success: true,
      delivered: successCount,
      total: results.length,
      results
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Webhook worker error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});