# Layered Architecture - Migration Plan

**Plan complet de migrare la arhitectura clean în 5 faze**

---

## 📂 FAZA 1: Restructurare Directoare (2-3 ore)

### Structura Nouă (Target)

```
apps/orchestrator/src/
├── domain/                           # NEW - Business logic pur
│   ├── models/
│   │   ├── Project.js
│   │   ├── Video.js
│   │   ├── Asset.js
│   │   ├── ScriptSegment.js
│   │   └── index.js
│   ├── value-objects/                # Immutable objects
│   │   ├── VideoFormat.js
│   │   ├── AspectRatio.js
│   │   └── index.js
│   ├── errors/
│   │   ├── DomainError.js
│   │   ├── ValidationError.js
│   │   └── index.js
│   └── index.js
│
├── application/                      # NEW - Use cases + orchestration
│   ├── use-cases/
│   │   ├── video/
│   │   │   ├── ProcessVideoUseCase.js
│   │   │   ├── CropVideoUseCase.js
│   │   │   └── index.js
│   │   ├── script/
│   │   │   ├── GenerateScriptUseCase.js
│   │   │   └── index.js
│   │   ├── tts/
│   │   │   ├── GenerateVoiceoverUseCase.js
│   │   │   └── index.js
│   │   └── index.js
│   ├── interfaces/                   # Abstract interfaces
│   │   ├── IVideoProcessor.js
│   │   ├── IAIProvider.js
│   │   ├── ITTSProvider.js
│   │   ├── ISubtitleGenerator.js
│   │   ├── IAssetRepository.js
│   │   └── index.js
│   ├── dtos/                         # Data Transfer Objects
│   │   ├── ProcessVideoDTO.js
│   │   ├── GenerateScriptDTO.js
│   │   └── index.js
│   └── index.js
│
├── infrastructure/                   # REFACTOR existing services/
│   ├── video/
│   │   ├── FFmpegVideoProcessor.js   # From services/ffmpegService.js
│   │   ├── HandbrakeProcessor.js     # Future alternative
│   │   └── index.js
│   ├── ai/
│   │   ├── OpenAIProvider.js         # From services/aiService.js
│   │   ├── GeminiProvider.js
│   │   └── index.js
│   ├── tts/
│   │   ├── PiperTTSProvider.js       # From services/ttsService.js
│   │   └── index.js
│   ├── subtitles/
│   │   ├── WhisperSubtitleGenerator.js  # From services/subsService.js
│   │   └── index.js
│   ├── repositories/                 # NEW - Data persistence
│   │   ├── FileAssetRepository.js
│   │   ├── FileProjectRepository.js
│   │   └── index.js
│   ├── cache/                        # MOVE from services/
│   │   ├── AdvancedCache.js
│   │   ├── CacheDecorator.js
│   │   └── index.js
│   ├── workers/                      # MOVE from services/
│   │   ├── WorkerPool.js
│   │   ├── VideoProcessingWorker.js
│   │   └── index.js
│   ├── monitoring/                   # MOVE from services/
│   │   ├── PerformanceMonitor.js
│   │   ├── HealthChecker.js
│   │   └── index.js
│   └── index.js
│
├── presentation/                     # REFACTOR existing routes/ + controllers/
│   ├── http/
│   │   ├── routes/
│   │   │   ├── video.routes.js       # From routes/video.js
│   │   │   ├── script.routes.js      # From routes/ai.js
│   │   │   ├── asset.routes.js       # From routes/assets.js
│   │   │   └── index.js
│   │   ├── controllers/
│   │   │   ├── VideoController.js    # From controllers/videoController.js
│   │   │   ├── ScriptController.js   # From controllers/aiController.js
│   │   │   └── index.js
│   │   ├── middleware/               # KEEP as is
│   │   │   ├── errorHandler.js
│   │   │   ├── rateLimiter.js
│   │   │   ├── requestValidator.js
│   │   │   └── index.js
│   │   └── schemas/                  # NEW - Zod validation schemas
│   │       ├── video.schema.js
│   │       ├── script.schema.js
│   │       └── index.js
│   └── index.js
│
├── shared/                           # REFACTOR utils/ → shared/
│   ├── utils/
│   │   ├── logger.js
│   │   ├── errors.js
│   │   ├── validation.js
│   │   └── index.js
│   ├── constants/
│   │   ├── videoFormats.js
│   │   ├── httpStatus.js
│   │   └── index.js
│   └── index.js
│
├── config/                           # KEEP as is
│   ├── index.js
│   ├── services.js
│   └── env.js
│
├── container/                        # KEEP + ENHANCE
│   ├── container.js
│   ├── bindings.js                   # Enhanced with all new classes
│   └── index.js
│
├── app.js                            # KEEP - Express app factory
├── server.js                         # KEEP - Entry point
└── index.js                          # NEW - Barrel export
```

