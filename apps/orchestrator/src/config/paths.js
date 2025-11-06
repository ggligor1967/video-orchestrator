/**
 * Paths Configuration Module
 * 
 * Centralized configuration for all file system paths used in the application.
 * This module provides a single source of truth for directory paths, making it
 * easier to maintain and modify paths across the entire application.
 * 
 * Usage:
 *   import { paths } from '../config/paths.js';
 *   const backgroundsDir = paths.backgrounds;
 *   const cacheDir = paths.cache;
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Platform detection
const isWindows = process.platform === 'win32';
const isMac = process.platform === 'darwin';
const isLinux = process.platform === 'linux';

/**
 * Get platform-specific executable name
 * @param {string} name - Base executable name
 * @returns {string} Platform-specific executable name
 */
const getExecutable = (name) => {
  if (isWindows) return `${name}.exe`;
  return name;
};

/**
 * Get platform-specific system fonts
 * @returns {Object} Font paths for current platform
 */
const getSystemFonts = () => {
  if (isWindows) {
    return {
      default: 'C:/Windows/Fonts/arial.ttf',
      bold: 'C:/Windows/Fonts/arialbd.ttf',
      italic: 'C:/Windows/Fonts/ariali.ttf',
      boldItalic: 'C:/Windows/Fonts/arialbi.ttf'
    };
  } else if (isMac) {
    return {
      default: '/System/Library/Fonts/Helvetica.ttc',
      bold: '/System/Library/Fonts/Helvetica-Bold.ttc',
      italic: '/System/Library/Fonts/Helvetica-Oblique.ttc',
      boldItalic: '/System/Library/Fonts/Helvetica-BoldOblique.ttc'
    };
  } else {
    // Linux
    return {
      default: '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
      bold: '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf',
      italic: '/usr/share/fonts/truetype/liberation/LiberationSans-Italic.ttf',
      boldItalic: '/usr/share/fonts/truetype/liberation/LiberationSans-BoldItalic.ttf'
    };
  }
};

// Root directories
const PROJECT_ROOT = path.resolve(__dirname, '../../../..');
const DATA_ROOT = path.join(PROJECT_ROOT, 'data');
const TOOLS_ROOT = path.join(PROJECT_ROOT, 'tools');

/**
 * Application paths configuration
 * All paths are absolute and resolved from the project root
 */
export const paths = {
  // Project structure
  root: PROJECT_ROOT,
  dataRoot: DATA_ROOT,
  
  // Asset directories
  backgrounds: path.join(DATA_ROOT, 'assets', 'backgrounds'),
  audio: path.join(DATA_ROOT, 'assets', 'audio'),
  assetFonts: path.join(DATA_ROOT, 'assets', 'fonts'),
  overlays: path.join(DATA_ROOT, 'assets', 'overlays'),
  
  // Processing directories
  cache: path.join(DATA_ROOT, 'cache'),
  cacheAI: path.join(DATA_ROOT, 'cache', 'ai'),
  cacheVideo: path.join(DATA_ROOT, 'cache', 'video'),
  cacheAudio: path.join(DATA_ROOT, 'cache', 'audio'),
  
  // Output directories
  exports: path.join(DATA_ROOT, 'exports'),
  tts: path.join(DATA_ROOT, 'tts'),
  subs: path.join(DATA_ROOT, 'subs'),
  
  // Tool binaries - cross-platform support
  tools: TOOLS_ROOT,
  ffmpeg: path.join(TOOLS_ROOT, 'ffmpeg', getExecutable('ffmpeg')),
  ffprobe: path.join(TOOLS_ROOT, 'ffmpeg', getExecutable('ffprobe')),
  ffplay: path.join(TOOLS_ROOT, 'ffmpeg', getExecutable('ffplay')),
  piper: path.join(TOOLS_ROOT, 'piper', getExecutable('piper')),
  piperModels: path.join(TOOLS_ROOT, 'piper', 'models'),
  whisper: path.join(TOOLS_ROOT, 'whisper', getExecutable('main')),
  whisperModels: path.join(TOOLS_ROOT, 'whisper', 'models'),
  godot: path.join(TOOLS_ROOT, 'godot', getExecutable('godot')),
  
  // System fonts
  fonts: getSystemFonts(),
  
  // Platform info
  platform: {
    isWindows,
    isMac,
    isLinux,
    os: process.platform,
    arch: process.arch
  }
};

