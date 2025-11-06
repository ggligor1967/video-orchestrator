import fs from 'fs/promises';
import path from 'path';
import https from 'https';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { execSync } from 'child_process';

const TOOLS_DIR = './tools';

async function downloadFile(url, outputPath) {
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  
  return new Promise((resolve, reject) => {
    const file = createWriteStream(outputPath);
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        return downloadFile(response.headers.location, outputPath).then(resolve).catch(reject);
      }
      pipeline(response, file).then(resolve).catch(reject);
    }).on('error', reject);
  });
}

async function extractZip(zipPath, extractTo) {
  try {
    execSync(`powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${extractTo}' -Force"`, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Failed to extract ${zipPath}:`, error.message);
    throw error;
  }
}

// 1. Download and setup FFmpeg
async function setupFFmpeg() {
  console.log('Setting up FFmpeg...');
  const zipPath = path.join(TOOLS_DIR, 'ffmpeg-release-essentials.zip');
  
  await downloadFile('https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip', zipPath);
  await extractZip(zipPath, path.join(TOOLS_DIR, 'ffmpeg'));
  
  // Move binaries to bin directory
  const extractedDir = await fs.readdir(path.join(TOOLS_DIR, 'ffmpeg'));
  const ffmpegDir = extractedDir.find(dir => dir.startsWith('ffmpeg-'));
  
  if (ffmpegDir) {
    const binSource = path.join(TOOLS_DIR, 'ffmpeg', ffmpegDir, 'bin');
    const binTarget = path.join(TOOLS_DIR, 'ffmpeg', 'bin');
    
    await fs.mkdir(binTarget, { recursive: true });
    const binFiles = await fs.readdir(binSource);
    
    for (const file of binFiles) {
      await fs.copyFile(path.join(binSource, file), path.join(binTarget, file));
    }
  }
  
  await fs.unlink(zipPath);
  console.log('✅ FFmpeg setup complete');
}

// 2. Setup Piper TTS
async function setupPiper() {
  console.log('Setting up Piper TTS...');
  const zipPath = path.join(TOOLS_DIR, 'piper-windows.zip');
  
  await downloadFile('https://github.com/rhasspy/piper/releases/download/v1.2.0/piper_windows_amd64.tar.gz', zipPath);
  await extractZip(zipPath, path.join(TOOLS_DIR, 'piper'));
  
  await fs.unlink(zipPath);
  console.log('✅ Piper setup complete');
}

async function downloadModels(models) {
  console.log('Downloading voice models...');
  
  for (const model of models) {
    if (model === 'en_US-libritts') {
      await downloadFile(
        'https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/libritts/high/en_US-libritts-high.onnx',
        path.join(TOOLS_DIR, 'piper/models/en_US-libritts-high.onnx')
      );
      await downloadFile(
        'https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/libritts/high/en_US-libritts-high.onnx.json',
        path.join(TOOLS_DIR, 'piper/models/en_US-libritts-high.onnx.json')
      );
    }
    
    if (model === 'ro_RO-mihai') {
      await downloadFile(
        'https://huggingface.co/rhasspy/piper-voices/resolve/main/ro/ro_RO/mihai/medium/ro_RO-mihai-medium.onnx',
        path.join(TOOLS_DIR, 'piper/models/ro_RO-mihai-medium.onnx')
      );
      await downloadFile(
        'https://huggingface.co/rhasspy/piper-voices/resolve/main/ro/ro_RO/mihai/medium/ro_RO-mihai-medium.onnx.json',
        path.join(TOOLS_DIR, 'piper/models/ro_RO-mihai-medium.onnx.json')
      );
    }
  }
  
  console.log('✅ Voice models downloaded');
}

// 3. Setup Whisper.cpp
async function setupWhisper() {
  console.log('Setting up Whisper.cpp...');
  const zipPath = path.join(TOOLS_DIR, 'whisper-cpp-windows.zip');
  
  await downloadFile('https://github.com/ggerganov/whisper.cpp/releases/download/v1.5.4/whisper-bin-x64.zip', zipPath);
  await extractZip(zipPath, path.join(TOOLS_DIR, 'whisper'));
  
  await fs.unlink(zipPath);
  console.log('✅ Whisper.cpp setup complete');
}

async function downloadWhisperModel(model) {
  console.log(`Downloading Whisper model: ${model}...`);
  
  await downloadFile(
    `https://huggingface.co/ggerganov/whisper.cpp/resolve/main/${model}`,
    path.join(TOOLS_DIR, `whisper/models/${model}`)
  );
  
  console.log(`✅ ${model} downloaded`);
}

// Main setup function
async function setupAllTools() {
  try {
    await fs.mkdir(TOOLS_DIR, { recursive: true });
    
    await setupFFmpeg();
    await setupPiper();
    await downloadModels(['en_US-libritts', 'ro_RO-mihai']);
    await setupWhisper();
    await downloadWhisperModel('ggml-base.bin');
    
    console.log('\n🎉 All tools setup complete!');
    console.log('Run health check: node scripts/healthCheck.js');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  setupAllTools();
}

export { setupFFmpeg, setupPiper, downloadModels, setupWhisper, downloadWhisperModel };