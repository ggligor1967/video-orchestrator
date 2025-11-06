import path from 'path';
import fs from 'fs/promises';
import { v4 as uuid } from 'uuid';
import ffmpeg from 'fluent-ffmpeg';
import { ffmpegService } from './ffmpegService.js';
import { paths } from '../config/paths.js';

/**
 * Caption Styling Service
 *
 * Provides advanced subtitle styling with animations, effects, and presets.
 * Supports multiple styles: TikTok Trending, Minimal, Karaoke, Neon, Classic.
 *
 * Features:
 * - Word-by-word animations
 * - Box highlights and backgrounds
 * - Custom fonts and colors
 * - Position control
 * - Shadow and stroke effects
 * - Preview generation
 */
export class CaptionStylingService {
  constructor({ logger }) {
    this.logger = logger;
    this.ffmpegService = ffmpegService;

    // Style presets
    this.presets = {
      'tiktok-trending': {
        id: 'tiktok-trending',
        name: 'TikTok Trending',
        description: 'Bold text with yellow box highlights, perfect for viral content',
        animation: 'word-by-word',
        font: {
          family: 'Montserrat-Bold',
          size: 80,
          color: '#FFFFFF',
          spacing: 0
        },
        background: {
          enabled: true,
          type: 'box',
          color: '#FFD700',
          padding: 20,
          borderRadius: 10
        },
        stroke: {
          enabled: true,
          color: '#000000',
          width: 8
        },
        shadow: {
          enabled: true,
          color: '#00000080',
          offsetX: 4,
          offsetY: 4,
          blur: 10
        },
        position: {
          vertical: 'center',
          horizontal: 'center',
          marginBottom: 0
        },
        timing: {
          fadeIn: 0.1,
          fadeOut: 0.1,
          wordDelay: 0.05
        }
      },

      'minimal': {
        id: 'minimal',
        name: 'Minimal Clean',
        description: 'Simple, elegant captions with subtle animations',
        animation: 'fade-in',
        font: {
          family: 'Arial',
          size: 60,
          color: '#FFFFFF',
          spacing: 0
        },
        background: {
          enabled: false
        },
        stroke: {
          enabled: false
        },
        shadow: {
          enabled: true,
          color: '#00000080',
          offsetX: 2,
          offsetY: 2,
          blur: 8
        },
        position: {
          vertical: 'bottom',
          horizontal: 'center',
          marginBottom: 100
        },
        timing: {
          fadeIn: 0.2,
          fadeOut: 0.2,
          wordDelay: 0
        }
      },

      'karaoke': {
        id: 'karaoke',
        name: 'Karaoke Style',
        description: 'Word-by-word color highlight effect',
        animation: 'word-highlight',
        font: {
          family: 'Arial-Bold',
          size: 70,
          color: '#FFFFFF',
          spacing: 10
        },
        background: {
          enabled: true,
          type: 'underline',
          color: '#FF6B6B',
          padding: 0,
          height: 8
        },
        stroke: {
          enabled: true,
          color: '#000000',
          width: 4
        },
        shadow: {
          enabled: false
        },
        position: {
          vertical: 'center',
          horizontal: 'center',
          marginBottom: 0
        },
        timing: {
          fadeIn: 0.05,
          fadeOut: 0.05,
          wordDelay: 0.1
        },
        highlight: {
          color: '#FF6B6B',
          unhighlightColor: '#FFFFFF80'
        }
      },

      'neon-glow': {
        id: 'neon-glow',
        name: 'Neon Glow',
        description: 'Cyberpunk aesthetic with glowing text',
        animation: 'fade-in',
        font: {
          family: 'Arial-Bold',
          size: 75,
          color: '#00FFFF',
          spacing: 5
        },
        background: {
          enabled: false
        },
        stroke: {
          enabled: true,
          color: '#FF00FF',
          width: 3
        },
        shadow: {
          enabled: true,
          color: '#00FFFF',
          offsetX: 0,
          offsetY: 0,
          blur: 30
        },
        position: {
          vertical: 'top',
          horizontal: 'center',
          marginBottom: 150
        },
        timing: {
          fadeIn: 0.3,
          fadeOut: 0.3,
          wordDelay: 0
        }
      },

      'classic': {
        id: 'classic',
        name: 'Classic Subtitle',
        description: 'Traditional movie-style subtitles',
        animation: 'none',
        font: {
          family: 'Arial',
          size: 50,
          color: '#FFFFFF',
          spacing: 0
        },
        background: {
          enabled: true,
          type: 'box',
          color: '#000000CC',
          padding: 15,
          borderRadius: 5
        },
        stroke: {
          enabled: false
        },
        shadow: {
          enabled: false
        },
        position: {
          vertical: 'bottom',
          horizontal: 'center',
          marginBottom: 80
        },
        timing: {
          fadeIn: 0,
          fadeOut: 0,
          wordDelay: 0
        }
      },

      'bold-impact': {
        id: 'bold-impact',
        name: 'Bold Impact',
        description: 'Extra bold with strong contrast',
        animation: 'zoom-in',
        font: {
          family: 'Impact',
          size: 90,
          color: '#FFFFFF',
          spacing: 0
        },
        background: {
          enabled: false
        },
        stroke: {
          enabled: true,
          color: '#000000',
          width: 12
        },
        shadow: {
          enabled: true,
          color: '#00000080',
          offsetX: 6,
          offsetY: 6,
          blur: 12
        },
        position: {
          vertical: 'center',
          horizontal: 'center',
          marginBottom: 0
        },
        timing: {
          fadeIn: 0.15,
          fadeOut: 0.15,
          wordDelay: 0
        }
      }
    };

    // Cache directory for styled subtitles
    this.cacheDir = path.join(process.cwd(), 'data', 'cache', 'styled-subtitles');
    this.initializeCacheDir();
  }

