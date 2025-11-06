import { ServiceContainer } from './serviceContainer.js';
import { loadConfig } from '../config/config.js';
import { createLogger, setLogger } from '../utils/logger.js';

// Services
import { AIService } from '../services/aiService.js';
import { assetsService } from '../services/assetsService.js';
import { audioService } from '../services/audioService.js';
import { exportService } from '../services/exportService.js';
import { ffmpegService } from '../services/ffmpegService.js';
import { pipelineService } from '../services/pipelineService.js';
import { SubtitleService } from '../services/subtitleService.js';
import { TTSService } from '../services/ttsService.js';
import { VideoService } from '../services/videoService.js';
import { BatchService } from '../services/batchService.js';
import { schedulerService } from '../services/schedulerService.js';
import { StockMediaService } from '../services/stockMediaService.js';
import { CaptionStylingService } from '../services/captionStylingService.js';
import { TemplateService } from '../services/templateService.js';
import { BrandKitService } from '../services/brandKitService.js';
import { HealthService } from '../services/healthService.js';
import { CleanupService } from '../services/cleanupService.js';
// cacheService will be used inside the cacheWrapper module
import { createCacheWrapper } from '../services/cacheWrapper.js';
import { createMemoryAnalyzer } from '../diagnostics/memoryAnalyzer.js';
import { createMemoryGuard } from '../middleware/memoryGuard.js';
import { createDiagnosticsRouter } from '../routes/diagnostics.js';
import { subscriptionService } from '../services/subscriptionService.js';
import { MarketplaceService } from '../services/marketplaceService.js';
import { VariationService } from '../services/variationService.js';
import { OptimizationService } from '../services/optimizationService.js';
import { AnalyticsService } from '../services/analyticsService.js';
import { TrendMonitoringService } from '../services/trendMonitoringService.js';
import { MultilingualService } from '../services/multilingualService.js';
import { SocialMediaService } from '../services/socialMediaService.js';
import { CollaborationService } from '../services/collaborationService.js';
import { CloudService } from '../services/cloudService.js';
import { SSOService } from '../services/ssoService.js';
import { WhiteLabelService } from '../services/whiteLabelService.js';
import { MLAnalyticsService } from '../services/mlAnalyticsService.js';
import { PictoryService } from '../services/pictoryService.js';
import { KapwingService } from '../services/kapwingService.js';
import { ContentAnalyzerService } from '../services/contentAnalyzerService.js';
import { SmartAssetRecommenderService } from '../services/smartAssetRecommenderService.js';
import { AutoPilotService } from '../services/autoPilotService.js';
import { ExternalVideoService } from '../services/externalVideoService.js';
import { PerformanceMonitor } from '../services/performanceMonitor.js';
import { ThumbnailService } from '../services/thumbnailService.js';
import { ProcessManager } from '../services/processManager.js';
import { StreamProcessor } from '../services/streamProcessor.js';
import { AIContentDirectorService } from '../services/aiContentDirectorService.js';
import { AutoCaptionsService } from '../services/autoCaptionsService.js';
import { TemplateMarketplaceService } from '../services/templateMarketplaceService.js';
import { BatchExportService } from '../services/batchExportService.js';

