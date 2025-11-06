import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { paginate } from '../middleware/pagination.js';
import { sanitizeFilename, hasAllowedExtension } from '../utils/pathSecurity.js';

const UPLOAD_DIR = path.resolve(process.cwd(), 'tmp/uploads');

const ensureUploadDir = () => {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
};

export const createAssetsRouter = ({ assetsController }) => {
  ensureUploadDir();

  // Allowed video MIME types
  const allowedMimeTypes = [
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-matroska',
    'video/webm',
    'video/mpeg'
  ];

  // Allowed file extensions
  const allowedExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.mpg', '.mpeg'];

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
      // Sanitize filename and add timestamp
      const timestamp = Date.now();
      const sanitized = sanitizeFilename(file.originalname);
      const ext = path.extname(sanitized);
      const nameWithoutExt = path.basename(sanitized, ext);
      cb(null, `${nameWithoutExt}_${timestamp}${ext}`);
    }
  });

  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 500 * 1024 * 1024, // 500MB limit
      files: 1 // Only one file at a time
    },
    fileFilter: (req, file, cb) => {
      // Check MIME type
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(new Error(`Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`));
      }

      // Check file extension
      if (!hasAllowedExtension(file.originalname, allowedExtensions)) {
        return cb(new Error(`Invalid file extension. Allowed extensions: ${allowedExtensions.join(', ')}`));
      }

      cb(null, true);
    }
  });

  const router = express.Router();

  router.get('/backgrounds', paginate(), assetsController.listBackgrounds);
  router.post('/backgrounds/import', upload.single('video'), assetsController.importBackground);
  router.delete('/backgrounds/:id', assetsController.deleteBackground);
  router.get('/backgrounds/:id/info', assetsController.getBackgroundInfo);

  return router;
};
