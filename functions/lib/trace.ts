// Enterprise-grade tracing utilities for knXw platform
import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

/**
 * Generate a unique trace ID for request correlation
 */
export function genTraceId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `trace_${timestamp}_${random}`;
}

/**
 * Higher-order function that wraps handlers with tracing context
 * Injects x-trace-id header and provides trace context to the handler
 */
export function withTraceCtx(handler) {
  return async (req) => {
    const traceId = req.headers.get('x-trace-id') || genTraceId();
    
    try {
      // Create enhanced request with trace context
      const tracedReq = new Proxy(req, {
        get(target, prop) {
          if (prop === 'traceId') return traceId;
          return target[prop];
        }
      });

      // Execute the original handler
      const response = await handler(tracedReq);
      
      // Ensure response has trace ID header
      if (response instanceof Response) {
        response.headers.set('x-trace-id', traceId);
        return response;
      }
      
      // Handle non-Response returns (convert to Response with trace header)
      const jsonResponse = Response.json(response || { success: true });
      jsonResponse.headers.set('x-trace-id', traceId);
      return jsonResponse;
      
    } catch (error) {
      console.error(`[${traceId}] Handler error:`, error);
      
      const errorResponse = Response.json(
        { 
          error: error.message || 'Internal server error',
          trace_id: traceId 
        }, 
        { status: error.status || 500 }
      );
      errorResponse.headers.set('x-trace-id', traceId);
      return errorResponse;
    }
  };
}

/**
 * Attach trace information to payloads for audit logging
 */
export function attachTrace(payload, traceId) {
  if (!payload || typeof payload !== 'object') {
    return { trace_id: traceId, data: payload };
  }
  
  return {
    ...payload,
    trace_id: traceId
  };
}

/**
 * Create audit log entry with trace context
 */
export async function createAuditLog(base44, action, tableName, recordId, before, after, traceId, userId) {
  try {
    const { AuditLog } = await import('@/entities/AuditLog');
    
    await AuditLog.create({
      timestamp: new Date().toISOString(),
      org_id: 'system', // Will be properly set by RLS
      user_id: userId || 'system',
      action,
      table_name: tableName,
      record_id: recordId,
      before: before || {},
      after: after || {},
      request_id: traceId,
      ip_address: 'unknown' // Will be enhanced by middleware
    });
  } catch (error) {
    console.error(`[${traceId}] Failed to create audit log:`, error);
  }
}

/**
 * Enhanced error class with trace support
 */
export class TracedError extends Error {
  constructor(message, code = 'UNKNOWN_ERROR', status = 500, traceId = null, details = null) {
    super(message);
    this.name = 'TracedError';
    this.code = code;
    this.status = status;
    this.traceId = traceId;
    this.details = details;
  }

  toJSON() {
    return {
      error: this.message,
      code: this.code,
      trace_id: this.traceId,
      details: this.details
    };
  }
}