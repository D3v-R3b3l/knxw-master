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

    // Get Governance Config
    const configs = await base44.asServiceRole.entities.GovernanceConfig.list();
    const config = configs && configs.length > 0 ? configs[0] : {
      mode: "governor",
      weights: { w_regret: 1.0, w_fatigue: 1.0, w_coercion: 1.5, w_disparity: 2.0, w_gaming: 1.0 }
    };

    // Calculate business metrics
    const conversion = user_action === 'converted' ? 1 : 0;
    const retention_proxy = user_action === 'engaged' ? 0.5 : (user_action === 'dismissed' ? -0.2 : 0);
    const completion = response_data?.conversion_value ? 1 : 0;
    const R_business = conversion * 10 + retention_proxy * 5 + completion * 5;

    // Calculate harm proxies
    const regret_score = user_action === 'negative_feedback' ? 1 : (user_action === 'dismissed' ? 0.2 : 0);
    const fatigue_score = time_to_action_seconds && time_to_action_seconds < 2 && user_action === 'dismissed' ? 0.8 : 0;
    const coercion_score = response_data?.opt_out ? 1 : 0;
    const gaming_risk_score = (conversion === 1 && time_to_action_seconds < 1) ? 0.9 : 0;

    // Cohort-Level Penalty Detection
    const cohort_state_bucket = profile?.risk_profile || 'unknown';
    const previousOutcomes = await base44.asServiceRole.entities.OutcomeEvent.filter({ cohort_state_bucket }, '-created_date', 20);
    
    let cohort_regret_delta = 0;
    let cohort_fatigue_delta = 0;

    if (previousOutcomes && previousOutcomes.length > 0) {
      const avgCohortRegret = previousOutcomes.reduce((acc, o) => acc + (o.harm_proxies?.regret_score || 0), 0) / previousOutcomes.length;
      const avgCohortFatigue = previousOutcomes.reduce((acc, o) => acc + (o.harm_proxies?.fatigue_score || 0), 0) / previousOutcomes.length;
      cohort_regret_delta = Math.max(0, regret_score - avgCohortRegret);
      cohort_fatigue_delta = Math.max(0, fatigue_score - avgCohortFatigue);
    }

    const disparity_score = Math.max(cohort_regret_delta, cohort_fatigue_delta);

    // Implement Ethical Penalty Function
    let ethical_penalty = 0;
    if (config.mode === 'governor') {
      ethical_penalty = 
        config.weights.w_regret * regret_score +
        config.weights.w_fatigue * fatigue_score +
        config.weights.w_coercion * coercion_score +
        config.weights.w_disparity * disparity_score +
        config.weights.w_gaming * gaming_risk_score;
    }

    // Contextual Bandit Reward Function
    const R_total = R_business - ethical_penalty;

    // Guardian Ethical Assessment (Governor Mode Activation)
    const assessment = await base44.asServiceRole.entities.GuardianEthicalAssessment.create({
      intervention_id: delivery.id,
      harm_proxy_scores: { regret_score, fatigue_score, coercion_score, gaming_risk_score },
      disparity_metrics: { cohort_regret_delta, cohort_fatigue_delta },
      ethical_penalty
    });

    // Governance Reward Contract
    const outcomeEvent = await base44.asServiceRole.entities.OutcomeEvent.create({
      intervention_id: delivery.id,
      intervention_class: delivery.template_id || 'unknown',
      user_id: delivery.user_id,
      session_id: delivery.session_id || 'unknown',
      psychographic_state_vector: profile,
      cohort_state_bucket,
      business_metrics: { conversion, retention_proxy, completion },
      harm_proxies: { regret_score, fatigue_score, coercion_score, gaming_risk_score },
      disparity_metrics: { cohort_regret_delta, cohort_fatigue_delta },
      timestamps: {
        intervention_time: new Date().toISOString(),
        window_0_end: new Date(Date.now() + 60*60*1000).toISOString(),
        window_1_end: new Date(Date.now() + 24*60*60*1000).toISOString(),
        window_2_end: new Date(Date.now() + 7*24*60*60*1000).toISOString(),
        window_3_end: new Date(Date.now() + 30*24*60*60*1000).toISOString()
      },
      calculated_rewards: { R_business, P_ethics: ethical_penalty, R_total },
      window_id: "W0"
    });

    // Exploration Cost Adjustment logic is utilized during policy generation/selection (Trigger Engine)
    // We adjust the learning signals based on the penalized R_total
    const learningSignals = calculateLearningSignals(user_action, profile, delivery, time_to_action_seconds, R_total, ethical_penalty);

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

function calculateLearningSignals(userAction, profile, delivery, timeToAction, rTotal = null, ethicalPenalty = null) {
  const signals = {
    psychographic_accuracy: 0.5,
    content_relevance_score: 0.5,
    timing_effectiveness: 0.5,
    suggested_adjustments: [],
    reward_metrics: {
      R_total: rTotal,
      P_ethics: ethicalPenalty
    }
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