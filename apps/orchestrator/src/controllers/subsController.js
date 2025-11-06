import { z } from 'zod';
import { SubtitleSettings } from '@video-orchestrator/shared';
import fs from 'node:fs/promises';
import path from 'node:path';

// Schema aligned with test expectations and service interface
const generateSubtitlesSchema = z.object({
  audioId: z.string().min(1, 'Audio ID is required'),
  language: z.string().min(2).max(5).optional().default('en'),
  outputFilename: z.string().optional()
});

const formatSubtitlesSchema = z.object({
  subtitleId: z.string().min(1, 'Subtitle ID is required'),
  format: z.enum(['srt', 'vtt', 'ass']).optional().default('srt'),
  style: SubtitleSettings.optional()
});

// Helper to resolve audio ID to full path
// Uses relative paths from cwd() to match test expectations
async function getAudioPath(audioId) {
  const searchDirs = [
    './data/tts',       // TTS output directory
    './data/cache'      // Cache directory (where tests put files)
  ];
  
  for (const dir of searchDirs) {
    try {
      const files = await fs.readdir(dir);
      const file = files.find(f => f.includes(audioId) || path.parse(f).name === audioId);
      if (file) {
        return path.join(dir, file);
      }
    } catch (_error) {
      // Directory might not exist, continue to next
    }
  }
  
  throw new Error(`Audio with ID ${audioId} not found`);
}

// Helper to resolve subtitle ID to full path
// Uses relative paths from cwd() to match test expectations
async function getSubtitlePath(subtitleId) {
  const subsDir = './data/subs';
  
  try {
    const subsFiles = await fs.readdir(subsDir);
    const subsFile = subsFiles.find(f => f.includes(subtitleId) || path.parse(f).name === subtitleId);
    
    if (!subsFile) {
      throw new Error(`Subtitle with ID ${subtitleId} not found`);
    }
    
    return path.join(subsDir, subsFile);
  } catch (_error) {
    throw new Error(`Subtitle with ID ${subtitleId} not found`);
  }
}

export const createSubsController = ({ subsService, logger }) => ({
  async generateSubtitles(req, res, next) {
    try {
      const validatedData = generateSubtitlesSchema.parse(req.body);

      logger.info('Processing subtitle generation request', {
        audioId: validatedData.audioId,
        language: validatedData.language
      });

      // Get audio path from ID using helper function
      const audioPath = await getAudioPath(validatedData.audioId);
      
      // SubtitleService.generateSubtitles(audioPath, options)
      const result = await subsService.generateSubtitles(audioPath, {
        language: validatedData.language,
        format: 'srt',
        outputFilename: validatedData.outputFilename
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  },

  async formatSubtitles(req, res, next) {
    try {
      const validatedData = formatSubtitlesSchema.parse(req.body);

      logger.info('Processing subtitle formatting request', {
        subtitleId: validatedData.subtitleId,
        format: validatedData.format
      });

      // Get subtitle path from ID using helper function
      const subtitlePath = await getSubtitlePath(validatedData.subtitleId);
      
      // SubtitleService.formatSubtitles(subtitlePath, targetFormat, style)
      const result = await subsService.formatSubtitles(
        subtitlePath,
        validatedData.format || 'srt',
        validatedData.style || 'default'
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
});
