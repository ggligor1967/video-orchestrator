# Refactoring Example - FFmpeg Service

**Înainte și după refactorizarea conform Best Practices**

---

## 📌 ÎNAINTE: Singleton Pattern (Anti-pattern)

### `src/services/ffmpegService.js` (Vechiul stil)

```javascript
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

// ❌ Anti-pattern: Singleton object literal
export const ffmpegService = {
  ffmpegPath: 'tools/ffmpeg/ffmpeg.exe',
  
  async cropTo9x16(inputPath, outputPath) {
    const args = [
      '-i', inputPath,
      '-vf', 'crop=ih*9/16:ih',
      '-c:a', 'copy',
      outputPath
    ];
    
    await execFileAsync(this.ffmpegPath, args);
    return { success: true, outputPath };
  },
  
  async applySpeedRamp(inputPath, outputPath, startTime = 2) {
    const args = [
      '-i', inputPath,
      '-filter_complex', `[0:v]setpts='if(lt(T,${startTime}),PTS,PTS-STARTPTS+${startTime}/TB)*0.8'[v]`,
      '-map', '[v]',
      '-map', '0:a',
      outputPath
    ];
    
    await execFileAsync(this.ffmpegPath, args);
    return { success: true, outputPath };
  }
};
```

### Probleme cu acest cod:

❌ **Testare dificilă**: Nu poți mocka `execFileAsync`  
❌ **Tight coupling**: Hardcodat path-ul FFmpeg  
❌ **Nu e extensibil**: Nu poți înlocui implementarea  
❌ **Lipsă validare**: Nu verifică dacă input path există  
❌ **Nu respectă SOLID**: Încalcă Dependency Inversion Principle  
❌ **Nu respectă DRY**: Logica de execuție duplicată  

---

## ✅ DUPĂ: Class-Based cu DI + Repository Pattern

### 1. Domain Model

```javascript
// src/domain/models/VideoOperation.js
export class VideoOperation {
  constructor({ type, inputPath, outputPath, params = {} }) {
    this.type = type;
    this.inputPath = inputPath;
    this.outputPath = outputPath;
    this.params = params;
    this.validate();
  }

  validate() {
    if (!this.inputPath) throw new Error('Input path is required');
    if (!this.outputPath) throw new Error('Output path is required');
    if (!this.type) throw new Error('Operation type is required');
  }

  static cropTo9x16(inputPath, outputPath) {
    return new VideoOperation({
      type: 'crop',
      inputPath,
      outputPath,
      params: { aspectRatio: '9:16' }
    });
  }

  static speedRamp(inputPath, outputPath, startTime = 2) {
    return new VideoOperation({
      type: 'speedRamp',
      inputPath,
      outputPath,
      params: { startTime }
    });
  }
}
```

### 2. Interface (Abstract class)

```javascript
// src/application/interfaces/IVideoProcessor.js
export class IVideoProcessor {
  async cropTo9x16(operation) {
    throw new Error('Method not implemented');
  }

  async applySpeedRamp(operation) {
    throw new Error('Method not implemented');
  }

  async executeOperation(operation) {
    throw new Error('Method not implemented');
  }
}
```

### 3. Implementation (Infrastructure)

