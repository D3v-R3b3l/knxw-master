import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const PIPEDRIVE_API_BASE = 'https://api.pipedrive.com/v1';

/**
 * Make authenticated request to Pipedrive API
 */
async function pipedriveRequest(apiToken, endpoint, method = 'GET', body = null) {
  const url = new URL(`${PIPEDRIVE_API_BASE}${endpoint}`);
  url.searchParams.set('api_token', apiToken);
  
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(url.toString(), options);
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(`Pipedrive API error: ${data.error || 'Unknown error'}`);
  }
  
  return data;
}

/**
 * Search for person by email
 */
async function findPersonByEmail(apiToken, email) {
  const result = await pipedriveRequest(apiToken, `/persons/search?term=${encodeURIComponent(email)}&fields=email`);
  return result.data?.items?.[0]?.item || null;
}

/**
 * Get or create custom fields for psychographic data
 */
async function ensureCustomFields(apiToken, fieldKeys) {
  const existingFields = await pipedriveRequest(apiToken, '/personFields');
  const existingKeyMap = {};
  
  for (const field of existingFields.data || []) {
    existingKeyMap[field.name] = field.key;
  }

  const requiredFields = [
    { name: 'knXw Risk Profile', field_type: 'varchar' },
    { name: 'knXw Cognitive Style', field_type: 'varchar' },
    { name: 'knXw Emotional Mood', field_type: 'varchar' },
    { name: 'knXw Motivation', field_type: 'varchar' },
    { name: 'knXw Last Analyzed', field_type: 'varchar' }
  ];

  const fieldKeyMap = { ...fieldKeys };

  for (const reqField of requiredFields) {
    if (!existingKeyMap[reqField.name]) {
      const created = await pipedriveRequest(apiToken, '/personFields', 'POST', reqField);
      fieldKeyMap[reqField.name.toLowerCase().replace(/\s+/g, '_')] = created.data.key;
    } else {
      fieldKeyMap[reqField.name.toLowerCase().replace(/\s+/g, '_')] = existingKeyMap[reqField.name];
    }
  }

  return fieldKeyMap;
}

/**
 * Create or update person with psychographic data
 */
async function upsertPerson(apiToken, email, profile, fieldKeys) {
  const personData = {
    email: [{ value: email, primary: true }],
    name: email.split('@')[0]
  };

  // Add psychographic fields
  if (fieldKeys.knxw_risk_profile) {
    personData[fieldKeys.knxw_risk_profile] = profile.risk_profile || '';
  }
  if (fieldKeys.knxw_cognitive_style) {
    personData[fieldKeys.knxw_cognitive_style] = profile.cognitive_style || '';
  }
  if (fieldKeys.knxw_emotional_mood) {
    personData[fieldKeys.knxw_emotional_mood] = profile.emotional_state?.mood || '';
  }
  if (fieldKeys.knxw_motivation) {
    personData[fieldKeys.knxw_motivation] = profile.motivation_stack_v2?.[0]?.label || '';
  }
  if (fieldKeys.knxw_last_analyzed) {
    personData[fieldKeys.knxw_last_analyzed] = profile.last_analyzed || new Date().toISOString();
  }

  const existingPerson = await findPersonByEmail(apiToken, email);

  if (existingPerson) {
    const result = await pipedriveRequest(apiToken, `/persons/${existingPerson.id}`, 'PUT', personData);
    return { action: 'updated', id: existingPerson.id, data: result.data };
  } else {
    const result = await pipedriveRequest(apiToken, '/persons', 'POST', personData);
    return { action: 'created', id: result.data.id, data: result.data };
  }
}

/**
 * Create deal with psychographic context
 */
async function createDealWithContext(apiToken, personId, profile, dealData) {
  const deal = {
    title: dealData.title || 'New Deal',
    person_id: personId,
    value: dealData.value || 0,
    currency: dealData.currency || 'USD',
    // Add note with psychographic insights
    ...dealData
  };

  const result = await pipedriveRequest(apiToken, '/deals', 'POST', deal);

  // Add note with psychographic context
  if (result.data?.id) {
    const noteContent = `**knXw Psychographic Insights**\n\n` +
      `Risk Profile: ${profile.risk_profile || 'Unknown'}\n` +
      `Cognitive Style: ${profile.cognitive_style || 'Unknown'}\n` +
      `Primary Motivation: ${profile.motivation_stack_v2?.[0]?.label || 'Unknown'}\n` +
      `Emotional State: ${profile.emotional_state?.mood || 'Unknown'}\n\n` +
      `*Recommendation: ${getSellingStrategy(profile)}*`;

    await pipedriveRequest(apiToken, '/notes', 'POST', {
      deal_id: result.data.id,
      content: noteContent
    });
  }

  return result.data;
}

/**
 * Generate selling strategy based on psychographic profile
 */
