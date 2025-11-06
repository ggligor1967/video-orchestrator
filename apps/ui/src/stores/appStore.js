import { writable, derived, get } from "svelte/store";
import { checkBackendHealth } from "../lib/api.js";

// Current active tab
export const currentTab = writable("story-script");

// Backend connection state
export const backendConnection = writable({
  status: "checking", // "checking" | "connected" | "error" | "disconnected"
  lastCheck: null,
  errorMessage: null,
  retryCount: 0,
  healthData: null,
});

// Project context - stores all project data across tabs
export const projectContext = writable({
  // Story & Script
  script: {
    text: "",
    topic: "",
    genre: "horror",
    hooks: [],
    hashtags: [],
    generatedAt: null,
  },

  // Background
  background: {
    selectedId: null,
    path: null,
    info: null,
    processed: false,
    suggestions: [],
  },

  // Voiceover
  voiceover: {
    audioId: null,
    path: null,
    voice: "en_US-lessac-medium",
    speed: 1.0,
    generated: false,
  },

  // Audio & SFX
  audio: {
    normalizedId: null,
    mixedId: null,
    effects: [],
    processed: false,
  },

  // Subtitles
  subtitles: {
    subtitleId: null,
    path: null,
    format: "srt",
    style: {
      fontSize: 24,
      fontColor: "#FFFFFF",
      backgroundColor: "#000000",
      position: "bottom",
    },
    generated: false,
  },

  // Export
  export: {
    finalVideoId: null,
    path: null,
    preset: "tiktok",
    effects: {
      progressBar: false,
      partBadge: "",
      watermark: "",
    },
    compiled: false,
  },

  // Pipeline status
  pipeline: {
    jobId: null,
    stage: null,
    progress: 0,
    isRunning: false,
    lastError: null,
  },
});

// Tab completion status
export const tabStatus = writable({
  "story-script": { completed: false, canProceed: false },
  background: { completed: false, canProceed: false },
  voiceover: { completed: false, canProceed: false },
  "audio-sfx": { completed: false, canProceed: false },
  subtitles: { completed: false, canProceed: false },
  export: { completed: false, canProceed: false },
});

// Notifications/toast messages
export const notifications = writable([]);

// Derived store: is backend ready?
export const isBackendReady = derived(
  backendConnection,
  ($connection) => $connection.status === "connected",
);

// Add a notification
export function addNotification(message, type = "info", duration = 5000) {
  const id = Date.now();
  const notification = { id, message, type, duration };

  notifications.update((items) => [...items, notification]);

  if (duration > 0) {
    setTimeout(() => {
      notifications.update((items) => items.filter((item) => item.id !== id));
    }, duration);
  }

  return id;
}

// Remove a notification
export function removeNotification(id) {
  notifications.update((items) => items.filter((item) => item.id !== id));
}

// Backend connection management
let healthCheckInterval = null;
const HEALTH_CHECK_INTERVAL = 30000; // Check every 30 seconds (reduced from 15s)
const MAX_RETRY_ATTEMPTS = 3;

export async function initializeBackend() {
  return checkBackendConnection();
}

