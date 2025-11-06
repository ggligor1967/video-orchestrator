import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { pipeline } from 'stream/promises';
import { createWriteStream } from 'fs';

/**
 * Stock Media Service
 *
 * Integrates with Pexels and Pixabay APIs to search and download
 * royalty-free stock videos for use in video projects.
 *
 * Features:
 * - Search videos from multiple providers (Pexels, Pixabay)
 * - Download and cache videos locally
 * - AI-powered suggestions based on script content
 * - Video metadata and licensing information
 */
export class StockMediaService {
  constructor({ logger, config, aiService }) {
    this.logger = logger;
    this.config = config;
    this.aiService = aiService;

    // API Keys from environment variables
    this.pexelsApiKey = config.PEXELS_API_KEY;
    this.pixabayApiKey = config.PIXABAY_API_KEY;

    // API Endpoints
    this.pexelsBaseUrl = 'https://api.pexels.com/videos';
    this.pixabayBaseUrl = 'https://pixabay.com/api/videos/';

    // Cache directory for downloaded videos
    this.cacheDir = path.join(process.cwd(), 'data', 'cache', 'stock-videos');

    // Initialize cache directory
    this.initializeCacheDir();
  }

  async initializeCacheDir() {
    try {
      await fs.mkdir(this.cacheDir, { recursive: true });
      this.logger.info('Stock media cache directory initialized', {
        cacheDir: this.cacheDir
      });
    } catch (error) {
      this.logger.error('Failed to create cache directory', {
        error: error.message
      });
    }
  }

  /**
   * Search for videos across multiple providers
   *
   * @param {string} query - Search query
   * @param {object} options - Search options
   * @returns {Promise<Array>} Array of video results
   */
  async searchVideos(query, options = {}) {
    const {
      orientation = 'portrait', // portrait, landscape, square
      size = 'medium', // small, medium, large
      perPage = 15,
      page = 1,
      minDuration = 5, // seconds
      maxDuration = 120 // seconds
    } = options;

    this.logger.info('Searching stock videos', {
      query,
      orientation,
      perPage,
      page
    });

    const results = [];

    try {
      // Search Pexels first (better quality for vertical videos)
      if (this.pexelsApiKey) {
        const pexelsResults = await this.searchPexels(query, {
          orientation,
          size,
          perPage: Math.ceil(perPage / 2),
          page
        });
        results.push(...pexelsResults);
      }

      // Search Pixabay as backup/supplement
      if (this.pixabayApiKey && results.length < perPage) {
        const pixabayResults = await this.searchPixabay(query, {
          orientation,
          perPage: perPage - results.length,
          page,
          minDuration,
          maxDuration
        });
        results.push(...pixabayResults);
      }

      // If no API keys configured, throw error
      if (!this.pexelsApiKey && !this.pixabayApiKey) {
        throw new Error('No stock media API keys configured. Please set PEXELS_API_KEY or PIXABAY_API_KEY in your .env file. Get free keys from https://www.pexels.com/api/ or https://pixabay.com/api/docs/');
      }

      this.logger.info('Stock video search completed', {
        query,
        resultsCount: results.length
      });

      return results.slice(0, perPage);

    } catch (error) {
      this.logger.error('Error searching stock videos', {
        query,
        error: error.message
      });
      throw new Error(`Failed to search stock videos: ${error.message}`);
    }
  }

  /**
   * Search Pexels API
   */
  async searchPexels(query, options) {
    const { orientation, size, perPage, page } = options;

    try {
      const response = await axios.get(`${this.pexelsBaseUrl}/search`, {
        headers: {
          'Authorization': this.pexelsApiKey
        },
        params: {
          query,
          orientation,
          size,
          per_page: perPage,
          page
        }
      });

      return response.data.videos.map(video => ({
        id: `pexels-${video.id}`,
        provider: 'pexels',
        title: video.url.split('/').pop(),
        description: `Video by ${video.user.name}`,
        duration: video.duration,
        width: video.width,
        height: video.height,
        thumbnail: video.image,
        tags: video.tags ? video.tags.split(',').map(t => t.trim()) : [],
        author: {
          name: video.user.name,
          url: video.user.url
        },
        videoFiles: video.video_files.map(file => ({
          quality: file.quality,
          width: file.width,
          height: file.height,
          fileType: file.file_type,
          link: file.link,
          fps: file.fps
        })),
        url: video.url,
        license: 'Pexels License (Free to use)',
        licenseUrl: 'https://www.pexels.com/license/'
      }));

    } catch (error) {
      this.logger.error('Pexels API error', {
        error: error.message,
        status: error.response?.status
      });

      if (error.response?.status === 401) {
        throw new Error('Invalid Pexels API key');
      }

      return [];
    }
  }

