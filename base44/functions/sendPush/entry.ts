import { createClientFromRequest } from 'npm:@base44/sdk@0.7.0';

const ONESIGNAL_API_BASE = 'https://onesignal.com/api/v1';

/**
 * Send push notification via OneSignal API
 * @param {object} notificationData - Notification content and targeting
 * @returns {Promise<object>} Push notification result
 */
async function sendOneSignalPush(notificationData) {
  const appId = Deno.env.get('ONESIGNAL_APP_ID');
  const apiKey = Deno.env.get('ONESIGNAL_API_KEY');

  if (!appId || !apiKey) {
    throw new Error('OneSignal credentials not configured. Please set ONESIGNAL_APP_ID and ONESIGNAL_API_KEY environment variables.');
  }

  // Validate required notification data
  if (!notificationData.contents) {
    throw new Error('Notification contents are required');
  }

  // Prepare OneSignal notification payload
  const payload = {
    app_id: appId,
    contents: notificationData.contents,
    headings: notificationData.headings || {},
    
    // Targeting options
    ...(notificationData.include_player_ids && { include_player_ids: notificationData.include_player_ids }),
    ...(notificationData.included_segments && { included_segments: notificationData.included_segments }),
    ...(notificationData.filters && { filters: notificationData.filters }),
    
    // Notification options
    ...(notificationData.data && { data: notificationData.data }),
    ...(notificationData.url && { url: notificationData.url }),
    ...(notificationData.web_url && { web_url: notificationData.web_url }),
    ...(notificationData.app_url && { app_url: notificationData.app_url }),
    ...(notificationData.small_icon && { small_icon: notificationData.small_icon }),
    ...(notificationData.large_icon && { large_icon: notificationData.large_icon }),
    ...(notificationData.big_picture && { big_picture: notificationData.big_picture }),
    
    // Scheduling
    ...(notificationData.send_after && { send_after: notificationData.send_after }),
    ...(notificationData.delayed_option && { delayed_option: notificationData.delayed_option }),
    
    // Advanced options
    ...(notificationData.priority && { priority: notificationData.priority }),
    ...(notificationData.ttl && { ttl: notificationData.ttl }),
    ...(notificationData.collapse_id && { collapse_id: notificationData.collapse_id })
  };

  try {
    const response = await fetch(`${ONESIGNAL_API_BASE}/notifications`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const responseData = await response.json();

    if (!response.ok) {
      const errorMessage = responseData.errors ? 
        responseData.errors.map(e => e.message || e).join(', ') : 
        'Unknown OneSignal error';
      throw new Error(`OneSignal API error (${response.status}): ${errorMessage}`);
    }

    console.log(JSON.stringify({
      event: 'push_notification_sent',
      notification_id: responseData.id,
      recipients: responseData.recipients,
      external_id: responseData.external_id
    }));

    return {
      success: true,
      notification_id: responseData.id,
      recipients: responseData.recipients,
      external_id: responseData.external_id,
      errors: responseData.errors || []
    };

  } catch (error) {
    console.error(JSON.stringify({
      event: 'push_notification_failed',
      error: error.message,
      timestamp: new Date().toISOString()
    }));
    
    throw error;
  }
}

/**
 * Get push notification delivery status from OneSignal
 * @param {string} notificationId - OneSignal notification ID
 * @returns {Promise<object>} Notification status information
 */
async function getPushStatus(notificationId) {
  const appId = Deno.env.get('ONESIGNAL_APP_ID');
  const apiKey = Deno.env.get('ONESIGNAL_API_KEY');

  if (!appId || !apiKey) {
    throw new Error('OneSignal credentials not configured');
  }

  try {
    const response = await fetch(`${ONESIGNAL_API_BASE}/notifications/${notificationId}?app_id=${appId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(`OneSignal API error (${response.status}): ${responseData.errors?.[0] || 'Unknown error'}`);
    }

    return {
      success: true,
      notification_id: responseData.id,
      recipients: responseData.recipients,
      successful: responseData.successful,
      failed: responseData.failed,
      converted: responseData.converted,
      remaining: responseData.remaining,
      queued_at: responseData.queued_at,
      send_after: responseData.send_after,
      completed_at: responseData.completed_at,
      contents: responseData.contents,
      headings: responseData.headings
    };

  } catch (error) {
    console.error('Push notification status check failed:', error);
    throw error;
  }
}

/**
 * Validate OneSignal app configuration
 * @returns {Promise<object>} Validation result
 */
async function validateOneSignalApp() {
  const appId = Deno.env.get('ONESIGNAL_APP_ID');
  const apiKey = Deno.env.get('ONESIGNAL_API_KEY');

  if (!appId || !apiKey) {
    return {
      success: false,
      error: 'OneSignal credentials not configured'
    };
  }

  try {
    const response = await fetch(`${ONESIGNAL_API_BASE}/apps/${appId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    const responseData = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: `OneSignal API error: ${responseData.errors?.[0] || 'Unknown error'}`
      };
    }

    return {
      success: true,
      app_id: responseData.id,
      name: responseData.name,
      players: responseData.players,
      messageable_players: responseData.messageable_players,
      updated_at: responseData.updated_at,
      created_at: responseData.created_at,
      chrome_web_origin: responseData.chrome_web_origin,
      chrome_web_default_notification_icon: responseData.chrome_web_default_notification_icon,
      chrome_web_sub_domain: responseData.chrome_web_sub_domain
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Create psychographically personalized push notification
 * @param {object} userProfile - User's psychographic profile
 * @param {object} baseContent - Base notification content
 * @returns {object} Personalized notification content
 */
function personalizeNotificationContent(userProfile, baseContent) {
  const { cognitive_style, personality_traits, emotional_state, risk_profile } = userProfile;
  
  let personalizedContent = { ...baseContent };
  
  // Adapt messaging based on cognitive style
  if (cognitive_style === 'analytical') {
    // More data-driven, specific language
    if (personalizedContent.contents.en) {
      personalizedContent.contents.en = personalizedContent.contents.en
        .replace(/amazing/gi, 'significant')
        .replace(/incredible/gi, 'measurable')
        .replace(/!+/g, '.');
    }
    if (personalizedContent.headings?.en) {
      personalizedContent.headings.en += ' - Data Inside';
    }
  } else if (cognitive_style === 'creative') {
    // More expressive, engaging language
    if (personalizedContent.contents.en) {
      personalizedContent.contents.en = personalizedContent.contents.en
        .replace(/update/gi, 'breakthrough')
        .replace(/new/gi, 'innovative');
    }
    if (personalizedContent.headings?.en) {
      personalizedContent.headings.en += ' ✨';
    }
  } else if (cognitive_style === 'intuitive') {
    // Simpler, more direct language
    if (personalizedContent.contents.en && personalizedContent.contents.en.length > 100) {
      personalizedContent.contents.en = personalizedContent.contents.en.substring(0, 80) + '...';
    }
  }

  // Adjust urgency based on risk profile
  if (risk_profile === 'conservative') {
    // Remove aggressive call-to-actions
    if (personalizedContent.contents.en) {
      personalizedContent.contents.en = personalizedContent.contents.en
        .replace(/act now/gi, 'learn more')
        .replace(/limited time/gi, 'available now');
    }
  } else if (risk_profile === 'aggressive') {
    // Add urgency
    if (personalizedContent.headings?.en && !personalizedContent.headings.en.includes('!')) {
      personalizedContent.headings.en += '!';
    }
  }

  // Adapt based on emotional state
  if (emotional_state?.mood === 'anxious') {
    // More reassuring tone
    if (personalizedContent.contents.en) {
      personalizedContent.contents.en = 'Good news: ' + personalizedContent.contents.en;
    }
  } else if (emotional_state?.mood === 'excited') {
    // Match the energy
    if (personalizedContent.headings?.en && !personalizedContent.headings.en.includes('!')) {
      personalizedContent.headings.en += '!';
    }
  }

  // Add personalization metadata
  personalizedContent.data = {
    ...personalizedContent.data,
    cognitive_style_adapted: cognitive_style,
    risk_profile_adapted: risk_profile,
    personalized_at: new Date().toISOString()
  };

  return personalizedContent;
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
    const { action, notification_data, notification_id, user_profile, targeting } = await req.json();

    switch (action) {
      case 'send_push': {
        if (!notification_data) {
          return new Response(JSON.stringify({
            status: 'error',
            message: 'notification_data is required'
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        const result = await sendOneSignalPush(notification_data);

        return new Response(JSON.stringify({
          status: 'success',
          message: 'Push notification sent successfully',
          data: result
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      case 'send_personalized_push': {
        if (!notification_data || !user_profile) {
          return new Response(JSON.stringify({
            status: 'error',
            message: 'Both notification_data and user_profile are required for personalized notifications'
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        // Personalize content based on psychographic profile
        const personalizedNotification = personalizeNotificationContent(user_profile, notification_data);
        
        const result = await sendOneSignalPush(personalizedNotification);

        return new Response(JSON.stringify({
          status: 'success',
          message: 'Personalized push notification sent successfully',
          data: {
            ...result,
            personalized: true,
            cognitive_style_adapted: user_profile.cognitive_style,
            risk_profile_adapted: user_profile.risk_profile
          }
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      case 'send_segment_push': {
        // Send to all users in a specific psychographic segment
        if (!notification_data || !targeting) {
          return new Response(JSON.stringify({
            status: 'error',
            message: 'Both notification_data and targeting criteria are required'
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        // Create OneSignal filters based on psychographic targeting
        const filters = [];
        
        if (targeting.cognitive_style) {
          filters.push({
            field: "tag",
            key: "cognitive_style",
            relation: "=",
            value: targeting.cognitive_style
          });
        }

        if (targeting.risk_profile) {
          if (filters.length > 0) filters.push({ operator: "AND" });
          filters.push({
            field: "tag",
            key: "risk_profile", 
            relation: "=",
            value: targeting.risk_profile
          });
        }

        if (targeting.personality_trait) {
          if (filters.length > 0) filters.push({ operator: "AND" });
          filters.push({
            field: "tag",
            key: targeting.personality_trait.trait,
            relation: targeting.personality_trait.operator || ">",
            value: targeting.personality_trait.threshold.toString()
          });
        }

        const segmentNotification = {
          ...notification_data,
          filters: filters.length > 0 ? filters : undefined
        };

        const result = await sendOneSignalPush(segmentNotification);

        return new Response(JSON.stringify({
          status: 'success',
          message: 'Segment-targeted push notification sent successfully',
          data: {
            ...result,
            segment_targeted: true,
            targeting_criteria: targeting
          }
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      case 'get_push_status': {
        if (!notification_id) {
          return new Response(JSON.stringify({
            status: 'error',
            message: 'notification_id is required'
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        const status = await getPushStatus(notification_id);

        return new Response(JSON.stringify({
          status: 'success',
          message: 'Push notification status retrieved successfully',
          data: status
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      case 'validate_app': {
        const validation = await validateOneSignalApp();

        return new Response(JSON.stringify({
          status: validation.success ? 'success' : 'error',
          message: validation.success ? 'OneSignal app validated successfully' : validation.error,
          data: validation
        }), {
          status: validation.success ? 200 : 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      default:
        return new Response(JSON.stringify({
          status: 'error',
          message: `Unknown action: ${action}`
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
    }

  } catch (error) {
    console.error('Push notification function error:', error);
    
    return new Response(JSON.stringify({
      status: 'error',
      message: 'Failed to process push notification request',
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});