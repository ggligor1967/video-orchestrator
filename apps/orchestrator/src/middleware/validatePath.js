import path from 'path';
import { logger } from '../utils/logger.js';
import { ErrorResponses, ERROR_CODES, createErrorResponse } from '../utils/errorResponse.js';

/**
 * Allowed file extensions for security
 * Prevents execution of dangerous files (.exe, .sh, .bat, etc.)
 */
const ALLOWED_EXTENSIONS = {
  // Video formats - safe for processing
  video: ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v'],
  // Audio formats - safe for processing
  audio: ['.wav', '.mp3', '.aac', '.flac', '.ogg', '.m4a', '.opus'],
  // Subtitle formats - text-based, safe
  subtitle: ['.srt', '.vtt', '.ass', '.ssa', '.sub'],
  // Image formats - safe for thumbnails
  image: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'],
  // Data formats - restricted to safe text formats
  data: ['.json', '.txt', '.md'],
  // Model files - only ONNX (safer than binary formats)
  model: ['.onnx']
};

// Flattened list for backward compatibility
const ALL_ALLOWED_EXTENSIONS = Object.values(ALLOWED_EXTENSIONS).flat();

/**
 * Security middleware to prevent path traversal attacks
 * Validates that all file paths in requests are within allowed directories
 * Also validates file extensions to prevent dangerous file types
 * 
 * @param {string[]} allowedDirs - Array of allowed directory paths (absolute or relative to project root)
 * @param {object} options - Optional configuration
 * @param {boolean} options.validateExtensions - Enable file type validation (default: true)
 * @param {string[]} options.allowedExtensions - Custom allowed extensions (default: ALLOWED_EXTENSIONS)
 * @returns {Function} Express middleware function
 * 
 * @example
 * router.post('/crop', validatePath(['data/assets', 'data/cache']), controller.crop);
 */
