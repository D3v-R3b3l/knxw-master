import { z } from 'https://deno.land/x/zod@v3.23.0/mod.ts';
import { ProfileGetSchema } from '../utils/zodSchemas.js';
import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

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
    const pathParts = url.pathname.split('/');
    const userId = pathParts[pathParts.length - 1];

    if (!userId || userId.length === 0) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'User ID is required in the path: /api/v1/profiles/:user_id',
        meta: { requestId, tenantId, latencyMs: Math.round(performance.now() - startTime) }
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    ProfileGetSchema.parse({ user_id: userId });

    const profiles = await base44.asServiceRole.entities.HybridUserProfile.filter({ user_id: userId }, '-updated_date', 1);
    const profile = profiles[0];

    if (!profile) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Profile not found',
        message: `No profile exists for user_id: ${userId}`,
        meta: { requestId, tenantId, latencyMs: Math.round(performance.now() - startTime) }
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const fusedProfile = profile.fused_profile || {};
    const indicators = fusedProfile.indicators || [];
    
    const profileData = {
      user_id: profile.user_id,
      motivations: {
        primary: indicators.find((i) => i.key === 'primary_motivation')?.value || 'unknown',
        secondary: indicators.find((i) => i.key === 'secondary_motivation')?.value || 'unknown',
        confidence: indicators.find((i) => i.key === 'motivation_confidence')?.confidence || 0.5
      },
      personality: {
        openness: indicators.find((i) => i.key === 'personality.openness')?.value || 0.5,
        conscientiousness: indicators.find((i) => i.key === 'personality.conscientiousness')?.value || 0.5,
        extraversion: indicators.find((i) => i.key === 'personality.extraversion')?.value || 0.5,
        agreeableness: indicators.find((i) => i.key === 'personality.agreeableness')?.value || 0.5,
        neuroticism: indicators.find((i) => i.key === 'personality.neuroticism')?.value || 0.5
      },
      emotions: {
        current_state: indicators.find((i) => i.key === 'emotional_state')?.value || 'neutral',
        energy: indicators.find((i) => i.key === 'energy_level')?.value || 0.5,
        mood: indicators.find((i) => i.key === 'mood')?.value || 'neutral'
      },
      cognitive_style: indicators.find((i) => i.key === 'cognitive_style')?.value || 'analytical',
      risk_profile: indicators.find((i) => i.key === 'risk_profile')?.value || 'moderate',
      reasoning: profile.evidence || 'Profile generated from behavioral analysis.',
      last_updated: profile.updated_date,
      version: profile.version || 1
    };

    return new Response(JSON.stringify({ 
      success: true, 
      data: profileData,
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
    console.error(`[${requestId}] Profiles endpoint error:`, error);
    
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