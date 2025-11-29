import { z } from 'https://deno.land/x/zod@v3.23.0/mod.ts';
import { InsightQuerySchema } from '../utils/zodSchemas.js';
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
    const validatedData = InsightQuerySchema.parse(body);

    const profiles = await base44.asServiceRole.entities.HybridUserProfile.filter({ user_id: validatedData.user_id }, '-updated_date', 1);
    const profile = profiles[0];

    if (!profile) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Profile not found',
        message: `No profile exists for user_id: ${validatedData.user_id}. Ingest events first to build a profile.`,
        meta: { requestId, tenantId, latencyMs: Math.round(performance.now() - startTime) }
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const fusedProfile = profile.fused_profile || {};
    const indicators = fusedProfile.indicators || [];
    
    const profileContext = `
User Profile:
- Motivations: ${indicators.filter((i) => i.key?.includes('motivation')).map((i) => i.value).join(', ')}
- Cognitive Style: ${indicators.find((i) => i.key === 'cognitive_style')?.value || 'analytical'}
- Risk Profile: ${indicators.find((i) => i.key === 'risk_profile')?.value || 'moderate'}
- Emotional State: ${indicators.find((i) => i.key === 'emotional_state')?.value || 'neutral'}
`;

    const prompt = `You are an expert psychographic analyst. Based on the following user profile and context, provide actionable insights and recommendations.

${profileContext}

Context: ${validatedData.context || 'General behavioral analysis'}
Goal: ${validatedData.goal || 'Improve user engagement and satisfaction'}

Provide:
1. A specific, actionable recommendation
2. Clear rationale based on psychographic indicators
3. Expected impact and confidence level

Response format (JSON):
{
  "recommendation": "...",
  "rationale": "...",
  "confidence": 0.0-1.0
}`;

    const llmResponse = await InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          recommendation: { type: 'string' },
          rationale: { type: 'string' },
          confidence: { type: 'number', minimum: 0, maximum: 1 }
        },
        required: ['recommendation', 'rationale', 'confidence']
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
    console.error(`[${requestId}] Insights endpoint error:`, error);
    
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