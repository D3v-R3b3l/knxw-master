// API endpoint for running LLM evaluations (Admin only)
import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import { withTraceCtx, createAuditLog, TracedError } from '../../lib/trace.js';
import { runLLMEvaluation } from '../../llm/llmEval.js';
import { withPerformanceTracking } from '../../lib/metrics.js';

async function handler(req) {
  if (req.method !== 'POST') {
    throw new TracedError('Method not allowed', 'METHOD_NOT_ALLOWED', 405, req.traceId);
  }

  const base44 = createClientFromRequest(req);
  
  // GLOBAL-2: Admin-only endpoint enforcement
  const user = await base44.auth.me();
  if (!user || user.role !== 'admin') {
    throw new TracedError('Administrative privileges required', 'ADMIN_REQUIRED', 403, req.traceId);
  }

  try {
    const body = await req.json().catch(() => ({}));
    
    const options = {
      dataset: body.dataset || 'small',
      modelVersion: body.model_version || 'gpt-4-turbo',
      enableCostTracking: body.enable_cost_tracking !== false
    };

    console.log(`Starting LLM evaluation requested by ${user.email}`);

    // Run the evaluation
    const result = await runLLMEvaluation(base44, options);

    // GLOBAL-1: Create audit log entry
    await createAuditLog(
      base44,
      'create',
      'LLMEvalRecord',
      result.record_id,
      null,
      {
        run_id: result.run_id,
        dataset: options.dataset,
        accuracy: result.metrics.accuracy,
        cost_usd: result.metrics.cost_usd
      },
      req.traceId,
      user.email
    );

    return Response.json({
      success: true,
      run_id: result.run_id,
      metrics: result.metrics,
      summary: result.summary,
      trace_id: req.traceId
    });

  } catch (error) {
    console.error('LLM evaluation failed:', error);
    
    if (error instanceof TracedError) {
      throw error;
    }
    
    throw new TracedError(
      'LLM evaluation failed',
      'EVALUATION_FAILED',
      500,
      req.traceId,
      { originalError: error.message }
    );
  }
}

export default Deno.serve(
  withTraceCtx(
    withPerformanceTracking(handler, 'llm_eval', 'complex')
  )
);