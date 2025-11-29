import { z } from 'https://deno.land/x/zod@v3.23.0/mod.ts';
import { EventIngestSchema } from '../utils/zodSchemas.js';
import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  const startTime = performance.now();
  const tenantId = req.tenantId || 'anonymous';
  const apiKey = req.apiKey || null;
  const requestId = req.headers.get('X-Request-ID') || crypto.randomUUID();
  const base44 = createClientFromRequest(req);

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ success: false, error: 'Method not allowed. Use POST.' }), { 
        status: 405, 
        headers: { 'Content-Type': 'application/json', 'Allow': 'POST' } 
      });
    }

    const body = await req.json();
    const validatedData = EventIngestSchema.parse(body);

    const ingestResult = await base44.functions.invoke('captureEvent', {
      user_id: validatedData.user_id,
      event_type: validatedData.event_type,
      event_payload: validatedData.event_payload,
      session_id: validatedData.session_id,
      timestamp: validatedData.timestamp,
      tenant_id: tenantId,
      api_key_id: apiKey?.id
    });

    base44.functions.invoke('liveProfileProcessor', { 
      action: 'process_live_events', 
      user_id: validatedData.user_id 
    }).catch(err => console.warn(`Profile refresh failed for user ${validatedData.user_id}:`, err));

    return new Response(JSON.stringify({ 
      success: true, 
      data: { 
        event_id: ingestResult?.event_id || crypto.randomUUID(),
        status: 'accepted',
        message: 'Event ingested successfully. Profile analysis queued.'
      }, 
      meta: { 
        requestId, 
        tenantId, 
        latencyMs: Math.round(performance.now() - startTime) 
      } 
    }), {
      status: 202,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error(`[${requestId}] Events endpoint error:`, error);
    
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