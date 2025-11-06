#!/usr/bin/env node
/**
 * Build script for Video Orchestrator backend
 * Simple copy operation since we're using Node.js modules directly
 */

import { mkdir, copyFile, readdir, stat } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const DIST = join(ROOT, 'dist');
const SRC = join(ROOT, 'src');

console.log('🏗️  Building Video Orchestrator Backend...\n');

async function copyDir(src, dest) {
  await mkdir(dest, { recursive: true });
  const entries = await readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await copyFile(srcPath, destPath);
    }
  }
}

try {
  // Clean dist directory
  console.log('📁 Creating dist directory...');
  await mkdir(DIST, { recursive: true });

  // Copy source files (we're using ES modules, no transpilation needed)
  console.log('📋 Copying source files...');
  await copyDir(SRC, join(DIST, 'src'));

  // Copy package.json
  console.log('📦 Copying package.json...');
  await copyFile(join(ROOT, 'package.json'), join(DIST, 'package.json'));

  console.log('\n✅ Build complete!');
  console.log(`📦 Output: ${DIST}`);
  console.log('\n💡 Start with: node dist/src/server.js\n');
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}
