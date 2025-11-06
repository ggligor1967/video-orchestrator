import { describe, it, expect, vi } from 'vitest';
import { paginate, createPaginatedResponse, validatePaginationParams } from '../../src/middleware/pagination.js';

describe('Pagination Middleware', () => {
  describe('paginate()', () => {
    it('should not attach pagination when no query params provided', () => {
      const req = { query: {} };
      const res = {};
      const next = vi.fn();

      const middleware = paginate();
      middleware(req, res, next);

      expect(req.pagination).toBeUndefined();
      expect(next).toHaveBeenCalledOnce();
    });

    it('should parse page and limit from query params', () => {
      const req = { query: { page: '3', limit: '25' } };
      const res = {};
      const next = vi.fn();

      const middleware = paginate();
      middleware(req, res, next);

      expect(req.pagination).toEqual({
        page: 3,
        limit: 25,
        offset: 50
      });
      expect(next).toHaveBeenCalledOnce();
    });

    it('should enforce minimum limit of 1', () => {
      const req = { query: { limit: '0' } };
      const res = {};
      const next = vi.fn();

      const middleware = paginate();
      middleware(req, res, next);

      // Invalid limit (0) falls back to default (10)
      expect(req.pagination.limit).toBe(10);
      expect(next).toHaveBeenCalledOnce();
    });

    it('should enforce maximum limit of 100 by default', () => {
      const req = { query: { limit: '500' } };
      const res = {};
      const next = vi.fn();

      const middleware = paginate();
      middleware(req, res, next);

      expect(req.pagination.limit).toBe(100);
      expect(next).toHaveBeenCalledOnce();
    });

    it('should respect custom maxLimit option', () => {
      const req = { query: { limit: '75' } };
      const res = {};
      const next = vi.fn();

      const middleware = paginate({ maxLimit: 50 });
      middleware(req, res, next);

      expect(req.pagination.limit).toBe(50);
      expect(next).toHaveBeenCalledOnce();
    });

    it('should enforce minimum page of 1', () => {
      const req = { query: { page: '0' } };
      const res = {};
      const next = vi.fn();

      const middleware = paginate();
      middleware(req, res, next);

      expect(req.pagination.page).toBe(1);
      expect(next).toHaveBeenCalledOnce();
    });

    it('should calculate offset correctly', () => {
      const testCases = [
        { page: 1, limit: 10, expectedOffset: 0 },
        { page: 2, limit: 10, expectedOffset: 10 },
        { page: 3, limit: 25, expectedOffset: 50 },
        { page: 5, limit: 20, expectedOffset: 80 }
      ];

      testCases.forEach(({ page, limit, expectedOffset }) => {
        const req = { query: { page: String(page), limit: String(limit) } };
        const res = {};
        const next = vi.fn();

        const middleware = paginate();
        middleware(req, res, next);

        expect(req.pagination.offset).toBe(expectedOffset);
      });
    });

    it('should handle invalid query params gracefully', () => {
      const req = { query: { page: 'invalid', limit: 'bad' } };
      const res = {};
      const next = vi.fn();

      const middleware = paginate();
      middleware(req, res, next);

      expect(req.pagination).toEqual({
        page: 1,
        limit: 10,
        offset: 0
      });
      expect(next).toHaveBeenCalledOnce();
    });

    it('should handle negative numbers gracefully', () => {
      const req = { query: { page: '-5', limit: '-10' } };
      const res = {};
      const next = vi.fn();

      const middleware = paginate();
      middleware(req, res, next);

      // Invalid values fall back to defaults
      expect(req.pagination).toEqual({
        page: 1,
        limit: 10,
        offset: 0
      });
      expect(next).toHaveBeenCalledOnce();
    });
  });

  describe('createPaginatedResponse()', () => {
    it('should create correct response for first page', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const total = 42;
      const pagination = { page: 1, limit: 10, offset: 0 };

      const response = createPaginatedResponse(data, total, pagination);

      expect(response).toEqual({
        success: true,
        data,
        pagination: {
          page: 1,
          limit: 10,
          total: 42,
          totalPages: 5,
          hasMore: true,
          itemsOnPage: 10,
          firstItem: 1,
          lastItem: 10
        }
      });
    });

    it('should create correct response for middle page', () => {
      const data = [21, 22, 23, 24, 25, 26, 27, 28, 29, 30];
      const total = 42;
      const pagination = { page: 3, limit: 10, offset: 20 };

      const response = createPaginatedResponse(data, total, pagination);

      expect(response).toEqual({
        success: true,
        data,
        pagination: {
          page: 3,
          limit: 10,
          total: 42,
          totalPages: 5,
          hasMore: true,
          itemsOnPage: 10,
          firstItem: 21,
          lastItem: 30
        }
      });
    });

    it('should create correct response for last page', () => {
      const data = [41, 42];
      const total = 42;
      const pagination = { page: 5, limit: 10, offset: 40 };

      const response = createPaginatedResponse(data, total, pagination);

      expect(response).toEqual({
        success: true,
        data,
        pagination: {
          page: 5,
          limit: 10,
          total: 42,
          totalPages: 5,
          hasMore: false,
          itemsOnPage: 2,
          firstItem: 41,
          lastItem: 42
        }
      });
    });

    it('should handle empty results', () => {
      const data = [];
      const total = 0;
      const pagination = { page: 1, limit: 10, offset: 0 };

      const response = createPaginatedResponse(data, total, pagination);

      expect(response).toEqual({
        success: true,
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasMore: false,
          itemsOnPage: 0,
          firstItem: 0,
          lastItem: 0
        }
      });
    });

    it('should handle single page of results', () => {
      const data = [1, 2, 3];
      const total = 3;
      const pagination = { page: 1, limit: 10, offset: 0 };

      const response = createPaginatedResponse(data, total, pagination);

      expect(response).toEqual({
        success: true,
        data,
        pagination: {
          page: 1,
          limit: 10,
          total: 3,
          totalPages: 1,
          hasMore: false,
          itemsOnPage: 3,
          firstItem: 1,
          lastItem: 3
        }
      });
    });

    it('should calculate totalPages correctly for exact multiples', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const total = 100;
      const pagination = { page: 1, limit: 10, offset: 0 };

      const response = createPaginatedResponse(data, total, pagination);

      expect(response.pagination.totalPages).toBe(10);
      expect(response.pagination.hasMore).toBe(true);
    });

    it('should calculate totalPages correctly for non-exact multiples', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const total = 95;
      const pagination = { page: 1, limit: 10, offset: 0 };

      const response = createPaginatedResponse(data, total, pagination);

      expect(response.pagination.totalPages).toBe(10);
      expect(response.pagination.hasMore).toBe(true);
    });
  });

  describe('validatePaginationParams()', () => {
    it('should validate correct pagination params', () => {
      const result = validatePaginationParams({ page: '2', limit: '20' });

      expect(result).toEqual({
        page: 2,
        limit: 20,
        offset: 20
      });
    });

    it('should use defaults for missing params', () => {
      const result = validatePaginationParams({});

      expect(result).toEqual({
        page: 1,
        limit: 10,
        offset: 0
      });
    });

    it('should enforce constraints', () => {
      const result = validatePaginationParams({ page: '-5', limit: '500' });

      expect(result.page).toBeGreaterThanOrEqual(1);
      expect(result.limit).toBeLessThanOrEqual(100);
      expect(result.limit).toBeGreaterThanOrEqual(1);
    });
  });
});
