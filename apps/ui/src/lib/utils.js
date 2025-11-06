/**
 * Security utilities for input validation and sanitization
 */

/**
 * Sanitize text input to prevent injection attacks and control character exploits
 * @param {string} text - Raw user input
 * @param {number} maxLength - Maximum allowed length
 * @returns {string} Sanitized text
 */
export function sanitizeTextInput(text, maxLength = 10000) {
  if (!text || typeof text !== "string") return "";

  // Remove control characters except newlines, tabs, and carriage returns
  let sanitized = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  // Trim to max length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength);
  }

  return sanitized.trim();
}

/**
 * Sanitize filename to prevent path traversal attacks
 * @param {string} filename - Raw filename
 * @returns {string} Sanitized filename
 */
export function sanitizeFilename(filename) {
  if (!filename || typeof filename !== "string") return "untitled";

  // Remove path separators and dangerous characters
  let sanitized = filename
    .replace(/[/\\:*?"<>|]/g, "")
    .replace(/\.\./g, "")
    .trim();

  // Ensure non-empty result
  return sanitized || "untitled";
}

/**
 * Validate file extension against allowed list
 * @param {string} filename - Filename to check
 * @param {string[]} allowedExtensions - Array of allowed extensions (e.g., ['.mp4', '.mov'])
 * @returns {boolean} True if extension is allowed
 */
export function hasAllowedExtension(filename, allowedExtensions) {
  if (!filename || typeof filename !== "string") return false;

  const extension = filename.toLowerCase().match(/\.[^.]+$/)?.[0];
  return extension && allowedExtensions.includes(extension);
}

/**
 * Validate MIME type against allowed list
 * @param {string} mimeType - MIME type to check
 * @param {string[]} allowedTypes - Array of allowed MIME types
 * @returns {boolean} True if MIME type is allowed
 */
export function hasAllowedMimeType(mimeType, allowedTypes) {
  if (!mimeType || typeof mimeType !== "string") return false;
  return allowedTypes.includes(mimeType.toLowerCase());
}

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Format duration in seconds to MM:SS
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration
 */
export function formatDuration(seconds) {
  if (!seconds) return "Unknown";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Safe console.error wrapper that only logs in development
 * @param {string} message - Error message
 * @param {Error} error - Error object
 */
export function logError(message, error) {
  if (import.meta.env.DEV) {
    console.error(message, error);
  } else {
    // In production, only log message without stack trace
    console.error(message);
  }
}
