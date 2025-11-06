import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { createContainer } from '../../src/container/index.js';

// Integration tests for pagination functionality across all endpoints
describe('Pagination Integration Tests', () => {
  let app;
  let container;

  beforeAll(async () => {
    container = createContainer();
    app = createApp({ container });
  });

  afterAll(async () => {
    // Cleanup if needed
  });

  describe('GET /assets/backgrounds - Pagination', () => {
    it('should return paginated results with query params', async () => {
      const response = await request(app)
        .get('/assets/backgrounds')
        .query({ page: 1, limit: 5 });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        data: expect.any(Array),
        pagination: {
          page: 1,
          limit: 5,
          total: expect.any(Number),
          totalPages: expect.any(Number),
          hasMore: expect.any(Boolean),
          itemsOnPage: expect.any(Number),
          firstItem: expect.any(Number),
          lastItem: expect.any(Number)
        }
      });

      // Validate pagination logic
      const { pagination, data } = response.body;
      expect(pagination.itemsOnPage).toBe(data.length);
      expect(pagination.totalPages).toBe(Math.ceil(pagination.total / pagination.limit));
      expect(pagination.hasMore).toBe(pagination.page < pagination.totalPages);
    });

    it('should return all results without pagination params', async () => {
      const response = await request(app)
        .get('/assets/backgrounds');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        data: expect.any(Array)
      });

      // Should NOT have pagination object
      expect(response.body.pagination).toBeUndefined();
    });

    it('should handle page 2 correctly', async () => {
      const response = await request(app)
        .get('/assets/backgrounds')
        .query({ page: 2, limit: 5 });

      expect(response.status).toBe(200);
      expect(response.body.pagination.page).toBe(2);
      expect(response.body.pagination.firstItem).toBe(6);
    });

    it('should enforce maximum limit', async () => {
      const response = await request(app)
        .get('/assets/backgrounds')
        .query({ limit: 500 });

      expect(response.status).toBe(200);
      expect(response.body.pagination.limit).toBeLessThanOrEqual(100);
    });

    it('should enforce minimum limit', async () => {
      const response = await request(app)
        .get('/assets/backgrounds')
        .query({ limit: 0 });

      expect(response.status).toBe(200);
      expect(response.body.pagination.limit).toBeGreaterThanOrEqual(1);
    });

    it('should handle invalid page gracefully', async () => {
      const response = await request(app)
        .get('/assets/backgrounds')
        .query({ page: 'invalid' });

      expect(response.status).toBe(200);
      expect(response.body.pagination.page).toBe(1);
    });
  });

  describe('GET /batch - Pagination', () => {
    it('should return paginated batch jobs', async () => {
      const response = await request(app)
        .get('/batch')
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        data: expect.any(Array),
        pagination: {
          page: 1,
          limit: 10,
          total: expect.any(Number),
          totalPages: expect.any(Number),
          hasMore: expect.any(Boolean),
          itemsOnPage: expect.any(Number),
          firstItem: expect.any(Number),
          lastItem: expect.any(Number)
        }
      });
    });

    it('should return all batch jobs without pagination', async () => {
      const response = await request(app)
        .get('/batch');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        data: {
          batches: expect.any(Array),
          total: expect.any(Number)
        }
      });

      // Should NOT have pagination object
      expect(response.body.pagination).toBeUndefined();
    });

    it('should calculate correct offsets for batch jobs', async () => {
      const page1Response = await request(app)
        .get('/batch')
        .query({ page: 1, limit: 3 });

      const page2Response = await request(app)
        .get('/batch')
        .query({ page: 2, limit: 3 });

      expect(page1Response.status).toBe(200);
      expect(page2Response.status).toBe(200);

      expect(page1Response.body.pagination.page).toBe(1);
      expect(page2Response.body.pagination.page).toBe(2);
      
      // Only test offset calculation if there are enough items
      const total = page1Response.body.pagination.total;
      if (total >= 4) {
        expect(page2Response.body.pagination.firstItem).toBe(4);
      } else {
        // With no data, firstItem should be 0
        expect(page2Response.body.pagination.firstItem).toBe(0);
      }
    });
  });

  describe('GET /scheduler - Pagination', () => {
    it('should return paginated scheduled posts', async () => {
      const response = await request(app)
        .get('/scheduler')
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        data: expect.any(Array),
        pagination: {
          page: 1,
          limit: 10,
          total: expect.any(Number),
          totalPages: expect.any(Number),
          hasMore: expect.any(Boolean),
          itemsOnPage: expect.any(Number),
          firstItem: expect.any(Number),
          lastItem: expect.any(Number)
        }
      });
    });

    it('should return all scheduled posts without pagination', async () => {
      const response = await request(app)
        .get('/scheduler');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        data: {
          posts: expect.any(Array),
          total: expect.any(Number)
        }
      });

      // Should NOT have pagination object
      expect(response.body.pagination).toBeUndefined();
    });

    it('should support pagination with filtering', async () => {
      const response = await request(app)
        .get('/scheduler')
        .query({ 
          page: 1, 
          limit: 5,
          status: 'scheduled',
          platform: 'tiktok'
        });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        data: expect.any(Array),
        pagination: expect.any(Object)
      });
    });

    it('should maintain filter logic with pagination', async () => {
      const allResponse = await request(app)
        .get('/scheduler')
        .query({ status: 'scheduled' });

      const paginatedResponse = await request(app)
        .get('/scheduler')
        .query({ status: 'scheduled', page: 1, limit: 100 });

      expect(allResponse.status).toBe(200);
      expect(paginatedResponse.status).toBe(200);

      // If there are results, paginated total should match all results count
      if (allResponse.body.data.posts) {
        const allCount = allResponse.body.data.posts.length;
        const paginatedTotal = paginatedResponse.body.pagination.total;
        expect(paginatedTotal).toBe(allCount);
      }
    });
  });

  describe('Cross-Endpoint Pagination Consistency', () => {
    it('should use consistent pagination format across endpoints', async () => {
      const endpoints = [
        '/assets/backgrounds',
        '/batch',
        '/scheduler'
      ];

      const responses = await Promise.all(
        endpoints.map(endpoint =>
          request(app).get(endpoint).query({ page: 1, limit: 5 })
        )
      );

      responses.forEach((response) => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(response.body.pagination).toMatchObject({
          page: expect.any(Number),
          limit: expect.any(Number),
          total: expect.any(Number),
          totalPages: expect.any(Number),
          hasMore: expect.any(Boolean),
          itemsOnPage: expect.any(Number),
          firstItem: expect.any(Number),
          lastItem: expect.any(Number)
        });
      });
    });

    it('should handle empty results consistently', async () => {
      const response = await request(app)
        .get('/assets/backgrounds')
        .query({ page: 999, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
      expect(response.body.pagination.itemsOnPage).toBe(0);
      expect(response.body.pagination.hasMore).toBe(false);
    });
  });
});