  async initializeCacheDir() {
    try {
      await fs.mkdir(this.cacheDir, { recursive: true });
      this.logger.info('Caption styling cache directory initialized', {
        cacheDir: this.cacheDir
      });
    } catch (error) {
      this.logger.error('Failed to create caption styling cache directory', {
        error: error.message
      });
    }
  }

  /**
   * Get all available style presets
   */
  getPresets() {
    return Object.values(this.presets).map(preset => ({
      id: preset.id,
      name: preset.name,
      description: preset.description,
      animation: preset.animation,
      preview: `/static/caption-previews/${preset.id}.png` // Will be generated
    }));
  }

  /**
   * Get a specific preset by ID
   */
  getPreset(presetId) {
    const preset = this.presets[presetId];
    if (!preset) {
      throw new Error(`Preset not found: ${presetId}`);
    }
    return preset;
  }

  /**
   * Apply styling to subtitles
   *
   * @param {string} subtitlePath - Path to SRT subtitle file
   * @param {string} videoPath - Path to video file
   * @param {object} options - Styling options
   * @returns {Promise<string>} Path to output video with styled subtitles
   */
  async applyStyle(subtitlePath, videoPath, options = {}) {
    const {
      styleId = 'tiktok-trending',
      outputPath,
      customStyle = null
    } = options;

    this.logger.info('Applying caption style', {
      subtitlePath,
      videoPath,
      styleId
    });

    try {
      // Get style configuration
      const style = customStyle || this.getPreset(styleId);

      // Generate output path if not provided
      const finalOutputPath = outputPath || path.join(
        this.cacheDir,
        `styled-${uuid()}.mp4`
      );

      // Convert SRT to ASS format for advanced styling
      const assPath = await this.convertSrtToAss(subtitlePath, style);

      // Apply subtitles to video using FFmpeg
      await this.renderSubtitles(videoPath, assPath, finalOutputPath, style);

      this.logger.info('Caption style applied successfully', {
        outputPath: finalOutputPath,
        styleId
      });

      return finalOutputPath;

    } catch (error) {
      this.logger.error('Failed to apply caption style', {
        error: error.message,
        styleId
      });
      throw new Error(`Failed to apply caption style: ${error.message}`);
    }
  }

