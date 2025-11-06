import { describe, it, expect } from 'vitest';
import { 
  isPathSafe, 
  sanitizeFFmpegPath, 
  sanitizeFilename, 
  hasAllowedExtension,
  createSafeTempPath 
} from '../src/utils/pathSecurity.js';
import path from 'path';
import fs from 'fs';

describe('Path Security', () => {
  describe('isPathSafe', () => {
    it('should allow paths within data directory', () => {
      const safePath = path.join(process.cwd(), 'data', 'test.mp4');
      expect(isPathSafe(safePath, ['data'])).toBe(true);
    });

    it('should allow paths within tmp directory', () => {
      const safePath = path.join(process.cwd(), 'tmp', 'uploads', 'test.mp4');
      expect(isPathSafe(safePath, ['tmp'])).toBe(true);
    });

    it('should reject paths with directory traversal', () => {
      const unsafePath = path.join(process.cwd(), 'data', '..', '..', 'etc', 'passwd');
      expect(isPathSafe(unsafePath)).toBe(false);
    });

    it('should reject paths outside allowed directories', () => {
      const unsafePath = path.join(process.cwd(), 'secret', 'file.txt');
      expect(isPathSafe(unsafePath, ['data', 'tmp'])).toBe(false);
    });

    it('should reject paths that escape project root', () => {
      const unsafePath = path.join(process.cwd(), '..', 'outside.txt');
      expect(isPathSafe(unsafePath)).toBe(false);
    });
  });

  describe('sanitizeFilename', () => {
    it('should remove path separators', () => {
      const filename = 'path/to/file.mp4';
      const sanitized = sanitizeFilename(filename);
      expect(sanitized).not.toContain('/');
      expect(sanitized).not.toContain('\\');
    });

    it('should remove null bytes', () => {
      const filename = 'file\0name.mp4';
      const sanitized = sanitizeFilename(filename);
      expect(sanitized).not.toContain('\0');
    });

    it('should replace dangerous characters', () => {
      const filename = 'file<>:"|?*.mp4';
      const sanitized = sanitizeFilename(filename);
      expect(sanitized).not.toMatch(/[<>:"|?*]/);
    });

    it('should limit filename length', () => {
      const longName = 'a'.repeat(300) + '.mp4';
      const sanitized = sanitizeFilename(longName);
      expect(sanitized.length).toBeLessThanOrEqual(255);
      expect(sanitized).toContain('.mp4');
    });

    it('should preserve valid filenames', () => {
      const filename = 'valid_file-name.mp4';
      const sanitized = sanitizeFilename(filename);
      expect(sanitized).toBe(filename);
    });
  });

  describe('hasAllowedExtension', () => {
    it('should accept allowed extensions', () => {
      const allowedExtensions = ['.mp4', '.mov', '.avi'];
      expect(hasAllowedExtension('video.mp4', allowedExtensions)).toBe(true);
      expect(hasAllowedExtension('video.MOV', allowedExtensions)).toBe(true);
    });

    it('should reject disallowed extensions', () => {
      const allowedExtensions = ['.mp4', '.mov'];
      expect(hasAllowedExtension('file.exe', allowedExtensions)).toBe(false);
      expect(hasAllowedExtension('file.sh', allowedExtensions)).toBe(false);
    });

    it('should be case-insensitive', () => {
      const allowedExtensions = ['.mp4'];
      expect(hasAllowedExtension('VIDEO.MP4', allowedExtensions)).toBe(true);
    });
  });

  describe('createSafeTempPath', () => {
    it('should create path in tmp directory', () => {
      const tempPath = createSafeTempPath('test', '.mp4');
      expect(tempPath).toContain('tmp');
      expect(tempPath).toContain('.mp4');
    });

    it('should include timestamp and random string', () => {
      const tempPath1 = createSafeTempPath('test', '.mp4');
      const tempPath2 = createSafeTempPath('test', '.mp4');
      expect(tempPath1).not.toBe(tempPath2);
    });

    it('should sanitize prefix', () => {
      const tempPath = createSafeTempPath('test/with/slashes', '.mp4');
      expect(tempPath).not.toContain('/with/');
    });
  });

  describe('sanitizeFFmpegPath - Integration', () => {
    it('should throw on non-existent file', () => {
      const fakePath = path.join(process.cwd(), 'data', 'nonexistent.mp4');
      expect(() => sanitizeFFmpegPath(fakePath)).toThrow('File does not exist');
    });

    it('should throw on unsafe path', () => {
      const unsafePath = path.join(process.cwd(), '..', 'outside.mp4');
      expect(() => sanitizeFFmpegPath(unsafePath)).toThrow('Invalid or unsafe file path');
    });

    it('should throw on path with invalid characters', () => {
      // Create a temporary file with safe name for testing
      const testDir = path.join(process.cwd(), 'tmp');
      if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
      }
      
      const validPath = path.join(testDir, 'test.mp4');
      fs.writeFileSync(validPath, '');
      
      try {
        // The function checks the input path for invalid characters
        const pathWithInvalid = validPath + ';rm -rf /';
        expect(() => sanitizeFFmpegPath(pathWithInvalid)).toThrow('invalid characters');
      } finally {
        // Cleanup
        if (fs.existsSync(validPath)) {
          fs.unlinkSync(validPath);
        }
      }
    });
  });
});