export async function checkBackendConnection() {
  const currentState = get(backendConnection);

  try {
    // Add 5 second timeout to prevent UI freeze
    const response = await Promise.race([
      checkBackendHealth(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Health check timeout")), 5000),
      ),
    ]);

    backendConnection.update(() => ({
      status: "connected",
      lastCheck: new Date().toISOString(),
      errorMessage: null,
      retryCount: 0,
      healthData: response.data || response,
    }));

    // Start health check polling if not already started
    if (!healthCheckInterval) {
      startHealthCheckPolling();
    }

    return true;
  } catch (error) {
    // Check if this is a 503 (degraded) response - backend is running but binaries unavailable
    if (error.response && error.response.status === 503) {
      try {
        const data = await error.response.json();
        // Treat degraded status as connected (backend is responding)
        backendConnection.update(() => ({
          status: "connected",
          lastCheck: new Date().toISOString(),
          errorMessage: null,
          retryCount: 0,
          healthData: data.data || data,
        }));

        // Start health check polling if not already started
        if (!healthCheckInterval) {
          startHealthCheckPolling();
        }

        return true;
      } catch (parseError) {
        // If can't parse 503 response, fall through to error handling
        console.warn("Failed to parse 503 response:", parseError);
      }
    }

    const newRetryCount = currentState.retryCount + 1;
    const shouldRetry = newRetryCount < MAX_RETRY_ATTEMPTS;

    backendConnection.update((state) => ({
      ...state,
      status: shouldRetry ? "checking" : "error",
      lastCheck: new Date().toISOString(),
      errorMessage: error.message || "Could not connect to backend",
      retryCount: newRetryCount,
    }));

    if (shouldRetry) {
      // Exponential backoff: 1s, 2s, 4s
      const retryDelay = Math.pow(2, newRetryCount - 1) * 1000;
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
      return checkBackendConnection();
    }

    return false;
  }
}

function startHealthCheckPolling() {
  if (healthCheckInterval) {
    return;
  }

  healthCheckInterval = setInterval(async () => {
    const currentState = get(backendConnection);

    // Only poll if previously connected
    if (currentState.status !== "connected") {
      return;
    }

    try {
      const response = await checkBackendHealth();
      backendConnection.update((state) => ({
        ...state,
        status: "connected",
        lastCheck: new Date().toISOString(),
        healthData: response.data || response,
        retryCount: 0,
      }));
    } catch {
      backendConnection.update((state) => ({
        ...state,
        status: "disconnected",
        lastCheck: new Date().toISOString(),
        errorMessage: "Backend connection lost",
      }));

      addNotification(
        "Backend connection lost. Attempting to reconnect...",
        "warning",
        5000,
      );

      // Attempt to reconnect
      setTimeout(() => checkBackendConnection(), 2000);
    }
  }, HEALTH_CHECK_INTERVAL);
}

export function stopHealthCheckPolling() {
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
    healthCheckInterval = null;
  }
}

export function retryBackendConnection() {
  backendConnection.update((state) => ({
    ...state,
    status: "checking",
    retryCount: 0,
    errorMessage: null,
  }));

  return checkBackendConnection();
}

// Update tab status
export function updateTabStatus(tabId, completed, canProceed = true) {
  tabStatus.update((status) => ({
    ...status,
    [tabId]: { completed, canProceed },
  }));
}

// Reset project context
export function resetProject() {
  projectContext.update(() => ({
    script: {
      text: "",
      topic: "",
      genre: "horror",
      hooks: [],
      hashtags: [],
      generatedAt: null,
    },
    background: {
      selectedId: null,
      path: null,
      info: null,
      processed: false,
      suggestions: [],
    },
    voiceover: {
      audioId: null,
      path: null,
      voice: "en_US-lessac-medium",
      speed: 1.0,
      generated: false,
    },
    audio: { normalizedId: null, mixedId: null, effects: [], processed: false },
    subtitles: {
      subtitleId: null,
      path: null,
      format: "srt",
      style: {
        fontSize: 24,
        fontColor: "#FFFFFF",
        backgroundColor: "#000000",
        position: "bottom",
      },
      generated: false,
    },
    export: {
      finalVideoId: null,
      path: null,
      preset: "tiktok",
      effects: { progressBar: false, partBadge: "", watermark: "" },
      compiled: false,
    },
    pipeline: {
      jobId: null,
      stage: null,
      progress: 0,
      isRunning: false,
      lastError: null,
    },
  }));

  tabStatus.update(() => ({
    "story-script": { completed: false, canProceed: false },
    background: { completed: false, canProceed: false },
    voiceover: { completed: false, canProceed: false },
    "audio-sfx": { completed: false, canProceed: false },
    subtitles: { completed: false, canProceed: false },
    export: { completed: false, canProceed: false },
  }));

  currentTab.set("story-script");
  addNotification("Project reset successfully", "success");
}
