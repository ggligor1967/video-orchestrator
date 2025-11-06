import fs from 'fs/promises';
import path from 'path';
import fetch from 'node-fetch';

export class PictoryService {
  constructor({ logger, config }) {
    this.logger = logger;
    this.apiKey = config.PICTORY_API_KEY;
    this.baseUrl = 'https://api.pictory.ai/pictoryapis/v1';
    this.pollInterval = 10000; // 10 seconds
  }

  async createVideoFromScript(options) {
    const { script, voiceId, aspectRatio = '9:16', brandKit, name } = options;
    
    this.logger.info('Creating Pictory video from script', { name, aspectRatio });

    try {
      const response = await fetch(`${this.baseUrl}/video/storyboard`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          videoName: name || 'Video Orchestrator Export',
          language: 'en',
          scenes: this.scriptToScenes(script),
          aspectRatio: aspectRatio,
          voiceOver: voiceId || 'auto',
          backgroundMusic: true,
          autoHighlight: true
        })
      });

      if (!response.ok) {
        throw new Error(`Pictory API error: ${response.statusText}`);
      }

      const data = await response.json();
      this.logger.info('Pictory video job created', { jobId: data.data.id });

      return {
        jobId: data.data.id,
        status: 'processing',
        estimatedTime: 180
      };
    } catch (error) {
      this.logger.error('Failed to create Pictory video', { error: error.message });
      throw error;
    }
  }

  scriptToScenes(script) {
    const sentences = script.split(/[.!?]+/).filter(s => s.trim().length > 0);
    return sentences.map((text, index) => ({
      sceneNumber: index + 1,
      text: text.trim(),
      duration: Math.max(3, Math.min(10, text.length / 15))
    }));
  }

  async getVideoStatus(jobId) {
    try {
      const response = await fetch(`${this.baseUrl}/video/${jobId}`, {
        headers: { 'Authorization': `Bearer ${this.apiKey}` }
      });

      if (!response.ok) {
        throw new Error(`Failed to get status: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        status: data.data.status,
        progress: data.data.progress || 0,
        downloadUrl: data.data.videoUrl
      };
    } catch (error) {
      this.logger.error('Failed to get Pictory status', { jobId, error: error.message });
      throw error;
    }
  }

  async waitForCompletion(jobId, maxWaitTime = 600000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      const status = await this.getVideoStatus(jobId);
      
      if (status.status === 'completed') {
        return status;
      }
      
      if (status.status === 'failed') {
        throw new Error('Pictory video generation failed');
      }
      
      this.logger.debug('Waiting for Pictory video', { jobId, progress: status.progress });
      await new Promise(resolve => setTimeout(resolve, this.pollInterval));
    }
    
    throw new Error('Pictory video generation timeout');
  }

  async downloadVideo(jobId, outputPath) {
    this.logger.info('Downloading Pictory video', { jobId });

    try {
      const status = await this.waitForCompletion(jobId);
      
      if (!status.downloadUrl) {
        throw new Error('No download URL available');
      }

      const response = await fetch(status.downloadUrl);
      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      const buffer = await response.arrayBuffer();
      await fs.writeFile(outputPath, Buffer.from(buffer));
      
      this.logger.info('Pictory video downloaded', { outputPath });
      return outputPath;
    } catch (error) {
      this.logger.error('Failed to download Pictory video', { error: error.message });
      throw error;
    }
  }

  async searchStockFootage(query, count = 10) {
    this.logger.info('Searching Pictory stock footage', { query, count });

    try {
      const response = await fetch(`${this.baseUrl}/video/search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query, limit: count })
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data.videos || [];
    } catch (error) {
      this.logger.error('Failed to search stock footage', { error: error.message });
      throw error;
    }
  }
}
