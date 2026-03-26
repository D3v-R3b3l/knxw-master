/**
 * Observability and tracing utilities
 */

/**
 * Logs an error to SystemEvent for observability
 */
async function logError(base44, requestId, functionName, errorMessage, statusCode, additionalContext = {}) {
  try {
    if (!base44) return; // Graceful degradation if SDK not available
    
    await base44.asServiceRole.entities.SystemEvent.create({
      org_id: 'default',
      actor_type: 'system',
      actor_id: functionName,
      event_type: 'error',
      severity: statusCode >= 500 ? 'critical' : statusCode >= 400 ? 'error' : 'warning',
      payload: {
        requestId,
        functionName,
        errorMessage,
        statusCode,
        timestamp: new Date().toISOString(),
        ...additionalContext
      },
      trace_id: requestId,
      timestamp: new Date().toISOString()
    });
  } catch (logError) {
    // Don't let logging failures break the main function
    console.error('Failed to log error to SystemEvent:', logError);
  }
}

/**
 * Logs function execution trace for performance monitoring
 */
async function logTrace(base44, requestId, userId, functionName, latencyMs, errorCode = null, additionalContext = {}) {
  try {
    if (!base44) return;
    
    await base44.asServiceRole.entities.SystemEvent.create({
      org_id: 'default',
      actor_type: userId ? 'user' : 'system',
      actor_id: userId || functionName,
      event_type: errorCode ? 'error' : 'admin_action',
      severity: 'info',
      payload: {
        requestId,
        functionName,
        latencyMs,
        errorCode,
        timestamp: new Date().toISOString(),
        ...additionalContext
      },
      trace_id: requestId,
      timestamp: new Date().toISOString()
    });
  } catch (logError) {
    console.error('Failed to log trace to SystemEvent:', logError);
  }
}

export { logError, logTrace };

Deno.serve((req) => {
  return new Response(JSON.stringify({ 
    error: 'This is a utility function, not an endpoint' 
  }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' }
  });
});