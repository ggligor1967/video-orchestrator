/**
 * Validation Middleware Factory
 * 
 * Creates Express middleware for request validation using Zod schemas.
 * Provides consistent error handling for validation failures.
 */

import { formatZodError } from '../utils/errorResponse.js';

/**
 * Create validation middleware for request body
 * 
 * @param {ZodSchema} schema - Zod schema to validate against
 * @param {Object} options - Validation options
 * @param {boolean} options.stripUnknown - Remove unknown properties (default: true)
 * @param {string} options.source - Request source to validate ('body', 'query', 'params')
 * @returns {Function} - Express middleware
 */
export function validateRequest(schema, options = {}) {
  const { source = 'body' } = options;

  return (req, res, next) => {
    try {
      const dataToValidate = req[source];
      
      // Parse and validate data
      const validated = schema.parse(dataToValidate);
      
      // Replace request data with validated data
      req[source] = validated;
      
      // Store validated flag
      req.validated = { [source]: true };
      
      next();
    } catch (error) {
      // Handle Zod validation errors
      if (error.name === 'ZodError') {
        // Log detailed error server-side
        const zodError = formatZodError(error);
        req.app.get('container').resolve('logger').warn('Validation failed', {
          error: zodError.error,
          path: req.originalUrl || req.url,
          ip: req.ip
        });
        
        // Return sanitized error to client
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            fields: error.errors.map(e => e.path.join('.'))
          },
          timestamp: new Date().toISOString()
        });
      }
      
      // Pass other errors to error handler
      next(error);
    }
  };
}

/**
 * Validate request body
 * 
 * @param {ZodSchema} schema - Zod schema
 * @returns {Function} - Express middleware
 */
export function validateBody(schema) {
  return validateRequest(schema, { source: 'body' });
}

/**
 * Validate query parameters
 * 
 * @param {ZodSchema} schema - Zod schema
 * @returns {Function} - Express middleware
 */
export function validateQuery(schema) {
  return validateRequest(schema, { source: 'query' });
}

/**
 * Validate URL parameters
 * 
 * @param {ZodSchema} schema - Zod schema
 * @returns {Function} - Express middleware
 */
export function validateParams(schema) {
  return validateRequest(schema, { source: 'params' });
}

/**
 * Validate multiple request sources
 * 
 * @param {Object} schemas - Object with schemas for each source
 * @param {ZodSchema} schemas.body - Body schema
 * @param {ZodSchema} schemas.query - Query schema
 * @param {ZodSchema} schemas.params - Params schema
 * @returns {Function} - Express middleware
 */
export function validateMultiple(schemas) {
  return async (req, res, next) => {
    try {
      req.validated = {};
      
      // Validate body if schema provided
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
        req.validated.body = true;
      }
      
      // Validate query if schema provided
      if (schemas.query) {
        const validated = schemas.query.parse(req.query);
        Object.keys(req.query).forEach(key => delete req.query[key]);
        Object.assign(req.query, validated);
        req.validated.query = true;
      }
      
      // Validate params if schema provided
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
        req.validated.params = true;
      }
      
      next();
    } catch (error) {
      if (error.name === 'ZodError') {
        // Log detailed error server-side
        req.app.get('container').resolve('logger').warn('Multi-validation failed', {
          error: error.errors,
          path: req.originalUrl || req.url,
          ip: req.ip
        });
        
        // Return sanitized error to client
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            fields: error.errors.map(e => e.path.join('.'))
          },
          timestamp: new Date().toISOString()
        });
      }
      
      next(error);
    }
  };
}

/**
 * Custom validation error factory
 * 
 * @param {string} field - Field name
 * @param {string} message - Error message
 * @param {string} code - Error code
 * @returns {Object} - Validation error object
 */
export function createValidationError(field, message, code = 'invalid') {
  return {
    field,
    message,
    code
  };
}

export default {
  validateRequest,
  validateBody,
  validateQuery,
  validateParams,
  validateMultiple,
  createValidationError
};
