import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

function getIndicator(indicators = [], key) {
  return indicators.find((item) => item.key === key);
}

function buildDerivedInsights(profile, legacyProfile, context, goal) {
  const fused = profile?.fused_profile || {};
  const indicators = fused.indicators || [];
  const riskProfile = fused.risk_profile || getIndicator(indicators, 'risk_profile')?.value || legacyProfile?.risk_profile || 'moderate';
  const cognitiveStyle = fused.cognitive_style || getIndicator(indicators, 'cognitive_style')?.value || legacyProfile?.cognitive_style || 'analytical';
  const mood = fused.emotional_state?.mood || getIndicator(indicators, 'emotional_state.mood')?.value || legacyProfile?.emotional_state?.mood || 'neutral';
  const primaryMotivation = fused.primary_motivation || getIndicator(indicators, 'primary_motivation')?.value || legacyProfile?.motivation_labels?.[0] || 'growth';

  return [
    {
      insight_type: 'behavioral_pattern',
      title: `Live profile indicates a ${cognitiveStyle} decision style`,
      description: `Recent event activity supports a ${cognitiveStyle} decision pattern with ${riskProfile} risk tolerance and a ${mood} emotional state.`,
      confidence_score: getIndicator(indicators, 'cognitive_style')?.confidence || fused.confidence || 0.65,
      actionable_recommendations: [
        cognitiveStyle === 'analytical' ? 'Lead with proof, benchmarks, and concrete comparisons.' : 'Lead with simpler narrative-driven guidance.',
        riskProfile === 'conservative' ? 'Reduce friction with reassurance and trust signals.' : 'Present a stronger next-step CTA.'
      ],
      priority: riskProfile === 'conservative' && mood === 'anxious' ? 'high' : 'medium',
      supporting_context: { context, goal }
    },
    {
      insight_type: 'engagement_optimization',
      title: `Primary motivation detected: ${primaryMotivation}`,
      description: `Live signals currently point to ${primaryMotivation} as the strongest motivation driver for this user.`,
      confidence_score: getIndicator(indicators, 'primary_motivation')?.confidence || fused.confidence || 0.6,
      actionable_recommendations: [
        `Tailor messaging to emphasize ${primaryMotivation}.`,
        'Keep the next recommendation aligned with the user’s current live context.'
      ],
      priority: 'medium',
      supporting_context: { context, goal }
    }
  ];
}

async function resolveClientApp(base44, req, body) {
  const apiKey = body?.apiKey || body?.api_key || req.headers.get('X-API-Key') || req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!apiKey) return null;
  const matches = await base44.asServiceRole.entities.ClientApp.filter({ api_key: apiKey, status: 'active' }, null, 1);
  return matches?.[0] || null;
}

Deno.serve(async (req) => {
  const startTime = performance.now();
  const requestId = req.headers.get('X-Request-ID') || crypto.randomUUID();
  const base44 = createClientFromRequest(req);

  try {
    if (req.method !== 'POST') {
      return json({ success: false, error: 'Method not allowed. Use POST.' }, 405);
    }

    const body = await req.json().catch(() => ({}));
    const userId = String(body?.user_id || '').trim();
    if (!userId) {
      return json({ success: false, error: 'user_id is required' }, 400);
    }

    const clientApp = await resolveClientApp(base44, req, body);
    const appId = body?.app_id || clientApp?.id || null;

    const profileFilter = appId
      ? { user_id: userId, client_app_id: appId }
      : { user_id: userId };
    const profiles = await base44.asServiceRole.entities.HybridUserProfile.filter(profileFilter, '-updated_date', 1);
    const profile = profiles?.[0] || null;
    if (!profile) {
      return json({
        success: false,
        error: 'Profile not found',
        message: `No profile exists for user_id: ${userId}. Ingest events first to build a profile.`,
        meta: { requestId, latencyMs: Math.round(performance.now() - startTime) }
      }, 404);
    }

    const legacyProfiles = await base44.asServiceRole.entities.UserPsychographicProfile.filter({ user_id: userId }, '-last_analyzed', 1).catch(() => []);
    const legacyProfile = legacyProfiles?.[0] || null;
    const liveInsights = await base44.asServiceRole.entities.PsychographicInsight.filter({ user_id: userId }, '-created_date', Math.min(body?.limit || 10, 20)).catch(() => []);
    const minConfidence = typeof body?.min_confidence === 'number' ? body.min_confidence : 0;

    const normalizedInsights = (liveInsights.length > 0 ? liveInsights.map((insight) => ({
      id: insight.id,
      insight_type: insight.insight_type,
      title: insight.title,
      description: insight.description,
      confidence_score: insight.confidence_score,
      actionable_recommendations: insight.actionable_recommendations || [],
      priority: insight.priority || 'medium',
      source: 'stored_live_insight'
    })) : buildDerivedInsights(profile, legacyProfile, body?.context || 'General behavioral analysis', body?.goal || 'Improve user engagement')).filter((insight) => (insight.confidence_score || 0) >= minConfidence);

    return json({
      success: true,
      data: {
        user_id: userId,
        app_id: profile.app_id || appId,
        insights: normalizedInsights,
        source: liveInsights.length > 0 ? 'psychographic_insight' : 'derived_from_live_profile'
      },
      meta: {
        requestId,
        latencyMs: Math.round(performance.now() - startTime),
        profile_version: profile.version || 1
      }
    });
  } catch (error) {
    console.error(`[${requestId}] Insights endpoint error:`, error);
    return json({
      success: false,
      error: 'Internal Server Error',
      details: error.message,
      meta: {
        requestId,
        latencyMs: Math.round(performance.now() - startTime)
      }
    }, 500);
  }
});