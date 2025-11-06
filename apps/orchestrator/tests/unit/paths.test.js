import { describe, it, expect } from 'vitest';
import path from 'path';
import { 
  paths, 
  getPath, 
  getRelativePath, 
  isPathAllowed, 
  getAllPaths 
} from '../../src/config/paths.js';

describe('Paths Configuration', () => {
  describe('paths object', () => {
    it('should have all required path keys', () => {
      const requiredKeys = [
        'root',
        'dataRoot',
        'backgrounds',
        'audio',
        'cache',
        'exports',
        'tts',
        'subs',
        'tools',
        'ffmpeg',
        'piper',
        'whisper'
      ];

      requiredKeys.forEach(key => {
        expect(paths).toHaveProperty(key);
        expect(typeof paths[key]).toBe('string');
        expect(path.isAbsolute(paths[key])).toBe(true);
      });
    });

    it('should have consistent root structure', () => {
      expect(paths.dataRoot).toContain('data');
      expect(paths.backgrounds).toContain(path.join('data', 'assets', 'backgrounds'));
      expect(paths.cache).toContain(path.join('data', 'cache'));
      expect(paths.exports).toContain(path.join('data', 'exports'));
      expect(paths.tts).toContain(path.join('data', 'tts'));
      expect(paths.subs).toContain(path.join('data', 'subs'));
    });

    it('should have tools paths configured', () => {
      expect(paths.tools).toContain('tools');
      expect(paths.ffmpeg).toContain(path.join('tools', 'ffmpeg'));
      expect(paths.piper).toContain(path.join('tools', 'piper'));
      expect(paths.whisper).toContain(path.join('tools', 'whisper'));
    });
  });

  describe('getPath()', () => {
    it('should return path for valid key', () => {
      const backgroundsPath = getPath('backgrounds');
      expect(backgroundsPath).toBe(paths.backgrounds);
      expect(path.isAbsolute(backgroundsPath)).toBe(true);
    });

    it('should return path with subpaths appended', () => {
      const videoPath = getPath('backgrounds', 'test-video.mp4');
      expect(videoPath).toContain('backgrounds');
      expect(videoPath).toContain('test-video.mp4');
      expect(path.basename(videoPath)).toBe('test-video.mp4');
    });

    it('should handle multiple subpath segments', () => {
      const deepPath = getPath('cache', 'video', 'output', 'final.mp4');
      expect(deepPath).toContain('cache');
      expect(deepPath).toContain(path.join('video', 'output', 'final.mp4'));
    });

    it('should throw error for invalid key', () => {
      expect(() => getPath('invalid_key')).toThrow('Invalid path key');
      expect(() => getPath('nonexistent')).toThrow('Available keys:');
    });

    it('should work with all valid keys', () => {
      const keys = Object.keys(paths);
      keys.forEach(key => {
        expect(() => getPath(key)).not.toThrow();
      });
    });
  });

  describe('getRelativePath()', () => {
    it('should return relative path from project root', () => {
      const absolutePath = paths.backgrounds;
      const relativePath = getRelativePath(absolutePath);
      
      expect(relativePath).not.toContain(paths.root);
      expect(relativePath).toContain('data');
    });

    it('should handle nested paths', () => {
      const nestedPath = path.join(paths.cache, 'video', 'output.mp4');
      const relativePath = getRelativePath(nestedPath);
      
      expect(relativePath).toContain('cache');
      expect(relativePath).toContain('output.mp4');
      expect(path.isAbsolute(relativePath)).toBe(false);
    });

    it('should work with subpath notation', () => {
      const videoPath = getPath('backgrounds', 'test.mp4');
      const relativePath = getRelativePath(videoPath);
      
      expect(relativePath).toContain('backgrounds');
      expect(relativePath).toContain('test.mp4');
    });
  });

  describe('isPathAllowed()', () => {
    it('should allow paths within specified directories', () => {
      const testPath = path.join(paths.cache, 'video.mp4');
      const allowed = isPathAllowed(testPath, ['cache', 'exports']);
      
      expect(allowed).toBe(true);
    });

    it('should allow paths in exports directory', () => {
      const testPath = path.join(paths.exports, 'final.mp4');
      const allowed = isPathAllowed(testPath, ['exports']);
      
      expect(allowed).toBe(true);
    });

    it('should reject paths outside allowed directories', () => {
      const testPath = '/etc/passwd';
      const allowed = isPathAllowed(testPath, ['cache', 'exports']);
      
      expect(allowed).toBe(false);
    });

    it('should reject path traversal attempts', () => {
      const testPath = path.join(paths.cache, '..', '..', 'etc', 'passwd');
      const allowed = isPathAllowed(testPath, ['cache']);
      
      expect(allowed).toBe(false);
    });

    it('should handle multiple allowed keys', () => {
      const cachePath = path.join(paths.cache, 'temp.mp4');
      const exportsPath = path.join(paths.exports, 'final.mp4');
      const allowedKeys = ['cache', 'exports', 'tts'];
      
      expect(isPathAllowed(cachePath, allowedKeys)).toBe(true);
      expect(isPathAllowed(exportsPath, allowedKeys)).toBe(true);
    });

    it('should reject invalid keys gracefully', () => {
      const testPath = path.join(paths.cache, 'video.mp4');
      const allowed = isPathAllowed(testPath, ['invalid_key', 'cache']);
      
      // Should still allow because 'cache' is valid
      expect(allowed).toBe(true);
    });

    it('should handle Windows paths correctly', () => {
      const windowsPath = 'C:\\Windows\\System32\\config.sys';
      const allowed = isPathAllowed(windowsPath, ['cache', 'exports']);
      
      expect(allowed).toBe(false);
    });
  });

  describe('getAllPaths()', () => {
    it('should return all configured paths', () => {
      const allPaths = getAllPaths();
      
      expect(typeof allPaths).toBe('object');
      expect(Object.keys(allPaths).length).toBeGreaterThan(0);
    });

    it('should return a copy of paths object', () => {
      const allPaths = getAllPaths();
      
      // Modifying the returned object should not affect the original
      allPaths.newKey = 'test';
      expect(paths.newKey).toBeUndefined();
    });

    it('should have all expected keys', () => {
      const allPaths = getAllPaths();
      const expectedKeys = ['root', 'dataRoot', 'backgrounds', 'cache', 'exports', 'tts', 'subs'];
      
      expectedKeys.forEach(key => {
        expect(allPaths).toHaveProperty(key);
      });
    });
  });

  describe('Path Consistency', () => {
    it('should have data paths under dataRoot', () => {
      expect(paths.backgrounds.startsWith(paths.dataRoot)).toBe(true);
      expect(paths.cache.startsWith(paths.dataRoot)).toBe(true);
      expect(paths.exports.startsWith(paths.dataRoot)).toBe(true);
      expect(paths.tts.startsWith(paths.dataRoot)).toBe(true);
      expect(paths.subs.startsWith(paths.dataRoot)).toBe(true);
    });

    it('should have tool paths under tools root', () => {
      expect(paths.ffmpeg.startsWith(paths.tools)).toBe(true);
      expect(paths.piper.startsWith(paths.tools)).toBe(true);
      expect(paths.whisper.startsWith(paths.tools)).toBe(true);
    });

    it('should have cache subdirectories under cache', () => {
      if (paths.cacheAI) {
        expect(paths.cacheAI.startsWith(paths.cache)).toBe(true);
      }
      if (paths.cacheVideo) {
        expect(paths.cacheVideo.startsWith(paths.cache)).toBe(true);
      }
      if (paths.cacheAudio) {
        expect(paths.cacheAudio.startsWith(paths.cache)).toBe(true);
      }
    });

    it('should not have duplicate or conflicting paths', () => {
      const pathValues = Object.values(paths);
      const uniquePaths = new Set(pathValues);
      
      // All paths should be unique
      expect(pathValues.length).toBe(uniquePaths.size);
    });
  });

  describe('Platform Compatibility', () => {
    it('should use correct path separators', () => {
      const testPath = getPath('backgrounds', 'subfolder', 'video.mp4');
      const separators = testPath.match(/[/\\]/g) || [];
      
      // All separators should be consistent (platform-specific)
      const uniqueSeps = new Set(separators);
      expect(uniqueSeps.size).toBeLessThanOrEqual(1);
    });

    it('should handle absolute paths correctly', () => {
      Object.values(paths).forEach(p => {
        // Skip nested objects (fonts, platform)
        if (typeof p === 'string') {
          expect(path.isAbsolute(p)).toBe(true);
        }
      });
    });
  });
});
