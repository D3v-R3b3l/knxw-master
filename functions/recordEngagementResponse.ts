import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  // CRITICAL: Require authentication for all engagement response recording
  if (!(await base44.auth.isAuthenticated())) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { delivery_id, action_taken, response_data, response_time_seconds } = await req.json();

    if (!delivery_id || !action_taken) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: delivery_id and action_taken' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify the delivery exists and belongs to the authenticated user's client apps
    const deliveries = await base44.entities.EngagementDelivery.filter({ id: delivery_id });
    
    if (deliveries.length === 0) {
      return new Response(JSON.stringify({ error: 'Engagement delivery not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const delivery = deliveries[0];
    
    // Verify user has access to the client app associated with this delivery
    const userApps = await base44.entities.ClientApp.filter({ id: delivery.client_app_id });
    if (userApps.length === 0) {
      return new Response(JSON.stringify({ error: 'Access denied to this engagement delivery' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate action_taken is from allowed values
    const validActions = ['dismissed', 'responded', 'ignored', 'converted'];
    if (!validActions.includes(action_taken)) {
      return new Response(JSON.stringify({ 
        error: 'Invalid action_taken. Must be one of: ' + validActions.join(', ') 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Update the engagement delivery with the response
    const updatedDelivery = await base44.entities.EngagementDelivery.update(delivery_id, {
      response: {
        action_taken,
        response_data: response_data || {},
        response_time_seconds: response_time_seconds || 0
      },
      delivery_status: 'delivered'
    });

    // Update engagement rule analytics if conversion occurred
    if (action_taken === 'converted' && delivery.rule_id) {
      try {
        const rules = await base44.entities.EngagementRule.filter({ id: delivery.rule_id });
        if (rules.length > 0) {
          const rule = rules[0];
          const updatedAnalytics = {
            ...rule.analytics,
            conversion_count: (rule.analytics?.conversion_count || 0) + 1
          };
          
          await base44.entities.EngagementRule.update(delivery.rule_id, {
            analytics: updatedAnalytics
          });
        }
      } catch (error) {
        console.error('Error updating rule analytics:', error);
        // Don't fail the main response for analytics errors
      }
    }

    return new Response(JSON.stringify({
      status: 'success',
      message: 'Engagement response recorded successfully',
      delivery_id: delivery_id,
      action_taken: action_taken
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error recording engagement response:', error);
    return new Response(JSON.stringify({
      status: 'error',
      message: 'Failed to record engagement response',
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});