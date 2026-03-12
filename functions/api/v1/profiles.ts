import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

function getIndicator(indicators = [], key) {
  return indicators.find((item) => item.key === key);
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
    if (!['GET', 'POST'].includes(req.method)) {
      return json({ success: false, error: 'Method not allowed. Use GET or POST.' }, 405);
    }

    const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {};
    const url = new URL(req.url);
    const userId = String(body?.user_id || url.searchParams.get('user_id') || '').trim();

    if (!userId) {
      return json({ success: false, error: 'user_id is required' }, 400);
    }

    const clientApp = await resolveClientApp(base44, req, body);
    const appId = body?.app_id || clientApp?.id || null;
    const hybridFilter = appId ? { user_id: userId, client_app_id: appId } : { user_id: userId };
    const profiles = await base44.asServiceRole.entities.HybridUserProfile.filter(hybridFilter, '-updated_date', 1);
    const profile = profiles?.[0] || null;

    if (!profile) {
      return json({
        success: false,
        error: 'Profile not found',
        message: `No profile exists for user_id: ${userId}`,
        meta: { requestId, latencyMs: Math.round(performance.now() - startTime) }
      }, 404);
    }

    const legacyProfiles = await base44.asServiceRole.entities.UserPsychographicProfile.filter({ user_id: userId }, '-last_analyzed', 1).catch(() => []);
    const legacy = legacyProfiles?.[0] || null;
    const fusedProfile = profile.fused_profile || {};
    const indicators = fusedProfile.indicators || [];

    const profileData = {
      user_id: profile.user_id,
      app_id: profile.app_id || appId,
      motivations: {
        primary: fusedProfile.primary_motivation || getIndicator(indicators, 'primary_motivation')?.value || legacy?.motivation_labels?.[0] || 'unknown',
        labels: fusedProfile.motivation_labels || legacy?.motivation_labels || [],
        confidence: getIndicator(indicators, 'primary_motivation')?.confidence || legacy?.motivation_confidence_score || fusedProfile.confidence || 0.5
      },
      personality: legacy?.personality_traits || {},
      emotions: {
        current_state: fusedProfile.emotional_state?.mood || getIndicator(indicators, 'emotional_state.mood')?.value || legacy?.emotional_state?.mood || 'neutral',
        energy: fusedProfile.emotional_state?.energy_level || getIndicator(indicators, 'energy_level')?.value || legacy?.emotional_state?.energy_level || 'medium',
        confidence: fusedProfile.emotional_state?.confidence_score || getIndicator(indicators, 'emotional_state.mood')?.confidence || legacy?.emotional_state?.confidence_score || 0.5
      },
      cognitive_style: fusedProfile.cognitive_style || getIndicator(indicators, 'cognitive_style')?.value || legacy?.cognitive_style || 'analytical',
      risk_profile: fusedProfile.risk_profile || getIndicator(indicators, 'risk_profile')?.value || legacy?.risk_profile || 'moderate',
      reasoning: profile.evidence || 'Profile generated from live behavioral analysis.',
      source: 'hybrid_live_profile',
      last_updated: profile.updated_date,
      version: profile.version || 1
    };

    return json({
      success: true,
      data: profileData,
      meta: {
        requestId,
        latencyMs: Math.round(performance.now() - startTime)
      }
    });
  } catch (error) {
    console.error(`[${requestId}] Profiles endpoint error:`, error);
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