import fs from 'fs/promises';
import path from 'path';
import fetch from 'node-fetch';
import FormData from 'form-data';

export class KapwingService {
  constructor({ logger, config }) {
    this.logger = logger;
    this.apiKey = config.KAPWING_API_KEY;
    this.baseUrl = 'https://api.kapwing.com/v1';
    this.pollInterval = 5000; // 5 seconds
  }

  async createProject(options) {
    const { name, width = 1080, height = 1920, duration = 60 } = options;
    
    this.logger.info('Creating Kapwing project', { name, width, height });

    try {
      const response = await fetch(`${this.baseUrl}/projects`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: name || 'Video Orchestrator Project',
          width,
          height,
          duration
        })
      });

      if (!response.ok) {
        throw new Error(`Kapwing API error: ${response.statusText}`);
      }

      const data = await response.json();
      this.logger.info('Kapwing project created', { projectId: data.id });
      
      return data;
    } catch (error) {
      this.logger.error('Failed to create Kapwing project', { error: error.message });
      throw error;
    }
  }

  async uploadFile(filePath) {
    this.logger.info('Uploading file to Kapwing', { filePath });

    try {
      const formData = new FormData();
      formData.append('file', await fs.readFile(filePath), path.basename(filePath));

      const response = await fetch(`${this.baseUrl}/files`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${this.apiKey}` },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      this.logger.info('File uploaded to Kapwing', { fileId: data.id });
      
      return data.url;
    } catch (error) {
      this.logger.error('Failed to upload file', { error: error.message });
      throw error;
    }
  }

  async addLayer(projectId, layer) {
    this.logger.debug('Adding layer to Kapwing project', { projectId, type: layer.type });

    try {
      const response = await fetch(`${this.baseUrl}/projects/${projectId}/layers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(layer)
      });

      if (!response.ok) {
        throw new Error(`Failed to add layer: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      this.logger.error('Failed to add layer', { error: error.message });
      throw error;
    }
  }

  async smartResize(videoUrl, targetRatio = '9:16') {
    this.logger.info('Smart resizing video', { targetRatio });

    try {
      const response = await fetch(`${this.baseUrl}/resize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          videoUrl,
          aspectRatio: targetRatio,
          smartCrop: true,
          trackSubject: true,
          fillMethod: 'blur'
        })
      });

      if (!response.ok) {
        throw new Error(`Resize failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.jobId;
    } catch (error) {
      this.logger.error('Failed to resize video', { error: error.message });
      throw error;
    }
  }

  async addSubtitles(projectId, subtitles, style = 'tiktok-viral') {
    this.logger.info('Adding subtitles to Kapwing project', { projectId, style });

    try {
      const layer = {
        type: 'text',
        content: subtitles,
        style: {
          preset: style,
          wordHighlight: true,
          animation: 'fade-in',
          position: 'bottom-center'
        }
      };

      return await this.addLayer(projectId, layer);
    } catch (error) {
      this.logger.error('Failed to add subtitles', { error: error.message });
      throw error;
    }
  }

  async renderVideo(projectId, quality = '1080p') {
    this.logger.info('Rendering Kapwing video', { projectId, quality });

    try {
      const response = await fetch(`${this.baseUrl}/projects/${projectId}/render`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quality })
      });

      if (!response.ok) {
        throw new Error(`Render failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.jobId;
    } catch (error) {
      this.logger.error('Failed to render video', { error: error.message });
      throw error;
    }
  }

  async getJobStatus(jobId) {
    try {
      const response = await fetch(`${this.baseUrl}/jobs/${jobId}`, {
        headers: { 'Authorization': `Bearer ${this.apiKey}` }
      });

      if (!response.ok) {
        throw new Error(`Failed to get status: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        status: data.status,
        progress: data.progress || 0,
        videoUrl: data.outputUrl
      };
    } catch (error) {
      this.logger.error('Failed to get job status', { jobId, error: error.message });
      throw error;
    }
  }

  async waitForCompletion(jobId, maxWaitTime = 600000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      const status = await this.getJobStatus(jobId);
      
      if (status.status === 'completed') {
        return status;
      }
      
      if (status.status === 'failed') {
        throw new Error('Kapwing job failed');
      }
      
      this.logger.debug('Waiting for Kapwing job', { jobId, progress: status.progress });
      await new Promise(resolve => setTimeout(resolve, this.pollInterval));
    }
    
    throw new Error('Kapwing job timeout');
  }

  async downloadVideo(jobId, outputPath) {
    this.logger.info('Downloading Kapwing video', { jobId });

    try {
      const status = await this.waitForCompletion(jobId);
      
      if (!status.videoUrl) {
        throw new Error('No video URL available');
      }

      const response = await fetch(status.videoUrl);
      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      const buffer = await response.arrayBuffer();
      await fs.writeFile(outputPath, Buffer.from(buffer));
      
      this.logger.info('Kapwing video downloaded', { outputPath });
      return outputPath;
    } catch (error) {
      this.logger.error('Failed to download Kapwing video', { error: error.message });
      throw error;
    }
  }

  async batchProcess(videos, template) {
    this.logger.info('Starting Kapwing batch processing', { count: videos.length });

    try {
      const jobs = await Promise.all(
        videos.map(async (video) => {
          const project = await this.createProject({
            name: video.name,
            width: template.width,
            height: template.height
          });

          for (const layer of template.layers) {
            await this.addLayer(project.id, { ...layer, source: video[layer.sourceKey] });
          }

          const jobId = await this.renderVideo(project.id);
          return { videoId: video.id, jobId };
        })
      );

      this.logger.info('Batch processing started', { jobs: jobs.length });
      return jobs;
    } catch (error) {
      this.logger.error('Failed to start batch processing', { error: error.message });
      throw error;
    }
  }
}
