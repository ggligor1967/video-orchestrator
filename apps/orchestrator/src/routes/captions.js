import { Router } from 'express';

/**
 * Caption Styling Routes
 *
 * Endpoints for applying styled captions to videos with animations and effects.
 */
export const createCaptionRoutes = (container) => {
  const router = Router();
  const captionController = container.resolve('captionController');

  /**
   * GET /captions/presets
   * Get all available caption style presets
   *
   * Response:
   * {
   *   success: true,
   *   data: {
   *     presets: [
   *       {
   *         id: 'tiktok-trending',
   *         name: 'TikTok Trending',
   *         description: 'Bold text with yellow box highlights',
   *         animation: 'word-by-word',
   *         preview: '/static/caption-previews/tiktok-trending.png'
   *       },
   *       ...
   *     ],
   *     count: 6
   *   }
   * }
   */
  router.get('/presets', captionController.getPresets);

  /**
   * GET /captions/presets/:presetId
   * Get details of a specific preset
   *
   * Response:
   * {
   *   success: true,
   *   data: {
   *     preset: {
   *       id: 'tiktok-trending',
   *       name: 'TikTok Trending',
   *       description: '...',
   *       font: { ... },
   *       background: { ... },
   *       stroke: { ... },
   *       shadow: { ... },
   *       position: { ... },
   *       timing: { ... }
   *     }
   *   }
   * }
   */
  router.get('/presets/:presetId', captionController.getPreset);

  /**
   * POST /captions/apply
   * Apply styling to subtitles
   *
   * Request body:
   * {
   *   subtitlePath: string,      // Path to .srt subtitle file
   *   videoPath: string,          // Path to video file
   *   styleId?: string,           // Preset ID (default: 'tiktok-trending')
   *   outputPath?: string,        // Custom output path
   *   customStyle?: object        // Custom style configuration
   * }
   *
   * Response:
   * {
   *   success: true,
   *   data: {
   *     outputPath: string,
   *     styleId: string
   *   },
   *   message: 'Caption style applied successfully'
   * }
   */
  router.post('/apply', captionController.applyStyle);

  /**
   * POST /captions/preview
   * Generate preview thumbnail for a style
   *
   * Request body:
   * {
   *   presetId: string,
   *   sampleText?: string         // Default: 'Amazing Story'
   * }
   *
   * Response:
   * {
   *   success: true,
   *   data: {
   *     previewPath: string,
   *     presetId: string
   *   },
   *   message: 'Preview generated successfully'
   * }
   */
  router.post('/preview', captionController.generatePreview);

  /**
   * POST /captions/styles
   * Create a custom caption style
   *
   * Request body:
   * {
   *   name: string,
   *   description?: string,
   *   animation?: string,
   *   font: {
   *     family: string,
   *     size: number,
   *     color: string,
   *     spacing?: number
   *   },
   *   background?: { ... },
   *   stroke?: { ... },
   *   shadow?: { ... },
   *   position: { ... },
   *   timing: { ... }
   * }
   *
   * Response:
   * {
   *   success: true,
   *   data: {
   *     style: { ... }
   *   },
   *   message: 'Custom style created successfully'
   * }
   */
  router.post('/styles', captionController.createCustomStyle);

  return router;
};
