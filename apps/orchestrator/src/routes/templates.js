import { Router } from 'express';

/**
 * Template Routes
 *
 * Endpoints for managing video templates and creating videos from templates.
 */
export const createTemplateRoutes = (container) => {
  const router = Router();
  const templateController = container.resolve('templateController');

  /**
   * GET /templates
   * Get all templates with optional filters
   *
   * Query parameters:
   * - category: string (optional) - Filter by category
   * - tags: string (optional) - Comma-separated tags
   * - search: string (optional) - Search in name/description/tags
   *
   * Response:
   * {
   *   success: true,
   *   data: {
   *     templates: [...],
   *     count: 7
   *   }
   * }
   */
  router.get('/', templateController.getAllTemplates);

  /**
   * GET /templates/categories
   * Get all template categories
   *
   * Response:
   * {
   *   success: true,
   *   data: {
   *     categories: [
   *       { id: 'horror', name: 'Horror', count: 2 },
   *       ...
   *     ],
   *     count: 5
   *   }
   * }
   */
  router.get('/categories', templateController.getCategories);

  /**
   * GET /templates/tags
   * Get all template tags
   *
   * Response:
   * {
   *   success: true,
   *   data: {
   *     tags: [
   *       { id: 'horror', name: 'Horror', count: 3 },
   *       ...
   *     ],
   *     count: 15
   *   }
   * }
   */
  router.get('/tags', templateController.getTags);

  /**
   * POST /templates/apply
   * Apply template - Create video from template
   *
   * Request body:
   * {
   *   templateId: string,
   *   customizations: {
   *     topic: string,           // Required for most templates
   *     genre: string,           // Optional: override template genre
   *     duration: number,        // Optional: override duration
   *     backgroundPath: string,  // Optional: use custom background
   *     voice: string,           // Optional: override voice
   *     speed: number,           // Optional: override speech speed
   *     captionStyle: string,    // Optional: override caption style
   *     exportPreset: string     // Optional: override export preset
   *   }
   * }
   *
   * Response:
   * {
   *   success: true,
   *   data: {
   *     templateId: string,
   *     jobId: string,
   *     status: string,
   *     outputPath: string
   *   },
   *   message: 'Template applied successfully. Video creation in progress.'
   * }
   */
  router.post('/apply', templateController.applyTemplate);

  /**
   * POST /templates/import
   * Import template from JSON
   *
   * Request body:
   * {
   *   templateJson: string  // JSON string of template
   * }
   *
   * Response:
   * {
   *   success: true,
   *   data: { template: {...} },
   *   message: 'Template imported successfully'
   * }
   */
  router.post('/import', templateController.importTemplate);

  /**
   * POST /templates
   * Create custom template
   *
   * Request body:
   * {
   *   name: string,
   *   description: string,
   *   category: string,
   *   tags: string[],
   *   duration: number,
   *   scriptSettings: {...},
   *   backgroundSettings: {...},
   *   voiceSettings: {...},
   *   captionStyle: string,
   *   audioSettings: {...},
   *   videoSettings: {...},
   *   exportPreset: string
   * }
   *
   * Response:
   * {
   *   success: true,
   *   data: { template: {...} },
   *   message: 'Template created successfully'
   * }
   */
  router.post('/', templateController.createTemplate);

  /**
   * GET /templates/:templateId
   * Get template by ID
   *
   * Response:
   * {
   *   success: true,
   *   data: {
   *     template: {...}
   *   }
   * }
   */
  router.get('/:templateId', templateController.getTemplateById);

  /**
   * PUT /templates/:templateId
   * Update custom template
   *
   * Request body: Partial template object
   *
   * Response:
   * {
   *   success: true,
   *   data: { template: {...} },
   *   message: 'Template updated successfully'
   * }
   */
  router.put('/:templateId', templateController.updateTemplate);

  /**
   * DELETE /templates/:templateId
   * Delete custom template
   *
   * Response:
   * {
   *   success: true,
   *   message: 'Template deleted successfully'
   * }
   */
  router.delete('/:templateId', templateController.deleteTemplate);

  /**
   * POST /templates/:templateId/duplicate
   * Duplicate template
   *
   * Request body:
   * {
   *   newName: string  // Optional: name for duplicated template
   * }
   *
   * Response:
   * {
   *   success: true,
   *   data: { template: {...} },
   *   message: 'Template duplicated successfully'
   * }
   */
  router.post('/:templateId/duplicate', templateController.duplicateTemplate);

  /**
   * GET /templates/:templateId/export
   * Export template to JSON file
   *
   * Response: JSON file download
   */
  router.get('/:templateId/export', templateController.exportTemplate);

  return router;
};
