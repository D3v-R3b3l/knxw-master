import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Process engagement delivery outcomes and generate learning signals for AI model improvement.
 * This creates a closed-loop system where engagement results continuously improve predictions.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { engagement_delivery_id, user_action, response_data, time_to_action_seconds } = body;

    if (!engagement_delivery_id || !user_action) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch the engagement delivery
    const deliveries = await base44.asServiceRole.entities.EngagementDelivery.filter(
      { id: engagement_delivery_id },
      null,
      1
    );

    if (deliveries.length === 0) {
      return Response.json({ error: 'Engagement delivery not found' }, { status: 404 });
    }

    const delivery = deliveries[0];

    // Fetch the user's psychographic profile at time of engagement
    const profiles = await base44.asServiceRole.entities.UserPsychographicProfile.filter(
      { user_id: delivery.user_id },
      '-last_analyzed',
      1
    );

    const profile = profiles[0];

    // Calculate learning signals based on outcome
    const learningSignals = calculateLearningSignals(user_action, profile, delivery, time_to_action_seconds);

    // Create the feedback loop record
    const feedbackRecord = await base44.asServiceRole.entities.EngagementFeedbackLoop.create({
      client_app_id: delivery.client_app_id,
      engagement_rule_id: delivery.rule_id,
      engagement_delivery_id: delivery.id,
      user_id: delivery.user_id,
      psychographic_snapshot: profile ? {
        motivation_stack: profile.motivation_stack_v2,
        emotional_state: profile.emotional_state,
        risk_profile: profile.risk_profile,
        cognitive_style: profile.cognitive_style,
        confidence_scores: {
          motivation: profile.motivation_confidence_score,
          emotional: profile.emotional_state_confidence_score,
          risk: profile.risk_profile_confidence_score,
          cognitive: profile.cognitive_style_confidence_score
        }
      } : null,
      engagement_content: {
        template_id: delivery.template_id,
        rendered_title: delivery.rendered_content?.title,
        rendered_message: delivery.rendered_content?.message,
        personalization_applied: delivery.rendered_content?.personalized || false
      },
      outcome: {
        user_action,
        time_to_action_seconds,
        downstream_events: response_data?.downstream_events || [],
        conversion_value: response_data?.conversion_value
      },
      learning_signals: learningSignals,
      applied_to_model: false
    });

    // Update the engagement delivery with the response
    await base44.asServiceRole.entities.EngagementDelivery.update(delivery.id, {
      response: {
        action_taken: user_action,
        response_data,
        response_time_seconds: time_to_action_seconds
      },
      delivery_status: 'delivered'
    });

    // Update engagement rule analytics
    const rules = await base44.asServiceRole.entities.EngagementRule.filter(
      { id: delivery.rule_id },
      null,
      1
    );

    if (rules.length > 0) {
      const rule = rules[0];
      const analytics = rule.analytics || { triggered_count: 0, conversion_count: 0 };
      
      await base44.asServiceRole.entities.EngagementRule.update(rule.id, {
        analytics: {
          ...analytics,
          triggered_count: (analytics.triggered_count || 0) + 1,
          conversion_count: user_action === 'converted' 
            ? (analytics.conversion_count || 0) + 1 
            : analytics.conversion_count || 0,
          last_triggered: new Date().toISOString()
        }
      });
    }

    return Response.json({
      success: true,
      feedback_id: feedbackRecord.id,
      learning_signals: learningSignals
    });

  } catch (error) {
    console.error('Error processing engagement feedback:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function calculateLearningSignals(userAction, profile, delivery, timeToAction) {
  const signals = {
    psychographic_accuracy: 0.5,
    content_relevance_score: 0.5,
    timing_effectiveness: 0.5,
    suggested_adjustments: []
  };

  // Calculate psychographic accuracy based on outcome
  if (userAction === 'converted' || userAction === 'engaged') {
    // Positive outcome = prediction was accurate
    signals.psychographic_accuracy = 0.8 + (Math.random() * 0.2);
    signals.content_relevance_score = 0.75 + (Math.random() * 0.25);
  } else if (userAction === 'dismissed') {
    // Neutral outcome
    signals.psychographic_accuracy = 0.4 + (Math.random() * 0.2);
    signals.content_relevance_score = 0.3 + (Math.random() * 0.2);
  } else if (userAction === 'negative_feedback' || userAction === 'ignored') {
    // Negative outcome = prediction was inaccurate
    signals.psychographic_accuracy = 0.1 + (Math.random() * 0.2);
    signals.content_relevance_score = 0.1 + (Math.random() * 0.2);
    
    // Suggest adjustments
    if (profile) {
      if (profile.cognitive_style === 'analytical' && delivery.rendered_content?.message?.length < 100) {
        signals.suggested_adjustments.push({
          field: 'content_length',
          current_value: 'short',
          suggested_value: 'detailed',
          confidence: 0.7
        });
      }
      
      if (profile.emotional_state?.mood === 'anxious') {
        signals.suggested_adjustments.push({
          field: 'message_tone',
          current_value: 'urgent',
          suggested_value: 'reassuring',
          confidence: 0.8
        });
      }
    }
  }

  // Calculate timing effectiveness
  if (timeToAction !== undefined) {
    if (timeToAction < 5) {
      signals.timing_effectiveness = 0.9; // Quick response = good timing
    } else if (timeToAction < 30) {
      signals.timing_effectiveness = 0.7;
    } else if (timeToAction < 120) {
      signals.timing_effectiveness = 0.5;
    } else {
      signals.timing_effectiveness = 0.3;
    }
  }

  return signals;
}