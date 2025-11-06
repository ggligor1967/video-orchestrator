# Scalability & Performance Guide

**Ghid complet de scalare pentru Video Orchestrator**  
**From 10 users/day → 10,000+ users/day**

---

## 📊 Current Performance Baseline

### System Capacity (Current)
- **Backend**: Single process, port 4545
- **Throughput**: ~5-10 requests/second
- **Concurrency**: 4 worker threads (CPU cores)
- **Memory**: 0.5-1GB average, 2GB peak
- **Storage**: File system, ~10GB cache
- **Users**: Designed for 1-10 concurrent users (desktop app)

### Performance Metrics (Current)
| Operation | P50 Latency | P95 Latency | P99 Latency |
|-----------|-------------|-------------|-------------|
| Script generation (AI) | 800ms | 1500ms | 2500ms |
| Video crop (9:16) | 2s | 5s | 8s |
| Speed ramp effect | 3s | 7s | 12s |
| Voice-over TTS | 1.5s | 3s | 5s |
| Subtitle generation | 4s | 8s | 15s |
| Full pipeline (30s video) | 60s | 90s | 120s |

---

## 🚀 Scaling Phases

### Phase 1: Vertical Scaling (Desktop → Power Desktop)

**Target**: 10-50 concurrent users  
**Timeline**: Immediate (configuration only)

#### 1.1 Worker Pool Optimization

```javascript
// config/services.js - BEFORE
export const workerPoolConfig = {
  maxWorkers: 4,  // Default CPU cores
  minWorkers: 2
};

// config/services.js - AFTER
export const workerPoolConfig = {
  maxWorkers: Math.min(require('os').cpus().length * 2, 16),  // 2x cores, max 16
  minWorkers: 4,
  idleTimeout: 30000,  // Keep warm for 30s
  maxQueueSize: 100,   // Prevent memory overflow
  autoScale: true      // Dynamic scaling based on load
};
```

#### 1.2 Cache Layer Expansion

```javascript
// config/services.js - BEFORE
export const cacheConfig = {
  l1: { maxSize: 100 * 1024 * 1024 },    // 100MB
  l2: { maxSize: 5 * 1024 * 1024 * 1024 } // 5GB
};

// config/services.js - AFTER
export const cacheConfig = {
  l1: { maxSize: 500 * 1024 * 1024 },     // 500MB (5x)
  l2: { maxSize: 20 * 1024 * 1024 * 1024 },// 20GB (4x)
  l3: {
    enabled: true,
    type: 'redis',  // Optional Redis for shared cache
    maxSize: 100 * 1024 * 1024 * 1024     // 100GB
  }
};
```

#### 1.3 FFmpeg Optimization

```javascript
// infrastructure/video/FFmpegVideoProcessor.js

// ADD hardware acceleration
buildCropArgs(operation) {
  return [
    '-hwaccel', 'auto',        // Enable GPU acceleration (NVENC/QuickSync/VAAPI)
    '-i', operation.inputPath,
    '-vf', 'crop=ih*9/16:ih',
    '-c:v', 'h264_nvenc',      // NVIDIA GPU encoding
    '-preset', 'fast',          // Balance quality/speed
    '-c:a', 'copy',
    operation.outputPath
  ];
}
```

**Expected Improvements**:
- Video processing: 30-50% faster (with GPU)
- Memory usage: 20% reduction (better cache)
- Throughput: 2x increase (more workers)

**Cost**: $0 (configuration only)

---

### Phase 2: Horizontal Scaling (Desktop → Server)

**Target**: 50-500 concurrent users  
**Timeline**: 2-4 weeks development

#### 2.1 Multi-Process Architecture

```
                    ┌──────────────┐
                    │ Load Balancer│
                    │  (nginx)     │
                    └──────┬───────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
    ┌────▼────┐       ┌────▼────┐       ┌────▼────┐
    │Process 1│       │Process 2│       │Process 3│
    │Port 4545│       │Port 4546│       │Port 4547│
    └────┬────┘       └────┬────┘       └────┬────┘
         │                 │                 │
         └─────────────────┼─────────────────┘
                           │
                    ┌──────▼───────┐
                    │ Redis Cache  │
                    │ (Shared)     │
                    └──────────────┘
```

**Implementation**:

```javascript
// scripts/start-cluster.js
import cluster from 'cluster';
import os from 'os';

if (cluster.isMaster) {
  const numWorkers = process.env.NUM_WORKERS || os.cpus().length;
  
  console.log(`Master process starting ${numWorkers} workers...`);
  
  for (let i = 0; i < numWorkers; i++) {
    cluster.fork({ PORT: 4545 + i });
  }
  
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  const { createApp } = await import('./src/app.js');
  const port = process.env.PORT || 4545;
  
  const app = createApp();
  app.listen(port, () => {
    console.log(`Worker ${process.pid} listening on port ${port}`);
  });
}
```

