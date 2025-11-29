import { z } from 'https://deno.land/x/zod@v3.23.0/mod.ts';
import { RecommendationGetSchema } from '../utils/zodSchemas.js';
import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import { InvokeLLM } from '@/integrations/Core';

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
    const validatedData = RecommendationGetSchema.parse(body);

    const profiles = await base44.asServiceRole.entities.HybridUserProfile.filter({ user_id: validatedData.user_id }, '-updated_date', 1);
    const profile = profiles[0];

    if (!profile) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Profile not found',
        message: `No profile exists for user_id: ${validatedData.user_id}`,
        meta: { requestId, tenantId, latencyMs: Math.round(performance.now() - startTime) }
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const fusedProfile = profile.fused_profile || {};
    const indicators = fusedProfile.indicators || [];
    
    const profileContext = `
User Profile Summary:
- Primary Motivation: ${indicators.find((i) => i.key === 'primary_motivation')?.value || 'unknown'}
- Cognitive Style: ${indicators.find((i) => i.key === 'cognitive_style')?.value || 'analytical'}
- Risk Profile: ${indicators.find((i) => i.key === 'risk_profile')?.value || 'moderate'}
- Emotional State: ${indicators.find((i) => i.key === 'emotional_state')?.value || 'neutral'}
- Energy Level: ${indicators.find((i) => i.key === 'energy_level')?.value || 0.5}
`;

    const prompt = `You are an expert at generating personalized recommendations based on psychographic profiles.

${profileContext}

Generate ${validatedData.count} specific, actionable recommendations for this user. Each recommendation should:
1. Be personalized to their psychological profile
2. Have a clear confidence score
3. Include reasoning for why this recommendation fits

Response format (JSON array):
[
  {
    "title": "Brief recommendation title",
    "description": "Detailed recommendation",
    "confidence": 0.0-1.0,
    "reasoning": "Why this recommendation matches their profile"
  }
]`;

    const llmResponse = await InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          recommendations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                confidence: { type: 'number', minimum: 0, maximum: 1 },
                reasoning: { type: 'string' }
              },
              required: ['title', 'description', 'confidence', 'reasoning']
            }
          }
        },
        required: ['recommendations']
      }
    });

    return new Response(JSON.stringify({ 
      success: true, 
      data: llmResponse,
      meta: { 
        requestId, 
        tenantId, 
        latencyMs: Math.round(performance.now() - startTime),
        profile_version: profile.version || 1
      } 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error(`[${requestId}] Recommendations endpoint error:`, error);
    
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