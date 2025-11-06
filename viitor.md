Propuneri de Implementare - Video Orchestrator

  🔴 PRIORITATE CRITICĂ (Quick Wins - Impact Mare, Efort Mediu)

  1. Stock Media Integration (Pexels/Pixabay)

  Implementare:
  // apps/orchestrator/src/services/stockMediaService.js
  export class StockMediaService {
    constructor({ logger, config }) {
      this.pexelsApiKey = config.PEXELS_API_KEY;
      this.pixabayApiKey = config.PIXABAY_API_KEY;
    }

    async searchVideos(query, options = {}) {
      const { orientation = 'portrait', perPage = 15, page = 1 } = options;

      // Try Pexels first (better quality)
      const pexelsResults = await this.searchPexels(query, { orientation, perPage, page });

      // Fallback to Pixabay if needed
      if (pexelsResults.length < 5) {
        const pixabayResults = await this.searchPixabay(query, options);
        return [...pexelsResults, ...pixabayResults];
      }

      return pexelsResults;
    }

    async downloadAndCache(videoUrl, videoId) {
      const cachePath = `data/cache/stock/${videoId}.mp4`;
      // Download, cache locally for reuse
      return cachePath;
    }
  }

  Endpoints noi:
  - GET /stock/search?q=haunted+house&type=video - Search stock media
  - POST /stock/download - Download și cache video
  - GET /stock/suggestions - AI-powered suggestions based on script

  Integrare UI:
  - Tab nou "Stock Media" între Background și Voice-over
  - AI sugerează automat 5-10 video-uri based on script keywords

  Efort: 2-3 zile
  Impact: Foarte mare - elimină bariera de intrare (lipsa media proprie)

  ---
  2. Caption Styling Engine

  Implementare:
  // apps/orchestrator/src/services/captionStylingService.js
  export class CaptionStylingService {
    presets = {
      'tiktok-trending': {
        animation: 'word-by-word',
        font: 'Montserrat Bold',
        fontSize: 80,
        color: '#FFFFFF',
        strokeColor: '#000000',
        strokeWidth: 8,
        position: 'center',
        highlight: { type: 'box', color: '#FFD700' }
      },
      'minimal': {
        animation: 'fade-in',
        font: 'Helvetica Neue',
        fontSize: 60,
        color: '#FFFFFF',
        position: 'bottom',
        shadow: { blur: 10, color: '#00000080' }
      },
      'karaoke': {
        animation: 'word-highlight',
        highlightColor: '#FF6B6B',
        unhighlightColor: '#FFFFFF80'
      }
    };

    async applyStyle(subtitlePath, styleName, outputPath) {
      const style = this.presets[styleName];
      // Use FFmpeg with drawtext filters for styling
      return this.renderWithFFmpeg(subtitlePath, style, outputPath);
    }

    async renderWithFFmpeg(subtitlePath, style, outputPath) {
      // Complex FFmpeg command for animated, styled captions
      const filters = this.buildFFmpegFilters(style);
      // Execute FFmpeg with ASS/SSA subtitle format for full styling
    }
  }

  UI Enhancement:
  - Subtitles tab: Gallery de preview pentru caption styles
  - Live preview cu sample text
  - Custom style builder (font, color, animation picker)

  Efort: 3-4 zile
  Impact: Mare - diferențiator major vs competiție

  ---
  3. Template System (High-Value Feature)

  Implementare:
  // packages/shared/src/types.ts
  export interface VideoTemplate {
    id: string;
    name: string;
    category: 'tiktok' | 'youtube-shorts' | 'reels';
    thumbnail: string;
    config: {
      genre: string;
      duration: number;
      captionStyle: string;
      musicTrack?: string;
      voiceProfile: string;
      exportPreset: string;
    };
    pipeline: {
      enableAutoReframe: boolean;
      cropSettings: object;
      colorGrading?: string;
    };
  }

  // apps/orchestrator/src/services/templateService.js
  export class TemplateService {
    builtInTemplates = [
      {
        id: 'horror-hook',
        name: 'Horror Story with Hook',
        category: 'tiktok',
        config: {
          genre: 'horror',
          duration: 60,
          captionStyle: 'tiktok-trending',
          voiceProfile: 'en_US-hfc_male-medium', // Creepy voice
          exportPreset: 'tiktok'
        }
      },
      // More templates...
    ];

    async applyTemplate(templateId, customizations) {
      const template = this.getTemplate(templateId);
      return { ...template.config, ...customizations };
    }

    async saveUserTemplate(userId, templateData) {
      // Save custom templates to data/templates/
    }
  }

  UI Flow:
  1. Welcome screen: "Start from Template" vs "Blank Project"
  2. Template gallery cu preview
  3. Customization screen (topic + tweaks)
  4. One-click generate

  Efort: 4-5 zile
  Impact: Foarte mare - simplifică onboarding și accelerează producția

  ---
  🟡 PRIORITATE MARE (Should-Have)

  4. Brand Kit System

  Implementare:
  // apps/orchestrator/src/services/brandKitService.js
  export class BrandKitService {
    async createBrandKit(data) {
      return {
        id: uuid(),
        name: data.name,
        colors: {
          primary: data.primaryColor,
          secondary: data.secondaryColor,
          accent: data.accentColor
        },
        fonts: {
          heading: data.headingFont,
          body: data.bodyFont
        },
        logo: data.logoPath, // Upload la data/assets/logos/
        watermark: {
          enabled: data.watermarkEnabled,
          position: data.watermarkPosition,
          opacity: data.watermarkOpacity
        },
        captionDefaults: {
          style: data.defaultCaptionStyle
        }
      };
    }

    async applyBrandKit(brandKitId, videoConfig) {
      const kit = await this.getBrandKit(brandKitId);
      return {
        ...videoConfig,
        captionStyle: { ...videoConfig.captionStyle, ...kit.fonts, ...kit.colors },
        watermark: kit.watermark,
        logo: kit.logo
      };
    }
  }

  UI:
  - Settings → Brand Kits
  - Create/Edit brand kit interface
  - Apply brand kit selector în project creation

  Efort: 3 zile
  Impact: Mare pentru utilizatori recurenți și business

  ---
  5. Music Library Integration

  Implementare:
  // apps/orchestrator/src/services/musicLibraryService.js
  export class MusicLibraryService {
    async searchMusic(query, options = {}) {
      const { mood, genre, duration, bpm } = options;

      // Free tier: Pixabay Music API
      const results = await this.searchPixabayMusic(query, { mood, genre });

      // Premium tier: Epidemic Sound API (requires subscription)
      // const premiumResults = await this.searchEpidemicSound(query);

      return results.map(track => ({
        id: track.id,
        title: track.title,
        artist: track.artist,
        duration: track.duration,
        previewUrl: track.previewUrl,
        downloadUrl: track.downloadUrl,
        mood: track.tags,
        license: 'royalty-free'
      }));
    }

    async suggestMusicForScript(script, genre) {
      // AI-powered music suggestion based on script mood
      const mood = await this.analyzeMood(script, genre);
      return this.searchMusic('', { mood, duration: script.estimatedDuration });
    }
  }

  Endpoints:
  - GET /music/search?mood=suspenseful&duration=60
  - GET /music/suggest - AI suggestions
  - POST /music/download - Cache track locally

  UI:
  - Audio & SFX tab: Music library browser
  - Preview player
  - Auto-duck music under voice (FFmpeg audio filters)

  Efort: 3-4 zile
  Impact: Mare - îmbunătățește dramatic calitatea output-ului

  ---
  6. Advanced Voice Options (Multi-Voice + Voice Cloning)

  Implementare:
  // apps/orchestrator/src/services/ttsService.js (Enhancement)
  export class EnhancedTTSService extends TTSService {
    async getAvailableVoices() {
      // Extend existing Piper voices
      const piperVoices = await this.listPiperVoices();

      // Add cloud voices (premium feature)
      const cloudVoices = [
        { id: 'elevenlabs-adam', name: 'Adam (ElevenLabs)', quality: 'premium' },
        { id: 'elevenlabs-rachel', name: 'Rachel (ElevenLabs)', quality: 'premium' }
      ];

      return { local: piperVoices, cloud: cloudVoices };
    }

    async cloneVoice(audioSamplePath, voiceName) {
      // Integration with ElevenLabs Voice Cloning API
      const voiceId = await this.elevenLabsAPI.cloneVoice({
        name: voiceName,
        files: [audioSamplePath]
      });

      return { voiceId, name: voiceName, type: 'cloned' };
    }

    async generateWithEmotions(text, voice, emotions = {}) {
      // Add emotion tags for supported TTS engines
      const styledText = this.applyEmotionTags(text, emotions);
      return this.generate(styledText, voice);
    }
  }

  UI Enhancements:
  - Voice-over tab: Voice gallery cu preview samples
  - Upload audio sample pentru voice cloning (premium)
  - Emotion slider: happy/sad/angry/neutral (pentru compatible voices)

  Efort: 4-5 zile (2 zile local, 3 zile cloud integration)
  Impact: Mare - voice quality este crucial pentru engagement

  ---
  🟢 PRIORITATE MEDIE (Nice-to-Have)

  7. Transcript-Based Editing (Descript-style)

  Implementare:
  // apps/orchestrator/src/services/transcriptEditService.js
  export class TranscriptEditService {
    async generateTranscriptWithTimestamps(audioPath) {
      // Use Whisper to generate word-level timestamps
      const result = await whisperService.transcribe(audioPath, {
        wordTimestamps: true,
        output: 'json'
      });

      return result.words.map(word => ({
        word: word.text,
        start: word.start,
        end: word.end,
        confidence: word.probability
      }));
    }

    async applyTranscriptEdits(edits, audioPath, videoPath) {
      // edits = [{ action: 'delete', startTime: 5.2, endTime: 7.8 }]
      const ffmpegCommands = this.generateCutCommands(edits);

      // Cut audio segments
      const editedAudio = await this.cutAudio(audioPath, ffmpegCommands);

      // Sync video cuts if provided
      if (videoPath) {
        const editedVideo = await this.cutVideo(videoPath, ffmpegCommands);
        return { audio: editedAudio, video: editedVideo };
      }

      return { audio: editedAudio };
    }
  }

  UI:
  - New tab: "Edit Transcript" (după generation)
  - Text editor cu highlighting
  - Delete/cut words direct în text
  - Real-time preview

  Efort: 5-7 zile
  Impact: Foarte mare - game-changer pentru editare rapidă

  ---
  8. AI B-Roll Generation

  Implementare:
  // apps/orchestrator/src/services/brollService.js
  export class BRollService {
    async generateBRoll(script, scenes) {
      const brollSuggestions = [];

      for (const scene of scenes) {
        // Option 1: Search stock media
        const stockVideos = await stockMediaService.searchVideos(scene.keywords);

        // Option 2: Generate with AI (future: Runway ML, Stable Video Diffusion)
        // const generatedVideo = await this.generateAIVideo(scene.description);

        brollSuggestions.push({
          sceneId: scene.id,
          timestamp: scene.timestamp,
          suggestions: stockVideos,
          type: 'stock'
        });
      }

      return brollSuggestions;
    }

    async insertBRoll(videoPath, brollClips) {
      // Overlay B-roll clips with picture-in-picture or cuts
      const ffmpegFilter = this.buildOverlayFilter(brollClips);
      return ffmpegService.applyFilter(videoPath, ffmpegFilter);
    }
  }

  UI:
  - Background tab: "Add B-Roll" button
  - Timeline view cu B-roll suggestions
  - Drag-and-drop pentru plasare

  Efort: 5-6 zile
  Impact: Mare - adds production value

  ---
  9. Social Media Auto-Publish

  Implementare:
  // apps/orchestrator/src/services/socialPublishService.js
  export class SocialPublishService {
    async publishToTikTok(videoPath, metadata) {
      // TikTok API integration
      const upload = await tiktokAPI.uploadVideo({
        video: fs.createReadStream(videoPath),
        caption: metadata.caption,
        privacy: metadata.privacy,
        duet: metadata.allowDuet,
        stitch: metadata.allowStitch
      });

      return { platform: 'tiktok', postId: upload.id, url: upload.shareUrl };
    }

    async publishToYouTube(videoPath, metadata) {
      // YouTube Shorts API
      const upload = await youtubeAPI.videos.insert({
        part: 'snippet,status',
        requestBody: {
          snippet: {
            title: metadata.title,
            description: metadata.description,
            tags: metadata.tags,
            categoryId: '24' // Entertainment
          },
          status: {
            privacyStatus: metadata.privacy,
            selfDeclaredMadeForKids: false
          }
        },
        media: {
          body: fs.createReadStream(videoPath)
        }
      });

      return { platform: 'youtube', videoId: upload.data.id };
    }
  }

  Authentication Flow:
  - OAuth2 pentru TikTok, YouTube, Instagram
  - Store tokens securely în app config

  UI:
  - Export tab: "Publish Directly" section
  - Platform selector (checkboxes)
  - Caption/title/tags editor
  - Scheduling option (integrate with existing scheduler)

  Efort: 6-8 zile (complex din cauza OAuth și API differences)
  Impact: Mare - saves user time, increases adoption

  ---
  10. Project Templates & Presets

  Implementare:
  // apps/orchestrator/src/services/projectService.js
  export class ProjectService {
    async saveAsTemplate(projectId, templateName) {
      const project = await this.getProject(projectId);

      const template = {
        id: uuid(),
        name: templateName,
        createdAt: new Date(),
        config: {
          genre: project.genre,
          duration: project.duration,
          captionStyle: project.captionStyle,
          voiceProfile: project.voiceProfile,
          musicTrack: project.musicTrack,
          exportPreset: project.exportPreset
        },
        // Exclude actual content, keep only config
        thumbnail: project.thumbnail
      };

      await fs.writeFile(
        `data/templates/user/${template.id}.json`,
        JSON.stringify(template, null, 2)
      );

      return template;
    }

    async loadTemplate(templateId) {
      const templatePath = `data/templates/${templateId}.json`;
      return JSON.parse(await fs.readFile(templatePath));
    }
  }

  UI:
  - New Project: "My Templates" section
  - Save current project as template (toolbar button)
  - Template manager în Settings

  Efort: 2-3 zile
  Impact: Mediu - convenience feature pentru power users

  ---
  📊 Roadmap Recomandat

  Phase 1 - Quick Wins (2-3 săptămâni)

  1. ✅ Stock Media Integration (Pexels/Pixabay)
  2. ✅ Caption Styling Engine
  3. ✅ Template System
  4. ✅ Music Library Integration

  Justificare: Aceste 4 features elimină cele mai mari pain points și diferențiază produsul.

  Phase 2 - Polish (2 săptămâni)

  5. ✅ Brand Kit System
  6. ✅ Advanced Voice Options
  7. ✅ Project Templates

  Justificare: Îmbunătățesc UX pentru utilizatori recurenți.

  Phase 3 - Advanced (3-4 săptămâni)

  8. ✅ Transcript-Based Editing
  9. ✅ AI B-Roll Generation
  10. ✅ Social Media Auto-Publish

  Justificare: Features complexe care aduc aplicația la nivelul enterprise tools.

  ---
  🛠️ Aspecte Tehnice Comune

  Arhitectura Serviciilor

  // Dependency injection pattern (deja implementat)
  export const createContainer = ({ config, logger }) => ({
    // Existing services...
    stockMediaService: new StockMediaService({ logger, config }),
    captionStylingService: new CaptionStylingService({ logger, ffmpegService }),
    templateService: new TemplateService({ logger }),
    musicLibraryService: new MusicLibraryService({ logger, config }),
    brandKitService: new BrandKitService({ logger }),
    brollService: new BRollService({ logger, stockMediaService }),
    socialPublishService: new SocialPublishService({ logger, config })
  });

  Database Consideration

  Pentru features complexe (Brand Kits, Templates, User Preferences):
  - Opțiune 1: SQLite local (lightweight, portabil)
  - Opțiune 2: JSON files în data/ (current approach, ok pentru desktop)

  API Rate Limiting

  Toate serviciile externe trebuie să implementeze:
  class RateLimiter {
    constructor(maxRequests, windowMs) {
      this.maxRequests = maxRequests;
      this.windowMs = windowMs;
      this.requests = [];
    }

    async throttle() {
      // Implement sliding window rate limiting
    }
  }

  Error Handling

  Toate serviciile noi trebuie să urmeze pattern-ul existent cu errorResponse.js și să logheze consistent cu Winston.
