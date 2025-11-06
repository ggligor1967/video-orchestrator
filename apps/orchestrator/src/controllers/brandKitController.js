import { z } from 'zod';
import { formatZodError } from '../utils/errorResponse.js';

/**
 * Brand Kit Controller
 *
 * Handles HTTP requests for brand kit operations.
 * Validates input using Zod schemas and delegates to brandKitService.
 */

// Local schema definitions for brand kit operations
const colorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color format');

const createBrandKitSchema = z.object({
  name: z.string().min(1, 'Brand name is required'),
  description: z.string().optional(),

  colors: z.object({
    primary: colorSchema.optional(),
    secondary: colorSchema.optional(),
    accent: colorSchema.optional(),
    background: colorSchema.optional(),
    text: colorSchema.optional()
  }).optional(),

  fonts: z.object({
    primary: z.string().optional(),
    secondary: z.string().optional(),
    sizes: z.object({
      heading: z.number().min(20).max(150).optional(),
      body: z.number().min(20).max(150).optional(),
      caption: z.number().min(20).max(150).optional()
    }).optional()
  }).optional(),

  logo: z.object({
    path: z.string().optional(),
    position: z.enum(['top-left', 'top-right', 'top-center', 'bottom-left', 'bottom-right', 'bottom-center', 'center']).optional(),
    size: z.enum(['small', 'medium', 'large']).optional(),
    opacity: z.number().min(0).max(1).optional(),
    margin: z.number().optional()
  }).optional(),

  watermark: z.object({
    enabled: z.boolean().optional(),
    type: z.enum(['text', 'image']).optional(),
    text: z.string().optional(),
    imagePath: z.string().optional(),
    position: z.enum(['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center']).optional(),
    style: z.string().optional(),
    opacity: z.number().min(0).max(1).optional(),
    fontSize: z.number().min(10).max(100).optional()
  }).optional(),

  intro: z.object({
    enabled: z.boolean().optional(),
    duration: z.number().min(1).max(10).optional(),
    videoPath: z.string().optional(),
    style: z.string().optional()
  }).optional(),

  outro: z.object({
    enabled: z.boolean().optional(),
    duration: z.number().min(1).max(15).optional(),
    videoPath: z.string().optional(),
    callToAction: z.string().optional(),
    style: z.string().optional()
  }).optional(),

  defaults: z.object({
    voice: z.string().optional(),
    captionStyle: z.string().optional(),
    exportPreset: z.enum(['tiktok', 'youtube', 'instagram']).optional(),
    musicVolume: z.number().min(0).max(1).optional()
  }).optional(),

  musicLibrary: z.array(z.string()).optional()
});

const updateBrandKitSchema = createBrandKitSchema.partial();

const applyBrandKitSchema = z.object({
  brandKitId: z.string().min(1, 'Brand kit ID is required'),
  videoPath: z.string().min(1, 'Video path is required'),
  outputPath: z.string().optional()
});

const getBrandKitsSchema = z.object({
  search: z.string().optional()
});

