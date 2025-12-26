import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user_id, email, client_app_id, subscriber_key } = await req.json();

    if (!user_id || !email) {
      return Response.json({ error: 'user_id and email are required' }, { status: 400 });
    }

    // Get integration config
    const configs = await base44.entities.MarketingIntegrationConfig.filter({
      client_app_id,
      integration_type: 'salesforce_marketing_cloud',
      status: 'active'
    }, null, 1);

    if (configs.length === 0) {
      return Response.json({ error: 'Salesforce Marketing Cloud integration not configured' }, { status: 404 });
    }

    const config = configs[0];

    // Get psychographic profile
    const profiles = await base44.entities.UserPsychographicProfile.filter({ user_id }, '-last_analyzed', 1);
    
    if (profiles.length === 0) {
      return Response.json({ error: 'No psychographic profile found' }, { status: 404 });
    }

    const profile = profiles[0];

    // Prepare Marketing Cloud subscriber attributes
    const attributes = [
      { Name: 'EmailAddress', Value: email },
      { Name: 'SubscriberKey', Value: subscriber_key || email },
      { Name: 'knxw_risk_profile', Value: profile.risk_profile },
      { Name: 'knxw_cognitive_style', Value: profile.cognitive_style },
      { Name: 'knxw_emotional_mood', Value: profile.emotional_state?.mood },
      { Name: 'knxw_energy_level', Value: profile.emotional_state?.energy_level },
      { Name: 'knxw_primary_motivation', Value: profile.motivation_labels?.[0] },
      { Name: 'knxw_openness', Value: (profile.personality_traits?.openness || 0).toFixed(2) },
      { Name: 'knxw_extraversion', Value: (profile.personality_traits?.extraversion || 0).toFixed(2) },
      { Name: 'knxw_last_analyzed', Value: profile.last_analyzed }
    ];

    // Get OAuth token for Marketing Cloud
    const accessToken = await getMarketingCloudToken(config);

    // Update subscriber via REST API
    const response = await fetch(`${config.credentials.endpoint_url}/contacts/v1/contacts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contactKey: subscriber_key || email,
        attributeSets: [{
          name: 'Email Demographics',
          items: attributes.map(attr => ({
            values: [{ name: attr.Name, value: attr.Value }]
          }))
        }]
      })
    });

    const result = await response.json();

    // Update integration config
    await base44.entities.MarketingIntegrationConfig.update(config.id, {
      last_sync: new Date().toISOString(),
      last_error: response.ok ? null : JSON.stringify(result)
    });

    return Response.json({
      success: response.ok,
      sfmc_response: result,
      synced_attributes: attributes.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error syncing to Salesforce Marketing Cloud:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function getMarketingCloudToken(config) {
  const { api_key, api_secret, endpoint_url } = config.credentials;
  
  const tokenResponse = await fetch(`${endpoint_url}/v2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: api_key,
      client_secret: api_secret
    })
  });
  
  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}