#### 2.2 Redis Cache Layer

```javascript
// infrastructure/cache/RedisCache.js
import { createClient } from 'redis';

export class RedisCache {
  constructor({ config, logger }) {
    this.config = config;
    this.logger = logger;
    this.client = null;
  }

  async init() {
    this.client = createClient({
      url: this.config.redis.url,
      password: this.config.redis.password
    });
    
    await this.client.connect();
    this.logger.info('Redis cache connected');
  }

  async get(key) {
    const value = await this.client.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set(key, value, ttl = 3600) {
    await this.client.setEx(key, ttl, JSON.stringify(value));
  }

  async invalidate(pattern) {
    const keys = await this.client.keys(pattern);
    if (keys.length > 0) {
      await this.client.del(keys);
    }
  }
}
```

#### 2.3 Database Migration (File → SQLite → PostgreSQL)

```javascript
// infrastructure/repositories/PostgresProjectRepository.js
import pg from 'pg';
import { IProjectRepository } from '../../application/interfaces/IProjectRepository.js';

export class PostgresProjectRepository extends IProjectRepository {
  constructor({ dbPool, logger }) {
    super();
    this.db = dbPool;
    this.logger = logger;
  }

  async findById(id) {
    const result = await this.db.query(
      'SELECT * FROM projects WHERE id = $1',
      [id]
    );
    return result.rows[0] ? this.toDomain(result.rows[0]) : null;
  }

  async save(project) {
    const data = this.toPersistence(project);
    await this.db.query(
      `INSERT INTO projects (id, name, status, assets, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [data.id, data.name, data.status, JSON.stringify(data.assets), data.created_at, data.updated_at]
    );
    return project;
  }

  async findAll(criteria) {
    let query = 'SELECT * FROM projects WHERE 1=1';
    const params = [];
    
    if (criteria.status) {
      params.push(criteria.status);
      query += ` AND status = $${params.length}`;
    }
    
    if (criteria.limit) {
      params.push(criteria.limit);
      query += ` LIMIT $${params.length}`;
    }
    
    const result = await this.db.query(query, params);
    return result.rows.map(row => this.toDomain(row));
  }

  toDomain(row) {
    return {
      id: row.id,
      name: row.name,
      status: row.status,
      assets: JSON.parse(row.assets || '[]'),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  toPersistence(project) {
    return {
      id: project.id,
      name: project.name,
      status: project.status,
      assets: project.assets,
      created_at: project.createdAt,
      updated_at: new Date()
    };
  }
}
```

**Database Schema**:

```sql
-- migrations/001_create_projects.sql
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  assets JSONB DEFAULT '[]',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);

