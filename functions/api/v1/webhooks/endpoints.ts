import { z } from 'https://deno.land/x/zod@v3.23.0/mod.ts';
import { WebhookCreateSchema, WebhookUpdateSchema, WebhookIdSchema } from '../../utils/zodSchemas.js';
import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  const startTime = performance.now();
  const tenantId = req.tenantId || 'anonymous';
  const apiKey = req.apiKey || null;
  const requestId = req.headers.get('X-Request-ID') || crypto.randomUUID();
  const base44 = createClientFromRequest(req);

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const webhookId = pathParts[pathParts.length - 1];

    if (req.method === 'GET' && !webhookId) {
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

    if (req.method === 'PUT' && webhookId) {
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

    if (req.method === 'DELETE' && webhookId) {
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

    return new Response(JSON.stringify({ success: false, error: 'Method not allowed or invalid path' }), { 
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