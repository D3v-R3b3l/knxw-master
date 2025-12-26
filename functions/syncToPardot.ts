import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user_id, email, client_app_id } = await req.json();

    if (!user_id || !email) {
      return Response.json({ error: 'user_id and email are required' }, { status: 400 });
    }

    // Get integration config
    const configs = await base44.entities.MarketingIntegrationConfig.filter({
      client_app_id,
      integration_type: 'pardot',
      status: 'active'
    }, null, 1);

    if (configs.length === 0) {
      return Response.json({ error: 'Pardot integration not configured' }, { status: 404 });
    }

    const config = configs[0];

    // Get psychographic profile
    const profiles = await base44.entities.UserPsychographicProfile.filter({ user_id }, '-last_analyzed', 1);
    
    if (profiles.length === 0) {
      return Response.json({ error: 'No psychographic profile found' }, { status: 404 });
    }

    const profile = profiles[0];

    // Prepare Pardot prospect data
    const prospectData = {
      email,
      knxw_risk_profile: profile.risk_profile,
      knxw_cognitive_style: profile.cognitive_style,
      knxw_emotional_mood: profile.emotional_state?.mood,
      knxw_energy_level: profile.emotional_state?.energy_level,
      knxw_primary_motivation: profile.motivation_labels?.[0],
      knxw_openness_score: profile.personality_traits?.openness,
      knxw_conscientiousness_score: profile.personality_traits?.conscientiousness,
      knxw_extraversion_score: profile.personality_traits?.extraversion,
      knxw_profile_confidence: profile.motivation_confidence_score,
      knxw_last_updated: profile.last_analyzed
    };

    // Sync to Pardot API (v5)
    const { endpoint_url, api_key } = config.credentials;
    const businessUnitId = config.credentials.account_id;

    const response = await fetch(`${endpoint_url}/api/v5/objects/prospects/do/upsert/id/${email}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${api_key}`,
        'Pardot-Business-Unit-Id': businessUnitId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(prospectData)
    });

    const result = await response.json();

    // Update integration config
    await base44.entities.MarketingIntegrationConfig.update(config.id, {
      last_sync: new Date().toISOString(),
      last_error: response.ok ? null : JSON.stringify(result)
    });

    return Response.json({
      success: response.ok,
      pardot_response: result,
      synced_fields: Object.keys(prospectData),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error syncing to Pardot:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});