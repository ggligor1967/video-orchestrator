<script>
  import { onMount, onDestroy } from "svelte";
  import {
    Download,
    Share2,
    Folder,
    Settings,
    CheckCircle,
    AlertCircle,
    Clock,
  } from "lucide-svelte";
  import {
    projectContext,
    updateTabStatus,
    addNotification,
  } from "../../stores/appStore.js";
  import { exportVideo, getExportStatus } from "../../lib/api.js";
  import { formatFileSize, formatDuration, logError } from "../../lib/utils.js";

  let isExporting = false;
  let exportProgress = 0;
  let exportStatus = "idle"; // idle, processing, completed, error
  let exportedVideo = null;
  let exportError = null;
  let exportPollInterval = null; // Track polling interval for cleanup

  // Project data
  let script = "";
  let background = null;
  let voiceover = null;
  let audio = null;
  let subtitles = null;

  // Export settings
  let exportSettings = {
    preset: "tiktok",
    resolution: "1080x1920",
    framerate: 30,
    videoBitrate: 8000,
    audioBitrate: 192,
    includeSubtitles: true,
    burnInSubtitles: true,
    progressBar: true,
    partBadge: true,
    outputName: "",
  };

  // Export presets
  const presets = {
    tiktok: {
      name: "TikTok",
      resolution: "1080x1920",
      videoBitrate: 8000,
      audioBitrate: 192,
      description: "Optimized for TikTok (9:16, 8Mbps)",
    },
    youtube: {
      name: "YouTube Shorts",
      resolution: "1080x1920",
      videoBitrate: 12000,
      audioBitrate: 192,
      description: "Optimized for YouTube Shorts (9:16, 12Mbps)",
    },
    instagram: {
      name: "Instagram Reels",
      resolution: "1080x1920",
      videoBitrate: 8000,
      audioBitrate: 192,
      description: "Optimized for Instagram Reels (9:16, 8Mbps)",
    },
    custom: {
      name: "Custom",
      resolution: "1080x1920",
      videoBitrate: 10000,
      audioBitrate: 192,
      description: "Custom settings for specific needs",
    },
  };

  // Subscribe to project context
  const unsubscribe = projectContext.subscribe((context) => {
    script = context.script.generated || "";
    background = context.background.info;
    voiceover = context.voiceover.audioPath ? context.voiceover : null;
    audio = context.audio.processedPath ? context.audio : null;
    subtitles = context.subtitles.srtPath ? context.subtitles : null;

    if (context.export.videoPath) {
      exportedVideo = {
        path: context.export.videoPath,
        settings: context.export.settings,
        size: context.export.size,
        duration: context.export.duration,
      };
      exportStatus = "completed";
    }
  });

  onMount(() => {
    // Generate default output name
    const timestamp = new Date().toISOString().slice(0, 10);
    exportSettings.outputName = `video-${timestamp}`;

    checkTabCompletion();
  });

  function updatePreset(preset) {
    exportSettings.preset = preset;
    if (presets[preset]) {
      exportSettings.resolution = presets[preset].resolution;
      exportSettings.videoBitrate = presets[preset].videoBitrate;
      exportSettings.audioBitrate = presets[preset].audioBitrate;
    }
  }

  async function startExport() {
    if (!validateRequiredAssets()) {
      return;
    }

    isExporting = true;
    exportStatus = "processing";
    exportProgress = 0; // You can use a mock progress animation if you want
    exportError = null;

    try {
      addNotification("Starting video export...", "info");

      const exportData = {
        script,
        background: background?.path,
        voiceover: voiceover?.audioPath,
        audio: audio?.processedPath,
        subtitles: subtitles?.srtPath,
        settings: exportSettings,
      };

      // Simulate progress for better UX as the backend is synchronous but can take time
      const progressInterval = setInterval(() => {
        if (exportProgress < 90) {
          exportProgress += 5;
        }
      }, 500);

      const result = await exportVideo(exportData);
      clearInterval(progressInterval);
      exportProgress = 100;

      exportedVideo = {
        path: result.videoPath,
        settings: exportSettings,
        size: result.size,
        duration: result.duration,
      };

      projectContext.update((context) => ({
        ...context,
        export: { ...exportedVideo, exported: true },
      }));

      exportStatus = "completed";
      addNotification("Video exported successfully!", "success");
      checkTabCompletion();
    } catch (error) {
      logError("Export failed:", error);
      exportStatus = "error";
      exportError = error.message || "Failed to export video";
      addNotification(error.message || "Failed to start export", "error");
    } finally {
      isExporting = false;
    }
  }

  function validateRequiredAssets() {
    const missing = [];

    if (!script.trim()) missing.push("Script");
    if (!background) missing.push("Background video");
    if (!voiceover) missing.push("Voice-over audio");
    if (!audio) missing.push("Processed audio");

    if (missing.length > 0) {
      addNotification(
        `Missing required assets: ${missing.join(", ")}`,
        "error",
      );
      return false;
    }

    return true;
  }

  function downloadVideo() {
    if (!exportedVideo?.path) return;

    const link = document.createElement("a");
    link.href = exportedVideo.path;
    link.download = `${exportSettings.outputName}.mp4`;
    link.click();
  }

  function openVideoLocation() {
    if (!exportedVideo?.path) return;

    // This would open the file location in the system file manager
    // In a real Tauri app, you'd use the Tauri API for this
    addNotification("Opening video location...", "info");
  }

  function shareVideo() {
    if (!exportedVideo?.path) return;

    // This would open sharing options
    // In a real app, you'd integrate with social media APIs
    addNotification("Sharing options coming soon...", "info");
  }

  function resetExport() {
    exportStatus = "idle";
    exportProgress = 0;
    exportedVideo = null;
    exportError = null;
    isExporting = false;

    projectContext.update((context) => ({
      ...context,
      export: {
        videoPath: null,
        settings: null,
        size: null,
        duration: null,
        exported: false,
      },
    }));
  }

  function checkTabCompletion() {
    const isComplete = exportedVideo !== null;
    updateTabStatus("export", isComplete, isComplete);
  }

  onDestroy(() => {
    unsubscribe();

    // Cleanup export polling interval to prevent memory leak
    if (exportPollInterval) {
      clearInterval(exportPollInterval);
      exportPollInterval = null;
    }
  });
