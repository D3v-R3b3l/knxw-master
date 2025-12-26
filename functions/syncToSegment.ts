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

    // Get integration config
    const configs = await base44.entities.MarketingIntegrationConfig.filter({
      client_app_id,
      integration_type: 'segment',
      status: 'active'
    }, null, 1);

    if (configs.length === 0) {
      return Response.json({ error: 'Segment integration not configured' }, { status: 404 });
    }

    const config = configs[0];

    // Get psychographic profile
    const profiles = await base44.entities.UserPsychographicProfile.filter({ user_id }, '-last_analyzed', 1);
    
    if (profiles.length === 0) {
      return Response.json({ error: 'No psychographic profile found' }, { status: 404 });
    }

    const profile = profiles[0];

    // Prepare Segment identify call
    const segmentPayload = {
      userId: user_id,
      traits: {
        psychographic: {
          risk_profile: profile.risk_profile,
          cognitive_style: profile.cognitive_style,
          emotional_mood: profile.emotional_state?.mood,
          energy_level: profile.emotional_state?.energy_level,
          primary_motivation: profile.motivation_labels?.[0],
          personality_openness: profile.personality_traits?.openness,
          personality_conscientiousness: profile.personality_traits?.conscientiousness,
          personality_extraversion: profile.personality_traits?.extraversion,
          personality_agreeableness: profile.personality_traits?.agreeableness,
          personality_neuroticism: profile.personality_traits?.neuroticism,
          last_analyzed: profile.last_analyzed
        }
      },
      timestamp: new Date().toISOString(),
      context: {
        integration: {
          name: 'knXw',
          version: '1.0.0'
        }
      }
    };

    // Send to Segment
    const writeKey = config.credentials.api_key;
    const auth = btoa(`${writeKey}:`);

    const response = await fetch('https://api.segment.io/v1/identify', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(segmentPayload)
    });

    const result = response.ok ? { success: true } : await response.json();

    // Update integration config
    await base44.entities.MarketingIntegrationConfig.update(config.id, {
      last_sync: new Date().toISOString(),
      last_error: response.ok ? null : JSON.stringify(result)
    });

    return Response.json({
      success: response.ok,
      segment_response: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error syncing to Segment:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});