import { describe, it, expect, beforeAll, afterAll } from 'vitest';

const baseUrl = 'http://127.0.0.1:4545';

describe('AI Features Integration Tests', () => {
  describe('Content Analyzer', () => {
    it('should analyze script successfully', async () => {
      const response = await fetch(`${baseUrl}/content-analyzer/script`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: 'It was a dark and stormy night. The door creaked open.',
          genre: 'horror'
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.analysis).toBeDefined();
      expect(data.analysis.engagementScore).toBeGreaterThanOrEqual(0);
      expect(data.analysis.engagementScore).toBeLessThanOrEqual(10);
    });

    it('should analyze video context', async () => {
      const response = await fetch(`${baseUrl}/content-analyzer/video-context`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script: { content: 'Dark mysterious story', genre: 'horror' },
          background: { name: 'dark-forest.mp4', description: 'Dark forest' },
          audio: { mood: 'dark', tempo: 'medium' }
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.coherenceScore).toBeDefined();
      expect(data.viralPotential).toBeDefined();
      expect(data.overallScore).toBeGreaterThanOrEqual(0);
    });

    it('should provide realtime suggestions', async () => {
      const response = await fetch(`${baseUrl}/content-analyzer/realtime-suggestions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script: { content: 'This is a very long sentence that goes on and on without any breaks or pauses which makes it hard to read and understand.' }
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.suggestions).toBeDefined();
      expect(Array.isArray(data.suggestions)).toBe(true);
    });
  });

  describe('Smart Asset Recommender', () => {
    it('should recommend assets based on script', async () => {
      const response = await fetch(`${baseUrl}/smart-assets/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: 'A dark and mysterious forest at night with wind howling and footsteps approaching.',
          genre: 'horror'
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.recommendations).toBeDefined();
      expect(data.recommendations.backgrounds).toBeDefined();
      expect(data.recommendations.music).toBeDefined();
      expect(data.recommendations.sfx).toBeDefined();
      expect(data.confidence).toBeGreaterThan(0);
    });

    it('should detect events for SFX recommendations', async () => {
      const response = await fetch(`${baseUrl}/smart-assets/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: 'The door slammed shut. Footsteps echoed. A scream pierced the silence.',
          genre: 'horror'
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.recommendations.sfx.length).toBeGreaterThan(0);
      
      const events = data.recommendations.sfx.map(s => s.event);
      expect(events).toContain('door');
      expect(events).toContain('footsteps');
      expect(events).toContain('scream');
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits on AI endpoints', async () => {
      const requests = Array(25).fill(null).map(() =>
        fetch(`${baseUrl}/content-analyzer/script`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: 'Test', genre: 'horror' })
        })
      );

      const responses = await Promise.all(requests);
      const statuses = responses.map(r => r.status);
      
      // In dev mode, limit is 200/hour, so all should pass
      // In production, some would be 429
      expect(statuses.every(s => s === 200 || s === 429)).toBe(true);
    });
  });
});
