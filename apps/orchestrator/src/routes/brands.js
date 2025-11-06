import { Router } from 'express';
import multer from 'multer';

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

/**
 * Brand Kit Routes
 *
 * Endpoints for managing brand kits with visual identity settings.
 */
export const createBrandRoutes = (container) => {
  const router = Router();
  const brandKitController = container.resolve('brandKitController');

  /**
   * GET /brands
   * Get all brand kits
   *
   * Query parameters:
   * - search: string (optional) - Search in name/description
   *
   * Response:
   * {
   *   success: true,
   *   data: {
   *     brandKits: [...],
   *     count: 5
   *   }
   * }
   */
  router.get('/', brandKitController.getAllBrandKits);

  /**
   * POST /brands
   * Create brand kit
   *
   * Request body:
   * {
   *   name: string,
   *   description: string,
   *   colors: {
   *     primary: string (#hex),
   *     secondary: string,
   *     accent: string,
   *     background: string,
   *     text: string
   *   },
   *   fonts: {
   *     primary: string,
   *     secondary: string,
   *     sizes: {
   *       heading: number,
   *       body: number,
   *       caption: number
   *     }
   *   },
   *   logo: { ... },
   *   watermark: { ... },
   *   intro: { ... },
   *   outro: { ... },
   *   defaults: {
   *     voice: string,
   *     captionStyle: string,
   *     exportPreset: string,
   *     musicVolume: number
   *   }
   * }
   *
   * Response:
   * {
   *   success: true,
   *   data: { brandKit: {...} },
   *   message: 'Brand kit created successfully'
   * }
   */
  router.post('/', brandKitController.createBrandKit);

  /**
   * GET /brands/:brandKitId
   * Get brand kit by ID
   *
   * Response:
   * {
   *   success: true,
   *   data: {
   *     brandKit: {...}
   *   }
   * }
   */
  router.get('/:brandKitId', brandKitController.getBrandKitById);

  /**
   * PUT /brands/:brandKitId
   * Update brand kit
   *
   * Request body: Partial brand kit object
   *
   * Response:
   * {
   *   success: true,
   *   data: { brandKit: {...} },
   *   message: 'Brand kit updated successfully'
   * }
   */
  router.put('/:brandKitId', brandKitController.updateBrandKit);

  /**
   * DELETE /brands/:brandKitId
   * Delete brand kit
   *
   * Response:
   * {
   *   success: true,
   *   message: 'Brand kit deleted successfully'
   * }
   */
  router.delete('/:brandKitId', brandKitController.deleteBrandKit);

  /**
   * POST /brands/:brandKitId/apply
   * Apply brand kit to video
   *
   * Request body:
   * {
   *   videoPath: string,
   *   outputPath: string (optional)
   * }
   *
   * Response:
   * {
   *   success: true,
   *   data: {
   *     brandKitId: string,
   *     outputPath: string
   *   },
   *   message: 'Brand kit applied successfully'
   * }
   */
  router.post('/:brandKitId/apply', brandKitController.applyBrandKit);

  /**
   * POST /brands/:brandKitId/logo/upload
   * Upload logo image
   *
   * Form data:
   * - file: image file (PNG, JPG, SVG)
   *
   * Response:
   * {
   *   success: true,
   *   data: {
   *     logoPath: string
   *   },
   *   message: 'Logo uploaded successfully'
   * }
   */
  router.post(
    '/:brandKitId/logo/upload',
    upload.single('file'),
    brandKitController.uploadLogo
  );

  /**
   * POST /brands/:brandKitId/intro/upload
   * Upload intro video
   *
   * Form data:
   * - file: video file (MP4)
   *
   * Response:
   * {
   *   success: true,
   *   data: {
   *     introPath: string
   *   },
   *   message: 'Intro video uploaded successfully'
   * }
   */
  router.post(
    '/:brandKitId/intro/upload',
    upload.single('file'),
    brandKitController.uploadIntro
  );

  /**
   * POST /brands/:brandKitId/outro/upload
   * Upload outro video
   *
   * Form data:
   * - file: video file (MP4)
   *
   * Response:
   * {
   *   success: true,
   *   data: {
   *     outroPath: string
   *   },
   *   message: 'Outro video uploaded successfully'
   * }
   */
  router.post(
    '/:brandKitId/outro/upload',
    upload.single('file'),
    brandKitController.uploadOutro
  );

  /**
   * POST /brands/:brandKitId/music/upload
   * Upload background music
   *
   * Form data:
   * - file: audio file (MP3, WAV)
   *
   * Response:
   * {
   *   success: true,
   *   data: {
   *     musicPath: string
   *   },
   *   message: 'Background music uploaded successfully'
   * }
   */
  router.post(
    '/:brandKitId/music/upload',
    upload.single('file'),
    brandKitController.uploadMusic
  );

  return router;
};
