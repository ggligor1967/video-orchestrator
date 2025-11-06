import ky from "ky";
import { sanitizeTextInput, logError } from "./utils.js";

// Backend API URL - configurable via environment variable
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:4545";

// Create ky instance with default configuration
const api = ky.create({
  prefixUrl: API_BASE_URL,
  timeout: 30000, // 30 second timeout
  retry: {
    limit: 2,
    methods: ["get", "post"],
    statusCodes: [408, 413, 429, 500, 502, 503, 504],
  },
  hooks: {
    afterResponse: [
      async (request, options, response) => {
        // Handle rate limiting with user-friendly messages
        if (response.status === 429) {
          const retryAfter = response.headers.get("Retry-After") || 60;
          throw new Error(
            `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
          );
        }
        return response;
      },
    ],
  },
});

// Health check
export async function checkBackendHealth() {
  try {
    const response = await api.get("health").json();
    return response;
  } catch (error) {
    // Accept 503 (degraded) as a valid connection
    if (error.response && error.response.status === 503) {
      try {
        const data = await error.response.json();
        // Backend is responding but degraded (missing binaries)
        return data;
      } catch {
        // Can't parse JSON, rethrow original
      }
    }
    // Log error internally if needed, but don't require use
    void error;
    throw new Error("Could not connect to Video Orchestrator backend");
  }
}

// AI Services
export async function generateScript(data) {
  try {
    // Sanitize text inputs before sending to backend
    const sanitizedData = {
      ...data,
      topic: sanitizeTextInput(data.topic, 500),
      genre: data.genre, // Enum, no sanitization needed
      duration: data.duration,
      style: data.style,
    };

    const response = await api
      .post("ai/script", { json: sanitizedData })
      .json();
    return response.data;
  } catch (error) {
    logError("Script generation failed:", error);
    throw new Error("Failed to generate script");
  }
}

export async function getBackgroundSuggestions(data) {
  try {
    // Sanitize text inputs
    const sanitizedData = {
      script: sanitizeTextInput(data.script, 5000),
      genre: data.genre,
      topic: sanitizeTextInput(data.topic, 500),
    };

    const response = await api
      .post("ai/background-suggestions", { json: sanitizedData })
      .json();
    return response.data.suggestions ?? response.data;
  } catch (error) {
    logError("Background suggestions failed:", error);
    throw new Error("Failed to generate background suggestions");
  }
}

export async function calculateViralityScore(data) {
  try {
    // Sanitize script text
    const sanitizedData = {
      ...data,
      script: sanitizeTextInput(data.script, 5000),
    };

    const response = await api
      .post("ai/virality-score", { json: sanitizedData })
      .json();
    return response.data;
  } catch (error) {
    logError("Virality score calculation failed:", error);
    throw new Error("Failed to calculate virality score");
  }
}

// Asset Management
export async function listBackgrounds() {
  try {
    const response = await api.get("assets/backgrounds").json();
    return response.data;
  } catch (_error) {
    throw new Error("Failed to load background videos");
  }
}

export async function importBackground(file) {
  try {
    const formData = new FormData();
    formData.append("video", file);

    const response = await api
      .post("assets/backgrounds/import", { body: formData })
      .json();
    return response.data;
  } catch (_error) {
    throw new Error("Failed to import background video");
  }
}

export async function deleteBackground(id) {
  try {
    const response = await api.delete(`assets/backgrounds/${id}`).json();
    return response;
  } catch (_error) {
    throw new Error("Failed to delete background video");
  }
}

export async function getBackgroundInfo(id) {
  try {
    const response = await api.get(`assets/backgrounds/${id}/info`).json();
    return response.data;
  } catch (_error) {
    throw new Error("Failed to get background information");
  }
}

// Video Processing
export async function cropVideoToVertical(data) {
  try {
    const response = await api.post("video/crop", { json: data }).json();
    return response.data;
  } catch (_error) {
    throw new Error("Failed to crop video to vertical format");
  }
}

export async function applySpeedRamp(data) {
  try {
    const response = await api.post("video/speed-ramp", { json: data }).json();
    return response.data;
  } catch (_error) {
    throw new Error("Failed to apply speed ramp effect");
  }
}

export async function mergeVideoAudio(data) {
  try {
    const response = await api.post("video/merge-audio", { json: data }).json();
    return response.data;
  } catch (_error) {
    throw new Error("Failed to merge video with audio");
  }
}

export async function autoReframeVideo(data) {
  try {
    const response = await api
      .post("video/auto-reframe", { json: data })
      .json();
    return response.data;
  } catch (_error) {
    throw new Error("Failed to auto-reframe video");
  }
}

// Audio Processing
export async function normalizeAudio(data) {
  try {
    const response = await api.post("audio/normalize", { json: data }).json();
    return response.data;
  } catch (_error) {
    throw new Error("Failed to normalize audio");
  }
}

export async function processAudio(data) {
  try {
    const response = await api.post("audio/process", { json: data }).json();
    return response.data;
  } catch (_error) {
    throw new Error("Failed to process audio");
  }
}

export async function uploadAudio(file) {
  try {
    const formData = new FormData();
    formData.append("audio", file);

    const response = await api.post("audio/upload", { body: formData }).json();
    return response.data;
  } catch (_error) {
    throw new Error("Failed to upload audio file");
  }
}

export async function listAudioAssets() {
  try {
    const response = await api.get("audio/assets").json();
    return response.data;
  } catch (_error) {
    throw new Error("Failed to load audio assets");
  }
}

export async function deleteAudioAsset(id) {
  try {
    const response = await api.delete(`audio/assets/${id}`).json();
    return response;
  } catch (_error) {
    throw new Error("Failed to delete audio asset");
  }
}

export async function getAudioInfo(filePath) {
  try {
    const response = await api
      .get("audio/info", { searchParams: { path: filePath } })
      .json();
    return response.data;
  } catch (_error) {
    throw new Error("Failed to get audio information");
  }
}

// TTS Services
export async function generateTTS(data) {
  try {
    // Sanitize text input
    const sanitizedData = {
      ...data,
      text: sanitizeTextInput(data.text, 5000),
    };

    const response = await api
      .post("tts/generate", { json: sanitizedData })
      .json();
    return response.data;
  } catch (error) {
    logError("TTS generation failed:", error);
    throw new Error("Failed to generate voice-over");
  }
}

export async function listTTSVoices() {
  try {
    const response = await api.get("tts/voices").json();
    return response.data;
  } catch (_error) {
    throw new Error("Failed to load available voices");
  }
}

// Alias for backwards compatibility
export const listVoices = listTTSVoices;

// Subtitle Services
export async function generateSubtitles(data) {
  try {
    const response = await api.post("subs/generate", { json: data }).json();
    return response.data;
  } catch (_error) {
    throw new Error("Failed to generate subtitles");
  }
}

export async function formatSubtitles(data) {
  try {
    const response = await api.post("subs/format", { json: data }).json();
    return response.data;
  } catch (_error) {
    throw new Error("Failed to format subtitles");
  }
}

export async function updateSubtitles(data) {
  try {
    const response = await api.put("subs/update", { json: data }).json();
    return response.data;
  } catch (_error) {
    throw new Error("Failed to update subtitles");
  }
}

// Export Services
export async function exportVideo(data) {
  try {
    const response = await api.post("export/compile", { json: data }).json();
    return response.data;
  } catch (_error) {
    throw new Error("Failed to export video");
  }
}

export async function getExportStatus(jobId) {
  try {
    const response = await api.get(`export/status/${jobId}`).json();
    return response.data;
  } catch (_error) {
    throw new Error("Failed to get export status");
  }
}

export async function getExportPresets() {
  try {
    const response = await api.get("export/presets").json();
    return response.data;
  } catch (_error) {
    throw new Error("Failed to load export presets");
  }
}

// Pipeline Services
export async function buildCompleteVideo(data) {
  try {
    const response = await api.post("pipeline/build", { json: data }).json();
    return response.data;
  } catch (_error) {
    throw new Error("Failed to start video build pipeline");
  }
}

export async function getPipelineStatus(jobId) {
  try {
    const response = await api.get(`pipeline/status/${jobId}`).json();
    return response.data;
  } catch (_error) {
    throw new Error("Failed to get pipeline status");
  }
}

// Batch Processing Services
export async function createBatchJob(data) {
  try {
    const response = await api.post("batch", { json: data }).json();
    return response.data;
  } catch (_error) {
    throw new Error("Failed to create batch job");
  }
}

export async function getBatchJobStatus(batchId) {
  try {
    const response = await api.get(`batch/${batchId}`).json();
    return response.data;
  } catch (_error) {
    throw new Error("Failed to get batch job status");
  }
}

export async function listBatchJobs() {
  try {
    const response = await api.get("batch").json();
    return response.data;
  } catch (_error) {
    throw new Error("Failed to load batch jobs");
  }
}

export async function cancelBatchJob(batchId) {
  try {
    const response = await api.post(`batch/${batchId}/cancel`).json();
    return response.data;
  } catch (_error) {
    throw new Error("Failed to cancel batch job");
  }
}

export async function deleteBatchJob(batchId) {
  try {
    const response = await api.delete(`batch/${batchId}`).json();
    return response;
  } catch (_error) {
    throw new Error("Failed to delete batch job");
  }
}

// Social Media Scheduler Services
export async function schedulePost(data) {
  try {
    const response = await api.post("scheduler", { json: data }).json();
    return response.data;
  } catch (_error) {
    throw new Error("Failed to schedule post");
  }
}

export async function listScheduledPosts() {
  try {
    const response = await api.get("scheduler").json();
    return response.data;
  } catch (_error) {
    throw new Error("Failed to load scheduled posts");
  }
}

export async function getUpcomingPosts(limit = 10) {
  try {
    const response = await api.get(`scheduler/upcoming?limit=${limit}`).json();
    return response.data;
  } catch (_error) {
    throw new Error("Failed to load upcoming posts");
  }
}

export async function getScheduledPost(postId) {
  try {
    const response = await api.get(`scheduler/${postId}`).json();
    return response.data;
  } catch (_error) {
    throw new Error("Failed to load scheduled post details");
  }
}

export async function updateScheduledPost(postId, data) {
  try {
    const response = await api
      .put(`scheduler/${postId}`, { json: data })
      .json();
    return response.data;
  } catch (_error) {
    throw new Error("Failed to update scheduled post");
  }
}

export async function cancelScheduledPost(postId) {
  try {
    const response = await api.post(`scheduler/${postId}/cancel`).json();
    return response.data;
  } catch (_error) {
    throw new Error("Failed to cancel scheduled post");
  }
}

export async function deleteScheduledPost(postId) {
  try {
    const response = await api.delete(`scheduler/${postId}`).json();
    return response;
  } catch (_error) {
    throw new Error("Failed to delete scheduled post");
  }
}

// File URL helpers
export function getFileUrl(relativePath) {
  if (API_BASE_URL) {
    return `${API_BASE_URL}${relativePath}`;
  }
  return relativePath;
}

export function getStaticUrl(path) {
  if (API_BASE_URL) {
    return `${API_BASE_URL}/static/${path}`;
  }
  return `/static/${path}`;
}
