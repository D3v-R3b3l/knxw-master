import { createClientFromRequest } from 'npm:@base44/sdk@0.7.0';

// Meta CAPI endpoint
const META_CAPI_URL = 'https://graph.facebook.com/v18.0';

// Google Ads API endpoint
const GOOGLE_ADS_API_BASE = 'https://googleads.googleapis.com';
const GOOGLE_ADS_API_VERSION = 'v14';

/**
 * Send conversion to Meta Conversions API (CAPI)
 * @param {object} conversionData - Conversion data from knXw
 * @param {object} config - Meta CAPI configuration
 * @returns {Promise<object>} Meta CAPI response
 */
async function sendToMeta(conversionData, config) {
  const { pixel_id, access_token, test_event_code } = config;
  
  if (!pixel_id || !access_token) {
    throw new Error('Meta CAPI configuration incomplete. Missing pixel_id or access_token.');
  }

  // Convert knXw conversion data to Meta CAPI format
  const serverEvent = {
    event_name: conversionData.conversion_name || 'Purchase',
    event_time: Math.floor(new Date(conversionData.ts).getTime() / 1000),
    event_id: conversionData.order_id,
    action_source: 'website',
    
    // User data (if available)
    user_data: {
      ...(conversionData.email_hash && { em: [conversionData.email_hash] }),
      ...(conversionData.click_ids?.fbp && { fbp: conversionData.click_ids.fbp }),
      ...(conversionData.click_ids?.fbc && { fbc: conversionData.click_ids.fbc }),
      ...(conversionData.client_ip_address && { client_ip_address: conversionData.client_ip_address }),
      ...(conversionData.client_user_agent && { client_user_agent: conversionData.client_user_agent })
    },
    
    // Custom data
    custom_data: {
      currency: conversionData.currency,
      value: conversionData.amount,
      order_id: conversionData.order_id,
      ...(conversionData.attributes && { custom_properties: conversionData.attributes })
    },
    
    // Event source URL (if available)
    ...(conversionData.event_source_url && { event_source_url: conversionData.event_source_url })
  };

  const payload = {
    data: [serverEvent],
    ...(test_event_code && { test_event_code })
  };

  try {
    const response = await fetch(`${META_CAPI_URL}/${pixel_id}/events?access_token=${access_token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(`Meta CAPI error (${response.status}): ${responseData.error?.message || 'Unknown error'}`);
    }

    console.log(JSON.stringify({
      event: 'meta_conversion_sent',
      pixel_id: pixel_id,
      order_id: conversionData.order_id,
      events_received: responseData.events_received,
      messages: responseData.messages
    }));

    return {
      success: true,
      platform: 'meta',
      events_received: responseData.events_received,
      messages: responseData.messages,
      fbtrace_id: responseData.fbtrace_id
    };

  } catch (error) {
    console.error(JSON.stringify({
      event: 'meta_conversion_failed',
      pixel_id: pixel_id,
      order_id: conversionData.order_id,
      error: error.message
    }));
    
    throw error;
  }
}

/**
 * Send conversion to Google Ads API
 * @param {object} conversionData - Conversion data from knXw
 * @param {object} config - Google Ads configuration
 * @returns {Promise<object>} Google Ads API response
 */
async function sendToGoogle(conversionData, config) {
  const { customer_id, conversion_action_id, access_token, developer_token } = config;
  
  if (!customer_id || !conversion_action_id || !access_token || !developer_token) {
    throw new Error('Google Ads configuration incomplete. Missing required credentials.');
  }

  // Validate click ID presence
  if (!conversionData.click_ids?.gclid && !conversionData.click_ids?.gbraid && !conversionData.click_ids?.wbraid) {
    throw new Error('No Google click ID found. GCLID, GBRAID, or WBRAID required for Google Ads conversions.');
  }

  // Convert knXw conversion data to Google Ads format
  const clickConversion = {
    conversion_action: `customers/${customer_id}/conversionActions/${conversion_action_id}`,
    conversion_date_time: conversionData.ts,
    conversion_value: conversionData.amount,
    currency_code: conversionData.currency,
    order_id: conversionData.order_id,
    
    // Click identifier (prefer gclid, fallback to gbraid/wbraid)
    ...(conversionData.click_ids.gclid && { gclid: conversionData.click_ids.gclid }),
    ...(conversionData.click_ids.gbraid && !conversionData.click_ids.gclid && { gbraid: conversionData.click_ids.gbraid }),
    ...(conversionData.click_ids.wbraid && !conversionData.click_ids.gclid && !conversionData.click_ids.gbraid && { wbraid: conversionData.click_ids.wbraid }),
    
    // Additional custom variables if needed
    ...(conversionData.attributes?.custom_variables && { 
      custom_variables: Object.entries(conversionData.attributes.custom_variables).map(([tag, value]) => ({
        conversion_custom_variable: `customers/${customer_id}/conversionCustomVariables/${tag}`,
        value: value.toString()
      }))
    })
  };

  const payload = {
    conversions: [clickConversion],
    partial_failure: false
  };

  try {
    const response = await fetch(
      `${GOOGLE_ADS_API_BASE}/${GOOGLE_ADS_API_VERSION}/customers/${customer_id}:uploadClickConversions`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'developer-token': developer_token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      }
    );

    const responseData = await response.json();

    if (!response.ok) {
      const errorMessage = responseData.error?.message || 
        responseData.error?.details?.[0]?.errors?.[0]?.message || 
        'Unknown Google Ads API error';
      throw new Error(`Google Ads API error (${response.status}): ${errorMessage}`);
    }

    // Check for partial failures
    if (responseData.partialFailureError) {
      console.warn('Google Ads conversion partial failure:', responseData.partialFailureError);
    }

    console.log(JSON.stringify({
      event: 'google_ads_conversion_sent',
      customer_id: customer_id,
      conversion_action_id: conversion_action_id,
      order_id: conversionData.order_id,
      results_count: responseData.results?.length || 0
    }));

    return {
      success: true,
      platform: 'google_ads',
      results: responseData.results || [],
      partial_failure_error: responseData.partialFailureError
    };

  } catch (error) {
    console.error(JSON.stringify({
      event: 'google_ads_conversion_failed',
      customer_id: customer_id,
      order_id: conversionData.order_id,
      error: error.message
    }));
    
    throw error;
  }
}

/**
 * Enhanced conversion tracking with psychographic context
 * @param {object} conversionData - Base conversion data
 * @param {object} userProfile - User's psychographic profile
 * @returns {object} Enhanced conversion data with psychographic attributes
 */
function enhanceConversionWithPsychographics(conversionData, userProfile) {
  if (!userProfile) return conversionData;

  const enhancedData = {
    ...conversionData,
    attributes: {
      ...conversionData.attributes,
      
      // Add psychographic context as custom parameters
      knxw_cognitive_style: userProfile.cognitive_style,
      knxw_risk_profile: userProfile.risk_profile,
      knxw_emotional_mood: userProfile.emotional_state?.mood,
      knxw_openness_score: userProfile.personality_traits?.openness ? 
        Math.round(userProfile.personality_traits.openness * 100) : null,
      knxw_conscientiousness_score: userProfile.personality_traits?.conscientiousness ? 
        Math.round(userProfile.personality_traits.conscientiousness * 100) : null,
      knxw_engagement_preference: userProfile.engagement_patterns?.preferred_content_type,
      
      // Primary motivation
      knxw_primary_motivation: userProfile.motivation_stack?.[0],
      
      // Profile confidence
      knxw_profile_confidence: userProfile.profile_reasoning?.confidence_factors?.length || 0
    }
  };

  return enhancedData;
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
    const { 
      conversion_data, 
      platforms, 
      workspace_id, 
      include_psychographics = false,
      user_id
    } = await req.json();

    if (!conversion_data) {
      return new Response(JSON.stringify({
        status: 'error',
        message: 'conversion_data is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!platforms || platforms.length === 0) {
      return new Response(JSON.stringify({
        status: 'error',
        message: 'At least one platform must be specified'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get workspace secrets for ad platform credentials
    let workspaceSecrets = null;
    if (workspace_id) {
      try {
        const secrets = await base44.entities.WorkspaceSecret.filter({ workspace_id });
        workspaceSecrets = secrets[0];
      } catch (error) {
        console.warn('Failed to retrieve workspace secrets:', error);
      }
    }

    // Enhance conversion with psychographic data if requested
    let enhancedConversionData = conversion_data;
    if (include_psychographics && user_id) {
      try {
        const profiles = await base44.entities.UserPsychographicProfile.filter({ 
          user_id: user_id 
        }, '-last_analyzed', 1);
        
        if (profiles.length > 0) {
          enhancedConversionData = enhanceConversionWithPsychographics(conversion_data, profiles[0]);
        }
      } catch (error) {
        console.warn('Failed to enhance conversion with psychographics:', error);
        // Continue without psychographic enhancement
      }
    }

    const results = [];

    // Send to each requested platform
    for (const platform of platforms) {
      try {
        let result;
        
        if (platform === 'meta' && workspaceSecrets?.meta_pixel_id && workspaceSecrets?.meta_access_token) {
          result = await sendToMeta(enhancedConversionData, {
            pixel_id: workspaceSecrets.meta_pixel_id,
            access_token: workspaceSecrets.meta_access_token,
            test_event_code: workspaceSecrets.test_event_code
          });
          
        } else if (platform === 'google_ads' && workspaceSecrets?.google_ads_customer_id) {
          // Note: Google Ads requires additional setup for conversion actions
          result = await sendToGoogle(enhancedConversionData, {
            customer_id: workspaceSecrets.google_ads_customer_id,
            conversion_action_id: workspaceSecrets.google_ads_conversion_action_id,
            access_token: workspaceSecrets.google_oauth_credentials?.access_token,
            developer_token: workspaceSecrets.google_ads_dev_token
          });
          
        } else {
          result = {
            success: false,
            platform: platform,
            error: `Platform ${platform} not configured or credentials missing`
          };
        }

        results.push(result);

        // Log the send attempt
        if (workspace_id) {
          await base44.entities.AdPlatformSendLog.create({
            workspace_id: workspace_id,
            conversion_id: conversion_data.order_id,
            platform: platform === 'google_ads' ? 'google_ads_api' : 'meta_capi',
            status: result.success ? 'success' : 'failed',
            request_payload: enhancedConversionData,
            response_payload: result,
            error_message: result.success ? null : result.error,
            sent_at: new Date().toISOString()
          });
        }

      } catch (error) {
        const failedResult = {
          success: false,
          platform: platform,
          error: error.message
        };
        
        results.push(failedResult);

        // Log the failure
        if (workspace_id) {
          await base44.entities.AdPlatformSendLog.create({
            workspace_id: workspace_id,
            conversion_id: conversion_data.order_id,
            platform: platform === 'google_ads' ? 'google_ads_api' : 'meta_capi',
            status: 'failed',
            request_payload: enhancedConversionData,
            response_payload: failedResult,
            error_message: error.message,
            sent_at: new Date().toISOString()
          });
        }
      }
    }

    const successfulSends = results.filter(r => r.success);
    const failedSends = results.filter(r => !r.success);

    return new Response(JSON.stringify({
      status: 'success',
      message: `Conversion sent to ${successfulSends.length}/${platforms.length} platforms successfully`,
      data: {
        results: results,
        successful_count: successfulSends.length,
        failed_count: failedSends.length,
        conversion_id: conversion_data.order_id,
        psychographic_enhanced: include_psychographics && user_id
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Ad platform conversion error:', error);
    
    return new Response(JSON.stringify({
      status: 'error',
      message: 'Failed to send conversion to ad platforms',
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});