import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';

export class HealthService {
  constructor({ logger }) {
    this.logger = logger;
    this.toolsDir = process.env.TOOLS_DIR || './tools';
  }

  async checkBinary(binaryPath) {
    try {
      await fs.access(binaryPath);
      
      // Test if binary is executable
      const fullPath = path.resolve(binaryPath);
      execSync(`"${fullPath}" --version`, { 
        stdio: 'pipe', 
        timeout: 5000 
      });
      
      return { available: true, path: fullPath };
    } catch (error) {
      return { 
        available: false, 
        path: binaryPath, 
        error: error.message 
      };
    }
  }

  async verifyTools() {
    this.logger.info('Verifying external tools availability');

    const tools = {
      ffmpeg: await this.checkBinary(process.env.FFMPEG_PATH || path.join(this.toolsDir, 'ffmpeg/bin/ffmpeg.exe')),
      piper: await this.checkBinary(process.env.PIPER_PATH || path.join(this.toolsDir, 'piper/bin/piper.exe')),
      whisper: await this.checkBinary(process.env.WHISPER_PATH || path.join(this.toolsDir, 'whisper/bin/main.exe')),
      godot: await this.checkBinary(path.join(this.toolsDir, 'godot/bin/godot.exe'))
    };

    // Check models
    const models = await this.checkModels();
    
    const result = {
      tools,
      models,
      summary: {
        totalTools: Object.keys(tools).length,
        availableTools: Object.values(tools).filter(t => t.available).length,
        totalModels: Object.keys(models).length,
        availableModels: Object.values(models).filter(m => m.available).length
      }
    };

    this.logger.info('Tool verification complete', {
      available: result.summary.availableTools,
      total: result.summary.totalTools
    });

    return result;
  }

  async checkModels() {
    const models = {};

    // Check Piper models
    try {
      const piperModelsDir = path.join(this.toolsDir, 'piper/models');
      const piperFiles = await fs.readdir(piperModelsDir);
      
      models.piperVoices = piperFiles
        .filter(f => f.endsWith('.onnx'))
        .map(f => f.replace('.onnx', ''));
      
      models.piperAvailable = models.piperVoices.length > 0;
    } catch {
      models.piperVoices = [];
      models.piperAvailable = false;
    }

    // Check Whisper models
    try {
      const whisperModelsDir = path.join(this.toolsDir, 'whisper/models');
      const whisperFiles = await fs.readdir(whisperModelsDir);
      
      models.whisperModels = whisperFiles.filter(f => f.endsWith('.bin'));
      models.whisperAvailable = models.whisperModels.length > 0;
    } catch {
      models.whisperModels = [];
      models.whisperAvailable = false;
    }

    return models;
  }

  async getSystemInfo() {
    const os = process.platform;
    const arch = process.arch;
    const nodeVersion = process.version;
    const memory = process.memoryUsage();

    return {
      platform: os,
      architecture: arch,
      nodeVersion,
      memory: {
        rss: Math.round(memory.rss / 1024 / 1024) + ' MB',
        heapTotal: Math.round(memory.heapTotal / 1024 / 1024) + ' MB',
        heapUsed: Math.round(memory.heapUsed / 1024 / 1024) + ' MB'
      },
      uptime: Math.round(process.uptime()) + ' seconds'
    };
  }

  async getHealthStatus() {
    try {
      const [tools, system] = await Promise.all([
        this.verifyTools(),
        this.getSystemInfo()
      ]);

      const isHealthy = tools.summary.availableTools >= 3; // At least FFmpeg, Piper, Whisper

      return {
        status: isHealthy ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        tools,
        system,
        recommendations: this.getRecommendations(tools)
      };
    } catch (error) {
      this.logger.error('Health check failed', { error: error.message });
      
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }
  }

  getRecommendations(tools) {
    const recommendations = [];

    if (!tools.tools.ffmpeg.available) {
      recommendations.push({
        type: 'critical',
        message: 'FFmpeg is required for video processing',
        action: 'Download from https://www.gyan.dev/ffmpeg/builds/'
      });
    }

    if (!tools.tools.piper.available) {
      recommendations.push({
        type: 'critical',
        message: 'Piper TTS is required for voice generation',
        action: 'Download from https://github.com/rhasspy/piper/releases'
      });
    }

    if (!tools.tools.whisper.available) {
      recommendations.push({
        type: 'critical',
        message: 'Whisper is required for subtitle generation',
        action: 'Download from https://github.com/ggerganov/whisper.cpp/releases'
      });
    }

    if (!tools.tools.godot.available) {
      recommendations.push({
        type: 'optional',
        message: 'Godot Engine enables procedural background generation',
        action: 'Download from https://godotengine.org/download'
      });
    }

    if (!tools.models.piperAvailable) {
      recommendations.push({
        type: 'warning',
        message: 'No Piper voice models found',
        action: 'Download models from https://huggingface.co/rhasspy/piper-voices'
      });
    }

    if (!tools.models.whisperAvailable) {
      recommendations.push({
        type: 'warning',
        message: 'No Whisper models found',
        action: 'Download models from https://huggingface.co/ggerganov/whisper.cpp'
      });
    }

    return recommendations;
  }
}