-- migrations/002_create_videos.sql
CREATE TABLE videos (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  input_path TEXT NOT NULL,
  output_path TEXT,
  operation_type VARCHAR(50),
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  result JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE INDEX idx_videos_project_id ON videos(project_id);
CREATE INDEX idx_videos_status ON videos(status);
```

**Expected Improvements**:
- Throughput: 10x increase (4 processes × 2.5x efficiency)
- Latency: 20-30% reduction (shared Redis cache)
- Reliability: 99.9% uptime (auto-restart failed workers)

**Cost**: 
- Redis: $50-100/month (managed service)
- PostgreSQL: $100-200/month (managed service)
- Server: $200-500/month (8-16 cores, 32-64GB RAM)

**Total**: ~$400/month for 50-500 concurrent users

---

### Phase 3: Distributed Architecture (Server → Cloud)

**Target**: 500-10,000+ concurrent users  
**Timeline**: 1-2 months development

#### 3.1 Microservices Architecture

```
                    ┌──────────────┐
                    │  API Gateway │
                    │  (Kong/NGINX)│
                    └──────┬───────┘
                           │
         ┌─────────────────┼─────────────────┬──────────────┐
         │                 │                 │              │
    ┌────▼────┐       ┌────▼────┐      ┌────▼────┐   ┌────▼────┐
    │ Script  │       │  Video  │      │   TTS   │   │Subtitles│
    │ Service │       │ Service │      │ Service │   │ Service │
    └────┬────┘       └────┬────┘      └────┬────┘   └────┬────┘
         │                 │                 │              │
         └─────────────────┼─────────────────┴──────────────┘
                           │
                    ┌──────▼───────┐
                    │ Message Queue│
                    │ (RabbitMQ)   │
                    └──────────────┘
```

**Service Separation**:

```javascript
// services/script-service/src/server.js
import express from 'express';
import { GenerateScriptUseCase } from './use-cases/GenerateScriptUseCase.js';

const app = express();

app.post('/api/script/generate', async (req, res) => {
  const useCase = container.resolve('generateScriptUseCase');
  const result = await useCase.execute(req.body);
  res.json(result);
});

app.listen(5001, () => console.log('Script service on port 5001'));
```

```javascript
// services/video-service/src/server.js
import express from 'express';
import { ProcessVideoUseCase } from './use-cases/ProcessVideoUseCase.js';

const app = express();

app.post('/api/video/process', async (req, res) => {
  const useCase = container.resolve('processVideoUseCase');
  const result = await useCase.execute(req.body);
  res.json(result);
});

app.listen(5002, () => console.log('Video service on port 5002'));
```

#### 3.2 Message Queue for Async Processing

```javascript
// infrastructure/messaging/RabbitMQPublisher.js
import amqp from 'amqplib';

export class RabbitMQPublisher {
  constructor({ config, logger }) {
    this.config = config;
    this.logger = logger;
    this.connection = null;
    this.channel = null;
  }

  async init() {
    this.connection = await amqp.connect(this.config.rabbitmq.url);
    this.channel = await this.connection.createChannel();
    await this.channel.assertQueue('video-processing', { durable: true });
    this.logger.info('RabbitMQ publisher initialized');
  }

  async publishVideoJob(job) {
    const message = JSON.stringify(job);
    this.channel.sendToQueue('video-processing', Buffer.from(message), {
      persistent: true
    });
    this.logger.info('Video job published', { jobId: job.id });
  }
}

// infrastructure/messaging/RabbitMQConsumer.js
export class RabbitMQConsumer {
  constructor({ processVideoUseCase, logger }) {
    this.processVideoUseCase = processVideoUseCase;
    this.logger = logger;
  }

  async init() {
    this.connection = await amqp.connect(config.rabbitmq.url);
    this.channel = await this.connection.createChannel();
    await this.channel.assertQueue('video-processing', { durable: true });
    
    this.channel.consume('video-processing', async (msg) => {
      const job = JSON.parse(msg.content.toString());
      
      try {
        await this.processVideoUseCase.execute(job);
        this.channel.ack(msg);
      } catch (error) {
        this.logger.error('Video job failed', { error, jobId: job.id });
        this.channel.nack(msg, false, true);  // Requeue
      }
    });
    
    this.logger.info('RabbitMQ consumer listening...');
  }
}
```

#### 3.3 Cloud Storage (S3/Azure Blob)

```javascript
// infrastructure/storage/S3StorageAdapter.js
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

export class S3StorageAdapter {
  constructor({ config, logger }) {
    this.s3 = new S3Client({
      region: config.aws.region,
      credentials: {
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey
      }
    });
    this.bucket = config.aws.s3Bucket;
    this.logger = logger;
  }

  async uploadVideo(localPath, key) {
    const fileStream = fs.createReadStream(localPath);
    
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: fileStream,
      ContentType: 'video/mp4'
    });
    
    await this.s3.send(command);
    this.logger.info('Video uploaded to S3', { key });
    
    return `https://${this.bucket}.s3.amazonaws.com/${key}`;
  }

  async downloadVideo(key, localPath) {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key
    });
    
    const response = await this.s3.send(command);
    const writeStream = fs.createWriteStream(localPath);
    
    await new Promise((resolve, reject) => {
      response.Body.pipe(writeStream)
        .on('finish', resolve)
        .on('error', reject);
    });
    
    this.logger.info('Video downloaded from S3', { key });
  }
}
```

**Expected Improvements**:
- Throughput: 100x increase (distributed services)
- Latency: Consistent (async processing)
- Scalability: Near-infinite (horizontal scaling)
- Cost efficiency: Pay-per-use (cloud storage)

**Cost**:
- API Gateway: $100-200/month
- Microservices (4 services × 2 instances): $800/month
- RabbitMQ: $150/month (managed)
- S3 Storage: $50/TB/month
- PostgreSQL (replicated): $500/month
- Redis (cluster): $200/month

**Total**: ~$2,000/month for 10,000+ concurrent users

---

## 📈 Performance Optimization Strategies

### Strategy 1: Progressive Enhancement

```javascript
// application/use-cases/ProcessVideoUseCase.js

async execute(dto) {
  // 1. Return immediately with job ID (async processing)
  const jobId = generateId();
  
  // 2. Publish to message queue
  await this.messageQueue.publish({
    id: jobId,
    type: 'video-processing',
    data: dto
  });
  
  // 3. Return job ID for polling
  return { jobId, status: 'queued' };
}

