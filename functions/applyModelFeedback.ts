import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Apply accumulated feedback to update and improve inference models.
 * This should run periodically (e.g., daily) to incorporate learnings.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { client_app_id, min_feedback_count = 50 } = body;

    // Fetch unapplied feedback
    const feedback = await base44.asServiceRole.entities.EngagementFeedbackLoop.filter(
      { 
        client_app_id,
        applied_to_model: false 
      },
      '-created_date',
      1000
    );

    if (feedback.length < min_feedback_count) {
      return Response.json({
        message: `Not enough feedback yet. Need ${min_feedback_count}, have ${feedback.length}.`,
        applied: false
      });
    }

    // Aggregate learning signals
    const aggregatedLearnings = aggregateFeedback(feedback);

    // Fetch active inference models for this app
    const models = await base44.asServiceRole.entities.InferenceModel.filter(
      { client_app_id, status: 'active' },
      null,
      50
    );

    const updates = [];

    for (const model of models) {
      const modelUpdates = applyLearningsToModel(model, aggregatedLearnings);
      
      if (modelUpdates) {
        await base44.asServiceRole.entities.InferenceModel.update(model.id, modelUpdates);
        updates.push({ model_id: model.id, model_name: model.name, changes: modelUpdates });
      }
    }

    // Mark feedback as applied
    for (const fb of feedback) {
      await base44.asServiceRole.entities.EngagementFeedbackLoop.update(fb.id, {
        applied_to_model: true,
        applied_at: new Date().toISOString()
      });
    }

    return Response.json({
      success: true,
      feedback_processed: feedback.length,
      models_updated: updates.length,
      updates
    });

  } catch (error) {
    console.error('Error applying model feedback:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function aggregateFeedback(feedback) {
  const learnings = {
    psychographic_adjustments: {},
    content_strategies: {},
    timing_patterns: {},
    total_samples: feedback.length
  };

  // Aggregate psychographic accuracy by profile type
  const byRiskProfile = {};
  const byCognitiveStyle = {};

  for (const fb of feedback) {
    const snapshot = fb.psychographic_snapshot;
    if (!snapshot) continue;

    const risk = snapshot.risk_profile;
    const cognitive = snapshot.cognitive_style;
    const accuracy = fb.learning_signals?.psychographic_accuracy || 0.5;

    if (risk) {
      byRiskProfile[risk] = byRiskProfile[risk] || [];
      byRiskProfile[risk].push(accuracy);
    }

    if (cognitive) {
      byCognitiveStyle[cognitive] = byCognitiveStyle[cognitive] || [];
      byCognitiveStyle[cognitive].push(accuracy);
    }
  }

  // Calculate averages
  Object.keys(byRiskProfile).forEach(risk => {
    const avg = byRiskProfile[risk].reduce((a, b) => a + b, 0) / byRiskProfile[risk].length;
    learnings.psychographic_adjustments[`risk_${risk}`] = avg;
  });

  Object.keys(byCognitiveStyle).forEach(style => {
    const avg = byCognitiveStyle[style].reduce((a, b) => a + b, 0) / byCognitiveStyle[style].length;
    learnings.psychographic_adjustments[`cognitive_${style}`] = avg;
  });

  return learnings;
}

function applyLearningsToModel(model, learnings) {
  const updates = {};
  let hasUpdates = false;

  // Adjust confidence thresholds based on accuracy
  const avgAccuracy = Object.values(learnings.psychographic_adjustments).reduce((a, b) => a + b, 0) 
    / Math.max(Object.keys(learnings.psychographic_adjustments).length, 1);

  if (avgAccuracy > 0.8 && model.confidence_thresholds) {
    // Model is performing well - can be more confident
    updates.confidence_thresholds = {
      ...model.confidence_thresholds,
      high_confidence: Math.min(0.95, (model.confidence_thresholds.high_confidence || 0.8) + 0.02),
      medium_confidence: Math.min(0.7, (model.confidence_thresholds.medium_confidence || 0.5) + 0.02)
    };
    hasUpdates = true;
  } else if (avgAccuracy < 0.5 && model.confidence_thresholds) {
    // Model needs to be more conservative
    updates.confidence_thresholds = {
      ...model.confidence_thresholds,
      high_confidence: Math.max(0.6, (model.confidence_thresholds.high_confidence || 0.8) - 0.03),
      medium_confidence: Math.max(0.3, (model.confidence_thresholds.medium_confidence || 0.5) - 0.03)
    };
    hasUpdates = true;
  }

  // Update performance metrics
  updates.performance_metrics = {
    ...(model.performance_metrics || {}),
    total_inferences: (model.performance_metrics?.total_inferences || 0) + learnings.total_samples,
    avg_confidence: avgAccuracy,
    engagement_correlation: avgAccuracy,
    last_evaluated: new Date().toISOString()
  };
  hasUpdates = true;

  return hasUpdates ? updates : null;
}