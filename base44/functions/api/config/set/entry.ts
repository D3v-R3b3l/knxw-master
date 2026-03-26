// Configuration update endpoint with schema validation and audit logging
import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import { withTraceCtx, createAuditLog, TracedError } from '../../lib/trace.js';
import { withPerformanceTracking } from '../../lib/metrics.js';

async function handler(req) {
  if (req.method !== 'POST') {
    throw new TracedError('Method not allowed', 'METHOD_NOT_ALLOWED', 405, req.traceId);
  }

  const base44 = createClientFromRequest(req);
  
  // GLOBAL-2: Admin/Owner only endpoint enforcement
  const user = await base44.auth.me();
  if (!user || !['admin', 'owner'].includes(user.role)) {
    throw new TracedError('Administrative or owner privileges required', 'ADMIN_OWNER_REQUIRED', 403, req.traceId);
  }

  try {
    const body = await req.json().catch(() => {
      throw new TracedError('Invalid JSON in request body', 'INVALID_JSON', 400, req.traceId);
    });

    const {
      tenant_id,
      feature_flags,
      llm_budget_tokens,
      secret_rotation_days,
      performance_budgets
    } = body;

    // Validate required fields
    if (!tenant_id) {
      throw new TracedError('tenant_id is required', 'TENANT_ID_REQUIRED', 400, req.traceId);
    }

    // Schema validation
    const validationErrors = validateConfigSchema(body);
    if (validationErrors.length > 0) {
      throw new TracedError(
        `Schema validation failed: ${validationErrors.join(', ')}`,
        'SCHEMA_VALIDATION_FAILED',
        400,
        req.traceId,
        { validationErrors }
      );
    }

    console.log(`Configuration update requested by ${user.email} for tenant: ${tenant_id}`);

    const { ConfigCenter } = await import('@/entities/ConfigCenter');
    
    // Get existing configuration for audit diff
    let existingConfig = await ConfigCenter.filter({ tenant_id }, 'updated_at', 1);
    const beforeState = existingConfig.length > 0 ? existingConfig[0] : null;

    const updateData = {
      tenant_id,
      updated_at: new Date().toISOString(),
      updated_by: user.email
    };

    // Only update fields that are provided
    if (feature_flags !== undefined) {
      updateData.feature_flags = feature_flags;
    }
    if (llm_budget_tokens !== undefined) {
      updateData.llm_budget_tokens = llm_budget_tokens;
    }
    if (secret_rotation_days !== undefined) {
      updateData.secret_rotation_days = secret_rotation_days;
    }
    if (performance_budgets !== undefined) {
      updateData.performance_budgets = performance_budgets;
    }

    let updatedConfig;
    
    if (beforeState) {
      // Update existing configuration
      updatedConfig = await ConfigCenter.update(beforeState.id, updateData);
    } else {
      // Create new configuration with defaults
      const defaultData = {
        ...updateData,
        feature_flags: feature_flags || {
          enable_advanced_segmentation: true,
          enable_llm_evaluation: false,
          enable_audience_preview: true,
          enable_secret_rotation: false,
          max_audience_size: 100000
        },
        llm_budget_tokens: llm_budget_tokens || 1000000,
        secret_rotation_days: secret_rotation_days || 90,
        performance_budgets: performance_budgets || {
          api_p95_ms: 500,
          audience_preview_p95_ms: 250,
          max_concurrent_llm_requests: 10
        }
      };
      
      updatedConfig = await ConfigCenter.create(defaultData);
    }

    // GLOBAL-1: Create audit log entry with before/after diff
    await createAuditLog(
      base44,
      beforeState ? 'update' : 'create',
      'ConfigCenter',
      updatedConfig.id,
      beforeState,
      updatedConfig,
      req.traceId,
      user.email
    );

    console.log(`Configuration updated successfully for tenant: ${tenant_id}`);

    return Response.json({
      success: true,
      config: updatedConfig,
      changes_applied: generateChangesSummary(beforeState, updatedConfig),
      trace_id: req.traceId
    });

  } catch (error) {
    console.error('Configuration update failed:', error);
    
    if (error instanceof TracedError) {
      throw error;
    }
    
    throw new TracedError(
      'Configuration update failed',
      'CONFIG_SET_FAILED',
      500,
      req.traceId,
      { originalError: error.message }
    );
  }
}

