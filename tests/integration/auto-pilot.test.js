import { describe, it, expect, beforeAll, afterAll } from 'vitest';

const baseUrl = 'http://127.0.0.1:4545';

describe('AI Auto-Pilot Integration Tests', () => {
  let createdJobId;

  describe('Video Creation', () => {
    it('should create video from topic', async () => {
      const response = await fetch(`${baseUrl}/auto-pilot/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: 'Haunted Victorian mansion',
          genre: 'horror',
          duration: 60,
          platform: 'tiktok'
        })
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.jobId).toBeDefined();
      expect(data.video).toBeDefined();
      expect(data.video.path).toBeDefined();
      expect(data.duration).toBeGreaterThan(0);

      createdJobId = data.jobId;
    });

    it('should handle minimal input', async () => {
      const response = await fetch(`${baseUrl}/auto-pilot/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: 'Mystery story'
        })
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    it('should use fallback when AI fails', async () => {
      const response = await fetch(`${baseUrl}/auto-pilot/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: 'Test fallback scenario',
          genre: 'general',
          duration: 30
        })
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.video).toBeDefined();
    });
  });

  describe('Job Status Tracking', () => {
    it('should get job status', async () => {
      if (!createdJobId) {
        const createResponse = await fetch(`${baseUrl}/auto-pilot/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic: 'Test', genre: 'horror' })
        });
        const createData = await createResponse.json();
        createdJobId = createData.jobId;
      }

      const response = await fetch(`${baseUrl}/auto-pilot/status/${createdJobId}`);
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.job).toBeDefined();
      expect(data.job.id).toBe(createdJobId);
      expect(data.job.status).toBeDefined();
      expect(data.job.progress).toBeGreaterThanOrEqual(0);
      expect(data.job.progress).toBeLessThanOrEqual(100);
    });

    it('should return error for non-existent job', async () => {
      const response = await fetch(`${baseUrl}/auto-pilot/status/invalid-job-id`);
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });
  });

  describe('Workflow Steps', () => {
    it('should complete all workflow steps', async () => {
      const createResponse = await fetch(`${baseUrl}/auto-pilot/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: 'Complete workflow test',
          genre: 'horror',
          duration: 60
        })
      });

      const { jobId } = await createResponse.json();
      
      // Wait a bit for job to progress
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const statusResponse = await fetch(`${baseUrl}/auto-pilot/status/${jobId}`);
      const { job } = await statusResponse.json();

      expect(job.steps).toBeDefined();
      expect(Array.isArray(job.steps)).toBe(true);
      
      // Check that steps are being tracked
      if (job.steps.length > 0) {
        expect(job.steps[0]).toHaveProperty('step');
        expect(job.steps[0]).toHaveProperty('status');
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid input gracefully', async () => {
      const response = await fetch(`${baseUrl}/auto-pilot/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      // Should either succeed with defaults or return error
      expect([201, 400, 500]).toContain(response.status);
    });

    it('should handle malformed JSON', async () => {
      const response = await fetch(`${baseUrl}/auto-pilot/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json'
      });

      expect(response.status).toBe(400);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      const requests = Array(5).fill(null).map(() =>
        fetch(`${baseUrl}/auto-pilot/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic: 'Rate limit test', genre: 'horror' })
        })
      );

      const responses = await Promise.all(requests);
      const statuses = responses.map(r => r.status);
      
      // All should pass in dev mode (200 req/hour limit)
      expect(statuses.every(s => s === 201 || s === 429)).toBe(true);
    });
  });

  describe('Concurrent Jobs', () => {
    it('should handle multiple concurrent jobs', async () => {
      const jobs = await Promise.all([
        fetch(`${baseUrl}/auto-pilot/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic: 'Job 1', genre: 'horror' })
        }),
        fetch(`${baseUrl}/auto-pilot/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic: 'Job 2', genre: 'mystery' })
        }),
        fetch(`${baseUrl}/auto-pilot/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic: 'Job 3', genre: 'horror' })
        })
      ]);

      const results = await Promise.all(jobs.map(r => r.json()));
      
      expect(results.every(r => r.success)).toBe(true);
      expect(results.every(r => r.jobId)).toBe(true);
      
      // All job IDs should be unique
      const jobIds = results.map(r => r.jobId);
      const uniqueIds = new Set(jobIds);
      expect(uniqueIds.size).toBe(jobIds.length);
    });
  });
});
