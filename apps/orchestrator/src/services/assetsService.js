import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ffmpegService } from './ffmpegService.js';
import { logger } from '../utils/logger.js';
import { paths } from '../config/paths.js';

const BACKGROUNDS_DIR = paths.backgrounds;

export const assetsService = {
  async listBackgrounds(options = {}) {
    try {
      const { limit, offset } = options;
      const files = await fs.readdir(BACKGROUNDS_DIR);
      const videoFiles = files.filter(file => 
        /\.(mp4|mov|avi|mkv)$/i.test(file)
      );

      const backgrounds = await Promise.all(
        videoFiles.map(async (file) => {
          const filePath = path.join(BACKGROUNDS_DIR, file);
          const stats = await fs.stat(filePath);
          
          // Extract video info using FFmpeg
          let videoInfo = null;
          try {
            videoInfo = await ffmpegService.getVideoInfo(filePath);
          } catch (error) {
            logger.warn(`Could not get video info for ${file}`, { error: error.message });
          }

          return {
            id: path.parse(file).name,
            filename: file,
            path: `/static/assets/backgrounds/${file}`,
            size: stats.size,
            createdAt: stats.birthtime,
            duration: videoInfo?.duration || null,
            width: videoInfo?.width || null,
            height: videoInfo?.height || null,
            aspectRatio: videoInfo ? `${videoInfo.width}:${videoInfo.height}` : null
          };
        })
      );

      // Sort by creation date (newest first)
      const sorted = backgrounds.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      // Apply pagination if limit/offset provided
      if (typeof limit === 'number' && typeof offset === 'number') {
        const paginated = sorted.slice(offset, offset + limit);
        return {
          items: paginated,
          total: sorted.length
        };
      }

      // Return all items (backwards compatibility)
      return sorted;
    } catch (error) {
      logger.error('Error listing backgrounds', { error: error.message });
      throw new Error('Failed to list background videos');
    }
  },

  async importBackground(file) {
    try {
      const id = uuidv4();
      const ext = path.extname(file.originalname);
      const newFilename = `${id}${ext}`;
      const oldPath = file.path;
      const newPath = path.join(BACKGROUNDS_DIR, newFilename);

      // Move file to final location
      await fs.rename(oldPath, newPath);

      // Get video information
      const videoInfo = await ffmpegService.getVideoInfo(newPath);

      const background = {
        id,
        filename: newFilename,
        originalName: file.originalname,
        path: `/static/assets/backgrounds/${newFilename}`,
        size: file.size,
        duration: videoInfo.duration,
        width: videoInfo.width,
        height: videoInfo.height,
        aspectRatio: `${videoInfo.width}:${videoInfo.height}`,
        importedAt: new Date().toISOString()
      };

      logger.info('Background imported successfully', {
        id,
        filename: newFilename,
        duration: videoInfo.duration,
        resolution: `${videoInfo.width}x${videoInfo.height}`
      });

      return background;
    } catch (error) {
      logger.error('Error importing background', { error: error.message });
      throw new Error(`Failed to import background: ${error.message}`);
    }
  },

  async deleteBackground(id) {
    try {
      const files = await fs.readdir(BACKGROUNDS_DIR);
      const file = files.find(f => path.parse(f).name === id);
      
      if (!file) {
        throw new Error('Background not found');
      }

      const filePath = path.join(BACKGROUNDS_DIR, file);
      await fs.unlink(filePath);

      logger.info('Background deleted', { id, filename: file });
    } catch (error) {
      logger.error('Error deleting background', { error: error.message, id });
      throw new Error(`Failed to delete background: ${error.message}`);
    }
  },

  async getBackgroundInfo(id) {
    try {
      const files = await fs.readdir(BACKGROUNDS_DIR);
      const file = files.find(f => path.parse(f).name === id);
      
      if (!file) {
        throw new Error('Background not found');
      }

      const filePath = path.join(BACKGROUNDS_DIR, file);
      const stats = await fs.stat(filePath);
      const videoInfo = await ffmpegService.getVideoInfo(filePath);

      return {
        id,
        filename: file,
        path: `/static/assets/backgrounds/${file}`,
        size: stats.size,
        createdAt: stats.birthtime,
        duration: videoInfo.duration,
        width: videoInfo.width,
        height: videoInfo.height,
        aspectRatio: `${videoInfo.width}:${videoInfo.height}`,
        bitrate: videoInfo.bitrate,
        fps: videoInfo.fps,
        codec: videoInfo.codec
      };
    } catch (error) {
      logger.error('Error getting background info', { error: error.message, id });
      throw new Error(`Failed to get background info: ${error.message}`);
    }
  }
};