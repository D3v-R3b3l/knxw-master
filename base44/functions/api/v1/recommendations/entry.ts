import { createClientFromRequest } from 'npm:@base44/sdk@0.8.26';

// Cognitive style → preferred content format mapping
const COGNITIVE_CONTENT_MAP = {
  analytical:  { formats: ['data_report', 'comparison', 'technical_guide', 'case_study'], tone: 'evidence-based, precise' },
  intuitive:   { formats: ['story', 'visual_overview', 'inspiration', 'trend_highlight'], tone: 'conceptual, big-picture' },
  systematic:  { formats: ['step_by_step_guide', 'checklist', 'tutorial', 'process_doc'], tone: 'structured, sequential' },
  creative:    { formats: ['interactive', 'experiment', 'showcase', 'ideation_prompt'], tone: 'open-ended, exploratory' },
};

const MOTIVATION_THEME_MAP = {
  achievement:      ['success_stories', 'benchmarks', 'milestones', 'performance_upgrades'],
  connection:       ['community', 'collaboration', 'social_proof', 'testimonials'],
  security:         ['risk_reduction', 'compliance', 'stability', 'reliability_guides'],
  autonomy:         ['self_serve_tools', 'customization', 'advanced_features', 'control_panels'],
  growth:           ['learning_resources', 'skill_builders', 'roadmaps', 'best_practices'],
  recognition:      ['leaderboards', 'badges', 'public_profiles', 'share_achievements'],
  curiosity:        ['deep_dives', 'research', 'experiments', 'behind_the_scenes'],
  efficiency:       ['shortcuts', 'automation', 'integrations', 'time_savers'],
};

function extractProfileDimensions(fusedProfile) {
  const indicators = fusedProfile.indicators || [];
  const getIndicator = (key) => indicators.find(i => i.key === key);

  const cognitiveStyle = getIndicator('cognitive_style')?.value || fusedProfile.cognitive_style || 'analytical';
  const primaryMotivation = getIndicator('primary_motivation')?.value || fusedProfile.primary_motivation || 'growth';
  const riskProfile = getIndicator('risk_profile')?.value || fusedProfile.risk_profile || 'moderate';
  const emotionalState = getIndicator('emotional_state')?.value || fusedProfile.emotional_state || 'neutral';
  const energyLevel = parseFloat(getIndicator('energy_level')?.value || fusedProfile.energy_level || 0.5);

  const motivationStack = fusedProfile.motivation_stack_v2 || fusedProfile.motivation_stack || [];
  const topMotivations = motivationStack.length > 0
    ? motivationStack.sort((a, b) => (b.weight || 0) - (a.weight || 0)).slice(0, 3).map(m => m.label)
    : [primaryMotivation];

  return { cognitiveStyle, primaryMotivation, topMotivations, riskProfile, emotionalState, energyLevel };
}

async function resolveClientApp(base44, req, body) {
  const apiKey =
    body?.apiKey ||
    body?.api_key ||
    req.headers.get('X-API-Key') ||
    req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!apiKey) return null;
  const matches = await base44.asServiceRole.entities.ClientApp.filter(
    { api_key: apiKey, status: 'active' }, null, 1
  );
  return matches?.[0] || null;
}