```javascript
// src/infrastructure/video/FFmpegVideoProcessor.js
import { execFile } from 'child_process';
import { promisify } from 'util';
import { access, constants } from 'fs/promises';
import { IVideoProcessor } from '../../application/interfaces/IVideoProcessor.js';

const execFileAsync = promisify(execFile);

export class FFmpegVideoProcessor extends IVideoProcessor {
  constructor({ config, logger, cache }) {
    super();
    this.ffmpegPath = config.ffmpegPath;
    this.logger = logger;
    this.cache = cache;
  }

  async cropTo9x16(operation) {
    await this.validateInput(operation.inputPath);

    const cacheKey = `crop:${operation.inputPath}:9x16`;
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      this.logger.debug('Cache hit for crop operation');
      return cached;
    }

    const args = this.buildCropArgs(operation);
    const result = await this.execute(args, 'crop');
    
    await this.cache.set(cacheKey, result);
    return result;
  }

  async applySpeedRamp(operation) {
    await this.validateInput(operation.inputPath);

    const args = this.buildSpeedRampArgs(operation);
    return await this.execute(args, 'speedRamp');
  }

  async executeOperation(operation) {
    switch (operation.type) {
      case 'crop':
        return await this.cropTo9x16(operation);
      case 'speedRamp':
        return await this.applySpeedRamp(operation);
      default:
        throw new Error(`Unknown operation type: ${operation.type}`);
    }
  }

  // Private helper methods
  buildCropArgs(operation) {
    return [
      '-i', operation.inputPath,
      '-vf', 'crop=ih*9/16:ih',
      '-c:a', 'copy',
      operation.outputPath
    ];
  }

  buildSpeedRampArgs(operation) {
    const { startTime } = operation.params;
    return [
      '-i', operation.inputPath,
      '-filter_complex', `[0:v]setpts='if(lt(T,${startTime}),PTS,PTS-STARTPTS+${startTime}/TB)*0.8'[v]`,
      '-map', '[v]',
      '-map', '0:a',
      operation.outputPath
    ];
  }

  async execute(args, operationType) {
    const startTime = Date.now();
    
    try {
      this.logger.info(`Executing FFmpeg ${operationType}`, { args });
      const { stdout, stderr } = await execFileAsync(this.ffmpegPath, args);
      
      const duration = Date.now() - startTime;
      this.logger.info(`FFmpeg ${operationType} completed`, { duration });
      
      return {
        success: true,
        outputPath: args[args.length - 1],
        duration,
        stdout,
        stderr
      };
    } catch (error) {
      this.logger.error(`FFmpeg ${operationType} failed`, { error, args });
      throw new Error(`FFmpeg operation failed: ${error.message}`);
    }
  }

  async validateInput(inputPath) {
    try {
      await access(inputPath, constants.R_OK);
    } catch (error) {
      throw new Error(`Input file not accessible: ${inputPath}`);
    }
  }
}
```

### 4. Use Case (Application Layer)

```javascript
// src/application/use-cases/ProcessVideo/ProcessVideoUseCase.js
import { VideoOperation } from '../../../domain/models/VideoOperation.js';

export class ProcessVideoUseCase {
  constructor({ videoProcessor, videoRepository, eventBus, logger }) {
    this.videoProcessor = videoProcessor;
    this.videoRepository = videoRepository;
    this.eventBus = eventBus;
    this.logger = logger;
  }

  async execute(dto) {
    this.logger.info('Processing video', { dto });

    // 1. Create domain object
    const operation = this.createOperation(dto);

    // 2. Execute operation
    const result = await this.videoProcessor.executeOperation(operation);

    // 3. Save result
    await this.videoRepository.save({
      inputPath: operation.inputPath,
      outputPath: operation.outputPath,
      operationType: operation.type,
      result
    });

    // 4. Emit event
    await this.eventBus.publish({
      type: 'VideoProcessed',
      data: { operation, result }
    });

    return result;
  }

  createOperation(dto) {
    switch (dto.operationType) {
      case 'crop':
        return VideoOperation.cropTo9x16(dto.inputPath, dto.outputPath);
      case 'speedRamp':
        return VideoOperation.speedRamp(dto.inputPath, dto.outputPath, dto.startTime);
      default:
        throw new Error(`Unknown operation type: ${dto.operationType}`);
    }
  }
}
```

### 5. Controller (Presentation Layer)

```javascript
// src/presentation/http/controllers/VideoController.js
import { z } from 'zod';

const ProcessVideoSchema = z.object({
  operationType: z.enum(['crop', 'speedRamp']),
  inputPath: z.string().min(1),
  outputPath: z.string().min(1),
  startTime: z.number().optional().default(2)
});

export class VideoController {
  constructor({ processVideoUseCase, logger }) {
    this.processVideoUseCase = processVideoUseCase;
    this.logger = logger;
  }

  async processVideo(req, res, next) {
    try {
      // 1. Validate input
      const dto = ProcessVideoSchema.parse(req.body);

      // 2. Execute use case
      const result = await this.processVideoUseCase.execute(dto);

      // 3. Return response
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      this.logger.error('Video processing failed', { error });
      next(error);
    }
  }
}
```

### 6. Dependency Injection Setup

