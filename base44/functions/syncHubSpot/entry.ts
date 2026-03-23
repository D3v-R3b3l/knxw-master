import { createClientFromRequest } from 'npm:@base44/sdk@0.7.0';

// Production HubSpot API endpoints
const HUBSPOT_API_BASE = 'https://api.hubapi.com';

// Secure decryption function - requires proper environment variable
function decryptToken(encryptedToken) {
  const key = Deno.env.get('HUBSPOT_ENCRYPTION_KEY');
  if (!key) {
    throw new Error('HUBSPOT_ENCRYPTION_KEY environment variable is required');
  }
  if (key.length < 32) {
    throw new Error('HUBSPOT_ENCRYPTION_KEY must be at least 32 characters long');
  }
  
  const decoded = atob(encryptedToken);
  return decoded.split('').map((char, i) => 
    String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(i % key.length))
  ).join('');
}

// Create or update HubSpot contact with psychographic data
async function syncContactToHubSpot(accessToken, profile, email) {
  const contactData = {
    properties: {
      email: email,
      knxw_risk_profile: profile.risk_profile || '',
      knxw_cognitive_style: profile.cognitive_style || '',
      knxw_emotional_mood: profile.emotional_state?.mood || '',
      knxw_openness: profile.personality_traits?.openness ? Math.round(profile.personality_traits.openness * 100) : null,
      knxw_conscientiousness: profile.personality_traits?.conscientiousness ? Math.round(profile.personality_traits.conscientiousness * 100) : null,
      knxw_extraversion: profile.personality_traits?.extraversion ? Math.round(profile.personality_traits.extraversion * 100) : null,
      knxw_agreeableness: profile.personality_traits?.agreeableness ? Math.round(profile.personality_traits.agreeableness * 100) : null,
      knxw_neuroticism: profile.personality_traits?.neuroticism ? Math.round(profile.personality_traits.neuroticism * 100) : null,
      knxw_last_analyzed: profile.last_analyzed || new Date().toISOString(),
      knxw_motivation_primary: profile.motivation_stack?.[0] || '',
      knxw_engagement_preference: profile.engagement_patterns?.preferred_content_type || '',
      knxw_attention_span: profile.engagement_patterns?.attention_span || ''
    }
  };

  // Remove null/undefined properties
  Object.keys(contactData.properties).forEach(key => {
    if (contactData.properties[key] === null || contactData.properties[key] === undefined) {
      delete contactData.properties[key];
    }
  });

  // First, try to find existing contact by email
  const searchResponse = await fetch(`${HUBSPOT_API_BASE}/crm/v3/objects/contacts/search`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      filterGroups: [{
        filters: [{
          propertyName: 'email',
          operator: 'EQ',
          value: email
        }]
      }],
      limit: 1
    })
  });

  if (!searchResponse.ok) {
    const error = await searchResponse.text();
    throw new Error(`HubSpot contact search failed: ${searchResponse.status} ${error}`);
  }

  const searchResult = await searchResponse.json();
  
  if (searchResult.results && searchResult.results.length > 0) {
    // Update existing contact
    const contactId = searchResult.results[0].id;
    const updateResponse = await fetch(`${HUBSPOT_API_BASE}/crm/v3/objects/contacts/${contactId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(contactData)
    });

    if (!updateResponse.ok) {
      const error = await updateResponse.text();
      throw new Error(`HubSpot contact update failed: ${updateResponse.status} ${error}`);
    }

    const updatedContact = await updateResponse.json();
    return {
      action: 'updated',
      contactId: updatedContact.id,
      email: email
    };
  } else {
    // Create new contact
    const createResponse = await fetch(`${HUBSPOT_API_BASE}/crm/v3/objects/contacts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(contactData)
    });

    if (!createResponse.ok) {
      const error = await createResponse.text();
      throw new Error(`HubSpot contact creation failed: ${createResponse.status} ${error}`);
    }

    const newContact = await createResponse.json();
    return {
      action: 'created',
      contactId: newContact.id,
      email: email
    };
  }
}

