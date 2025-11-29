// Configuration retrieval endpoint (Admin/Owner only)
import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import { withTraceCtx, TracedError } from '../../lib/trace.js';
import { withPerformanceTracking } from '../../lib/metrics.js';

async function handler(req) {
  if (req.method !== 'GET') {
    throw new TracedError('Method not allowed', 'METHOD_NOT_ALLOWED', 405, req.traceId);
  }

  const base44 = createClientFromRequest(req);
  
  // GLOBAL-2: Admin/Owner only endpoint enforcement
  const user = await base44.auth.me();
  if (!user || !['admin', 'owner'].includes(user.role)) {
    throw new TracedError('Administrative or owner privileges required', 'ADMIN_OWNER_REQUIRED', 403, req.traceId);
  }

  try {
    const url = new URL(req.url);
    const tenantId = url.searchParams.get('tenant_id') || 'default';

    console.log(`Configuration retrieval requested by ${user.email} for tenant: ${tenantId}`);

    const { ConfigCenter } = await import('@/entities/ConfigCenter');
    
    // Try to find existing configuration
    let config = await ConfigCenter.filter({ tenant_id: tenantId }, 'updated_at', 1);
    
    if (config.length === 0) {
      // Create default configuration if none exists
      const defaultConfig = {
        tenant_id: tenantId,
        feature_flags: {
          enable_advanced_segmentation: true,
          enable_llm_evaluation: false,
          enable_audience_preview: true,
          enable_secret_rotation: false,
          max_audience_size: 100000
        },
        llm_budget_tokens: 1000000,
        secret_rotation_days: 90,
        performance_budgets: {
          api_p95_ms: 500,
          audience_preview_p95_ms: 250,
          max_concurrent_llm_requests: 10
        },
        updated_at: new Date().toISOString(),
        updated_by: user.email
      };

      const created = await ConfigCenter.create(defaultConfig);
      config = [created];
      
      console.log(`Created default configuration for tenant: ${tenantId}`);
    }

    return Response.json({
      success: true,
      config: config[0],
      trace_id: req.traceId
    });

  } catch (error) {
    console.error('Configuration retrieval failed:', error);
    
    if (error instanceof TracedError) {
      throw error;
    }
    
    throw new TracedError(
      'Configuration retrieval failed',
      'CONFIG_GET_FAILED',
      500,
      req.traceId,
      { originalError: error.message }
    );
  }
}

export default Deno.serve(
  withTraceCtx(
    withPerformanceTracking(handler, 'config_get', 'crud')
  )
);