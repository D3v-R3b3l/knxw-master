import { z } from 'https://deno.land/x/zod@v3.23.0/mod.ts';
import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

const GameEventSchema = z.object({
  player_id: z.string().min(1).max(256),
  event_type: z.enum([
    'session_start',
    'session_end',
    'level_complete',
    'level_fail',
    'purchase',
    'achievement_unlock',
    'challenge_accept',
    'challenge_complete',
    'social_interaction',
    'tutorial_complete',
    'quit_game'
  ]),
  context: z.object({
    game_id: z.string().optional(),
    session_id: z.string().optional(),
    level: z.string().optional(),
    difficulty: z.string().optional(),
    platform: z.string().optional()
  }).optional().default({}),
  metadata: z.record(z.any()).optional().default({})
});

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
    const validatedData = GameEventSchema.parse(body);

    // Call core event ingestion
    const ingestResult = await base44.functions.invoke('captureEvent', {
      user_id: validatedData.player_id,
      event_type: validatedData.event_type,
      event_payload: {
        ...validatedData.metadata,
        game_context: validatedData.context
      },
      session_id: validatedData.context.session_id || crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      tenant_id: tenantId,
      api_key_id: apiKey?.id
    });

    // Async profile refresh
    base44.functions.invoke('liveProfileProcessor', { 
      action: 'process_live_events', 
      user_id: validatedData.player_id 
    }).catch(err => console.warn(`Profile refresh failed for player ${validatedData.player_id}:`, err));

    // Log game-specific usage
    const bodyStr = JSON.stringify(body);
    await base44.asServiceRole.entities.GameUsageEvent.create({
      tenant_id: tenantId,
      api_key_id: apiKey?.id,
      endpoint: '/api/v1/gamedev/events',
      method: 'POST',
      status_code: 202,
      latency_ms: Math.round(performance.now() - startTime),
      bytes_in: new TextEncoder().encode(bodyStr).length,
      bytes_out: 0,
      game_context: validatedData.context,
      timestamp: new Date().toISOString(),
      request_id: requestId,
      is_rate_limited: false
    });

    return new Response(JSON.stringify({ 
      success: true, 
      data: { 
        event_id: ingestResult?.event_id || crypto.randomUUID(),
        status: 'accepted',
        message: 'Event ingested. Player profile analysis queued.'
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
    console.error(`[${requestId}] GameDev events endpoint error:`, error);
    
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