  /**
   * Convert SRT to ASS format with styling
   */
  async convertSrtToAss(srtPath, style) {
    const assPath = srtPath.replace('.srt', '.ass');

    this.logger.info('Converting SRT to ASS with styling', {
      srtPath,
      assPath
    });

    try {
      // Read SRT file
      const srtContent = await fs.readFile(srtPath, 'utf-8');

      // Parse SRT
      const subtitles = this.parseSrt(srtContent);

      // Generate ASS content
      const assContent = this.generateAss(subtitles, style);

      // Write ASS file
      await fs.writeFile(assPath, assContent, 'utf-8');

      return assPath;

    } catch (error) {
      this.logger.error('Failed to convert SRT to ASS', {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Parse SRT subtitle format
   */
  parseSrt(srtContent) {
    const subtitles = [];
    const blocks = srtContent.trim().split(/\n\s*\n/);

    for (const block of blocks) {
      const lines = block.trim().split('\n');
      if (lines.length < 3) continue;

      const timeLine = lines[1];
      const textLines = lines.slice(2);

      const timeMatch = timeLine.match(/(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/);
      if (!timeMatch) continue;

      const startTime = this.srtTimeToSeconds(timeMatch[1]);
      const endTime = this.srtTimeToSeconds(timeMatch[2]);
      const text = textLines.join(' ');

      subtitles.push({ startTime, endTime, text });
    }

    return subtitles;
  }

  /**
   * Convert SRT time format to seconds
   */
  srtTimeToSeconds(timeString) {
    const [time, ms] = timeString.split(',');
    const [hours, minutes, seconds] = time.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds + parseInt(ms) / 1000;
  }

  /**
   * Convert seconds to ASS time format
   */
  secondsToAssTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const centiseconds = Math.floor((seconds % 1) * 100);

    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}`;
  }

  /**
   * Generate ASS subtitle file with styling
   */
  generateAss(subtitles, style) {
    const { font, stroke, shadow, background, position } = style;

    // ASS header
    let ass = `[Script Info]
Title: Styled Subtitles
ScriptType: v4.00+
WrapStyle: 0
PlayResX: 1080
PlayResY: 1920
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,${font.family},${font.size},${this.colorToAss(font.color)},&H00FFFFFF,${this.colorToAss(stroke.enabled ? stroke.color : '#000000')},${background.enabled && background.type === 'box' ? this.colorToAss(background.color) : '&H00000000'},${font.family.includes('Bold') ? '-1' : '0'},0,0,0,100,100,${font.spacing},0,${background.enabled && background.type === 'box' ? '3' : '1'},${stroke.enabled ? stroke.width : 0},${shadow.enabled ? Math.max(shadow.offsetX, shadow.offsetY) : 0},${this.getAlignment(position)},30,30,${position.marginBottom},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

    // Add subtitle events
    for (const subtitle of subtitles) {
      const startTime = this.secondsToAssTime(subtitle.startTime);
      const endTime = this.secondsToAssTime(subtitle.endTime);

      // Apply animations if needed
      let text = subtitle.text;
      if (style.animation === 'word-by-word') {
        text = this.applyWordByWordAnimation(text, style);
      } else if (style.animation === 'fade-in') {
        text = `{\\fad(${style.timing.fadeIn * 1000},${style.timing.fadeOut * 1000})}${text}`;
      } else if (style.animation === 'zoom-in') {
        text = `{\\t(0,${style.timing.fadeIn * 1000},\\fscx120\\fscy120)\\t(${(subtitle.endTime - subtitle.startTime - style.timing.fadeOut) * 1000},${(subtitle.endTime - subtitle.startTime) * 1000},\\fscx100\\fscy100)}${text}`;
      }

      ass += `Dialogue: 0,${startTime},${endTime},Default,,0,0,0,,${text}\n`;
    }

    return ass;
  }

  /**
   * Apply word-by-word animation
   */
  applyWordByWordAnimation(text, style) {
    const words = text.split(' ');
    const delay = style.timing.wordDelay * 1000; // Convert to milliseconds

    return words.map((word, index) => {
      const startDelay = index * delay;
      return `{\\t(${startDelay},${startDelay + 100},\\alpha&H00&)}${word}`;
    }).join(' ');
  }

  /**
   * Convert hex color to ASS format
   */
  colorToAss(hexColor) {
    // Remove # and convert to BGR format with alpha
    const hex = hexColor.replace('#', '');

    if (hex.length === 6) {
      const r = hex.substring(0, 2);
      const g = hex.substring(2, 4);
      const b = hex.substring(4, 6);
      return `&H00${b}${g}${r}&`;
    } else if (hex.length === 8) {
      const r = hex.substring(0, 2);
      const g = hex.substring(2, 4);
      const b = hex.substring(4, 6);
      const a = hex.substring(6, 8);
      return `&H${a}${b}${g}${r}&`;
    }

    return '&H00FFFFFF&'; // Default white
  }

  /**
   * Get ASS alignment number from position
   */
  getAlignment(position) {
    const alignmentMap = {
      'bottom-left': 1,
      'bottom-center': 2,
      'bottom-right': 3,
      'center-left': 4,
      'center': 5,
      'center-right': 6,
      'top-left': 7,
      'top-center': 8,
      'top-right': 9
    };

    const posKey = `${position.vertical}-${position.horizontal}`;
    return alignmentMap[posKey] || 5; // Default to center
  }

  /**
   * Render subtitles to video using FFmpeg
   */
  async renderSubtitles(videoPath, assPath, outputPath, _style) {
    this.logger.info('Rendering styled subtitles to video', {
      videoPath,
      assPath,
      outputPath
    });

    return new Promise((resolve, reject) => {
      try {
        // Normalize path for FFmpeg (use forward slashes and escape colons)
        const normalizedAssPath = assPath.replace(/\\/g, '/').replace(/:/g, '\\:');

        ffmpeg(videoPath)
          .videoFilters([`ass=${normalizedAssPath}`])
          .videoCodec('libx264')
          .audioCodec('copy')
          .outputOptions([
            '-preset medium',
            '-crf 23',
            '-movflags +faststart'
          ])
          .output(outputPath)
          .on('end', () => {
            this.logger.info('Styled subtitles rendered successfully', { outputPath });
            resolve(outputPath);
          })
          .on('error', (err) => {
            this.logger.error('Failed to render subtitles', {
              error: err.message,
              videoPath,
              assPath
            });
            reject(err);
          })
          .run();

      } catch (error) {
        this.logger.error('Failed to render subtitles', {
          error: error.message
        });
        reject(error);
      }
    });
  }

  /**
   * Generate preview thumbnail for a style
   */
  async generatePreview(presetId, sampleText = 'Amazing Story') {
    const preset = this.getPreset(presetId);
    const previewPath = path.join(
      process.cwd(),
      'data',
      'static',
      'caption-previews',
      `${presetId}.png`
    );

    this.logger.info('Generating style preview', {
      presetId,
      previewPath
    });

    // Create preview directory
    await fs.mkdir(path.dirname(previewPath), { recursive: true });

    return new Promise((resolve, reject) => {
      try {
        // Build drawtext filter parameters
        const drawTextParams = [
          `text='${sampleText}'`,
          `fontfile=${paths.fonts.default}`, // Cross-platform system font
          `fontsize=${preset.font.size}`,
          `fontcolor=${preset.font.color}`,
          `x=(w-text_w)/2`,
          `y=(h-text_h)/2`
        ];

        if (preset.stroke.enabled) {
          drawTextParams.push(`borderw=${preset.stroke.width}`);
          drawTextParams.push(`bordercolor=${preset.stroke.color || 'black'}`);
        }

        const drawTextFilter = `drawtext=${drawTextParams.join(':')}`;

        // Generate a simple preview image using FFmpeg
        ffmpeg('color=c=black:s=1080x1920:d=1')
          .inputFormat('lavfi')
          .videoFilters([drawTextFilter])
          .outputOptions(['-frames:v 1'])
          .output(previewPath)
          .on('end', () => {
            this.logger.info('Preview generated successfully', { previewPath, presetId });
            resolve(previewPath);
          })
          .on('error', (err) => {
            this.logger.error('Failed to generate preview', {
              error: err.message,
              presetId
            });
            reject(err);
          })
          .run();

      } catch (error) {
        this.logger.error('Failed to generate preview', {
          error: error.message,
          presetId
        });
        reject(error);
      }
    });
  }

  /**
   * Create custom style
   */
  createCustomStyle(styleConfig) {
    const customStyle = {
      id: `custom-${uuid()}`,
      name: styleConfig.name || 'Custom Style',
      description: styleConfig.description || 'User-defined custom style',
      ...this.presets['minimal'], // Start with minimal as base
      ...styleConfig
    };

    this.logger.info('Created custom style', {
      styleId: customStyle.id,
      styleName: customStyle.name
    });

    return customStyle;
  }

  /**
   * Validate style configuration
   */
  validateStyle(style) {
    const required = ['font', 'position', 'timing'];

    for (const field of required) {
      if (!style[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    return true;
  }
}
