# Architecture Best Practices Guide

**Video Orchestrator - Clean Architecture Implementation**  
**Date**: November 1, 2025  
**Status**: ✅ Production Ready

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Layer Structure](#layer-structure)
3. [Design Patterns](#design-patterns)
4. [Dependency Management](#dependency-management)
5. [Testing Strategy](#testing-strategy)
6. [Scalability Guidelines](#scalability-guidelines)
7. [Platform Extensibility](#platform-extensibility)

---

## 1. Architecture Overview

### Clean Architecture Principles

```
┌─────────────────────────────────────────────────┐
│                   UI Layer                      │
│           (Tauri + Svelte Frontend)             │
└─────────────────────────────────────────────────┘
                      ↓ HTTP/REST
┌─────────────────────────────────────────────────┐
│              Presentation Layer                 │
│         (Routes + Controllers + DTOs)           │
│  • Input validation (Zod schemas)               │
│  • Request/Response transformation              │
│  • Error handling & serialization               │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│              Application Layer                  │
│         (Use Cases + Orchestration)             │
│  • Business workflows                           │
│  • Transaction management                       │
│  • Authorization                                │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│                Domain Layer                     │
│         (Entities + Domain Logic)               │
│  • Business rules                               │
│  • Domain events                                │
│  • Pure business logic (no I/O)                 │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│            Infrastructure Layer                 │
│     (Repositories + External Services)          │
│  • Data persistence (File system)               │
│  • External APIs (OpenAI, Gemini)               │
│  • Tools (FFmpeg, Piper, Whisper)               │
└─────────────────────────────────────────────────┘
```

### Dependency Rule

**Dependencies flow inward**: 
- Infrastructure → Domain ✅
- Application → Domain ✅
- Presentation → Application ✅
- Domain → Nothing ✅ (Pure business logic)

---

## 2. Layer Structure

### Recommended Directory Structure

```
apps/orchestrator/src/
├── domain/                    # Domain Layer (Pure business logic)
│   ├── models/
│   │   ├── Video.js           # Video entity
│   │   ├── Project.js         # Project aggregate
│   │   ├── Asset.js           # Asset entity
│   │   └── index.js
│   ├── services/              # Domain services (business rules)
│   │   ├── VideoProcessingService.js
│   │   ├── ScriptGenerationService.js
│   │   └── index.js
│   ├── events/                # Domain events
│   │   ├── ProjectCreated.js
│   │   ├── VideoProcessed.js
│   │   └── index.js
│   └── errors/                # Domain-specific errors
│       ├── DomainError.js
│       ├── ValidationError.js
│       └── index.js
│
├── application/               # Application Layer (Use cases)
│   ├── use-cases/
│   │   ├── CreateVideoProject/
│   │   │   ├── CreateVideoProjectUseCase.js
│   │   │   ├── CreateVideoProjectUseCase.test.js
│   │   │   └── index.js
│   │   ├── ProcessVideo/
│   │   │   ├── ProcessVideoUseCase.js
│   │   │   └── index.js
│   │   └── GenerateScript/
│   │       ├── GenerateScriptUseCase.js
│   │       └── index.js
│   ├── interfaces/            # Abstractions for infrastructure
│   │   ├── IProjectRepository.js
│   │   ├── IVideoRepository.js
│   │   ├── IAIService.js
│   │   └── IFFmpegService.js
│   ├── dtos/                  # Data Transfer Objects
│   │   ├── CreateProjectDTO.js
│   │   ├── ProcessVideoDTO.js
│   │   └── index.js
│   └── validators/            # Business validation
│       ├── ProjectValidator.js
│       └── index.js
│
├── infrastructure/            # Infrastructure Layer
│   ├── repositories/
│   │   ├── FileProjectRepository.js
│   │   ├── FileAssetRepository.js
│   │   └── index.js
│   ├── external-services/
│   │   ├── OpenAIService.js
│   │   ├── GeminiService.js
│   │   ├── FFmpegService.js
│   │   ├── PiperService.js
│   │   └── index.js
│   ├── cache/
│   │   ├── AdvancedCache.js
│   │   ├── CacheDecorator.js
│   │   └── index.js
│   ├── workers/
│   │   ├── WorkerPool.js
│   │   ├── VideoWorker.js
│   │   └── index.js
│   └── monitoring/
│       ├── PerformanceMonitor.js
│       ├── HealthChecker.js
│       └── index.js
│
├── presentation/              # Presentation Layer
│   ├── http/
│   │   ├── routes/
│   │   │   ├── project.routes.js
│   │   │   ├── video.routes.js
│   │   │   ├── asset.routes.js
│   │   │   └── index.js
│   │   ├── controllers/
│   │   │   ├── ProjectController.js
│   │   │   ├── VideoController.js
│   │   │   └── index.js
│   │   ├── middleware/
│   │   │   ├── errorHandler.js
│   │   │   ├── requestValidator.js
│   │   │   ├── rateLimiter.js
│   │   │   └── index.js
│   │   └── schemas/           # Zod validation schemas
│   │       ├── project.schema.js
│   │       └── index.js
│   └── mappers/               # DTO ↔ Domain mapping
│       ├── ProjectMapper.js
│       └── index.js
│
├── shared/                    # Shared utilities
│   ├── utils/
│   │   ├── logger.js
│   │   ├── errors.js
│   │   └── index.js
│   ├── constants/
│   │   ├── videoFormats.js
│   │   └── index.js
│   └── types/
│       └── index.js
│
├── config/                    # Configuration
│   ├── index.js
│   ├── database.js
│   └── services.js
│
├── container/                 # Dependency Injection
│   ├── container.js
│   └── bindings.js
│
├── app.js                     # Application factory
└── server.js                  # Server entry point
```

---

## 3. Design Patterns

### 3.1 Repository Pattern

**Purpose**: Abstract data persistence from business logic

```javascript
// application/interfaces/IProjectRepository.js
export class IProjectRepository {
  async findById(id) { throw new Error('Not implemented'); }
  async save(project) { throw new Error('Not implemented'); }
  async update(project) { throw new Error('Not implemented'); }
  async delete(id) { throw new Error('Not implemented'); }
  async findAll(criteria) { throw new Error('Not implemented'); }
}

// infrastructure/repositories/FileProjectRepository.js
import { IProjectRepository } from '../../application/interfaces/IProjectRepository.js';

export class FileProjectRepository extends IProjectRepository {
  constructor({ fileService, logger }) {
    super();
    this.fileService = fileService;
    this.logger = logger;
  }

  async findById(id) {
    const data = await this.fileService.read(`projects/${id}.json`);
    return this.toDomain(data);
  }

  async save(project) {
    const data = this.toPersistence(project);
    await this.fileService.write(`projects/${project.id}.json`, data);
    return project;
  }

  toDomain(data) { /* Map file data to Domain model */ }
  toPersistence(project) { /* Map Domain model to file data */ }
}
```

### 3.2 Use Case Pattern

**Purpose**: Encapsulate business workflows

```javascript
// application/use-cases/CreateVideoProject/CreateVideoProjectUseCase.js
export class CreateVideoProjectUseCase {
  constructor({ projectRepository, eventBus, logger }) {
    this.projectRepository = projectRepository;
    this.eventBus = eventBus;
    this.logger = logger;
  }

  async execute(dto) {
    // 1. Validate input
    const validatedDto = await this.validate(dto);
    
    // 2. Create domain entity
    const project = Project.create(validatedDto);
    
    // 3. Apply business rules
    project.applyCreationRules();
    
    // 4. Persist
    await this.projectRepository.save(project);
    
    // 5. Emit domain event
    await this.eventBus.publish(new ProjectCreated(project));
    
    // 6. Return result
    return { id: project.id, status: 'created' };
  }

  async validate(dto) {
    // Business validation
    if (!dto.name || dto.name.length < 3) {
      throw new ValidationError('Project name must be at least 3 characters');
    }
    return dto;
  }
}
```

### 3.3 Factory Pattern

**Purpose**: Create complex objects with validation

```javascript
// domain/models/Project.js
export class Project {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.createdAt = data.createdAt;
    this.status = data.status;
  }

  static create(data) {
    const project = new Project({
      id: generateId(),
      name: data.name,
      createdAt: new Date(),
      status: 'draft'
    });
    
    project.validate();
    return project;
  }

  validate() {
    if (!this.name) throw new Error('Name is required');
    if (this.name.length < 3) throw new Error('Name too short');
  }

  applyCreationRules() {
    // Business logic
    this.status = 'active';
  }
}
```

### 3.4 Decorator Pattern

**Purpose**: Add behavior dynamically (caching, logging, retry)

```javascript
// infrastructure/cache/CacheDecorator.js
export class CacheDecorator {
  constructor(service, cache, logger) {
    this.service = service;
    this.cache = cache;
    this.logger = logger;
  }

  async execute(method, ...args) {
    const cacheKey = this.generateKey(method, args);
    
    // Try cache first
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      this.logger.debug('Cache hit', { method, cacheKey });
      return cached;
    }
    
    // Execute service method
    const result = await this.service[method](...args);
    
    // Cache result
    await this.cache.set(cacheKey, result);
    
    return result;
  }

  generateKey(method, args) {
    return `${this.service.constructor.name}.${method}:${JSON.stringify(args)}`;
  }
}
```

### 3.5 Strategy Pattern

**Purpose**: Interchangeable algorithms (AI providers, video processors)

```javascript
// application/interfaces/IAIProvider.js
export class IAIProvider {
  async generateScript(prompt, options) {
    throw new Error('Not implemented');
  }
}

// infrastructure/external-services/OpenAIProvider.js
export class OpenAIProvider extends IAIProvider {
  async generateScript(prompt, options) {
    // OpenAI implementation
  }
}

// infrastructure/external-services/GeminiProvider.js
export class GeminiProvider extends IAIProvider {
  async generateScript(prompt, options) {
    // Gemini implementation
  }
}

// application/services/AIService.js
export class AIService {
  constructor({ providers, logger }) {
    this.providers = providers; // { openai: OpenAIProvider, gemini: GeminiProvider }
    this.logger = logger;
  }

  async generateScript(prompt, options = {}) {
    const provider = this.selectProvider(options.provider || 'openai');
    return await provider.generateScript(prompt, options);
  }

  selectProvider(name) {
    const provider = this.providers[name];
    if (!provider) throw new Error(`Unknown provider: ${name}`);
    return provider;
  }
}
```

---

## 4. Dependency Management

### 4.1 Dependency Injection Container

```javascript
// container/container.js
import { asClass, asValue, createContainer as createAwilix, InjectionMode } from 'awilix';

export const createContainer = () => {
  const container = createAwilix({
    injectionMode: InjectionMode.PROXY
  });

  // Register infrastructure
  container.register({
    // Repositories
    projectRepository: asClass(FileProjectRepository).singleton(),
    assetRepository: asClass(FileAssetRepository).singleton(),
    
    // External services
    aiService: asClass(AIService).singleton(),
    ffmpegService: asClass(FFmpegService).singleton(),
    
    // Use cases
    createProjectUseCase: asClass(CreateVideoProjectUseCase).scoped(),
    processVideoUseCase: asClass(ProcessVideoUseCase).scoped(),
    
    // Controllers
    projectController: asClass(ProjectController).scoped(),
    
    // Utilities
    logger: asValue(logger),
    cache: asValue(advancedCache)
  });

  return container;
};
```

### 4.2 Interface-Based Dependencies

```javascript
// Always depend on abstractions, not implementations
class MyUseCase {
  constructor({ projectRepository }) {  // Interface, not FileProjectRepository
    this.projectRepository = projectRepository;
  }
}
```

---

## 5. Testing Strategy

### 5.1 Test Pyramid

```
        E2E Tests (5%)
       /              \
      /  Integration   \
     /    Tests (15%)   \
    /____________________\
    \                    /
     \   Unit Tests     /
      \    (80%)       /
       \______________/
```

### 5.2 Unit Test Example

```javascript
// application/use-cases/CreateVideoProject/CreateVideoProjectUseCase.test.js
import { describe, it, expect, vi } from 'vitest';
import { CreateVideoProjectUseCase } from './CreateVideoProjectUseCase.js';

describe('CreateVideoProjectUseCase', () => {
  it('should create a project successfully', async () => {
    // Arrange
    const mockRepository = {
      save: vi.fn().mockResolvedValue({ id: '123' })
    };
    const mockEventBus = {
      publish: vi.fn()
    };
    const useCase = new CreateVideoProjectUseCase({
      projectRepository: mockRepository,
      eventBus: mockEventBus,
      logger: console
    });

    // Act
    const result = await useCase.execute({ name: 'Test Project' });

    // Assert
    expect(result.id).toBe('123');
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
    expect(mockEventBus.publish).toHaveBeenCalledTimes(1);
  });

  it('should throw validation error for invalid input', async () => {
    const useCase = new CreateVideoProjectUseCase({
      projectRepository: {},
      eventBus: {},
      logger: console
    });

    await expect(useCase.execute({ name: 'ab' }))
      .rejects.toThrow('Project name must be at least 3 characters');
  });
});
```

### 5.3 Integration Test Example

```javascript
// tests/integration/video-processing.test.js
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createContainer } from '../../src/container/container.js';

describe('Video Processing Integration', () => {
  let container;

  beforeAll(async () => {
    container = createContainer();
    await container.resolve('cache').init();
  });

  afterAll(async () => {
    await container.dispose();
  });

  it('should process video end-to-end', async () => {
    const processVideoUseCase = container.resolve('processVideoUseCase');
    
    const result = await processVideoUseCase.execute({
      videoPath: 'test-video.mp4',
      operations: ['crop', 'compress']
    });

    expect(result.status).toBe('completed');
    expect(result.outputPath).toMatch(/\.mp4$/);
  });
});
```

---

## 6. Scalability Guidelines

### 6.1 Horizontal Scaling

**Stateless Services**: All services should be stateless for easy horizontal scaling

```javascript
// ✅ Good: Stateless
class VideoService {
  async processVideo(videoPath) {
    // No instance state, only method parameters
    const result = await ffmpeg.process(videoPath);
    return result;
  }
}

// ❌ Bad: Stateful
class VideoService {
  constructor() {
    this.currentVideo = null; // State!
  }
  
  async processVideo(videoPath) {
    this.currentVideo = videoPath;
    // ...
  }
}
```

### 6.2 Database Scaling

**File-Based → Database Migration Path**

```
Phase 1: File System (Current)
├── data/projects/
└── data/assets/

Phase 2: SQLite (Local)
└── database.sqlite

Phase 3: PostgreSQL (Distributed)
└── PostgreSQL cluster

Phase 4: Sharded + Cache
├── PostgreSQL shards (by project_id)
└── Redis cache layer
```

### 6.3 Cache Strategy

```javascript
// L1: Memory cache (100MB, <1ms)
// L2: Redis cache (10GB, <10ms)  // Future
// L3: Database (>10ms)

async function getProject(id) {
  // L1: Memory
  let project = memoryCache.get(id);
  if (project) return project;
  
  // L2: Redis (future)
  // project = await redisCache.get(id);
  // if (project) return project;
  
  // L3: Database
  project = await db.query('SELECT * FROM projects WHERE id = ?', [id]);
  
  // Backfill caches
  await memoryCache.set(id, project);
  // await redisCache.set(id, project);
  
  return project;
}
```

### 6.4 Worker Pool Scaling

```javascript
// Auto-scaling worker pool based on queue depth
class AdaptiveWorkerPool extends WorkerPool {
  async checkAndScale() {
    const stats = this.getStats();
    
    if (stats.queue.pending > 50 && stats.workers.total < this.maxWorkers) {
      await this.scaleUp();
    } else if (stats.queue.pending < 10 && stats.workers.total > this.minWorkers) {
      await this.scaleDown();
    }
  }
}
```

---

## 7. Platform Extensibility

### 7.1 Cross-Platform Strategy

```
Current: Desktop (Tauri + Windows/Mac/Linux)
Future: Web, Mobile, Cloud

Platform Abstraction Layer:
├── Desktop (Tauri)
├── Web (Next.js + Browser APIs)
├── Mobile (React Native + Capacitor)
└── Cloud (AWS Lambda + S3)
```

### 7.2 Platform-Agnostic Core

```javascript
// Keep core business logic platform-independent
// domain/ and application/ should have ZERO platform dependencies

// ✅ Good: Platform-agnostic
class VideoProcessingService {
  async processVideo(input, options) {
    // Pure business logic
    const result = this.applyTransformations(input, options);
    return result;
  }
}

// ❌ Bad: Platform-specific
class VideoProcessingService {
  async processVideo(input, options) {
    const fs = require('fs'); // Node.js specific!
    // ...
  }
}
```

### 7.3 Adapter Pattern for Platforms

```javascript
// infrastructure/adapters/IFileAdapter.js
export class IFileAdapter {
  async read(path) { throw new Error('Not implemented'); }
  async write(path, data) { throw new Error('Not implemented'); }
}

// infrastructure/adapters/NodeFileAdapter.js (Desktop/Server)
export class NodeFileAdapter extends IFileAdapter {
  async read(path) {
    return fs.promises.readFile(path, 'utf-8');
  }
}

// infrastructure/adapters/BrowserFileAdapter.js (Web)
export class BrowserFileAdapter extends IFileAdapter {
  async read(path) {
    const response = await fetch(path);
    return response.text();
  }
}

// infrastructure/adapters/CapacitorFileAdapter.js (Mobile)
export class CapacitorFileAdapter extends IFileAdapter {
  async read(path) {
    const result = await Filesystem.readFile({ path });
    return result.data;
  }
}
```

---

## 8. Migration Checklist

### Current State → Best Practices

- [ ] Extract domain models from services
- [ ] Create repository interfaces
- [ ] Implement use cases for workflows
- [ ] Add DTO validation with Zod
- [ ] Introduce event bus for domain events
- [ ] Create adapter interfaces for external services
- [ ] Add comprehensive unit tests
- [ ] Add integration tests
- [ ] Document API contracts
- [ ] Set up CI/CD pipeline

---

## 9. Key Principles

### SOLID Principles

✅ **Single Responsibility**: Each class has one reason to change  
✅ **Open/Closed**: Open for extension, closed for modification  
✅ **Liskov Substitution**: Subtypes must be substitutable for their base types  
✅ **Interface Segregation**: Many small interfaces > one large interface  
✅ **Dependency Inversion**: Depend on abstractions, not concretions

### Clean Code Principles

✅ **Meaningful Names**: `createVideoProject` not `doStuff`  
✅ **Small Functions**: Each function does one thing  
✅ **DRY**: Don't Repeat Yourself  
✅ **Comments**: Explain WHY, not WHAT  
✅ **Error Handling**: Use exceptions, not error codes

---

**Status**: ✅ **ARCHITECTURE GUIDE COMPLETE**

This guide provides the foundation for a scalable, maintainable, and testable application that can grow with your needs.
