import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import ffmpeg from 'fluent-ffmpeg';

export class ThumbnailService {
  constructor({ logger, config }) {
    this.logger = logger;
    this.cacheDir = path.join(config.directories.cache || './data/cache', 'thumbnails');
  }

  async init() {
    await fs.mkdir(this.cacheDir, { recursive: true });
  }

  async createVideoThumbnail(videoPath, options = {}) {
    const { width = 320, height = 568, quality = 80, timestamp = '00:00:01' } = options;
    
    const thumbPath = path.join(
      this.cacheDir,
      `${path.basename(videoPath, path.extname(videoPath))}_thumb.jpg`
    );

    try {
      const exists = await fs.access(thumbPath).then(() => true).catch(() => false);
      if (exists) {
        this.logger.debug('Thumbnail exists, using cached', { thumbPath });
        return thumbPath;
      }

      await new Promise((resolve, reject) => {
        ffmpeg(videoPath)
          .screenshots({
            timestamps: [timestamp],
            filename: path.basename(thumbPath),
            folder: this.cacheDir,
            size: `${width}x${height}`
          })
          .on('end', resolve)
          .on('error', reject);
      });

      await sharp(thumbPath)
        .jpeg({ quality })
        .toFile(thumbPath + '.opt');

      await fs.rename(thumbPath + '.opt', thumbPath);

      this.logger.info('Video thumbnail created', { videoPath, thumbPath });
      return thumbPath;
    } catch (error) {
      this.logger.error('Failed to create video thumbnail', { error: error.message });
      throw error;
    }
  }

  async createImageThumbnail(imagePath, options = {}) {
    const { width = 320, height = 568, quality = 80 } = options;
    
    const thumbPath = path.join(
      this.cacheDir,
      `${path.basename(imagePath, path.extname(imagePath))}_thumb.jpg`
    );

    try {
      const exists = await fs.access(thumbPath).then(() => true).catch(() => false);
      if (exists) {
        this.logger.debug('Thumbnail exists, using cached', { thumbPath });
        return thumbPath;
      }

      await sharp(imagePath)
        .resize(width, height, { fit: 'cover', position: 'center' })
        .jpeg({ quality })
        .toFile(thumbPath);

      this.logger.info('Image thumbnail created', { imagePath, thumbPath });
      return thumbPath;
    } catch (error) {
      this.logger.error('Failed to create image thumbnail', { error: error.message });
      throw error;
    }
  }

  async getThumbnailPath(assetPath) {
    const thumbPath = path.join(
      this.cacheDir,
      `${path.basename(assetPath, path.extname(assetPath))}_thumb.jpg`
    );
    
    const exists = await fs.access(thumbPath).then(() => true).catch(() => false);
    return exists ? thumbPath : null;
  }

  async cleanup(maxAge = 7 * 24 * 60 * 60 * 1000) {
    try {
      const files = await fs.readdir(this.cacheDir);
      const now = Date.now();
      let removed = 0;

      for (const file of files) {
        const filePath = path.join(this.cacheDir, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtimeMs > maxAge) {
          await fs.unlink(filePath);
          removed++;
        }
      }

      this.logger.info('Thumbnail cleanup completed', { removed });
    } catch (error) {
      this.logger.error('Thumbnail cleanup failed', { error: error.message });
    }
  }
}