```javascript
// src/container/bindings.js
import { asClass, asValue } from 'awilix';
import { FFmpegVideoProcessor } from '../infrastructure/video/FFmpegVideoProcessor.js';
import { ProcessVideoUseCase } from '../application/use-cases/ProcessVideo/ProcessVideoUseCase.js';
import { VideoController } from '../presentation/http/controllers/VideoController.js';

export const registerBindings = (container) => {
  container.register({
    // Infrastructure
    videoProcessor: asClass(FFmpegVideoProcessor).singleton(),

    // Use Cases
    processVideoUseCase: asClass(ProcessVideoUseCase).scoped(),

    // Controllers
    videoController: asClass(VideoController).scoped(),

    // Config
    config: asValue({
      ffmpegPath: process.env.FFMPEG_PATH || 'tools/ffmpeg/ffmpeg.exe'
    })
  });
};
```

### 7. Routes

```javascript
// src/presentation/http/routes/video.routes.js
import { Router } from 'express';

export const createVideoRouter = ({ videoController }) => {
  const router = Router();

  router.post('/process', (req, res, next) => 
    videoController.processVideo(req, res, next)
  );

  return router;
};
```

---

## 🧪 Unit Tests

### Test pentru Use Case

```javascript
// src/application/use-cases/ProcessVideo/ProcessVideoUseCase.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProcessVideoUseCase } from './ProcessVideoUseCase.js';

describe('ProcessVideoUseCase', () => {
  let useCase;
  let mockVideoProcessor;
  let mockVideoRepository;
  let mockEventBus;
  let mockLogger;

  beforeEach(() => {
    mockVideoProcessor = {
      executeOperation: vi.fn().mockResolvedValue({
        success: true,
        outputPath: 'output.mp4'
      })
    };

    mockVideoRepository = {
      save: vi.fn().mockResolvedValue({ id: '123' })
    };

    mockEventBus = {
      publish: vi.fn().mockResolvedValue()
    };

    mockLogger = {
      info: vi.fn(),
      error: vi.fn()
    };

    useCase = new ProcessVideoUseCase({
      videoProcessor: mockVideoProcessor,
      videoRepository: mockVideoRepository,
      eventBus: mockEventBus,
      logger: mockLogger
    });
  });

  it('should process crop operation successfully', async () => {
    const dto = {
      operationType: 'crop',
      inputPath: 'input.mp4',
      outputPath: 'output.mp4'
    };

    const result = await useCase.execute(dto);

    expect(result.success).toBe(true);
    expect(mockVideoProcessor.executeOperation).toHaveBeenCalledTimes(1);
    expect(mockVideoRepository.save).toHaveBeenCalledTimes(1);
    expect(mockEventBus.publish).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'VideoProcessed' })
    );
  });

  it('should throw error for invalid operation type', async () => {
    const dto = {
      operationType: 'invalid',
      inputPath: 'input.mp4',
      outputPath: 'output.mp4'
    };

    await expect(useCase.execute(dto)).rejects.toThrow('Unknown operation type');
  });
});
```

### Test pentru FFmpegVideoProcessor

```javascript
// src/infrastructure/video/FFmpegVideoProcessor.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FFmpegVideoProcessor } from './FFmpegVideoProcessor.js';
import { VideoOperation } from '../../domain/models/VideoOperation.js';

vi.mock('child_process', () => ({
  execFile: vi.fn((cmd, args, callback) => {
    callback(null, { stdout: '', stderr: '' });
  })
}));

vi.mock('fs/promises', () => ({
  access: vi.fn().mockResolvedValue(),
  constants: { R_OK: 4 }
}));

describe('FFmpegVideoProcessor', () => {
  let processor;
  let mockConfig;
  let mockLogger;
  let mockCache;

  beforeEach(() => {
    mockConfig = { ffmpegPath: '/usr/bin/ffmpeg' };
    mockLogger = { info: vi.fn(), error: vi.fn(), debug: vi.fn() };
    mockCache = { get: vi.fn(), set: vi.fn() };

    processor = new FFmpegVideoProcessor({
      config: mockConfig,
      logger: mockLogger,
      cache: mockCache
    });
  });

  it('should crop video to 9:16', async () => {
    mockCache.get.mockResolvedValue(null);

    const operation = VideoOperation.cropTo9x16('input.mp4', 'output.mp4');
    const result = await processor.cropTo9x16(operation);

    expect(result.success).toBe(true);
    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.stringContaining('Executing FFmpeg crop'),
      expect.any(Object)
    );
    expect(mockCache.set).toHaveBeenCalled();
  });

  it('should use cached result if available', async () => {
    const cachedResult = { success: true, outputPath: 'cached-output.mp4' };
    mockCache.get.mockResolvedValue(cachedResult);

    const operation = VideoOperation.cropTo9x16('input.mp4', 'output.mp4');
    const result = await processor.cropTo9x16(operation);

    expect(result).toEqual(cachedResult);
    expect(mockLogger.debug).toHaveBeenCalledWith('Cache hit for crop operation');
  });

  it('should throw error if input file not accessible', async () => {
    const { access } = await import('fs/promises');
    access.mockRejectedValue(new Error('File not found'));

    const operation = VideoOperation.cropTo9x16('missing.mp4', 'output.mp4');

    await expect(processor.cropTo9x16(operation)).rejects.toThrow(
      'Input file not accessible: missing.mp4'
    );
  });
});
```