### Scriptul de Migrare

```bash
# scripts/migrate-structure.sh (PowerShell)

# 1. Create new directories
New-Item -ItemType Directory -Force -Path "apps/orchestrator/src/domain/models"
New-Item -ItemType Directory -Force -Path "apps/orchestrator/src/domain/value-objects"
New-Item -ItemType Directory -Force -Path "apps/orchestrator/src/domain/errors"

New-Item -ItemType Directory -Force -Path "apps/orchestrator/src/application/use-cases/video"
New-Item -ItemType Directory -Force -Path "apps/orchestrator/src/application/use-cases/script"
New-Item -ItemType Directory -Force -Path "apps/orchestrator/src/application/use-cases/tts"
New-Item -ItemType Directory -Force -Path "apps/orchestrator/src/application/interfaces"
New-Item -ItemType Directory -Force -Path "apps/orchestrator/src/application/dtos"

New-Item -ItemType Directory -Force -Path "apps/orchestrator/src/infrastructure/video"
New-Item -ItemType Directory -Force -Path "apps/orchestrator/src/infrastructure/ai"
New-Item -ItemType Directory -Force -Path "apps/orchestrator/src/infrastructure/tts"
New-Item -ItemType Directory -Force -Path "apps/orchestrator/src/infrastructure/subtitles"
New-Item -ItemType Directory -Force -Path "apps/orchestrator/src/infrastructure/repositories"

New-Item -ItemType Directory -Force -Path "apps/orchestrator/src/presentation/http/schemas"

New-Item -ItemType Directory -Force -Path "apps/orchestrator/src/shared/constants"

# 2. Move existing files (preserve old for backup)
Move-Item "apps/orchestrator/src/services/advancedCache.js" "apps/orchestrator/src/infrastructure/cache/AdvancedCache.js"
Move-Item "apps/orchestrator/src/services/workerPool.js" "apps/orchestrator/src/infrastructure/workers/WorkerPool.js"
Move-Item "apps/orchestrator/src/services/performanceMonitor.js" "apps/orchestrator/src/infrastructure/monitoring/PerformanceMonitor.js"

# 3. Keep old structure as backup
Copy-Item -Recurse "apps/orchestrator/src" "apps/orchestrator/src-backup-$(Get-Date -Format 'yyyyMMdd')"
```

---

## 🔄 FAZA 2: Refactorizare Services (6-8 ore)

### Priority Order (în funcție de impact)

#### 1. FFmpeg Service → FFmpegVideoProcessor (HIGHEST PRIORITY)

**Impact**: Folosit în 60% din operații video

```javascript
// ÎNAINTE: services/ffmpegService.js (singleton)
export const ffmpegService = { ... };

// DUPĂ: infrastructure/video/FFmpegVideoProcessor.js (class)
export class FFmpegVideoProcessor extends IVideoProcessor {
  constructor({ config, logger, cache }) {
    super();
    this.config = config;
    this.logger = logger;
    this.cache = cache;
  }
  // ...
}
```

**Checklist**:
- [ ] Creează `application/interfaces/IVideoProcessor.js`
- [ ] Creează `infrastructure/video/FFmpegVideoProcessor.js`
- [ ] Creează `domain/models/VideoOperation.js`
- [ ] Scrie unit tests pentru `FFmpegVideoProcessor`
- [ ] Update `container/bindings.js`
- [ ] Update controllers care folosesc `ffmpegService`

**Estimat**: 2 ore

---

#### 2. AI Service → OpenAIProvider + GeminiProvider (HIGH PRIORITY)

**Impact**: Folosit pentru generare script

```javascript
// ÎNAINTE: services/aiService.js (singleton)
export const aiService = { generateScript() { ... } };

// DUPĂ: infrastructure/ai/OpenAIProvider.js (class)
export class OpenAIProvider extends IAIProvider {
  constructor({ config, logger, cache }) {
    super();
    // ...
  }
  
  async generateScript(prompt, options) {
    // OpenAI specific implementation
  }
}

// DUPĂ: infrastructure/ai/GeminiProvider.js (class)
export class GeminiProvider extends IAIProvider {
  async generateScript(prompt, options) {
    // Gemini specific implementation
  }
}

// DUPĂ: application/use-cases/script/GenerateScriptUseCase.js
export class GenerateScriptUseCase {
  constructor({ aiProvider, scriptRepository, eventBus }) {
    this.aiProvider = aiProvider;
    // ...
  }
  
  async execute(dto) {
    // Business logic
    const result = await this.aiProvider.generateScript(dto.prompt, dto.options);
    // ...
  }
}
```

