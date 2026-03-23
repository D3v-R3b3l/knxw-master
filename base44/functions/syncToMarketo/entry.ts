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
      integration_type: 'marketo',
      status: 'active'
    }, null, 1);

    if (configs.length === 0) {
      return Response.json({ error: 'Marketo integration not configured' }, { status: 404 });
    }

    const config = configs[0];

    // Get psychographic profile
    const profiles = await base44.entities.UserPsychographicProfile.filter({ user_id }, '-last_analyzed', 1);
    
    if (profiles.length === 0) {
      return Response.json({ error: 'No psychographic profile found' }, { status: 404 });
    }

    const profile = profiles[0];

    // Prepare Marketo lead data
    const leadData = {
      email,
      psychographic_risk_profile: profile.risk_profile,
      psychographic_cognitive_style: profile.cognitive_style,
      psychographic_openness: profile.personality_traits?.openness,
      psychographic_conscientiousness: profile.personality_traits?.conscientiousness,
      psychographic_extraversion: profile.personality_traits?.extraversion,
      psychographic_emotional_mood: profile.emotional_state?.mood,
      psychographic_energy_level: profile.emotional_state?.energy_level,
      psychographic_primary_motivation: profile.motivation_labels?.[0] || null,
      psychographic_last_analyzed: profile.last_analyzed
    };

    // Sync to Marketo REST API
    const marketoEndpoint = config.credentials.endpoint_url;
    const accessToken = await getMarketoAccessToken(config);

    const response = await fetch(`${marketoEndpoint}/rest/v1/leads.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'createOrUpdate',
        lookupField: 'email',
        input: [leadData]
      })
    });

    const result = await response.json();

    // Update integration config
    await base44.entities.MarketingIntegrationConfig.update(config.id, {
      last_sync: new Date().toISOString(),
      last_error: result.success ? null : JSON.stringify(result.errors)
    });

    return Response.json({
      success: result.success,
      marketo_response: result,
      synced_fields: Object.keys(leadData),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error syncing to Marketo:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function getMarketoAccessToken(config) {
  const { endpoint_url, api_key, api_secret } = config.credentials;
  
  const tokenResponse = await fetch(`${endpoint_url}/identity/oauth/token?grant_type=client_credentials&client_id=${api_key}&client_secret=${api_secret}`);
  const tokenData = await tokenResponse.json();
  
  return tokenData.access_token;
}