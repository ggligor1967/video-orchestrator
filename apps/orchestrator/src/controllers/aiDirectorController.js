/**
 * AI Director Controller
 * Handles AI-powered creative direction requests
 */

import { z } from 'zod';

// Validation schemas
const directVideoSchema = z.object({
  script: z.string().min(50).max(5000),
  genre: z.enum(['horror', 'mystery', 'paranormal', 'true-crime']),
  preferences: z.object({
    backgroundId: z.string().optional(),
    voiceId: z.string().optional(),
    musicId: z.string().optional(),
    subtitleStyle: z.string().optional()
  }).optional(),
  options: z.object({
    quality: z.enum(['draft', 'standard', 'premium']).default('standard'),
    speed: z.enum(['fast', 'balanced', 'quality']).default('balanced'),
    autoExecute: z.boolean().default(false)
  }).optional()
});

const analyzeContextSchema = z.object({
  script: z.string().min(50).max(5000),
  genre: z.enum(['horror', 'mystery', 'paranormal', 'true-crime']),
  detailed: z.boolean().default(false)
});

export const createAiDirectorController = ({ aiContentDirectorService, logger }) => ({
  /**
   * GET /ai-director/templates
   * Get available creative templates
   */
  async getTemplates(req, res) {
    try {
      res.json({
        success: true,
        templates: {
          horror: {
            description: 'Dark, suspenseful, atmospheric',
            pacing: 'slow-build',
            recommended: ['abandoned-house', 'dark-forest']
          },
          mystery: {
            description: 'Investigative, noir-style, intriguing',
            pacing: 'medium-suspense',
            recommended: ['detective-office', 'foggy-city']
          },
          paranormal: {
            description: 'Supernatural, ethereal, otherworldly',
            pacing: 'variable-tension',
            recommended: ['haunted-mansion', 'spirit-realm']
          },
          'true-crime': {
            description: 'Documentary-style, factual, serious',
            pacing: 'steady-factual',
            recommended: ['courtroom', 'evidence-board']
          }
        }
      });
    } catch (error) {
      logger.error('Failed to get templates', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve templates'
      });
    }
  },

  /**
   * POST /ai-director/direct
   * Get full AI direction for video
   */
  async directVideo(req, res) {
    try {
      const validated = directVideoSchema.parse(req.body);
      
      logger.info('AI Director: Starting video direction', { genre: validated.genre });
      
      // Get AI direction
      const direction = await aiContentDirectorService.directVideo(
        validated.script,
        validated.genre,
        {
          preferences: validated.preferences || {},
          ...validated.options
        }
      );
      
      res.json({
        success: true,
        direction,
        message: direction.fallback 
          ? 'Using fallback direction due to AI service issues'
          : 'AI direction complete'
      });
      
    } catch (error) {
      logger.error('AI direction failed', { error: error.message });
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Invalid request',
          details: error.errors
        });
      }
      
      res.status(500).json({
        success: false,
        error: error.message || 'AI direction failed'
      });
    }
  },

  /**
   * POST /ai-director/analyze
   * Analyze script context only
   */
  async analyzeContext(req, res) {
    try {
      const validated = analyzeContextSchema.parse(req.body);
      
      const context = await aiContentDirectorService.analyzeContext(
        validated.script,
        validated.genre,
        { detailed: validated.detailed }
      );
      
      res.json({
        success: true,
        context,
        insights: {
          viralPotential: context.trendAlignment > 0.7 ? 'high' : 'medium',
          recommendedStyle: context.mood === 'intense' ? 'dramatic' : 'subtle',
          targetAudience: context.audience
        }
      });
      
    } catch (error) {
      logger.error('Context analysis failed', { error: error.message });
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Invalid request',
          details: error.errors
        });
      }
      
      res.status(500).json({
        success: false,
        error: error.message || 'Context analysis failed'
      });
    }
  },

  /**
   * POST /ai-director/suggest
   * Get creative suggestions
   */
  async getSuggestions(req, res) {
    try {
      const { script, genre } = req.body;
      
      if (!script || !genre) {
        return res.status(400).json({
          success: false,
          error: 'Script and genre are required'
        });
      }
      
      const context = await aiContentDirectorService.analyzeContext(script, genre);
      const decisions = await aiContentDirectorService.makeCreativeDecisions(context, genre, {});
      
      const suggestions = {
        primary: {
          background: decisions.background,
          voice: decisions.voice,
          music: decisions.music,
          style: decisions.subtitleStyle,
          confidence: decisions.confidence
        },
        alternatives: decisions.alternatives,
        reasoning: {
          background: decisions.background.reasoning,
          voice: decisions.voice.reasoning,
          music: decisions.music.reasoning
        }
      };
      
      res.json({
        success: true,
        suggestions,
        context: {
          mood: context.mood,
          viralHooks: context.viralHooks,
          trendAlignment: context.trendAlignment
        }
      });
      
    } catch (error) {
      logger.error('Suggestions generation failed', { error: error.message });
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate suggestions'
      });
    }
  },

  /**
   * POST /ai-director/preview
   * Preview execution plan
   */
  async previewPlan(req, res) {
    try {
      const { script, genre, preferences } = req.body;
      
      if (!script || !genre) {
        return res.status(400).json({
          success: false,
          error: 'Script and genre are required'
        });
      }
      
      const direction = await aiContentDirectorService.directVideo(
        script,
        genre,
        { preferences: preferences || {} }
      );
      
      const preview = {
        steps: direction.executionPlan.phases.map(phase => ({
          name: phase.name,
          duration: `${phase.duration}s`,
          parallel: phase.parallel,
          tasks: phase.steps
        })),
        totalTime: `${direction.estimatedTime} seconds`,
        decisions: {
          background: direction.decisions.background.id,
          voice: direction.decisions.voice.id,
          music: direction.decisions.music.id,
          effects: direction.decisions.effects
        },
        quality: {
          viral: Math.round(direction.predictions.viralPotential * 100),
          production: Math.round(direction.predictions.productionQuality * 100),
          audience: Math.round(direction.predictions.audienceMatch * 100)
        }
      };
      
      res.json({
        success: true,
        preview,
        canExecute: !direction.fallback
      });
      
    } catch (error) {
      logger.error('Plan preview failed', { error: error.message });
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate preview'
      });
    }
  }
});
