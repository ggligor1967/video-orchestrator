import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger.js';
import { paths } from '../config/paths.js';

const SUBS_DIR = paths.subs;
const WHISPER_PATH = path.join(paths.whisper, 'bin', 'main.exe');
const WHISPER_MODEL = path.join(paths.whisper, 'models', 'ggml-base.en.bin');

export const subsService = {
  async generateSubtitles({ audioId, language, outputFilename }) {
    try {
      // Ensure subs directory exists
      await fs.mkdir(SUBS_DIR, { recursive: true });
      
      const audioPath = await this.getAudioPath(audioId);
      const outputPath = path.join(SUBS_DIR, outputFilename || `subs_${Date.now()}.srt`);
      
      // Validate audio file exists and has content
      const audioStats = await fs.stat(audioPath);
      if (audioStats.size === 0) {
        throw new Error(`Audio file ${audioId} is empty or invalid`);
      }
      
      logger.info('Generating subtitles from audio', {
        audioId,
        audioPath,
        audioSize: audioStats.size,
        language
      });
      
      // Check if Whisper binary exists (mock for now)
      try {
        await fs.access(WHISPER_PATH);
      } catch {
        logger.warn('Whisper binary not found, creating mock subtitles');
        return await this.createMockSubtitles(audioId, outputPath);
      }

      // Generate subtitles using Whisper.cpp
      const srtContent = await this.runWhisper(audioPath, language);
      
      await fs.writeFile(outputPath, srtContent, 'utf8');

      const id = uuidv4();
      
      logger.info('Subtitles generated successfully', {
        id,
        audioId,
        language,
        outputPath
      });

      return {
        id,
        path: outputPath,
        relativePath: `/static/subs/${path.basename(outputPath)}`,
        audioId,
        language,
        format: 'srt',
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error generating subtitles', { error: error.message, audioId });
      throw new Error(`Failed to generate subtitles: ${error.message}`);
    }
  },

  async formatSubtitles({ subtitleId, format, style }) {
    try {
      const inputPath = await this.getSubtitlePath(subtitleId);
      const outputPath = path.join(SUBS_DIR, `formatted_${Date.now()}.${format}`);
      
      const content = await fs.readFile(inputPath, 'utf8');
      let formattedContent;

      switch (format) {
        case 'srt':
          formattedContent = content; // Already SRT
          break;
        case 'vtt':
          formattedContent = this.convertSRTtoVTT(content);
          break;
        case 'ass':
          formattedContent = this.convertSRTtoASS(content, style);
          break;
        default:
          throw new Error(`Unsupported format: ${format}`);
      }

      await fs.writeFile(outputPath, formattedContent, 'utf8');

      const id = uuidv4();
      
      logger.info('Subtitles formatted successfully', {
        id,
        subtitleId,
        format,
        outputPath
      });

      return {
        id,
        path: outputPath,
        relativePath: `/static/subs/${path.basename(outputPath)}`,
        sourceId: subtitleId,
        format,
        style,
        formattedAt: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error formatting subtitles', { error: error.message, subtitleId });
      throw new Error(`Failed to format subtitles: ${error.message}`);
    }
  },

  async runWhisper(audioPath, language) {
    return new Promise((resolve, reject) => {
      const args = [
        '-m', WHISPER_MODEL,
        '-f', audioPath,
        '-l', language === 'en' ? 'en' : 'auto',
        '--output-srt'
      ];

      const whisper = spawn(WHISPER_PATH, args);
      
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
          resolve(stdout);
        } else {
          reject(new Error(`Whisper exited with code ${code}: ${stderr}`));
        }
      });

      whisper.on('error', (error) => {
        reject(new Error(`Failed to spawn Whisper: ${error.message}`));
      });
    });
  },

  convertSRTtoVTT(srtContent) {
    let vttContent = 'WEBVTT\n\n';
    vttContent += srtContent.replace(/(\d{2}):(\d{2}):(\d{2}),(\d{3})/g, '$1:$2:$3.$4');
    return vttContent;
  },

  convertSRTtoASS(srtContent, style = {}) {
    const { fontSize = 24, fontColor = '#FFFFFF', backgroundColor = '#000000' } = style;
    
    let assContent = '[Script Info]\n';
    assContent += 'Title: Generated Subtitles\n';
    assContent += 'ScriptType: v4.00+\n\n';
    assContent += '[V4+ Styles]\n';
    assContent += 'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\n';
    assContent += `Style: Default,Arial,${fontSize},${fontColor},${fontColor},${backgroundColor},${backgroundColor},0,0,0,0,100,100,0,0,1,2,0,2,10,10,10,1\n\n`;
    assContent += '[Events]\n';
    assContent += 'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n';

    // Parse SRT and convert to ASS format
    const srtLines = srtContent.split('\n\n');
    
    srtLines.forEach(block => {
      const lines = block.trim().split('\n');
      if (lines.length >= 3) {
        const timeRange = lines[1].replace(/,/g, '.');
        const text = lines.slice(2).join('\\N');
        assContent += `Dialogue: 0,${timeRange},Default,,0,0,0,,${text}\n`;
      }
    });

    return assContent;
  },

  async createMockSubtitles(audioId, outputPath) {
    const mockSRT = `1
00:00:00,000 --> 00:00:03,000
This is a mock subtitle generated

2
00:00:03,000 --> 00:00:06,000
for audio file ${audioId}

3
00:00:06,000 --> 00:00:10,000
Real subtitles would be generated using Whisper.cpp
`;

    await fs.writeFile(outputPath, mockSRT, 'utf8');
    
    const id = uuidv4();
    
    return {
      id,
      path: outputPath,
      relativePath: `/static/subs/${path.basename(outputPath)}`,
      audioId,
      language: 'en',
      format: 'srt',
      generatedAt: new Date().toISOString(),
      mock: true
    };
  },

  async getAudioPath(audioId) {
    const ttsDir = paths.tts;
    const cacheDir = paths.cache;
    
    // Check TTS directory first
    try {
      const ttsFiles = await fs.readdir(ttsDir);
      const ttsFile = ttsFiles.find(f => f.includes(audioId) || path.parse(f).name === audioId);
      if (ttsFile) {
        return path.join(ttsDir, ttsFile);
      }
    } catch (_error) {
      // Directory might not exist
    }
    
    // Check cache directory
    try {
      const cacheFiles = await fs.readdir(cacheDir);
      const cacheFile = cacheFiles.find(f => f.includes(audioId) || path.parse(f).name === audioId);
      if (cacheFile) {
        return path.join(cacheDir, cacheFile);
      }
    } catch (_error) {
      // Directory might not exist
    }
    
    throw new Error(`Audio with ID ${audioId} not found`);
  },

  async getSubtitlePath(subtitleId) {
    try {
      const subsFiles = await fs.readdir(SUBS_DIR);
      const subsFile = subsFiles.find(f => f.includes(subtitleId) || path.parse(f).name === subtitleId);
      
      if (!subsFile) {
        throw new Error(`Subtitle with ID ${subtitleId} not found`);
      }
      
      return path.join(SUBS_DIR, subsFile);
    } catch (_error) {
      throw new Error(`Subtitle with ID ${subtitleId} not found`);
    }
  }
};