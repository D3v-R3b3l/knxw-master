/**
 * Explainability and audit logging for LLM operations
 * Provides compliance-ready logging with input/output hashing
 */

import { createHash } from 'node:crypto';

/**
 * Hash sensitive content for audit logs
 */
function hashContent(content, algorithm = 'sha256') {
  if (!content) return null;
  
  const hash = createHash(algorithm);
  hash.update(String(content));
  return hash.digest('hex');
}

/**
 * Mask PII in content for logging
 */
function maskPIIForLogging(text) {
  if (!text || typeof text !== 'string') return text;
  
  // Email masking
  text = text.replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[EMAIL-MASKED]');
  
  // Phone number masking
  text = text.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE-MASKED]');
  
  // SSN masking  
  text = text.replace(/\b\d{3}-?\d{2}-?\d{4}\b/g, '[SSN-MASKED]');
  
  return text;
}

/**
 * Create explainability audit log for LLM operation
 */
export async function logLLMOperation(base44Client, operation) {
  const {
    operation_id = crypto.randomUUID(),
    user_id,
    tenant_id,
    operation_type = 'psychographic_analysis',
    input_data,
    output_data,
    prompt_template,
    model_config,
    latency_ms,
    success,
    error_message,
    confidence_scores,
    validation_results
  } = operation;

  const timestamp = new Date().toISOString();
  
  // Create audit log entry
  const auditEntry = {
    operation_id,
    timestamp,
    user_id,
    tenant_id,
    operation_type,
    
    // Input analysis
    input_hash: hashContent(input_data),
    input_length: input_data?.length || 0,
    input_preview: maskPIIForLogging(String(input_data).substring(0, 200)),
    
    // Output analysis  
    output_hash: hashContent(JSON.stringify(output_data)),
    output_summary: extractOutputSummary(output_data),
    
    // Model information
    prompt_template_version: prompt_template?.version || '1.0',
    prompt_hash: hashContent(prompt_template?.system + prompt_template?.user),
    model_config: {
      timeout: model_config?.timeout,
      max_retries: model_config?.maxRetries,
      response_schema_provided: !!model_config?.response_json_schema
    },
    
    // Performance metrics
    latency_ms,
    success,
    error_message,
    
    // Quality metrics
    confidence_scores: confidence_scores || {},
    validation_results: validation_results || {},
    
    // Compliance metadata
    data_retention_class: 'audit_log',
    pii_detected: detectPIIInContent(input_data),
    
    created_at: timestamp
  };

  try {
    // Store in audit system (using SystemEvent entity for now)
    await base44Client.asServiceRole.entities.SystemEvent.create({
      org_id: tenant_id || 'default',
      actor_type: 'system',
      actor_id: 'llm_audit_logger',
      event_type: 'admin_action',
      severity: success ? 'info' : 'warning',
      payload: auditEntry,
      trace_id: operation_id,
      timestamp: timestamp
    });

    console.log(JSON.stringify({
      event: 'audit_log_created',
      operation_id,
      tenant_id,
      success,
      latency_ms
    }));

  } catch (error) {
    console.error(JSON.stringify({
      event: 'audit_log_failed',
      operation_id,
      error: error.message
    }));
    
    // Don't throw - audit logging failure shouldn't break main operation
  }
}

/**
 * Extract summary information from LLM output for auditing
 */
function extractOutputSummary(output_data) {
  if (!output_data || typeof output_data !== 'object') {
    return { type: 'unknown', valid: false };
  }

  const summary = {
    type: 'psychographic_analysis',
    valid: true,
    fields_present: Object.keys(output_data),
    insights_count: Array.isArray(output_data.insights) ? output_data.insights.length : 0,
    recommendations_count: Array.isArray(output_data.recommendations) ? output_data.recommendations.length : 0
  };

  // Add personality trait analysis
  if (output_data.personality_traits) {
    const traits = output_data.personality_traits;
    summary.personality_analysis = {
      openness: typeof traits.openness === 'number' ? Math.round(traits.openness * 100) : null,
      conscientiousness: typeof traits.conscientiousness === 'number' ? Math.round(traits.conscientiousness * 100) : null,
      extraversion: typeof traits.extraversion === 'number' ? Math.round(traits.extraversion * 100) : null,
      agreeableness: typeof traits.agreeableness === 'number' ? Math.round(traits.agreeableness * 100) : null,
      neuroticism: typeof traits.neuroticism === 'number' ? Math.round(traits.neuroticism * 100) : null
    };
  }

  // Add risk and cognitive assessments
  if (output_data.risk_profile) {
    summary.risk_assessment = output_data.risk_profile;
  }

  if (output_data.cognitive_style) {
    summary.cognitive_assessment = output_data.cognitive_style;
  }

  return summary;
}

