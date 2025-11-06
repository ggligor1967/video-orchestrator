import { z } from 'zod';
import { formatZodError } from '../utils/errorResponse.js';
import { SubtitleSettings } from '@video-orchestrator/shared';

/**
 * Caption Styling Controller
 *
 * Handles HTTP requests for caption styling operations.
 * Validates input using Zod schemas and delegates to captionStylingService.
 */

// Local style application and preview schemas (complement SubtitleSettings from shared)
const applyStyleSchema = z.object({
  subtitlePath: z.string().min(1, 'Subtitle path is required'),
  videoPath: z.string().min(1, 'Video path is required'),
  styleId: z.string().optional().default('tiktok-trending'),
  outputPath: z.string().optional(),
  customStyle: SubtitleSettings.optional()
});

const generatePreviewSchema = z.object({
  presetId: z.string().min(1, 'Preset ID is required'),
  sampleText: z.string().optional().default('Amazing Story')
});

const createCustomStyleSchema = z.object({
  name: z.string().min(1, 'Style name is required'),
  description: z.string().optional(),
  animation: z.enum(['none', 'fade-in', 'word-by-word', 'word-highlight', 'zoom-in']).optional(),
  font: z.object({
    family: z.string(),
    size: z.number(),
    color: z.string(),
    spacing: z.number().optional()
  }),
  background: z.object({
    enabled: z.boolean(),
    type: z.string().optional(),
    color: z.string().optional(),
    padding: z.number().optional(),
    borderRadius: z.number().optional()
  }).optional(),
  stroke: z.object({
    enabled: z.boolean(),
    color: z.string().optional(),
    width: z.number().optional()
  }).optional(),
  shadow: z.object({
    enabled: z.boolean(),
    color: z.string().optional(),
    offsetX: z.number().optional(),
    offsetY: z.number().optional(),
    blur: z.number().optional()
  }).optional(),
  position: z.object({
    vertical: z.enum(['top', 'center', 'bottom']),
    horizontal: z.enum(['left', 'center', 'right']),
    marginBottom: z.number()
  }),
  timing: z.object({
    fadeIn: z.number(),
    fadeOut: z.number(),
    wordDelay: z.number()
  })
});

export const createCaptionController = ({ captionStylingService, logger }) => ({
  /**
   * GET /captions/presets
   * Get all available style presets
   */
  async getPresets(req, res, next) {
    try {
      logger.info('Getting caption style presets');

      const presets = captionStylingService.getPresets();

      res.json({
        success: true,
        data: {
          presets,
          count: presets.length
        }
      });

    } catch (error) {
      logger.error('Error getting presets', { error: error.message });
      next(error);
    }
  },

  /**
   * GET /captions/presets/:presetId
   * Get details of a specific preset
   */
  async getPreset(req, res, next) {
    try {
      const { presetId } = req.params;

      logger.info('Getting caption style preset', { presetId });

      const preset = captionStylingService.getPreset(presetId);

      res.json({
        success: true,
        data: { preset }
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

      logger.error('Error getting preset', { error: error.message });
      next(error);
    }
  },

  /**
   * POST /captions/apply
   * Apply styling to subtitles
   */
  async applyStyle(req, res, next) {
    try {
      const validatedData = applyStyleSchema.parse(req.body);

      logger.info('Applying caption style', {
        subtitlePath: validatedData.subtitlePath,
        videoPath: validatedData.videoPath,
        styleId: validatedData.styleId
      });

      const outputPath = await captionStylingService.applyStyle(
        validatedData.subtitlePath,
        validatedData.videoPath,
        {
          styleId: validatedData.styleId,
          outputPath: validatedData.outputPath,
          customStyle: validatedData.customStyle
        }
      );

      res.json({
        success: true,
        data: {
          outputPath,
          styleId: validatedData.styleId
        },
        message: 'Caption style applied successfully'
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(formatZodError(error));
      }

      logger.error('Error applying caption style', { error: error.message });
      next(error);
    }
  },

  /**
   * POST /captions/preview
   * Generate preview thumbnail for a style preset
   */
  async generatePreview(req, res, next) {
    try {
      const validatedData = generatePreviewSchema.parse(req.body);

      logger.info('Generating caption style preview', {
        presetId: validatedData.presetId
      });

      const previewPath = await captionStylingService.generatePreview(
        validatedData.presetId,
        validatedData.sampleText
      );

      res.json({
        success: true,
        data: {
          previewPath,
          presetId: validatedData.presetId
        },
        message: 'Preview generated successfully'
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(formatZodError(error));
      }

      logger.error('Error generating preview', { error: error.message });
      next(error);
    }
  },

  /**
   * POST /captions/styles
   * Create a custom style
   */
  async createCustomStyle(req, res, next) {
    try {
      const validatedData = createCustomStyleSchema.parse(req.body);

      logger.info('Creating custom caption style', {
        styleName: validatedData.name
      });

      const customStyle = captionStylingService.createCustomStyle(validatedData);

      res.json({
        success: true,
        data: {
          style: customStyle
        },
        message: 'Custom style created successfully'
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(formatZodError(error));
      }

      logger.error('Error creating custom style', { error: error.message });
      next(error);
    }
  }
});
