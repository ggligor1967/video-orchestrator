import { describe, it, expect, beforeEach } from 'vitest';
import { 
  ERROR_CODES, 
  createErrorResponse, 
  sendError, 
  ErrorResponses, 
  formatZodError,
  asyncHandler
} from '../../src/utils/errorResponse.js';
import { z } from 'zod';

describe('Error Response Utilities', () => {
  describe('createErrorResponse', () => {
    it('should create basic error response', () => {
      const error = createErrorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        'Validation failed'
      );

      expect(error).toMatchObject({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Validation failed'
        },
        timestamp: expect.any(String)
      });
    });

    it('should include details when provided', () => {
      const error = createErrorResponse(
        ERROR_CODES.INVALID_INPUT,
        'Invalid field',
        { field: 'email', reason: 'Invalid format' }
      );

      expect(error.error.details).toEqual({
        field: 'email',
        reason: 'Invalid format'
      });
    });

    it('should have ISO timestamp', () => {
      const error = createErrorResponse(
        ERROR_CODES.INTERNAL_SERVER_ERROR,
        'Server error'
      );

      expect(new Date(error.timestamp)).toBeInstanceOf(Date);
    });
  });

  describe('sendError', () => {
    it('should send error response with status code', () => {
      const mockRes = {
        status: (code) => {
          expect(code).toBe(400);
          return mockRes;
        },
        json: (data) => {
          expect(data.success).toBe(false);
          expect(data.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
          expect(data.path).toBe('/test');
          return mockRes;
        },
        req: { originalUrl: '/test' }
      };

      sendError(mockRes, 400, ERROR_CODES.VALIDATION_ERROR, 'Test error');
    });
  });

  describe('ErrorResponses helpers', () => {
    let mockRes;

    beforeEach(() => {
      mockRes = {
        status: (code) => {
          mockRes.statusCode = code;
          return mockRes;
        },
        json: (data) => {
          mockRes.jsonData = data;
          return mockRes;
        },
        req: { originalUrl: '/test' }
      };
    });

    it('badRequest should return 400', () => {
      ErrorResponses.badRequest(mockRes, 'Bad request');
      
      expect(mockRes.statusCode).toBe(400);
      expect(mockRes.jsonData.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
    });

    it('invalidInput should include field info', () => {
      ErrorResponses.invalidInput(mockRes, 'email', 'Invalid format');
      
      expect(mockRes.statusCode).toBe(400);
      expect(mockRes.jsonData.error.details.field).toBe('email');
      expect(mockRes.jsonData.error.details.reason).toBe('Invalid format');
    });

    it('missingField should include field name', () => {
      ErrorResponses.missingField(mockRes, 'username');
      
      expect(mockRes.statusCode).toBe(400);
      expect(mockRes.jsonData.error.code).toBe(ERROR_CODES.MISSING_REQUIRED_FIELD);
      expect(mockRes.jsonData.error.details.field).toBe('username');
    });

    it('notFound should return 404', () => {
      ErrorResponses.notFound(mockRes, 'User');
      
      expect(mockRes.statusCode).toBe(404);
      expect(mockRes.jsonData.error.message).toContain('User not found');
    });

    it('forbidden should return 403', () => {
      ErrorResponses.forbidden(mockRes);
      
      expect(mockRes.statusCode).toBe(403);
      expect(mockRes.jsonData.error.code).toBe(ERROR_CODES.FORBIDDEN);
    });

    it('pathTraversal should include attempted path', () => {
      ErrorResponses.pathTraversal(mockRes, '../etc/passwd');
      
      expect(mockRes.statusCode).toBe(403);
      expect(mockRes.jsonData.error.code).toBe(ERROR_CODES.PATH_TRAVERSAL_DENIED);
      expect(mockRes.jsonData.error.details.attemptedPath).toBe('../etc/passwd');
    });

    it('internalError should return 500', () => {
      ErrorResponses.internalError(mockRes, 'Database error');
      
      expect(mockRes.statusCode).toBe(500);
      expect(mockRes.jsonData.error.code).toBe(ERROR_CODES.INTERNAL_SERVER_ERROR);
    });

    it('serviceError should include service name', () => {
      const error = new Error('Connection refused');
      ErrorResponses.serviceError(mockRes, 'AI Service', error);
      
      expect(mockRes.statusCode).toBe(500);
      expect(mockRes.jsonData.error.details.service).toBe('AI Service');
      expect(mockRes.jsonData.error.details.error).toBe('Connection refused');
    });

    it('ffmpegError should include command details', () => {
      const error = new Error('FFmpeg failed');
      ErrorResponses.ffmpegError(mockRes, 'crop', error);
      
      expect(mockRes.statusCode).toBe(500);
      expect(mockRes.jsonData.error.code).toBe(ERROR_CODES.FFMPEG_ERROR);
      expect(mockRes.jsonData.error.details.command).toBe('crop');
    });

    it('rateLimitExceeded should return 429', () => {
      ErrorResponses.rateLimitExceeded(mockRes, 120);
      
      expect(mockRes.statusCode).toBe(429);
      expect(mockRes.jsonData.error.code).toBe(ERROR_CODES.RATE_LIMIT_EXCEEDED);
      expect(mockRes.jsonData.error.details.retryAfter).toBe(120);
    });
  });

  describe('formatZodError', () => {
    it('should format Zod validation errors', () => {
      const schema = z.object({
        email: z.string().email(),
        age: z.number().min(18)
      });

      try {
        schema.parse({ email: 'invalid', age: 15 });
      } catch (zodError) {
        const formatted = formatZodError(zodError);
        
        expect(formatted.code).toBe(ERROR_CODES.VALIDATION_ERROR);
        expect(formatted.message).toBe('Validation failed');
        expect(formatted.details.errors).toHaveLength(2);
        expect(formatted.details.errors[0].field).toBe('email');
        expect(formatted.details.errors[1].field).toBe('age');
      }
    });

    it('should handle nested field paths', () => {
      const schema = z.object({
        user: z.object({
          profile: z.object({
            name: z.string().min(1)
          })
        })
      });

      try {
        schema.parse({ user: { profile: { name: '' } } });
      } catch (zodError) {
        const formatted = formatZodError(zodError);
        
        expect(formatted.details.errors[0].field).toBe('user.profile.name');
      }
    });
  });

  describe('asyncHandler', () => {
    it('should catch async errors and call next', async () => {
      const error = new Error('Async error');
      const handler = asyncHandler(async (_req, _res, _next) => {
        throw error;
      });

      const mockNext = (err) => {
        expect(err).toBe(error);
      };

      await handler({}, {}, mockNext);
    });

    it('should not call next if no error', async () => {
      const handler = asyncHandler(async (_req, res, _next) => {
        res.json({ success: true });
      });

      let nextCalled = false;
      const mockNext = () => { nextCalled = true; };
      const mockRes = { json: () => {} };

      await handler({}, mockRes, mockNext);
      expect(nextCalled).toBe(false);
    });
  });

  describe('ERROR_CODES consistency', () => {
    it('should have unique error codes', () => {
      const codes = Object.values(ERROR_CODES);
      const uniqueCodes = new Set(codes);
      
      expect(codes.length).toBe(uniqueCodes.size);
    });

    it('should have uppercase snake_case codes', () => {
      Object.values(ERROR_CODES).forEach(code => {
        expect(code).toMatch(/^[A-Z_]+$/);
      });
    });
  });

  describe('Response format consistency', () => {
    it('all error responses should have success: false', () => {
      const error = createErrorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        'Test'
      );
      
      expect(error.success).toBe(false);
    });

    it('all error responses should have error.code', () => {
      const error = createErrorResponse(
        ERROR_CODES.NOT_FOUND,
        'Not found'
      );
      
      expect(error.error.code).toBe(ERROR_CODES.NOT_FOUND);
    });

    it('all error responses should have error.message', () => {
      const error = createErrorResponse(
        ERROR_CODES.INTERNAL_SERVER_ERROR,
        'Server error'
      );
      
      expect(error.error.message).toBe('Server error');
    });

    it('all error responses should have timestamp', () => {
      const error = createErrorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        'Test'
      );
      
      expect(error.timestamp).toBeDefined();
      expect(typeof error.timestamp).toBe('string');
    });
  });
});
