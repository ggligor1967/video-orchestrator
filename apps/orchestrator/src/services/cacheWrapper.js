import { cacheService as baseCache } from './cacheService.js';
import { memoryManager } from '../utils/memoryManager.js';

// Wrap existing cache service to add approximate size tracking and periodic cleanup
export const createCacheWrapper = ({ logger, maxEntries = 200, cleanupIntervalMs = 60_000 }) => {
  const cache = baseCache;
  cache._meta = cache._meta || { approxSize: 0, entries: 0 };

  // Safe get/set wrappers that update counters
  const origSet = cache.set.bind(cache);
  const origDelete = cache.delete ? cache.delete.bind(cache) : null;

  cache.set = async (key, value, opts = {}) => {
    try {
      // attempt to compute rough size
      let size = 0;
      try { size = Buffer.byteLength(JSON.stringify(value)); } catch (e) { size = 0; }
      cache._meta.approxSize += size;
      cache._meta.entries = (cache._meta.entries || 0) + 1;
    } catch (e) {
      // ignore
    }
    await origSet(key, value, opts);
    // enforce max entries
    if (cache._meta.entries > maxEntries) {
      try { await cache.enforceQuota && cache.enforceQuota(); } catch (e) { /* ignore */ }
    }
  };

  if (origDelete) {
    cache.delete = async (key) => {
      try { cache._meta.entries = Math.max(0, (cache._meta.entries || 1) - 1); } catch (e) { /* ignore */ }
      return await origDelete(key);
    };
  }

  // periodic cleanup to avoid stale growth
  cache._cleanupHandle = setInterval(async () => {
    try {
      await cache.cleanupExpired && cache.cleanupExpired();
      // small safeguard: if memory pressure high, enforce more aggressive eviction
      const mem = memoryManager.getMemoryUsage();
      if (mem.percentage > 80) {
        await cache.enforceQuota && cache.enforceQuota();
      }
    } catch (err) {
      logger && logger.error && logger.error('CacheWrapper cleanup error', { error: err.message });
    }
  }, cleanupIntervalMs);

  cache.destroy = () => {
    if (cache._cleanupHandle) {
      clearInterval(cache._cleanupHandle);
      cache._cleanupHandle = null;
    }
  };

  cache.getStats = cache.getStats || (() => ({ entries: cache._meta.entries || 0, approxSize: cache._meta.approxSize || 0 }));

  return cache;
};

export default createCacheWrapper;