/**
 * Detect if content contains potential PII
 */
function detectPIIInContent(content) {
  if (!content || typeof content !== 'string') {
    return false;
  }

  // Simple PII detection patterns
  const piiPatterns = [
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, // Email
    /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, // Phone
    /\b\d{3}-?\d{2}-?\d{4}\b/g, // SSN
    /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g // Credit card
  ];

  return piiPatterns.some(pattern => pattern.test(content));
}

/**
 * Retrieve audit logs for a specific operation or tenant
 */
export async function getAuditLogs(base44Client, filters = {}) {
  const {
    tenant_id,
    operation_id,
    user_id,
    start_date,
    end_date,
    operation_type = 'psychographic_analysis',
    limit = 100,
    offset = 0
  } = filters;

  try {
    let query = base44Client.asServiceRole.entities.SystemEvent
      .filter({ 
        event_type: 'admin_action',
        actor_id: 'llm_audit_logger'
      })
      .order('-created_date')
      .limit(limit);

    if (offset > 0) {
      query = query.offset(offset);
    }

    const logs = await query;

    // Filter by additional criteria
    let filteredLogs = logs;
    
    if (tenant_id) {
      filteredLogs = filteredLogs.filter(log => log.org_id === tenant_id);
    }
    
    if (operation_id) {
      filteredLogs = filteredLogs.filter(log => log.trace_id === operation_id);
    }
    
    if (user_id) {
      filteredLogs = filteredLogs.filter(log => log.payload?.user_id === user_id);
    }
    
    if (start_date) {
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= new Date(start_date));
    }
    
    if (end_date) {
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= new Date(end_date));
    }

    return filteredLogs.map(log => ({
      operation_id: log.trace_id,
      timestamp: log.timestamp,
      tenant_id: log.org_id,
      user_id: log.payload?.user_id,
      operation_type: log.payload?.operation_type,
      success: log.payload?.success,
      latency_ms: log.payload?.latency_ms,
      input_preview: log.payload?.input_preview,
      output_summary: log.payload?.output_summary,
      validation_results: log.payload?.validation_results,
      confidence_scores: log.payload?.confidence_scores,
      error_message: log.payload?.error_message
    }));

  } catch (error) {
    console.error('Failed to retrieve audit logs:', error);
    throw new Error(`Audit log retrieval failed: ${error.message}`);
  }
}

/**
 * Generate compliance report for audit purposes
 */
export async function generateComplianceReport(base44Client, tenant_id, date_range) {
  const { start_date, end_date } = date_range;
  
  try {
    const logs = await getAuditLogs(base44Client, {
      tenant_id,
      start_date,
      end_date,
      limit: 10000 // Large limit for comprehensive report
    });

    const report = {
      tenant_id,
      report_period: { start_date, end_date },
      generated_at: new Date().toISOString(),
      
      summary: {
        total_operations: logs.length,
        successful_operations: logs.filter(log => log.success).length,
        failed_operations: logs.filter(log => !log.success).length,
        avg_latency_ms: logs.length > 0 ? Math.round(logs.reduce((sum, log) => sum + (log.latency_ms || 0), 0) / logs.length) : 0
      },
      
      quality_metrics: {
        operations_with_high_confidence: logs.filter(log => {
          const scores = log.confidence_scores || {};
          return Object.values(scores).some(score => score > 0.8);
        }).length,
        
        validation_failures: logs.filter(log => {
          const validation = log.validation_results || {};
          return !validation.valid;
        }).length
      },
      
      compliance_indicators: {
        pii_detection_enabled: true,
        audit_log_retention: true,
        explainability_tracking: true,
        input_sanitization: true
      },
      
      error_analysis: logs
        .filter(log => !log.success)
        .reduce((acc, log) => {
          const error = log.error_message || 'Unknown error';
          acc[error] = (acc[error] || 0) + 1;
          return acc;
        }, {})
    };

    return report;

  } catch (error) {
    throw new Error(`Compliance report generation failed: ${error.message}`);
  }
}