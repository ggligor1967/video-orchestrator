import { beforeAll, afterAll, describe, expect, it, vi } from 'vitest';
import type { AddressInfo } from 'node:net';
import { createApp } from '../../apps/orchestrator/src/app.js';
// Import express directly from the orchestrator workspace to avoid adding a root dependency
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - pnpm keeps express inside the orchestrator workspace
import expressFactory from '../../apps/orchestrator/node_modules/express';

const express: any = expressFactory.default ?? expressFactory;

const makeRouter = (name: string) => {
  const router = express.Router();
  router.get('/', (_req, res) => {
    res.json({ router: name, ok: true });
  });
  return router;
};

describe('createApp integration', () => {
  const logger = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn()
  };

  const routerNames = [
    'aiRouter',
    'assetsRouter',
    'audioRouter',
    'videoRouter',
    'ttsRouter',
    'subsRouter',
    'exportRouter',
    'pipelineRouter',
    'batchRouter',
    'schedulerRouter',
    'stockMediaRouter',
    'captionRouter',
    'templateRouter',
    'brandRouter'
  ] as const;

  const routers = new Map<string, express.Router>(
    routerNames.map((name) => [name, makeRouter(name)])
  );

  const healthRouter = express.Router();
  healthRouter.get('/', (_req, res) => {
    res.json({ status: 'ok' });
  });

  const config = {
    env: 'test',
    isProduction: false,
    port: 4545,
    host: '127.0.0.1',
    version: '1.2.3',
    cors: { origin: ['http://localhost:3000'], credentials: true },
    bodyParser: { jsonLimit: '1mb', urlencodedLimit: '1mb' },
    directories: { data: process.cwd(), static: process.cwd() },
    logging: { level: 'debug', enableHttpLogging: true },
    security: { allowedDirectories: { all: [] } }
  };

  const container = {
    resolve(name: string) {
      if (name === 'config') return config;
      if (name === 'logger') return logger;
      if (name === 'healthRouter') return healthRouter;
      if (name === 'notFoundHandler') {
        return (req: express.Request, res: express.Response) => {
          res.status(404).json({ error: 'not-found', path: req.path });
        };
      }
      if (name === 'errorHandler') {
        return (
          err: Error,
          _req: express.Request,
          res: express.Response,
          _next: express.NextFunction
        ) => {
          res.status(500).json({ error: err.message || 'internal-error' });
        };
      }
      const router = routers.get(name);
      if (!router) {
        throw new Error(`Unexpected dependency requested: ${name}`);
      }
      return router;
    }
  };

  let server: ReturnType<express.Application['listen']>;
  let baseUrl: string;

  beforeAll(() => {
    const app = createApp({ container: container as any });
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

  it('responds with API metadata on the root route', async () => {
    const response = await fetch(`${baseUrl}/`);
    expect(response.status).toBe(200);
    const body = await response.json();

    expect(body).toMatchObject({
      name: 'Video Orchestrator API',
      version: '1.2.3',
      status: 'running',
      endpoints: expect.objectContaining({
        health: '/health',
        ai: '/ai/script'
      })
    });
    expect(logger.info).toHaveBeenCalled();
  });

  it('exposes the health router', async () => {
    const response = await fetch(`${baseUrl}/health`);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: 'ok' });
  });

  it('falls back to the not-found handler for unknown routes', async () => {
    const response = await fetch(`${baseUrl}/unknown-route`, { redirect: 'manual' });
    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body).toEqual({ error: 'not-found', path: '/unknown-route' });
  });
});