export const validatePath = (allowedDirs = [], options = {}) => {
  const { 
    validateExtensions = true, 
    allowedExtensions = ALLOWED_EXTENSIONS 
  } = options;
  
  // Convert allowedExtensions to a flat array if it's an object
  const extensionsList = typeof allowedExtensions === 'object' && !Array.isArray(allowedExtensions)
    ? Object.values(allowedExtensions).flat()
    : allowedExtensions;
  
  // Resolve allowed directories to absolute paths
  const resolvedAllowedDirs = allowedDirs.map(dir => path.resolve(process.cwd(), dir));

  return (req, res, next) => {
    try {
      // Extract all potential path fields from request body
      const pathFields = [
        'inputPath',
        'outputPath',
        'videoPath',
        'audioPath',
        'backgroundPath',
        'path'
      ];

      // Also check array fields that might contain paths
      const arrayFields = ['tracks', 'audioIds', 'videoPaths'];

      // Collect all paths to validate
      const pathsToValidate = [];

      // Check direct path fields in body
      for (const field of pathFields) {
        if (req.body && req.body[field]) {
          pathsToValidate.push({
            field,
            path: req.body[field]
          });
        }
      }

      // Check query parameters for path fields (e.g., GET /info?path=...)
      if (req.query) {
        for (const field of pathFields) {
          if (req.query[field]) {
            pathsToValidate.push({
              field: `query.${field}`,
              path: req.query[field]
            });
          }
        }
      }

      // Check array fields (e.g., tracks: [{path: "..."}])
      if (req.body) {
        for (const field of arrayFields) {
          if (Array.isArray(req.body[field])) {
            req.body[field].forEach((item, index) => {
              if (typeof item === 'string') {
                // Simple array of paths
                pathsToValidate.push({
                  field: `${field}[${index}]`,
                  path: item
                });
              } else if (item && item.path) {
                // Array of objects with path property
                pathsToValidate.push({
                  field: `${field}[${index}].path`,
                  path: item.path
                });
              }
            });
          }
        }
      }

      // Check URL parameters (e.g., /info/:id where id might be a path)
      if (req.params.id && req.params.id.includes('/')) {
        pathsToValidate.push({
          field: 'params.id',
          path: req.params.id
        });
      }

      // Validate each path
      for (const { field, path: userPath } of pathsToValidate) {
        // Skip empty or undefined paths
        if (!userPath || typeof userPath !== 'string') {
          continue;
        }

        // 1. Validate file extension (if enabled)
        if (validateExtensions) {
          const ext = path.extname(userPath).toLowerCase();
          if (ext && !extensionsList.includes(ext)) {
            logger.warn('Invalid file type detected', {
              field,
              requestedPath: userPath,
              extension: ext,
              ip: req.ip,
              userAgent: req.get('user-agent')
            });

            const errorResponse = createErrorResponse(
              ERROR_CODES.INVALID_FILE_TYPE,
              `File type ${ext} is not allowed`,
              {
                field,
                extension: ext,
                allowed: allowedExtensions
              }
            );
            errorResponse.path = req.originalUrl || req.url;
            return res.status(403).json(errorResponse);
          }
        }

        // 2. Resolve to absolute path
        let resolvedPath = path.resolve(userPath);

        // 3. Normalize case on Windows for consistent comparison
        if (process.platform === 'win32') {
          resolvedPath = resolvedPath.toLowerCase();
        }

        // 4. Check if path is within any allowed directory
        const isAllowed = resolvedAllowedDirs.some(allowedDir => {
          const normalizedAllowedDir = process.platform === 'win32' 
            ? allowedDir.toLowerCase() 
            : allowedDir;
          return resolvedPath.startsWith(normalizedAllowedDir);
        });

        if (!isAllowed) {
          logger.warn('Path traversal attempt detected', {
            field,
            requestedPath: userPath,
            resolvedPath,
            ip: req.ip,
            userAgent: req.get('user-agent'),
            allowedDirs: resolvedAllowedDirs
          });

          const errorResponse = createErrorResponse(
            ERROR_CODES.PATH_TRAVERSAL_DENIED,
            'Access denied: Path outside allowed directories',
            {
              field,
              allowedDirectories: allowedDirs
            }
          );
          errorResponse.path = req.originalUrl || req.url;
          return res.status(403).json(errorResponse);
        }
      }

      // All paths validated successfully
      next();
    } catch (error) {
      logger.error('Error in path validation middleware', {
        error: error.message,
        stack: error.stack
      });

      return ErrorResponses.internalError(res, 'Path validation failed', {
        error: error.message
      });
    }
  };
};

/**
 * Pre-configured middleware for common use cases
 */

// Allow read/write in all data directories with strict extension checking
export const validateDataPath = validatePath([
  'data/assets',
  'data/cache', 
  'data/exports',
  'data/tts',
  'data/subs'
], { 
  validateExtensions: true, 
  allowedExtensions: ALL_ALLOWED_EXTENSIONS 
});

// Allow only read access to assets
export const validateAssetPath = validatePath([
  'data/assets'
]);

// Allow only write to cache and exports
export const validateOutputPath = validatePath([
  'data/cache',
  'data/exports',
  'data/tts',
  'data/subs'
]);

// Allow read from tools directory (for models, executables)
export const validateToolPath = validatePath([
  'tools'
]);

/**
 * Strict validation: only allow specific directories
 * Use this for endpoints that should have limited scope
 */
export const createStrictValidator = (dirs) => {
  return validatePath(dirs);
};

/**
 * Helper function to check if a path is safe (doesn't use actual filesystem)
 * Useful for testing or pre-validation
 * 
 * @param {string} userPath - Path to validate
 * @param {string[]} allowedDirs - Array of allowed directories
 * @returns {boolean} True if path is safe
 */
export const isPathSafe = (userPath, allowedDirs) => {
  if (!userPath || typeof userPath !== 'string') {
    return false;
  }

  const resolvedPath = path.resolve(userPath);
  const resolvedAllowedDirs = allowedDirs.map(dir => path.resolve(process.cwd(), dir));

  return resolvedAllowedDirs.some(allowedDir => {
    return resolvedPath.startsWith(allowedDir);
  });
};
