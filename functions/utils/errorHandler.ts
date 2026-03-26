export class APIError extends Error {
  constructor(message, statusCode = 500, code = null, details = null) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export class ValidationError extends Error {
  constructor(message, field = null, value = null) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
    this.field = field;
    this.value = value;
  }
}

export class AuthenticationError extends Error {
  constructor(message = 'Authentication required') {
    super(message);
    this.name = 'AuthenticationError';
    this.statusCode = 401;
  }
}

export class AuthorizationError extends Error {
  constructor(message = 'Insufficient permissions') {
    super(message);
    this.name = 'AuthorizationError';
    this.statusCode = 403;
  }
}

export class NotFoundError extends Error {
  constructor(resource = 'Resource') {
    super(`${resource} not found`);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

export class ExternalServiceError extends Error {
  constructor(service, originalError, statusCode = 502) {
    super(`${service} service error: ${originalError.message}`);
    this.name = 'ExternalServiceError';
    this.statusCode = statusCode;
    this.service = service;
    this.originalError = originalError;
  }
}

export const handleError = (error, req = null) => {
  // Log error with context
  const errorContext = {
    timestamp: new Date().toISOString(),
    url: req?.url,
    method: req?.method,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    }
  };

  console.error('Function Error:', JSON.stringify(errorContext, null, 2));

  // Return appropriate response based on error type
  if (error instanceof ValidationError) {
    return Response.json({
      error: 'Validation failed',
      message: error.message,
      field: error.field,
      code: 'VALIDATION_ERROR'
    }, { status: 400 });
  }

  if (error instanceof AuthenticationError) {
    return Response.json({
      error: 'Authentication required',
      message: error.message,
      code: 'AUTH_ERROR'
    }, { status: 401 });
  }

  if (error instanceof AuthorizationError) {
    return Response.json({
      error: 'Insufficient permissions',
      message: error.message,
      code: 'AUTHORIZATION_ERROR'
    }, { status: 403 });
  }

  if (error instanceof NotFoundError) {
    return Response.json({
      error: 'Not found',
      message: error.message,
      code: 'NOT_FOUND'
    }, { status: 404 });
  }

  if (error instanceof ExternalServiceError) {
    return Response.json({
      error: 'External service error',
      message: error.message,
      service: error.service,
      code: 'EXTERNAL_SERVICE_ERROR'
    }, { status: error.statusCode });
  }

  if (error instanceof APIError) {
    return Response.json({
      error: error.message,
      code: error.code,
      details: error.details
    }, { status: error.statusCode });
  }

  // Default internal server error
  return Response.json({
    error: 'Internal server error',
    message: 'An unexpected error occurred',
    code: 'INTERNAL_ERROR'
  }, { status: 500 });
};

export const withErrorHandling = (handler) => {
  return async (req) => {
    try {
      return await handler(req);
    } catch (error) {
      return handleError(error, req);
    }
  };
};