import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const ZOHO_DATA_CENTERS = {
  us: 'https://www.zohoapis.com',
  eu: 'https://www.zohoapis.eu',
  in: 'https://www.zohoapis.in',
  au: 'https://www.zohoapis.com.au',
  jp: 'https://www.zohoapis.jp',
  cn: 'https://www.zohoapis.com.cn'
};

const ZOHO_ACCOUNTS_URL = {
  us: 'https://accounts.zoho.com',
  eu: 'https://accounts.zoho.eu',
  in: 'https://accounts.zoho.in',
  au: 'https://accounts.zoho.com.au',
  jp: 'https://accounts.zoho.jp',
  cn: 'https://accounts.zoho.com.cn'
};

/**
 * Refresh Zoho access token
 */
async function refreshAccessToken(config) {
  const accountsUrl = ZOHO_ACCOUNTS_URL[config.data_center || 'us'];
  
  const response = await fetch(`${accountsUrl}/oauth/v2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: config.refresh_token,
      client_id: config.client_id,
      client_secret: config.client_secret,
      grant_type: 'refresh_token'
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to refresh Zoho token: ${error}`);
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Make authenticated request to Zoho CRM API
 */
async function zohoRequest(accessToken, dataCenter, endpoint, method = 'GET', body = null) {
  const baseUrl = ZOHO_DATA_CENTERS[dataCenter || 'us'];
  
  const options = {
    method,
    headers: {
      'Authorization': `Zoho-oauthtoken ${accessToken}`,
      'Content-Type': 'application/json'
    }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(`${baseUrl}/crm/v5${endpoint}`, options);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Zoho CRM API error (${response.status}): ${errorText}`);
  }
  
  return response.json();
}

/**
 * Search for contact/lead by email
 */
async function findRecordByEmail(accessToken, dataCenter, module, email) {
  const result = await zohoRequest(
    accessToken, 
    dataCenter, 
    `/${module}/search?email=${encodeURIComponent(email)}`
  );
  return result.data?.[0] || null;
}

/**
 * Create or update contact with psychographic data
 */
async function upsertContact(accessToken, dataCenter, email, profile, customFieldMapping = {}) {
  const psychographicFields = {
    [customFieldMapping.risk_profile || 'knXw_Risk_Profile']: profile.risk_profile || '',
    [customFieldMapping.cognitive_style || 'knXw_Cognitive_Style']: profile.cognitive_style || '',
    [customFieldMapping.emotional_mood || 'knXw_Emotional_Mood']: profile.emotional_state?.mood || '',
    [customFieldMapping.motivation || 'knXw_Primary_Motivation']: profile.motivation_stack_v2?.[0]?.label || '',
    [customFieldMapping.openness || 'knXw_Openness']: profile.personality_traits?.openness ? Math.round(profile.personality_traits.openness * 100) : null,
    [customFieldMapping.conscientiousness || 'knXw_Conscientiousness']: profile.personality_traits?.conscientiousness ? Math.round(profile.personality_traits.conscientiousness * 100) : null,
    [customFieldMapping.extraversion || 'knXw_Extraversion']: profile.personality_traits?.extraversion ? Math.round(profile.personality_traits.extraversion * 100) : null,
    [customFieldMapping.last_analyzed || 'knXw_Last_Analyzed']: profile.last_analyzed || new Date().toISOString()
  };

  // Remove null values
  Object.keys(psychographicFields).forEach(key => {
    if (psychographicFields[key] === null || psychographicFields[key] === undefined || psychographicFields[key] === '') {
      delete psychographicFields[key];
    }
  });

  // Search for existing contact
  const existingContact = await findRecordByEmail(accessToken, dataCenter, 'Contacts', email);

  if (existingContact) {
    // Update existing
    const result = await zohoRequest(accessToken, dataCenter, '/Contacts', 'PUT', {
      data: [{
        id: existingContact.id,
        ...psychographicFields
      }]
    });
    return { action: 'updated', id: existingContact.id, result };
  } else {
    // Create new
    const result = await zohoRequest(accessToken, dataCenter, '/Contacts', 'POST', {
      data: [{
        Email: email,
        Last_Name: email.split('@')[0],
        ...psychographicFields
      }]
    });
    return { action: 'created', id: result.data?.[0]?.details?.id, result };
  }
}

/**
 * Upsert lead with psychographic data
 */
async function upsertLead(accessToken, dataCenter, email, profile, customFieldMapping = {}) {
  const psychographicFields = {
    [customFieldMapping.risk_profile || 'knXw_Risk_Profile']: profile.risk_profile || '',
    [customFieldMapping.cognitive_style || 'knXw_Cognitive_Style']: profile.cognitive_style || '',
    [customFieldMapping.emotional_mood || 'knXw_Emotional_Mood']: profile.emotional_state?.mood || '',
    [customFieldMapping.motivation || 'knXw_Primary_Motivation']: profile.motivation_stack_v2?.[0]?.label || ''
  };

  Object.keys(psychographicFields).forEach(key => {
    if (!psychographicFields[key]) delete psychographicFields[key];
  });

  const existingLead = await findRecordByEmail(accessToken, dataCenter, 'Leads', email);

  if (existingLead) {
    const result = await zohoRequest(accessToken, dataCenter, '/Leads', 'PUT', {
      data: [{ id: existingLead.id, ...psychographicFields }]
    });
    return { action: 'updated', id: existingLead.id, result };
  } else {
    const result = await zohoRequest(accessToken, dataCenter, '/Leads', 'POST', {
      data: [{
        Email: email,
        Last_Name: email.split('@')[0],
        Company: 'Unknown',
        ...psychographicFields
      }]
    });
    return { action: 'created', id: result.data?.[0]?.details?.id, result };
  }
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  if (!(await base44.auth.isAuthenticated())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { action, client_app_id, email, user_id, module } = await req.json();

    if (!client_app_id) {
      return Response.json({ error: 'client_app_id is required' }, { status: 400 });
    }

    // Get Zoho config
    const configs = await base44.entities.ZohoCRMIntegrationConfig.filter({ client_app_id });
    if (configs.length === 0) {
      return Response.json({ error: 'Zoho CRM integration not configured' }, { status: 400 });
    }

    const config = configs[0];
    if (config.status !== 'active') {
      return Response.json({ error: 'Zoho CRM integration is not active' }, { status: 400 });
    }

    // Refresh token if needed
    let accessToken = config.access_token;
    if (config.token_expires_at && new Date(config.token_expires_at) < new Date()) {
      accessToken = await refreshAccessToken(config);
      await base44.entities.ZohoCRMIntegrationConfig.update(config.id, {
        access_token: accessToken,
        token_expires_at: new Date(Date.now() + 3600000).toISOString() // 1 hour
      });
    }

    switch (action) {
      case 'validate': {
        try {
          const orgInfo = await zohoRequest(accessToken, config.data_center, '/org');
          return Response.json({
            status: 'success',
            data: {
              organization: orgInfo.org?.[0]?.company_name,
              country: orgInfo.org?.[0]?.country
            }
          });
        } catch (error) {
          return Response.json({ status: 'error', error: error.message }, { status: 400 });
        }
      }

      case 'sync_profile': {
        if (!email) {
          return Response.json({ error: 'email is required' }, { status: 400 });
        }

        // Get psychographic profile
        let profile;
        if (user_id) {
          const profiles = await base44.entities.UserPsychographicProfile.filter({ user_id });
          profile = profiles[0];
        }

        if (!profile) {
          return Response.json({ error: 'No psychographic profile found' }, { status: 404 });
        }

        const targetModule = module || 'Contacts';
        let result;

        if (targetModule === 'Leads' && config.sync_config?.sync_leads) {
          result = await upsertLead(accessToken, config.data_center, email, profile, config.custom_field_mapping);
        } else if (config.sync_config?.sync_contacts !== false) {
          result = await upsertContact(accessToken, config.data_center, email, profile, config.custom_field_mapping);
        } else {
          return Response.json({ error: 'Sync for this module is disabled' }, { status: 400 });
        }

        return Response.json({
          status: 'success',
          message: `${targetModule} ${result.action} in Zoho CRM`,
          data: result
        });
      }

      case 'batch_sync': {
        const profiles = await base44.entities.UserPsychographicProfile.filter({}, '-last_analyzed', 50);
        
        let syncedCount = 0;
        let errorCount = 0;
        const errors = [];

        for (const profile of profiles) {
          try {
            const userEmail = `user_${profile.user_id}@example.com`; // Replace with actual email lookup
            await upsertContact(accessToken, config.data_center, userEmail, profile, config.custom_field_mapping);
            syncedCount++;
          } catch (error) {
            errorCount++;
            errors.push({ user_id: profile.user_id, error: error.message });
          }
        }

        await base44.entities.ZohoCRMIntegrationConfig.update(config.id, {
          last_sync: new Date().toISOString()
        });

        return Response.json({
          status: 'success',
          message: 'Batch sync completed',
          data: { synced_count: syncedCount, error_count: errorCount, errors: errors.slice(0, 10) }
        });
      }

      default:
        return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

  } catch (error) {
    console.error('Zoho CRM sync error:', error);
    return Response.json({ 
      status: 'error', 
      message: 'Failed to process Zoho CRM request',
      error: error.message 
    }, { status: 500 });
  }
});