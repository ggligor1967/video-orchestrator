import { z } from 'zod';
import { TTSGenerationSchema } from '@video-orchestrator/shared';

// TTS generation schema based on shared schema
const generateSpeechSchema = TTSGenerationSchema.omit({ text: true, voice: true }).extend({
  text: TTSGenerationSchema.shape.text,
  voice: TTSGenerationSchema.shape.voice,
  outputPath: z.string().optional()
});

export const createTtsController = ({ ttsService, logger }) => ({
  async generateSpeech(req, res, next) {
    try {
      const validatedData = generateSpeechSchema.parse(req.body);

      logger.info('Processing TTS generation request', {
        textLength: validatedData.text.length,
        voice: validatedData.voice,
        speed: validatedData.speed
      });

      const result = await ttsService.generateSpeech(validatedData);

      // Map service response to expected format (path → outputPath)
      res.json({
        success: true,
        data: {
          outputPath: result.path,
          duration: result.duration,
          sampleRate: result.sampleRate
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async listVoices(req, res, next) {
    try {
      const voices = await ttsService.listAvailableVoices();

      // Wrap voices array in object
      res.json({
        success: true,
        data: {
          voices: voices
        }
      });
    } catch (error) {
      next(error);
    }
  }
});
