import { describe, it, expect, afterAll, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/server.js';
import fs from 'fs/promises';
import path from 'path';

const MOCK_AUDIO_DIR = path.join(process.cwd(), 'data', 'cache');
const MOCK_AUDIO_FILENAME = 'test-audio-for-subs.wav';
const MOCK_AUDIO_PATH = path.join(MOCK_AUDIO_DIR, MOCK_AUDIO_FILENAME);

describe('Subtitles API', () => {
  const generatedFiles = [];

  beforeAll(async () => {
    // Create a dummy audio file for the service to find
    await fs.mkdir(MOCK_AUDIO_DIR, { recursive: true });
    await fs.writeFile(MOCK_AUDIO_PATH, 'dummy audio content');
  });

  afterAll(async () => {
    // Cleanup generated files
    await fs.unlink(MOCK_AUDIO_PATH).catch(() => {});
    for (const file of generatedFiles) {
      await fs.unlink(file).catch(() => {});
    }
  });

  it('POST /subs/generate should create a valid SRT file', async () => {
    const outputFilename = `test-subs-${Date.now()}.srt`;
    
    // The service should find the mock audio file and then trigger the mock subtitle generation
    // if the whisper binary is not found, which is the case in this test env.
    const response = await request(app)
      .post('/subs/generate')
      .send({
        audioId: path.parse(MOCK_AUDIO_FILENAME).name, // Use the name of the mock audio file as the ID
        language: 'en',
        outputFilename
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.path).toContain(outputFilename);
    generatedFiles.push(response.body.data.path);

    const srtContent = await fs.readFile(response.body.data.path, 'utf-8');
    expect(srtContent).toContain('-->');
    expect(srtContent).toContain('Welcome to this video presentation');
  });

  it('POST /subs/format should convert SRT to VTT', async () => {
    const srtContent = "1\n00:00:01,000 --> 00:00:02,000\nHello world";
    const srtFilename = `test-format-${Date.now()}.srt`;
    const srtPath = path.join(process.cwd(), 'data', 'subs', srtFilename);
    await fs.mkdir(path.dirname(srtPath), { recursive: true });
    await fs.writeFile(srtPath, srtContent, 'utf-8');
    generatedFiles.push(srtPath);

    const response = await request(app)
      .post('/subs/format')
      .send({
        subtitleId: path.parse(srtFilename).name,
        format: 'vtt'
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.path).toContain('.vtt');
    generatedFiles.push(response.body.data.path);

    const vttContent = await fs.readFile(response.body.data.path, 'utf-8');
    expect(vttContent).toContain('WEBVTT');
    expect(vttContent).toContain('00:00:01.000 --> 00:00:02.000');
  });
});
