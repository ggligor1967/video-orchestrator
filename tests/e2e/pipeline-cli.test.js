import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createContainer } from '../../apps/orchestrator/src/container/index.js';
import { createApp } from '../../apps/orchestrator/src/app.js';

/**
 * E2E Test Suite: CLI Pipeline Automation
 * 
 * Tests the complete video creation pipeline via API calls (simulating CLI usage)
 * 
 * Flow:
 * 1. Generate script with AI
 * 2. Select/upload background video
 * 3. Generate voice-over with TTS
 * 4. Mix audio tracks
 * 5. Generate subtitles
 * 6. Export final video
 */

describe('Complete Video Pipeline - CLI/API E2E', () => {
  let app;
  let container;
  let baseUrl;
  let server;

  // Test data to track throughout pipeline
  const pipelineState = {
    script: null,
    backgroundId: null,
    voiceId: null,
    audioId: null,
    subtitlesId: null,
    finalVideoId: null,
  };

  beforeAll(async () => {
    container = createContainer();

    // Mock AI service to avoid external API dependencies
    container.override('aiService', {
      async generateScript({ topic, genre }) {
        return {
          script: `This is a test ${genre} story about ${topic}. ` +
                  'It was a dark and stormy night when everything changed. ' +
                  'Nobody expected what would happen next. ' +
                  'The truth was more terrifying than anyone could imagine.',
          hooks: [
            'You won\'t believe what happened next',
            'The truth will shock you'
          ],
          hashtags: ['#scary', '#viral', '#storytelling'],
          metadata: {
            generatedAt: new Date().toISOString(),
            wordCount: 30,
            estimatedDuration: 15
          }
        };
      },
      async calculateViralityScore() {
        return {
          score: 85,
          category: 'high-potential',
          metrics: {
            hookStrength: 90,
            emotionalImpact: 80,
            pacing: 85,
            visualPotential: 90
          },
          recommendations: [
            'Add more suspense',
            'Include a cliffhanger'
          ],
          predictedViews: { min: 50000, max: 500000, expected: 150000 },
          confidence: 'high'
        };
      },
      async generateBackgroundIdeas() {
        return {
          suggestions: [
            'Dark forest at night',
            'Abandoned mansion',
            'Foggy graveyard'
          ]
        };
      }
    });

    // Mock assets service
    container.override('assetsService', {
      async listBackgrounds() {
        return [
          {
            id: 'bg-test-1',
            filename: 'test-background.mp4',
            path: '/data/assets/backgrounds/test-background.mp4',
            duration: 30,
            width: 1920,
            height: 1080,
            uploadedAt: new Date().toISOString()
          }
        ];
      },
      async getBackgroundInfo(id) {
        return {
          id,
          filename: 'test-background.mp4',
          path: '/data/assets/backgrounds/test-background.mp4',
          duration: 30,
          width: 1920,
          height: 1080,
          uploadedAt: new Date().toISOString()
        };
      }
    });

    // Mock TTS service
    container.override('ttsService', {
      async generateSpeech({ text, voice, speed }) {
        return {
          path: 'data/tts/test-voice.wav', // Relative path
          duration: Math.ceil(text.length / 10), // ~10 chars per second
          sampleRate: 22050,
          voice,
          speed: speed || 1.0
        };
      },
      async listAvailableVoices() {
        return [
          { id: 'en_US-lessac-medium', name: 'Lessac (US English)', language: 'en', quality: 'medium' },
          { id: 'en_GB-alan-medium', name: 'Alan (British English)', language: 'en', quality: 'medium' }
        ];
      }
    });

    // Mock audio service
    container.override('audioService', {
      async normalizeAudio({ audioPath }) {
        return {
          outputPath: 'data/cache/audio/normalized-test.wav', // Relative path
          originalPath: audioPath,
          loudness: -16,
          peak: -1.5,
          duration: 20
        };
      },
      async mixAudio({ tracks, options }) {
        return {
          outputPath: 'data/cache/audio/mixed-test.wav', // Relative path
          tracks: tracks.length,
          duration: 30
        };
      }
    });

    // Mock subtitles service
    container.override('subsService', {
      async generateSubtitles({ audioPath, format }) {
        return {
          outputPath: 'data/subs/test-subtitles.srt', // Relative path
          audioPath,
          format: format || 'srt',
          language: 'en',
          wordCount: 50
        };
      }
    });

    // Mock export service
    container.override('exportService', {
      async compileVideo({ videoId, audioId, subtitleId, preset, effects }) {
        return {
          outputPath: 'data/exports/final-video.mp4', // Relative path
          preset: preset || 'tiktok',
          fileSize: 5242880, // 5MB
          duration: 30,
          width: 1080,
          height: 1920
        };
      },
      async getAvailablePresets() {
        return [
          { id: 'tiktok', name: 'TikTok', platform: 'tiktok', width: 1080, height: 1920, fps: 30, bitrate: '8M' },
          { id: 'youtube', name: 'YouTube Shorts', platform: 'youtube', width: 1080, height: 1920, fps: 30, bitrate: '12M' },
          { id: 'instagram', name: 'Instagram Reels', platform: 'instagram', width: 1080, height: 1920, fps: 30, bitrate: '8M' }
        ];
      }
    });

    app = createApp({ container });
    server = app.listen(0);
    const address = server.address();
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  describe('Step 1: Script Generation', () => {
    it('should generate a script with AI', async () => {
      const response = await fetch(`${baseUrl}/ai/script`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: 'haunted mansion',
          genre: 'horror',
          duration: 60,
          style: 'story'
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      
      expect(data.success).toBe(true);
      expect(data.data.script).toBeTruthy();
      expect(data.data.script.length).toBeGreaterThan(50);
      expect(data.data.hooks).toBeInstanceOf(Array);
      expect(data.data.hashtags).toBeInstanceOf(Array);

      // Save script for next steps
      pipelineState.script = data.data.script;
    });

    it('should calculate virality score for script', async () => {
      const response = await fetch(`${baseUrl}/ai/virality-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script: pipelineState.script,
          genre: 'horror',
          duration: 60,
          hasVideo: true,
          hasAudio: true,
          hasSubtitles: true
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.score).toBeGreaterThanOrEqual(0);
      expect(data.data.score).toBeLessThanOrEqual(100);
      expect(data.data.category).toBeTruthy();
      expect(data.data.metrics).toBeTruthy();
    });
  });

  describe('Step 2: Background Selection', () => {
    it('should list available backgrounds', async () => {
      const response = await fetch(`${baseUrl}/assets/backgrounds`);

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);

      if (data.data.length > 0) {
        pipelineState.backgroundId = data.data[0].id;
      }
    });

    it('should get background information', async () => {
      if (!pipelineState.backgroundId) {
        test.skip();
        return;
      }

      const response = await fetch(`${baseUrl}/assets/backgrounds/${pipelineState.backgroundId}/info`);

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.id).toBe(pipelineState.backgroundId);
      expect(data.data.duration).toBeGreaterThan(0);
    });
  });

  describe('Step 3: Voice-over Generation', () => {
    it('should list available TTS voices', async () => {
      const response = await fetch(`${baseUrl}/tts/voices`);

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.voices).toBeTruthy();
      expect(Array.isArray(data.data.voices)).toBe(true);
      expect(data.data.voices.length).toBeGreaterThan(0);
    });

    it('should generate voice-over from script', async () => {
      const response = await fetch(`${baseUrl}/tts/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: pipelineState.script,
          voice: 'en_US-lessac-medium',
          speed: 1.0
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.outputPath).toBeTruthy();
      expect(data.data.duration).toBeGreaterThan(0);

      // Save the output path for later use
      pipelineState.voiceId = data.data.outputPath;
    });
  });

  describe('Step 4: Audio Processing', () => {
    it('should normalize voice-over audio', async () => {
      // Skip if no voice was generated
      if (!pipelineState.voiceId) {
        test.skip();
        return;
      }

      const response = await fetch(`${baseUrl}/audio/normalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputPath: pipelineState.voiceId, // Use inputPath not audioPath
          targetLoudness: -16,
          targetPeak: -1.5
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.outputPath).toBeTruthy();
      expect(data.data.loudness).toBe(-16);

      pipelineState.audioId = data.data.outputPath;
    });

    it('should mix audio tracks with background music', async () => {
      // Skip if no voice was generated
      if (!pipelineState.voiceId) {
        test.skip();
        return;
      }

      const response = await fetch(`${baseUrl}/audio/mix`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tracks: [
            {
              path: pipelineState.voiceId, // Use actual generated path
              volume: 1.0,
              type: 'voice'
            }
          ],
          options: {
            normalize: true
          }
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.outputPath).toBeTruthy();

      pipelineState.audioId = data.data.outputPath;
    });
  });

  describe('Step 5: Subtitle Generation', () => {
    it('should generate subtitles from voice-over', async () => {
      // Skip if no voice was generated
      if (!pipelineState.voiceId) {
        test.skip();
        return;
      }

      const response = await fetch(`${baseUrl}/subs/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioId: pipelineState.audioId || pipelineState.voiceId, // Use audioId
          format: 'srt',
          language: 'en'
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.outputPath).toBeTruthy();
      expect(data.data.format).toBe('srt');

      pipelineState.subtitlesId = data.data.outputPath;
    });
  });

  describe('Step 6: Video Export', () => {
    it('should list available export presets', async () => {
      const response = await fetch(`${baseUrl}/export/presets`);

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);
      expect(data.data.some(p => p.platform === 'tiktok')).toBe(true);
    });

    it('should compile final video with all elements', async () => {
      // Skip if no background was selected
      if (!pipelineState.backgroundId) {
        test.skip();
        return;
      }

      const payload = {
        videoId: pipelineState.backgroundId, // Use videoId instead of backgroundId
        preset: 'tiktok',
        effects: {
          progressBar: true,
          partBadge: 'Part 1',
          watermark: ''
        }
      };

      // Only add optional fields if they exist
      if (pipelineState.audioId) {
        payload.audioId = pipelineState.audioId;
      }
      if (pipelineState.subtitlesId) {
        payload.subtitleId = pipelineState.subtitlesId;
      }

      const response = await fetch(`${baseUrl}/export/compile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.outputPath).toBeTruthy();
      expect(data.data.preset).toBe('tiktok');

      pipelineState.finalVideoId = data.data.outputPath;
    });
  });

  describe('Step 7: Automated Pipeline', () => {
    it('should execute complete pipeline in one API call', async () => {
      const response = await fetch(`${baseUrl}/pipeline/build`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script: pipelineState.script,
          backgroundId: pipelineState.backgroundId || 'bg-test-1',
          voice: 'en_US-lessac-medium',
          preset: 'tiktok',
          includeSubtitles: true,
          effects: {
            progressBar: true,
            partBadge: 'Part 1'
          }
        })
      });

      // Pipeline returns 200 with job info
      expect(response.status).toBe(200);
      const data = await response.json();

      // Pipeline may fail if services are mocked, that's expected
      expect(data.success).toBe(true);
      expect(data.data.jobId).toBeTruthy();

      // If job was created, check status endpoint
      if (data.data.jobId) {
        const statusResponse = await fetch(`${baseUrl}/pipeline/status/${data.data.jobId}`);
        expect(statusResponse.status).toBe(200);

        const statusData = await statusResponse.json();
        expect(statusData.success).toBe(true);
        expect(statusData.data.id).toBe(data.data.jobId);
      }
    });
  });

  describe('Pipeline Validation', () => {
    it('should verify all pipeline steps completed successfully', () => {
      expect(pipelineState.script).toBeTruthy();
      expect(pipelineState.backgroundId).toBeTruthy();
      expect(pipelineState.voiceId).toBeTruthy();
      expect(pipelineState.audioId).toBeTruthy();
      expect(pipelineState.subtitlesId).toBeTruthy();
      expect(pipelineState.finalVideoId).toBeTruthy();
    });

    it('should have created a final video file', () => {
      expect(pipelineState.finalVideoId).toBeTruthy();
      expect(pipelineState.finalVideoId).toContain('final-video');
      expect(pipelineState.finalVideoId).toContain('.mp4');
    });
  });
});
