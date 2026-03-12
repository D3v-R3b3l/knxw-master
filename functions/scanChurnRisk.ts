import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const CHURN_SIGNAL_WEIGHTS = {
  staleness_score: 0.30,
  negative_mood: 0.25,
  low_event_recency: 0.20,
  low_energy: 0.15,
  high_neuroticism: 0.10,
};

const SEGMENT_INTERVENTIONS = {
  analytical: [
    'Share a detailed performance report with comparative benchmarks',
    'Offer a live data walkthrough session',
    'Send an evidence-based case study matching their use case',
  ],
  intuitive: [
    'Send an inspiring vision email about upcoming platform capabilities',
    'Offer a 1:1 strategy session to re-align on goals',
    'Share a short success story from a similar user',
  ],
  systematic: [
    'Provide a structured re-onboarding checklist',
    'Share a step-by-step guide for an underused feature',
    'Offer a scheduled workflow review call',
  ],
  creative: [
    'Invite them to a beta feature or experiment program',
    'Share an ideation prompt or community challenge',
    'Offer a sandbox environment to explore new capabilities',
  ],
  unknown: [
    'Reach out personally with an open-ended check-in question',
    'Offer a flexible product demo tailored to their goals',
    'Provide a proactive discount or loyalty incentive',
  ],
};

function getIndicatorValue(profile, key) {
  const indicators = profile?.fused_profile?.indicators || [];
  return indicators.find((indicator) => indicator.key === key)?.value;
}

function scoreChurnRisk(profile, psyProfile) {
  let score = 0;

  if (psyProfile) {
    const staleness = psyProfile.staleness_score || 0;
    score += staleness * CHURN_SIGNAL_WEIGHTS.staleness_score;

    const mood = psyProfile.emotional_state?.mood;
    if (mood === 'negative' || mood === 'anxious' || mood === 'uncertain') {
      score += CHURN_SIGNAL_WEIGHTS.negative_mood;
    }

    const energy = psyProfile.emotional_state?.energy_level;
    if (energy === 'low') score += CHURN_SIGNAL_WEIGHTS.low_energy;

    const neuroticism = psyProfile.personality_traits?.neuroticism || 0;
    if (neuroticism > 0.7) score += CHURN_SIGNAL_WEIGHTS.high_neuroticism;
  }

  if (profile?.updated_date) {
    const daysSinceUpdate = (Date.now() - new Date(profile.updated_date).getTime()) / 86400000;
    if (daysSinceUpdate > 14) score += CHURN_SIGNAL_WEIGHTS.low_event_recency;
    else if (daysSinceUpdate > 7) score += CHURN_SIGNAL_WEIGHTS.low_event_recency * 0.5;
  }

  return Math.min(score, 1);
}

function classifyRisk(score) {
  if (score >= 0.65) return 'high';
  if (score >= 0.35) return 'medium';
  return 'low';
}

Deno.serve(async (req) => {
  const requestId = req.headers.get('X-Request-ID') || crypto.randomUUID();
  const base44 = createClientFromRequest(req);

  try {
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const rawBody = req.method === 'POST' ? await req.text() : '';
    const parsedBody = rawBody ? JSON.parse(rawBody) : {};
    const { app_id, limit = 200 } = parsedBody;

    const filter = app_id ? { app_id } : {};
    const hybridProfiles = await base44.asServiceRole.entities.HybridUserProfile.filter(filter, '-updated_date', Math.min(limit, 500));

    if (!hybridProfiles.length) {
      return Response.json({
        success: true,
        data: { at_risk_users: [], segments: [], total_scanned: 0, high_risk_count: 0, medium_risk_count: 0 },
        meta: { requestId, projection_basis: 'heuristic' },
      });
    }

    const userIds = hybridProfiles.map((profile) => profile.user_id).filter(Boolean);
    const legacyMap = {};
    try {
      const legacyProfiles = await base44.asServiceRole.entities.UserPsychographicProfile.filter({}, '-last_analyzed', Math.min(limit, 500));
      for (const legacyProfile of legacyProfiles) {
        if (userIds.includes(legacyProfile.user_id)) {
          legacyMap[legacyProfile.user_id] = legacyProfile;
        }
      }
    } catch {
      // best effort only
    }

    const scored = hybridProfiles.map((profile) => {
      const psy = legacyMap[profile.user_id];
      const churnScore = scoreChurnRisk(profile, psy);
      const riskLevel = classifyRisk(churnScore);
      const fusedProfile = profile.fused_profile || {};
      const cognitiveStyle = fusedProfile.cognitive_style || getIndicatorValue(profile, 'cognitive_style') || psy?.cognitive_style || 'unknown';
      const primaryMotivation = fusedProfile.primary_motivation || getIndicatorValue(profile, 'primary_motivation') || psy?.motivation_labels?.[0] || null;

      return {
        user_id: profile.user_id,
        app_id: profile.app_id || null,
        churn_score: parseFloat(churnScore.toFixed(3)),
        risk_level: riskLevel,
        cognitive_style: cognitiveStyle,
        primary_motivation: primaryMotivation,
        last_active: profile.updated_date || null,
        evidence: [
          psy?.emotional_state?.mood ? `Mood: ${psy.emotional_state.mood}` : null,
          psy?.staleness_score > 0.5 ? `Stale profile (score: ${psy.staleness_score?.toFixed(2)})` : null,
          profile.updated_date && (Date.now() - new Date(profile.updated_date).getTime()) > 14 * 86400000 ? 'No activity in 14+ days' : null,
        ].filter(Boolean),
      };
    });

    const atRisk = scored
      .filter((userRecord) => userRecord.risk_level === 'high' || userRecord.risk_level === 'medium')
      .sort((a, b) => b.churn_score - a.churn_score);

    const segmentMap = {};
    for (const userRecord of atRisk) {
      const segment = userRecord.cognitive_style || 'unknown';
      if (!segmentMap[segment]) {
        segmentMap[segment] = {
          segment,
          users: [],
          interventions: SEGMENT_INTERVENTIONS[segment] || SEGMENT_INTERVENTIONS.unknown,
        };
      }
      segmentMap[segment].users.push(userRecord);
    }

    const segments = Object.values(segmentMap).map((segment) => ({
      segment: segment.segment,
      user_count: segment.users.length,
      avg_churn_score: parseFloat((segment.users.reduce((sum, userRecord) => sum + userRecord.churn_score, 0) / segment.users.length).toFixed(3)),
      high_risk_count: segment.users.filter((userRecord) => userRecord.risk_level === 'high').length,
      interventions: segment.interventions,
      sample_users: segment.users.slice(0, 5).map((userRecord) => ({
        user_id: userRecord.user_id,
        churn_score: userRecord.churn_score,
        risk_level: userRecord.risk_level,
      })),
    })).sort((a, b) => b.avg_churn_score - a.avg_churn_score);

    return Response.json({
      success: true,
      data: {
        at_risk_users: atRisk.slice(0, 50),
        segments,
        total_scanned: hybridProfiles.length,
        high_risk_count: atRisk.filter((userRecord) => userRecord.risk_level === 'high').length,
        medium_risk_count: atRisk.filter((userRecord) => userRecord.risk_level === 'medium').length,
      },
      meta: { requestId, scanned_at: new Date().toISOString(), projection_basis: 'heuristic' },
    });
  } catch (error) {
    console.error(`[${requestId}] scanChurnRisk error:`, error);
    return Response.json({ success: false, error: error.message, meta: { requestId } }, { status: 500 });
  }
});