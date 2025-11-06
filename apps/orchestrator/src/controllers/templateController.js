import { z } from 'zod';
import { formatZodError } from '../utils/errorResponse.js';
import { VoiceSettings, AudioSettings } from '@video-orchestrator/shared';

/**
 * Template Controller
 *
 * Handles HTTP requests for video template operations.
 * Validates input using Zod schemas and delegates to templateService.
 */

// Local template-specific schemas built on shared types
const createTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  description: z.string().optional(),
  category: z.string().optional().default('custom'),
  tags: z.array(z.string()).optional().default([]),
  thumbnail: z.string().optional(),
  duration: z.number().min(5).max(180),

  scriptSettings: z.object({
    genre: z.string(),
    style: z.string(),
    duration: z.number(),
    topic: z.string().nullable()
  }),

  backgroundSettings: z.object({
    type: z.enum(['stock', 'upload']),
    stockQuery: z.string().optional(),
    orientation: z.string().optional().default('portrait'),
    autoSelect: z.boolean().optional().default(true)
  }),

  voiceSettings: VoiceSettings,

  captionStyle: z.string(),

  audioSettings: AudioSettings.optional(),

  videoSettings: z.object({
    autoReframe: z.boolean().optional().default(true),
    detectionMode: z.enum(['face', 'motion', 'center']).optional().default('center'),
    speedRamp: z.boolean().optional().default(false),
    speedRampStart: z.number().optional()
  }).optional(),

  exportPreset: z.enum(['tiktok', 'youtube', 'instagram']).optional().default('tiktok')
});

const updateTemplateSchema = createTemplateSchema.partial();

const applyTemplateSchema = z.object({
  templateId: z.string().min(1, 'Template ID is required'),
  customizations: z.object({
    topic: z.string().optional(),
    genre: z.string().optional(),
    duration: z.number().min(5).max(180).optional(),
    backgroundPath: z.string().optional(),
    voice: z.string().optional(),
    speed: z.number().min(0.5).max(2.0).optional(),
    captionStyle: z.string().optional(),
    exportPreset: z.enum(['tiktok', 'youtube', 'instagram']).optional(),
    brandKitId: z.string().optional() // NEW: Brand kit integration
  }).optional().default({})
});

const getTemplatesSchema = z.object({
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  search: z.string().optional()
});

const duplicateTemplateSchema = z.object({
  templateId: z.string().min(1, 'Template ID is required'),
  newName: z.string().optional()
});

const importTemplateSchema = z.object({
  templateJson: z.string().min(1, 'Template JSON is required')
});

