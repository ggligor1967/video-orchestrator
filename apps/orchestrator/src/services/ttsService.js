import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';
import { v4 as uuidv4 } from 'uuid';
import { getToolPaths } from '../config/toolPaths.js';

export class TTSService {
  constructor({ logger, config }) {
    this.logger = logger;
    this.config = config;
    this.isMockMode = this.config?.tts?.provider === 'mock' || this.config?.ai?.provider === 'mock';
    this.toolPaths = getToolPaths();
    this.piperPath = this.toolPaths.piper;
    this.modelsDir = path.join(path.dirname(this.piperPath), '..', 'models');
    this.cacheDir = process.env.TTS_CACHE_DIR || './data/tts';
    this.piperAvailable = false;
    
    // Initialize on construction (skip in mock mode)
    if (!this.isMockMode) {
      this.initialize().catch(err => {
        this.logger.error('TTS initialization failed', { error: err.message });
      });
    } else {
      this.logger.info('TTS service running in mock mode');
    }
  }
  
  async initialize() {
    try {
      await fs.access(this.piperPath);
      const modelFiles = await fs.readdir(this.modelsDir);
      const onnxFiles = modelFiles.filter(f => f.endsWith('.onnx'));
      
      // Check actual file sizes to filter out 0-byte placeholder files
      const validModels = [];
      for (const file of onnxFiles) {
        try {
          const stats = await fs.stat(path.join(this.modelsDir, file));
          if (stats.size > 1024 * 1024) { // At least 1 MB
            validModels.push(file);
          }
        } catch {
          // Skip files we can't stat
        }
      }
      
      if (validModels.length === 0) {
        throw new Error('No valid voice models found in ' + this.modelsDir);
      }
      
      this.piperAvailable = true;
      this.logger.info('Piper TTS initialized', { 
        piperPath: this.piperPath,
        models: validModels.length,
        availableVoices: validModels.map(m => m.replace('.onnx', ''))
      });
    } catch (error) {
      this.piperAvailable = false;
      this.logger.warn('Piper TTS not available', { 
        error: error.message,
        piperPath: this.piperPath,
        modelsDir: this.modelsDir
      });
    }
  }

