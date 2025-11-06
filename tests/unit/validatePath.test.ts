import path from 'path';
import { describe, expect, it, vi } from 'vitest';
import { validatePath } from '../../apps/orchestrator/src/middleware/validatePath.js';

const createResponse = () => {
  return {
    statusCode: 200,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    }
  };
};

const createRequest = (body: Record<string, unknown> = {}) => ({
  body,
  params: {},
  ip: '127.0.0.1',
  get: () => 'vitest'
});

describe('validatePath middleware', () => {
  it('allows requests with safe paths and extensions', () => {
    const middleware = validatePath(['tests/fixtures']);
    const next = vi.fn();
    const req = createRequest({
      inputPath: path.join(process.cwd(), 'tests/fixtures/video.mp4')
    });
    const res = createResponse();

    middleware(req as any, res as any, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.statusCode).toBe(200);
  });

  it('blocks disallowed file extensions', () => {
    const middleware = validatePath(['tests/fixtures']);
    const next = vi.fn();
    const req = createRequest({
      inputPath: path.join(process.cwd(), 'tests/fixtures/malware.exe')
    });
    const res = createResponse();

    middleware(req as any, res as any, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(403);
    expect(res.body).toMatchObject({
      success: false,
      error: {
        code: 'INVALID_FILE_TYPE',
        message: 'File type .exe is not allowed',
        details: {
          field: 'inputPath',
          extension: '.exe'
        }
      }
    });
  });

  it('blocks paths that escape allowed directories', () => {
    const middleware = validatePath(['tests/fixtures']);
    const next = vi.fn();
    const req = createRequest({
      inputPath: path.join(process.cwd(), '../secret/creds.txt')
    });
    const res = createResponse();

    middleware(req as any, res as any, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(403);
    expect(res.body).toMatchObject({
      success: false,
      error: {
        code: 'PATH_TRAVERSAL_DENIED',
        message: 'Access denied: Path outside allowed directories',
        details: {
          field: 'inputPath',
          allowedDirectories: ['tests/fixtures']
        }
      }
    });
  });
});
