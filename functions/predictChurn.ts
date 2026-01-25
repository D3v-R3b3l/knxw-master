import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user_id, client_app_id } = await req.json();

    if (!user_id) {
      return Response.json({ error: 'user_id is required' }, { status: 400 });
    }

    // Fetch user's recent events
    const recentEvents = await base44.asServiceRole.entities.CapturedEvent.filter({
      user_id,
      processed: true
    });

    // Fetch user's psychographic profile
    const profiles = await base44.asServiceRole.entities.UserPsychographicProfile.filter({
      user_id
    });

    if (!profiles || profiles.length === 0) {
      return Response.json({ 
        churn_risk: 'unknown',
        confidence: 0,
        reason: 'Insufficient profile data'
      });
    }

    const profile = profiles[0];

    // Simple heuristic-based churn prediction
    const eventCount = recentEvents?.length || 0;
    const daysSinceLastAnalysis = profile.last_analyzed 
      ? (Date.now() - new Date(profile.last_analyzed).getTime()) / (1000 * 60 * 60 * 24)
      : 999;

    let churn_risk = 'low';
    let confidence = 0.5;
    let reason = 'User is actively engaged';

    // Churn signals
    if (eventCount < 5 && daysSinceLastAnalysis > 7) {
      churn_risk = 'high';
      confidence = 0.85;
      reason = 'Low recent activity and stale profile';
    } else if (eventCount < 10 && daysSinceLastAnalysis > 3) {
      churn_risk = 'medium';
      confidence = 0.65;
      reason = 'Declining engagement detected';
    } else if (profile.emotional_state?.mood === 'negative' || profile.emotional_state?.mood === 'anxious') {
      churn_risk = 'medium';
      confidence = 0.70;
      reason = 'Negative emotional state detected';
    }

    // AI-enhanced prediction using LLM
    const llmPrompt = `Based on the following user data, predict churn risk (low, medium, high):
- Recent events: ${eventCount}
- Days since last analysis: ${daysSinceLastAnalysis}
- Emotional state: ${profile.emotional_state?.mood || 'unknown'}
- Risk profile: ${profile.risk_profile}
- Cognitive style: ${profile.cognitive_style}

Provide a JSON response with: { "churn_risk": "low|medium|high", "confidence": 0-1, "reason": "explanation" }`;

    try {
      const aiResponse = await base44.integrations.Core.InvokeLLM({
        prompt: llmPrompt,
        response_json_schema: {
          type: 'object',
          properties: {
            churn_risk: { type: 'string', enum: ['low', 'medium', 'high'] },
            confidence: { type: 'number', minimum: 0, maximum: 1 },
            reason: { type: 'string' }
          }
        }
      });

      if (aiResponse && aiResponse.churn_risk) {
        return Response.json(aiResponse);
      }
    } catch (llmError) {
      console.warn('LLM prediction failed, using heuristic:', llmError);
    }

    // Fallback to heuristic
    return Response.json({
      churn_risk,
      confidence,
      reason,
      factors: {
        event_count: eventCount,
        days_inactive: daysSinceLastAnalysis,
        emotional_state: profile.emotional_state?.mood
      }
    });
  } catch (error) {
    console.error('Churn prediction error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});