function getSellingStrategy(profile) {
  const strategies = {
    conservative: 'Focus on trust-building, provide extensive documentation and case studies. Avoid high-pressure tactics.',
    moderate: 'Balance value proposition with social proof. Allow time for consideration.',
    aggressive: 'Highlight innovation and exclusivity. Create urgency with limited offers.'
  };

  const cognitiveApproaches = {
    analytical: 'Present detailed data, ROI calculations, and comparison charts.',
    intuitive: 'Focus on vision and big-picture benefits. Use storytelling.',
    systematic: 'Provide step-by-step implementation plans and structured proposals.',
    creative: 'Emphasize customization options and unique applications.'
  };

  return `${strategies[profile.risk_profile] || strategies.moderate} ${cognitiveApproaches[profile.cognitive_style] || ''}`;
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
    const { action, client_app_id, email, user_id, deal_data } = await req.json();

    if (!client_app_id) {
      return Response.json({ error: 'client_app_id is required' }, { status: 400 });
    }

    // Get Pipedrive config
    const configs = await base44.entities.PipedriveIntegrationConfig.filter({ client_app_id });
    if (configs.length === 0) {
      return Response.json({ error: 'Pipedrive integration not configured' }, { status: 400 });
    }

    const config = configs[0];
    if (config.status !== 'active') {
      return Response.json({ error: 'Pipedrive integration is not active' }, { status: 400 });
    }

    const { api_token, custom_field_keys } = config;

    switch (action) {
      case 'validate': {
        try {
          const user = await pipedriveRequest(api_token, '/users/me');
          return Response.json({
            status: 'success',
            data: {
              user_name: user.data.name,
              company_name: user.data.company_name,
              company_domain: user.data.company_domain
            }
          });
        } catch (error) {
          return Response.json({ status: 'error', error: error.message }, { status: 400 });
        }
      }

      case 'setup_fields': {
        try {
          const fieldKeys = await ensureCustomFields(api_token, custom_field_keys || {});
          
          await base44.entities.PipedriveIntegrationConfig.update(config.id, {
            custom_field_keys: fieldKeys
          });

          return Response.json({
            status: 'success',
            message: 'Custom fields created/verified',
            data: { field_keys: fieldKeys }
          });
        } catch (error) {
          return Response.json({ status: 'error', error: error.message }, { status: 400 });
        }
      }

      case 'sync_profile': {
        if (!email) {
          return Response.json({ error: 'email is required' }, { status: 400 });
        }

        let profile;
        if (user_id) {
          const profiles = await base44.entities.UserPsychographicProfile.filter({ user_id });
          profile = profiles[0];
        }

        if (!profile) {
          return Response.json({ error: 'No psychographic profile found' }, { status: 404 });
        }

        const fieldKeys = config.custom_field_keys || {};
        const result = await upsertPerson(api_token, email, profile, fieldKeys);

        return Response.json({
          status: 'success',
          message: `Person ${result.action} in Pipedrive`,
          data: result
        });
      }

      case 'create_deal': {
        if (!email) {
          return Response.json({ error: 'email is required' }, { status: 400 });
        }

        let profile;
        if (user_id) {
          const profiles = await base44.entities.UserPsychographicProfile.filter({ user_id });
          profile = profiles[0];
        }

        if (!profile) {
          return Response.json({ error: 'No psychographic profile found' }, { status: 404 });
        }

        // First ensure person exists
        const fieldKeys = config.custom_field_keys || {};
        const person = await upsertPerson(api_token, email, profile, fieldKeys);
        
        // Create deal with context
        const deal = await createDealWithContext(api_token, person.id, profile, deal_data || {});

        return Response.json({
          status: 'success',
          message: 'Deal created with psychographic context',
          data: { person_id: person.id, deal }
        });
      }

      case 'get_selling_strategy': {
        if (!user_id) {
          return Response.json({ error: 'user_id is required' }, { status: 400 });
        }

        const profiles = await base44.entities.UserPsychographicProfile.filter({ user_id });
        const profile = profiles[0];

        if (!profile) {
          return Response.json({ error: 'No psychographic profile found' }, { status: 404 });
        }

        return Response.json({
          status: 'success',
          data: {
            profile_summary: {
              risk_profile: profile.risk_profile,
              cognitive_style: profile.cognitive_style,
              primary_motivation: profile.motivation_stack_v2?.[0]?.label
            },
            selling_strategy: getSellingStrategy(profile)
          }
        });
      }

      case 'batch_sync': {
        const profiles = await base44.entities.UserPsychographicProfile.filter({}, '-last_analyzed', 50);
        const fieldKeys = config.custom_field_keys || {};
        
        let syncedCount = 0;
        let errorCount = 0;
        const errors = [];

        for (const profile of profiles) {
          try {
            const userEmail = `user_${profile.user_id}@example.com`;
            await upsertPerson(api_token, userEmail, profile, fieldKeys);
            syncedCount++;
          } catch (error) {
            errorCount++;
            errors.push({ user_id: profile.user_id, error: error.message });
          }
        }

        await base44.entities.PipedriveIntegrationConfig.update(config.id, {
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
    console.error('Pipedrive sync error:', error);
    return Response.json({ 
      status: 'error', 
      message: 'Failed to process Pipedrive request',
      error: error.message 
    }, { status: 500 });
  }
});