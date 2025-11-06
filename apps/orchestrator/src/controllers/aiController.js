import { z } from 'zod';
import { ScriptGenerationSchema } from '@video-orchestrator/shared';

// Script request schema based on shared schema, with additional optional fields
const scriptRequestSchema = ScriptGenerationSchema.extend({
  duration: z.number().min(15).max(180).optional(),
  style: z.enum(['narrative', 'list', 'story']).optional().default('story')
});

const backgroundSuggestionSchema = z.object({
  script: z.string().min(20, 'Script must be at least 20 characters'),
  genre: ScriptGenerationSchema.shape.genre.optional(),
  topic: z.string().optional()
});

const viralityScoreSchema = z.object({
  script: z.string().min(10, 'Script must be at least 10 characters'),
  genre: ScriptGenerationSchema.shape.genre,
  duration: z.number().min(10).max(180).optional().default(60),
  hasVideo: z.boolean().optional().default(true),
  hasAudio: z.boolean().optional().default(true),
  hasSubtitles: z.boolean().optional().default(true)
});

export const createAiController = ({ aiService, logger }) => ({
  async generateScript(req, res, next) {
    try {
      const validatedData = scriptRequestSchema.parse(req.body);

      logger.info('Generating script', {
        topic: validatedData.topic,
        genre: validatedData.genre,
        duration: validatedData.duration,
        style: validatedData.style
      });

      const result = await aiService.generateScript(validatedData);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  },

  async backgroundSuggestions(req, res, next) {
    try {
      const validatedData = backgroundSuggestionSchema.parse(req.body);

      logger.info('Generating background suggestions', {
        genre: validatedData.genre,
        scriptLength: validatedData.script.length
      });

      const result = await aiService.generateBackgroundIdeas(validatedData);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  },

  async calculateViralityScore(req, res, next) {
    try {
      const validatedData = viralityScoreSchema.parse(req.body);

      logger.info('Calculating virality score', {
        genre: validatedData.genre,
        scriptLength: validatedData.script.length,
        duration: validatedData.duration
      });

      const result = await aiService.calculateViralityScore(validatedData);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
});
