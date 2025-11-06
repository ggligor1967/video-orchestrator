import path from 'path';
import fs from 'fs';

/**
 * Path security utilities to prevent path traversal and command injection
 */

/**
 * Check if a resolved path is safe (within allowed directories)
 * @param {string} filePath - The path to validate
 * @param {string[]} allowedDirs - Array of allowed directory names (e.g., ['data', 'tmp'])
 * @returns {boolean}
 */
export function isPathSafe(filePath, allowedDirs = ['data', 'tmp', 'tools']) {
  const resolvedPath = path.resolve(filePath);
  const normalizedPath = path.normalize(resolvedPath);
  
  // Check if path contains directory traversal sequences
  if (normalizedPath.includes('..')) {
    return false;
  }

  // Check if path is within allowed directories
  const cwd = process.cwd();
  const relativePath = path.relative(cwd, normalizedPath);
  
  // Path should not escape project root
  if (relativePath.startsWith('..')) {
    return false;
  }

  // Check if path starts with one of the allowed directories
  const pathSegments = relativePath.split(path.sep);
  const topLevelDir = process.platform === 'win32' 
    ? pathSegments[0].toLowerCase() 
    : pathSegments[0];
  
  const normalizedAllowedDirs = process.platform === 'win32'
    ? allowedDirs.map(d => d.toLowerCase())
    : allowedDirs;
  
  return normalizedAllowedDirs.includes(topLevelDir);
}

/**
 * Sanitize a file path for use in FFmpeg commands
 * Prevents command injection via special characters
 * @param {string} filePath - The file path to sanitize
 * @param {string[]} allowedDirs - Directories to validate against
 * @returns {string} - Sanitized path
 * @throws {Error} - If path is unsafe
 */
export function sanitizeFFmpegPath(filePath, allowedDirs = ['data', 'tmp', 'tools']) {
  const resolvedPath = path.resolve(filePath);
  
  // Validate path safety first
  if (!isPathSafe(resolvedPath, allowedDirs)) {
    throw new Error('Invalid or unsafe file path');
  }

  // Check for invalid characters BEFORE checking file existence
  // Allow only alphanumeric, underscores, hyphens, dots, slashes, backslashes, colons, and spaces
  if (!/^[a-zA-Z0-9_\-.\s/\\:]+$/.test(filePath)) {
    throw new Error('File path contains invalid characters');
  }

  // Check if file exists
  if (!fs.existsSync(resolvedPath)) {
    throw new Error('File does not exist');
  }

  // Escape special characters for FFmpeg filter syntax
  // FFmpeg requires escaping for colons and backslashes in Windows paths
  let sanitized = filePath;
  
  // Convert backslashes to forward slashes for FFmpeg
  sanitized = sanitized.replace(/\\/g, '/');
  
  // Escape colons (for Windows drive letters like C:)
  sanitized = sanitized.replace(/:/g, '\\:');
  
  // Escape single quotes
  sanitized = sanitized.replace(/'/g, "\\'");

  return sanitized;
}

/**
 * Sanitize a filename for safe storage
 * @param {string} filename - The filename to sanitize
 * @returns {string} - Sanitized filename
 */
export function sanitizeFilename(filename) {
  // Remove path separators
  let sanitized = filename.replace(/[/\\]/g, '');
  
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');
  
  // Replace potentially dangerous characters
  sanitized = sanitized.replace(/[<>:"|?*]/g, '_');
  
  // Limit length
  if (sanitized.length > 255) {
    const ext = path.extname(sanitized);
    const name = path.basename(sanitized, ext);
    sanitized = name.substring(0, 255 - ext.length) + ext;
  }
  
  return sanitized;
}

/**
 * Validate file extension against allowed list
 * @param {string} filename - The filename to check
 * @param {string[]} allowedExtensions - Array of allowed extensions (e.g., ['.mp4', '.mov'])
 * @returns {boolean}
 */
export function hasAllowedExtension(filename, allowedExtensions) {
  const ext = path.extname(filename).toLowerCase();
  return allowedExtensions.includes(ext);
}

/**
 * Create a safe temporary file path
 * @param {string} prefix - Prefix for the temp file
 * @param {string} extension - File extension
 * @returns {string} - Safe temp file path
 */
export function createSafeTempPath(prefix, extension) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const filename = sanitizeFilename(`${prefix}_${timestamp}_${random}${extension}`);
  return path.join(process.cwd(), 'tmp', filename);
}
