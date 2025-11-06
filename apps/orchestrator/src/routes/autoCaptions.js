/**
 * Auto-Captions Routes
 */

import { Router } from 'express';
import multer from 'multer';
import path from 'path';

const upload = multer({
  dest: 'data/cache/uploads/',
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.mp3', '.wav', '.m4a', '.mp4', '.mov', '.avi'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only audio/video files allowed.'));
    }
  }
});

export const createAutoCaptionsRouter = ({ autoCaptionsController }) => {
  const router = Router();

  router.get('/languages', autoCaptionsController.getLanguages);
  router.get('/styles', autoCaptionsController.getStyles);
  router.post('/generate', upload.single('file'), autoCaptionsController.generateCaptions);

  return router;
};