**Checklist**:
- [ ] Creează `application/interfaces/IAIProvider.js`
- [ ] Creează `infrastructure/ai/OpenAIProvider.js`
- [ ] Creează `infrastructure/ai/GeminiProvider.js`
- [ ] Creează `application/use-cases/script/GenerateScriptUseCase.js`
- [ ] Scrie unit tests
- [ ] Update container + controller

**Estimat**: 2 ore

---

#### 3. TTS Service → PiperTTSProvider (MEDIUM PRIORITY)

**Impact**: Folosit pentru voice-over generation

**Checklist**:
- [ ] Creează `application/interfaces/ITTSProvider.js`
- [ ] Creează `infrastructure/tts/PiperTTSProvider.js`
- [ ] Creează `application/use-cases/tts/GenerateVoiceoverUseCase.js`
- [ ] Unit tests
- [ ] Update container + controller

**Estimat**: 1.5 ore

---

#### 4. Subtitles Service → WhisperSubtitleGenerator (MEDIUM PRIORITY)

**Checklist**:
- [ ] Creează `application/interfaces/ISubtitleGenerator.js`
- [ ] Creează `infrastructure/subtitles/WhisperSubtitleGenerator.js`
- [ ] Creează `application/use-cases/subtitles/GenerateSubtitlesUseCase.js`
- [ ] Unit tests
- [ ] Update container + controller

**Estimat**: 1.5 ore

---

## 🏗️ FAZA 3: Domain Models + Use Cases (4-5 ore)

### Domain Models (Business logic pur)

```javascript
// domain/models/Project.js
export class Project {
  constructor({ id, name, status, assets, createdAt }) {
    this.id = id;
    this.name = name;
    this.status = status;
    this.assets = assets || [];
    this.createdAt = createdAt;
  }

  static create(data) {
    const project = new Project({
      id: generateId(),
      name: data.name,
      status: 'draft',
      assets: [],
      createdAt: new Date()
    });
    
    project.validate();
    return project;
  }

  validate() {
    if (!this.name || this.name.length < 3) {
      throw new ValidationError('Project name must be at least 3 characters');
    }
  }

  addAsset(asset) {
    this.assets.push(asset);
  }

  canBePublished() {
    return this.assets.length > 0 && this.status === 'ready';
  }
}
```

### Checklist Domain Models:
- [ ] `Project.js` - Aggregate root
- [ ] `Video.js` - Video entity
- [ ] `Asset.js` - Asset entity
- [ ] `ScriptSegment.js` - Script segment
- [ ] Value objects: `VideoFormat`, `AspectRatio`, `Duration`
- [ ] Domain errors: `DomainError`, `ValidationError`

**Estimat**: 3 ore

---

## 🎯 FAZA 4: Testing Infrastructure (3-4 ore)

### Setup Test Framework

```javascript
// vitest.config.ts (update)
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.test.js',
        '**/*.spec.js'
      ]
    }
  }
});
```

### Test Structure

```
tests/
├── unit/
│   ├── domain/
│   │   ├── models/
│   │   │   ├── Project.test.js
│   │   │   └── Video.test.js
│   │   └── value-objects/
│   │       └── VideoFormat.test.js
│   ├── application/
│   │   └── use-cases/
│   │       ├── ProcessVideoUseCase.test.js
│   │       └── GenerateScriptUseCase.test.js
│   └── infrastructure/
│       ├── FFmpegVideoProcessor.test.js
│       └── OpenAIProvider.test.js
│
├── integration/
│   ├── video-processing-flow.test.js
│   └── script-generation-flow.test.js
│
└── e2e/
    └── pipeline-ui.spec.js
```

### Checklist Testing:
- [ ] Setup Vitest configuration
- [ ] Create test utilities (mocks, fixtures)
- [ ] Write unit tests for domain models (80% coverage)
- [ ] Write unit tests for use cases (80% coverage)
- [ ] Write unit tests for infrastructure (70% coverage)
- [ ] Write integration tests (5 critical flows)
- [ ] Update CI/CD pipeline with test commands

**Estimat**: 4 ore

---

## 📦 FAZA 5: Container + Controllers Update (2-3 ore)

### Enhanced Container

