import { z } from 'https://deno.land/x/zod@v3.23.0/mod.ts';
import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

const RewardRequestSchema = z.object({
  player_id: z.string().min(1).max(256),
  inventory: z.array(z.string()).optional().default([]),
  session_stats: z.object({
    playtime_minutes: z.number().optional(),
    levels_completed: z.number().optional(),
    achievements_unlocked: z.number().optional()
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
    const validatedData = RewardRequestSchema.parse(body);

    const profiles = await base44.asServiceRole.entities.HybridUserProfile.filter({ 
      user_id: validatedData.player_id 
    }, '-updated_date', 1);
    const profile = profiles[0];

    let rewardResponse;

    if (!profile || !profile.fused_profile) {
      rewardResponse = {
        reward_type: 'currency',
        quantity: 100,
        rationale: 'Default reward. Psychographic profile not available yet.',
        confidence: 0.3,
        alternatives: [
          { type: 'power_up', quantity: 1 },
          { type: 'cosmetic', quantity: 1 }
        ]
      };
    } else {
      const fusedProfile = profile.fused_profile;
      const motivations = fusedProfile.motivations || [];
      const personality = fusedProfile.personality_traits || {};

      const topMotive = motivations[0]?.label || 'achievement';
      
      let rewardType, quantity, rationale;
      
      if (topMotive === 'achievement' || topMotive === 'mastery') {
        rewardType = 'achievement_badge';
        quantity = 1;
        rationale = 'Achievement-driven player. Badge aligns with mastery motivation.';
      } else if (topMotive === 'social' || topMotive === 'connection') {
        rewardType = 'social_currency';
        quantity = 150;
        rationale = 'Socially motivated. Currency enables gifting and social interaction.';
      } else if (topMotive === 'creativity' || topMotive === 'self_expression') {
        rewardType = 'cosmetic';
        quantity = 1;
        rationale = 'Creative player. Cosmetic rewards enable self-expression.';
      } else if (topMotive === 'exploration' || topMotive === 'curiosity') {
        rewardType = 'map_unlock';
        quantity = 1;
        rationale = 'Explorer motivation. Map unlock satisfies curiosity.';
      } else {
        rewardType = 'currency';
        quantity = 100;
        rationale = `General motivation: ${topMotive}. Currency provides flexibility.`;
      }

      const generosityFactor = personality.neuroticism 
        ? (1 - personality.neuroticism) * 0.5 + 0.75 
        : 1;
      
      if (typeof quantity === 'number') {
        quantity = Math.round(quantity * generosityFactor);
      }

      rewardResponse = {
        reward_type: rewardType,
        quantity,
        rationale,
        confidence: 0.8,
        psychographic_match: {
          primary_motivation: topMotive,
          personality_insight: personality.openness > 0.7 
            ? 'High openness: prefers novel rewards'
            : 'Balanced openness: prefers familiar rewards'
        },
        alternatives: [
          { type: 'currency', quantity: Math.round(quantity * 1.5) },
          { type: 'power_up', quantity: 1 }
        ]
      };
    }

    const bodyStr = JSON.stringify(body);
    await base44.asServiceRole.entities.GameUsageEvent.create({
      tenant_id: tenantId,
      api_key_id: apiKey?.id,
      endpoint: '/api/v1/gamedev/reward',
      method: 'POST',
      status_code: 200,
      latency_ms: Math.round(performance.now() - startTime),
      bytes_in: new TextEncoder().encode(bodyStr).length,
      bytes_out: new TextEncoder().encode(JSON.stringify(rewardResponse)).length,
      game_context: { player_id: validatedData.player_id },
      timestamp: new Date().toISOString(),
      request_id: requestId,
      is_rate_limited: false
    });

    return new Response(JSON.stringify({ 
      success: true, 
      data: rewardResponse,
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
    console.error(`[${requestId}] GameDev reward endpoint error:`, error);
    
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