/**
 * Standardized Error Response Utility
 * 
 * Provides consistent error formatting across all API endpoints.
 * 
 * Error Response Format:
 * {
 *   success: false,
 *   error: {
 *     code: 'ERROR_CODE',
 *     message: 'Human-readable error message',
 *     details: { ... } // Optional additional context
 *   },
 *   timestamp: '2025-10-14T12:34:56.789Z',
 *   path: '/api/endpoint'
 * }
 */

/**
 * Standard error codes by category
 */
export const ERROR_CODES = {
  // Validation Errors (400)
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  
  // Authentication/Authorization Errors (401, 403)
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_TOKEN: 'INVALID_TOKEN',
  PATH_TRAVERSAL_DENIED: 'PATH_TRAVERSAL_DENIED',
  
  // Not Found Errors (404)
  NOT_FOUND: 'NOT_FOUND',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  ENDPOINT_NOT_FOUND: 'ENDPOINT_NOT_FOUND',
  
  // Conflict Errors (409)
  CONFLICT: 'CONFLICT',
  RESOURCE_ALREADY_EXISTS: 'RESOURCE_ALREADY_EXISTS',
  
  // Server Errors (500)
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  SERVICE_ERROR: 'SERVICE_ERROR',
  EXTERNAL_TOOL_ERROR: 'EXTERNAL_TOOL_ERROR',
  FILE_OPERATION_ERROR: 'FILE_OPERATION_ERROR',
  
  // Service Specific Errors
  AI_SERVICE_ERROR: 'AI_SERVICE_ERROR',
  FFMPEG_ERROR: 'FFMPEG_ERROR',
  TTS_ERROR: 'TTS_ERROR',
  WHISPER_ERROR: 'WHISPER_ERROR',
  
  // Rate Limiting (429)
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // Timeout Errors (408, 504)
  REQUEST_TIMEOUT: 'REQUEST_TIMEOUT',
  GATEWAY_TIMEOUT: 'GATEWAY_TIMEOUT'
};

/**
 * Create a standardized error response object
 * 
 * @param {string} code - Error code from ERROR_CODES
 * @param {string} message - Human-readable error message
 * @param {Object} details - Optional additional error context
 * @returns {Object} Standardized error response
 */
export function createErrorResponse(code, message, details = null) {
  const response = {
    success: false,
    error: {
      code,
      message
    },
    timestamp: new Date().toISOString()
  };

  if (details) {
    response.error.details = details;
  }

  return response;
}

/**
 * Send a standardized error response
 * 
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} code - Error code from ERROR_CODES
 * @param {string} message - Human-readable error message
 * @param {Object} details - Optional additional error context
 */
export function sendError(res, statusCode, code, message, details = null) {
  const errorResponse = createErrorResponse(code, message, details);
  errorResponse.path = res.req?.originalUrl || res.req?.url;
  
  return res.status(statusCode).json(errorResponse);
}

/**
 * Common error response helpers
 */
