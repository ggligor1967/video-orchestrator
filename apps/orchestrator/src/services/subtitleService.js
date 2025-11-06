import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';
import { v4 as uuidv4 } from 'uuid';
import { getToolPaths } from '../config/toolPaths.js';

export class SubtitleService {
  constructor({ logger, config }) {
    this.logger = logger;
    this.config = config;
    this.toolPaths = getToolPaths();
    this.whisperPath = this.toolPaths.whisper;
    this.modelsDir = path.join(path.dirname(this.whisperPath), '..', 'models');
    this.cacheDir = process.env.SUBS_CACHE_DIR || './data/subs';
    this.whisperAvailable = false;
    this.isMockMode = this.config?.whisper?.provider === 'mock';
    
    // Initialize on construction
    this.initialize().catch(err => {
      this.logger.error('Whisper initialization failed', { error: err.message });
    });
  }
  
  async initialize() {
    try {
      await fs.access(this.whisperPath);
      const modelFiles = await fs.readdir(this.modelsDir);
      const ggmlFiles = modelFiles.filter(f => f.startsWith('ggml-') && f.endsWith('.bin'));
      
      // Check actual file sizes to filter out 0-byte placeholder files
      const validModels = [];
      for (const file of ggmlFiles) {
        try {
          const stats = await fs.stat(path.join(this.modelsDir, file));
          if (stats.size > 10 * 1024 * 1024) { // At least 10 MB (Whisper models are large)
            validModels.push(file);
          }
        } catch {
          // Skip files we can't stat
        }
      }
      
      if (validModels.length === 0) {
        throw new Error('No valid Whisper models found in ' + this.modelsDir);
      }
      
      this.whisperAvailable = true;
      this.logger.info('Whisper initialized', { 
        whisperPath: this.whisperPath,
        models: validModels.length,
        availableModels: validModels
      });
    } catch (error) {
      this.whisperAvailable = false;
      this.logger.warn('Whisper not available', { 
        error: error.message,
        whisperPath: this.whisperPath,
        modelsDir: this.modelsDir
      });
    }
  }

  async generateSubtitles(audioPath, options = {}) {
    const {
      language = 'en',
      format = 'srt',
      style = 'default',
      outputFilename = `subs_${Date.now()}.${format}`
    } = options;
    
    // Mock mode implementation
    if (this.isMockMode) {
      return this.generateMockSubtitles(audioPath, { language, format, style, outputFilename });
    }
    
    await fs.mkdir(this.cacheDir, { recursive: true });
    
    try {
      // Step 1: Transcribe with Whisper
      const transcription = await this.transcribe(audioPath, language);
      
      // Step 2: Generate SRT with timing
      const srtContent = this.generateSRT(transcription);
      
      // Step 3: Apply styling
      const styledContent = this.applyStyle(srtContent, style, format);
      
      // Save to file with custom or generated filename
      const outputPath = path.join(this.cacheDir, outputFilename);
      await fs.writeFile(outputPath, styledContent, 'utf8');
      
      this.logger.info('Subtitles generated successfully', {
        audioPath,
        language,
        format,
        style,
        outputPath
      });
      
      return {
        id: uuidv4(),
        path: outputPath,
        language,
        format,
        style,
        segments: transcription.segments || [],
        duration: transcription.duration || 0,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error('Subtitle generation failed', { error: error.message, audioPath });
      throw new Error(`Failed to generate subtitles: ${error.message}`);
    }
  }

  async generateMockSubtitles(audioPath, options = {}) {
    const { language = 'en', format = 'srt', style = 'default', outputFilename } = options;

    // Create mock subtitle file path
    const outputPath = path.join(this.cacheDir, outputFilename || `subs_mock_${Date.now()}.${format}`);

    // Generate mock transcription data
    const mockTranscription = this.generateMockTranscription(audioPath);

    // Generate SRT content from mock transcription
    const srtContent = this.generateSRT(mockTranscription);

    // Apply styling
    const styledContent = this.applyStyle(srtContent, style, format);

    // Ensure cache directory exists
    await fs.mkdir(this.cacheDir, { recursive: true });

    // Write mock subtitle file
    await fs.writeFile(outputPath, styledContent, 'utf8');

    this.logger.info('Mock subtitles generated successfully', {
      audioPath,
      language,
      format,
      style,
      outputPath,
      segmentCount: mockTranscription.segments.length
    });

    return {
      id: uuidv4(),
      path: outputPath,
      language,
      format,
      style,
      segments: mockTranscription.segments,
      duration: mockTranscription.duration,
      generatedAt: new Date().toISOString(),
      mock: true
    };
  }

  generateMockTranscription(_audioPath) {
    // Generate realistic mock subtitle segments
    const mockSegments = [
      {
        start: 0,
        end: 3.5,
        text: "Welcome to this video presentation."
      },
      {
        start: 3.5,
        end: 7.2,
        text: "Today we'll be discussing important topics."
      },
      {
        start: 7.2,
        end: 11.8,
        text: "Let's dive right into the main content."
      },
      {
        start: 11.8,
        end: 15.4,
        text: "This is a demonstration of subtitle generation."
      },
      {
        start: 15.4,
        end: 19.1,
        text: "Thank you for watching this video."
      }
    ];

    return {
      segments: mockSegments,
      duration: mockSegments[mockSegments.length - 1].end
    };
  }

  async transcribe(audioPath, language) {
    if (!this.whisperAvailable) {
      throw new Error('Whisper not available. Please ensure Whisper binary and models are installed in tools/whisper/');
    }
    
    try {
      return await this.runWhisper(audioPath, language);
    } catch (error) {
      this.logger.error('Whisper transcription failed', { error: error.message, audioPath, language });
      throw new Error(`Failed to transcribe audio: ${error.message}`);
    }
  }

  async runWhisper(audioPath, language) {
    const modelPath = path.join(this.modelsDir, 'ggml-base.en.bin');
    
    return new Promise((resolve, reject) => {
      const args = [
        '-m', modelPath,
        '-f', audioPath,
        '-l', language === 'en' ? 'en' : 'auto',
        '--output-json'
      ];

      const whisper = spawn(this.whisperPath, args);
      
      let stdout = '';
      let stderr = '';
      
      whisper.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      whisper.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      whisper.on('close', (code) => {
        if (code === 0) {
          try {
            const result = JSON.parse(stdout);
            resolve(result);
          } catch {
            resolve(this.parseWhisperOutput(stdout));
          }
        } else {
          reject(new Error(`Whisper exited with code ${code}: ${stderr}`));
        }
      });

      whisper.on('error', (error) => {
        reject(new Error(`Failed to spawn Whisper: ${error.message}`));
      });
    });
  }

  parseWhisperOutput(output) {
    // Parse Whisper text output into segments
    const lines = output.split('\n').filter(line => line.trim());
    const segments = [];
    
    for (const line of lines) {
      if (line.includes(']')) {
        const match = line.match(/\[(\d+:\d+:\d+\.\d+) --> (\d+:\d+:\d+\.\d+)\]\s*(.+)/);
        if (match) {
          segments.push({
            start: this.timeToSeconds(match[1]),
            end: this.timeToSeconds(match[2]),
            text: match[3].trim()
          });
        }
      }
    }
    
    return {
      segments,
      duration: segments.length > 0 ? segments[segments.length - 1].end : 0
    };
  }

  timeToSeconds(timeStr) {
    const [hours, minutes, seconds] = timeStr.split(':');
    return Number.parseInt(hours) * 3600 + Number.parseInt(minutes) * 60 + Number.parseFloat(seconds);
  }

  generateSRT(transcription) {
    let srtContent = '';
    
    for (const [index, segment] of transcription.segments.entries()) {
      const startTime = this.secondsToSRTTime(segment.start);
      const endTime = this.secondsToSRTTime(segment.end);
      
      srtContent += `${index + 1}\n`;
      srtContent += `${startTime} --> ${endTime}\n`;
      srtContent += `${segment.text}\n\n`;
    }
    
    return srtContent;
  }

  secondsToSRTTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
  }

