import { z } from 'https://deno.land/x/zod@v3.23.0/mod.ts';
import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

const MotivationQuerySchema = z.object({
  player_id: z.string().min(1).max(256)
});

Deno.serve(async (req) => {
  const startTime = performance.now();
  const tenantId = req.tenantId || 'anonymous';
  const apiKey = req.apiKey || null;
  const requestId = req.headers.get('X-Request-ID') || crypto.randomUUID();
  const base44 = createClientFromRequest(req);

  try {
    if (req.method !== 'GET') {
      return new Response(JSON.stringify({ success: false, error: 'Method not allowed. Use GET.' }), { 
        status: 405, 
        headers: { 'Content-Type': 'application/json', 'Allow': 'GET' } 
      });
    }

    const url = new URL(req.url);
    const playerId = url.searchParams.get('player_id');

    if (!playerId) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Missing required parameter: player_id',
        meta: { requestId, tenantId, latencyMs: Math.round(performance.now() - startTime) }
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    MotivationQuerySchema.parse({ player_id: playerId });

    // Get player profile
    const profiles = await base44.asServiceRole.entities.HybridUserProfile.filter({ user_id: playerId }, '-updated_date', 1);
    const profile = profiles[0];

    let motivationData;

    if (!profile || !profile.fused_profile) {
      // No profile yet - return generic/default motivation
      motivationData = {
        primary: 'exploration',
        secondary: 'achievement',
        confidence: 0.3,
        rationale: 'Insufficient player data. Defaulting to broad motivation profile until more events are captured.',
        data_quality: 'low',
        recommended_actions: [
          'Continue tracking player events',
          'Minimum 10-15 events needed for accurate profiling'
        ]
      };
    } else {
      // Extract motivations from profile
      const motivations = profile.fused_profile.motivations || [];
      const indicators = profile.fused_profile.indicators || [];
      
      const topMotivations = motivations
        .sort((a, b) => (b.weight || 0) - (a.weight || 0))
        .slice(0, 2);

      const primary = topMotivations[0]?.label || 'achievement';
      const secondary = topMotivations[1]?.label || 'mastery';
      const confidence = profile.fused_profile.confidence || 0.7;

      // Build rationale from indicators
      const relevantIndicators = indicators
        .filter(i => i.key && i.key.includes('motivation'))
        .slice(0, 3);

      const rationale = relevantIndicators.length > 0
        ? `Based on ${relevantIndicators.length} behavioral signals: ` + relevantIndicators.map(i => `${i.key}=${i.value}`).join(', ')
        : `Derived from ${motivations.length} analyzed motivation dimensions.`;

      motivationData = {
        primary,
        secondary,
        confidence,
        rationale,
        data_quality: confidence > 0.7 ? 'high' : confidence > 0.5 ? 'medium' : 'low',
        all_motivations: topMotivations.map(m => ({ label: m.label, weight: m.weight }))
      };
    }

    // Log usage
    await base44.asServiceRole.entities.GameUsageEvent.create({
      tenant_id: tenantId,
      api_key_id: apiKey?.id,
      endpoint: '/api/v1/gamedev/motivation',
      method: 'GET',
      status_code: 200,
      latency_ms: Math.round(performance.now() - startTime),
      bytes_in: 0,
      bytes_out: new TextEncoder().encode(JSON.stringify(motivationData)).length,
      game_context: { player_id: playerId },
      timestamp: new Date().toISOString(),
      request_id: requestId,
      is_rate_limited: false
    });

    return new Response(JSON.stringify({ 
      success: true, 
      data: motivationData,
      meta: { 
        requestId, 
        tenantId, 
        latencyMs: Math.round(performance.now() - startTime) 
      } 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error(`[${requestId}] GameDev motivation endpoint error:`, error);
    
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