export const createTemplateController = ({ templateService, logger }) => ({
  /**
   * GET /templates
   * Get all templates with optional filters
   */
  async getAllTemplates(req, res, next) {
    try {
      // Parse query parameters
      const query = {
        category: req.query.category,
        tags: req.query.tags ? req.query.tags.split(',') : undefined,
        search: req.query.search
      };

      const validatedQuery = getTemplatesSchema.parse(query);

      logger.info('Getting all templates', validatedQuery);

      const templates = await templateService.getAllTemplates(validatedQuery);

      res.json({
        success: true,
        data: {
          templates,
          count: templates.length
        }
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(formatZodError(error));
      }

      logger.error('Error getting templates', { error: error.message });
      next(error);
    }
  },

  /**
   * GET /templates/:templateId
   * Get template by ID
   */
  async getTemplateById(req, res, next) {
    try {
      const { templateId } = req.params;

      logger.info('Getting template by ID', { templateId });

      const template = await templateService.getTemplateById(templateId);

      res.json({
        success: true,
        data: { template }
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

      logger.error('Error getting template', { error: error.message });
      next(error);
    }
  },

  /**
   * GET /templates/categories
   * Get all template categories
   */
  async getCategories(req, res, next) {
    try {
      logger.info('Getting template categories');

      const categories = templateService.getCategories();

      res.json({
        success: true,
        data: {
          categories,
          count: categories.length
        }
      });

    } catch (error) {
      logger.error('Error getting categories', { error: error.message });
      next(error);
    }
  },

  /**
   * GET /templates/tags
   * Get all template tags
   */
  async getTags(req, res, next) {
    try {
      logger.info('Getting template tags');

      const tags = templateService.getTags();

      res.json({
        success: true,
        data: {
          tags,
          count: tags.length
        }
      });

    } catch (error) {
      logger.error('Error getting tags', { error: error.message });
      next(error);
    }
  },

  /**
   * POST /templates
   * Create custom template
   */
  async createTemplate(req, res, next) {
    try {
      const validatedData = createTemplateSchema.parse(req.body);

      logger.info('Creating custom template', {
        name: validatedData.name
      });

      const template = await templateService.createTemplate(validatedData);

      res.status(201).json({
        success: true,
        data: { template },
        message: 'Template created successfully'
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(formatZodError(error));
      }

      logger.error('Error creating template', { error: error.message });
      next(error);
    }
  },

  /**
   * PUT /templates/:templateId
   * Update custom template
   */
  async updateTemplate(req, res, next) {
    try {
      const { templateId } = req.params;
      const validatedData = updateTemplateSchema.parse(req.body);

      logger.info('Updating template', { templateId });

      const template = await templateService.updateTemplate(
        templateId,
        validatedData
      );

      res.json({
        success: true,
        data: { template },
        message: 'Template updated successfully'
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(formatZodError(error));
      }

      if (error.message.includes('Cannot update built-in')) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: error.message
          }
        });
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

      logger.error('Error updating template', { error: error.message });
      next(error);
    }
  },

  /**
   * DELETE /templates/:templateId
   * Delete custom template
   */
  async deleteTemplate(req, res, next) {
    try {
      const { templateId } = req.params;

      logger.info('Deleting template', { templateId });

      await templateService.deleteTemplate(templateId);

      res.json({
        success: true,
        message: 'Template deleted successfully'
      });

    } catch (error) {
      if (error.message.includes('Cannot delete built-in')) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: error.message
          }
        });
      }

      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Template not found'
          }
        });
      }

      logger.error('Error deleting template', { error: error.message });
      next(error);
    }
  },

  /**
   * POST /templates/apply
   * Apply template - Create video from template
   */
  async applyTemplate(req, res, next) {
    try {
      const validatedData = applyTemplateSchema.parse(req.body);

      logger.info('Applying template', {
        templateId: validatedData.templateId
      });

      const result = await templateService.applyTemplate(
        validatedData.templateId,
        validatedData.customizations
      );

      res.json({
        success: true,
        data: result,
        message: 'Template applied successfully. Video creation in progress.'
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

      if (error.message.includes('Topic is required')) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: error.message
          }
        });
      }

      logger.error('Error applying template', { error: error.message });
      next(error);
    }
  },

  /**
   * POST /templates/:templateId/duplicate
   * Duplicate template
   */
  async duplicateTemplate(req, res, next) {
    try {
      const { templateId } = req.params;
      const validatedData = duplicateTemplateSchema.omit({ templateId: true }).parse(req.body);

      logger.info('Duplicating template', { templateId, newName: validatedData.newName });

      const template = await templateService.duplicateTemplate(
        templateId,
        validatedData.newName
      );

      res.status(201).json({
        success: true,
        data: { template },
        message: 'Template duplicated successfully'
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

      logger.error('Error duplicating template', { error: error.message });
      next(error);
    }
  },

  /**
   * GET /templates/:templateId/export
   * Export template to JSON
   */
  async exportTemplate(req, res, next) {
    try {
      const { templateId } = req.params;

      logger.info('Exporting template', { templateId });

      const templateJson = await templateService.exportTemplate(templateId);

      res.setHeader('Content-Type', 'application/json');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${templateId}.json"`
      );
      res.send(templateJson);

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

      logger.error('Error exporting template', { error: error.message });
      next(error);
    }
  },

  /**
   * POST /templates/import
   * Import template from JSON
   */
  async importTemplate(req, res, next) {
    try {
      const validatedData = importTemplateSchema.parse(req.body);

      logger.info('Importing template');

      const template = await templateService.importTemplate(
        validatedData.templateJson
      );

      res.status(201).json({
        success: true,
        data: { template },
        message: 'Template imported successfully'
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(formatZodError(error));
      }

      if (error instanceof SyntaxError) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_JSON',
            message: 'Invalid JSON format'
          }
        });
      }

      logger.error('Error importing template', { error: error.message });
      next(error);
    }
  }
});