  applyStyle(srtContent, styleName, format) {
    const styles = {
      'default': { fontSize: 28, color: '#FFFFFF', outline: '#000000' },
      'dramatic': { fontSize: 32, color: '#FF0000', outline: '#000000' },
      'minimal': { fontSize: 24, color: '#FFFFFF', outline: 'none' }
    };
    
    const style = styles[styleName] || styles.default;
    
    switch (format) {
      case 'srt':
        return srtContent;
      case 'ass':
        return this.convertToASS(srtContent, style);
      case 'vtt':
        return this.convertToVTT(srtContent);
      default:
        return srtContent;
    }
  }

  convertToASS(srtContent, style) {
    let assContent = '[Script Info]\n';
    assContent += 'Title: Generated Subtitles\n';
    assContent += 'ScriptType: v4.00+\n\n';
    assContent += '[V4+ Styles]\n';
    assContent += 'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\n';
    assContent += `Style: Default,Arial,${style.fontSize},${style.color},${style.color},${style.outline},${style.outline},0,0,0,0,100,100,0,0,1,2,0,2,10,10,10,1\n\n`;
    assContent += '[Events]\n';
    assContent += 'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n';

    // Parse SRT and convert to ASS format
    const srtBlocks = srtContent.split('\n\n').filter(block => block.trim());
    
    for (const block of srtBlocks) {
      const lines = block.trim().split('\n');
      if (lines.length >= 3) {
        const timeRange = lines[1].replaceAll(',', '.');
        const text = lines.slice(2).join(String.raw`\N`);
        assContent += `Dialogue: 0,${timeRange},Default,,0,0,0,,${text}\n`;
      }
    }

    return assContent;
  }

  convertToVTT(srtContent) {
    let vttContent = 'WEBVTT\n\n';
    vttContent += srtContent.replaceAll(/(\d{2}):(\d{2}):(\d{2}),(\d{3})/g, '$1:$2:$3.$4');
    return vttContent;
  }



  async formatSubtitles(subtitlePath, targetFormat, style = 'default') {
    try {
      const content = await fs.readFile(subtitlePath, 'utf8');
      const styledContent = this.applyStyle(content, style, targetFormat);
      
      const outputPath = path.join(this.cacheDir, `formatted_${Date.now()}.${targetFormat}`);
      await fs.writeFile(outputPath, styledContent, 'utf8');
      
      return {
        id: uuidv4(),
        path: outputPath,
        format: targetFormat,
        style,
        formattedAt: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error('Subtitle formatting failed', { error: error.message, subtitlePath });
      throw new Error(`Failed to format subtitles: ${error.message}`);
    }
  }
}

// Factory function
export const createSubtitleService = ({ logger }) => {
  return new SubtitleService({ logger });
};

// Legacy export
export const subsService = {
  generateSubtitles: async (params) => {
    const service = new SubtitleService({ logger: console });
    return service.generateSubtitles(params.audioPath || '', params);
  },
  formatSubtitles: async (params) => {
    const service = new SubtitleService({ logger: console });
    return service.formatSubtitles(params.subtitlePath, params.format, params.style);
  }
};