export const ErrorResponses = {
  // 400 Bad Request
  badRequest(res, message, details = null) {
    return sendError(res, 400, ERROR_CODES.VALIDATION_ERROR, message, details);
  },

  invalidInput(res, field, reason) {
    return sendError(res, 400, ERROR_CODES.INVALID_INPUT, `Invalid input for field: ${field}`, { field, reason });
  },

  missingField(res, field) {
    return sendError(res, 400, ERROR_CODES.MISSING_REQUIRED_FIELD, `Missing required field: ${field}`, { field });
  },

  invalidFileType(res, expected, received) {
    return sendError(res, 400, ERROR_CODES.INVALID_FILE_TYPE, 'Invalid file type', { expected, received });
  },

  fileTooLarge(res, maxSize, actualSize) {
    return sendError(res, 400, ERROR_CODES.FILE_TOO_LARGE, 'File size exceeds limit', { maxSize, actualSize });
  },

  // 401 Unauthorized
  unauthorized(res, message = 'Unauthorized access') {
    return sendError(res, 401, ERROR_CODES.UNAUTHORIZED, message);
  },

  invalidToken(res) {
    return sendError(res, 401, ERROR_CODES.INVALID_TOKEN, 'Invalid or expired token');
  },

  // 403 Forbidden
  forbidden(res, message = 'Access forbidden') {
    return sendError(res, 403, ERROR_CODES.FORBIDDEN, message);
  },

  pathTraversal(res, path) {
    return sendError(res, 403, ERROR_CODES.PATH_TRAVERSAL_DENIED, 'Path traversal not allowed', { attemptedPath: path });
  },

  // 404 Not Found
  notFound(res, resource = 'Resource') {
    return sendError(res, 404, ERROR_CODES.RESOURCE_NOT_FOUND, `${resource} not found`);
  },

  fileNotFound(res, filePath) {
    return sendError(res, 404, ERROR_CODES.FILE_NOT_FOUND, 'File not found', { filePath });
  },

  endpointNotFound(res) {
    return sendError(res, 404, ERROR_CODES.ENDPOINT_NOT_FOUND, 'Endpoint not found');
  },

  // 409 Conflict
  conflict(res, message, details = null) {
    return sendError(res, 409, ERROR_CODES.CONFLICT, message, details);
  },

  resourceExists(res, resource) {
    return sendError(res, 409, ERROR_CODES.RESOURCE_ALREADY_EXISTS, `${resource} already exists`);
  },

  // 408 Request Timeout
  requestTimeout(res, operation) {
    return sendError(res, 408, ERROR_CODES.REQUEST_TIMEOUT, `Operation timed out: ${operation}`);
  },

  // 429 Rate Limit
  rateLimitExceeded(res, retryAfter = 60) {
    return sendError(res, 429, ERROR_CODES.RATE_LIMIT_EXCEEDED, 'Rate limit exceeded', { retryAfter });
  },

  // 500 Internal Server Error
  internalError(res, message = 'Internal server error', details = null) {
    return sendError(res, 500, ERROR_CODES.INTERNAL_SERVER_ERROR, message, details);
  },

  serviceError(res, service, error) {
    return sendError(res, 500, ERROR_CODES.SERVICE_ERROR, `${service} service error`, { 
      service,
      error: error.message 
    });
  },

  externalToolError(res, tool, error) {
    return sendError(res, 500, ERROR_CODES.EXTERNAL_TOOL_ERROR, `${tool} execution failed`, { 
      tool,
      error: error.message 
    });
  },

  fileOperationError(res, operation, filePath, error) {
    return sendError(res, 500, ERROR_CODES.FILE_OPERATION_ERROR, `File ${operation} failed`, { 
      operation,
      filePath,
      error: error.message 
    });
  },

  // Service-specific errors
  aiServiceError(res, error) {
    return sendError(res, 500, ERROR_CODES.AI_SERVICE_ERROR, 'AI service error', { error: error.message });
  },

  ffmpegError(res, command, error) {
    return sendError(res, 500, ERROR_CODES.FFMPEG_ERROR, 'FFmpeg processing failed', { 
      command,
      error: error.message 
    });
  },

  ttsError(res, error) {
    return sendError(res, 500, ERROR_CODES.TTS_ERROR, 'TTS generation failed', { error: error.message });
  },

  whisperError(res, error) {
    return sendError(res, 500, ERROR_CODES.WHISPER_ERROR, 'Subtitle generation failed', { error: error.message });
  },

  // 504 Gateway Timeout
  gatewayTimeout(res, service) {
    return sendError(res, 504, ERROR_CODES.GATEWAY_TIMEOUT, `${service} timeout`);
  }
};

/**
 * Convert Zod validation errors to standardized format
 * 
 * @param {Object} zodError - Zod validation error
 * @returns {Object} Standardized error details
 */
export function formatZodError(zodError) {
  // Zod errors have either .errors or .issues array
  const errorArray = zodError.errors || zodError.issues || [];
  
  return {
    code: ERROR_CODES.VALIDATION_ERROR,
    message: 'Validation failed',
    details: {
      errors: errorArray.map(err => ({
        field: (err.path || []).join('.'),
        message: err.message,
        code: err.code
      }))
    }
  };
}

/**
 * Wrap async route handlers to catch errors
 * 
 * @param {Function} fn - Async route handler
 * @returns {Function} Wrapped handler
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export default {
  ERROR_CODES,
  createErrorResponse,
  sendError,
  ErrorResponses,
  formatZodError,
  asyncHandler
};
