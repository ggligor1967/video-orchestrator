import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import { requestTimeout, securityHeaders, sanitizeRequest } from './middleware/securityMiddleware.js';

export const createApp = ({ container }) => {
  const app = express();
  const config = container.resolve('config');
  const logger = container.resolve('logger');
  const performanceMiddleware = container.resolve('performanceMiddleware');

  // Enhanced security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"]
      }
    },
    crossOriginEmbedderPolicy: false
  }));
  app.use(securityHeaders);
  app.use(cors(config.cors));
  app.use(sanitizeRequest);
  app.use(requestTimeout(60000)); // 60 second timeout
  
  // Compression middleware for response optimization
  app.use(compression({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
      if (req.headers['x-no-compression']) return false;
      return compression.filter(req, res);
    }
  }));
  
  // Performance monitoring
  app.use(performanceMiddleware);

  // Memory guard middleware (throttle heavy endpoints under pressure)
  try {
    const memoryGuard = container.resolve('memoryGuard');
    if (memoryGuard) app.use(memoryGuard);
  } catch (e) {
    // ignore if not available
  }

  if (config.logging.enableHttpLogging) {
    app.use(morgan('combined', {
      stream: {
        write: (message) => logger.info(message.trim())
      }
    }));
  }

  // Secure request size limits (1MB for JSON payloads)
  app.use(express.json({ 
    limit: '1mb',
    verify: (req, res, buf) => {
      if (buf.length > 1024 * 1024) {
        throw new Error('Request entity too large');
      }
    }
  }));
  app.use(express.urlencoded({ 
    extended: true, 
    limit: '1mb',
    parameterLimit: 100
  }));
  
  // Note: File uploads are handled by multer middleware with proper validation
  // Maximum file upload size: 100MB with strict type validation

  // Rate limiting configuration
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: { 
      success: false,
      error: 'Too many requests from this IP, please try again later',
      retryAfter: '15 minutes'
    }
  });

  // Stricter rate limiting for AI endpoints (20 requests per hour)
  const aiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: 'AI rate limit exceeded. Please try again later.',
      retryAfter: '1 hour'
    }
  });

  // Development rate limiting (more permissive but still protected)
  const devLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: config.env === 'development' ? 1000 : 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { 
      success: false,
      error: 'Rate limit exceeded',
      retryAfter: '15 minutes'
    }
  });

  const devAiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: config.env === 'development' ? 200 : 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: 'AI rate limit exceeded',
      retryAfter: '1 hour'
    }
  });

  // Apply rate limiting to all environments
  app.use('/ai', devAiLimiter);
  app.use('/ai-director', devAiLimiter);
  app.use('/auto-captions', devLimiter);
  app.use('/templates/marketplace', devLimiter);
  app.use('/batch-export', devLimiter);
  app.use('/assets', devLimiter);
  app.use('/audio', devLimiter);
  app.use('/video', devLimiter);
  app.use('/tts', devLimiter);
  app.use('/subs', devLimiter);
  app.use('/export', devLimiter);
  app.use('/pipeline', devLimiter);
  app.use('/batch', devLimiter);
  app.use('/scheduler', devLimiter);
  app.use('/stock', devLimiter);
  app.use('/captions', devLimiter);
  app.use('/templates', devLimiter);
  app.use('/brands', devLimiter);
  app.use('/external-video', devLimiter);
  app.use('/content-analyzer', devAiLimiter);
  app.use('/smart-assets', devAiLimiter);
  app.use('/auto-pilot', devAiLimiter);
  
  // Log rate limit bypasses in development
  if (config.env === 'development') {
    logger.info('Rate limiting active in development mode with relaxed limits');
  }

  // Static files with caching
  app.use('/static', express.static(config.directories.static, {
    maxAge: '1h',
    etag: true,
    lastModified: true
  }));

  app.use('/health', container.resolve('healthRouter'));
  app.use('/ai', container.resolve('aiRouter'));
  app.use('/ai-director', container.resolve('aiDirectorRouter'));
  app.use('/auto-captions', container.resolve('autoCaptionsRouter'));
  app.use('/templates/marketplace', container.resolve('templateMarketplaceRouter'));
  app.use('/batch-export', container.resolve('batchExportRouter'));
  app.use('/assets', container.resolve('assetsRouter'));
  app.use('/audio', container.resolve('audioRouter'));
  app.use('/video', container.resolve('videoRouter'));
  app.use('/tts', container.resolve('ttsRouter'));
  app.use('/subs', container.resolve('subsRouter'));
  app.use('/export', container.resolve('exportRouter'));
  app.use('/pipeline', container.resolve('pipelineRouter'));
  app.use('/batch', container.resolve('batchRouter'));
  app.use('/scheduler', container.resolve('schedulerRouter'));
  app.use('/stock', container.resolve('stockMediaRouter'));
  app.use('/captions', container.resolve('captionRouter'));
  app.use('/templates', container.resolve('templateRouter'));
  app.use('/brands', container.resolve('brandRouter'));
  app.use('/subscription', container.resolve('subscriptionRouter'));
  app.use('/marketplace', container.resolve('marketplaceRouter'));
  app.use('/variations', container.resolve('variationRouter'));
  app.use('/optimize', container.resolve('optimizationRouter'));
  app.use('/analytics', container.resolve('analyticsRouter'));
  app.use('/enterprise', container.resolve('enterpriseRouter'));
  app.use('/advanced', container.resolve('advancedRouter'));
  app.use('/external-video', container.resolve('externalVideoRouter'));
  app.use('/performance', container.resolve('performanceRouter'));
  app.use('/memory', container.resolve('memoryRouter'));
  app.use('/content-analyzer', container.resolve('contentAnalyzerRouter'));
  app.use('/smart-assets', container.resolve('smartAssetRecommenderRouter'));
  app.use('/auto-pilot', container.resolve('autoPilotRouter'));
  // Diagnostics endpoints (memory snapshots, cleanup, gc)
  try {
    app.use('/diagnostics', container.resolve('diagnosticsRouter'));
  } catch (e) {
    // ignore if not registered
  }

  app.get('/', (req, res) => {
    res.json({
      name: 'Video Orchestrator API',
      version: config.version,
      status: 'running',
      endpoints: {
        health: '/health',
        ai: '/ai/script',
        aiDirector: '/ai-director/direct',
        assets: '/assets/backgrounds',
        video: '/video/*',
        audio: '/audio/*',
        tts: '/tts/generate',
        subs: '/subs/generate',
        export: '/export',
        pipeline: '/pipeline/build',
        batch: '/batch',
        scheduler: '/scheduler',
        stock: '/stock/search',
        captions: '/captions/presets',
        templates: '/templates',
        brands: '/brands',
        subscription: '/subscription',
        marketplace: '/marketplace',
        variations: '/variations',
        optimize: '/optimize',
        analytics: '/analytics',
        enterprise: '/enterprise',
        advanced: '/advanced',
        externalVideo: '/external-video',
        memory: '/memory/status',
        contentAnalyzer: '/content-analyzer/script',
        smartAssets: '/smart-assets/recommendations',
        autoPilot: '/auto-pilot/create'
      }
    });
  });

  app.use(container.resolve('notFoundHandler'));
  app.use(container.resolve('errorHandler'));

  return app;
};
