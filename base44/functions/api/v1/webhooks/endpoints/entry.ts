import { z } from 'https://deno.land/x/zod@v3.23.0/mod.ts';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Inlined schemas — no local imports allowed in Deno functions
const WebhookCreateSchema = z.object({
  name: z.string().min(1).max(256),
  url: z.string().url(),
  events: z.array(z.enum(['profile.updated', 'insight.created', 'recommendation.generated'])).min(1),
  secret: z.string().optional()
});

const WebhookUpdateSchema = z.object({
  name: z.string().min(1).max(256).optional(),
  url: z.string().url().optional(),
  events: z.array(z.enum(['profile.updated', 'insight.created', 'recommendation.generated'])).min(1).optional(),
  status: z.enum(['active', 'paused']).optional(),
  secret: z.string().optional()
});

const WebhookIdSchema = z.string().min(1);

Deno.serve(async (req) => {
  const startTime = performance.now();
  const tenantId = req.tenantId || 'anonymous';
  const apiKey = req.apiKey || null;
  const requestId = req.headers.get('X-Request-ID') || crypto.randomUUID();
  const base44 = createClientFromRequest(req);

  try {
    const url = new URL(req.url);

    // ID resolution: support both ?id=<webhookId> query param (guaranteed to work with
    // Base44 function routing) and path suffix (works when platform forwards sub-paths).
    const queryId = url.searchParams.get('id') || null;
    const pathParts = url.pathname.split('/').filter(Boolean);
    const pathId = pathParts[pathParts.length - 1];
    // Only use pathId if it looks like a record ID and not the function name segment.
    const webhookId = queryId || (pathId && pathId !== 'endpoints' ? pathId : null);

    if (req.method === 'GET') {
      const webhooks = await base44.asServiceRole.entities.WebhookEndpoint.filter({ tenant_id: tenantId }, '-created_date', 100);
      
      return new Response(JSON.stringify({ 
        success: true, 
        data: webhooks,
        meta: { requestId, tenantId, latencyMs: Math.round(performance.now() - startTime) }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'POST') {
      const body = await req.json();
      const validatedData = WebhookCreateSchema.parse(body);

      const newWebhook = await base44.asServiceRole.entities.WebhookEndpoint.create({
        tenant_id: tenantId,
        name: validatedData.name,
        url: validatedData.url,
        secret: validatedData.secret,
        events: validatedData.events,
        status: 'active',
        failure_count: 0
      });

      return new Response(JSON.stringify({ 
        success: true, 
        data: newWebhook,
        message: 'Webhook endpoint created successfully',
        meta: { requestId, tenantId, latencyMs: Math.round(performance.now() - startTime) }
      }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'PUT') {
      if (!webhookId) {
        return new Response(JSON.stringify({ success: false, error: 'Webhook ID required. Use ?id=<id> query parameter or path suffix.' }), {
          status: 400, headers: { 'Content-Type': 'application/json' }
        });
      }
      WebhookIdSchema.parse(webhookId);
      
      const body = await req.json();
      const validatedData = WebhookUpdateSchema.parse(body);

      const updated = await base44.asServiceRole.entities.WebhookEndpoint.update(webhookId, validatedData);

      return new Response(JSON.stringify({ 
        success: true, 
        data: updated,
        message: 'Webhook endpoint updated successfully',
        meta: { requestId, tenantId, latencyMs: Math.round(performance.now() - startTime) }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'DELETE') {
      if (!webhookId) {
        return new Response(JSON.stringify({ success: false, error: 'Webhook ID required. Use ?id=<id> query parameter or path suffix.' }), {
          status: 400, headers: { 'Content-Type': 'application/json' }
        });
      }
      WebhookIdSchema.parse(webhookId);
      
      await base44.asServiceRole.entities.WebhookEndpoint.delete(webhookId);

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Webhook endpoint deleted successfully',
        meta: { requestId, tenantId, latencyMs: Math.round(performance.now() - startTime) }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: false, error: 'Method not allowed' }), { 
      status: 405, 
      headers: { 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    console.error(`[${requestId}] Webhooks endpoint error:`, error);
    
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Validation error', 
        details: error.errors,
        meta: { requestId, tenantId, latencyMs: Math.round(performance.now() - startTime) }
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal Server Error', 
      details: error.message,
      meta: { requestId, tenantId, latencyMs: Math.round(performance.now() - startTime) }
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});