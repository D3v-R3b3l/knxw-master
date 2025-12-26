import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user_id, visitor_id, client_app_id } = await req.json();

    if (!user_id || !visitor_id) {
      return Response.json({ error: 'user_id and visitor_id are required' }, { status: 400 });
    }

    // Get integration config
    const configs = await base44.entities.MarketingIntegrationConfig.filter({
      client_app_id,
      integration_type: 'adobe_analytics',
      status: 'active'
    }, null, 1);

    if (configs.length === 0) {
      return Response.json({ error: 'Adobe Analytics integration not configured' }, { status: 404 });
    }

    const config = configs[0];

    // Get psychographic profile
    const profiles = await base44.entities.UserPsychographicProfile.filter({ user_id }, '-last_analyzed', 1);
    
    if (profiles.length === 0) {
      return Response.json({ error: 'No psychographic profile found' }, { status: 404 });
    }

    const profile = profiles[0];

    // Prepare Adobe Analytics Data Insertion API payload
    const payload = {
      rows: [{
        visitorId: visitor_id,
        timestamp: new Date().toISOString(),
        reportSuiteId: config.credentials.account_id,
        eVars: {
          eVar1: profile.risk_profile,
          eVar2: profile.cognitive_style,
          eVar3: profile.emotional_state?.mood,
          eVar4: profile.emotional_state?.energy_level,
          eVar5: profile.motivation_labels?.[0],
          eVar6: (profile.personality_traits?.openness || 0).toFixed(2),
          eVar7: (profile.personality_traits?.conscientiousness || 0).toFixed(2),
          eVar8: (profile.personality_traits?.extraversion || 0).toFixed(2)
        },
        props: {
          prop1: `knxw_profile_${user_id}`,
          prop2: profile.last_analyzed
        }
      }]
    };

    // Send to Adobe Analytics Data Insertion API
    const { endpoint_url, api_key, api_secret } = config.credentials;

    const response = await fetch(`${endpoint_url}/b/ss/${config.credentials.account_id}/0`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${api_key}`,
        'Content-Type': 'application/json',
        'x-api-key': api_key
      },
      body: JSON.stringify(payload)
    });

    const result = response.ok ? { success: true } : await response.json();

    // Update integration config
    await base44.entities.MarketingIntegrationConfig.update(config.id, {
      last_sync: new Date().toISOString(),
      last_error: response.ok ? null : JSON.stringify(result)
    });

    return Response.json({
      success: response.ok,
      adobe_response: result,
      synced_evars: Object.keys(payload.rows[0].eVars).length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error syncing to Adobe Analytics:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});