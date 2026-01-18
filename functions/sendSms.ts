import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const TWILIO_API_BASE = 'https://api.twilio.com/2010-04-01';

/**
 * Send SMS via Twilio API
 * @param {string} to - Recipient phone number in E.164 format
 * @param {string} message - SMS message content
 * @param {object} options - Additional options
 * @returns {Promise<object>} SMS sending result
 */
async function sendTwilioSMS(to, message, options = {}) {
  const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
  const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
  const fromNumber = options.from || Deno.env.get('TWILIO_FROM_NUMBER');

  if (!accountSid || !authToken) {
    throw new Error('Twilio credentials not configured. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN environment variables.');
  }

  if (!fromNumber) {
    throw new Error('Twilio from number not configured. Please set TWILIO_FROM_NUMBER environment variable or provide in options.');
  }

  // Validate phone number format (basic E.164 validation)
  if (!to.match(/^\+[1-9]\d{1,14}$/)) {
    throw new Error('Invalid phone number format. Must be in E.164 format (e.g., +1234567890)');
  }

  // Validate message length (Twilio limit is 1600 characters for single message)
  if (message.length > 1600) {
    throw new Error('Message too long. Maximum length is 1600 characters.');
  }

  // Prepare request body for Twilio API
  const requestBody = new URLSearchParams({
    To: to,
    From: fromNumber,
    Body: message,
    ...(options.statusCallback && { StatusCallback: options.statusCallback }),
    ...(options.messagingServiceSid && { MessagingServiceSid: options.messagingServiceSid })
  });

  // Create authorization header
  const credentials = btoa(`${accountSid}:${authToken}`);
  
  try {
    const response = await fetch(`${TWILIO_API_BASE}/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: requestBody.toString()
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(`Twilio API error (${response.status}): ${responseData.message || responseData.error_message || 'Unknown error'}`);
    }

    console.log(JSON.stringify({
      event: 'sms_sent_successfully',
      message_sid: responseData.sid,
      to: to,
      from: fromNumber,
      status: responseData.status,
      price: responseData.price,
      price_unit: responseData.price_unit
    }));

    return {
      success: true,
      message_sid: responseData.sid,
      status: responseData.status,
      to: responseData.to,
      from: responseData.from,
      body: responseData.body,
      num_segments: responseData.num_segments,
      price: responseData.price,
      price_unit: responseData.price_unit,
      date_created: responseData.date_created,
      date_updated: responseData.date_updated,
      account_sid: responseData.account_sid
    };

  } catch (error) {
    console.error(JSON.stringify({
      event: 'sms_send_failed',
      to: to,
      from: fromNumber,
      error: error.message,
      timestamp: new Date().toISOString()
    }));
    
    throw error;
  }
}

/**
 * Get SMS delivery status from Twilio
 * @param {string} messageSid - Twilio message SID
 * @returns {Promise<object>} Message status information
 */
async function getSMSStatus(messageSid) {
  const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
  const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');

  if (!accountSid || !authToken) {
    throw new Error('Twilio credentials not configured');
  }

  const credentials = btoa(`${accountSid}:${authToken}`);

  try {
    const response = await fetch(`${TWILIO_API_BASE}/Accounts/${accountSid}/Messages/${messageSid}.json`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      }
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(`Twilio API error (${response.status}): ${responseData.message || 'Unknown error'}`);
    }

    return {
      success: true,
      message_sid: responseData.sid,
      status: responseData.status,
      error_code: responseData.error_code,
      error_message: responseData.error_message,
      to: responseData.to,
      from: responseData.from,
      price: responseData.price,
      price_unit: responseData.price_unit,
      date_created: responseData.date_created,
      date_updated: responseData.date_updated
    };

  } catch (error) {
    console.error('SMS status check failed:', error);
    throw error;
  }
}

/**
 * Validate Twilio account and get account information
 * @returns {Promise<object>} Account validation result
 */
async function validateTwilioAccount() {
  const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
  const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');

  if (!accountSid || !authToken) {
    return {
      success: false,
      error: 'Twilio credentials not configured'
    };
  }

  const credentials = btoa(`${accountSid}:${authToken}`);

  try {
    const response = await fetch(`${TWILIO_API_BASE}/Accounts/${accountSid}.json`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      }
    });

    const responseData = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: `Twilio API error: ${responseData.message || 'Unknown error'}`
      };
    }

    return {
      success: true,
      account_sid: responseData.sid,
      friendly_name: responseData.friendly_name,
      status: responseData.status,
      type: responseData.type,
      date_created: responseData.date_created,
      date_updated: responseData.date_updated
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

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { action, to, message, options, message_sid } = await req.json();

    switch (action) {
      case 'send_sms': {
        if (!to || !message) {
          return new Response(JSON.stringify({
            status: 'error',
            message: 'Both "to" and "message" fields are required'
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        const result = await sendTwilioSMS(to, message, options || {});

        return new Response(JSON.stringify({
          status: 'success',
          message: 'SMS sent successfully',
          data: result
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      case 'get_sms_status': {
        if (!message_sid) {
          return new Response(JSON.stringify({
            status: 'error',
            message: 'message_sid is required'
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        const status = await getSMSStatus(message_sid);

        return new Response(JSON.stringify({
          status: 'success',
          message: 'SMS status retrieved successfully',
          data: status
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      case 'validate_account': {
        const validation = await validateTwilioAccount();

        return new Response(JSON.stringify({
          status: validation.success ? 'success' : 'error',
          message: validation.success ? 'Account validated successfully' : validation.error,
          data: validation
        }), {
          status: validation.success ? 200 : 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      case 'send_psychographic_alert': {
        // Specialized SMS for psychographic insights
        if (!to || !options?.user_profile || !options?.insight) {
          return new Response(JSON.stringify({
            status: 'error',
            message: 'to, user_profile, and insight are required for psychographic alerts'
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        const { user_profile, insight } = options;
        
        // Generate personalized SMS based on psychographic profile
        let personalizedMessage = `knXw Alert: ${insight.title}\n\n`;
        
        // Adapt message tone based on cognitive style
        if (user_profile.cognitive_style === 'analytical') {
          personalizedMessage += `Analysis shows: ${insight.description}\n`;
          personalizedMessage += `Confidence: ${Math.round(insight.confidence_score * 100)}%\n`;
        } else if (user_profile.cognitive_style === 'intuitive') {
          personalizedMessage += `Key insight: ${insight.description}\n`;
        } else {
          personalizedMessage += insight.description + '\n';
        }

        // Add primary recommendation
        if (insight.actionable_recommendations && insight.actionable_recommendations.length > 0) {
          personalizedMessage += `\nRecommendation: ${insight.actionable_recommendations[0]}`;
        }

        const result = await sendTwilioSMS(to, personalizedMessage, options);

        return new Response(JSON.stringify({
          status: 'success',
          message: 'Psychographic alert SMS sent successfully',
          data: {
            ...result,
            personalized: true,
            cognitive_style_adapted: user_profile.cognitive_style
          }
        }), {
          status: 200,
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
    console.error('SMS function error:', error);
    
    return new Response(JSON.stringify({
      status: 'error',
      message: 'Failed to process SMS request',
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});