```javascript
// container/bindings.js (COMPLETE)
import { asClass, asValue, asFunction } from 'awilix';

export const registerBindings = (container) => {
  // ===== INFRASTRUCTURE =====
  container.register({
    // Video processing
    videoProcessor: asClass(FFmpegVideoProcessor).singleton(),
    
    // AI providers
    openAIProvider: asClass(OpenAIProvider).singleton(),
    geminiProvider: asClass(GeminiProvider).singleton(),
    aiProvider: asFunction(({ openAIProvider, geminiProvider, config }) => {
      return config.defaultAIProvider === 'gemini' ? geminiProvider : openAIProvider;
    }).singleton(),
    
    // TTS
    ttsProvider: asClass(PiperTTSProvider).singleton(),
    
    // Subtitles
    subtitleGenerator: asClass(WhisperSubtitleGenerator).singleton(),
    
    // Repositories
    assetRepository: asClass(FileAssetRepository).singleton(),
    projectRepository: asClass(FileProjectRepository).singleton(),
    
    // Cache & Workers
    cache: asClass(AdvancedCache).singleton(),
    workerPool: asClass(WorkerPool).singleton(),
    performanceMonitor: asClass(PerformanceMonitor).singleton()
  });

  // ===== APPLICATION (USE CASES) =====
  container.register({
    processVideoUseCase: asClass(ProcessVideoUseCase).scoped(),
    generateScriptUseCase: asClass(GenerateScriptUseCase).scoped(),
    generateVoiceoverUseCase: asClass(GenerateVoiceoverUseCase).scoped(),
    generateSubtitlesUseCase: asClass(GenerateSubtitlesUseCase).scoped()
  });

  // ===== PRESENTATION (CONTROLLERS) =====
  container.register({
    videoController: asClass(VideoController).scoped(),
    scriptController: asClass(ScriptController).scoped(),
    assetController: asClass(AssetController).scoped()
  });

  // ===== SHARED =====
  container.register({
    logger: asValue(logger),
    config: asValue(config)
  });
};
```

### Updated Controllers

```javascript
// presentation/http/controllers/VideoController.js
import { z } from 'zod';

const ProcessVideoSchema = z.object({
  operationType: z.enum(['crop', 'speedRamp', 'mux']),
  inputPath: z.string().min(1),
  outputPath: z.string().min(1),
  params: z.record(z.any()).optional()
});

export class VideoController {
  constructor({ processVideoUseCase, logger }) {
    this.processVideoUseCase = processVideoUseCase;
    this.logger = logger;
  }

  async processVideo(req, res, next) {
    try {
      const dto = ProcessVideoSchema.parse(req.body);
      const result = await this.processVideoUseCase.execute(dto);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
```

### Checklist Container:
- [ ] Update `container/bindings.js` cu toate clasele noi
- [ ] Verifică că toate dependencies sunt rezolvate
- [ ] Test container resolving cu `pnpm test:integration`
- [ ] Update `app.js` cu noul container
- [ ] Update toate routes să folosească noul container

**Estimat**: 2 ore

---

## 🚀 TOTAL ESTIMAT: 17-23 ORE

### Breakdown pe zile (assuming 4-6h/day):

**Ziua 1** (6 ore):
- [x] Faza 1: Restructurare directoare (2h)
- [x] Faza 2.1: FFmpegVideoProcessor refactoring (2h)
- [x] Faza 2.2: AI Service refactoring (2h)

**Ziua 2** (5 ore):
- [x] Faza 2.3: TTS Service refactoring (1.5h)
- [x] Faza 2.4: Subtitles Service refactoring (1.5h)
- [x] Faza 3: Domain Models (2h)

**Ziua 3** (6 ore):
- [x] Faza 3 (continuare): Use Cases (3h)
- [x] Faza 4: Testing Infrastructure setup (3h)

**Ziua 4** (4 ore):
- [x] Faza 4 (continuare): Write tests (3h)
- [x] Faza 5: Container + Controllers update (1h)

**Ziua 5** (2 ore):
- [x] Testing final, smoke tests, documentation

---

## ✅ Validation Checklist

După finalizarea migrării:

- [ ] **Build passes**: `pnpm build` fără erori
- [ ] **Tests pass**: `pnpm test:all` cu 80%+ coverage
- [ ] **Lint passes**: `pnpm lint` fără erori critice
- [ ] **API functional**: Toate endpoints răspund corect
- [ ] **Performance maintained**: P95 latency < 200ms
- [ ] **Documentation updated**: README + ARCHITECTURE_BEST_PRACTICES.md
- [ ] **No breaking changes**: Backwards compatible API

---

## 🔄 Rollback Plan

Dacă apar probleme:

```bash
# Restore backup
Remove-Item -Recurse -Force "apps/orchestrator/src"
Copy-Item -Recurse "apps/orchestrator/src-backup-YYYYMMDD" "apps/orchestrator/src"

# Reinstall dependencies
pnpm install

# Verify old structure works
pnpm --filter @app/orchestrator dev
```

---

**Status**: ✅ **MIGRATION PLAN READY**

Planul este conservativ (17-23h) și modular - poți opri după orice fază și avea cod funcțional.
