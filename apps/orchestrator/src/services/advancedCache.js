import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { EventEmitter } from 'events';
import { logger } from '../utils/logger.js';

const CACHE_DIR = path.join(process.cwd(), 'data', 'cache');
const MEMORY_CACHE_SIZE = 100 * 1024 * 1024; // 100MB in memory
const DISK_CACHE_SIZE = 5 * 1024 * 1024 * 1024; // 5GB on disk
const MAX_CACHE_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days
const CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour

/**
 * Multi-Level Cache System with:
 * - L1: In-memory cache (LRU) for hot data
 * - L2: Disk cache for cold data
 * - L3: Streaming cache for large files
 * - Adaptive promotion/demotion between levels
 * - TTL and size-based eviction
 * - Cache warming and preloading
 */
export class AdvancedCache extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.cacheDir = options.cacheDir || CACHE_DIR;
    this.memoryLimit = options.memoryLimit || MEMORY_CACHE_SIZE;
    this.diskLimit = options.diskLimit || DISK_CACHE_SIZE;
    this.maxAge = options.maxAge || MAX_CACHE_AGE;
    
    // L1: Memory cache (LRU)
    this.memoryCache = new Map();
    this.memorySize = 0;
    this.memoryStats = { hits: 0, misses: 0, evictions: 0 };
    
    // L2: Disk cache index
    this.diskIndex = new Map();
    this.diskSize = 0;
    this.diskStats = { hits: 0, misses: 0, evictions: 0 };
    
    // Access tracking for adaptive caching
    this.accessFrequency = new Map();
    
    // Cleanup timer
    this.cleanupTimer = null;
  }

  /**
   * Initialize cache system
   */
  async init() {
    await fs.mkdir(this.cacheDir, { recursive: true });
    await this.loadDiskIndex();
    await this.startCleanupSchedule();
    
    logger.info('Advanced cache initialized', {
      memoryLimit: this.formatBytes(this.memoryLimit),
      diskLimit: this.formatBytes(this.diskLimit),
      maxAge: `${this.maxAge / (24 * 60 * 60 * 1000)} days`
    });
  }

  /**
   * Load disk cache index from persistent storage
   */
  async loadDiskIndex() {
    try {
      const indexPath = path.join(this.cacheDir, '.cache-index.json');
      const data = await fs.readFile(indexPath, 'utf-8');
      const entries = JSON.parse(data);
      
      for (const entry of entries) {
        this.diskIndex.set(entry.key, entry);
        this.diskSize += entry.size;
      }
      
      logger.info('Disk cache index loaded', {
        entries: this.diskIndex.size,
        size: this.formatBytes(this.diskSize)
      });
    } catch {
      logger.info('No disk cache index found, starting fresh');
    }
  }

  /**
   * Save disk cache index to persistent storage
   */
  async saveDiskIndex() {
    const indexPath = path.join(this.cacheDir, '.cache-index.json');
    const entries = Array.from(this.diskIndex.values());
    await fs.writeFile(indexPath, JSON.stringify(entries, null, 2));
  }

  /**
   * Generate cache key from type and parameters
   */
  generateKey(type, params) {
    const hash = crypto.createHash('sha256');
    hash.update(JSON.stringify({ type, ...params }));
    return `${type}_${hash.digest('hex').slice(0, 16)}`;
  }

  /**
   * Get value from cache (checks all levels)
   */
  async get(key) {
    // L1: Check memory cache
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry) {
      if (!this.isExpired(memoryEntry)) {
        this.memoryStats.hits++;
        this.recordAccess(key);
        this.promoteInMemory(key);
        
        logger.debug('Memory cache hit', { key, level: 'L1' });
        this.emit('cacheHit', { key, level: 'L1', size: memoryEntry.size });
        
        return memoryEntry.value;
      }
      // Expired in memory
      this.evictFromMemory(key);
    }
    
    // L2: Check disk cache
    const diskEntry = this.diskIndex.get(key);
    if (diskEntry) {
      if (!this.isExpired(diskEntry)) {
        this.diskStats.hits++;
        this.recordAccess(key);
        
        try {
          const data = await fs.readFile(diskEntry.path, 'utf-8');
          const value = JSON.parse(data);
          
          logger.debug('Disk cache hit', { key, level: 'L2' });
          this.emit('cacheHit', { key, level: 'L2', size: diskEntry.size });
          
          // Promote to memory if frequently accessed
          if (this.shouldPromoteToMemory(key, diskEntry.size)) {
            await this.promoteToMemory(key, value, diskEntry);
          }
          
          return value;
        } catch (error) {
          logger.warn('Disk cache read failed', { key, error: error.message });
          await this.evictFromDisk(key);
        }
      } else {
        // Expired on disk
        await this.evictFromDisk(key);
      }
    }
    
    // Cache miss
    this.memoryStats.misses++;
    this.diskStats.misses++;
    this.emit('cacheMiss', { key });
    
    return null;
  }

  /**
   * Set value in cache (adaptive level selection)
   */
  async set(key, value, options = {}) {
    const metadata = {
      type: options.type || 'unknown',
      ...options.metadata
    };
    
    const serialized = JSON.stringify(value);
    const size = Buffer.byteLength(serialized);
    const now = Date.now();
    
    const entry = {
      key,
      value,
      size,
      timestamp: now,
      lastAccess: now,
      hits: 0,
      metadata,
      ttl: options.ttl || this.maxAge
    };

    // Decide caching strategy based on size and access pattern
    if (size <= this.memoryLimit / 10 || this.shouldCacheInMemory(key)) {
      // Small or hot data -> Memory cache
      await this.setInMemory(key, entry);
      logger.debug('Cached in memory', { key, size: this.formatBytes(size) });
      this.emit('cacheSet', { key, level: 'L1', size });
    } else {
      // Large or cold data -> Disk cache
      await this.setOnDisk(key, entry, serialized);
      logger.debug('Cached on disk', { key, size: this.formatBytes(size) });
      this.emit('cacheSet', { key, level: 'L2', size });
    }
  }

  /**
   * Set value in memory cache
   */
  async setInMemory(key, entry) {
    // Evict if necessary
    while (this.memorySize + entry.size > this.memoryLimit && this.memoryCache.size > 0) {
      await this.evictLRUFromMemory();
    }
    
    this.memoryCache.set(key, entry);
    this.memorySize += entry.size;
  }

  /**
   * Set value on disk cache
   */
  async setOnDisk(key, entry, serialized) {
    const filePath = path.join(this.cacheDir, `${key}.json`);
    await fs.writeFile(filePath, serialized);
    
    const diskEntry = {
      key,
      path: filePath,
      size: entry.size,
      timestamp: entry.timestamp,
      lastAccess: entry.lastAccess,
      hits: 0,
      metadata: entry.metadata,
      ttl: entry.ttl
    };
    
    this.diskIndex.set(key, diskEntry);
    this.diskSize += entry.size;
    
    await this.saveDiskIndex();
    await this.enforceQuota();
  }

  /**
   * Promote disk entry to memory cache
   */
  async promoteToMemory(key, value, diskEntry) {
    const entry = {
      key,
      value,
      size: diskEntry.size,
      timestamp: diskEntry.timestamp,
      lastAccess: Date.now(),
      hits: diskEntry.hits + 1,
      metadata: diskEntry.metadata,
      ttl: diskEntry.ttl
    };
    
    await this.setInMemory(key, entry);
    logger.debug('Promoted to memory', { key, hits: entry.hits });
    this.emit('cachePromotion', { key, from: 'L2', to: 'L1' });
  }

  /**
   * Promote entry to front of LRU in memory
   */
  promoteInMemory(key) {
    const entry = this.memoryCache.get(key);
    if (entry) {
      entry.lastAccess = Date.now();
      entry.hits++;
      this.memoryCache.delete(key);
      this.memoryCache.set(key, entry);
    }
  }

  /**
   * Evict least recently used entry from memory
   */
  async evictLRUFromMemory() {
    const entries = Array.from(this.memoryCache.entries());
    if (entries.length === 0) return;
    
    // Find LRU entry
    let lruKey = null;
    let lruTime = Infinity;
    
    for (const [key, entry] of entries) {
      if (entry.lastAccess < lruTime) {
        lruTime = entry.lastAccess;
        lruKey = key;
      }
    }
    
    if (lruKey) {
      const entry = this.memoryCache.get(lruKey);
      
      // Demote to disk if valuable
      if (entry.hits > 5) {
        await this.setOnDisk(lruKey, entry, JSON.stringify(entry.value));
        logger.debug('Demoted to disk', { key: lruKey, hits: entry.hits });
        this.emit('cacheDemotion', { key: lruKey, from: 'L1', to: 'L2' });
      }
      
      this.evictFromMemory(lruKey);
    }
  }

  /**
   * Evict entry from memory cache
   */
  evictFromMemory(key) {
    const entry = this.memoryCache.get(key);
    if (entry) {
      this.memoryCache.delete(key);
      this.memorySize -= entry.size;
      this.memoryStats.evictions++;
      this.emit('cacheEviction', { key, level: 'L1', size: entry.size });
    }
  }

  /**
   * Evict entry from disk cache
   */
  async evictFromDisk(key) {
    const entry = this.diskIndex.get(key);
    if (entry) {
      try {
        await fs.unlink(entry.path);
      } catch (error) {
        logger.debug('Failed to unlink cache file', { key, error: error.message });
      }
      
      this.diskIndex.delete(key);
      this.diskSize -= entry.size;
      this.diskStats.evictions++;
      this.emit('cacheEviction', { key, level: 'L2', size: entry.size });
      
      await this.saveDiskIndex();
    }
  }

  /**
   * Delete entry from all cache levels
   */
  async delete(key) {
    this.evictFromMemory(key);
    await this.evictFromDisk(key);
    this.accessFrequency.delete(key);
  }

  /**
   * Enforce disk quota with smart eviction
   */
  async enforceQuota() {
    if (this.diskSize <= this.diskLimit) return;
    
    logger.warn('Disk cache quota exceeded', {
      current: this.formatBytes(this.diskSize),
      limit: this.formatBytes(this.diskLimit)
    });
    
    // Score-based eviction: hits / age
    const entries = Array.from(this.diskIndex.values())
      .map(entry => ({
        ...entry,
        score: entry.hits / (Date.now() - entry.timestamp + 1)
      }))
      .sort((a, b) => a.score - b.score);
    
    let freedSpace = 0;
    let removed = 0;
    const target = this.diskLimit * 0.8; // Free to 80% capacity
    
    for (const entry of entries) {
      await this.evictFromDisk(entry.key);
      freedSpace += entry.size;
      removed++;
      
      if (this.diskSize <= target) break;
    }
    
    logger.info('Disk quota enforced', {
      removed,
      freedSpace: this.formatBytes(freedSpace),
      remaining: this.diskIndex.size
    });
  }

  /**
   * Check if entry is expired
   */
  isExpired(entry) {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  /**
   * Record access for adaptive caching
   */
  recordAccess(key) {
    const freq = this.accessFrequency.get(key) || { count: 0, lastAccess: 0 };
    freq.count++;
    freq.lastAccess = Date.now();
    this.accessFrequency.set(key, freq);
  }

  /**
   * Decide if key should be cached in memory
   */
  shouldCacheInMemory(key) {
    const freq = this.accessFrequency.get(key);
    return freq && freq.count > 3;
  }

  /**
   * Decide if disk entry should be promoted to memory
   */
  shouldPromoteToMemory(key, size) {
    if (size > this.memoryLimit / 5) return false; // Too large
    
    const freq = this.accessFrequency.get(key);
    return freq && freq.count > 5;
  }

  /**
   * Start periodic cleanup of expired entries
   */
  async startCleanupSchedule() {
    this.cleanupTimer = setInterval(async () => {
      await this.cleanupExpired();
    }, CLEANUP_INTERVAL);
  }

  /**
   * Clean up expired entries from all levels
   */
  async cleanupExpired() {
    let removed = 0;
    
    // Clean memory cache
    for (const [key, entry] of this.memoryCache.entries()) {
      if (this.isExpired(entry)) {
        this.evictFromMemory(key);
        removed++;
      }
    }
    
    // Clean disk cache
    for (const [key, entry] of this.diskIndex.entries()) {
      if (this.isExpired(entry)) {
        await this.evictFromDisk(key);
        removed++;
      }
    }
    
    if (removed > 0) {
      logger.info('Expired cache entries removed', { removed });
    }
  }

  /**
   * Clear all cache levels
   */
  async clear() {
    // Clear memory
    this.memoryCache.clear();
    this.memorySize = 0;
    
    // Clear disk
    for (const key of this.diskIndex.keys()) {
      await this.evictFromDisk(key);
    }
    
    // Clear access tracking
    this.accessFrequency.clear();
    
    logger.info('Cache cleared completely');
  }

  /**
   * Warm up cache with frequently accessed keys
   */
  async warmUp(keys) {
    logger.info('Warming up cache', { keys: keys.length });
    const promises = keys.map(async ({ key, fetcher }) => {
      const cached = await this.get(key);
      if (!cached && fetcher) {
        const value = await fetcher();
        await this.set(key, value);
      }
    });
    await Promise.all(promises);
  }

  /**
   * Get comprehensive cache statistics
   */
  getStats() {
    const memoryHitRate = this.memoryStats.hits + this.memoryStats.misses > 0
      ? ((this.memoryStats.hits / (this.memoryStats.hits + this.memoryStats.misses)) * 100).toFixed(2)
      : 0;
    
    const diskHitRate = this.diskStats.hits + this.diskStats.misses > 0
      ? ((this.diskStats.hits / (this.diskStats.hits + this.diskStats.misses)) * 100).toFixed(2)
      : 0;
    
    return {
      memory: {
        entries: this.memoryCache.size,
        size: this.formatBytes(this.memorySize),
        limit: this.formatBytes(this.memoryLimit),
        utilization: ((this.memorySize / this.memoryLimit) * 100).toFixed(2) + '%',
        hits: this.memoryStats.hits,
        misses: this.memoryStats.misses,
        evictions: this.memoryStats.evictions,
        hitRate: memoryHitRate + '%'
      },
      disk: {
        entries: this.diskIndex.size,
        size: this.formatBytes(this.diskSize),
        limit: this.formatBytes(this.diskLimit),
        utilization: ((this.diskSize / this.diskLimit) * 100).toFixed(2) + '%',
        hits: this.diskStats.hits,
        misses: this.diskStats.misses,
        evictions: this.diskStats.evictions,
        hitRate: diskHitRate + '%'
      },
      total: {
        entries: this.memoryCache.size + this.diskIndex.size,
        size: this.formatBytes(this.memorySize + this.diskSize),
        hits: this.memoryStats.hits + this.diskStats.hits,
        misses: this.memoryStats.misses + this.diskStats.misses
      }
    };
  }

  /**
   * Format bytes to human-readable string
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  }

  /**
   * Shutdown cache system
   */
  async shutdown() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    await this.saveDiskIndex();
    logger.info('Advanced cache shutdown complete');
  }
}

// Singleton instance
export const advancedCache = new AdvancedCache();