// Validate HubSpot API access and custom properties
async function validateHubSpotAccess(accessToken) {
  try {
    // Test API access by getting account info
    const accountResponse = await fetch(`${HUBSPOT_API_BASE}/account-info/v3/details`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!accountResponse.ok) {
      throw new Error(`HubSpot API access failed: ${accountResponse.status}`);
    }

    const accountInfo = await accountResponse.json();

    // Check if our custom properties exist
    const propertiesResponse = await fetch(`${HUBSPOT_API_BASE}/crm/v3/properties/contacts`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!propertiesResponse.ok) {
      throw new Error(`HubSpot properties check failed: ${propertiesResponse.status}`);
    }

    const properties = await propertiesResponse.json();
    const existingProperties = properties.results.map(p => p.name);
    
    const requiredProperties = [
      'knxw_risk_profile',
      'knxw_cognitive_style', 
      'knxw_emotional_mood',
      'knxw_openness',
      'knxw_conscientiousness',
      'knxw_extraversion',
      'knxw_agreeableness',
      'knxw_neuroticism',
      'knxw_last_analyzed'
    ];

    const missingProperties = requiredProperties.filter(prop => !existingProperties.includes(prop));

    return {
      success: true,
      accountInfo: {
        portalId: accountInfo.portalId,
        accountType: accountInfo.accountType
      },
      customProperties: {
        total: existingProperties.length,
        knxwProperties: requiredProperties.filter(prop => existingProperties.includes(prop)).length,
        missing: missingProperties
      }
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  if (!(await base44.auth.isAuthenticated())) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { action, client_app_id, email, profile, validate_only } = await req.json();

    if (!client_app_id) {
      return new Response(JSON.stringify({ 
        error: 'Missing required field: client_app_id' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify user has access to this client app
    const userApps = await base44.entities.ClientApp.filter({ id: client_app_id });
    if (userApps.length === 0) {
      return new Response(JSON.stringify({ error: 'Client app not found or access denied' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Retrieve the stored HubSpot configuration
    const configs = await base44.entities.HubSpotIntegrationConfig.filter({
      client_app_id: client_app_id
    });

    if (configs.length === 0) {
      return new Response(JSON.stringify({
        status: 'error',
        message: 'HubSpot integration not configured. Please set up the integration first.'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const config = configs[0];
    if (!config.setup_completed) {
      return new Response(JSON.stringify({
        status: 'error',
        message: 'HubSpot integration setup not completed. Please complete setup first.'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Decrypt the access token
    const hubspotAccessToken = decryptToken(config.encrypted_access_token);

    if (action === 'validate_access') {
      const validation = await validateHubSpotAccess(hubspotAccessToken);
      
      return new Response(JSON.stringify({
        status: validation.success ? 'success' : 'error',
        data: validation
      }), {
        status: validation.success ? 200 : 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (action === 'sync_profile') {
      if (!email || !profile) {
        return new Response(JSON.stringify({
          status: 'error',
          message: 'Email and profile are required for sync_profile action'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (validate_only) {
        const validation = await validateHubSpotAccess(hubspotAccessToken);
        return new Response(JSON.stringify({
          status: 'success',
          message: 'Validation completed',
          data: validation
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const syncResult = await syncContactToHubSpot(hubspotAccessToken, profile, email);

      // Log the sync
      await base44.entities.HubSpotSync.create({
        user_id: profile.user_id,
        email: email,
        client_app_id: client_app_id,
        hubspot_contact_id: syncResult.contactId,
        sync_data: profile,
        sync_status: 'success',
        synced_at: new Date().toISOString()
      });

      return new Response(JSON.stringify({
        status: 'success',
        message: `Contact ${syncResult.action} successfully in HubSpot`,
        data: syncResult
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (action === 'batch_sync') {
      // Get psychographic profiles for batch sync
      const profiles = await base44.entities.UserPsychographicProfile.filter({}, '-last_analyzed', 50);
      
      let syncedCount = 0;
      let errorCount = 0;
      const errors = [];

      for (const prof of profiles) {
        try {
          // Generate email from user_id for demo purposes
          // In production, you'd have a proper user email mapping
          const userEmail = `user_${prof.user_id}@example.com`;
          
          const syncResult = await syncContactToHubSpot(hubspotAccessToken, prof, userEmail);

          await base44.entities.HubSpotSync.create({
            user_id: prof.user_id,
            email: userEmail,
            client_app_id: client_app_id,
            hubspot_contact_id: syncResult.contactId,
            sync_data: prof,
            sync_status: 'success',
            synced_at: new Date().toISOString()
          });

          syncedCount++;
        } catch (error) {
          errorCount++;
          errors.push({
            user_id: prof.user_id,
            error: error.message
          });

          await base44.entities.HubSpotSync.create({
            user_id: prof.user_id,
            email: `user_${prof.user_id}@example.com`,
            client_app_id: client_app_id,
            sync_data: prof,
            sync_status: 'failed',
            error_details: error.message,
            synced_at: new Date().toISOString()
          });
        }
      }

      // Update last sync time
      await base44.entities.HubSpotIntegrationConfig.update(config.id, {
        last_sync: new Date().toISOString()
      });

      return new Response(JSON.stringify({
        status: 'success',
        message: 'Batch sync completed',
        data: {
          synced_count: syncedCount,
          error_count: errorCount,
          total_processed: profiles.length,
          errors: errors.slice(0, 10) // Return first 10 errors
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      status: 'error',
      message: 'Invalid action specified'
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('HubSpot sync error:', error);
    
    if (error.message.includes('HUBSPOT_ENCRYPTION_KEY')) {
      return new Response(JSON.stringify({
        status: 'error',
        message: 'Server configuration error. Please contact support.',
        error: 'Encryption key not properly configured'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      status: 'error',
      message: 'Failed to sync with HubSpot',
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});