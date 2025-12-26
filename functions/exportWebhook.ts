import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { event_type, data, webhook_urls } = await req.json();

    if (!event_type || !data || !webhook_urls || webhook_urls.length === 0) {
      return Response.json({ 
        error: 'event_type, data, and webhook_urls are required' 
      }, { status: 400 });
    }

    // Prepare webhook payload
    const payload = {
      event_type,
      data,
      timestamp: new Date().toISOString(),
      source: 'knxw_platform'
    };

    // Sign the payload with HMAC-SHA256
    const secret = Deno.env.get('WEBHOOK_SIGNING_SECRET') || 'default_secret';
    const signature = await generateHmacSignature(JSON.stringify(payload), secret);

    // Send to all configured webhook URLs
    const results = await Promise.allSettled(
      webhook_urls.map(async (url) => {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-knXw-Signature': signature,
            'X-knXw-Event-Type': event_type,
            'X-knXw-Timestamp': payload.timestamp
          },
          body: JSON.stringify(payload)
        });

        return {
          url,
          status: response.status,
          success: response.ok,
          response: response.ok ? await response.text() : await response.text()
        };
      })
    );

    const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;

    return Response.json({
      success: successCount > 0,
      total_webhooks: webhook_urls.length,
      successful_deliveries: successCount,
      results: results.map(r => r.status === 'fulfilled' ? r.value : { error: r.reason.message }),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error sending webhook:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function generateHmacSignature(payload, secret) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(payload);

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, messageData);
  
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}