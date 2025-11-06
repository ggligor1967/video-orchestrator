import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { logger } from '../utils/logger.js';

const CACHE_DIR = path.join(process.cwd(), 'data', 'cache');
const CACHE_INDEX = new Map(); // In-memory index for fast lookups
const MAX_CACHE_SIZE = 1 * 1024 * 1024 * 1024; // 1GB (reduced from 5GB)
const MAX_CACHE_AGE = 2 * 24 * 60 * 60 * 1000; // 2 days (reduced from 7)
const MAX_CACHE_ENTRIES = 1000; // Limit number of entries

export const cacheService = {
  async init() {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    await this.loadCacheIndex();
    logger.info('Cache service initialized', { cacheDir: CACHE_DIR });
  },

  async loadCacheIndex() {
    try {
      const indexPath = path.join(CACHE_DIR, '.cache-index.json');
      const data = await fs.readFile(indexPath, 'utf-8');
      const entries = JSON.parse(data);
      entries.forEach(entry => CACHE_INDEX.set(entry.key, entry));
      logger.info('Cache index loaded', { entries: CACHE_INDEX.size });
    } catch {
      logger.info('No cache index found, starting fresh');
    }
  },

  async saveCacheIndex() {
    const indexPath = path.join(CACHE_DIR, '.cache-index.json');
    const entries = Array.from(CACHE_INDEX.values());
    await fs.writeFile(indexPath, JSON.stringify(entries, null, 2));
  },

  generateKey(type, params) {
    const hash = crypto.createHash('sha256');
    hash.update(JSON.stringify({ type, ...params }));
    return `${type}_${hash.digest('hex').substring(0, 16)}`;
  },

  async get(key) {
    const entry = CACHE_INDEX.get(key);
    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > MAX_CACHE_AGE) {
      await this.delete(key);
      return null;
    }

    try {
      const data = await fs.readFile(entry.path, 'utf-8');
      entry.hits++;
      entry.lastAccess = Date.now();
      logger.debug('Cache hit', { key, hits: entry.hits });
      return JSON.parse(data);
    } catch {
      await this.delete(key);
      return null;
    }
  },

  async set(key, value, metadata = {}) {
    const filePath = path.join(CACHE_DIR, `${key}.json`);
    await fs.writeFile(filePath, JSON.stringify(value, null, 2));

    const entry = {
      key,
      path: filePath,
      timestamp: Date.now(),
      lastAccess: Date.now(),
      hits: 0,
      size: Buffer.byteLength(JSON.stringify(value)),
      metadata
    };

    CACHE_INDEX.set(key, entry);
    await this.saveCacheIndex();
    await this.enforceQuota();

    logger.debug('Cache set', { key, size: entry.size });
  },

  async delete(key) {
    const entry = CACHE_INDEX.get(key);
    if (!entry) return;

    try {
      await fs.unlink(entry.path);
    } catch (error) {
      // File may have already been deleted, ignore error
      logger.debug('Failed to delete cache file', { key, error: error.message });
    }
    
    CACHE_INDEX.delete(key);
    await this.saveCacheIndex();
  },

  async enforceQuota() {
    const entries = Array.from(CACHE_INDEX.values());
    const totalSize = entries.reduce((sum, entry) => sum + entry.size, 0);
    const entryCount = entries.length;

    // Check both size and entry count limits
    if (totalSize <= MAX_CACHE_SIZE && entryCount <= MAX_CACHE_ENTRIES) return;

    logger.warn('Cache quota exceeded', { totalSize, maxSize: MAX_CACHE_SIZE });

    // LRU eviction with score (hits / age) - prioritize removing old, unused entries
    const sortedEntries = entries.sort((a, b) => {
      const ageA = Date.now() - a.lastAccess;
      const ageB = Date.now() - b.lastAccess;
      const scoreA = a.hits / Math.max(ageA, 1);
      const scoreB = b.hits / Math.max(ageB, 1);
      return scoreA - scoreB;
    });

    let freedSpace = 0;
    let removed = 0;
    
    const targetSize = MAX_CACHE_SIZE * 0.7; // More aggressive cleanup
    const targetEntries = MAX_CACHE_ENTRIES * 0.8;
    
    for (const entry of sortedEntries) {
      await this.delete(entry.key);
      freedSpace += entry.size;
      removed++;
      
      const remainingSize = totalSize - freedSpace;
      const remainingEntries = entryCount - removed;
      
      if (remainingSize <= targetSize && remainingEntries <= targetEntries) {
        break;
      }
    }

    logger.info('Cache quota enforced', { removed, freedSpace, remaining: CACHE_INDEX.size });
  },

  async cleanupExpired() {
    const now = Date.now();
    let removed = 0;
    
    for (const entry of CACHE_INDEX.values()) {
      if (now - entry.timestamp > MAX_CACHE_AGE) {
        await this.delete(entry.key);
        removed++;
      }
    }
    
    if (removed > 0) {
      logger.info('Expired cache entries removed', { removed });
    }
    
    return removed;
  },

  async clear() {
    for (const key of CACHE_INDEX.keys()) {
      await this.delete(key);
    }
    logger.info('Cache cleared');
  },

  getStats() {
    const entries = Array.from(CACHE_INDEX.values());
    return {
      entries: entries.length,
      totalSize: entries.reduce((sum, e) => sum + e.size, 0),
      totalHits: entries.reduce((sum, e) => sum + e.hits, 0),
      oldestEntry: Math.min(...entries.map(e => e.timestamp)),
      newestEntry: Math.max(...entries.map(e => e.timestamp))
    };
  }
};