export const createBrandKitController = ({ brandKitService, logger }) => ({
  /**
   * GET /brands
   * Get all brand kits
   */
  async getAllBrandKits(req, res, next) {
    try {
      const query = {
        search: req.query.search
      };

      const validatedQuery = getBrandKitsSchema.parse(query);

      logger.info('Getting all brand kits', validatedQuery);

      const brandKits = await brandKitService.getAllBrandKits(validatedQuery);

      res.json({
        success: true,
        data: {
          brandKits,
          count: brandKits.length
        }
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(formatZodError(error));
      }

      logger.error('Error getting brand kits', { error: error.message });
      next(error);
    }
  },

  /**
   * GET /brands/:brandKitId
   * Get brand kit by ID
   */
  async getBrandKitById(req, res, next) {
    try {
      const { brandKitId } = req.params;

      logger.info('Getting brand kit by ID', { brandKitId });

      const brandKit = await brandKitService.getBrandKitById(brandKitId);

      res.json({
        success: true,
        data: { brandKit }
      });

    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: error.message
          }
        });
      }

      logger.error('Error getting brand kit', { error: error.message });
      next(error);
    }
  },

  /**
   * POST /brands
   * Create brand kit
   */
  async createBrandKit(req, res, next) {
    try {
      const validatedData = createBrandKitSchema.parse(req.body);

      logger.info('Creating brand kit', {
        name: validatedData.name
      });

      const brandKit = await brandKitService.createBrandKit(validatedData);

      res.status(201).json({
        success: true,
        data: { brandKit },
        message: 'Brand kit created successfully'
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(formatZodError(error));
      }

      logger.error('Error creating brand kit', { error: error.message });
      next(error);
    }
  },

  /**
   * PUT /brands/:brandKitId
   * Update brand kit
   */
  async updateBrandKit(req, res, next) {
    try {
      const { brandKitId } = req.params;
      const validatedData = updateBrandKitSchema.parse(req.body);

      logger.info('Updating brand kit', { brandKitId });

      const brandKit = await brandKitService.updateBrandKit(
        brandKitId,
        validatedData
      );

      res.json({
        success: true,
        data: { brandKit },
        message: 'Brand kit updated successfully'
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(formatZodError(error));
      }

      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: error.message
          }
        });
      }

      logger.error('Error updating brand kit', { error: error.message });
      next(error);
    }
  },

  /**
   * DELETE /brands/:brandKitId
   * Delete brand kit
   */
  async deleteBrandKit(req, res, next) {
    try {
      const { brandKitId } = req.params;

      logger.info('Deleting brand kit', { brandKitId });

      await brandKitService.deleteBrandKit(brandKitId);

      res.json({
        success: true,
        message: 'Brand kit deleted successfully'
      });

    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: error.message
          }
        });
      }

      logger.error('Error deleting brand kit', { error: error.message });
      next(error);
    }
  },

  /**
   * POST /brands/:brandKitId/apply
   * Apply brand kit to video
   */
  async applyBrandKit(req, res, next) {
    try {
      const { brandKitId } = req.params;
      const validatedData = applyBrandKitSchema.parse({
        brandKitId,
        ...req.body
      });

      logger.info('Applying brand kit to video', {
        brandKitId: validatedData.brandKitId,
        videoPath: validatedData.videoPath
      });

      const result = await brandKitService.applyBrandKit(
        validatedData.brandKitId,
        validatedData.videoPath,
        { outputPath: validatedData.outputPath }
      );

      res.json({
        success: true,
        data: result,
        message: 'Brand kit applied successfully'
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(formatZodError(error));
      }

      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: error.message
          }
        });
      }

      logger.error('Error applying brand kit', { error: error.message });
      next(error);
    }
  },

  /**
   * POST /brands/:brandKitId/logo/upload
   * Upload logo
   */
  async uploadLogo(req, res, next) {
    try {
      const { brandKitId } = req.params;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Logo file is required'
          }
        });
      }

      logger.info('Uploading logo', { brandKitId });

      const result = await brandKitService.uploadLogo(brandKitId, req.file);

      res.json({
        success: true,
        data: result,
        message: 'Logo uploaded successfully'
      });

    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: error.message
          }
        });
      }

      logger.error('Error uploading logo', { error: error.message });
      next(error);
    }
  },

  /**
   * POST /brands/:brandKitId/intro/upload
   * Upload intro video
   */
  async uploadIntro(req, res, next) {
    try {
      const { brandKitId } = req.params;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Intro video file is required'
          }
        });
      }

      logger.info('Uploading intro video', { brandKitId });

      const result = await brandKitService.uploadIntro(brandKitId, req.file);

      res.json({
        success: true,
        data: result,
        message: 'Intro video uploaded successfully'
      });

    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: error.message
          }
        });
      }

      logger.error('Error uploading intro', { error: error.message });
      next(error);
    }
  },

  /**
   * POST /brands/:brandKitId/outro/upload
   * Upload outro video
   */
  async uploadOutro(req, res, next) {
    try {
      const { brandKitId } = req.params;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Outro video file is required'
          }
        });
      }

      logger.info('Uploading outro video', { brandKitId });

      const result = await brandKitService.uploadOutro(brandKitId, req.file);

      res.json({
        success: true,
        data: result,
        message: 'Outro video uploaded successfully'
      });

    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: error.message
          }
        });
      }

      logger.error('Error uploading outro', { error: error.message });
      next(error);
    }
  },

  /**
   * POST /brands/:brandKitId/music/upload
   * Upload background music
   */
  async uploadMusic(req, res, next) {
    try {
      const { brandKitId } = req.params;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Music file is required'
          }
        });
      }

      logger.info('Uploading background music', { brandKitId });

      const result = await brandKitService.uploadMusic(brandKitId, req.file);

      res.json({
        success: true,
        data: result,
        message: 'Background music uploaded successfully'
      });

    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: error.message
          }
        });
      }

      logger.error('Error uploading music', { error: error.message });
      next(error);
    }
  }
});