  /**
   * Search Pixabay API
   */
  async searchPixabay(query, options) {
    const { orientation, perPage, page, minDuration, maxDuration } = options;

    try {
      const response = await axios.get(this.pixabayBaseUrl, {
        params: {
          key: this.pixabayApiKey,
          q: query,
          video_type: 'all',
          orientation: orientation === 'portrait' ? 'vertical' : orientation,
          per_page: perPage,
          page,
          min_duration: minDuration,
          max_duration: maxDuration
        }
      });

      return response.data.hits.map(video => ({
        id: `pixabay-${video.id}`,
        provider: 'pixabay',
        title: video.tags,
        description: `Video ${video.id} from Pixabay`,
        duration: video.duration,
        width: video.videos.medium?.width || 1280,
        height: video.videos.medium?.height || 720,
        thumbnail: video.userImageURL || video.picture_id,
        tags: video.tags.split(', '),
        author: {
          name: video.user,
          id: video.user_id
        },
        videoFiles: [
          video.videos.large && {
            quality: 'large',
            width: video.videos.large.width,
            height: video.videos.large.height,
            fileType: 'video/mp4',
            link: video.videos.large.url,
            size: video.videos.large.size
          },
          video.videos.medium && {
            quality: 'medium',
            width: video.videos.medium.width,
            height: video.videos.medium.height,
            fileType: 'video/mp4',
            link: video.videos.medium.url,
            size: video.videos.medium.size
          },
          video.videos.small && {
            quality: 'small',
            width: video.videos.small.width,
            height: video.videos.small.height,
            fileType: 'video/mp4',
            link: video.videos.small.url,
            size: video.videos.small.size
          }
        ].filter(Boolean),
        url: video.pageURL,
        views: video.views,
        downloads: video.downloads,
        likes: video.likes,
        license: 'Pixabay License (Free to use)',
        licenseUrl: 'https://pixabay.com/service/license/'
      }));

    } catch (error) {
      this.logger.error('Pixabay API error', {
        error: error.message,
        status: error.response?.status
      });

      if (error.response?.status === 401 || error.response?.status === 400) {
        throw new Error('Invalid Pixabay API key');
      }

      return [];
    }
  }

  /**
   * Download and cache a video locally
   *
   * @param {string} videoUrl - Direct URL to video file
   * @param {string} videoId - Unique video identifier
   * @param {string} quality - Video quality to download
   * @returns {Promise<string>} Local file path
   */
  async downloadVideo(videoUrl, videoId, quality = 'medium') {
    const hash = crypto.createHash('md5').update(videoId).digest('hex');
    const filename = `${hash}-${quality}.mp4`;
    const localPath = path.join(this.cacheDir, filename);

    this.logger.info('Downloading stock video', {
      videoId,
      quality,
      url: videoUrl
    });

    try {
      // Check if already cached
      try {
        await fs.access(localPath);
        this.logger.info('Video already cached', { localPath });
        return localPath;
      } catch {
        // File doesn't exist, proceed with download
      }

      // Download video
      const response = await axios({
        method: 'GET',
        url: videoUrl,
        responseType: 'stream',
        timeout: 120000 // 2 minutes timeout
      });

      // Save to cache
      await pipeline(
        response.data,
        createWriteStream(localPath)
      );

      // Get file stats
      const stats = await fs.stat(localPath);

      this.logger.info('Video downloaded successfully', {
        videoId,
        localPath,
        size: stats.size
      });

      return localPath;

    } catch (error) {
      this.logger.error('Failed to download video', {
        videoId,
        error: error.message
      });

      // Clean up partial download
      try {
        await fs.unlink(localPath);
      } catch (_ignoreError) {
        // File cleanup failure is not critical
      }

      throw new Error(`Failed to download video: ${error.message}`);
    }
  }

