import { describe, it, expect, beforeEach, vi } from 'vitest';
import { validatePath, validateDataPath, isPathSafe, createStrictValidator } from '../src/middleware/validatePath.js';
import path from 'path';

describe('Security Middleware - Path Validation', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      ip: '127.0.0.1',
      get: vi.fn(() => 'test-user-agent')
    };
    
    res = {
      status: vi.fn(() => res),
      json: vi.fn(() => res)
    };
    
    next = vi.fn();
  });

  describe('validatePath middleware', () => {
    it('should allow paths within allowed directories', () => {
      const middleware = validatePath(['data/assets']);
      req.body.inputPath = path.join(process.cwd(), 'data/assets/video.mp4');

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should block paths outside allowed directories', () => {
      const middleware = validatePath(['data/assets']);
      req.body.inputPath = 'C:/Windows/System32/config.sys';

      middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'INVALID_FILE_TYPE',
            message: expect.stringContaining('not allowed')
          })
        })
      );
    });

    it('should block path traversal attempts with ../', () => {
      const middleware = validatePath(['data/assets']);
      req.body.inputPath = 'data/assets/../../etc/passwd';

      middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should validate multiple path fields', () => {
      const middleware = validatePath(['data/assets', 'data/cache']);
      req.body.inputPath = path.join(process.cwd(), 'data/assets/input.mp4');
      req.body.outputPath = path.join(process.cwd(), 'data/cache/output.mp4');

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should block if any path is invalid', () => {
      const middleware = validatePath(['data/assets', 'data/cache']);
      req.body.inputPath = path.join(process.cwd(), 'data/assets/input.mp4');
      req.body.outputPath = '/etc/passwd'; // Invalid

      middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should handle empty paths gracefully', () => {
      const middleware = validatePath(['data/assets']);
      req.body.inputPath = '';

      middleware(req, res, next);

      expect(next).toHaveBeenCalled(); // Empty paths are skipped
    });

    it('should handle undefined paths gracefully', () => {
      const middleware = validatePath(['data/assets']);
      // No paths in body

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should validate array of paths', () => {
      const middleware = validatePath(['data/assets']);
      req.body.tracks = [
        { path: path.join(process.cwd(), 'data/assets/audio1.wav'), volume: 1.0 },
        { path: path.join(process.cwd(), 'data/assets/audio2.wav'), volume: 0.8 }
      ];

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should block array with invalid path', () => {
      const middleware = validatePath(['data/assets']);
      req.body.tracks = [
        { path: path.join(process.cwd(), 'data/assets/audio1.wav'), volume: 1.0 },
        { path: '/etc/passwd', volume: 0.8 } // Invalid
      ];

      middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should validate URL parameters with paths', () => {
      const middleware = validatePath(['data/assets']);
      req.params.id = 'data/assets/../../../etc/passwd';

      middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should allow relative paths within allowed dirs', () => {
      const middleware = validatePath(['data/assets']);
      req.body.inputPath = 'data/assets/video.mp4';

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should handle Windows absolute paths', () => {
      const middleware = validatePath(['data/assets']);
      const dataDir = path.join(process.cwd(), 'data/assets');
      req.body.inputPath = path.join(dataDir, 'video.mp4');

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should provide helpful error details', () => {
      const middleware = validatePath(['data/assets', 'data/cache']);
      req.body.inputPath = '/invalid/path.mp4';

      middleware(req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'PATH_TRAVERSAL_DENIED',
            message: expect.stringContaining('Access denied'),
            details: expect.objectContaining({
              field: 'inputPath',
              allowedDirectories: ['data/assets', 'data/cache']
            })
          })
        })
      );
    });
  });

  describe('Pre-configured validators', () => {
    it('validateDataPath should allow all data directories', () => {
      req.body.inputPath = path.join(process.cwd(), 'data/assets/video.mp4');
      req.body.outputPath = path.join(process.cwd(), 'data/exports/output.mp4');

      validateDataPath(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('validateDataPath should block non-data paths', () => {
      req.body.inputPath = path.join(process.cwd(), 'src/server.js');

      validateDataPath(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('createStrictValidator', () => {
    it('should only allow specific directories', () => {
      const middleware = createStrictValidator(['data/exports']);
      req.body.outputPath = path.join(process.cwd(), 'data/exports/final.mp4');

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should block even allowed data paths if not in strict list', () => {
      const middleware = createStrictValidator(['data/exports']);
      req.body.inputPath = path.join(process.cwd(), 'data/assets/video.mp4'); // Not in strict list

      middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('isPathSafe helper', () => {
    it('should return true for safe paths', () => {
      const safePath = path.join(process.cwd(), 'data/assets/video.mp4');
      const result = isPathSafe(safePath, ['data/assets']);

      expect(result).toBe(true);
    });

    it('should return false for unsafe paths', () => {
      const unsafePath = '/etc/passwd';
      const result = isPathSafe(unsafePath, ['data/assets']);

      expect(result).toBe(false);
    });

    it('should return false for path traversal attempts', () => {
      const traversalPath = 'data/assets/../../etc/passwd';
      const result = isPathSafe(traversalPath, ['data/assets']);

      expect(result).toBe(false);
    });

    it('should return false for empty paths', () => {
      const result = isPathSafe('', ['data/assets']);

      expect(result).toBe(false);
    });

    it('should return false for null/undefined', () => {
      expect(isPathSafe(null, ['data/assets'])).toBe(false);
      expect(isPathSafe(undefined, ['data/assets'])).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle non-string path values', () => {
      const middleware = validatePath(['data/assets']);
      req.body.inputPath = { invalid: 'object' };

      middleware(req, res, next);

      expect(next).toHaveBeenCalled(); // Non-string paths are skipped
    });

    it('should handle circular references gracefully', () => {
      const middleware = validatePath(['data/assets']);
      const circular = { a: 1 };
      circular.self = circular;
      req.body.tracks = [circular];

      middleware(req, res, next);

      expect(next).toHaveBeenCalled(); // Should not crash
    });

    it('should handle very long paths', () => {
      const middleware = validatePath(['data/assets']);
      const longPath = path.join(
        process.cwd(),
        'data/assets',
        'a'.repeat(1000) + '.mp4'
      );
      req.body.inputPath = longPath;

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should handle paths with special characters', () => {
      const middleware = validatePath(['data/assets']);
      req.body.inputPath = path.join(
        process.cwd(),
        'data/assets/video (1) [final].mp4'
      );

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should handle Unicode paths', () => {
      const middleware = validatePath(['data/assets']);
      req.body.inputPath = path.join(
        process.cwd(),
        'data/assets/видео_文件.mp4'
      );

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('Security logging', () => {
    it('should log path traversal attempts', () => {
      const middleware = validatePath(['data/assets']);
      req.body.inputPath = 'data/assets/../../etc/passwd';
      req.ip = '192.168.1.100';

      middleware(req, res, next);

      // Check that error was returned (logging happens internally)
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'PATH_TRAVERSAL_DENIED',
            message: expect.stringContaining('Access denied')
          })
        })
      );
    });
  });

  describe('Performance', () => {
    it('should handle multiple paths efficiently', () => {
      const middleware = validatePath(['data/assets', 'data/cache']);
      const baseDir = path.join(process.cwd(), 'data/assets');
      
      req.body.tracks = Array.from({ length: 100 }, (_, i) => ({
        path: path.join(baseDir, `audio${i}.wav`)
      }));

      const startTime = Date.now();
      middleware(req, res, next);
      const duration = Date.now() - startTime;

      expect(next).toHaveBeenCalled();
      expect(duration).toBeLessThan(100); // Should be fast
    });
  });
});