---

## 📊 Comparație: Înainte vs. După

| Aspect | Înainte (Singleton) | După (DI + Layered) |
|--------|---------------------|---------------------|
| **Testabilitate** | ❌ Imposibil de testat izolat | ✅ Complet testabil cu mocks |
| **Separarea responsabilităților** | ❌ Tot într-un singur fișier | ✅ 7 fișiere separate pe layere |
| **Reutilizare** | ❌ Hardcodat FFmpeg path | ✅ Configurabil prin DI |
| **Extensibilitate** | ❌ Nu poate fi extins | ✅ Adaugi noi procesoare (Handbrake, etc.) |
| **Validare** | ❌ Lipsă | ✅ Domain models + Zod schemas |
| **Cache** | ❌ Lipsă | ✅ Integrat automat |
| **Logging** | ❌ Lipsă | ✅ Structurat cu context |
| **Error handling** | ❌ Erori generice | ✅ Erori specifice cu context |
| **Linii de cod** | 31 linii | 450+ linii (dar mult mai robust) |
| **Complexitate ciclomatică** | 2 | 15 (dar modular) |

---

## 🚀 Beneficii ale Refactorizării

### 1. Testabilitate ridicată
- **100% code coverage posibil** - toate clasele pot fi testate izolat
- **Mocking ușor** - dependencies injectate prin constructor
- **Fast tests** - nu necesită FFmpeg real pentru unit tests

### 2. Flexibilitate
- **Swap implementations** - poți înlocui FFmpegVideoProcessor cu HandbrakeProcessor
- **Configuration externă** - FFmpeg path din config, nu hardcodat
- **Platform-agnostic** - IVideoProcessor poate avea implementări Windows/Mac/Linux

### 3. Scalabilitate
- **Cache integrat** - operații duplicate nu se re-execută
- **Event-driven** - alte module pot reacționa la VideoProcessed events
- **Repository pattern** - ușor de migrat de la file system la bază de date

### 4. Mentenabilitate
- **Single Responsibility** - fiecare clasă are o singură responsabilitate
- **Dependency Inversion** - depinzi de abstractizări, nu de implementări
- **DRY** - logica de execuție centralizată în `execute()` method

---

## ✅ Checklist Refactorizare

Pentru fiecare serviciu din vechiul cod:

- [ ] Extrage domain model (ex: `VideoOperation`)
- [ ] Creează interfață abstractă (ex: `IVideoProcessor`)
- [ ] Implementează class-based service cu DI (ex: `FFmpegVideoProcessor`)
- [ ] Creează use case (ex: `ProcessVideoUseCase`)
- [ ] Creează controller cu validare Zod (ex: `VideoController`)
- [ ] Configurează dependency injection în `container/bindings.js`
- [ ] Scrie unit tests pentru fiecare componentă
- [ ] Scrie integration test pentru use case
- [ ] Adaugă logging structurat
- [ ] Documentează API contract

---

**Status**: ✅ **REFACTORING EXAMPLE COMPLETE**

Acest exemplu poate fi aplicat pentru toate serviciile existente:
- `aiService.js` → `OpenAIProvider`, `GeminiProvider` + `GenerateScriptUseCase`
- `ttsService.js` → `PiperTTSProvider` + `GenerateVoiceoverUseCase`
- `subsService.js` → `WhisperSubtitleGenerator` + `GenerateSubtitlesUseCase`
- etc.
