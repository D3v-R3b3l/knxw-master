import { logError } from './trace.js';

/**
 * Centralized error handling utility
 * Provides consistent error responses and logging across all functions
 */

export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
  }
}

export class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Rate limit exceeded', retryAfter = 60) {
    super(message, 429, 'RATE_LIMIT_ERROR', { retryAfter });
  }
}

/**
 * Wraps SDK operations with consistent error handling
 */
export async function withErrorHandling(base44, requestId, userId, operation, operationName) {
  try {
    return await operation();
  } catch (error) {
    console.error(`${operationName} failed:`, error);
    
    // Log the error for observability
    await logError(base44, requestId, operationName, error.message, error.statusCode || 500).catch(logErr => {
      console.error('Failed to log error:', logErr);
    });
    
    // Re-throw as AppError if not already
    if (error instanceof AppError) {
      throw error;
    }
    
    // Handle known error patterns
    if (error.message?.includes('unauthorized') || error.message?.includes('authentication')) {
      throw new AuthenticationError(error.message);
    }
    
    if (error.message?.includes('forbidden') || error.message?.includes('access denied')) {
      throw new AuthorizationError(error.message);
    }
    
    if (error.message?.includes('not found')) {
      throw new NotFoundError(error.message);
    }
    
    if (error.message?.includes('validation') || error.message?.includes('invalid')) {
      throw new ValidationError(error.message, error.details);
    }
    
    // Default to internal server error
    throw new AppError(
      'An internal error occurred',
      500,
      'INTERNAL_ERROR',
      process.env.NODE_ENV === 'development' ? error.message : null
    );
  }
}

/**
 * Express-style error handler for Deno functions
 */
export function createErrorHandler(functionName) {
  return async (error, base44, requestId, userId) => {
    // Ensure error is logged
    await logError(base44, requestId, functionName, error.message, error.statusCode || 500).catch(logErr => {
      console.error('Failed to log error in error handler:', logErr);
    });
    
    // Return appropriate response
    if (error instanceof AppError) {
      const response = {
        error: error.message,
        code: error.code,
        ...(error.details && { details: error.details })
      };
      
      const headers = { 'Content-Type': 'application/json' };
      if (error instanceof RateLimitError && error.details?.retryAfter) {
        headers['Retry-After'] = error.details.retryAfter.toString();
      }
      
      return new Response(JSON.stringify(response), {
        status: error.statusCode,
        headers
      });
    }
    
    // Unexpected error
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  };
}

/**
 * Function wrapper that handles common patterns
 */
export function withStandardHandler(handler, functionName) {
  const errorHandler = createErrorHandler(functionName);
  
  return async (req) => {
    const requestId = crypto.randomUUID();
    const startTime = Date.now();
    let base44, userId;
    
    try {
      const { createClientFromRequest } = await import('npm:@base44/sdk@0.7.0');
      base44 = createClientFromRequest(req);
      
      return await handler(req, { base44, requestId, startTime });
    } catch (error) {
      return await errorHandler(error, base44, requestId, userId);
    }
  };
}

/**
 * Wraps async operations with automatic error conversion
 */
export async function safeAsync(operation, context = 'operation') {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(`${context} failed: ${error.message}`, 500, 'OPERATION_ERROR');
  }
}