</script>

<div class="h-full flex">
  <!-- Left Panel - Export Configuration -->
  <div class="w-1/2 p-6 border-r border-dark-700 overflow-y-auto">
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h2 class="text-2xl font-bold text-white mb-2">Export & Post</h2>
        <p class="text-dark-300">
          Create your final video and prepare for sharing
        </p>
      </div>

      <!-- Project Summary -->
      <div>
        <h3 class="text-lg font-semibold text-white mb-3">Project Summary</h3>
        <div class="bg-dark-800 rounded-lg p-4 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-dark-300">Script</span>
            <span class="text-white text-sm"
              >{script ? "✓ Generated" : "✗ Missing"}</span
            >
          </div>
          <div class="flex items-center justify-between">
            <span class="text-dark-300">Background</span>
            <span class="text-white text-sm"
              >{background ? "✓ Selected" : "✗ Missing"}</span
            >
          </div>
          <div class="flex items-center justify-between">
            <span class="text-dark-300">Voice-over</span>
            <span class="text-white text-sm"
              >{voiceover ? "✓ Generated" : "✗ Missing"}</span
            >
          </div>
          <div class="flex items-center justify-between">
            <span class="text-dark-300">Audio Mix</span>
            <span class="text-white text-sm"
              >{audio ? "✓ Processed" : "✗ Missing"}</span
            >
          </div>
          <div class="flex items-center justify-between">
            <span class="text-dark-300">Subtitles</span>
            <span class="text-white text-sm"
              >{subtitles ? "✓ Generated" : "○ Optional"}</span
            >
          </div>
        </div>
      </div>

      <!-- Export Presets -->
      <div>
        <h3 class="text-lg font-semibold text-white mb-3">Export Preset</h3>
        <div class="grid grid-cols-2 gap-3">
          {#each Object.entries(presets) as [key, preset]}
            <button
              on:click={() => updatePreset(key)}
              class="text-left p-3 rounded-lg transition-all border-2 {exportSettings.preset ===
              key
                ? 'border-primary-500 bg-primary-500/10'
                : 'border-dark-600 bg-dark-800 hover:border-dark-500'}"
            >
              <h4 class="font-medium text-white text-sm">{preset.name}</h4>
              <p class="text-dark-400 text-xs mt-1">{preset.description}</p>
            </button>
          {/each}
        </div>
      </div>

      <!-- Export Settings -->
      <div>
        <h3
          class="text-lg font-semibold text-white mb-3 flex items-center space-x-2"
        >
          <Settings class="w-5 h-5" />
          <span>Export Settings</span>
        </h3>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-dark-300 mb-2"
              >Output Name</label
            >
            <input
              type="text"
              bind:value={exportSettings.outputName}
              placeholder="Enter filename (without extension)"
              class="w-full bg-dark-800 border border-dark-600 rounded px-3 py-2 text-white text-sm"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-dark-300 mb-2"
                >Resolution</label
              >
              <select
                bind:value={exportSettings.resolution}
                class="w-full bg-dark-800 border border-dark-600 rounded px-3 py-2 text-white text-sm"
              >
                <option value="1080x1920">1080x1920 (9:16)</option>
                <option value="720x1280">720x1280 (9:16)</option>
                <option value="1080x1080">1080x1080 (1:1)</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-dark-300 mb-2"
                >Frame Rate</label
              >
              <select
                bind:value={exportSettings.framerate}
                class="w-full bg-dark-800 border border-dark-600 rounded px-3 py-2 text-white text-sm"
              >
                <option value="24">24 fps</option>
                <option value="30">30 fps</option>
                <option value="60">60 fps</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-dark-300 mb-2"
                >Video Bitrate (kbps)</label
              >
              <input
                type="number"
                min="1000"
                max="50000"
                bind:value={exportSettings.videoBitrate}
                class="w-full bg-dark-800 border border-dark-600 rounded px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-dark-300 mb-2"
                >Audio Bitrate (kbps)</label
              >
              <select
                bind:value={exportSettings.audioBitrate}
                class="w-full bg-dark-800 border border-dark-600 rounded px-3 py-2 text-white text-sm"
              >
                <option value="128">128 kbps</option>
                <option value="192">192 kbps</option>
                <option value="256">256 kbps</option>
                <option value="320">320 kbps</option>
              </select>
            </div>
          </div>

          <!-- Video Overlays -->
          <div class="space-y-3">
            <h4 class="font-medium text-white">Video Overlays</h4>

            <div class="flex items-center justify-between">
              <span class="text-sm text-dark-300">Include Subtitles</span>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  bind:checked={exportSettings.includeSubtitles}
                  class="sr-only peer"
                />
                <div
                  class="w-11 h-6 bg-dark-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"
                ></div>
              </label>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-sm text-dark-300">Burn-in Subtitles</span>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  bind:checked={exportSettings.burnInSubtitles}
                  class="sr-only peer"
                />
                <div
                  class="w-11 h-6 bg-dark-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"
                ></div>
              </label>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-sm text-dark-300">Progress Bar</span>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  bind:checked={exportSettings.progressBar}
                  class="sr-only peer"
                />
                <div
                  class="w-11 h-6 bg-dark-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"
                ></div>
              </label>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-sm text-dark-300">"Part N" Badge</span>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  bind:checked={exportSettings.partBadge}
                  class="sr-only peer"
                />
                <div
                  class="w-11 h-6 bg-dark-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"
                ></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Export Button -->
      <div>
        <button
          on:click={startExport}
          disabled={isExporting || !validateRequiredAssets()}
          class="w-full btn-primary flex items-center justify-center space-x-2 py-3"
        >
          {#if isExporting}
            <div
              class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"
            ></div>
            <span>Exporting Video... ({exportProgress}%)</span>
          {:else}
            <Download class="w-5 h-5" />
            <span>Export Video</span>
          {/if}
        </button>

        {#if isExporting}
          <div class="mt-3">
            <div class="w-full bg-dark-700 rounded-full h-2">
              <div
                class="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style="width: {exportProgress}%"
              ></div>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>

  <!-- Right Panel - Export Results -->
  <div class="w-1/2 p-6 overflow-y-auto">
    <div class="space-y-6">
      <div>
        <h3 class="text-lg font-semibold text-white mb-4">Export Status</h3>

        {#if exportStatus === "idle"}
          <!-- Ready to Export -->
          <div class="text-center py-12">
            <div
              class="w-24 h-24 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Download class="w-12 h-12 text-dark-600" />
            </div>
            <h4 class="text-lg font-medium text-dark-400 mb-2">
              Ready to Export
            </h4>
            <p class="text-dark-500 text-sm">
              Configure your export settings and click "Export Video" to create
              your final video
            </p>
          </div>
        {:else if exportStatus === "processing"}
          <!-- Processing -->
          <div class="text-center py-12">
            <div
              class="w-24 h-24 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Clock class="w-12 h-12 text-white animate-pulse" />
            </div>
            <h4 class="text-lg font-medium text-white mb-2">
              Processing Video
            </h4>
            <p class="text-dark-300 text-sm mb-4">
              Your video is being rendered. This may take a few minutes...
            </p>
            <div class="text-2xl font-bold text-primary-400">
              {exportProgress}%
            </div>
          </div>
        {:else if exportStatus === "completed" && exportedVideo}
          <!-- Success -->
          <div class="bg-dark-800 rounded-lg p-6">
            <div class="text-center mb-6">
              <div
                class="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle class="w-12 h-12 text-white" />
              </div>
              <h4 class="text-lg font-medium text-white mb-2">
                Export Completed!
              </h4>
              <p class="text-dark-300 text-sm">
                Your video has been successfully created
              </p>
            </div>

            <!-- Video Info -->
            <div class="bg-dark-900 rounded p-4 mb-6">
              <h5 class="font-medium text-white mb-3">Video Information</h5>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-dark-400">Filename:</span>
                  <span class="text-white">{exportSettings.outputName}.mp4</span
                  >
                </div>
                <div class="flex justify-between">
                  <span class="text-dark-400">Duration:</span>
                  <span class="text-white"
                    >{formatDuration(exportedVideo.duration)}</span
                  >
                </div>
                <div class="flex justify-between">
                  <span class="text-dark-400">File Size:</span>
                  <span class="text-white"
                    >{formatFileSize(exportedVideo.size)}</span
                  >
                </div>
                <div class="flex justify-between">
                  <span class="text-dark-400">Resolution:</span>
                  <span class="text-white">{exportSettings.resolution}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-dark-400">Preset:</span>
                  <span class="text-white"
                    >{presets[exportSettings.preset]?.name}</span
                  >
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="space-y-3">
              <button
                on:click={downloadVideo}
                class="w-full btn-primary flex items-center justify-center space-x-2"
              >
                <Download class="w-5 h-5" />
                <span>Download Video</span>
              </button>

              <div class="grid grid-cols-2 gap-3">
                <button
                  on:click={openVideoLocation}
                  class="btn-secondary flex items-center justify-center space-x-2"
                >
                  <Folder class="w-4 h-4" />
                  <span>Open Location</span>
                </button>

                <button
                  on:click={shareVideo}
                  class="btn-secondary flex items-center justify-center space-x-2"
                >
                  <Share2 class="w-4 h-4" />
                  <span>Share</span>
                </button>
              </div>

              <button
                on:click={resetExport}
                class="w-full text-dark-400 hover:text-white transition-colors text-sm"
              >
                Export Another Version
              </button>
            </div>
          </div>
        {:else if exportStatus === "error"}
          <!-- Error -->
          <div class="text-center py-12">
            <div
              class="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <AlertCircle class="w-12 h-12 text-white" />
            </div>
            <h4 class="text-lg font-medium text-red-400 mb-2">Export Failed</h4>
            <p class="text-dark-300 text-sm mb-4">
              {exportError || "An error occurred during video export"}
            </p>
            <button on:click={resetExport} class="btn-secondary">
              Try Again
            </button>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
