<script>
  import { onMount, onDestroy } from "svelte";
  import {
    Type,
    Download,
    Edit3,
    Save,
    ChevronRight,
    RefreshCw,
    Eye,
    EyeOff,
    Settings,
  } from "lucide-svelte";
  import {
    projectContext,
    updateTabStatus,
    addNotification,
    currentTab,
  } from "../../stores/appStore.js";
  import {
    generateSubtitles,
    updateSubtitles,
    formatSubtitles,
  } from "../../lib/api.js";

  let processedAudio = null;
  let subtitles = [];
  let isGenerating = false;
  let isSaving = false;
  let editingIndex = -1;
  let editText = "";
  let showPreview = true;

  // Subtitle settings
  let subtitleSettings = {
    fontSize: 24,
    fontColor: "#FFFFFF",
    backgroundColor: "#000000",
    backgroundOpacity: 0.8,
    position: "bottom",
    fontFamily: "Arial",
    strokeWidth: 2,
    strokeColor: "#000000",
    maxWordsPerLine: 8,
    minDuration: 1.0,
    maxDuration: 5.0,
  };

  let generatedSrt = null;

  // Subscribe to project context
  const unsubscribe = projectContext.subscribe((context) => {
    processedAudio = context.audio.processedPath
      ? {
          path: context.audio.processedPath,
          duration: context.audio.duration,
        }
      : null;

    if (context.subtitles.srtPath) {
      generatedSrt = {
        path: context.subtitles.srtPath,
        settings: context.subtitles.settings,
      };
      subtitles = context.subtitles.entries || [];
    }
  });

  onMount(() => {
    checkTabCompletion();
  });

  async function generateSubtitlesFromAudio() {
    if (!processedAudio) {
      addNotification("No processed audio available", "error");
      return;
    }

    isGenerating = true;

    try {
      addNotification("Generating subtitles from audio...", "info");

      const result = await generateSubtitles({
        audioPath: processedAudio.path,
        settings: subtitleSettings,
      });

      subtitles = result.entries;
      generatedSrt = {
        id: result.id, // Store ID from backend response
        path: result.srtPath || result.path, // Backend returns 'path', fallback to 'srtPath'
        relativePath: result.relativePath,
        settings: subtitleSettings,
        wordCount: result.wordCount,
        duration: result.duration,
      };

      // Update project context
      projectContext.update((context) => ({
        ...context,
        subtitles: {
          srtPath: result.srtPath,
          settings: subtitleSettings,
          entries: subtitles,
          generated: true,
          wordCount: result.wordCount,
        },
      }));

      addNotification("Subtitles generated successfully!", "success");
      checkTabCompletion();
    } catch (error) {
      console.error("Subtitle generation failed:", error);
      addNotification(error.message || "Failed to generate subtitles", "error");
    } finally {
      isGenerating = false;
    }
  }

  async function saveSubtitleChanges() {
    if (!generatedSrt) return;

    isSaving = true;

    try {
      addNotification("Saving subtitle changes...", "info");

      // Use formatSubtitles with real subtitle ID from backend
      const result = await formatSubtitles({
        subtitleId: generatedSrt.id, // Use real ID, not path
        format: "srt",
        style: subtitleSettings,
      });

      generatedSrt = {
        ...generatedSrt,
        path: result.path || result.srtPath, // Backend returns 'path'
        relativePath: result.relativePath,
        settings: subtitleSettings,
      };

      // Update project context
      projectContext.update((context) => ({
        ...context,
        subtitles: {
          ...context.subtitles,
          srtPath: result.srtPath,
          settings: subtitleSettings,
          entries: subtitles,
        },
      }));

      addNotification("Subtitle changes saved!", "success");
    } catch (error) {
      console.error("Failed to save subtitles:", error);
      addNotification(
        error.message || "Failed to save subtitle changes",
        "error",
      );
    } finally {
      isSaving = false;
    }
  }

  function startEditing(index) {
    editingIndex = index;
    editText = subtitles[index].text;
  }

  function saveEdit() {
    if (editingIndex >= 0 && editText.trim()) {
      subtitles[editingIndex].text = editText.trim();
      subtitles = [...subtitles]; // Trigger reactivity
      editingIndex = -1;
      editText = "";
    }
  }

  function cancelEdit() {
    editingIndex = -1;
    editText = "";
  }

  function downloadSrt() {
    if (!generatedSrt?.path) return;

    const link = document.createElement("a");
    link.href = generatedSrt.path;
    link.download = "subtitles.srt";
    link.click();
  }

  function regenerateSubtitles() {
    subtitles = [];
    generatedSrt = null;
    projectContext.update((context) => ({
      ...context,
      subtitles: {
        srtPath: null,
        settings: null,
        entries: [],
        generated: false,
        wordCount: null,
      },
    }));
    generateSubtitlesFromAudio();
  }

  function checkTabCompletion() {
    const isComplete = generatedSrt !== null && subtitles.length > 0;
    updateTabStatus("subtitles", isComplete, isComplete);
  }

  function proceedToNext() {
    if (generatedSrt) {
      currentTab.set("export");
      addNotification("Moving to Export & Post", "info", 2000);
    }
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(1);
    return `${mins}:${secs.padStart(4, "0")}`;
  }

  function formatDuration(start, end) {
    return `${formatTime(start)} → ${formatTime(end)} (${(end - start).toFixed(1)}s)`;
  }

  // Color picker helpers
  function hexToRgba(hex, opacity = 1) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  onDestroy(() => {
    unsubscribe();
  });
