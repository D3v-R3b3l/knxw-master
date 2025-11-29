import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import { createHmac } from 'node:crypto';

function signWebhookPayload(payload, secret) {
  const hmac = createHmac('sha256', secret);
  hmac.update(JSON.stringify(payload));
  return 'sha256=' + hmac.digest('hex');
}

async function retryWithBackoff(fn, options = {}) {
  const {
    maxRetries = 3,
    baseDelayMs = 1000,
    maxDelayMs = 30000
  } = options;

  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      const exponentialDelay = Math.min(baseDelayMs * Math.pow(2, attempt), maxDelayMs);
      const jitter = Math.random() * 1000;
      const delay = exponentialDelay + jitter;
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  
  try {
    const pendingDeliveries = await base44.asServiceRole.entities.WebhookDelivery.filter({
      status: 'pending'
    }, 'created_date', 50);

    const results = [];

    for (const delivery of pendingDeliveries) {
      try {
        const endpoints = await base44.asServiceRole.entities.WebhookEndpoint.filter({
          id: delivery.webhook_endpoint_id
        }, null, 1);

        const endpoint = endpoints[0];

        if (!endpoint || endpoint.status !== 'active') {
          await base44.asServiceRole.entities.WebhookDelivery.update(delivery.id, {
            status: 'failed',
            error_message: 'Webhook endpoint not found or inactive',
            updated_date: new Date().toISOString()
          });
          continue;
        }

        const payload = {
          id: delivery.id,
          event_type: delivery.event_type,
          data: delivery.payload,
          timestamp: delivery.created_date
        };

        const signature = signWebhookPayload(payload, endpoint.signing_secret);

        const deliveryResult = await retryWithBackoff(
          async () => {
            const response = await fetch(endpoint.url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Webhook-Signature': signature,
                'X-Webhook-ID': delivery.id,
                'User-Agent': 'knXw-Webhooks/1.0'
              },
              body: JSON.stringify(payload)
            });

            if (!response.ok) {
              throw new Error(`HTTP ${response.status}`);
            }

            return response;
          },
          { maxRetries: 3 }
        );

        await base44.asServiceRole.entities.WebhookDelivery.update(delivery.id, {
          status: 'delivered',
          delivered_at: new Date().toISOString(),
          response_code: deliveryResult.status,
          updated_date: new Date().toISOString()
        });

        results.push({ id: delivery.id, status: 'success' });

      } catch (error) {
        const retryCount = (delivery.retry_count || 0) + 1;
        const maxRetries = 5;

        if (retryCount >= maxRetries) {
          await base44.asServiceRole.entities.WebhookDelivery.update(delivery.id, {
            status: 'failed',
            error_message: error.message,
            retry_count: retryCount,
            updated_date: new Date().toISOString()
          });
        } else {
          await base44.asServiceRole.entities.WebhookDelivery.update(delivery.id, {
            status: 'pending',
            error_message: error.message,
            retry_count: retryCount,
            next_retry_at: new Date(Date.now() + Math.pow(2, retryCount) * 1000).toISOString(),
            updated_date: new Date().toISOString()
          });
        }

        results.push({ id: delivery.id, status: 'failed', error: error.message });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      processed: pendingDeliveries.length,
      results
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});