import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createContainer } from '../../apps/orchestrator/src/container/index.js';
import { createApp } from '../../apps/orchestrator/src/app.js';
import path from 'path';
import fs from 'fs/promises';
import { execa } from 'execa';

/**
 * E2E Test Suite: Output Media Validation
 * 
 * Tests the quality and format of the final exported video, audio, and subtitles.
 * 
 * Prerequisites:
 * - FFmpeg (with ffprobe) must be in the system's PATH or in the `tools/ffmpeg` directory.
 * - A sample background video and audio file must exist.
 * 
 * Test Flow:
 * 1. Manually run parts of the pipeline to generate assets (TTS, normalized audio).
 * 2. Call the /export/compile endpoint to create a final video.
 * 3. Use ffprobe to analyze the output video.
 * 4. Assert video properties (resolution, format, duration, bitrate).
 * 5. Assert audio properties (codec, sample rate, channels).
 * 6. Read and validate the subtitle file format.
 */

const FFMPEG_PATH = path.resolve(process.cwd(), 'tools', 'ffmpeg', 'bin', 'ffmpeg.exe');
const FFPROBE_PATH = path.resolve(process.cwd(), 'tools', 'ffmpeg', 'bin', 'ffprobe.exe');
const CACHE_DIR = path.resolve(process.cwd(), 'data', 'cache');
const ASSETS_DIR = path.resolve(process.cwd(), 'data', 'assets');


describe('Output Media Validation - E2E', () => {
  let app;
  let container;
  let baseUrl;
  let server;
  let testVideoPath;
  let testAudioPath;

  beforeAll(async () => {
    container = createContainer();
    app = createApp({ container });
    server = app.listen(0);
    const address = server.address();
    baseUrl = `http://127.0.0.1:${address.port}`;

    // Ensure cache directory exists
    await fs.mkdir(CACHE_DIR, { recursive: true });

    // Create a dummy background video and audio for testing
    testVideoPath = path.join(ASSETS_DIR, 'backgrounds', 'test-bg.mp4');
    testAudioPath = path.join(CACHE_DIR, 'test-audio.wav');

    // Create a silent 5-second video if it doesn't exist
    try {
      await fs.access(testVideoPath);
    } catch {
      await fs.mkdir(path.dirname(testVideoPath), { recursive: true });
      await execa(FFMPEG_PATH, [
        '-f', 'lavfi', '-i', 'color=c=black:s=1080x1920:r=30:d=5',
        '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo',
        '-shortest', '-y', testVideoPath
      ]);
    }

    // Create a silent 5-second audio file if it doesn't exist
    try {
      await fs.access(testAudioPath);
    } catch {
      await execa(FFMPEG_PATH, [
        '-f', 'lavfi', '-i', 'anullsrc=r=22050:cl=mono:d=5',
        '-y', testAudioPath
      ]);
    }
  });

  afterAll(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    // Optional: cleanup test files
    // await fs.unlink(testVideoPath).catch(() => {});
    // await fs.unlink(testAudioPath).catch(() => {});
  });

  it('should produce a video with correct technical specifications', async () => {
    // Step 1: Create a dummy subtitle file
    const subtitleText = "1\n00:00:01,000 --> 00:00:04,000\nHello, world!";
    const subtitlePath = path.join(CACHE_DIR, 'test.srt');
    await fs.writeFile(subtitlePath, subtitleText);

    // Step 2: Call the export endpoint
    const response = await fetch(`${baseUrl}/export/compile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        videoPath: testVideoPath,
        audioPath: testAudioPath,
        subtitlePath: subtitlePath,
        preset: 'tiktok', // Use a specific preset
        effects: {
          burnInSubtitles: true
        }
      })
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    const finalVideoPath = data.data.outputPath;

    expect(finalVideoPath).toBeTruthy();
    
    // Verify the file exists
    await expect(fs.access(finalVideoPath)).to.not.be.rejected;

    // Step 3: Use ffprobe to analyze the output file
    const { stdout } = await execa(FFPROBE_PATH, [
      '-v', 'error',
      '-print_format', 'json',
      '-show_format',
      '-show_streams',
      finalVideoPath
    ]);

    const probeData = JSON.parse(stdout);

    // Step 4: Assert video stream properties
    const videoStream = probeData.streams.find(s => s.codec_type === 'video');
    expect(videoStream).toBeDefined();
    expect(videoStream.codec_name).toBe('h264');
    expect(videoStream.width).toBe(1080);
    expect(videoStream.height).toBe(1920);
    expect(videoStream.display_aspect_ratio).toBe('9:16');
    expect(parseFloat(videoStream.duration)).toBeCloseTo(5.0, 1);

    // Check bitrate (TikTok preset is 8Mbps)
    const videoBitrate = parseInt(videoStream.bit_rate || probeData.format.bit_rate, 10);
    expect(videoBitrate).toBeGreaterThan(5_000_000); // 5 Mbps
    expect(videoBitrate).toBeLessThan(10_000_000); // 10 Mbps

    // Step 5: Assert audio stream properties
    const audioStream = probeData.streams.find(s => s.codec_type === 'audio');
    expect(audioStream).toBeDefined();
    expect(audioStream.codec_name).toBe('aac');
    expect(parseInt(audioStream.sample_rate, 10)).toBe(44100); // Should be resampled during mix
    expect(audioStream.channels).toBe(2); // Should be stereo
    expect(parseInt(audioStream.bit_rate, 10)).toBeGreaterThanOrEqual(128_000); // At least 128kbps

    // Step 6: Assert container format properties
    expect(probeData.format.format_name).toContain('mp4');
    expect(parseFloat(probeData.format.duration)).toBeCloseTo(5.0, 1);

    // Cleanup the exported file
    await fs.unlink(finalVideoPath).catch(() => {});
    await fs.unlink(subtitlePath).catch(() => {});
  }, 30000); // Increase timeout for media processing
});