</script>

<div class="h-full flex">
  <!-- Left Panel - Subtitle Configuration -->
  <div class="w-1/2 p-6 border-r border-dark-700 overflow-y-auto">
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h2 class="text-2xl font-bold text-white mb-2">Subtitle Generation</h2>
        <p class="text-dark-300">
          Generate and customize subtitles from your audio
        </p>
      </div>

      <!-- Audio Source -->
      <div>
        <h3 class="text-lg font-semibold text-white mb-3">Audio Source</h3>
        {#if processedAudio}
          <div class="bg-dark-800 rounded-lg p-4">
            <div class="flex items-center space-x-3">
              <div
                class="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center"
              >
                <Type class="w-5 h-5 text-white" />
              </div>
              <div class="flex-1">
                <h4 class="font-medium text-white">Processed Audio Mix</h4>
                <p class="text-dark-400 text-sm">
                  Duration: {formatTime(processedAudio.duration)}
                </p>
              </div>
            </div>
          </div>
        {:else}
          <div class="bg-dark-800 rounded-lg p-4 text-center">
            <Type class="w-8 h-8 text-dark-600 mx-auto mb-2" />
            <p class="text-dark-400 text-sm">
              No audio available. Process audio in the Audio & SFX tab first.
            </p>
          </div>
        {/if}
      </div>

      <!-- Subtitle Settings -->
      <div>
        <h3
          class="text-lg font-semibold text-white mb-3 flex items-center space-x-2"
        >
          <Settings class="w-5 h-5" />
          <span>Subtitle Settings</span>
        </h3>

        <div class="space-y-4">
          <!-- Appearance -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-dark-300 mb-2"
                >Font Size</label
              >
              <input
                type="number"
                min="12"
                max="48"
                bind:value={subtitleSettings.fontSize}
                class="w-full bg-dark-800 border border-dark-600 rounded px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-dark-300 mb-2"
                >Font Family</label
              >
              <select
                bind:value={subtitleSettings.fontFamily}
                class="w-full bg-dark-800 border border-dark-600 rounded px-3 py-2 text-white text-sm"
              >
                <option value="Arial">Arial</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier New</option>
                <option value="Verdana">Verdana</option>
              </select>
            </div>
          </div>

          <!-- Colors -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-dark-300 mb-2"
                >Text Color</label
              >
              <input
                type="color"
                bind:value={subtitleSettings.fontColor}
                class="w-full h-10 bg-dark-800 border border-dark-600 rounded cursor-pointer"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-dark-300 mb-2"
                >Background Color</label
              >
              <input
                type="color"
                bind:value={subtitleSettings.backgroundColor}
                class="w-full h-10 bg-dark-800 border border-dark-600 rounded cursor-pointer"
              />
            </div>
          </div>

          <!-- Background Opacity -->
          <div>
            <label class="block text-sm font-medium text-dark-300 mb-2">
              Background Opacity: {(
                subtitleSettings.backgroundOpacity * 100
              ).toFixed(0)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              bind:value={subtitleSettings.backgroundOpacity}
              class="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          <!-- Position -->
          <div>
            <label class="block text-sm font-medium text-dark-300 mb-2"
              >Position</label
            >
            <select
              bind:value={subtitleSettings.position}
              class="w-full bg-dark-800 border border-dark-600 rounded px-3 py-2 text-white text-sm"
            >
              <option value="top">Top</option>
              <option value="center">Center</option>
              <option value="bottom">Bottom</option>
            </select>
          </div>

          <!-- Text Settings -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-dark-300 mb-2"
                >Stroke Width</label
              >
              <input
                type="number"
                min="0"
                max="5"
                bind:value={subtitleSettings.strokeWidth}
                class="w-full bg-dark-800 border border-dark-600 rounded px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-dark-300 mb-2"
                >Max Words/Line</label
              >
              <input
                type="number"
                min="3"
                max="15"
                bind:value={subtitleSettings.maxWordsPerLine}
                class="w-full bg-dark-800 border border-dark-600 rounded px-3 py-2 text-white text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Preview -->
      <div>
        <h3 class="text-lg font-semibold text-white mb-3">Preview</h3>
        <div
          class="bg-black rounded-lg p-4 text-center relative"
          style="min-height: 100px;"
        >
          <div
            class="inline-block px-2 py-1 rounded text-center max-w-full"
            style="
              font-size: {subtitleSettings.fontSize}px;
              font-family: {subtitleSettings.fontFamily};
              color: {subtitleSettings.fontColor};
              background-color: {hexToRgba(
              subtitleSettings.backgroundColor,
              subtitleSettings.backgroundOpacity,
            )};
              text-shadow: {subtitleSettings.strokeWidth}px {subtitleSettings.strokeWidth}px 0px {subtitleSettings.strokeColor};
              position: absolute;
              {subtitleSettings.position === 'top' ? 'top: 10px;' : ''}
              {subtitleSettings.position === 'center'
              ? 'top: 50%; transform: translateY(-50%);'
              : ''}
              {subtitleSettings.position === 'bottom' ? 'bottom: 10px;' : ''}
              left: 50%;
              transform: translateX(-50%) {subtitleSettings.position ===
            'center'
              ? 'translateY(-50%)'
              : ''};
            "
          >
            Sample subtitle text
          </div>
        </div>
      </div>

      <!-- Generate Button -->
      <div>
        <button
          on:click={generateSubtitlesFromAudio}
          disabled={isGenerating || !processedAudio}
          class="w-full btn-primary flex items-center justify-center space-x-2 py-3"
        >
          {#if isGenerating}
            <div
              class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"
            ></div>
            <span>Generating Subtitles...</span>
          {:else}
            <Type class="w-5 h-5" />
            <span>Generate Subtitles</span>
          {/if}
        </button>
      </div>

      <!-- Action Buttons -->
      {#if generatedSrt}
        <div class="flex space-x-3">
          <button
            on:click={saveSubtitleChanges}
            disabled={isSaving}
            class="flex-1 btn-secondary flex items-center justify-center space-x-2"
          >
            {#if isSaving}
              <div
                class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"
              ></div>
              <span>Saving...</span>
            {:else}
              <Save class="w-4 h-4" />
              <span>Save Changes</span>
            {/if}
          </button>

          <button
            on:click={proceedToNext}
            class="flex-1 btn-primary flex items-center justify-center space-x-2"
          >
            <span>Continue to Export</span>
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>
      {/if}
    </div>
  </div>

  <!-- Right Panel - Subtitle Editor -->
  <div class="w-1/2 p-6 overflow-y-auto">
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-white">Subtitle Editor</h3>

        {#if generatedSrt}
          <div class="flex items-center space-x-2">
            <button
              on:click={() => (showPreview = !showPreview)}
              class="text-dark-400 hover:text-white transition-colors"
              title={showPreview ? "Hide preview" : "Show preview"}
            >
              {#if showPreview}
                <EyeOff class="w-4 h-4" />
              {:else}
                <Eye class="w-4 h-4" />
              {/if}
            </button>

            <button
              on:click={downloadSrt}
              class="text-dark-400 hover:text-white transition-colors"
              title="Download SRT file"
            >
              <Download class="w-4 h-4" />
            </button>

            <button
              on:click={regenerateSubtitles}
              class="text-dark-400 hover:text-white transition-colors"
              title="Regenerate subtitles"
            >
              <RefreshCw class="w-4 h-4" />
            </button>
          </div>
        {/if}
      </div>

      {#if generatedSrt && subtitles.length > 0}
        <!-- Subtitle Stats -->
        <div class="bg-dark-800 rounded-lg p-4">
          <h4 class="font-medium text-white mb-2">Subtitle Information</h4>
          <div class="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span class="text-dark-400">Total Segments:</span>
              <span class="text-white ml-2">{subtitles.length}</span>
            </div>
            <div>
              <span class="text-dark-400">Word Count:</span>
              <span class="text-white ml-2"
                >{generatedSrt.wordCount || "Unknown"}</span
              >
            </div>
            <div>
              <span class="text-dark-400">Duration:</span>
              <span class="text-white ml-2"
                >{formatTime(generatedSrt.duration || 0)}</span
              >
            </div>
          </div>
        </div>

        <!-- Subtitle List -->
        <div class="space-y-3">
          {#each subtitles as subtitle, index (index)}
            <div class="bg-dark-800 rounded-lg p-4">
              <div class="flex items-start justify-between mb-2">
                <div class="text-xs text-dark-400">
                  #{index + 1} • {formatDuration(subtitle.start, subtitle.end)}
                </div>
                <button
                  on:click={() => startEditing(index)}
                  class="text-blue-400 hover:text-blue-300 transition-colors"
                  title="Edit subtitle"
                >
                  <Edit3 class="w-4 h-4" />
                </button>
              </div>

              {#if editingIndex === index}
                <!-- Edit Mode -->
                <div class="space-y-3">
                  <textarea
                    bind:value={editText}
                    class="w-full bg-dark-700 border border-dark-600 rounded px-3 py-2 text-white text-sm resize-none"
                    rows="2"
                    placeholder="Edit subtitle text..."
                  ></textarea>
                  <div class="flex space-x-2">
                    <button
                      on:click={saveEdit}
                      class="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded transition-colors"
                    >
                      Save
                    </button>
                    <button
                      on:click={cancelEdit}
                      class="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              {:else}
                <!-- Display Mode -->
                <div class="text-white text-sm leading-relaxed">
                  {subtitle.text}
                </div>

                {#if showPreview}
                  <!-- Preview with styling -->
                  <div class="mt-3 bg-black rounded p-2 text-center">
                    <div
                      class="inline-block px-2 py-1 rounded"
                      style="
                        font-size: {Math.max(
                        subtitleSettings.fontSize * 0.7,
                        12,
                      )}px;
                        font-family: {subtitleSettings.fontFamily};
                        color: {subtitleSettings.fontColor};
                        background-color: {hexToRgba(
                        subtitleSettings.backgroundColor,
                        subtitleSettings.backgroundOpacity,
                      )};
                        text-shadow: {Math.max(
                        subtitleSettings.strokeWidth * 0.7,
                        1,
                      )}px {Math.max(
                        subtitleSettings.strokeWidth * 0.7,
                        1,
                      )}px 0px {subtitleSettings.strokeColor};
                      "
                    >
                      {subtitle.text}
                    </div>
                  </div>
                {/if}
              {/if}
            </div>
          {/each}
        </div>
      {:else if generatedSrt}
        <!-- Loading State -->
        <div class="text-center py-8">
          <div
            class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"
          ></div>
          <p class="text-dark-400">Loading subtitles...</p>
        </div>
      {:else}
        <!-- Empty State -->
        <div class="text-center py-12">
          <div
            class="w-24 h-24 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Type class="w-12 h-12 text-dark-600" />
          </div>
          <h4 class="text-lg font-medium text-dark-400 mb-2">
            No subtitles generated
          </h4>
          <p class="text-dark-500 text-sm">
            Configure your settings and click "Generate Subtitles" to create
            subtitle files
          </p>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .slider::-webkit-slider-thumb {
    appearance: none;
    height: 16px;
    width: 16px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    border: 2px solid #1e293b;
  }

  .slider::-moz-range-thumb {
    height: 16px;
    width: 16px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    border: 2px solid #1e293b;
  }
</style>
