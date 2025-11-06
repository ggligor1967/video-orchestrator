import fs from 'fs/promises';
import path from 'path';
import { v4 as uuid } from 'uuid';
import ffmpeg from 'fluent-ffmpeg';
import { ffmpegService } from './ffmpegService.js';

/**
 * Brand Kit Service
 *
 * Manages brand identity kits that provide consistent visual identity
 * across all videos including colors, fonts, logos, intros, outros,
 * watermarks, and default settings.
 *
 * Features:
 * - Brand kit CRUD operations
 * - Color palette management
 * - Logo overlay with positioning
 * - Intro/outro video management
 * - Watermark text/image
 * - Default voice and caption settings
 * - Music library per brand
 * - Apply brand kit to videos
 */
export class BrandKitService {
  constructor({ logger }) {
    this.logger = logger;
    this.ffmpegService = ffmpegService;

    // Brand kits storage directory
    this.brandsDir = path.join(process.cwd(), 'data', 'brands');
    this.brandsConfigDir = path.join(this.brandsDir, 'configs');
    this.brandAssetsDir = path.join(this.brandsDir, 'assets');

    // Initialize directories
    this.initializeBrandDirs();
  }

  async initializeBrandDirs() {
    try {
      await fs.mkdir(this.brandsDir, { recursive: true });
      await fs.mkdir(this.brandsConfigDir, { recursive: true });
      await fs.mkdir(this.brandAssetsDir, { recursive: true });

      this.logger.info('Brand kit directories initialized', {
        brandsDir: this.brandsDir,
        configDir: this.brandsConfigDir,
        assetsDir: this.brandAssetsDir
      });
    } catch (error) {
      this.logger.error('Failed to create brand directories', {
        error: error.message
      });
    }
  }

