import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import type { AddressInfo } from 'node:net';
import { createContainer } from '../../apps/orchestrator/src/container/index.js';
import { createApp } from '../../apps/orchestrator/src/app.js';
import { setLogger } from '../../apps/orchestrator/src/utils/logger.js';

let baseUrl: string;
let server: ReturnType<ReturnType<typeof createApp>['listen']>;

const quietLogger = {
  info: () => {},
  warn: () => {},
  error: () => {},
  debug: () => {}
} as const;

beforeAll(() => {
  const container = createContainer();

  const baseConfig = container.resolve('config');
  container.override('config', {
    ...baseConfig,
    logging: {
      ...baseConfig.logging,
      enableHttpLogging: false
    }
  });

  container.override('logger', quietLogger);
  setLogger(quietLogger);

  container.override('healthService', {
    getHealthStatus: () => ({
      status: 'healthy',
      services: { ffmpeg: true, piper: true, whisper: true },
      version: 'test-version'
    })
  });

  container.override('aiService', {
    async generateScript() {
      return {
        script: 'It was a dark and stormy night...',
        hooks: ['Hook 1'],
        hashtags: ['#storytime'],
        metadata: { generatedAt: new Date().toISOString() }
      };
    },
    async generateBackgroundIdeas() {
      return { suggestions: [] };
    },
    async calculateViralityScore() {
      return {
        score: 90,
        category: 'viral',
        metrics: {},
        recommendations: [],
        aiEnhanced: false,
        predictedViews: { min: 1, max: 10, expected: 5 },
        confidence: 'medium'
      };
    }
  });

  container.override('assetsService', {
    async listBackgrounds() {
      return [];
    },
    importBackground: async () => {
      throw new Error('Not implemented in tests');
    },
    deleteBackground: async () => {},
    getBackgroundInfo: async () => ({})
  });

  container.override('ttsService', {
    async generateSpeech() {
      return {
        id: 'tts-1',
        path: '/tmp/tts.wav',
        relativePath: '/static/tts.wav',
        voice: 'voice',
        speed: 1,
        textLength: 12,
        generatedAt: new Date().toISOString()
      };
    },
    async listAvailableVoices() {
      return [{ id: 'voice', name: 'Voice', language: 'en', quality: 'medium' }];
    }
  });

  container.override('exportService', {
    async compileVideo() {
      return {
        id: 'final-1',
        path: '/tmp/final.mp4',
        relativePath: '/static/final.mp4',
        preset: {},
        fileSize: 1024,
        duration: 60,
        width: 1080,
        height: 1920,
        hasAudio: true,
        hasSubtitles: false,
        effects: {},
        compiledAt: new Date().toISOString()
      };
    },
    async getAvailablePresets() {
      return [{ id: 'tiktok', name: 'TikTok', platform: 'tiktok' }];
    }
  });

  container.override('pipelineService', {
    async buildCompleteVideo() {
      return { jobId: 'job-1', status: 'started', message: 'Video build pipeline initiated' };
    },
    async getJobStatus() {
      return {
        id: 'job-1',
        stage: 'completed',
        progress: 100,
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        error: null,
        isCompleted: true,
        isFailed: false,
        results: { finalVideo: { id: 'final-1' } }
      };
    }
  });

  const app = createApp({ container });
  server = app.listen(0);
  const address = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${address.port}`;
});

afterAll(async () => {
  if (server) {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  }
});

describe('Orchestrator HTTP API', () => {
  it('returns health metadata', async () => {
    const response = await fetch(`${baseUrl}/health`);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.data).toMatchObject({
      status: 'healthy',
      services: expect.any(Object),
      version: expect.any(String)
    });
  });

  it('returns AI generated script payload', async () => {
    const response = await fetch(`${baseUrl}/ai/script`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: 'urban legend',
        genre: 'horror'
      })
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.script).toContain('dark and stormy');
  });

  it('rejects invalid AI payloads', async () => {
    const response = await fetch(`${baseUrl}/ai/script`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: '',
        genre: 'horror'
      })
    });

    expect(response.status).toBe(400);
  });

  it('lists background assets', async () => {
    const response = await fetch(`${baseUrl}/assets/backgrounds`);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  it('returns 404 for unknown routes', async () => {
    const response = await fetch(`${baseUrl}/missing-route`);
    expect(response.status).toBe(404);
  });
});
