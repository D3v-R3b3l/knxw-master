// LLM Evaluation system for knXw psychographic analysis
import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import { genTraceId, createAuditLog } from '../lib/trace.js';
import datasetSmall from '../../fixtures/llm/dataset.small.json' assert { type: 'json' };

/**
 * Run offline evaluation on the small dataset
 */
export async function runLLMEvaluation(base44, options = {}) {
  const runId = `eval_${Date.now()}_${genTraceId().split('_')[2]}`;
  const startTime = performance.now();
  
  try {
    const {
      dataset = 'small',
      modelVersion = 'gpt-4-turbo',
      enableCostTracking = true
    } = options;
    
    console.log(`Starting LLM evaluation run: ${runId}`);
    
    // Load appropriate dataset
    const testData = dataset === 'small' ? datasetSmall : datasetSmall; // Extend for other datasets
    
    const results = {
      correct: 0,
      total: testData.length,
      predictions: [],
      totalCost: 0,
      totalLatency: 0
    };
    
    // Process each sample
    for (const sample of testData) {
      const sampleStart = performance.now();
      
      try {
        // Generate prediction using the LLM
        const prediction = await generatePsychographicPrediction(sample.input, modelVersion);
        const sampleLatency = performance.now() - sampleStart;
        
        // Evaluate against expected output
        const evaluation = evaluatePrediction(prediction, sample.expected_output);
        
        results.predictions.push({
          id: sample.id,
          input: sample.input,
          expected: sample.expected_output,
          predicted: prediction,
          evaluation,
          latency_ms: sampleLatency,
          cost_estimate: enableCostTracking ? estimateCost(sample.input, prediction) : 0
        });
        
        if (evaluation.correct) {
          results.correct++;
        }
        
        results.totalLatency += sampleLatency;
        results.totalCost += results.predictions[results.predictions.length - 1].cost_estimate;
        
      } catch (error) {
        console.error(`Error processing sample ${sample.id}:`, error);
        
        results.predictions.push({
          id: sample.id,
          input: sample.input,
          expected: sample.expected_output,
          predicted: null,
          evaluation: { correct: false, error: error.message },
          latency_ms: performance.now() - sampleStart,
          cost_estimate: 0
        });
      }
    }
    
    // Calculate final metrics
    const accuracy = results.total > 0 ? results.correct / results.total : 0;
    const avgLatency = results.total > 0 ? results.totalLatency / results.total : 0;
    
    const metrics = {
      accuracy: Math.round(accuracy * 1000) / 1000,
      precision: calculatePrecision(results.predictions),
      recall: calculateRecall(results.predictions),
      f1_score: 0, // Will be calculated from precision and recall
      latency_ms: Math.round(avgLatency),
      cost_usd: Math.round(results.totalCost * 100) / 100,
      samples_processed: results.total,
      samples_correct: results.correct
    };
    
    // Calculate F1 score
    if (metrics.precision + metrics.recall > 0) {
      metrics.f1_score = Math.round(
        (2 * metrics.precision * metrics.recall) / (metrics.precision + metrics.recall) * 1000
      ) / 1000;
    }
    
    const totalDuration = performance.now() - startTime;
    
    // Generate summary
    const summary = generateEvaluationSummary(metrics, results, totalDuration);
    
    // Save evaluation record
    const { LLMEvalRecord } = await import('@/entities/LLMEvalRecord');
    
    const evalRecord = await LLMEvalRecord.create({
      run_id: runId,
      dataset: dataset,
      metrics,
      summary,
      model_version: modelVersion,
      dataset_size: results.total,
      evaluation_duration_ms: Math.round(totalDuration),
      created_at: new Date().toISOString(),
      created_by: 'system'
    });
    
    console.log(`LLM evaluation completed: ${runId}`);
    console.log(`Accuracy: ${(metrics.accuracy * 100).toFixed(1)}%`);
    console.log(`Average latency: ${metrics.latency_ms}ms`);
    console.log(`Total cost: $${metrics.cost_usd}`);
    
    return {
      run_id: runId,
      metrics,
      summary,
      record_id: evalRecord.id,
      detailed_results: results.predictions
    };
    
  } catch (error) {
    console.error(`LLM evaluation failed for run ${runId}:`, error);
    throw error;
  }
}

/**
 * Generate psychographic prediction for a given input
 */
