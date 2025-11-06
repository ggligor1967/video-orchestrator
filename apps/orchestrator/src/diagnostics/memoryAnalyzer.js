import fs from 'fs';
import path from 'path';
import { memoryManager } from '../utils/memoryManager.js';

// Lightweight memory analyzer: captures basic usage and can write a simple heap snapshot
export const createMemoryAnalyzer = ({ _logger, snapshotDir }) => {
  const snapshots = snapshotDir || path.resolve(process.cwd(), 'data', 'cache', 'snapshots');

  if (!fs.existsSync(snapshots)) {
    try { fs.mkdirSync(snapshots, { recursive: true }); } catch (e) {
      // ignore
    }
  }

  const takeSnapshot = async (label = '') => {
    const usage = memoryManager.getMemoryUsage();
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = path.join(snapshots, `mem-${label || 'snap'}-${ts}.json`);
    const payload = {
      ts: new Date().toISOString(),
      usage,
      pid: process.pid
    };
    try {
      await fs.promises.writeFile(filename, JSON.stringify(payload, null, 2));
      return { ok: true, path: filename };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  };

  const summary = () => {
    const usage = memoryManager.getMemoryUsage();
    return {
      pid: process.pid,
      rssMB: Math.round(usage.rss / 1024 / 1024),
      heapUsedMB: Math.round(usage.heapUsed / 1024 / 1024),
      heapTotalMB: Math.round(usage.heapTotal / 1024 / 1024),
      percentOfSystem: Number(usage.percentage.toFixed(2))
    };
  };

  return { takeSnapshot, summary };
};

export default createMemoryAnalyzer;