Deno.serve(async (req) => {
  const startTime = performance.now();
  const requestId = req.headers.get('X-Request-ID') || crypto.randomUUID();
  const base44 = createClientFromRequest(req);

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ success: false, error: 'Method not allowed. Use POST.' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json', 'Allow': 'POST' },
      });
    }

    const body = await req.json().catch(() => ({}));
    const { user_id, count = 5, catalog = null, context_hint = '' } = body;

    // SECURITY: Require valid API key. Previously this endpoint was unauthenticated,
    // allowing anyone who knew a user_id to retrieve their personalized recommendations.
    const clientApp = await resolveClientApp(base44, req, body);
    if (!clientApp) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Valid API key required',
        meta: { requestId, latencyMs: Math.round(performance.now() - startTime) }
      }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    if (!user_id) {
      return new Response(JSON.stringify({ success: false, error: 'user_id is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // SECURITY: Scope profile lookup to the authenticated ClientApp to prevent cross-tenant read.
    const hybridProfiles = await base44.asServiceRole.entities.HybridUserProfile.filter(
      { user_id, client_app_id: clientApp.id }, '-updated_date', 1
    );
    const hybrid = hybridProfiles[0];

    let dimensions;
    let profileSource;
    if (hybrid) {
      dimensions = extractProfileDimensions(hybrid.fused_profile || {});
      profileSource = 'hybrid';
    } else {
      // Legacy fallback is intentionally unscoped because UserPsychographicProfile
      // has no client_app_id field (see H-2 in remediation plan; being addressed separately).
      // Until that migration lands, we only return legacy data if a hybrid profile for this
      // user+app has been created at least once — guaranteeing the user belongs to this app.
      return new Response(JSON.stringify({
        success: false,
        error: 'Profile not found',
        message: `No psychographic profile found for user_id: ${user_id} in this app.`,
        meta: { requestId, latencyMs: Math.round(performance.now() - startTime) },
      }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    const { cognitiveStyle, topMotivations, riskProfile, emotionalState, energyLevel } = dimensions;
    const contentPrefs = COGNITIVE_CONTENT_MAP[cognitiveStyle] || COGNITIVE_CONTENT_MAP.analytical;
    const motivationThemes = topMotivations.flatMap(m => MOTIVATION_THEME_MAP[m] || []);

    const catalogContext = catalog && Array.isArray(catalog) && catalog.length > 0
      ? `\n\nContent Catalog to Rank (return only items from this list, using their exact ids):\n${catalog.map((item, i) =>
          `${i + 1}. id="${item.id}" | title="${item.title}" | description="${item.description}" | tags="${(item.tags || []).join(', ')}"`
        ).join('\n')}`
      : '';

    const isCatalogMode = !!catalogContext;

    const prompt = `You are a psychographic-driven content personalization engine. Your job is to produce a PRIORITIZED list of ${count} ${isCatalogMode ? 'items selected and ranked from the provided catalog' : 'content/product recommendations'} that precisely match this user's psychological profile.

PSYCHOGRAPHIC PROFILE:
- Cognitive Style: ${cognitiveStyle} → prefers ${contentPrefs.formats.join(', ')} content in a ${contentPrefs.tone} tone
- Top Motivations (highest to lowest weight): ${topMotivations.join(' > ')}
- Relevant Content Themes from Motivations: ${motivationThemes.slice(0, 6).join(', ')}
- Risk Tolerance: ${riskProfile}
- Current Emotional State: ${emotionalState}
- Energy Level: ${energyLevel <= 0.33 ? 'low (prefer concise, low-effort content)' : energyLevel <= 0.66 ? 'moderate (balanced depth)' : 'high (receptive to deep, complex content)'}
${context_hint ? `\nAdditional Context: ${context_hint}` : ''}
${catalogContext}

SCORING RULES:
- Assign a priority_score 0.0–1.0 (higher = stronger match)
- cognitive_match: how well the item format matches the cognitive style (0.0–1.0)
- motivation_match: how well the item addresses top motivations (0.0–1.0)
- Items should be sorted by priority_score DESCENDING in your response

Return exactly ${count} items.`;

    const llmResponse = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          recommendations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                ...(isCatalogMode ? { catalog_item_id: { type: 'string' } } : {}),
                title: { type: 'string' },
                description: { type: 'string' },
                content_type: { type: 'string' },
                priority_score: { type: 'number', minimum: 0, maximum: 1 },
                cognitive_match: { type: 'number', minimum: 0, maximum: 1 },
                motivation_match: { type: 'number', minimum: 0, maximum: 1 },
                reasoning: { type: 'string' },
              },
              required: ['title', 'description', 'priority_score', 'cognitive_match', 'motivation_match', 'reasoning'],
            },
          },
        },
        required: ['recommendations'],
      },
    });

    const sorted = (llmResponse.recommendations || []).sort((a, b) => b.priority_score - a.priority_score);

    return new Response(JSON.stringify({
      success: true,
      data: {
        recommendations: sorted,
        profile_summary: {
          cognitive_style: cognitiveStyle,
          top_motivations: topMotivations,
          emotional_state: emotionalState,
          energy_level: energyLevel,
        },
      },
      meta: {
        requestId,
        latencyMs: Math.round(performance.now() - startTime),
        profile_source: profileSource,
        catalog_mode: isCatalogMode,
        count_returned: sorted.length,
        client_app_id: clientApp.id,
      },
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error(`[${requestId}] Recommendations endpoint error:`, error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal Server Error',
      details: error.message,
      meta: { requestId, latencyMs: Math.round(performance.now() - startTime) },
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});