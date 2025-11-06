import { ERROR_CODES, createErrorResponse, formatZodError } from '../utils/errorResponse.js';

export const createErrorHandler = ({ logger }) => {
  return (err, req, res, _next) => {
    // Log error with full context
    logger.error('Unhandled error', {
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      path: req.path,
      method: req.method,
      code: err.code,
      status: err.status || err.statusCode || 500,
      body: process.env.NODE_ENV === 'development' ? req.body : undefined
    });

    // Handle Zod validation errors
    if (err.name === 'ZodError') {
      const zodError = formatZodError(err);
      const errorResponse = {
        success: false,
        error: zodError,
        timestamp: new Date().toISOString(),
        path: req.originalUrl || req.url
      };
      return res.status(400).json(errorResponse);
    }

    // Handle custom application errors with error codes
    if (err.code && Object.values(ERROR_CODES).includes(err.code)) {
      const errorResponse = createErrorResponse(
        err.code,
        err.message || 'An error occurred',
        err.details || null
      );
      errorResponse.path = req.originalUrl || req.url;
      
      return res.status(err.status || err.statusCode || 500).json(errorResponse);
    }

    // Handle file system errors
    if (err.code && err.code.startsWith('E')) {
      const fileSystemErrors = {
        'ENOENT': { status: 404, code: ERROR_CODES.FILE_NOT_FOUND, message: 'File not found' },
        'EACCES': { status: 403, code: ERROR_CODES.FORBIDDEN, message: 'Permission denied' },
        'EISDIR': { status: 400, code: ERROR_CODES.INVALID_INPUT, message: 'Expected file, found directory' },
        'ENOTDIR': { status: 400, code: ERROR_CODES.INVALID_INPUT, message: 'Expected directory, found file' },
        'EEXIST': { status: 409, code: ERROR_CODES.RESOURCE_ALREADY_EXISTS, message: 'File already exists' },
        'ENOSPC': { status: 507, code: ERROR_CODES.INTERNAL_SERVER_ERROR, message: 'No space left on device' },
        'EMFILE': { status: 503, code: ERROR_CODES.INTERNAL_SERVER_ERROR, message: 'Too many open files' }
      };

      const fsError = fileSystemErrors[err.code];
      if (fsError) {
        const errorResponse = createErrorResponse(
          fsError.code,
          fsError.message,
          { path: err.path, syscall: err.syscall }
        );
        errorResponse.path = req.originalUrl || req.url;
        return res.status(fsError.status).json(errorResponse);
      }
    }

    // Handle rate limit errors (from express-rate-limit)
    if (err.status === 429 || err.statusCode === 429) {
      const errorResponse = createErrorResponse(
        ERROR_CODES.RATE_LIMIT_EXCEEDED,
        'Too many requests, please try again later',
        { retryAfter: err.retryAfter || 60 }
      );
      errorResponse.path = req.originalUrl || req.url;
      return res.status(429).json(errorResponse);
    }

    // Handle timeout errors
    if (err.timeout || err.code === 'ETIMEDOUT' || err.code === 'ESOCKETTIMEDOUT') {
      const errorResponse = createErrorResponse(
        ERROR_CODES.REQUEST_TIMEOUT,
        'Request timeout',
        { timeout: err.timeout }
      );
      errorResponse.path = req.originalUrl || req.url;
      return res.status(408).json(errorResponse);
    }

    // Handle JSON parsing errors
    if (err instanceof SyntaxError && 'body' in err) {
      const errorResponse = createErrorResponse(
        ERROR_CODES.INVALID_INPUT,
        'Invalid JSON in request body',
        null
      );
      errorResponse.path = req.originalUrl || req.url;
      return res.status(400).json(errorResponse);
    }

    // Handle generic errors with standardized format
    const errorResponse = createErrorResponse(
      ERROR_CODES.INTERNAL_SERVER_ERROR,
      err.message || 'Internal server error',
      process.env.NODE_ENV === 'development' ? { 
        stack: err.stack,
        code: err.code 
      } : null
    );
    errorResponse.path = req.originalUrl || req.url;

    res.status(err.status || err.statusCode || 500).json(errorResponse);
  };
};
