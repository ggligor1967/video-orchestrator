<script>
  import { onMount, onDestroy } from "svelte";
  import {
    Volume2,
    Upload,
    Play,
    Pause,
    Square,
    Trash2,
    Download,
    ChevronRight,
    Sliders,
    Music,
  } from "lucide-svelte";
  import {
    projectContext,
    updateTabStatus,
    addNotification,
    currentTab,
  } from "../../stores/appStore.js";
  import {
    processAudio,
    uploadAudio,
    listAudioAssets,
    deleteAudioAsset,
  } from "../../lib/api.js";

  let voiceoverAudio = null;
  let backgroundMusic = null;
  let soundEffects = [];
  let audioAssets = [];
  let isProcessing = false;
  let isUploading = false;
  let isLoading = false;
  let fileInput;

  // Audio mixing settings
  let audioSettings = {
    voiceoverVolume: 1.0,
    musicVolume: 0.3,
    sfxVolume: 0.7,
    fadeInDuration: 1.0,
    fadeOutDuration: 1.0,
    normalize: true,
    compressor: true,
  };

  let processedAudio = null;
  let audioElement;
  let isPlaying = false;

  // Subscribe to project context
  const unsubscribe = projectContext.subscribe((context) => {
    voiceoverAudio = context.voiceover.audioPath
      ? {
          path: context.voiceover.audioPath,
          duration: context.voiceover.duration,
          type: "voiceover",
        }
      : null;

    if (context.audio.processedPath) {
      processedAudio = {
        path: context.audio.processedPath,
        settings: context.audio.settings,
      };
    }
  });

  onMount(async () => {
    await loadAudioAssets();
    checkTabCompletion();
  });

  async function loadAudioAssets() {
    isLoading = true;
    try {
      audioAssets = await listAudioAssets();
    } catch (error) {
      console.error("Failed to load audio assets:", error);
      // Backend route /audio/assets not implemented yet, use empty array
      audioAssets = [];
      // Don't show error notification - this feature is not critical
    } finally {
      isLoading = false;
    }
  }

  async function handleFileUpload(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file type
    if (!file.type.startsWith("audio/")) {
      addNotification("Please select an audio file", "error");
      return;
    }

    // Check file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      addNotification("File size must be less than 50MB", "error");
      return;
    }

    isUploading = true;

    try {
      addNotification("Uploading audio file...", "info");

      await uploadAudio(file);

      // Refresh audio assets
      await loadAudioAssets();

      addNotification("Audio uploaded successfully!", "success");
    } catch (error) {
      console.error("Upload failed:", error);
      // Backend route /audio/upload not implemented yet
      addNotification("Audio upload feature not yet implemented", "warning");
    } finally {
      isUploading = false;
      if (fileInput) fileInput.value = "";
    }
  }

  function selectBackgroundMusic(asset) {
    backgroundMusic = asset;
    addNotification(
      `Selected ${asset.filename} as background music`,
      "success",
      3000,
    );
  }

  function addSoundEffect(asset) {
    const existingIndex = soundEffects.findIndex((sfx) => sfx.id === asset.id);
    if (existingIndex >= 0) {
      addNotification("Sound effect already added", "warning");
      return;
    }

    soundEffects = [
      ...soundEffects,
      {
        ...asset,
        startTime: 0,
        volume: 0.7,
      },
    ];

    addNotification(`Added ${asset.filename} as sound effect`, "success", 3000);
  }

  function removeSoundEffect(index) {
    soundEffects = soundEffects.filter((_, i) => i !== index);
  }

  function updateSfxTiming(index, startTime) {
    soundEffects[index].startTime = parseFloat(startTime);
  }

  function updateSfxVolume(index, volume) {
    soundEffects[index].volume = parseFloat(volume);
  }

  async function processAudioMix() {
    if (!voiceoverAudio) {
      addNotification("No voice-over audio available", "error");
      return;
    }

    isProcessing = true;

    try {
      addNotification("Processing audio mix...", "info");

      const result = await processAudio({
        voiceover: voiceoverAudio.path,
        backgroundMusic: backgroundMusic?.path || null,
        soundEffects: soundEffects.map((sfx) => ({
          path: sfx.path,
          startTime: sfx.startTime,
          volume: sfx.volume,
        })),
        settings: audioSettings,
      });

      processedAudio = {
        path: result.audioPath,
        settings: audioSettings,
        duration: result.duration,
        size: result.size,
      };

      // Update project context
      projectContext.update((context) => ({
        ...context,
        audio: {
          processedPath: result.audioPath,
          settings: audioSettings,
          backgroundMusic: backgroundMusic,
          soundEffects: soundEffects,
          processed: true,
          duration: result.duration,
        },
      }));

      addNotification("Audio mix processed successfully!", "success");
      checkTabCompletion();
    } catch (error) {
      console.error("Audio processing failed:", error);
      addNotification(error.message || "Failed to process audio", "error");
    } finally {
      isProcessing = false;
    }
  }

  async function handleDeleteAsset(id) {
    if (!confirm("Are you sure you want to delete this audio file?")) return;

    try {
      await deleteAudioAsset(id);
      await loadAudioAssets();

      // Remove from selections if deleted
      if (backgroundMusic?.id === id) backgroundMusic = null;
      soundEffects = soundEffects.filter((sfx) => sfx.id !== id);

      addNotification("Audio file deleted successfully", "success");
    } catch (error) {
      console.error("Delete failed:", error);
      addNotification("Failed to delete audio file", "error");
    }
  }

  function togglePlayback() {
    if (!audioElement || !processedAudio) return;

    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play();
    }
  }

  function stopPlayback() {
    if (!audioElement) return;
    audioElement.pause();
    audioElement.currentTime = 0;
  }

  function handleAudioPlay() {
    isPlaying = true;
  }

  function handleAudioPause() {
    isPlaying = false;
  }

  function handleAudioEnded() {
    isPlaying = false;
  }

  function downloadAudio() {
    if (!processedAudio?.path) return;

    const link = document.createElement("a");
    link.href = processedAudio.path;
    link.download = "processed-audio.mp3";
    link.click();
  }

  function checkTabCompletion() {
    const isComplete = processedAudio !== null;
    updateTabStatus("audio-sfx", isComplete, isComplete);
  }

  function proceedToNext() {
    if (processedAudio) {
      currentTab.set("subtitles");
      addNotification("Moving to Subtitles generation", "info", 2000);
    }
  }

  function formatDuration(seconds) {
    if (!seconds) return "Unknown";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  function formatFileSize(bytes) {
    if (!bytes) return "Unknown";
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  function getAudioTypeIcon(filename) {
    const ext = filename.toLowerCase().split(".").pop();
    switch (ext) {
      case "mp3":
      case "wav":
      case "flac":
        return Music;
      default:
        return Volume2;
    }
  }

  onDestroy(() => {
    unsubscribe();
  });
</script>

<div class="h-full flex">
  <!-- Left Panel - Audio Configuration -->
  <div class="w-1/2 p-6 border-r border-dark-700 overflow-y-auto">
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h2 class="text-2xl font-bold text-white mb-2">
          Audio & Sound Effects
        </h2>
        <p class="text-dark-300">
          Mix voice-over with background music and sound effects
        </p>
      </div>

      <!-- Voice-over Section -->
      <div>
        <h3 class="text-lg font-semibold text-white mb-3">Voice-over Audio</h3>
        {#if voiceoverAudio}
          <div class="bg-dark-800 rounded-lg p-4">
            <div class="flex items-center space-x-3">
              <div
                class="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center"
              >
                <Volume2 class="w-5 h-5 text-white" />
              </div>
              <div class="flex-1">
                <h4 class="font-medium text-white">Generated Voice-over</h4>
                <p class="text-dark-400 text-sm">
                  Duration: {formatDuration(voiceoverAudio.duration)}
                </p>
              </div>
            </div>
          </div>
        {:else}
          <div class="bg-dark-800 rounded-lg p-4 text-center">
            <Volume2 class="w-8 h-8 text-dark-600 mx-auto mb-2" />
            <p class="text-dark-400 text-sm">
              No voice-over available. Generate one in the Voice-over tab.
            </p>
          </div>
        {/if}
      </div>

      <!-- Upload Section -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-lg font-semibold text-white">Audio Library</h3>
          <button
            on:click={() => fileInput?.click()}
            disabled={isUploading}
            class="btn-secondary flex items-center space-x-2"
          >
            {#if isUploading}
              <div
                class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"
              ></div>
              <span>Uploading...</span>
            {:else}
              <Upload class="w-4 h-4" />
              <span>Upload Audio</span>
            {/if}
          </button>
        </div>

        <input
          bind:this={fileInput}
          type="file"
          accept="audio/*"
          on:change={handleFileUpload}
          class="hidden"
        />

        {#if isLoading}
          <div class="text-center py-4">
            <div
              class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto mb-2"
            ></div>
            <p class="text-dark-400 text-sm">Loading audio files...</p>
          </div>
        {:else if audioAssets.length === 0}
          <div class="bg-dark-800 rounded-lg p-6 text-center">
            <Music class="w-8 h-8 text-dark-600 mx-auto mb-2" />
            <p class="text-dark-400 text-sm">
              No audio files yet. Upload music or sound effects to get started.
            </p>
          </div>
        {:else}
          <div class="space-y-2">
            {#each audioAssets as asset (asset.id)}
              <div class="bg-dark-800 rounded-lg p-3">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3 flex-1 min-w-0">
                    <svelte:component
                      this={getAudioTypeIcon(asset.filename)}
                      class="w-5 h-5 text-dark-400 flex-shrink-0"
                    />
                    <div class="flex-1 min-w-0">
                      <h4 class="font-medium text-white text-sm truncate">
                        {asset.filename}
                      </h4>
                      <p class="text-dark-400 text-xs">
                        {formatDuration(asset.duration)} • {formatFileSize(
                          asset.size,
                        )}
                      </p>
                    </div>
                  </div>

                  <div class="flex items-center space-x-2">
                    <button
                      on:click={() => selectBackgroundMusic(asset)}
                      class="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition-colors"
                      title="Use as background music"
                    >
                      Music
                    </button>
                    <button
                      on:click={() => addSoundEffect(asset)}
                      class="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded transition-colors"
                      title="Add as sound effect"
                    >
                      SFX
                    </button>
                    <button
                      on:click={() => handleDeleteAsset(asset.id)}
                      class="text-red-400 hover:text-red-300 transition-colors"
                      title="Delete"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Selected Audio -->
      <div class="space-y-4">
        <!-- Background Music -->
        <div>
          <h4 class="font-medium text-white mb-2">Background Music</h4>
          {#if backgroundMusic}
            <div
              class="bg-dark-900 rounded p-3 flex items-center justify-between"
            >
              <div class="flex items-center space-x-2">
                <Music class="w-4 h-4 text-blue-400" />
                <span class="text-white text-sm"
                  >{backgroundMusic.filename}</span
                >
              </div>
              <button
                on:click={() => (backgroundMusic = null)}
                class="text-red-400 hover:text-red-300"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          {:else}
            <p class="text-dark-400 text-sm">No background music selected</p>
          {/if}
        </div>

        <!-- Sound Effects -->
        <div>
          <h4 class="font-medium text-white mb-2">
            Sound Effects ({soundEffects.length})
          </h4>
          {#if soundEffects.length > 0}
            <div class="space-y-2">
              {#each soundEffects as sfx, index (sfx.id)}
                <div class="bg-dark-900 rounded p-3">
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center space-x-2">
                      <Volume2 class="w-4 h-4 text-green-400" />
                      <span class="text-white text-sm">{sfx.filename}</span>
                    </div>
                    <button
                      on:click={() => removeSoundEffect(index)}
                      class="text-red-400 hover:text-red-300"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>

                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-xs text-dark-400 mb-1"
                        >Start Time (s)</label
                      >
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={sfx.startTime}
                        on:input={(e) => updateSfxTiming(index, e.target.value)}
                        class="w-full bg-dark-800 border border-dark-600 rounded px-2 py-1 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label class="block text-xs text-dark-400 mb-1"
                        >Volume ({sfx.volume.toFixed(1)})</label
                      >
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={sfx.volume}
                        on:input={(e) => updateSfxVolume(index, e.target.value)}
                        class="w-full h-1 bg-dark-700 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          {:else}
            <p class="text-dark-400 text-sm">No sound effects added</p>
          {/if}
        </div>
      </div>

      <!-- Audio Settings -->
      <div>
        <h3
          class="text-lg font-semibold text-white mb-3 flex items-center space-x-2"
        >
          <Sliders class="w-5 h-5" />
          <span>Mix Settings</span>
        </h3>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-dark-300 mb-2">
              Voice-over Volume: {audioSettings.voiceoverVolume.toFixed(1)}
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              bind:value={audioSettings.voiceoverVolume}
              class="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-dark-300 mb-2">
              Background Music Volume: {audioSettings.musicVolume.toFixed(1)}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              bind:value={audioSettings.musicVolume}
              class="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-dark-300 mb-2"
                >Fade In (s)</label
              >
              <input
                type="number"
                min="0"
                max="10"
                step="0.5"
                bind:value={audioSettings.fadeInDuration}
                class="w-full bg-dark-800 border border-dark-600 rounded px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-dark-300 mb-2"
                >Fade Out (s)</label
              >
              <input
                type="number"
                min="0"
                max="10"
                step="0.5"
                bind:value={audioSettings.fadeOutDuration}
                class="w-full bg-dark-800 border border-dark-600 rounded px-3 py-2 text-white text-sm"
              />
            </div>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-sm text-dark-300">Audio Normalization</span>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                bind:checked={audioSettings.normalize}
                class="sr-only peer"
              />
              <div
                class="w-11 h-6 bg-dark-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"
              ></div>
            </label>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-sm text-dark-300">Dynamic Compression</span>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                bind:checked={audioSettings.compressor}
                class="sr-only peer"
              />
              <div
                class="w-11 h-6 bg-dark-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"
              ></div>
            </label>
          </div>
        </div>
      </div>

      <!-- Process Button -->
      <div>
        <button
          on:click={processAudioMix}
          disabled={isProcessing || !voiceoverAudio}
          class="w-full btn-primary flex items-center justify-center space-x-2 py-3"
        >
          {#if isProcessing}
            <div
              class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"
            ></div>
            <span>Processing Audio Mix...</span>
          {:else}
            <Sliders class="w-5 h-5" />
            <span>Process Audio Mix</span>
          {/if}
        </button>
      </div>

      <!-- Continue Button -->
      {#if processedAudio}
        <div class="flex space-x-3">
          <button
            on:click={proceedToNext}
            class="flex-1 btn-primary flex items-center justify-center space-x-2"
          >
            <span>Continue to Subtitles</span>
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>
      {/if}
    </div>
  </div>

  <!-- Right Panel - Audio Preview -->
  <div class="w-1/2 p-6 overflow-y-auto">
    <div class="space-y-6">
      <div>
        <h3 class="text-lg font-semibold text-white mb-4">Audio Preview</h3>

        {#if processedAudio}
          <!-- Audio Player -->
          <div class="bg-dark-800 rounded-lg p-6">
            <div class="text-center mb-6">
              <div
                class="w-24 h-24 bg-gradient-to-br from-green-600 to-green-800 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Volume2 class="w-12 h-12 text-white" />
              </div>
              <h4 class="text-lg font-medium text-white mb-2">
                Processed Audio Mix
              </h4>
              <p class="text-dark-300 text-sm">
                Voice-over + Background Music + Sound Effects
              </p>
            </div>

            <!-- Audio Element -->
            <audio
              bind:this={audioElement}
              src={processedAudio.path}
              on:play={handleAudioPlay}
              on:pause={handleAudioPause}
              on:ended={handleAudioEnded}
              class="w-full mb-4"
              controls
            ></audio>

            <!-- Control Buttons -->
            <div class="flex items-center justify-center space-x-4 mb-6">
              <button
                on:click={togglePlayback}
                class="w-12 h-12 bg-primary-600 hover:bg-primary-700 rounded-full flex items-center justify-center transition-colors"
                title={isPlaying ? "Pause" : "Play"}
              >
                {#if isPlaying}
                  <Pause class="w-6 h-6 text-white" />
                {:else}
                  <Play class="w-6 h-6 text-white ml-1" />
                {/if}
              </button>

              <button
                on:click={stopPlayback}
                class="w-10 h-10 bg-dark-600 hover:bg-dark-500 rounded-full flex items-center justify-center transition-colors"
                title="Stop"
              >
                <Square class="w-5 h-5 text-white" />
              </button>

              <button
                on:click={downloadAudio}
                class="w-10 h-10 bg-dark-600 hover:bg-dark-500 rounded-full flex items-center justify-center transition-colors"
                title="Download"
              >
                <Download class="w-5 h-5 text-white" />
              </button>
            </div>

            <!-- Audio Info -->
            <div class="bg-dark-900 rounded p-4">
              <h5 class="font-medium text-white mb-3">Mix Information</h5>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-dark-400">Duration:</span>
                  <span class="text-white"
                    >{formatDuration(processedAudio.duration)}</span
                  >
                </div>
                <div class="flex justify-between">
                  <span class="text-dark-400">File Size:</span>
                  <span class="text-white"
                    >{formatFileSize(processedAudio.size)}</span
                  >
                </div>
                <div class="flex justify-between">
                  <span class="text-dark-400">Background Music:</span>
                  <span class="text-white"
                    >{backgroundMusic?.filename || "None"}</span
                  >
                </div>
                <div class="flex justify-between">
                  <span class="text-dark-400">Sound Effects:</span>
                  <span class="text-white">{soundEffects.length} files</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-dark-400">Normalization:</span>
                  <span class="text-white"
                    >{processedAudio.settings.normalize
                      ? "Enabled"
                      : "Disabled"}</span
                  >
                </div>
              </div>
            </div>
          </div>
        {:else}
          <!-- Empty State -->
          <div class="text-center py-12">
            <div
              class="w-24 h-24 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Sliders class="w-12 h-12 text-dark-600" />
            </div>
            <h4 class="text-lg font-medium text-dark-400 mb-2">
              No audio mix processed
            </h4>
            <p class="text-dark-500 text-sm">
              Configure your audio settings and click "Process Audio Mix" to
              create the final audio
            </p>
          </div>
        {/if}
      </div>
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
