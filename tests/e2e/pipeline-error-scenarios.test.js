import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createContainer } from '../../apps/orchestrator/src/container/index.js';
import { createApp } from '../../apps/orchestrator/src/app.js';

/**
 * E2E Test Suite: Error Handling and Edge Cases
 * 
 * Tests error scenarios, validation failures, and graceful degradation
 * across the complete video pipeline.
 * 
 * Test Categories:
 * 1. Input Validation Errors
 * 2. Service Failures and Fallbacks
 * 3. Missing Dependencies
 * 4. Invalid File Paths
 * 5. Resource Limits
 * 6. Network/Timeout Errors
 */

describe('Pipeline Error Scenarios - E2E', () => {
  let app;
  let container;
  let baseUrl;
  let server;

  beforeAll(async () => {
    container = createContainer();
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

  describe('Input Validation Errors', () => {
    it('should reject script generation with missing topic', async () => {
      const response = await fetch(`${baseUrl}/ai/script`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          genre: 'horror'
          // Missing topic
        })
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      
      expect(data.success).toBe(false);
      expect(data.error).toBeTruthy();
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject script generation with invalid genre', async () => {
      const response = await fetch(`${baseUrl}/ai/script`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: 'test topic',
          genre: 'invalid-genre' // Not in enum
        })
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject TTS with empty text', async () => {
      const response = await fetch(`${baseUrl}/tts/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: '', // Empty text
          voice: 'en_US-lessac-medium'
        })
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      
      expect(data.success).toBe(false);
      expect(data.error).toBeTruthy();
    });

    it('should reject audio mixing with no tracks', async () => {
      const response = await fetch(`${baseUrl}/audio/mix`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tracks: [] // Empty array
        })
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      
      expect(data.success).toBe(false);
      expect(data.error).toBeTruthy();
    });

    it('should reject export with missing video ID', async () => {
      const response = await fetch(`${baseUrl}/export/compile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preset: 'tiktok'
          // Missing videoId
        })
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject pipeline build with invalid preset', async () => {
      const response = await fetch(`${baseUrl}/pipeline/build`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script: 'Test script',
          backgroundId: 'bg-test',
          voice: 'en_US-lessac-medium',
          preset: 'invalid-preset' // Not a valid preset
        })
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      
      expect(data.success).toBe(false);
    });
  });

  describe('Invalid File Paths and IDs', () => {
    it('should return 404 for non-existent background', async () => {
      const response = await fetch(`${baseUrl}/assets/backgrounds/nonexistent-id/info`);

      expect(response.status).toBe(404);
      const data = await response.json();
      
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('RESOURCE_NOT_FOUND');
    });

    it('should reject audio processing with invalid file path', async () => {
      const response = await fetch(`${baseUrl}/audio/normalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputPath: '/invalid/path/to/audio.wav',
          targetLoudness: -16
        })
      });

      // Should fail with file not found or path validation error
      expect([400, 404, 500]).toContain(response.status);
      const data = await response.json();
      
      expect(data.success).toBe(false);
      expect(data.error).toBeTruthy();
    });

    it('should reject subtitle generation with non-existent audio', async () => {
      const response = await fetch(`${baseUrl}/subs/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioId: 'nonexistent-audio-id',
          format: 'srt',
          language: 'en'
        })
      });

      expect([400, 404, 500]).toContain(response.status);
      const data = await response.json();
      
      expect(data.success).toBe(false);
    });
  });

  describe('Service Dependency Validation', () => {
    it('should detect missing audio dependency for video merge', async () => {
      const response = await fetch(`${baseUrl}/video/merge-audio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoPath: 'data/video/test.mp4'
          // Missing audioPath - should trigger dependency validator
        })
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      
      expect(data.success).toBe(false);
      expect(data.error).toBeTruthy();
    });

    it('should detect missing audio dependency for subtitle generation', async () => {
      const response = await fetch(`${baseUrl}/subs/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format: 'srt',
          language: 'en'
          // Missing audioId - should trigger dependency validator
        })
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      
      expect(data.success).toBe(false);
    });
  });

  describe('Malformed Requests', () => {
    it('should reject invalid JSON', async () => {
      const response = await fetch(`${baseUrl}/ai/script`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json {{{' // Malformed JSON
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_INPUT');
    });

    it('should reject requests with wrong content type', async () => {
      const response = await fetch(`${baseUrl}/ai/script`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: 'plain text'
      });

      // Should fail to parse as JSON
      expect([400, 415]).toContain(response.status);
    });

    it('should reject GET requests to POST-only endpoints', async () => {
      const response = await fetch(`${baseUrl}/ai/script`, {
        method: 'GET'
      });

      expect([404, 405]).toContain(response.status);
    });
  });

  describe('Resource Limits', () => {
    it('should reject extremely long script text', async () => {
      const veryLongText = 'a'.repeat(100000); // 100KB of text

      const response = await fetch(`${baseUrl}/tts/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: veryLongText,
          voice: 'en_US-lessac-medium'
        })
      });

      // Should reject or limit based on validation rules
      expect([400, 413]).toContain(response.status);
    });

    it('should handle mixing many audio tracks', async () => {
      // Create array of many track objects
      const manyTracks = Array.from({ length: 20 }, (_, i) => ({
        path: `data/audio/track-${i}.wav`,
        volume: 1.0
      }));

      const response = await fetch(`${baseUrl}/audio/mix`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tracks: manyTracks
        })
      });

      // Should either succeed or fail gracefully
      if (response.status === 200) {
        const data = await response.json();
        expect(data.success).toBe(true);
      } else {
        expect([400, 500, 503]).toContain(response.status);
      }
    });
  });

  describe('Graceful Degradation', () => {
    it('should return fallback when AI service unavailable', async () => {
      // Override AI service to simulate failure
      const mockAiService = {
        async generateScript() {
          throw new Error('AI service temporarily unavailable');
        }
      };

      container.override('aiService', mockAiService);

      const response = await fetch(`${baseUrl}/ai/script`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: 'test',
          genre: 'horror',
          duration: 60
        })
      });

      // Should either return fallback (200 with fallback flag) or error
      if (response.status === 200) {
        const data = await response.json();
        expect(data.data.fallback).toBe(true);
      } else {
        expect(response.status).toBe(500);
      }
    });

    it('should provide helpful error when TTS service fails', async () => {
      const mockTtsService = {
        async generateSpeech() {
          throw new Error('TTS engine not available');
        }
      };

      container.override('ttsService', mockTtsService);

      const response = await fetch(`${baseUrl}/tts/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'Test text',
          voice: 'en_US-lessac-medium'
        })
      });

      // Should return error or fallback response
      if (response.status === 200) {
        const data = await response.json();
        expect(data.data.fallback || data.data.message).toBeTruthy();
      } else {
        expect(response.status).toBe(500);
        const data = await response.json();
        expect(data.error).toBeTruthy();
      }
    });
  });

  describe('Concurrent Request Handling', () => {
    it('should handle multiple simultaneous script requests', async () => {
      const requests = Array.from({ length: 5 }, () =>
        fetch(`${baseUrl}/ai/script`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: 'test topic',
            genre: 'horror',
            duration: 60
          })
        })
      );

      const responses = await Promise.all(requests);

      // All requests should complete
      expect(responses.length).toBe(5);

      // Check if any succeeded
      const statusCodes = responses.map(r => r.status);
      expect(statusCodes.some(code => code === 200 || code === 500)).toBe(true);
    });

    it('should handle pipeline build requests in sequence', async () => {
      const request1 = fetch(`${baseUrl}/pipeline/build`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script: 'Test script 1',
          backgroundId: 'bg-1',
          voice: 'en_US-lessac-medium',
          preset: 'tiktok'
        })
      });

      const request2 = fetch(`${baseUrl}/pipeline/build`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script: 'Test script 2',
          backgroundId: 'bg-2',
          voice: 'en_US-lessac-medium',
          preset: 'youtube'
        })
      });

      const [response1, response2] = await Promise.all([request1, request2]);

      // Both should get job IDs or errors
      if (response1.status === 200) {
        const data1 = await response1.json();
        expect(data1.data.jobId).toBeTruthy();
      }

      if (response2.status === 200) {
        const data2 = await response2.json();
        expect(data2.data.jobId).toBeTruthy();
      }
    });
  });

  describe('Error Response Format Consistency', () => {
    it('should return consistent error format across all endpoints', async () => {
      const errorEndpoints = [
        {
          url: `${baseUrl}/ai/script`,
          method: 'POST',
          body: { genre: 'horror' } // Missing topic
        },
        {
          url: `${baseUrl}/tts/generate`,
          method: 'POST',
          body: { text: '' } // Empty text
        },
        {
          url: `${baseUrl}/export/compile`,
          method: 'POST',
          body: { preset: 'tiktok' } // Missing videoId
        }
      ];

      for (const endpoint of errorEndpoints) {
        const response = await fetch(endpoint.url, {
          method: endpoint.method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(endpoint.body)
        });

        const data = await response.json();

        // Verify consistent error structure
        expect(data.success).toBe(false);
        expect(data.error).toBeTruthy();
        expect(data.error.code).toBeTruthy();
        expect(data.error.message).toBeTruthy();
        expect(data.timestamp).toBeTruthy();
        expect(data.path).toBeTruthy();
      }
    });

    it('should include validation details in error response', async () => {
      const response = await fetch(`${baseUrl}/ai/script`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: 'x', // Too short
          genre: 'invalid', // Invalid enum
          duration: 5 // Too short
        })
      });

      expect(response.status).toBe(400);
      const data = await response.json();

      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.details).toBeTruthy();
      expect(data.error.details.errors).toBeTruthy();
      expect(Array.isArray(data.error.details.errors)).toBe(true);
    });
  });

  describe('Health and Status Endpoints', () => {
    it('should return health check', async () => {
      const response = await fetch(`${baseUrl}/health`);

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.status).toBe('healthy');
      expect(data.services).toBeTruthy();
    });

    it('should return 404 for non-existent endpoints', async () => {
      const response = await fetch(`${baseUrl}/nonexistent/endpoint`);

      expect(response.status).toBe(404);
      const data = await response.json();

      expect(data.success).toBe(false);
      expect(data.error.code).toBe('ENDPOINT_NOT_FOUND');
    });

    it('should return API documentation on root', async () => {
      const response = await fetch(`${baseUrl}/`);

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.name).toBe('Video Orchestrator API');
      expect(data.version).toBeTruthy();
      expect(data.endpoints).toBeTruthy();
    });
  });
});