/**
 * Validate configuration schema
 */
function validateConfigSchema(config) {
  const errors = [];
  
  // Validate tenant_id
  if (config.tenant_id && typeof config.tenant_id !== 'string') {
    errors.push('tenant_id must be a string');
  }
  
  // Validate feature_flags
  if (config.feature_flags !== undefined) {
    if (typeof config.feature_flags !== 'object' || Array.isArray(config.feature_flags)) {
      errors.push('feature_flags must be an object');
    } else {
      const allowedFlags = [
        'enable_advanced_segmentation',
        'enable_llm_evaluation', 
        'enable_audience_preview',
        'enable_secret_rotation',
        'max_audience_size'
      ];
      
      Object.keys(config.feature_flags).forEach(key => {
        if (!allowedFlags.includes(key)) {
          errors.push(`Unknown feature flag: ${key}`);
        }
        
        if (key === 'max_audience_size') {
          const value = config.feature_flags[key];
          if (typeof value !== 'number' || value < 0 || value > 10000000) {
            errors.push('max_audience_size must be a number between 0 and 10,000,000');
          }
        } else if (typeof config.feature_flags[key] !== 'boolean') {
          errors.push(`${key} must be a boolean`);
        }
      });
    }
  }
  
  // Validate llm_budget_tokens
  if (config.llm_budget_tokens !== undefined) {
    if (typeof config.llm_budget_tokens !== 'number' || config.llm_budget_tokens < 0) {
      errors.push('llm_budget_tokens must be a non-negative number');
    }
  }
  
  // Validate secret_rotation_days
  if (config.secret_rotation_days !== undefined) {
    const days = config.secret_rotation_days;
    if (typeof days !== 'number' || days < 7 || days > 365) {
      errors.push('secret_rotation_days must be a number between 7 and 365');
    }
  }
  
  // Validate performance_budgets
  if (config.performance_budgets !== undefined) {
    if (typeof config.performance_budgets !== 'object' || Array.isArray(config.performance_budgets)) {
      errors.push('performance_budgets must be an object');
    } else {
      const budgets = config.performance_budgets;
      
      if (budgets.api_p95_ms !== undefined && (typeof budgets.api_p95_ms !== 'number' || budgets.api_p95_ms < 1)) {
        errors.push('performance_budgets.api_p95_ms must be a positive number');
      }
      
      if (budgets.audience_preview_p95_ms !== undefined && (typeof budgets.audience_preview_p95_ms !== 'number' || budgets.audience_preview_p95_ms < 1)) {
        errors.push('performance_budgets.audience_preview_p95_ms must be a positive number');
      }
      
      if (budgets.max_concurrent_llm_requests !== undefined && (typeof budgets.max_concurrent_llm_requests !== 'number' || budgets.max_concurrent_llm_requests < 1)) {
        errors.push('performance_budgets.max_concurrent_llm_requests must be a positive number');
      }
    }
  }
  
  return errors;
}

/**
 * Generate summary of changes made
 */
function generateChangesSummary(beforeState, afterState) {
  if (!beforeState) {
    return ['Configuration created with default values'];
  }
  
  const changes = [];
  
  // Compare feature flags
  if (JSON.stringify(beforeState.feature_flags) !== JSON.stringify(afterState.feature_flags)) {
    changes.push('Feature flags updated');
  }
  
  // Compare budget tokens
  if (beforeState.llm_budget_tokens !== afterState.llm_budget_tokens) {
    changes.push(`LLM budget tokens changed: ${beforeState.llm_budget_tokens} → ${afterState.llm_budget_tokens}`);
  }
  
  // Compare rotation days
  if (beforeState.secret_rotation_days !== afterState.secret_rotation_days) {
    changes.push(`Secret rotation days changed: ${beforeState.secret_rotation_days} → ${afterState.secret_rotation_days}`);
  }
  
  // Compare performance budgets
  if (JSON.stringify(beforeState.performance_budgets) !== JSON.stringify(afterState.performance_budgets)) {
    changes.push('Performance budgets updated');
  }
  
  return changes.length > 0 ? changes : ['No changes detected'];
}

export default Deno.serve(
  withTraceCtx(
    withPerformanceTracking(handler, 'config_set', 'crud')
  )
);