  /**
   * Get all brand kits
   */
  async getAllBrandKits(options = {}) {
    const { search } = options;

    this.logger.info('Getting all brand kits', { search });

    try {
      const files = await fs.readdir(this.brandsConfigDir);
      let brandKits = await Promise.all(
        files
          .filter(file => file.endsWith('.json'))
          .map(async file => {
            const content = await fs.readFile(
              path.join(this.brandsConfigDir, file),
              'utf-8'
            );
            return JSON.parse(content);
          })
      );

      // Apply search filter
      if (search) {
        const searchLower = search.toLowerCase();
        brandKits = brandKits.filter(kit =>
          kit.name.toLowerCase().includes(searchLower) ||
          (kit.description && kit.description.toLowerCase().includes(searchLower))
        );
      }

      this.logger.info('Brand kits retrieved', {
        total: brandKits.length
      });

      return brandKits;

    } catch (error) {
      // No brand kits yet
      if (error.code === 'ENOENT') {
        return [];
      }

      this.logger.error('Failed to get brand kits', {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get brand kit by ID
   */
  async getBrandKitById(brandKitId) {
    this.logger.info('Getting brand kit by ID', { brandKitId });

    try {
      const filePath = path.join(this.brandsConfigDir, `${brandKitId}.json`);
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`Brand kit not found: ${brandKitId}`);
      }
      throw error;
    }
  }

  /**
   * Create brand kit
   */
  async createBrandKit(brandData) {
    const brandKit = {
      id: `brand-${uuid()}`,
      name: brandData.name,
      description: brandData.description || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),

      // Visual Identity
      colors: {
        primary: brandData.colors?.primary || '#FF0000',
        secondary: brandData.colors?.secondary || '#000000',
        accent: brandData.colors?.accent || '#FFFFFF',
        background: brandData.colors?.background || '#1A1A1A',
        text: brandData.colors?.text || '#FFFFFF'
      },

      // Typography
      fonts: {
        primary: brandData.fonts?.primary || 'Montserrat-Bold',
        secondary: brandData.fonts?.secondary || 'Arial',
        sizes: {
          heading: brandData.fonts?.sizes?.heading || 90,
          body: brandData.fonts?.sizes?.body || 70,
          caption: brandData.fonts?.sizes?.caption || 50
        }
      },

      // Logo
      logo: brandData.logo ? {
        path: brandData.logo.path || null,
        position: brandData.logo.position || 'top-right',
        size: brandData.logo.size || 'small',
        opacity: brandData.logo.opacity || 0.8,
        margin: brandData.logo.margin || 20
      } : {
        path: null,
        position: 'top-right',
        size: 'small',
        opacity: 0.8,
        margin: 20
      },

      // Watermark
      watermark: brandData.watermark ? {
        enabled: brandData.watermark.enabled !== false,
        type: brandData.watermark.type || 'text',
        text: brandData.watermark.text || '',
        imagePath: brandData.watermark.imagePath || null,
        position: brandData.watermark.position || 'bottom-right',
        style: brandData.watermark.style || 'minimal',
        opacity: brandData.watermark.opacity || 0.7,
        fontSize: brandData.watermark.fontSize || 40
      } : {
        enabled: false,
        type: 'text',
        text: '',
        imagePath: null,
        position: 'bottom-right',
        style: 'minimal',
        opacity: 0.7,
        fontSize: 40
      },

      // Intro
      intro: brandData.intro ? {
        enabled: brandData.intro.enabled !== false,
        duration: brandData.intro.duration || 3,
        videoPath: brandData.intro.videoPath || null,
        style: brandData.intro.style || 'fade-in'
      } : {
        enabled: false,
        duration: 3,
        videoPath: null,
        style: 'fade-in'
      },

      // Outro
      outro: brandData.outro ? {
        enabled: brandData.outro.enabled !== false,
        duration: brandData.outro.duration || 5,
        videoPath: brandData.outro.videoPath || null,
        callToAction: brandData.outro.callToAction || '',
        style: brandData.outro.style || 'fade-out'
      } : {
        enabled: false,
        duration: 5,
        videoPath: null,
        callToAction: '',
        style: 'fade-out'
      },

      // Default Settings
      defaults: {
        voice: brandData.defaults?.voice || 'en_US-hfc_male-medium',
        captionStyle: brandData.defaults?.captionStyle || 'tiktok-trending',
        exportPreset: brandData.defaults?.exportPreset || 'tiktok',
        musicVolume: brandData.defaults?.musicVolume || 0.25
      },

      // Music Library
      musicLibrary: brandData.musicLibrary || []
    };

    this.logger.info('Creating brand kit', {
      brandKitId: brandKit.id,
      name: brandKit.name
    });

    try {
      // Create brand assets directory
      const brandAssetsPath = path.join(this.brandAssetsDir, brandKit.id);
      await fs.mkdir(brandAssetsPath, { recursive: true });

      // Save brand kit configuration
      const filePath = path.join(this.brandsConfigDir, `${brandKit.id}.json`);
      await fs.writeFile(filePath, JSON.stringify(brandKit, null, 2), 'utf-8');

      this.logger.info('Brand kit created', {
        brandKitId: brandKit.id,
        filePath
      });

      return brandKit;

    } catch (error) {
      this.logger.error('Failed to create brand kit', {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Update brand kit
   */
  async updateBrandKit(brandKitId, updates) {
    this.logger.info('Updating brand kit', { brandKitId });

    try {
      // Get existing brand kit
      const brandKit = await this.getBrandKitById(brandKitId);

      // Deep merge updates
      const updatedBrandKit = {
        ...brandKit,
        ...updates,
        id: brandKitId, // Ensure ID doesn't change
        updatedAt: new Date().toISOString(),
        colors: { ...brandKit.colors, ...updates.colors },
        fonts: {
          ...brandKit.fonts,
          ...updates.fonts,
          sizes: { ...brandKit.fonts.sizes, ...updates.fonts?.sizes }
        },
        logo: { ...brandKit.logo, ...updates.logo },
        watermark: { ...brandKit.watermark, ...updates.watermark },
        intro: { ...brandKit.intro, ...updates.intro },
        outro: { ...brandKit.outro, ...updates.outro },
        defaults: { ...brandKit.defaults, ...updates.defaults }
      };

      // Save updated brand kit
      const filePath = path.join(this.brandsConfigDir, `${brandKitId}.json`);
      await fs.writeFile(
        filePath,
        JSON.stringify(updatedBrandKit, null, 2),
        'utf-8'
      );

      this.logger.info('Brand kit updated', { brandKitId });

      return updatedBrandKit;

    } catch (error) {
      this.logger.error('Failed to update brand kit', {
        error: error.message,
        brandKitId
      });
      throw error;
    }
  }

  /**
   * Delete brand kit
   */
  async deleteBrandKit(brandKitId) {
    this.logger.info('Deleting brand kit', { brandKitId });

    try {
      // Delete configuration file
      const filePath = path.join(this.brandsConfigDir, `${brandKitId}.json`);
      await fs.unlink(filePath);

      // Delete brand assets directory
      const brandAssetsPath = path.join(this.brandAssetsDir, brandKitId);
      try {
        await fs.rm(brandAssetsPath, { recursive: true, force: true });
      } catch (_error) {
        // Assets directory might not exist, that's fine
      }

      this.logger.info('Brand kit deleted', { brandKitId });

      return { deleted: true };

    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`Brand kit not found: ${brandKitId}`);
      }

      this.logger.error('Failed to delete brand kit', {
        error: error.message,
        brandKitId
      });
      throw error;
    }
  }

  /**
   * Upload logo
   */
  async uploadLogo(brandKitId, logoFile) {
    this.logger.info('Uploading logo', { brandKitId });

    try {
      const brandKit = await this.getBrandKitById(brandKitId);

      // Generate logo filename
      const ext = path.extname(logoFile.originalname);
      const logoFilename = `logo-${Date.now()}${ext}`;
      const logoPath = path.join(this.brandAssetsDir, brandKitId, logoFilename);

      // Save logo file
      await fs.writeFile(logoPath, logoFile.buffer);

      // Update brand kit with logo path
      const relativePath = path.relative(process.cwd(), logoPath);
      brandKit.logo.path = relativePath;

      await this.updateBrandKit(brandKitId, { logo: brandKit.logo });

      this.logger.info('Logo uploaded', {
        brandKitId,
        logoPath: relativePath
      });

      return { logoPath: relativePath };

    } catch (error) {
      this.logger.error('Failed to upload logo', {
        error: error.message,
        brandKitId
      });
      throw error;
    }
  }

  /**
   * Upload intro video
   */
  async uploadIntro(brandKitId, videoFile) {
    this.logger.info('Uploading intro video', { brandKitId });

    try {
      const brandKit = await this.getBrandKitById(brandKitId);

      const ext = path.extname(videoFile.originalname);
      const introFilename = `intro-${Date.now()}${ext}`;
      const introPath = path.join(this.brandAssetsDir, brandKitId, introFilename);

      await fs.writeFile(introPath, videoFile.buffer);

      const relativePath = path.relative(process.cwd(), introPath);
      brandKit.intro.videoPath = relativePath;
      brandKit.intro.enabled = true;

      await this.updateBrandKit(brandKitId, { intro: brandKit.intro });

      this.logger.info('Intro video uploaded', {
        brandKitId,
        introPath: relativePath
      });

      return { introPath: relativePath };

    } catch (error) {
      this.logger.error('Failed to upload intro', {
        error: error.message,
        brandKitId
      });
      throw error;
    }
  }

  /**
   * Upload outro video
   */
  async uploadOutro(brandKitId, videoFile) {
    this.logger.info('Uploading outro video', { brandKitId });

    try {
      const brandKit = await this.getBrandKitById(brandKitId);

      const ext = path.extname(videoFile.originalname);
      const outroFilename = `outro-${Date.now()}${ext}`;
      const outroPath = path.join(this.brandAssetsDir, brandKitId, outroFilename);

      await fs.writeFile(outroPath, videoFile.buffer);

      const relativePath = path.relative(process.cwd(), outroPath);
      brandKit.outro.videoPath = relativePath;
      brandKit.outro.enabled = true;

      await this.updateBrandKit(brandKitId, { outro: brandKit.outro });

      this.logger.info('Outro video uploaded', {
        brandKitId,
        outroPath: relativePath
      });

      return { outroPath: relativePath };

    } catch (error) {
      this.logger.error('Failed to upload outro', {
        error: error.message,
        brandKitId
      });
      throw error;
    }
  }

  /**
   * Upload background music
   */
  async uploadMusic(brandKitId, musicFile) {
    this.logger.info('Uploading background music', { brandKitId });

    try {
      const brandKit = await this.getBrandKitById(brandKitId);

      const ext = path.extname(musicFile.originalname);
      const musicFilename = `music-${Date.now()}${ext}`;
      const musicPath = path.join(this.brandAssetsDir, brandKitId, musicFilename);

      await fs.writeFile(musicPath, musicFile.buffer);

      const relativePath = path.relative(process.cwd(), musicPath);

      // Add to music library
      if (!brandKit.musicLibrary) {
        brandKit.musicLibrary = [];
      }
      brandKit.musicLibrary.push(relativePath);

      await this.updateBrandKit(brandKitId, { musicLibrary: brandKit.musicLibrary });

      this.logger.info('Background music uploaded', {
        brandKitId,
        musicPath: relativePath
      });

      return { musicPath: relativePath };

    } catch (error) {
      this.logger.error('Failed to upload music', {
        error: error.message,
        brandKitId
      });
      throw error;
    }
  }

  /**
   * Apply brand kit to video
   */
  async applyBrandKit(brandKitId, videoPath, options = {}) {
    this.logger.info('Applying brand kit to video', {
      brandKitId,
      videoPath
    });

    try {
      const brandKit = await this.getBrandKitById(brandKitId);
      const outputPath = options.outputPath || videoPath.replace('.mp4', '-branded.mp4');

      let currentVideo = videoPath;

      // 1. Add intro if enabled
      if (brandKit.intro.enabled && brandKit.intro.videoPath) {
        this.logger.info('Adding intro video');
        currentVideo = await this.addIntro(currentVideo, brandKit.intro, outputPath);
      }

      // 2. Add logo overlay if configured
      if (brandKit.logo.path) {
        this.logger.info('Adding logo overlay');
        currentVideo = await this.addLogoOverlay(currentVideo, brandKit.logo, outputPath);
      }

      // 3. Add watermark if enabled
      if (brandKit.watermark.enabled) {
        this.logger.info('Adding watermark');
        currentVideo = await this.addWatermark(currentVideo, brandKit.watermark, outputPath);
      }

      // 4. Add outro if enabled
      if (brandKit.outro.enabled && brandKit.outro.videoPath) {
        this.logger.info('Adding outro video');
        currentVideo = await this.addOutro(currentVideo, brandKit.outro, outputPath);
      }

      this.logger.info('Brand kit applied successfully', {
        brandKitId,
        outputPath: currentVideo
      });

      return {
        success: true,
        brandKitId,
        outputPath: currentVideo
      };

    } catch (error) {
      this.logger.error('Failed to apply brand kit', {
        error: error.message,
        brandKitId,
        videoPath
      });
      throw error;
    }
  }

  /**
   * Add intro video
   */
  async addIntro(videoPath, introConfig, outputPath) {
    const tempOutput = outputPath.replace('.mp4', '-with-intro.mp4');

    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(introConfig.videoPath)
        .input(videoPath)
        .complexFilter([
          '[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1[outv][outa]'
        ])
        .outputOptions(['-map', '[outv]', '-map', '[outa]'])
        .output(tempOutput)
        .on('end', () => {
          this.logger.info('Intro added successfully');
          resolve(tempOutput);
        })
        .on('error', (err) => {
          this.logger.error('Failed to add intro', { error: err.message });
          reject(err);
        })
        .run();
    });
  }

  /**
   * Add logo overlay
   */
  async addLogoOverlay(videoPath, logoConfig, outputPath) {
    const tempOutput = outputPath.replace('.mp4', '-with-logo.mp4');

    // Calculate logo position
    const position = this.calculateLogoPosition(logoConfig);

    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .input(logoConfig.path)
        .complexFilter([
          `[1:v]scale=${logoConfig.size === 'small' ? 150 : logoConfig.size === 'medium' ? 250 : 350}:-1[logo]`,
          `[0:v][logo]overlay=${position.x}:${position.y}:format=auto,format=yuv420p`
        ])
        .outputOptions(['-c:a', 'copy'])
        .output(tempOutput)
        .on('end', () => {
          this.logger.info('Logo overlay added successfully');
          resolve(tempOutput);
        })
        .on('error', (err) => {
          this.logger.error('Failed to add logo overlay', { error: err.message });
          reject(err);
        })
        .run();
    });
  }

  /**
   * Add watermark
   */
  async addWatermark(videoPath, watermarkConfig, outputPath) {
    const tempOutput = outputPath.replace('.mp4', '-with-watermark.mp4');

    const position = this.calculateWatermarkPosition(watermarkConfig);

    return new Promise((resolve, reject) => {
      const filterComplex = watermarkConfig.type === 'text'
        ? `drawtext=text='${watermarkConfig.text}':fontsize=${watermarkConfig.fontSize}:fontcolor=white@${watermarkConfig.opacity}:x=${position.x}:y=${position.y}:borderw=2:bordercolor=black@0.5`
        : `[1:v]scale=200:-1[wm];[0:v][wm]overlay=${position.x}:${position.y}`;

      const cmd = ffmpeg(videoPath);

      if (watermarkConfig.type === 'image' && watermarkConfig.imagePath) {
        cmd.input(watermarkConfig.imagePath);
      }

      cmd
        .complexFilter([filterComplex])
        .outputOptions(['-c:a', 'copy'])
        .output(tempOutput)
        .on('end', () => {
          this.logger.info('Watermark added successfully');
          resolve(tempOutput);
        })
        .on('error', (err) => {
          this.logger.error('Failed to add watermark', { error: err.message });
          reject(err);
        })
        .run();
    });
  }

  /**
   * Add outro video
   */
  async addOutro(videoPath, outroConfig, outputPath) {
    const tempOutput = outputPath.replace('.mp4', '-with-outro.mp4');

    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(videoPath)
        .input(outroConfig.videoPath)
        .complexFilter([
          '[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1[outv][outa]'
        ])
        .outputOptions(['-map', '[outv]', '-map', '[outa]'])
        .output(tempOutput)
        .on('end', () => {
          this.logger.info('Outro added successfully');
          resolve(tempOutput);
        })
        .on('error', (err) => {
          this.logger.error('Failed to add outro', { error: err.message });
          reject(err);
        })
        .run();
    });
  }

  /**
   * Calculate logo position based on configuration
   */
  calculateLogoPosition(logoConfig) {
    const margin = logoConfig.margin || 20;

    const positions = {
      'top-left': { x: margin, y: margin },
      'top-right': { x: `W-w-${margin}`, y: margin },
      'top-center': { x: '(W-w)/2', y: margin },
      'bottom-left': { x: margin, y: `H-h-${margin}` },
      'bottom-right': { x: `W-w-${margin}`, y: `H-h-${margin}` },
      'bottom-center': { x: '(W-w)/2', y: `H-h-${margin}` },
      'center': { x: '(W-w)/2', y: '(H-h)/2' }
    };

    return positions[logoConfig.position] || positions['top-right'];
  }

  /**
   * Calculate watermark position
   */
  calculateWatermarkPosition(watermarkConfig) {
    const margin = 20;

    const positions = {
      'top-left': { x: margin, y: margin },
      'top-right': { x: `W-w-${margin}`, y: margin },
      'bottom-left': { x: margin, y: `H-h-${margin}` },
      'bottom-right': { x: `W-w-${margin}`, y: `H-h-${margin}` },
      'center': { x: '(W-w)/2', y: '(H-h)/2' }
    };

    return positions[watermarkConfig.position] || positions['bottom-right'];
  }

  /**
   * Get brand kit assets directory
   */
  getBrandAssetsPath(brandKitId) {
    return path.join(this.brandAssetsDir, brandKitId);
  }

  /**
   * Get random music from brand kit library
   */
  getRandomMusic(brandKit) {
    if (!brandKit.musicLibrary || brandKit.musicLibrary.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * brandKit.musicLibrary.length);
    return brandKit.musicLibrary[randomIndex];
  }
}
