<script>
  import { onMount, onDestroy } from "svelte";
  import {
    Mic,
    Play,
    Pause,
    Square,
    Volume2,
    Download,
    RefreshCw,
    ChevronRight,
    Settings,
  } from "lucide-svelte";
  import {
    projectContext,
    updateTabStatus,
    addNotification,
    currentTab,
  } from "../../stores/appStore.js";
  import { generateTTS, listVoices } from "../../lib/api.js";

  let script = "";
  let selectedVoice = "en_US-amy-medium";
  let speed = 1.0;
  let pitch = 1.0;
  let isGenerating = false;
  let isPlaying = false;
  let generatedAudio = null;
  let audioElement;
  let availableVoices = [];
  let isLoadingVoices = false;
  let showAdvancedSettings = false;
  let voiceInfo = null;

  // Voice settings
  let voiceSettings = {
    volume: 1.0,
    emphasis: "normal",
    pauseLength: "normal",
  };

  // Subscribe to project context
  const unsubscribe = projectContext.subscribe((context) => {
    script = context.script.generated || "";
    if (context.voiceover.audioPath) {
      generatedAudio = {
        path: context.voiceover.audioPath,
        voice: context.voiceover.voice,
        settings: context.voiceover.settings,
      };
    }
  });

  $: voiceInfo = generatedAudio ? getVoiceInfo(generatedAudio.voice) : null;

  onMount(async () => {
    await loadVoices();
    checkTabCompletion();
  });

  async function loadVoices() {
    isLoadingVoices = true;
    try {
      availableVoices = await listVoices();
      if (availableVoices.length > 0 && !selectedVoice) {
        selectedVoice = availableVoices[0].id;
      }
    } catch (error) {
      console.error("Failed to load voices:", error);
      addNotification("Failed to load voice options", "error");

      // Fallback to default voices
      availableVoices = [
        {
          id: "en_US-amy-medium",
          name: "Amy (English US)",
          language: "en-US",
          gender: "female",
        },
        {
          id: "en_US-ryan-medium",
          name: "Ryan (English US)",
          language: "en-US",
          gender: "male",
        },
        {
          id: "en_GB-alba-medium",
          name: "Alba (English UK)",
          language: "en-GB",
          gender: "female",
        },
        {
          id: "en_GB-northern_english_male-medium",
          name: "Northern Male (English UK)",
          language: "en-GB",
          gender: "male",
        },
      ];
    } finally {
      isLoadingVoices = false;
    }
  }

  async function generateVoiceover() {
    if (!script.trim()) {
      addNotification("Please enter or generate a script first", "error");
      return;
    }

    isGenerating = true;

    try {
      addNotification("Generating voice-over...", "info");

      const result = await generateTTS({
        text: script,
        voice: selectedVoice,
        speed,
        pitch,
        ...voiceSettings,
      });

      // TTS response: { id, path, relativePath, voice, speed, textLength, generatedAt }
      generatedAudio = {
        id: result.id,
        path: result.path,
        relativePath: result.relativePath,
        voice: result.voice || selectedVoice,
        settings: { speed, pitch, ...voiceSettings },
        duration: null, // Duration not in TTS response, will be set from audio analysis
        size: null, // Size not in TTS response
      };

      // Update project context with new contract
      projectContext.update((context) => ({
        ...context,
        voiceover: {
          audioPath: result.path, // Absolute path for processing
          voice: result.voice || selectedVoice,
          settings: { speed, pitch, ...voiceSettings },
          generated: true,
          duration: null, // Will be updated after audio analysis
        },
      }));

      addNotification("Voice-over generated successfully!", "success");
      checkTabCompletion();
    } catch (error) {
      console.error("TTS generation failed:", error);
      addNotification(
        error.message || "Failed to generate voice-over",
        "error",
      );
    } finally {
      isGenerating = false;
    }
  }

  function togglePlayback() {
    if (!audioElement || !generatedAudio) return;

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
    if (!generatedAudio?.path) return;

    const link = document.createElement("a");
    link.href = generatedAudio.path;
    link.download = "voiceover.mp3";
    link.click();
  }

  function regenerateVoiceover() {
    generatedAudio = null;
    projectContext.update((context) => ({
      ...context,
      voiceover: {
        audioPath: null,
        voice: null,
        settings: null,
        generated: false,
        duration: null,
      },
    }));
    generateVoiceover();
  }

  function checkTabCompletion() {
    const isComplete = generatedAudio !== null;
    updateTabStatus("voiceover", isComplete, isComplete);
  }

  function proceedToNext() {
    if (generatedAudio) {
      currentTab.set("audio-sfx");
      addNotification("Moving to Audio & SFX", "info", 2000);
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

  function getVoiceInfo(voiceId) {
    return (
      availableVoices.find((v) => v.id === voiceId) || {
        name: voiceId,
        language: "Unknown",
        gender: "Unknown",
      }
    );
  }

  onDestroy(() => {
    unsubscribe();
  });
</script>

<div class="h-full flex">
  <!-- Left Panel - Voice Configuration -->
  <div class="w-1/2 p-6 border-r border-dark-700 overflow-y-auto">
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h2 class="text-2xl font-bold text-white mb-2">
          Voice-over Generation
        </h2>
        <p class="text-dark-300">Convert your script to high-quality speech</p>
      </div>

      <!-- Script Preview -->
      <div>
        <h3 class="text-lg font-semibold text-white mb-3">Script Text</h3>
        <div class="bg-dark-800 rounded-lg p-4 max-h-48 overflow-y-auto">
          {#if script.trim()}
            <p class="text-white text-sm leading-relaxed whitespace-pre-wrap">
              {script}
            </p>
            <div class="mt-3 text-xs text-dark-400">
              Character count: {script.length} | Estimated duration: ~{Math.ceil(
                script.length / 12,
              )} seconds
            </div>
          {:else}
            <p class="text-dark-400 text-sm italic">
              No script available. Please generate a script first in the Story &
              Script tab.
            </p>
          {/if}
        </div>
      </div>

      <!-- Voice Selection -->
      <div>
        <h3 class="text-lg font-semibold text-white mb-3">Voice Selection</h3>
        <div class="space-y-4">
          {#if isLoadingVoices}
            <div class="text-center py-4">
              <div
                class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto mb-2"
              ></div>
              <p class="text-dark-400 text-sm">Loading voices...</p>
            </div>
          {:else}
            <select
              bind:value={selectedVoice}
              class="w-full bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-white focus:border-primary-500 focus:outline-none"
            >
              {#each availableVoices as voice}
                <option value={voice.id}>
                  {voice.name} ({voice.language} • {voice.gender})
                </option>
              {/each}
            </select>

            {#if selectedVoice}
              {@const voiceInfo = getVoiceInfo(selectedVoice)}
              <div class="bg-dark-900 rounded p-3 text-xs">
                <div class="text-dark-300">
                  <strong class="text-white">{voiceInfo.name}</strong><br />
                  Language: {voiceInfo.language} • Gender: {voiceInfo.gender}
                </div>
              </div>
            {/if}
          {/if}
        </div>
      </div>

      <!-- Basic Settings -->
      <div>
        <h3 class="text-lg font-semibold text-white mb-3">Voice Settings</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-dark-300 mb-2">
              Speed: {speed.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              bind:value={speed}
              class="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div class="flex justify-between text-xs text-dark-500 mt-1">
              <span>0.5x (Slow)</span>
              <span>1.0x (Normal)</span>
              <span>2.0x (Fast)</span>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-dark-300 mb-2">
              Pitch: {pitch.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              bind:value={pitch}
              class="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div class="flex justify-between text-xs text-dark-500 mt-1">
              <span>0.5x (Low)</span>
              <span>1.0x (Normal)</span>
              <span>2.0x (High)</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Advanced Settings -->
      <div>
        <button
          on:click={() => (showAdvancedSettings = !showAdvancedSettings)}
          class="flex items-center space-x-2 text-dark-300 hover:text-white transition-colors"
        >
          <Settings class="w-4 h-4" />
          <span>Advanced Settings</span>
          <div
            class="transform transition-transform {showAdvancedSettings
              ? 'rotate-180'
              : ''}"
          >
            <ChevronRight class="w-4 h-4" />
          </div>
        </button>

        {#if showAdvancedSettings}
          <div class="mt-4 space-y-4 pl-4 border-l-2 border-dark-700">
            <div>
              <label class="block text-sm font-medium text-dark-300 mb-2">
                Volume: {voiceSettings.volume.toFixed(1)}
              </label>
              <input
                type="range"
                min="0.1"
                max="2.0"
                step="0.1"
                bind:value={voiceSettings.volume}
                class="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-dark-300 mb-2"
                >Emphasis</label
              >
              <select
                bind:value={voiceSettings.emphasis}
                class="w-full bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="none">None</option>
                <option value="reduced">Reduced</option>
                <option value="normal">Normal</option>
                <option value="moderate">Moderate</option>
                <option value="strong">Strong</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-dark-300 mb-2"
                >Pause Length</label
              >
              <select
                bind:value={voiceSettings.pauseLength}
                class="w-full bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="none">No Pauses</option>
                <option value="x-weak">Extra Short</option>
                <option value="weak">Short</option>
                <option value="normal">Normal</option>
                <option value="strong">Long</option>
                <option value="x-strong">Extra Long</option>
              </select>
            </div>
          </div>
        {/if}
      </div>

      <!-- Generate Button -->
      <div>
        <button
          on:click={generateVoiceover}
          disabled={isGenerating || !script.trim()}
          class="w-full btn-primary flex items-center justify-center space-x-2 py-3"
        >
          {#if isGenerating}
            <div
              class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"
            ></div>
            <span>Generating Voice-over...</span>
          {:else}
            <Mic class="w-5 h-5" />
            <span>Generate Voice-over</span>
          {/if}
        </button>
      </div>

      <!-- Continue Button -->
      {#if generatedAudio}
        <div class="flex space-x-3">
          <button
            on:click={proceedToNext}
            class="flex-1 btn-primary flex items-center justify-center space-x-2"
          >
            <span>Continue to Audio & SFX</span>
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>
      {/if}
    </div>
  </div>

  <!-- Right Panel - Audio Preview & Controls -->
  <div class="w-1/2 p-6 overflow-y-auto">
    <div class="space-y-6">
      <div>
        <h3 class="text-lg font-semibold text-white mb-4">Audio Preview</h3>

        {#if generatedAudio}
          <!-- Audio Player -->
          <div class="bg-dark-800 rounded-lg p-6">
            <div class="text-center mb-6">
              <div
                class="w-24 h-24 bg-gradient-to-br from-primary-600 to-primary-800 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Volume2 class="w-12 h-12 text-white" />
              </div>
              <h4 class="text-lg font-medium text-white mb-2">
                Voice-over Generated
              </h4>
              <p class="text-dark-300 text-sm" aria-live="polite">
                {voiceInfo?.name}
              </p>
            </div>

            <!-- Audio Element -->
            <audio
              bind:this={audioElement}
              src={generatedAudio.path}
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

              <button
                on:click={regenerateVoiceover}
                class="w-10 h-10 bg-dark-600 hover:bg-dark-500 rounded-full flex items-center justify-center transition-colors"
                title="Regenerate"
              >
                <RefreshCw class="w-5 h-5 text-white" />
              </button>
            </div>

            <!-- Audio Info -->
            <div class="bg-dark-900 rounded p-4">
              <h5 class="font-medium text-white mb-3">Audio Information</h5>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="text-dark-400">Duration:</span>
                  <span class="text-white ml-2"
                    >{formatDuration(generatedAudio.duration)}</span
                  >
                </div>
                <div>
                  <span class="text-dark-400">File Size:</span>
                  <span class="text-white ml-2"
                    >{formatFileSize(generatedAudio.size)}</span
                  >
                </div>
                <div>
                  <span class="text-dark-400">Voice:</span>
                  <span class="text-white ml-2"
                    >{getVoiceInfo(generatedAudio.voice).name}</span
                  >
                </div>
                <div>
                  <span class="text-dark-400">Settings:</span>
                  <span class="text-white ml-2">
                    Speed {generatedAudio.settings.speed}x, Pitch {generatedAudio
                      .settings.pitch}x
                  </span>
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
              <Mic class="w-12 h-12 text-dark-600" />
            </div>
            <h4 class="text-lg font-medium text-dark-400 mb-2">
              No voice-over generated
            </h4>
            <p class="text-dark-500 text-sm">
              Configure your voice settings and click "Generate Voice-over" to
              create audio
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
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    border: 2px solid #1e293b;
  }

  .slider::-moz-range-thumb {
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    border: 2px solid #1e293b;
  }
</style>
