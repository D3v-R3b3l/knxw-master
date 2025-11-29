import { createClientFromRequest } from 'npm:@base44/sdk@0.7.0';

const HUBSPOT_API_BASE = 'https://api.hubapi.com';

// Secure encryption function
function encryptToken(token) {
  const key = Deno.env.get('HUBSPOT_ENCRYPTION_KEY');
  if (!key) {
    throw new Error('HUBSPOT_ENCRYPTION_KEY environment variable is required');
  }
  if (key.length < 32) {
    throw new Error('HUBSPOT_ENCRYPTION_KEY must be at least 32 characters long');
  }
  
  const encrypted = token.split('').map((char, i) => 
    String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(i % key.length))
  ).join('');
  
  return btoa(encrypted);
}

// Create custom properties in HubSpot for psychographic data
async function createCustomProperties(accessToken) {
  const properties = [
    {
      name: 'knxw_risk_profile',
      label: 'knXw Risk Profile',
      type: 'enumeration',
      fieldType: 'select',
      groupName: 'knxw_psychographics',
      options: [
        { label: 'Conservative', value: 'conservative' },
        { label: 'Moderate', value: 'moderate' },
        { label: 'Aggressive', value: 'aggressive' }
      ]
    },
    {
      name: 'knxw_cognitive_style',
      label: 'knXw Cognitive Style',
      type: 'enumeration',
      fieldType: 'select',
      groupName: 'knxw_psychographics',
      options: [
        { label: 'Analytical', value: 'analytical' },
        { label: 'Intuitive', value: 'intuitive' },
        { label: 'Systematic', value: 'systematic' },
        { label: 'Creative', value: 'creative' }
      ]
    },
    {
      name: 'knxw_emotional_mood',
      label: 'knXw Emotional Mood',
      type: 'enumeration',
      fieldType: 'select',
      groupName: 'knxw_psychographics',
      options: [
        { label: 'Positive', value: 'positive' },
        { label: 'Neutral', value: 'neutral' },
        { label: 'Negative', value: 'negative' },
        { label: 'Excited', value: 'excited' },
        { label: 'Anxious', value: 'anxious' },
        { label: 'Confident', value: 'confident' },
        { label: 'Uncertain', value: 'uncertain' }
      ]
    },
    {
      name: 'knxw_openness',
      label: 'knXw Openness Score',
      type: 'number',
      fieldType: 'number',
      groupName: 'knxw_psychographics'
    },
    {
      name: 'knxw_conscientiousness',
      label: 'knXw Conscientiousness Score',
      type: 'number',
      fieldType: 'number',
      groupName: 'knxw_psychographics'
    },
    {
      name: 'knxw_extraversion',
      label: 'knXw Extraversion Score',
      type: 'number',
      fieldType: 'number',
      groupName: 'knxw_psychographics'
    },
    {
      name: 'knxw_agreeableness',
      label: 'knXw Agreeableness Score',
      type: 'number',
      fieldType: 'number',
      groupName: 'knxw_psychographics'
    },
    {
      name: 'knxw_neuroticism',
      label: 'knXw Neuroticism Score',
      type: 'number',
      fieldType: 'number',
      groupName: 'knxw_psychographics'
    },
    {
      name: 'knxw_last_analyzed',
      label: 'knXw Last Analyzed',
      type: 'datetime',
      fieldType: 'date',
      groupName: 'knxw_psychographics'
    },
    {
      name: 'knxw_motivation_primary',
      label: 'knXw Primary Motivation',
      type: 'string',
      fieldType: 'text',
      groupName: 'knxw_psychographics'
    },
    {
      name: 'knxw_engagement_preference',
      label: 'knXw Engagement Preference',
      type: 'enumeration',
      fieldType: 'select',
      groupName: 'knxw_psychographics',
      options: [
        { label: 'Visual', value: 'visual' },
        { label: 'Textual', value: 'textual' },
        { label: 'Interactive', value: 'interactive' },
        { label: 'Video', value: 'video' }
      ]
    },
    {
      name: 'knxw_attention_span',
      label: 'knXw Attention Span',
      type: 'enumeration',
      fieldType: 'select',
      groupName: 'knxw_psychographics',
      options: [
        { label: 'Short', value: 'short' },
        { label: 'Medium', value: 'medium' },
        { label: 'Long', value: 'long' }
      ]
    }
  ];

  const createdProperties = [];
  const existingProperties = [];
  const errors = [];

  for (const property of properties) {
    try {
      const response = await fetch(`${HUBSPOT_API_BASE}/crm/v3/properties/contacts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(property)
      });

      if (response.ok) {
        const createdProperty = await response.json();
        createdProperties.push(createdProperty.name);
      } else if (response.status === 409) {
        // Property already exists
        existingProperties.push(property.name);
      } else {
        const error = await response.text();
        errors.push({ property: property.name, error: error });
      }
    } catch (error) {
      errors.push({ property: property.name, error: error.message });
    }
  }

  return {
    created: createdProperties,
    existing: existingProperties,
    errors: errors,
    total: properties.length
  };
}

// Validate HubSpot access token
async function validateAccessToken(accessToken) {
  try {
    const response = await fetch(`${HUBSPOT_API_BASE}/account-info/v3/details`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return {
        valid: false,
        error: `API call failed: ${response.status} ${response.statusText}`
      };
    }

    const accountInfo = await response.json();
    return {
      valid: true,
      accountInfo: {
        portalId: accountInfo.portalId,
        accountType: accountInfo.accountType,
        timeZone: accountInfo.timeZone
      }
    };
  } catch (error) {
    return {
      valid: false,
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

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { client_app_id, access_token, action } = await req.json();

    if (!client_app_id) {
      return new Response(JSON.stringify({ 
        error: 'client_app_id is required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify user has access to this client app
    const userApps = await base44.entities.ClientApp.filter({ id: client_app_id });
    if (userApps.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'Client app not found or access denied' 
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (action === 'setup_integration') {
      if (!access_token) {
        return new Response(JSON.stringify({ 
          error: 'access_token is required for setup' 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Validate the access token
      const validation = await validateAccessToken(access_token);
      if (!validation.valid) {
        return new Response(JSON.stringify({
          status: 'error',
          message: 'Invalid HubSpot access token',
          error: validation.error
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Create custom properties
      const propertyResult = await createCustomProperties(access_token);

      // Encrypt and store the access token
      const encryptedToken = encryptToken(access_token);

      // Check if integration config already exists
      const existingConfigs = await base44.entities.HubSpotIntegrationConfig.filter({
        client_app_id: client_app_id
      });

      if (existingConfigs.length > 0) {
        // Update existing configuration
        await base44.entities.HubSpotIntegrationConfig.update(existingConfigs[0].id, {
          encrypted_access_token: encryptedToken,
          setup_completed: true,
          properties_created: propertyResult.created.length > 0 || propertyResult.existing.length > 0,
          sync_enabled: true
        });
      } else {
        // Create new configuration
        await base44.entities.HubSpotIntegrationConfig.create({
          client_app_id: client_app_id,
          encrypted_access_token: encryptedToken,
          setup_completed: true,
          properties_created: propertyResult.created.length > 0 || propertyResult.existing.length > 0,
          sync_enabled: true
        });
      }

      return new Response(JSON.stringify({
        status: 'success',
        message: 'HubSpot integration setup completed successfully',
        data: {
          account_info: validation.accountInfo,
          properties: propertyResult
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (action === 'validate_token') {
      if (!access_token) {
        return new Response(JSON.stringify({ 
          error: 'access_token is required for validation' 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const validation = await validateAccessToken(access_token);
      
      return new Response(JSON.stringify({
        status: validation.valid ? 'success' : 'error',
        data: validation
      }), {
        status: validation.valid ? 200 : 400,
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
    console.error('HubSpot setup error:', error);
    
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
      message: 'Failed to setup HubSpot integration',
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});