async function generatePsychographicPrediction(input, modelVersion) {
  // This would integrate with your existing LLM inference system
  // For now, using a mock implementation
  
  const mockPredictions = {
    "achievement": { cognitive_style: "analytical", confidence_score: 0.82 },
    "security": { cognitive_style: "systematic", confidence_score: 0.75 },
    "autonomy": { cognitive_style: "intuitive", confidence_score: 0.79 },
    "social": { cognitive_style: "creative", confidence_score: 0.68 }
  };
  
  // Simple heuristic based on user behavior patterns
  let predictedMotivation = "achievement"; // default
  
  if (input.user_events) {
    const hasSecurityFocus = input.user_events.some(e => 
      e.url?.includes('security') || e.element?.includes('security')
    );
    const hasQuickActions = input.user_events.some(e => 
      e.duration && e.duration < 15000
    );
    const hasAnalyticalBehavior = input.user_events.some(e => 
      e.element?.includes('compare') || e.element?.includes('docs')
    );
    
    if (hasSecurityFocus) predictedMotivation = "security";
    else if (hasQuickActions) predictedMotivation = "autonomy";
    else if (hasAnalyticalBehavior) predictedMotivation = "achievement";
  }
  
  const basePrediction = mockPredictions[predictedMotivation];
  
  return {
    primary_motivation: predictedMotivation,
    cognitive_style: basePrediction.cognitive_style,
    confidence_score: basePrediction.confidence_score + (Math.random() * 0.1 - 0.05), // Add some variance
    reasoning: `Predicted ${predictedMotivation} motivation based on behavioral patterns`
  };
}

/**
 * Evaluate prediction against expected output
 */
function evaluatePrediction(predicted, expected) {
  if (!predicted || !expected) {
    return { correct: false, reason: 'Missing prediction or expected output' };
  }
  
  const motivationMatch = predicted.primary_motivation === expected.primary_motivation;
  const cognitiveMatch = predicted.cognitive_style === expected.cognitive_style;
  const confidenceWithinRange = Math.abs(predicted.confidence_score - expected.confidence_score) <= 0.2;
  
  const score = [motivationMatch, cognitiveMatch, confidenceWithinRange].filter(Boolean).length / 3;
  const correct = score >= 0.67; // At least 2 out of 3 must match
  
  return {
    correct,
    score,
    motivation_match: motivationMatch,
    cognitive_match: cognitiveMatch,
    confidence_within_range: confidenceWithinRange,
    confidence_delta: Math.abs(predicted.confidence_score - expected.confidence_score)
  };
}

/**
 * Calculate precision from predictions
 */
function calculatePrecision(predictions) {
  const byMotivation = {};
  
  predictions.forEach(pred => {
    if (pred.predicted && pred.expected) {
      const predicted = pred.predicted.primary_motivation;
      const expected = pred.expected.primary_motivation;
      
      if (!byMotivation[predicted]) {
        byMotivation[predicted] = { tp: 0, fp: 0 };
      }
      
      if (predicted === expected) {
        byMotivation[predicted].tp++;
      } else {
        byMotivation[predicted].fp++;
      }
    }
  });
  
  const precisions = Object.values(byMotivation).map(stats => {
    const total = stats.tp + stats.fp;
    return total > 0 ? stats.tp / total : 0;
  });
  
  return precisions.length > 0 
    ? Math.round((precisions.reduce((a, b) => a + b, 0) / precisions.length) * 1000) / 1000
    : 0;
}

/**
 * Calculate recall from predictions
 */
function calculateRecall(predictions) {
  const byMotivation = {};
  
  predictions.forEach(pred => {
    if (pred.predicted && pred.expected) {
      const predicted = pred.predicted.primary_motivation;
      const expected = pred.expected.primary_motivation;
      
      if (!byMotivation[expected]) {
        byMotivation[expected] = { tp: 0, fn: 0 };
      }
      
      if (predicted === expected) {
        byMotivation[expected].tp++;
      } else {
        byMotivation[expected].fn++;
      }
    }
  });
  
  const recalls = Object.values(byMotivation).map(stats => {
    const total = stats.tp + stats.fn;
    return total > 0 ? stats.tp / total : 0;
  });
  
  return recalls.length > 0 
    ? Math.round((recalls.reduce((a, b) => a + b, 0) / recalls.length) * 1000) / 1000
    : 0;
}

/**
 * Estimate cost for a prediction
 */
function estimateCost(input, prediction) {
  // Rough estimate based on token usage
  const inputTokens = JSON.stringify(input).length / 4; // Rough approximation
  const outputTokens = JSON.stringify(prediction).length / 4;
  
  // GPT-4 pricing (approximate)
  const inputCostPer1K = 0.03;
  const outputCostPer1K = 0.06;
  
  return ((inputTokens * inputCostPer1K) + (outputTokens * outputCostPer1K)) / 1000;
}

/**
 * Generate human-readable evaluation summary
 */
function generateEvaluationSummary(metrics, results, durationMs) {
  const accuracyPct = (metrics.accuracy * 100).toFixed(1);
  const durationSec = (durationMs / 1000).toFixed(1);
  
  let summary = `Evaluation completed with ${accuracyPct}% accuracy over ${metrics.samples_processed} samples in ${durationSec}s. `;
  
  if (metrics.accuracy >= 0.9) {
    summary += "Excellent performance across all metrics.";
  } else if (metrics.accuracy >= 0.8) {
    summary += "Good performance with room for improvement.";
  } else if (metrics.accuracy >= 0.7) {
    summary += "Acceptable performance but requires optimization.";
  } else {
    summary += "Poor performance - model requires significant improvement.";
  }
  
  summary += ` Average prediction latency: ${metrics.latency_ms}ms. Total cost: $${metrics.cost_usd}.`;
  
  return summary;
}