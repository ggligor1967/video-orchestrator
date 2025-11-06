<script>
  import { onMount, onDestroy } from "svelte";
  import {
    Upload,
    Play,
    Trash2,
    Info,
    ChevronRight,
    RotateCcw,
    Copy,
    Sparkles,
    Crop,
    Zap,
  } from "lucide-svelte";
  import {
    projectContext,
    updateTabStatus,
    addNotification,
    currentTab,
  } from "../../stores/appStore.js";
  import {
    listBackgrounds,
    importBackground,
    deleteBackground,
    getBackgroundSuggestions,
    autoReframeVideo,
  } from "../../lib/api.js";
  import {
    hasAllowedExtension,
    hasAllowedMimeType,
    formatFileSize,
    formatDuration,
  } from "../../lib/utils.js";

  // Allowed video formats (must match backend validation)
  const ALLOWED_MIME_TYPES = [
    "video/mp4",
    "video/quicktime",
    "video/x-msvideo",
    "video/x-matroska",
    "video/webm",
    "video/mpeg",
  ];

  const ALLOWED_EXTENSIONS = [
    ".mp4",
    ".mov",
    ".avi",
    ".mkv",
    ".webm",
    ".mpg",
    ".mpeg",
  ];

  const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

  let backgrounds = [];
  let selectedBackground = null;
  let backgroundSuggestions = [];
  let isUploading = false;
  let isLoading = false;
  let isSuggesting = false;
  let isReframing = false;
  let fileInput;
  let showUploadDropzone = false;
  let scriptText = "";
  let scriptTopic = "";
  let scriptGenre = "horror";
  let reframeMode = "face";

  // Subscribe to project context
  const unsubscribe = projectContext.subscribe((context) => {
    selectedBackground = context.background.selectedId;
    backgroundSuggestions = context.background.suggestions || [];
    scriptText = context.script.text || "";
    scriptTopic = context.script.topic || "";
    scriptGenre = context.script.genre || "horror";
  });

  onMount(async () => {
    await loadBackgrounds();
    checkTabCompletion();
  });

  async function loadBackgrounds() {
    isLoading = true;
    try {
      backgrounds = await listBackgrounds();
    } catch (error) {
      console.error("Failed to load backgrounds:", error);
      addNotification("Failed to load background videos", "error");
    } finally {
      isLoading = false;
    }
  }

  async function handleFileUpload(event) {
    const files = event.target.files || event.dataTransfer?.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate MIME type
    if (!hasAllowedMimeType(file.type, ALLOWED_MIME_TYPES)) {
      addNotification(
        `Invalid file type: ${file.type}. Please upload a supported video format.`,
        "error",
        5000,
      );
      return;
    }

    // Validate file extension
    if (!hasAllowedExtension(file.name, ALLOWED_EXTENSIONS)) {
      addNotification(
        "Invalid file extension. Supported formats: MP4, MOV, AVI, MKV, WEBM, MPG, MPEG",
        "error",
        5000,
      );
      return;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      addNotification(
        `File size (${formatFileSize(file.size)}) exceeds maximum allowed size (500MB)`,
        "error",
        5000,
      );
      return;
    }

    isUploading = true;

    try {
      addNotification("Uploading background video...", "info");

      const result = await importBackground(file);

      // Refresh backgrounds list
      await loadBackgrounds();

      // Auto-select the uploaded background
      selectBackground(result.id);

      addNotification("Background uploaded successfully!", "success");
    } catch (error) {
      console.error("Upload failed:", error);
      addNotification(error.message || "Failed to upload background", "error");
    } finally {
      isUploading = false;
      showUploadDropzone = false;
      if (fileInput) fileInput.value = "";
    }
  }

  async function handleDeleteBackground(id) {
    if (!confirm("Are you sure you want to delete this background?")) return;

    try {
      await deleteBackground(id);
      await loadBackgrounds();

      // Unselect if deleted background was selected
      if (selectedBackground === id) {
        selectBackground(null);
      }

      addNotification("Background deleted successfully", "success");
    } catch (error) {
      console.error("Delete failed:", error);
      addNotification("Failed to delete background", "error");
    }
  }

  function selectBackground(id) {
    selectedBackground = id;

    // Update project context
    const background = backgrounds.find((bg) => bg.id === id);
    projectContext.update((context) => ({
      ...context,
      background: {
        ...context.background,
        selectedId: id,
        path: background?.path || null,
        info: background || null,
        processed: false,
      },
    }));

    checkTabCompletion();
  }

  async function generateSmartSuggestions() {
    if (!scriptText || scriptText.trim().length < 20) {
      addNotification(
        "Generate or enter a longer script before requesting suggestions",
        "warning",
        4000,
      );
      return;
    }

    isSuggesting = true;

    try {
      const suggestions = await getBackgroundSuggestions({
        script: scriptText,
        genre: scriptGenre,
        topic: scriptTopic,
      });

      backgroundSuggestions = suggestions;

      projectContext.update((context) => ({
        ...context,
        background: {
          ...context.background,
          suggestions,
        },
      }));

      addNotification("Background ideas updated", "success", 2500);
    } catch (error) {
      console.error("Suggestion generation failed:", error);
      addNotification(
        error.message || "Unable to generate background suggestions",
        "error",
      );
    } finally {
      isSuggesting = false;
    }
  }

  async function copyKeywords(keywords = []) {
    if (!keywords.length) {
      return;
    }

    try {
      await navigator.clipboard.writeText(keywords.join(", "));
      addNotification("Keywords copied to clipboard", "success", 2000);
    } catch (error) {
      console.error("Clipboard copy failed", error);
      addNotification("Unable to copy keywords", "error", 2000);
    }
  }

  function checkTabCompletion() {
    const isComplete = selectedBackground !== null;
    updateTabStatus("background", isComplete, isComplete);
  }

  function proceedToNext() {
    if (selectedBackground) {
      currentTab.set("voiceover");
      addNotification("Moving to Voice-over generation", "info", 2000);
    }
  }

  function formatFileSizeLocal(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  function formatDurationLocal(seconds) {
    if (!seconds) return "Unknown";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  // Drag and drop handlers
  function handleDragOver(event) {
    event.preventDefault();
    showUploadDropzone = true;
  }

  function handleDragLeave() {
    showUploadDropzone = false;
  }

  function handleDrop(event) {
    event.preventDefault();
    handleFileUpload(event);
  }

  async function handleAutoReframe() {
    if (!selectedBackground) {
      addNotification("Please select a background first", "error");
      return;
    }

    isReframing = true;

    try {
      addNotification(
        `Auto-reframing video (${reframeMode} detection)...`,
        "info",
      );

      const background = backgrounds.find((bg) => bg.id === selectedBackground);
      if (!background) {
        addNotification("Selected background not found in library.", "error");
        return;
      }

      const result = await autoReframeVideo({
        inputPath: background.path, // Absolute path from selected background
        detectionMode: reframeMode,
        smoothing: 10,
      });

      // Response: { id, path, relativePath, duration, width, height, detectionMode, processedAt }
      addNotification("Video auto-reframed successfully!", "success");

      // Refresh backgrounds to show the new reframed version
      await loadBackgrounds();

      // Update selection to the new reframed video (backend returns 'id', not 'videoId')
      if (result.id) {
        selectBackground(result.id);
      }
    } catch (error) {
      console.error("Auto-reframe failed:", error);
      addNotification(error.message || "Failed to auto-reframe video", "error");
    } finally {
      isReframing = false;
    }
  }

  onDestroy(() => {
    unsubscribe();
  });
</script>

<div
  class="h-full flex"
  on:dragover={handleDragOver}
  on:dragleave={handleDragLeave}
  on:drop={handleDrop}
>
  <!-- Left Panel - Background Library -->
  <div class="w-1/2 p-6 border-r border-dark-700 overflow-y-auto">
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h2 class="text-2xl font-bold text-white mb-2">Background Selection</h2>
        <p class="text-dark-300">
          Choose or upload a background video for your content
        </p>
      </div>

      <!-- Upload Section -->
      <div class="space-y-4">
        <div
          class="bg-dark-800 border border-dark-600 rounded-xl p-4 space-y-3"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <h3 class="text-lg font-semibold text-white">
                Smart Background Suggestions
              </h3>
              <p class="text-sm text-dark-300">
                Use your current script to get adaptive background ideas.
              </p>
            </div>
            <button
              class="btn-primary flex items-center space-x-2 disabled:opacity-60"
              on:click={generateSmartSuggestions}
              disabled={isSuggesting}
              type="button"
            >
              {#if isSuggesting}
                <div
                  class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"
                ></div>
                <span>Generating...</span>
              {:else}
                <Sparkles class="h-4 w-4" />
                <span>Suggest</span>
              {/if}
            </button>
          </div>

          {#if !scriptText || scriptText.trim().length < 20}
            <p class="text-sm text-dark-400">
              Generate or enter a script in the previous tab to enable
              context-aware suggestions.
            </p>
          {/if}

          {#if backgroundSuggestions.length > 0}
            <div class="space-y-3" aria-live="polite">
              {#each backgroundSuggestions as suggestion, index}
                <div class="border border-dark-600 rounded-lg p-3 bg-dark-900">
                  <div class="flex items-start justify-between gap-3">
                    <div>
                      <h4 class="text-sm font-semibold text-white">
                        {index + 1}. {suggestion.title}
                      </h4>
                      <p class="text-xs text-dark-300 mt-1">
                        {suggestion.description}
                      </p>
                    </div>
                    <button
                      class="text-dark-300 hover:text-white transition"
                      type="button"
                      title="Copy keywords"
                      on:click={() => copyKeywords(suggestion.keywords)}
                    >
                      <Copy class="h-4 w-4" />
                    </button>
                  </div>
                  {#if suggestion.keywords?.length}
                    <div
                      class="flex flex-wrap gap-2 text-xs text-dark-200 mt-3"
                    >
                      {#each suggestion.keywords as keyword}
                        <span class="px-2 py-1 bg-dark-700 rounded-full">
                          #{keyword}
                        </span>
                      {/each}
                    </div>
                  {/if}
                  {#if suggestion.ambiance}
                    <p class="text-xs text-blue-300 mt-2">
                      Mood: {suggestion.ambiance}
                    </p>
                  {/if}
                  {#if suggestion.idealUseCase}
                    <p class="text-xs text-dark-400 mt-1">
                      Best for: {suggestion.idealUseCase}
                    </p>
                  {/if}
                </div>
              {/each}
            </div>
          {/if}
        </div>

        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-white">
            Upload New Background
          </h3>
          <button
            on:click={() => fileInput?.click()}
            disabled={isUploading}
            class="btn-primary flex items-center space-x-2"
          >
            {#if isUploading}
              <div
                class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"
              ></div>
              <span>Uploading...</span>
            {:else}
              <Upload class="w-4 h-4" />
              <span>Upload Video</span>
            {/if}
          </button>
        </div>

        <!-- Drag & Drop Zone -->
        <div
          class="border-2 border-dashed rounded-lg p-6 text-center transition-colors select-none
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
                 {showUploadDropzone
            ? 'border-primary-500 bg-primary-500/10'
            : 'border-dark-600 hover:border-dark-500'}"
          role="button"
          tabindex="0"
          on:keyup={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              fileInput?.click();
            }
          }}
        >
          <Upload
            class="w-8 h-8 text-dark-400 mx-auto mb-2"
            aria-hidden="true"
          />
          <p class="text-dark-300 text-sm">
            Drag and drop video files here, or press Enter/Space to browse
          </p>
          <p class="text-dark-500 text-xs mt-1">
            Supports: MP4, MOV, AVI, MKV (max 500MB)
          </p>
        </div>

        <input
          bind:this={fileInput}
          type="file"
          accept="video/*"
          on:change={handleFileUpload}
          class="hidden"
        />
      </div>

      <!-- Background Library -->
      <div>
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-white">Background Library</h3>
          <button
            on:click={loadBackgrounds}
            disabled={isLoading}
            class="text-dark-400 hover:text-white transition-colors"
            title="Refresh"
          >
            <RotateCcw class="w-4 h-4 {isLoading ? 'animate-spin' : ''}" />
          </button>
        </div>

        {#if isLoading}
          <div class="text-center py-8">
            <div
              class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"
            ></div>
            <p class="text-dark-400">Loading backgrounds...</p>
          </div>
        {:else if backgrounds.length === 0}
          <div class="text-center py-8">
            <div class="text-6xl mb-4">🎬</div>
            <h4 class="text-lg font-medium text-dark-400 mb-2">
              No backgrounds yet
            </h4>
            <p class="text-dark-500 text-sm">
              Upload your first background video to get started
            </p>
          </div>
        {:else}
          <div class="grid grid-cols-1 gap-4">
            {#each backgrounds as background (background.id)}
              <div
                class="bg-dark-800 rounded-lg p-4 cursor-pointer transition-all border-2
                       {selectedBackground === background.id
                  ? 'border-primary-500 bg-primary-500/10'
                  : 'border-transparent hover:border-dark-600'}"
                on:click={() => selectBackground(background.id)}
              >
                <div class="flex items-start space-x-3">
                  <!-- Video Thumbnail/Icon -->
                  <div
                    class="w-16 h-12 bg-dark-700 rounded flex items-center justify-center flex-shrink-0"
                  >
                    <Play class="w-6 h-6 text-dark-400" />
                  </div>

                  <!-- Video Info -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between">
                      <h4 class="font-medium text-white truncate">
                        {background.filename}
                      </h4>
                      <div class="flex items-center space-x-2">
                        {#if selectedBackground === background.id}
                          <span
                            class="text-xs bg-primary-600 text-white px-2 py-1 rounded"
                            >Selected</span
                          >
                        {/if}
                        <button
                          on:click|stopPropagation={() =>
                            handleDeleteBackground(background.id)}
                          class="text-red-400 hover:text-red-300 transition-colors"
                          title="Delete"
                        >
                          <Trash2 class="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div class="mt-1 space-y-1">
                      <div
                        class="flex items-center space-x-4 text-xs text-dark-400"
                      >
                        {#if background.duration}
                          <span
                            >Duration: {formatDurationLocal(
                              background.duration,
                            )}</span
                          >
                        {/if}
                        {#if background.width && background.height}
                          <span
                            >Resolution: {background.width}×{background.height}</span
                          >
                        {/if}
                        <span>Size: {formatFileSizeLocal(background.size)}</span
                        >
                      </div>

                      {#if background.aspectRatio}
                        <div class="text-xs text-dark-500">
                          Aspect Ratio: {background.aspectRatio}
                        </div>
                      {/if}
                    </div>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Action Buttons -->
      {#if selectedBackground}
        <div class="flex space-x-3">
          <button
            on:click={proceedToNext}
            class="flex-1 btn-primary flex items-center justify-center space-x-2"
          >
            <span>Continue to Voice-over</span>
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>
      {/if}
    </div>
  </div>

  <!-- Right Panel - Preview -->
  <div class="w-1/2 p-6 overflow-y-auto">
    <div class="space-y-6">
      <div>
        <h3 class="text-lg font-semibold text-white mb-4">
          Background Preview
        </h3>

        {#if selectedBackground}
          {@const background = backgrounds.find(
            (bg) => bg.id === selectedBackground,
          )}
          {#if background}
            <!-- Video Preview -->
            <div class="bg-dark-800 rounded-lg p-4 mb-6">
              <div
                class="aspect-video bg-dark-700 rounded-lg flex items-center justify-center mb-4"
              >
                <!-- Video Element -->
                <video
                  src={background.path}
                  class="w-full h-full object-cover rounded-lg"
                  controls
                  preload="metadata"
                >
                  <track kind="captions" />
                </video>
              </div>

              <!-- Video Details -->
              <div class="space-y-3">
                <div>
                  <h4 class="font-medium text-white mb-2">
                    {background.filename}
                  </h4>
                  <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span class="text-dark-400">Duration:</span>
                      <span class="text-white ml-2"
                        >{formatDurationLocal(background.duration)}</span
                      >
                    </div>
                    <div>
                      <span class="text-dark-400">Resolution:</span>
                      <span class="text-white ml-2"
                        >{background.width}×{background.height}</span
                      >
                    </div>
                    <div>
                      <span class="text-dark-400">File Size:</span>
                      <span class="text-white ml-2"
                        >{formatFileSizeLocal(background.size)}</span
                      >
                    </div>
                    <div>
                      <span class="text-dark-400">Aspect Ratio:</span>
                      <span class="text-white ml-2"
                        >{background.aspectRatio}</span
                      >
                    </div>
                  </div>
                </div>

                <!-- Processing Info -->
                <div class="bg-dark-900 rounded p-3">
                  <div class="flex items-start space-x-2">
                    <Info class="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div class="text-xs text-dark-300">
                      <p class="font-medium text-blue-400 mb-1">
                        Processing Information
                      </p>
                      <p>This video will be automatically processed to:</p>
                      <ul class="list-disc list-inside mt-1 space-y-1">
                        <li>Crop to 9:16 vertical format (1080×1920)</li>
                        <li>Apply progressive zoom effect after 2 seconds</li>
                        <li>Optimize for 30fps playback</li>
                        <li>Prepare for voice-over integration</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <!-- Auto-Reframe Feature -->
                <div
                  class="bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-lg p-4"
                >
                  <div class="flex items-center gap-2 mb-3">
                    <Zap class="w-4 h-4 text-purple-400" />
                    <h4 class="font-medium text-white">AI Auto-Reframe</h4>
                  </div>

                  <p class="text-xs text-dark-300 mb-3">
                    Automatically detect and keep the most important parts of
                    your video in frame when converting to vertical format.
                  </p>

                  <div class="space-y-3">
                    <div>
                      <label
                        class="block text-xs font-medium text-dark-300 mb-2"
                      >
                        Detection Mode
                      </label>
                      <div class="grid grid-cols-3 gap-2">
                        <label
                          class="flex items-center space-x-2 p-2 rounded border cursor-pointer transition-colors text-xs
                          {reframeMode === 'face'
                            ? 'border-purple-500 bg-purple-500/20'
                            : 'border-dark-600 hover:border-dark-500'}"
                        >
                          <input
                            type="radio"
                            bind:group={reframeMode}
                            value="face"
                            disabled={isReframing}
                          />
                          <span class="text-white">Face</span>
                        </label>
                        <label
                          class="flex items-center space-x-2 p-2 rounded border cursor-pointer transition-colors text-xs
                          {reframeMode === 'motion'
                            ? 'border-purple-500 bg-purple-500/20'
                            : 'border-dark-600 hover:border-dark-500'}"
                        >
                          <input
                            type="radio"
                            bind:group={reframeMode}
                            value="motion"
                            disabled={isReframing}
                          />
                          <span class="text-white">Motion</span>
                        </label>
                        <label
                          class="flex items-center space-x-2 p-2 rounded border cursor-pointer transition-colors text-xs
                          {reframeMode === 'center'
                            ? 'border-purple-500 bg-purple-500/20'
                            : 'border-dark-600 hover:border-dark-500'}"
                        >
                          <input
                            type="radio"
                            bind:group={reframeMode}
                            value="center"
                            disabled={isReframing}
                          />
                          <span class="text-white">Center</span>
                        </label>
                      </div>
                    </div>

                    <button
                      on:click={handleAutoReframe}
                      disabled={isReframing}
                      class="w-full btn-primary flex items-center justify-center gap-2 text-sm"
                    >
                      {#if isReframing}
                        <div
                          class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"
                        ></div>
                        <span>Reframing Video...</span>
                      {:else}
                        <Crop class="w-4 h-4" />
                        <span>Apply Auto-Reframe</span>
                      {/if}
                    </button>

                    <div class="text-xs text-dark-400">
                      <strong class="text-purple-300">Face:</strong> Tracks
                      faces in the video<br />
                      <strong class="text-purple-300">Motion:</strong> Follows
                      movement and action<br />
                      <strong class="text-purple-300">Center:</strong> Centers the
                      frame
                    </div>
                  </div>
                </div>
              </div>
            </div>
          {/if}
        {:else}
          <!-- Empty State -->
          <div class="text-center py-12">
            <div
              class="w-24 h-24 bg-dark-800 rounded-lg flex items-center justify-center mx-auto mb-4"
            >
              <Play class="w-12 h-12 text-dark-600" />
            </div>
            <h4 class="text-lg font-medium text-dark-400 mb-2">
              No background selected
            </h4>
            <p class="text-dark-500 text-sm">
              Choose a background from your library or upload a new video
            </p>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  video {
    max-height: 300px;
  }
</style>