  async generateVoiceOver(text, options = {}) {
    const {
      voice = 'en_US-amy-medium',
      speed = 1.0,
      outputFilename
    } = options;
    
    // Mock mode implementation
    if (this.isMockMode) {
      return this.generateMockVoiceOver(text, { voice, speed, outputFilename });
    }
    
    await fs.mkdir(this.cacheDir, { recursive: true });
    
    const outputPath = path.join(this.cacheDir, outputFilename || `tts_${Date.now()}.wav`);
    
    if (!this.piperAvailable) {
      throw new Error('Piper TTS not available. Please ensure Piper binary and voice models are installed in tools/piper/');
    }
    
    try {
      await this.runPiper(text, voice, outputPath, speed);
      await this.normalizeAudio(outputPath);
      
      const duration = await this.getAudioDuration(outputPath);
      
      this.logger.info('TTS generated successfully', {
        voice,
        textLength: text.length,
        duration,
        outputPath
      });

      return {
        id: uuidv4(),
        path: outputPath,
        duration,
        voice,
        text: text.substring(0, 100) + '...',
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error('TTS generation failed', { error: error.message, voice, textLength: text.length });
      throw new Error(`Failed to generate TTS: ${error.message}`);
    }
  }

  async generateMockVoiceOver(text, options = {}) {
    const { voice = 'en_US-amy-medium', outputFilename } = options;

    // Create mock audio file path
    const outputPath = path.join(this.cacheDir, outputFilename || `tts_mock_${Date.now()}.wav`);

    // Estimate duration based on text length (rough approximation: ~150 words per minute)
    const wordsPerMinute = 150;
    const words = text.split(/\s+/).length;
    const estimatedDuration = Math.max((words / wordsPerMinute) * 60, 1); // Minimum 1 second

    // Create a minimal WAV file header for mock purposes
    const mockWavData = Buffer.alloc(44); // WAV header is 44 bytes
    mockWavData.write('RIFF', 0);
    mockWavData.writeUInt32LE(36, 4); // File size - 8
    mockWavData.write('WAVE', 8);
    mockWavData.write('fmt ', 12);
    mockWavData.writeUInt32LE(16, 16); // PCM format chunk size
    mockWavData.writeUInt16LE(1, 20); // PCM format
    mockWavData.writeUInt16LE(1, 22); // Mono
    mockWavData.writeUInt32LE(44100, 24); // Sample rate
    mockWavData.writeUInt32LE(44100 * 2, 28); // Byte rate
    mockWavData.writeUInt16LE(2, 32); // Block align
    mockWavData.writeUInt16LE(16, 34); // Bits per sample
    mockWavData.write('data', 36);
    mockWavData.writeUInt32LE(0, 40); // Data size (empty for mock)

    // Ensure cache directory exists
    await fs.mkdir(this.cacheDir, { recursive: true });

    // Write mock WAV file
    await fs.writeFile(outputPath, mockWavData);

    this.logger.info('Mock TTS generated successfully', {
      voice,
      textLength: text.length,
      estimatedDuration,
      outputPath
    });

    return {
      id: uuidv4(),
      path: outputPath,
      duration: estimatedDuration,
      voice,
      text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
      generatedAt: new Date().toISOString(),
      mock: true
    };
  }

  // Alias method for controller compatibility
  async generateSpeech(params) {
    const { text, voice, speed, pitch, outputPath } = params;
    return this.generateVoiceOver(text, {
      voice,
      speed,
      pitch,
      outputFilename: outputPath ? path.basename(outputPath) : undefined
    });
  }

  async runPiper(text, voice, outputPath, speed) {
    const modelPath = path.join(this.modelsDir, `${voice}.onnx`);
    
    return new Promise((resolve, reject) => {
      const args = [
        '--model', modelPath,
        '--output_file', outputPath,
        '--length_scale', (1 / speed).toString()
      ];

      const piper = spawn(this.piperPath, args);
      
      piper.stdin.write(text);
      piper.stdin.end();

      let stderr = '';
      
      piper.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      piper.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Piper exited with code ${code}: ${stderr}`));
        }
      });

      piper.on('error', (error) => {
        reject(new Error(`Failed to spawn Piper: ${error.message}`));
      });
    });
  }

  async normalizeAudio(audioPath) {
    const ffmpeg = require('fluent-ffmpeg');
    const ffmpegPath = this.toolPaths.ffmpeg || path.join(process.cwd(), 'tools/ffmpeg/bin/ffmpeg.exe');
    ffmpeg.setFfmpegPath(ffmpegPath);
    
    const normalizedPath = audioPath.replace('.wav', '_normalized.wav');
    
    return new Promise((resolve, reject) => {
      ffmpeg(audioPath)
        .audioFilters([
          'loudnorm=I=-16:TP=-1.5:LRA=11',
          'highpass=f=80',
          'lowpass=f=15000'
        ])
        .output(normalizedPath)
        .on('end', async () => {
          try {
            await fs.rename(normalizedPath, audioPath);
            this.logger.debug('Audio normalized successfully', { audioPath });
            resolve();
          } catch (err) {
            reject(err);
          }
        })
        .on('error', (err) => {
          this.logger.error('Audio normalization failed', { error: err.message, audioPath });
          // Don't fail the whole process if normalization fails
          resolve();
        })
        .run();
    });
  }

  async getAudioDuration(audioPath) {
    const ffmpeg = require('fluent-ffmpeg');
    const ffmpegPath = this.toolPaths.ffmpeg || path.join(process.cwd(), 'tools/ffmpeg/bin/ffmpeg.exe');
    ffmpeg.setFfmpegPath(ffmpegPath);
    ffmpeg.setFfprobePath(ffmpegPath.replace('ffmpeg.exe', 'ffprobe.exe'));
    
    return new Promise((resolve, _reject) => {
      ffmpeg.ffprobe(audioPath, (err, metadata) => {
        if (err) {
          this.logger.error('Failed to probe audio duration', { error: err.message, audioPath });
          // Return estimated duration based on file size as fallback
          fs.stat(audioPath).then(stats => {
            resolve(Math.max(stats.size / 44100, 1));
          }).catch(() => resolve(1));
        } else {
          resolve(metadata.format.duration || 1);
        }
      });
    });
  }

  async listAvailableVoices() {
    try {
      const files = await fs.readdir(this.modelsDir);
      const voices = files
        .filter(file => file.endsWith('.onnx'))
        .map(file => ({
          id: file.replace('.onnx', ''),
          name: file.replace('.onnx', '').replaceAll('_', ' '),
          language: file.split('-')[0] || 'en_US'
        }));
      
      return voices.length > 0 ? voices : this.getDefaultVoices();
    } catch {
      return this.getDefaultVoices();
    }
  }

  getDefaultVoices() {
    return [
      { id: 'en_US-amy-medium', name: 'English (US) Amy', language: 'en_US' },
      { id: 'en_US-libritts-high', name: 'English (US) LibriTTS', language: 'en_US' },
      { id: 'ro_RO-mihai-medium', name: 'Romanian Mihai', language: 'ro_RO' }
    ];
  }
}

// Factory function
export const createTTSService = ({ logger }) => {
  return new TTSService({ logger });
};

// Legacy export
export const ttsService = {
  generateSpeech: async (params) => {
    const service = new TTSService({ logger: console });
    return service.generateVoiceOver(params.text, params);
  },
  listAvailableVoices: async () => {
    const service = new TTSService({ logger: console });
    return service.listAvailableVoices();
  }
};