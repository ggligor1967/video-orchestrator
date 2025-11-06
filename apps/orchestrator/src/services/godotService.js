import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';
import { v4 as uuidv4 } from 'uuid';
import { getToolPaths } from '../config/toolPaths.js';

export class GodotService {
  constructor({ logger, stockMediaService }) {
    this.logger = logger;
    this.stockMediaService = stockMediaService;
    this.toolPaths = getToolPaths();
    this.godotPath = this.toolPaths.godot;
    this.projectPath = path.join(path.dirname(this.godotPath), '..', 'projects', 'voxel-generator');
    this.cacheDir = process.env.GODOT_CACHE_DIR || './data/assets/backgrounds';
    this.godotAvailable = false;
    this.initialize();
  }

  async initialize() {
    try {
      await fs.access(this.godotPath);
      await fs.access(this.projectPath);
      this.godotAvailable = true;
      this.logger.info('Godot Engine available', { godotPath: this.godotPath });
    } catch (error) {
      this.godotAvailable = false;
      this.logger.warn('Godot Engine not available, will use stock media fallback', { 
        error: error.message,
        godotPath: this.godotPath
      });
    }
  }

  async generateVoxelBackground(options = {}) {
    const {
      style = 'parkour',
      duration = 60,
      colorScheme = 'lowsat'
    } = options;
    
    await fs.mkdir(this.cacheDir, { recursive: true });
    const outputPath = path.join(this.cacheDir, `voxel_${Date.now()}.mp4`);
    
    if (!this.godotAvailable) {
      this.logger.info('Godot not available, using stock media fallback', { style, colorScheme });
      return this.getStockMediaFallback(style);
    }
    
    // Generate scene configuration
    const sceneConfig = this.generateSceneConfig(style, colorScheme);
    await this.writeSceneConfig(sceneConfig);
    
    // Run Godot with video export
    await this.runGodotExport(outputPath, duration);
    
    // Post-process video
    const result = await this.postProcessVideo(outputPath);
    
    this.logger.info('Voxel background generated successfully', {
      style,
      colorScheme,
      duration,
      outputPath
    });
    
    return result;
  }

  async getStockMediaFallback(style) {
    if (!this.stockMediaService) {
      throw new Error('Godot not available and no stock media service configured. Please install Godot or configure stock media API keys.');
    }

    // Map voxel styles to stock media search queries
    const searchQueries = {
      'parkour': 'abstract geometric motion',
      'endless': 'fast paced abstract background',
      'maze': 'geometric patterns moving'
    };

    const query = searchQueries[style] || 'abstract background vertical';
    
    try {
      const results = await this.stockMediaService.searchVideos(query, {
        orientation: 'portrait',
        perPage: 5
      });

      if (results.length === 0) {
        throw new Error('No suitable stock videos found for voxel background fallback');
      }

      // Download the first result
      const stockVideo = results[0];
      const downloadResult = await this.stockMediaService.downloadVideo(stockVideo.id, {
        quality: 'medium'
      });

      return {
        id: downloadResult.id,
        path: downloadResult.path,
        duration: stockVideo.duration,
        size: downloadResult.size,
        format: 'mp4',
        resolution: '1080x1920',
        style,
        source: 'stock-media-fallback',
        provider: stockVideo.provider,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Failed to get stock media fallback: ${error.message}. Please install Godot or configure stock media API keys.`);
    }
  }

  generateSceneConfig(style, colorScheme) {
    const configs = {
      'parkour': {
        blockSize: 1.0,
        spacing: 0.2,
        height: { min: 1, max: 5 },
        cameraSpeed: 10,
        cameraHeight: 3
      },
      'endless': {
        blockSize: 0.8,
        spacing: 0.1,
        height: { min: 0.5, max: 3 },
        cameraSpeed: 15,
        cameraHeight: 2
      },
      'maze': {
        blockSize: 1.2,
        spacing: 0.3,
        height: { min: 2, max: 8 },
        cameraSpeed: 8,
        cameraHeight: 4
      }
    };
    
    const colors = {
      'lowsat': ['#4A5568', '#718096', '#A0AEC0', '#CBD5E0'],
      'vibrant': ['#F56565', '#ED8936', '#48BB78', '#4299E1'],
      'dark': ['#1A202C', '#2D3748', '#4A5568', '#718096'],
      'neon': ['#FF00FF', '#00FFFF', '#FFFF00', '#FF0080']
    };
    
    return {
      ...configs[style] || configs.parkour,
      colors: colors[colorScheme] || colors.lowsat,
      seed: Math.floor(Math.random() * 1000000)
    };
  }

  async writeSceneConfig(config) {
    const configPath = path.join(this.projectPath, 'config.json');
    await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf8');
  }

  async runGodotExport(outputPath, duration) {
    return new Promise((resolve, reject) => {
      const args = [
        '--path', this.projectPath,
        '--export-video', outputPath,
        '--video-duration', duration.toString(),
        '--video-fps', '30',
        '--no-window',
        '--headless'
      ];

      const godot = spawn(this.godotPath, args);
      
      let stderr = '';
      
      godot.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      godot.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Godot exited with code ${code}: ${stderr}`));
        }
      });

      godot.on('error', (error) => {
        reject(new Error(`Failed to spawn Godot: ${error.message}`));
      });
    });
  }

  async postProcessVideo(outputPath) {
    // Placeholder for video post-processing
    // In real implementation, would use FFmpeg to:
    // - Ensure 9:16 aspect ratio
    // - Apply color grading
    // - Add motion blur if needed
    
    const stats = await fs.stat(outputPath);
    
    return {
      id: uuidv4(),
      path: outputPath,
      duration: 60, // Mock duration
      size: stats.size,
      format: 'mp4',
      resolution: '1080x1920',
      generatedAt: new Date().toISOString()
    };
  }

  getAvailableStyles() {
    return [
      { id: 'parkour', name: 'Parkour', description: 'Dynamic blocks for movement-based content' },
      { id: 'endless', name: 'Endless Runner', description: 'Fast-paced continuous terrain' },
      { id: 'maze', name: 'Maze', description: 'Complex structures and pathways' }
    ];
  }

  getAvailableColorSchemes() {
    return [
      { id: 'lowsat', name: 'Low Saturation', description: 'Muted, professional colors' },
      { id: 'vibrant', name: 'Vibrant', description: 'Bright, energetic colors' },
      { id: 'dark', name: 'Dark Mode', description: 'Dark theme with subtle highlights' },
      { id: 'neon', name: 'Neon', description: 'Electric, cyberpunk-style colors' }
    ];
  }

  async checkGodotAvailability() {
    try {
      await fs.access(this.godotPath);
      await fs.access(this.projectPath);
      return { available: true, path: this.godotPath };
    } catch (error) {
      return { 
        available: false, 
        error: error.message,
        recommendations: [
          'Download Godot Engine from https://godotengine.org/download',
          'Extract to tools/godot/bin/godot.exe',
          'Ensure voxel-generator project exists in tools/godot/projects/'
        ]
      };
    }
  }
}

// Factory function
export const createGodotService = ({ logger, stockMediaService }) => {
  return new GodotService({ logger, stockMediaService });
};

// Legacy export
export const godotService = {
  generateVoxelBackground: async (options) => {
    const service = new GodotService({ logger: console });
    return service.generateVoxelBackground(options);
  },
  getAvailableStyles: () => {
    const service = new GodotService({ logger: console });
    return service.getAvailableStyles();
  }
};