// Controllers
import { createAiController } from '../controllers/aiController.js';
import { createAssetsController } from '../controllers/assetsController.js';
import { createAudioController } from '../controllers/audioController.js';
import { createExportController } from '../controllers/exportController.js';
import { createPipelineController } from '../controllers/pipelineController.js';
import { createSubsController } from '../controllers/subsController.js';
import { createTtsController } from '../controllers/ttsController.js';
import { createVideoController } from '../controllers/videoController.js';
import { createHealthController } from '../controllers/healthController.js';
import { createBatchController } from '../controllers/batchController.js';
import { createSchedulerController } from '../controllers/schedulerController.js';
import { createStockMediaController } from '../controllers/stockMediaController.js';
import { createCaptionController } from '../controllers/captionController.js';
import { createTemplateController } from '../controllers/templateController.js';
import { createBrandKitController } from '../controllers/brandKitController.js';
import { createSubscriptionController } from '../controllers/subscriptionController.js';
import { createMarketplaceController } from '../controllers/marketplaceController.js';
import { createVariationController } from '../controllers/variationController.js';
import { createOptimizationController } from '../controllers/optimizationController.js';
import { createAnalyticsController } from '../controllers/analyticsController.js';
import { createTrendController } from '../controllers/trendController.js';
import { createEnterpriseController } from '../controllers/enterpriseController.js';
import { createAdvancedController } from '../controllers/advancedController.js';
import { createAiDirectorController } from '../controllers/aiDirectorController.js';
import { createAutoCaptionsController } from '../controllers/autoCaptionsController.js';
import { createTemplateMarketplaceController } from '../controllers/templateMarketplaceController.js';
import { createBatchExportController } from '../controllers/batchExportController.js';
import { createContentAnalyzerController } from '../controllers/contentAnalyzerController.js';
import { createSmartAssetRecommenderController } from '../controllers/smartAssetRecommenderController.js';
import { createAutoPilotController } from '../controllers/autoPilotController.js';

// Routes
import { createAiRouter } from '../routes/ai.js';
import { createAssetsRouter } from '../routes/assets.js';
import { createAudioRouter } from '../routes/audio.js';
import { createExportRouter } from '../routes/export.js';
import { createHealthRoutes } from '../routes/health.js';
import { createPipelineRouter } from '../routes/pipeline.js';
import { createSubsRouter } from '../routes/subs.js';
import { createTtsRouter } from '../routes/tts.js';
import { createVideoRouter } from '../routes/video.js';
import { createBatchRouter } from '../routes/batch.js';
import { createSchedulerRouter } from '../routes/scheduler.js';
import { createStockMediaRoutes } from '../routes/stockMedia.js';
import { createCaptionRoutes } from '../routes/captions.js';
import { createTemplateRoutes } from '../routes/templates.js';
import { createBrandRoutes } from '../routes/brands.js';
import { createSubscriptionRouter } from '../routes/subscription.js';
import { createMarketplaceRouter } from '../routes/marketplace.js';
import { createVariationRouter } from '../routes/variations.js';
import { createOptimizationRouter } from '../routes/optimization.js';
import { createAnalyticsRouter } from '../routes/analytics.js';
import { createTrendRoutes } from '../routes/trends.js';
import { createEnterpriseRouter } from '../routes/enterprise.js';
import { createAdvancedRouter } from '../routes/advanced.js';
import { createExternalVideoRoutes } from '../routes/externalVideo.js';
import { createPerformanceRoutes } from '../routes/performance.js';
import { createPerformanceMiddleware } from '../middleware/performanceMiddleware.js';
import { createAiDirectorRouter } from '../routes/aiDirector.js';
import { createAutoCaptionsRouter } from '../routes/autoCaptions.js';
import { createTemplateMarketplaceRouter } from '../routes/templateMarketplace.js';
import { createBatchExportRouter } from '../routes/batchExport.js';
import { createMemoryRoutes } from '../routes/memory.js';
import { createContentAnalyzerRouter } from '../routes/contentAnalyzer.js';
import { createSmartAssetRecommenderRouter } from '../routes/smartAssetRecommender.js';
import { createAutoPilotRouter } from '../routes/autoPilot.js';

// Middleware
import { createErrorHandler } from '../middleware/errorHandler.js';
import { createNotFoundHandler } from '../middleware/notFoundHandler.js';
import { MemoryOptimizer } from '../services/memoryOptimizer.js';
import { LazyServiceLoader } from '../services/lazyServiceLoader.js';
import { memoryManager } from '../utils/memoryManager.js';

