import { beforeEach, describe, expect, it, vi } from 'vitest';
import { pipelineService } from '../../apps/orchestrator/src/services/pipelineService.js';
import { videoService } from '../../apps/orchestrator/src/services/videoService.js';
import { ttsService } from '../../apps/orchestrator/src/services/ttsService.js';
import { subsService } from '../../apps/orchestrator/src/services/subsService.js';
import { exportService } from '../../apps/orchestrator/src/services/exportService.js';
import { assetsService } from '../../apps/orchestrator/src/services/assetsService.js';

const makeVideo = (id: string) => ({
  id,
  path: `/tmp/${id}.mp4`,
  relativePath: `/static/${id}.mp4`,
  duration: 15,
  width: 1080,
  height: 1920,
  processedAt: new Date().toISOString()
});

const waitForJob = async (jobId: string) => {
  for (let attempt = 0; attempt < 30; attempt++) {
    const status = await pipelineService.getJobStatus(jobId);
    if (status.isCompleted || status.isFailed) {
      return status;
    }
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  throw new Error('Pipeline job did not settle in time');
};

describe('pipelineService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('runs the happy-path pipeline and records results', async () => {
    vi.spyOn(assetsService, 'getBackgroundInfo').mockResolvedValue({
      id: 'bg-1',
      filename: 'bg-1.mp4',
      path: '/static/assets/backgrounds/bg-1.mp4',
      size: 1024,
      createdAt: new Date(),
      duration: 60,
      width: 1920,
      height: 1080,
      aspectRatio: '1920:1080',
      bitrate: 5000,
      fps: 30,
      codec: 'h264'
    });
    vi.spyOn(videoService, 'cropToVertical').mockResolvedValue(makeVideo('cropped'));
    vi.spyOn(videoService, 'applySpeedRamp').mockResolvedValue(makeVideo('processed'));
    vi.spyOn(ttsService, 'generateSpeech').mockResolvedValue({
      id: 'tts-1',
      path: '/tmp/tts.wav',
      relativePath: '/static/tts.wav',
      voice: 'voice-a',
      speed: 1,
      textLength: 120,
      generatedAt: new Date().toISOString()
    });
    vi.spyOn(subsService, 'generateSubtitles').mockResolvedValue({
      id: 'subs-1',
      path: '/tmp/subs.srt',
      relativePath: '/static/subs.srt',
      audioId: 'tts-1', // Fix: Added missing audioId
      language: 'en',
      format: 'srt',
      generatedAt: new Date().toISOString()
    });
    vi.spyOn(exportService, 'compileVideo').mockResolvedValue({
      id: 'final-1',
      path: '/tmp/final.mp4',
      relativePath: '/static/final.mp4',
      preset: { platform: 'tiktok' },
      fileSize: 1024,
      duration: 60,
      width: 1080,
      height: 1920,
      hasAudio: true,
      hasSubtitles: true,
      effects: {},
      compiledAt: new Date().toISOString()
    });

    const { jobId, status } = await pipelineService.buildCompleteVideo({
      script: 'A chilling story unfolds in an abandoned manor after dark.',
      backgroundId: 'bg-1',
      voice: 'voice-a',
      preset: 'tiktok',
      audioPath: '/tmp/tts.wav', 
      subtitlePath: '/tmp/subs.srt', // Provide subtitle path to satisfy validator
      options: {
        addProgressBar: true,
        partBadge: 'Part 1',
        // generateSubtitles is implicitly true when subtitlePath is provided for compilation
      }
    });

    expect(status).toBe('started');
    const jobStatus = await waitForJob(jobId);

    expect(jobStatus.isCompleted).toBe(true);
    expect(jobStatus.results?.finalVideo.id).toBe('final-1'); // Corrected from 'result'
    expect(exportService.compileVideo).toHaveBeenCalledWith(
      expect.objectContaining({
        preset: 'tiktok',
        subtitleId: 'subs-1'
      })
    );
  });

  it('marks the job as failed when a stage throws', async () => {
    vi.spyOn(assetsService, 'getBackgroundInfo').mockResolvedValue({
      id: 'bg-fail',
      filename: 'bg-fail.mp4',
      path: '/static/assets/backgrounds/bg-fail.mp4',
      size: 1024,
      createdAt: new Date(),
      duration: 60,
      width: 1920,
      height: 1080,
      aspectRatio: '1920:1080',
      bitrate: 5000,
      fps: 30,
      codec: 'h264'
    });
    vi.spyOn(videoService, 'cropToVertical').mockRejectedValue(new Error('ffmpeg failure'));

    const { jobId } = await pipelineService.buildCompleteVideo({
      script: 'Another mysterious script that will trigger a failure.',
      backgroundId: 'bg-fail',
      voice: 'voice-b',
      preset: 'tiktok',
      audioPath: '/tmp/some-audio.wav', // Provide dummy path to pass validation
      subtitlePath: '/tmp/subs.srt', // Provide dummy path to pass validation
      options: {
        generateSubtitles: false,
        speedRamp: false
      }
    });

    const jobStatus = await waitForJob(jobId);

    expect(jobStatus.isFailed).toBe(true);
    expect(jobStatus.error).toBe('ffmpeg failure');
  });

  it('calculates duration metadata correctly', () => {
    const start = new Date('2025-01-01T10:00:00Z').toISOString();
    const end = new Date('2025-01-01T10:02:05Z').toISOString();

    const duration = pipelineService.calculateDuration(start, end);

    expect(duration).toEqual({
      ms: 125000,
      seconds: 125,
      formatted: '2:05'
    });
  });
});
