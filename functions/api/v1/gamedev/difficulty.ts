import { z } from 'https://deno.land/x/zod@v3.23.0/mod.ts';
import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

const DifficultyRequestSchema = z.object({
  player_id: z.string().min(1).max(256),
  encounter: z.string().min(1).max(256),
  recent_metrics: z.object({
    success_rate: z.number().min(0).max(1).optional(),
    avg_completion_time: z.number().optional(),
    deaths: z.number().optional(),
    retries: z.number().optional()
  }).optional().default({})
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
    const validatedData = DifficultyRequestSchema.parse(body);

    // Get player profile
    const profiles = await base44.asServiceRole.entities.HybridUserProfile.filter({ 
      user_id: validatedData.player_id 
    }, '-updated_date', 1);
    const profile = profiles[0];

    let difficultyResponse;

    const successRate = validatedData.recent_metrics.success_rate;
    const hasMetrics = successRate !== undefined;

    if (!profile || !profile.fused_profile) {
      // No profile - use metrics only
      const target = hasMetrics 
        ? (successRate > 0.7 ? 'hard' : successRate > 0.4 ? 'medium' : 'easy')
        : 'medium';

      difficultyResponse = {
        difficulty_target: target,
        rationale: hasMetrics
          ? `Based on ${(successRate * 100).toFixed(0)}% success rate. No psychographic profile available yet.`
          : 'Insufficient data. Starting with medium difficulty.',
        confidence: hasMetrics ? 0.6 : 0.3,
        adjustments: {
          enemy_health: target === 'hard' ? 1.3 : target === 'easy' ? 0.7 : 1.0,
          enemy_damage: target === 'hard' ? 1.2 : target === 'easy' ? 0.8 : 1.0,
          spawn_rate: target === 'hard' ? 1.4 : target === 'easy' ? 0.6 : 1.0
        }
      };
    } else {
      // Use psychographic profile
      const fusedProfile = profile.fused_profile;
      const riskProfile = fusedProfile.risk_profile || 'moderate';
      const cognitiveStyle = fusedProfile.cognitive_style || 'analytical';
      const motivations = fusedProfile.motivations || [];
      
      const hasChallengeMotive = motivations.some(m => 
        m.label === 'mastery' || m.label === 'achievement' || m.label === 'challenge'
      );

      let baseTarget;
      if (riskProfile === 'aggressive' || hasChallengeMotive) {
        baseTarget = 'hard';
      } else if (riskProfile === 'conservative') {
        baseTarget = 'easy';
      } else {
        baseTarget = 'medium';
      }

      // Adjust based on metrics
      let finalTarget = baseTarget;
      if (hasMetrics) {
        if (successRate < 0.3 && baseTarget === 'hard') finalTarget = 'medium';
        if (successRate > 0.8 && baseTarget === 'easy') finalTarget = 'medium';
      }

      const factors = [];
      if (riskProfile === 'aggressive') factors.push('high risk tolerance');
      if (hasChallengeMotive) factors.push('achievement-driven');
      if (cognitiveStyle === 'systematic') factors.push('systematic thinker');
      if (hasMetrics) factors.push(`${(successRate * 100).toFixed(0)}% success rate`);

      difficultyResponse = {
        difficulty_target: finalTarget,
        rationale: `Profile: ${riskProfile} risk, ${cognitiveStyle} style. Factors: ${factors.join(', ')}.`,
        confidence: 0.85,
        adjustments: {
          enemy_health: finalTarget === 'hard' ? 1.3 : finalTarget === 'easy' ? 0.7 : 1.0,
          enemy_damage: finalTarget === 'hard' ? 1.2 : finalTarget === 'easy' ? 0.8 : 1.0,
          spawn_rate: finalTarget === 'hard' ? 1.4 : finalTarget === 'easy' ? 0.6 : 1.0,
          hint_frequency: cognitiveStyle === 'intuitive' ? 0.5 : 1.0
        },
        psychographic_context: {
          risk_profile: riskProfile,
          cognitive_style: cognitiveStyle,
          primary_motivations: motivations.slice(0, 2).map(m => m.label)
        }
      };
    }

    // Log usage
    const bodyStr = JSON.stringify(body);
    await base44.asServiceRole.entities.GameUsageEvent.create({
      tenant_id: tenantId,
      api_key_id: apiKey?.id,
      endpoint: '/api/v1/gamedev/difficulty',
      method: 'POST',
      status_code: 200,
      latency_ms: Math.round(performance.now() - startTime),
      bytes_in: new TextEncoder().encode(bodyStr).length,
      bytes_out: new TextEncoder().encode(JSON.stringify(difficultyResponse)).length,
      game_context: { 
        player_id: validatedData.player_id,
        encounter: validatedData.encounter
      },
      timestamp: new Date().toISOString(),
      request_id: requestId,
      is_rate_limited: false
    });

    return new Response(JSON.stringify({ 
      success: true, 
      data: difficultyResponse,
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
    console.error(`[${requestId}] GameDev difficulty endpoint error:`, error);
    
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