import path from 'path';
import { logger } from '../utils/logger.js';

/**
 * Allowed file extensions by category
 */
const ALLOWED_EXTENSIONS = {
  video: ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.flv'],
  audio: ['.mp3', '.wav', '.aac', '.m4a', '.ogg', '.flac'],
  subtitle: ['.srt', '.vtt', '.ass', '.ssa'],
  image: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'],
  all: [] // Will be populated below
};

// Combine all allowed extensions
ALLOWED_EXTENSIONS.all = [
  ...ALLOWED_EXTENSIONS.video,
  ...ALLOWED_EXTENSIONS.audio,
  ...ALLOWED_EXTENSIONS.subtitle,
  ...ALLOWED_EXTENSIONS.image
];

/**
 * Middleware to validate file extensions in request paths
 * Prevents uploads/processing of dangerous file types (.exe, .sh, .bat, etc.)
 * 
 * @param {Object} options - Configuration options
 * @param {string[]} options.allowedExtensions - Array of allowed extensions (default: all media types)
 * @param {string[]} options.pathFields - Fields to check (default: ['inputPath', 'outputPath', 'path', 'file'])
 * @returns {Function} Express middleware
 */
export const createFileTypeValidation = (options = {}) => {
  const allowedExtensions = options.allowedExtensions || ALLOWED_EXTENSIONS.all;
  const pathFields = options.pathFields || ['inputPath', 'outputPath', 'path', 'file', 'videoPath', 'audioPath'];

  return (req, res, next) => {
    try {
      // Check body fields
      if (req.body) {
        for (const field of pathFields) {
          if (req.body[field]) {
            const filePath = req.body[field];
            const ext = path.extname(filePath).toLowerCase();

            if (ext && !allowedExtensions.includes(ext)) {
              logger.warn('File type validation failed', {
                field,
                path: filePath,
                extension: ext,
                ip: req.ip,
                userAgent: req.get('user-agent')
              });

              return res.status(400).json({
                success: false,
                error: 'Invalid file type',
                details: `File extension "${ext}" is not allowed. Allowed extensions: ${allowedExtensions.join(', ')}`
              });
            }
          }
        }

        // Check tracks array (for audio mixing)
        if (req.body.tracks && Array.isArray(req.body.tracks)) {
          for (const track of req.body.tracks) {
            if (track.path) {
              const ext = path.extname(track.path).toLowerCase();

              if (ext && !ALLOWED_EXTENSIONS.audio.includes(ext)) {
                logger.warn('Audio track file type validation failed', {
                  path: track.path,
                  extension: ext,
                  ip: req.ip,
                  userAgent: req.get('user-agent')
                });

                return res.status(400).json({
                  success: false,
                  error: 'Invalid audio file type',
                  details: `Audio track extension "${ext}" is not allowed. Allowed extensions: ${ALLOWED_EXTENSIONS.audio.join(', ')}`
                });
              }
            }
          }
        }
      }

      // Check files in multer upload
      if (req.file) {
        const ext = path.extname(req.file.originalname).toLowerCase();
        if (ext && !allowedExtensions.includes(ext)) {
          logger.warn('Uploaded file type validation failed', {
            filename: req.file.originalname,
            extension: ext,
            ip: req.ip,
            userAgent: req.get('user-agent')
          });

          return res.status(400).json({
            success: false,
            error: 'Invalid file type',
            details: `File extension "${ext}" is not allowed for upload`
          });
        }
      }

      // Check multiple files in multer upload
      if (req.files && Array.isArray(req.files)) {
        for (const file of req.files) {
          const ext = path.extname(file.originalname).toLowerCase();
          if (ext && !allowedExtensions.includes(ext)) {
            logger.warn('Uploaded file type validation failed', {
              filename: file.originalname,
              extension: ext,
              ip: req.ip,
              userAgent: req.get('user-agent')
            });

            return res.status(400).json({
              success: false,
              error: 'Invalid file type',
              details: `File extension "${ext}" is not allowed for upload`
            });
          }
        }
      }

      next();
    } catch (error) {
      logger.error('File type validation middleware error', {
        error: error.message,
        stack: error.stack
      });
      // Don't block request on middleware error, just log it
      next();
    }
  };
};

/**
 * Predefined middleware for common use cases
 */
export const validateVideoFiles = createFileTypeValidation({
  allowedExtensions: ALLOWED_EXTENSIONS.video
});

export const validateAudioFiles = createFileTypeValidation({
  allowedExtensions: ALLOWED_EXTENSIONS.audio
});

export const validateSubtitleFiles = createFileTypeValidation({
  allowedExtensions: ALLOWED_EXTENSIONS.subtitle
});

export const validateMediaFiles = createFileTypeValidation({
  allowedExtensions: ALLOWED_EXTENSIONS.all
});

export { ALLOWED_EXTENSIONS };
