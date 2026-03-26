import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user_id, campaign_goal, tone = 'professional', max_length = 200 } = await req.json();

    if (!user_id || !campaign_goal) {
      return Response.json({ error: 'user_id and campaign_goal are required' }, { status: 400 });
    }

    // Fetch user's psychographic profile
    const profiles = await base44.asServiceRole.entities.UserPsychographicProfile.filter({ user_id });

    if (!profiles || profiles.length === 0) {
      return Response.json({ error: 'Profile not found' }, { status: 404 });
    }

    const profile = profiles[0];

    // Build personalized prompt based on psychographic data
    const motivationContext = profile.motivation_labels?.join(', ') || 'general achievement';
    const emotionalContext = profile.emotional_state?.mood || 'neutral';
    const cognitiveContext = profile.cognitive_style || 'balanced';
    const riskContext = profile.risk_profile || 'moderate';

    const prompt = `Generate personalized marketing copy for a user with the following psychographic profile:

**Motivations:** ${motivationContext}
**Emotional State:** ${emotionalContext}
**Cognitive Style:** ${cognitiveContext}
**Risk Profile:** ${riskContext}

**Campaign Goal:** ${campaign_goal}
**Tone:** ${tone}
**Max Length:** ${max_length} characters

Generate 3 variations of marketing copy that:
1. Resonates with their core motivations
2. Matches their emotional state and cognitive style
3. Addresses their risk profile appropriately
4. Drives action toward the campaign goal

Return JSON: { "variations": ["copy1", "copy2", "copy3"], "rationale": "why this approach works for this profile" }`;

    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          variations: {
            type: 'array',
            items: { type: 'string' }
          },
          rationale: { type: 'string' }
        }
      }
    });

    return Response.json({
      user_id,
      profile_summary: {
        motivations: profile.motivation_labels,
        emotional_state: profile.emotional_state?.mood,
        cognitive_style: profile.cognitive_style,
        risk_profile: profile.risk_profile
      },
      generated_copy: aiResponse.variations || [],
      rationale: aiResponse.rationale || '',
      confidence: profile.motivation_confidence_score || 0.5,
      generated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Marketing copy generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});