export const createContainer = (overrides = {}) => {
  const container = new ServiceContainer();
  const config = loadConfig();

  container.registerValue('config', config);

  container.registerSingleton('logger', (c) => {
    const cfg = c.resolve('config');
    const loggerInstance = createLogger({ level: cfg.logging.level, env: cfg.env });
    setLogger(loggerInstance);
    return loggerInstance;
  });

  // Cache service must be registered first
  container.registerSingleton('cacheService', (c) => {
    const logger = c.resolve('logger');
    const cfg = c.resolve('config');
    const maxEntries = cfg.cache && cfg.cache.maxEntriesDev ? cfg.cache.maxEntriesDev : 200;
    const cleanupIntervalMs = cfg.cache && cfg.cache.cleanupIntervalMs ? cfg.cache.cleanupIntervalMs : 60_000;
    return createCacheWrapper({ logger, maxEntries, cleanupIntervalMs });
  });

  // Services (registered as singletons to enable overrides in tests)
  container.registerSingleton('aiService', (c) => 
    new AIService({
      logger: c.resolve('logger'),
      cacheService: c.resolve('cacheService'),
      config: c.resolve('config')
    })
  );
  container.registerSingleton('assetsService', () => assetsService);
  container.registerSingleton('audioService', () => audioService);
  container.registerSingleton('exportService', () => exportService);
  container.registerSingleton('ffmpegService', () => ffmpegService);
  container.registerSingleton('pipelineService', () => pipelineService);
  container.registerSingleton('subsService', (c) => 
    new SubtitleService({
      logger: c.resolve('logger'),
      config: c.resolve('config')
    })
  );
  container.registerSingleton('ttsService', (c) => 
    new TTSService({
      logger: c.resolve('logger'),
      config: c.resolve('config')
    })
  );
  container.registerSingleton('videoService', (c) => 
    new VideoService({
      logger: c.resolve('logger'),
      ffmpegService: c.resolve('ffmpegService') || {}
    })
  );
  container.registerSingleton('batchService', (c) => 
    new BatchService({
      logger: c.resolve('logger'),
      aiService: c.resolve('aiService'),
      ttsService: c.resolve('ttsService'),
      videoService: c.resolve('videoService'),
      subsService: c.resolve('subsService')
    })
  );
  container.registerSingleton('schedulerService', () => schedulerService);

  container.registerSingleton('stockMediaService', (c) =>
    new StockMediaService({
      logger: c.resolve('logger'),
      config: c.resolve('config'),
      aiService: c.resolve('aiService')
    })
  );

  container.registerSingleton('captionStylingService', (c) =>
    new CaptionStylingService({
      logger: c.resolve('logger')
    })
  );

  container.registerSingleton('brandKitService', (c) =>
    new BrandKitService({
      logger: c.resolve('logger')
    })
  );

  container.registerSingleton('templateService', (c) =>
    new TemplateService({
      logger: c.resolve('logger'),
      pipelineService: c.resolve('pipelineService'),
      brandKitService: c.resolve('brandKitService')
    })
  );

  container.registerSingleton('healthService', (c) =>
    new HealthService({
      logger: c.resolve('logger')
    })
  );

  container.registerSingleton('cleanupService', (c) => {
    const service = new CleanupService({
      config: c.resolve('config')
    });
    service.start(); // Auto-start cleanup
    return service;
  });



  // Memory optimization services
  container.registerSingleton('memoryOptimizer', (c) =>
    new MemoryOptimizer({
      config: c.resolve('config'),
      cacheService: c.resolve('cacheService'),
      cleanupService: c.resolve('cleanupService')
    })
  );

  // Diagnostics & memory tools
  container.registerSingleton('memoryAnalyzer', (c) =>
    createMemoryAnalyzer({ logger: c.resolve('logger') })
  );

  container.registerSingleton('memoryGuard', (c) =>
    createMemoryGuard({ logger: c.resolve('logger'), threshold: c.resolve('config').memory && c.resolve('config').memory.guardThreshold ? c.resolve('config').memory.guardThreshold : 90 })
  );

  container.registerSingleton('diagnosticsRouter', (c) =>
    createDiagnosticsRouter({ memoryAnalyzer: c.resolve('memoryAnalyzer'), memoryOptimizer: c.resolve('memoryOptimizer'), memoryManager: c.resolve('memoryManager') })
  );

  container.registerSingleton('lazyServiceLoader', () => new LazyServiceLoader());
  container.registerValue('memoryManager', memoryManager);

  container.registerSingleton('subscriptionService', () => subscriptionService);

  container.registerSingleton('marketplaceService', (c) =>
    new MarketplaceService({
      logger: c.resolve('logger'),
      templateService: c.resolve('templateService'),
      subscriptionService: c.resolve('subscriptionService')
    })
  );

  container.registerSingleton('variationService', (c) =>
    new VariationService({
      aiService: c.resolve('aiService'),
      logger: c.resolve('logger')
    })
  );

  container.registerSingleton('optimizationService', (c) =>
    new OptimizationService({
      aiService: c.resolve('aiService'),
      logger: c.resolve('logger')
    })
  );

  container.registerSingleton('analyticsService', (c) =>
    new AnalyticsService({
      logger: c.resolve('logger')
    })
  );

  container.registerSingleton('trendMonitoringService', (c) =>
    new TrendMonitoringService({
      logger: c.resolve('logger')
    })
  );

  container.registerSingleton('multilingualService', (c) =>
    new MultilingualService({
      aiService: c.resolve('aiService'),
      logger: c.resolve('logger')
    })
  );

  container.registerSingleton('socialMediaService', (c) =>
    new SocialMediaService({
      logger: c.resolve('logger')
    })
  );

  container.registerSingleton('collaborationService', (c) =>
    new CollaborationService({
      logger: c.resolve('logger')
    })
  );

  container.registerSingleton('cloudService', (c) =>
    new CloudService({
      logger: c.resolve('logger')
    })
  );

  container.registerSingleton('ssoService', (c) =>
    new SSOService({
      logger: c.resolve('logger')
    })
  );

  container.registerSingleton('whiteLabelService', (c) =>
    new WhiteLabelService({
      logger: c.resolve('logger')
    })
  );

  container.registerSingleton('mlAnalyticsService', (c) =>
    new MLAnalyticsService({
      logger: c.resolve('logger')
    })
  );

  container.registerSingleton('pictoryService', (c) =>
    new PictoryService({
      logger: c.resolve('logger'),
      config: c.resolve('config')
    })
  );

  container.registerSingleton('kapwingService', (c) =>
    new KapwingService({
      logger: c.resolve('logger'),
      config: c.resolve('config')
    })
  );

  container.registerSingleton('externalVideoService', (c) =>
    new ExternalVideoService({
      logger: c.resolve('logger'),
      pictoryService: c.resolve('pictoryService'),
      kapwingService: c.resolve('kapwingService'),
      ffmpegService: c.resolve('ffmpegService'),
      config: c.resolve('config')
    })
  );

  container.registerSingleton('performanceMonitor', (c) =>
    new PerformanceMonitor({ logger: c.resolve('logger') })
  );

  container.registerSingleton('contentAnalyzerService', (c) =>
    new ContentAnalyzerService({
      aiService: c.resolve('aiService'),
      logger: c.resolve('logger')
    })
  );

  container.registerSingleton('smartAssetRecommenderService', (c) =>
    new SmartAssetRecommenderService({
      aiService: c.resolve('aiService'),
      assetsService: c.resolve('assetsService'),
      stockMediaService: c.resolve('stockMediaService'),
      logger: c.resolve('logger')
    })
  );

  container.registerSingleton('autoPilotService', (c) =>
    new AutoPilotService({
      aiService: c.resolve('aiService'),
      pipelineService: c.resolve('pipelineService'),
      contentAnalyzerService: c.resolve('contentAnalyzerService'),
      smartAssetRecommenderService: c.resolve('smartAssetRecommenderService'),
      logger: c.resolve('logger')
    })
  );

  container.registerSingleton('thumbnailService', (c) =>
    new ThumbnailService({
      logger: c.resolve('logger'),
      config: c.resolve('config')
    })
  );

  container.registerSingleton('performanceMiddleware', (c) =>
    createPerformanceMiddleware(c.resolve('performanceMonitor'))
  );

  container.registerSingleton('processManager', (c) =>
    new ProcessManager({ logger: c.resolve('logger') })
  );

  container.registerSingleton('streamProcessor', (c) =>
    new StreamProcessor({ logger: c.resolve('logger') })
  );

  container.registerSingleton('aiContentDirectorService', (c) =>
    new AIContentDirectorService({
      logger: c.resolve('logger')
    })
  );

  container.registerSingleton('autoCaptionsService', (c) =>
    new AutoCaptionsService({
      logger: c.resolve('logger'),
      subsService: c.resolve('subsService')
    })
  );

  container.registerSingleton('templateMarketplaceService', (c) =>
    new TemplateMarketplaceService({
      logger: c.resolve('logger')
    })
  );

  container.registerSingleton('batchExportService', (c) =>
    new BatchExportService({
      logger: c.resolve('logger'),
      exportService: c.resolve('exportService')
    })
  );

  // Controllers
  container.registerSingleton('aiController', (c) =>
    createAiController({
      aiService: c.resolve('aiService'),
      logger: c.resolve('logger')
    })
  );

  container.registerSingleton('assetsController', (c) =>
    createAssetsController({
      assetsService: c.resolve('assetsService'),
      logger: c.resolve('logger')
    })
  );

  container.registerSingleton('audioController', (c) =>
    createAudioController({
      audioService: c.resolve('audioService'),
      logger: c.resolve('logger')
    })
  );

  container.registerSingleton('exportController', (c) =>
    createExportController({
      exportService: c.resolve('exportService'),
      logger: c.resolve('logger')
    })
  );

  container.registerSingleton('pipelineController', (c) =>
    createPipelineController({
      pipelineService: c.resolve('pipelineService'),
      logger: c.resolve('logger')
    })
  );

  container.registerSingleton('subsController', (c) =>
    createSubsController({
      subsService: c.resolve('subsService'),
      logger: c.resolve('logger')
    })
  );

  container.registerSingleton('ttsController', (c) =>
    createTtsController({
      ttsService: c.resolve('ttsService'),
      logger: c.resolve('logger')
    })
  );

  container.registerSingleton('videoController', (c) =>
    createVideoController({
      videoService: c.resolve('videoService'),
      logger: c.resolve('logger')
    })
  );

  container.registerSingleton('healthController', (c) =>
    createHealthController({
      healthService: c.resolve('healthService')
    })
  );

  container.registerSingleton('batchController', (c) =>
    createBatchController({
      batchService: c.resolve('batchService'),
      logger: c.resolve('logger')
    })
  );

  container.registerSingleton('schedulerController', (c) =>
    createSchedulerController({
      schedulerService: c.resolve('schedulerService'),
      logger: c.resolve('logger')
    })
  );

  container.registerSingleton('stockMediaController', (c) =>
    createStockMediaController({
      stockMediaService: c.resolve('stockMediaService'),
      logger: c.resolve('logger')
    })
  );

  container.registerSingleton('captionController', (c) =>
    createCaptionController({
      captionStylingService: c.resolve('captionStylingService'),
      logger: c.resolve('logger')
    })
  );

  container.registerSingleton('templateController', (c) =>
    createTemplateController({
      templateService: c.resolve('templateService'),
      logger: c.resolve('logger')
    })
  );

  container.registerSingleton('brandKitController', (c) =>
    createBrandKitController({
      brandKitService: c.resolve('brandKitService'),
      logger: c.resolve('logger')
    })
  );

  container.registerSingleton('subscriptionController', (c) =>
    createSubscriptionController({
      subscriptionService: c.resolve('subscriptionService'),
      logger: c.resolve('logger')
    })
  );

  container.registerSingleton('marketplaceController', (c) =>
    createMarketplaceController({
      marketplaceService: c.resolve('marketplaceService'),
      logger: c.resolve('logger')
    })
  );

  container.registerSingleton('variationController', (c) =>
    createVariationController({
      variationService: c.resolve('variationService'),
      logger: c.resolve('logger')
    })
  );

  container.registerSingleton('optimizationController', (c) =>
    createOptimizationController({
      optimizationService: c.resolve('optimizationService'),
      logger: c.resolve('logger')
    })
  );

  container.registerSingleton('analyticsController', (c) =>
    createAnalyticsController({
      analyticsService: c.resolve('analyticsService'),
      logger: c.resolve('logger')
    })
  );

  container.registerSingleton('trendController', (c) =>
    createTrendController({
      trendService: c.resolve('trendMonitoringService')
    })
  );

  container.registerSingleton('enterpriseController', (c) =>
    createEnterpriseController({
      multilingualService: c.resolve('multilingualService'),
      socialMediaService: c.resolve('socialMediaService'),
      collaborationService: c.resolve('collaborationService'),
      logger: c.resolve('logger')
    })
  );

  container.registerSingleton('advancedController', (c) =>
    createAdvancedController({
      cloudService: c.resolve('cloudService'),
      ssoService: c.resolve('ssoService'),
      whiteLabelService: c.resolve('whiteLabelService'),
      mlAnalyticsService: c.resolve('mlAnalyticsService'),
      logger: c.resolve('logger')
    })
  );

  container.registerSingleton('aiDirectorController', (c) =>
    createAiDirectorController({
      aiContentDirectorService: c.resolve('aiContentDirectorService'),
      logger: c.resolve('logger')
    })
  );

  container.registerSingleton('autoCaptionsController', (c) =>
    createAutoCaptionsController({
      autoCaptionsService: c.resolve('autoCaptionsService'),
      logger: c.resolve('logger')
    })
  );

  container.registerSingleton('templateMarketplaceController', (c) =>
    createTemplateMarketplaceController({
      templateMarketplaceService: c.resolve('templateMarketplaceService'),
      logger: c.resolve('logger')
    })
  );

  container.registerSingleton('batchExportController', (c) =>
    createBatchExportController({
      batchExportService: c.resolve('batchExportService'),
      logger: c.resolve('logger')
    })
  );

  container.registerSingleton('contentAnalyzerController', (c) =>
    createContentAnalyzerController({
      contentAnalyzerService: c.resolve('contentAnalyzerService'),
      logger: c.resolve('logger')
    })
  );

  container.registerSingleton('smartAssetRecommenderController', (c) =>
    createSmartAssetRecommenderController({
      smartAssetRecommenderService: c.resolve('smartAssetRecommenderService'),
      logger: c.resolve('logger')
    })
  );

  container.registerSingleton('autoPilotController', (c) =>
    createAutoPilotController({
      autoPilotService: c.resolve('autoPilotService'),
      logger: c.resolve('logger')
    })
  );

  // Routers
  container.registerSingleton('aiRouter', (c) =>
    createAiRouter({ aiController: c.resolve('aiController') })
  );

  container.registerSingleton('assetsRouter', (c) =>
    createAssetsRouter({ assetsController: c.resolve('assetsController') })
  );

  container.registerSingleton('audioRouter', (c) =>
    createAudioRouter({ audioController: c.resolve('audioController') })
  );

  container.registerSingleton('exportRouter', (c) =>
    createExportRouter({ exportController: c.resolve('exportController') })
  );

  container.registerSingleton('healthRouter', (c) =>
    createHealthRoutes({ healthService: c.resolve('healthService') })
  );

  container.registerSingleton('pipelineRouter', (c) =>
    createPipelineRouter({ pipelineController: c.resolve('pipelineController') })
  );

  container.registerSingleton('subsRouter', (c) =>
    createSubsRouter({ subsController: c.resolve('subsController') })
  );

  container.registerSingleton('ttsRouter', (c) =>
    createTtsRouter({ ttsController: c.resolve('ttsController') })
  );

  container.registerSingleton('videoRouter', (c) =>
    createVideoRouter({ videoController: c.resolve('videoController') })
  );

  container.registerSingleton('batchRouter', (c) =>
    createBatchRouter({ batchController: c.resolve('batchController') })
  );

  container.registerSingleton('schedulerRouter', (c) =>
    createSchedulerRouter({ schedulerController: c.resolve('schedulerController') })
  );

  container.registerSingleton('stockMediaRouter', (c) =>
    createStockMediaRoutes({ stockMediaController: c.resolve('stockMediaController') })
  );

  container.registerSingleton('captionRouter', (c) =>
    createCaptionRoutes(c)
  );

  container.registerSingleton('templateRouter', (c) =>
    createTemplateRoutes(c)
  );

  container.registerSingleton('brandRouter', (c) =>
    createBrandRoutes(c)
  );

  container.registerSingleton('subscriptionRouter', (c) =>
    createSubscriptionRouter({ subscriptionController: c.resolve('subscriptionController') })
  );

  container.registerSingleton('marketplaceRouter', (c) =>
    createMarketplaceRouter({ marketplaceController: c.resolve('marketplaceController') })
  );

  container.registerSingleton('variationRouter', (c) =>
    createVariationRouter({ variationController: c.resolve('variationController') })
  );

  container.registerSingleton('optimizationRouter', (c) =>
    createOptimizationRouter({ optimizationController: c.resolve('optimizationController') })
  );

  container.registerSingleton('analyticsRouter', (c) =>
    createAnalyticsRouter({ analyticsController: c.resolve('analyticsController') })
  );

  container.registerSingleton('trendRouter', (c) =>
    createTrendRoutes(c)
  );

  container.registerSingleton('enterpriseRouter', (c) =>
    createEnterpriseRouter({ enterpriseController: c.resolve('enterpriseController') })
  );

  container.registerSingleton('advancedRouter', (c) =>
    createAdvancedRouter({ advancedController: c.resolve('advancedController') })
  );

  container.registerSingleton('externalVideoRouter', (c) =>
    createExternalVideoRoutes(c)
  );

  container.registerSingleton('performanceRouter', (c) =>
    createPerformanceRoutes(c)
  );

  container.registerSingleton('aiDirectorRouter', (c) =>
    createAiDirectorRouter({ aiDirectorController: c.resolve('aiDirectorController') })
  );

  container.registerSingleton('autoCaptionsRouter', (c) =>
    createAutoCaptionsRouter({ autoCaptionsController: c.resolve('autoCaptionsController') })
  );

  container.registerSingleton('templateMarketplaceRouter', (c) =>
    createTemplateMarketplaceRouter({ templateMarketplaceController: c.resolve('templateMarketplaceController') })
  );

  container.registerSingleton('batchExportRouter', (c) =>
    createBatchExportRouter({ batchExportController: c.resolve('batchExportController') })
  );

  container.registerSingleton('memoryRouter', (c) =>
    createMemoryRoutes(c)
  );

  container.registerSingleton('contentAnalyzerRouter', (c) =>
    createContentAnalyzerRouter({ contentAnalyzerController: c.resolve('contentAnalyzerController') })
  );

  container.registerSingleton('smartAssetRecommenderRouter', (c) =>
    createSmartAssetRecommenderRouter({ smartAssetRecommenderController: c.resolve('smartAssetRecommenderController') })
  );

  container.registerSingleton('autoPilotRouter', (c) =>
    createAutoPilotRouter({ autoPilotController: c.resolve('autoPilotController') })
  );

  // Middleware
  container.registerSingleton('errorHandler', (c) =>
    createErrorHandler({ logger: c.resolve('logger') })
  );

  container.registerSingleton('notFoundHandler', () => createNotFoundHandler());

  // Allow dependency overrides (useful for tests)
  Object.entries(overrides).forEach(([name, value]) => {
    container.override(name, value);
  });

  // Initialize memory optimization (less aggressive in development)
  const memoryOptimizer = container.resolve('memoryOptimizer');
  const logger = container.resolve('logger');
  if (process.env.NODE_ENV === 'production') {
    memoryOptimizer.start();
  } else {
    // In development, only start monitoring without aggressive cleanup
    logger.info('Development mode: Memory optimizer running in passive mode');
  }
  memoryManager.startMonitoring();

  return container;
};