/**
 * Get a path by key with optional subpath
 * @param {string} key - Path key from paths object
 * @param {...string} subpaths - Optional subpath segments to append
 * @returns {string} Resolved absolute path
 * @throws {Error} If key doesn't exist
 * 
 * @example
 * getPath('backgrounds') // => '/path/to/data/assets/backgrounds'
 * getPath('cache', 'video', 'output.mp4') // => '/path/to/data/cache/video/output.mp4'
 */
export function getPath(key, ...subpaths) {
  if (!(key in paths)) {
    throw new Error(`Invalid path key: ${key}. Available keys: ${Object.keys(paths).join(', ')}`);
  }
  
  const basePath = paths[key];
  
  if (subpaths.length === 0) {
    return basePath;
  }
  
  return path.join(basePath, ...subpaths);
}

/**
 * Get relative path from project root
 * Useful for logging and display purposes
 * @param {string} absolutePath - Absolute path to convert
 * @returns {string} Relative path from project root
 * 
 * @example
 * getRelativePath('/path/to/data/cache/video.mp4') // => 'data/cache/video.mp4'
 */
export function getRelativePath(absolutePath) {
  return path.relative(PROJECT_ROOT, absolutePath);
}

/**
 * Resolve path (handles both absolute and relative)
 * @param {string} inputPath - Input path
 * @returns {string} Absolute path
 * 
 * @example
 * resolvePath('data/cache/video.mp4') // => '/full/path/to/data/cache/video.mp4'
 * resolvePath('/full/path/file.mp4') // => '/full/path/file.mp4'
 */
export function resolvePath(inputPath) {
  if (path.isAbsolute(inputPath)) {
    return inputPath;
  }
  return path.join(PROJECT_ROOT, inputPath);
}

/**
 * Sanitize user-provided path (prevent path traversal)
 * @param {string} userPath - User input path
 * @returns {string} Sanitized path
 * @throws {Error} If path traversal detected
 * 
 * @example
 * sanitizePath('cache/video.mp4') // => 'cache/video.mp4'
 * sanitizePath('../../../etc/passwd') // => throws Error
 */
export function sanitizePath(userPath) {
  const normalized = path.normalize(userPath);
  if (normalized.includes('..')) {
    throw new Error('Path traversal attempt detected');
  }
  return normalized;
}

/**
 * Validate that a path is within allowed directories
 * Used for security checks to prevent path traversal
 * @param {string} targetPath - Path to validate
 * @param {string[]} allowedKeys - Array of allowed path keys
 * @returns {boolean} True if path is within allowed directories
 * 
 * @example
 * isPathAllowed('/data/cache/video.mp4', ['cache', 'exports']) // => true
 * isPathAllowed('/etc/passwd', ['cache', 'exports']) // => false
 */
export function isPathAllowed(targetPath, allowedKeys) {
  const resolvedTarget = path.resolve(targetPath);
  
  for (const key of allowedKeys) {
    if (!(key in paths)) {
      continue;
    }
    
    const allowedPath = paths[key];
    const relativePath = path.relative(allowedPath, resolvedTarget);
    
    // Check if target is within allowed directory
    // relativePath should not start with '..' (going up)
    if (!relativePath.startsWith('..') && !path.isAbsolute(relativePath)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Ensure directory exists, create if needed
 * @param {string} key - Path key from paths object
 * @returns {Promise<string>} Resolved path
 * 
 * @example
 * await ensureDir('cache') // Creates cache directory if it doesn't exist
 */
export async function ensureDir(key) {
  const { mkdir } = await import('fs/promises');
  const dirPath = getPath(key);
  
  try {
    await mkdir(dirPath, { recursive: true });
    return dirPath;
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw new Error(`Failed to create directory ${key}: ${error.message}`);
    }
    return dirPath;
  }
}

/**
 * Get all paths as an object (for debugging/logging)
 * @returns {Object} All configured paths
 */
export function getAllPaths() {
  return { ...paths };
}

// Export default for convenience
export default {
  paths,
  getPath,
  getRelativePath,
  resolvePath,
  sanitizePath,
  isPathAllowed,
  ensureDir,
  getAllPaths
};
