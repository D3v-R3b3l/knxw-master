import { z } from 'https://deno.land/x/zod@v3.23.0/mod.ts';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

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

    // Fire-and-forget: core event ingestion and profile refresh.
    // These are non-blocking — GameUsageEvent stamping must always succeed
    // regardless of whether captureEvent or liveProfileProcessor are reachable.
    const eventId = crypto.randomUUID();
    base44.functions.invoke('captureEvent', {
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
    }).catch(err => console.warn(`[${requestId}] captureEvent invoke failed (non-blocking):`, err.message));

    base44.functions.invoke('liveProfileProcessor', { 
      action: 'process_live_events', 
      user_id: validatedData.player_id 
    }).catch(err => console.warn(`Profile refresh failed for player ${validatedData.player_id}:`, err));

    // Resolve ClientApp from API key — supports all auth paths:
    // 1. req.apiKey platform object (populated by platform middleware from Authorization header)
    // 2. Authorization: Bearer <key> header (manual parse fallback)
    // 3. body.apiKey or body.api_key (legacy body-key auth)
    let resolvedClientAppId = null;
    let resolvedOwnerUserId = null;

    // Path 1: platform has already resolved req.apiKey as an object with a key_prefix
    // The platform attaches req.apiKey as an ApiKey entity record. Its tenant_id field
    // is the ClientApp.id (by convention established in ApiKey schema description).
    if (apiKey?.tenant_id) {
      resolvedClientAppId = apiKey.tenant_id;
      try {
        const apps = await base44.asServiceRole.entities.ClientApp.filter(
          { id: apiKey.tenant_id, status: 'active' }, null, 1
        );
        if (apps?.[0]) {
          resolvedOwnerUserId = apps[0].owner_id;
        }
      } catch (lookupErr) {
        console.warn(`[${requestId}] ClientApp owner lookup (path1) failed:`, lookupErr.message);
      }
    }

    // Path 2 & 3: raw key from Authorization header or request body
    if (!resolvedClientAppId) {
      let rawApiKey = body?.apiKey || body?.api_key || null;
      if (!rawApiKey) {
        const authHeader = req.headers.get('Authorization') || req.headers.get('authorization') || '';
        if (authHeader.startsWith('Bearer ')) {
          rawApiKey = authHeader.slice(7).trim();
        }
      }
      if (rawApiKey) {
        try {
          const apps = await base44.asServiceRole.entities.ClientApp.filter(
            { api_key: rawApiKey, status: 'active' }, null, 1
          );
          if (apps?.[0]) {
            resolvedClientAppId = apps[0].id;
            resolvedOwnerUserId = apps[0].owner_id;
          }
        } catch (lookupErr) {
          console.warn(`[${requestId}] ClientApp lookup (path2/3) failed:`, lookupErr.message);
        }
      }
    }

    // If we could not resolve any ClientApp, this is effectively an unauthenticated/invalid request.
    // Write an auth SystemEvent for observability (non-blocking).
    if (!resolvedClientAppId) {
      base44.asServiceRole.entities.SystemEvent.create({
        org_id: tenantId,
        workspace_id: null,
        actor_type: 'api',
        actor_id: tenantId,
        event_type: 'auth',
        severity: 'error',
        payload: { endpoint: '/api/v1/gamedev/events', reason: 'unresolvable_client_app', total_ms: Math.round(performance.now() - startTime) },
        trace_id: requestId,
        timestamp: new Date().toISOString(),
        is_demo: false
      }).catch(err => console.warn(`[${requestId}] Auth failure SystemEvent write failed:`, err.message));
    }

    // Log game-specific usage with owner-scoped fields
    const bodyStr = JSON.stringify(body);
    await base44.asServiceRole.entities.GameUsageEvent.create({
      tenant_id: tenantId,
      client_app_id: resolvedClientAppId,
      owner_user_id: resolvedOwnerUserId,
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
        event_id: eventId,
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