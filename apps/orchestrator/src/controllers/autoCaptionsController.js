/**
 * Auto-Captions Controller
 * API endpoints for caption generation
 */

import { z } from 'zod';

const generateSchema = z.object({
  language: z.string().optional().default('en'),
  style: z.string().optional().default('minimal'),
  format: z.enum(['srt', 'vtt']).optional().default('srt'),
  strictMode: z.boolean().optional().default(false)
});

export const createAutoCaptionsController = ({ autoCaptionsService, logger }) => {
  return {
    /**
     * GET /auto-captions/languages
     */
    async getLanguages(req, res) {
      try {
        const languages = autoCaptionsService.getAvailableLanguages();
        
        res.json({
          languages,
          count: languages.length
        });
      } catch (error) {
        logger.error('Get languages failed', { error: error.message });
        res.status(500).json({ error: error.message });
      }
    },

    /**
     * GET /auto-captions/styles
     */
    async getStyles(req, res) {
      try {
        const styles = autoCaptionsService.getStylePresets();
        
        res.json({
          styles,
          count: styles.length
        });
      } catch (error) {
        logger.error('Get styles failed', { error: error.message });
        res.status(500).json({ error: error.message });
      }
    },

    /**
     * POST /auto-captions/generate
     */
    async generateCaptions(req, res) {
      try {
        if (!req.file) {
          return res.status(400).json({ error: 'No audio/video file uploaded' });
        }

        const validated = generateSchema.parse(req.body);
        
        const result = await autoCaptionsService.generateCaptions(
          req.file.path,
          validated
        );

        res.json({
          success: true,
          ...result
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({ error: error.errors });
        }
        
        logger.error('Generate captions failed', { error: error.message });
        res.status(500).json({ error: error.message });
      }
    }
  };
};