  /**
   * Get AI-powered video suggestions based on script content
   *
   * @param {string} script - Video script text
   * @param {object} options - Additional options
   * @returns {Promise<Array>} Suggested videos with relevance scores
   */
  async getSuggestionsForScript(script, options = {}) {
    const { genre, maxSuggestions = 10 } = options;

    this.logger.info('Getting AI-powered video suggestions', {
      scriptLength: script.length,
      genre,
      maxSuggestions
    });

    try {
      // Extract keywords and themes using AI
      const keywords = await this.extractKeywords(script, genre);

      this.logger.info('Extracted keywords from script', { keywords });

      // Search for videos based on keywords
      const allResults = [];

      for (const keyword of keywords.slice(0, 3)) {
        const results = await this.searchVideos(keyword, {
          orientation: 'portrait',
          perPage: 5,
          page: 1
        });

        // Add relevance score
        results.forEach(video => {
          video.relevanceScore = this.calculateRelevance(video, keywords, script);
        });

        allResults.push(...results);
      }

      // Sort by relevance and remove duplicates
      const uniqueResults = Array.from(
        new Map(allResults.map(v => [v.id, v])).values()
      );

      const sortedResults = uniqueResults
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, maxSuggestions);

      this.logger.info('Generated video suggestions', {
        count: sortedResults.length
      });

      return sortedResults;

    } catch (error) {
      this.logger.error('Failed to generate video suggestions', {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Extract relevant keywords from script using AI
   */
  async extractKeywords(script, genre) {
    try {
      // Use AI service to extract keywords
      const prompt = `Extract 3-5 visual keywords from this ${genre || 'horror'} video script that would be good for finding background footage. Return only the keywords separated by commas, no explanations.

Script: ${script.substring(0, 500)}

Keywords:`;

      // Try OpenAI first, fallback to Gemini
      let response;
      try {
        response = await this.aiService.generateWithOpenAI(prompt);
      } catch {
        response = await this.aiService.generateWithGemini(prompt);
      }

      const keywords = response
        .split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0)
        .slice(0, 5);

      return keywords.length > 0 ? keywords : this.getFallbackKeywords(genre);

    } catch (error) {
      this.logger.warn('Failed to extract keywords with AI, using fallback', {
        error: error.message
      });
      return this.getFallbackKeywords(genre);
    }
  }

  /**
   * Fallback keywords based on genre
   */
  getFallbackKeywords(genre) {
    const genreKeywords = {
      horror: ['dark', 'spooky', 'abandoned', 'creepy', 'haunted'],
      mystery: ['investigation', 'detective', 'clue', 'mysterious', 'noir'],
      paranormal: ['ghost', 'supernatural', 'spirit', 'eerie', 'mystical'],
      'true crime': ['investigation', 'crime scene', 'detective', 'evidence', 'police']
    };

    return genreKeywords[genre] || ['cinematic', 'dramatic', 'atmospheric', 'moody'];
  }

  /**
   * Calculate relevance score for a video
   */
  calculateRelevance(video, keywords, _script) {
    let score = 0;

    // Check title and tags for keyword matches
    const videoText = [
      video.title,
      ...video.tags,
      video.description
    ].join(' ').toLowerCase();

    keywords.forEach(keyword => {
      if (videoText.includes(keyword.toLowerCase())) {
        score += 10;
      }
    });

    // Prefer vertical/portrait orientation
    if (video.height > video.width) {
      score += 5;
    }

    // Prefer appropriate duration (5-60 seconds)
    if (video.duration >= 5 && video.duration <= 60) {
      score += 5;
    }

    // Bonus for higher quality
    const hasHD = video.videoFiles.some(f => f.width >= 1080 || f.height >= 1920);
    if (hasHD) {
      score += 3;
    }

    return score;
  }

  /**
   * Get video details by ID
   */
  async getVideoDetails(videoId) {
    const [provider, id] = videoId.split('-');

    this.logger.info('Getting video details', { videoId, provider });

    try {
      if (provider === 'pexels') {
        const response = await axios.get(`${this.pexelsBaseUrl}/videos/${id}`, {
          headers: {
            'Authorization': this.pexelsApiKey
          }
        });
        return this.formatPexelsVideo(response.data);
      } else if (provider === 'pixabay') {
        const response = await axios.get(this.pixabayBaseUrl, {
          params: {
            key: this.pixabayApiKey,
            id: id
          }
        });
        return this.formatPixabayVideo(response.data.hits[0]);
      }

      throw new Error('Unknown provider');

    } catch (error) {
      this.logger.error('Failed to get video details', {
        videoId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Clear cache (optional utility method)
   */
  async clearCache() {
    try {
      const files = await fs.readdir(this.cacheDir);

      for (const file of files) {
        await fs.unlink(path.join(this.cacheDir, file));
      }

      this.logger.info('Stock media cache cleared', {
        filesDeleted: files.length
      });

      return { filesDeleted: files.length };

    } catch (error) {
      this.logger.error('Failed to clear cache', {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats() {
    try {
      const files = await fs.readdir(this.cacheDir);
      let totalSize = 0;

      for (const file of files) {
        const stats = await fs.stat(path.join(this.cacheDir, file));
        totalSize += stats.size;
      }

      return {
        fileCount: files.length,
        totalSize,
        totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2)
      };

    } catch (error) {
      this.logger.error('Failed to get cache stats', {
        error: error.message
      });
      return { fileCount: 0, totalSize: 0, totalSizeMB: '0.00' };
    }
  }

}