// API endpoint for status polling
app.get('/api/jobs/:id', async (req, res) => {
  const status = await jobRepository.getStatus(req.params.id);
  res.json(status);
});
```

### Strategy 2: Smart Caching

```javascript
// Cache layers by access pattern
const cacheStrategy = {
  // L1: Memory - Hot data (last 5 minutes)
  l1: {
    ttl: 300,
    pattern: 'recent:*',
    maxSize: '500MB'
  },
  
  // L2: Redis - Warm data (last 24 hours)
  l2: {
    ttl: 86400,
    pattern: 'daily:*',
    maxSize: '10GB'
  },
  
  // L3: S3 - Cold data (archive)
  l3: {
    ttl: Infinity,
    pattern: 'archive:*'
  }
};
```

### Strategy 3: Database Sharding

```javascript
// Shard by project_id hash
const shard = (projectId) => {
  const hash = crypto.createHash('md5').update(projectId).digest('hex');
  const shardNumber = parseInt(hash.substring(0, 8), 16) % NUM_SHARDS;
  return `shard_${shardNumber}`;
};

// Route queries to correct shard
class ShardedProjectRepository {
  async findById(id) {
    const shardName = shard(id);
    const db = this.shards[shardName];
    return db.query('SELECT * FROM projects WHERE id = $1', [id]);
  }
}
```

---

## 🎯 Monitoring & Observability

### Metrics to Track

```javascript
// infrastructure/monitoring/MetricsCollector.js
import { Registry, Counter, Histogram, Gauge } from 'prom-client';

export class MetricsCollector {
  constructor() {
    this.register = new Registry();
    
    // Request metrics
    this.requestCounter = new Counter({
      name: 'http_requests_total',
      help: 'Total HTTP requests',
      labelNames: ['method', 'path', 'status'],
      registers: [this.register]
    });
    
    this.requestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration',
      labelNames: ['method', 'path'],
      buckets: [0.1, 0.5, 1, 2, 5, 10],
      registers: [this.register]
    });
    
    // Video processing metrics
    this.videoProcessingDuration = new Histogram({
      name: 'video_processing_duration_seconds',
      help: 'Video processing duration',
      labelNames: ['operation'],
      buckets: [1, 5, 10, 30, 60, 120],
      registers: [this.register]
    });
    
    // Queue metrics
    this.queueDepth = new Gauge({
      name: 'queue_depth',
      help: 'Current queue depth',
      labelNames: ['queue_name'],
      registers: [this.register]
    });
  }

  recordRequest(method, path, status, duration) {
    this.requestCounter.inc({ method, path, status });
    this.requestDuration.observe({ method, path }, duration);
  }

  recordVideoProcessing(operation, duration) {
    this.videoProcessingDuration.observe({ operation }, duration);
  }

  setQueueDepth(queueName, depth) {
    this.queueDepth.set({ queue_name: queueName }, depth);
  }

  async getMetrics() {
    return this.register.metrics();
  }
}
```

### Alerting Rules (Prometheus)

```yaml
# prometheus/alerts.yml
groups:
  - name: video_orchestrator
    interval: 30s
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} (>5%)"

      - alert: SlowVideoProcessing
        expr: histogram_quantile(0.95, video_processing_duration_seconds) > 60
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Video processing is slow"
          description: "P95 processing time is {{ $value }}s (>60s)"

      - alert: HighQueueDepth
        expr: queue_depth > 100
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Queue is backing up"
          description: "Queue depth is {{ $value }} (>100)"
```

---

## ✅ Scaling Checklist

### Before Scaling
- [ ] **Baseline metrics**: Document current performance
- [ ] **Identify bottlenecks**: CPU? Memory? I/O? Network?
- [ ] **Load testing**: Simulate target load
- [ ] **Monitoring**: Set up metrics collection
- [ ] **Alerting**: Configure alerts for key metrics

### During Scaling
- [ ] **Gradual rollout**: Scale incrementally (2x → 4x → 8x)
- [ ] **Monitor closely**: Watch for regressions
- [ ] **A/B testing**: Compare old vs new architecture
- [ ] **Rollback plan**: Be ready to revert

### After Scaling
- [ ] **Validate improvements**: Measure P50/P95/P99 latencies
- [ ] **Cost analysis**: Ensure ROI is positive
- [ ] **Documentation**: Update architecture diagrams
- [ ] **Post-mortem**: Document lessons learned

---

**Status**: ✅ **SCALABILITY GUIDE COMPLETE**

Acest ghid acoperă scalarea de la desktop (10 users) la cloud enterprise (10,000+ users) în 3 faze:
1. **Phase 1**: Vertical scaling (config only, $0)
2. **Phase 2**: Horizontal scaling (multi-process, ~$400/month)
3. **Phase 3**: Distributed architecture (microservices, ~$2,000/month)
