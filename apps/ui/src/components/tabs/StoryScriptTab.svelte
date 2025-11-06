<script>
  import { onMount, onDestroy } from "svelte";
  import {
    Sparkles,
    Copy,
    RotateCcw,
    ChevronRight,
    Download,
    TrendingUp,
    Target,
  } from "lucide-svelte";
  import {
    projectContext,
    updateTabStatus,
    addNotification,
    currentTab,
  } from "../../stores/appStore.js";
  import { generateScript, calculateViralityScore } from "../../lib/api.js";
  import { get } from "svelte/store";
  import { logError } from "../../lib/utils.js";
  import AIDirector from "../AIDirector.svelte";

  let script = "";
  let topic = "";
  let genre = "horror";
  let isGenerating = false;
  let generated = {
    script: "",
    hooks: [],
    hashtags: [],
    generatedAt: null,
  };
  let wordCount = 0;
  let estimatedDuration = 0;
  let pacingHint = "Balanced pacing";
  let narrativeDensity = "Standard";
  let viralityScore = null;
  let isCalculatingScore = false;

  const genres = [
    {
      value: "horror",
      label: "Horror",
      description: "Scary stories and supernatural events",
    },
    {
      value: "mystery",
      label: "Mystery",
      description: "Puzzles, investigations, and hidden secrets",
    },
    {
      value: "paranormal",
      label: "Paranormal",
      description: "Unexplained phenomena and ghostly encounters",
    },
    {
      value: "true crime",
      label: "True Crime",
      description: "Real criminal cases and investigations",
    },
  ];

  let syncTimer;

  // Subscribe to project context
  const unsubscribe = projectContext.subscribe((context) => {
    script = context.script.text;
    topic = context.script.topic;
    genre = context.script.genre;
    generated = {
      script: context.script.text,
      hooks: context.script.hooks,
      hashtags: context.script.hashtags,
      generatedAt: context.script.generatedAt,
    };
  });

  onMount(() => {
    checkTabCompletion();
  });

  $: {
    if (script) {
      const words = script.trim().split(/\s+/).filter(Boolean);
      wordCount = words.length;
      const wordsPerSecond = 2.5;
      estimatedDuration = Math.max(15, Math.round(wordCount / wordsPerSecond));

      if (estimatedDuration > 75) {
        pacingHint = "Consider trimming for tighter pacing";
      } else if (estimatedDuration < 40) {
        pacingHint = "Plenty of room for dramatic pauses";
      } else {
        pacingHint = "Balanced pacing";
      }

      narrativeDensity =
        wordCount > 180
          ? "High density – consider splitting across segments"
          : wordCount < 90
            ? "Light density – add vivid descriptors"
            : "Standard";
    } else {
      wordCount = 0;
      estimatedDuration = 0;
      pacingHint = "Balanced pacing";
      narrativeDensity = "Standard";
    }
  }

  function downloadProjectBrief() {
    const snapshot = get(projectContext);
    const brief = {
      generatedAt: new Date().toISOString(),
      script: snapshot.script,
      background: snapshot.background,
      voiceover: snapshot.voiceover,
      export: snapshot.export,
      analytics: {
        wordCount,
        estimatedDurationSeconds: estimatedDuration,
        pacingHint,
        narrativeDensity,
      },
    };

    const blob = new Blob([JSON.stringify(brief, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `video-orchestrator-brief-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addNotification("Project brief downloaded", "success", 2500);
  }

  async function handleGenerateScript() {
    if (!topic.trim()) {
      addNotification("Please enter a topic for your story", "error");
      return;
    }

    isGenerating = true;

    try {
      addNotification("Generating script...", "info");

      const result = await generateScript({
        topic: topic.trim(),
        genre,
        duration: 60,
        style: "story",
      });

      generated = {
        script: result.script,
        hooks: result.hooks || [],
        hashtags: result.hashtags || [],
        generatedAt: result.metadata?.generatedAt || new Date().toISOString(),
      };

      script = result.script;

      // Update project context
      projectContext.update((context) => ({
        ...context,
        script: {
          text: result.script,
          topic,
          genre,
          hooks: result.hooks || [],
          hashtags: result.hashtags || [],
          generatedAt: result.metadata?.generatedAt || new Date().toISOString(),
        },
      }));

      addNotification("Script generated successfully!", "success");
      checkTabCompletion();

      // Calculate virality score automatically
      await handleCalculateViralityScore();
    } catch (error) {
      logError("Script generation failed:", error);
      addNotification(error.message || "Failed to generate script", "error");
    } finally {
      isGenerating = false;
    }
  }

  async function handleCalculateViralityScore() {
    if (!script.trim()) {
      addNotification("Please generate or enter a script first", "error");
      return;
    }

    isCalculatingScore = true;

    try {
      const result = await calculateViralityScore({
        script: script.trim(),
        genre,
        duration: estimatedDuration,
        hasVideo: true,
        hasAudio: true,
        hasSubtitles: true,
      });

      viralityScore = result;
      addNotification(
        `Virality score: ${result.score}/100 (${result.category})`,
        "success",
      );
    } catch (error) {
      logError("Virality score calculation failed:", error);
      addNotification(
        error.message || "Failed to calculate virality score",
        "error",
      );
    } finally {
      isCalculatingScore = false;
    }
  }

  function getScoreColor(score) {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    if (score >= 40) return "text-orange-400";
    return "text-red-400";
  }

  function getCategoryLabel(category) {
    const labels = {
      viral: "Viral",
      "high-potential": "High Potential",
      good: "Good",
      moderate: "Moderate",
      "needs-improvement": "Needs Work",
    };
    return labels[category] || category;
  }

  function handleScriptChange() {
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => {
      projectContext.update((context) => ({
        ...context,
        script: {
          ...context.script,
          text: script,
          topic,
          genre,
        },
      }));
      checkTabCompletion();
    }, 150);
  }

  function checkTabCompletion() {
    const isComplete = script.trim().length > 50; // Minimum script length
    updateTabStatus("story-script", isComplete, isComplete);
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    addNotification("Copied to clipboard!", "success", 2000);
  }

  function proceedToNext() {
    if (script.trim().length > 50) {
      currentTab.set("background");
      addNotification("Moving to Background selection", "info", 2000);
    }
  }

  onDestroy(() => {
    unsubscribe();
    clearTimeout(syncTimer);
  });
</script>

<div class="h-full flex">
  <!-- Left Panel - Input & Controls -->
  <div class="w-1/2 p-6 border-r border-dark-700 overflow-y-auto">
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h2 class="text-2xl font-bold text-white mb-2">
          Story & Script Generation
        </h2>
        <p class="text-dark-300">
          Create engaging scripts for your vertical videos using AI
        </p>
      </div>

      <!-- Topic Input -->
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Story Topic *
        </label>
        <input
          type="text"
          bind:value={topic}
          placeholder="e.g., haunted house, mysterious disappearance, urban legend..."
          class="form-input"
          disabled={isGenerating}
          on:input={handleScriptChange}
        />
        <p class="text-xs text-dark-400 mt-1">
          Describe what your story should be about
        </p>
      </div>

      <!-- Genre Selection -->
      <div>
        <label class="block text-sm font-medium text-white mb-3"> Genre </label>
        <div class="grid grid-cols-2 gap-3">
          {#each genres as genreOption}
            <label
              class="flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors
                          {genre === genreOption.value
                ? 'border-primary-500 bg-primary-500/10'
                : 'border-dark-600 hover:border-dark-500'}"
            >
              <input
                type="radio"
                bind:group={genre}
                value={genreOption.value}
                class="mt-1"
                disabled={isGenerating}
                on:change={handleScriptChange}
              />
              <div>
                <div class="font-medium text-white">{genreOption.label}</div>
                <div class="text-xs text-dark-400">
                  {genreOption.description}
                </div>
              </div>
            </label>
          {/each}
        </div>
      </div>

      <!-- Generate Button -->
      <button
        on:click={handleGenerateScript}
        disabled={!topic.trim() || isGenerating}
        class="w-full btn-primary flex items-center justify-center space-x-2 py-3"
      >
        {#if isGenerating}
          <div
            class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"
          ></div>
          <span>Generating Script...</span>
        {:else}
          <Sparkles class="w-4 h-4" />
          <span>Generate Script with AI</span>
        {/if}
      </button>

      <!-- Manual Script Option -->
      <div class="border-t border-dark-700 pt-6">
        <label class="block text-sm font-medium text-white mb-2">
          Or write your script manually
        </label>
        <textarea
          bind:value={script}
          placeholder="Write your video script here..."
          class="form-textarea h-32"
          disabled={isGenerating}
          on:input={handleScriptChange}
        ></textarea>
        <p class="text-xs text-dark-400 mt-1">
          Minimum 50 characters required to proceed
        </p>
      </div>

      <!-- Action Buttons -->
      {#if script.trim().length > 50}
        <div class="flex space-x-3">
          <button
            on:click={proceedToNext}
            class="flex-1 btn-primary flex items-center justify-center space-x-2"
          >
            <span>Continue to Background</span>
            <ChevronRight class="w-4 h-4" />
          </button>

          <button
            on:click={() => copyToClipboard(script)}
            class="btn-secondary px-4"
            title="Copy script"
          >
            <Copy class="w-4 h-4" />
          </button>

          <button
            on:click={() => {
              script = "";
              topic = "";
              handleScriptChange();
            }}
            class="btn-secondary px-4"
            title="Reset"
          >
            <RotateCcw class="w-4 h-4" />
          </button>
        </div>
      {/if}
    </div>
  </div>

  <!-- Right Panel - Generated Content Preview -->
  <div class="w-1/2 p-6 overflow-y-auto">
    <div class="space-y-6">
      <div>
        <h3 class="text-lg font-semibold text-white mb-4">Generated Content</h3>

        <div
          class="grid grid-cols-2 gap-3 border border-dark-700 rounded-lg p-4 bg-dark-800 mb-4"
        >
          <div>
            <div class="text-xs uppercase text-dark-400">Word Count</div>
            <div class="text-white text-lg font-semibold">{wordCount}</div>
          </div>
          <div>
            <div class="text-xs uppercase text-dark-400">Est. Duration</div>
            <div class="text-white text-lg font-semibold">
              {estimatedDuration}s
            </div>
          </div>
          <div class="col-span-2">
            <div class="text-xs uppercase text-dark-400">Pacing Insight</div>
            <div class="text-sm text-dark-200">{pacingHint}</div>
          </div>
          <div class="col-span-2">
            <div class="text-xs uppercase text-dark-400">Narrative Density</div>
            <div class="text-sm text-dark-200">{narrativeDensity}</div>
          </div>
          <div class="col-span-2">
            <button
              class="btn-secondary w-full flex items-center justify-center space-x-2"
              on:click={downloadProjectBrief}
              type="button"
            >
              <Download class="h-4 w-4" />
              <span>Download Project Brief</span>
            </button>
          </div>
        </div>

        {#if generated.script && generated.generatedAt}
          <!-- Virality Score Card -->
          {#if viralityScore}
            <div
              class="bg-gradient-to-br from-primary-600/20 to-purple-600/20 border border-primary-500/30 rounded-lg p-4 mb-4"
            >
              <div class="flex items-center justify-between mb-3">
                <h4 class="font-medium text-white flex items-center gap-2">
                  <TrendingUp class="w-4 h-4" />
                  Virality Prediction
                </h4>
                <button
                  on:click={handleCalculateViralityScore}
                  disabled={isCalculatingScore}
                  class="text-xs text-primary-300 hover:text-primary-200 transition-colors"
                >
                  {isCalculatingScore ? "Calculating..." : "Recalculate"}
                </button>
              </div>

              <div class="grid grid-cols-2 gap-4 mb-4">
                <div class="text-center">
                  <div class="text-xs uppercase text-dark-400 mb-1">Score</div>
                  <div
                    class="text-4xl font-bold {getScoreColor(
                      viralityScore.score,
                    )}"
                  >
                    {viralityScore.score}
                  </div>
                  <div class="text-xs text-dark-300">out of 100</div>
                </div>
                <div class="text-center">
                  <div class="text-xs uppercase text-dark-400 mb-1">
                    Category
                  </div>
                  <div class="text-lg font-semibold text-white mb-1">
                    {getCategoryLabel(viralityScore.category)}
                  </div>
                  <div class="text-xs text-dark-300">
                    {viralityScore.predictedViews?.min?.toLocaleString() || 0} -
                    {viralityScore.predictedViews?.max?.toLocaleString() || 0} views
                  </div>
                </div>
              </div>

              <!-- Metrics Breakdown -->
              <div class="space-y-2 mb-4">
                <div class="text-xs uppercase text-dark-400 mb-2">
                  Metrics Breakdown
                </div>
                {#each Object.entries(viralityScore.metrics) as [key, value]}
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-dark-200 capitalize"
                      >{key.replace(/([A-Z])/g, " $1").trim()}</span
                    >
                    <div class="flex items-center gap-2">
                      <div
                        class="w-24 h-2 bg-dark-700 rounded-full overflow-hidden"
                      >
                        <div
                          class="h-full bg-primary-500 transition-all"
                          style="width: {value}%"
                        ></div>
                      </div>
                      <span class="text-white font-medium w-10 text-right"
                        >{value}</span
                      >
                    </div>
                  </div>
                {/each}
              </div>

              <!-- Recommendations -->
              {#if viralityScore.recommendations && viralityScore.recommendations.length > 0}
                <div class="border-t border-primary-500/20 pt-3">
                  <div class="flex items-center gap-2 mb-2">
                    <Target class="w-3 h-3 text-primary-400" />
                    <span class="text-xs uppercase text-dark-400"
                      >Recommendations</span
                    >
                  </div>
                  <ul class="space-y-1">
                    {#each viralityScore.recommendations as recommendation}
                      <li class="text-xs text-dark-200 flex items-start gap-2">
                        <span class="text-primary-400 mt-0.5">•</span>
                        <span>{recommendation}</span>
                      </li>
                    {/each}
                  </ul>
                </div>
              {/if}
            </div>
          {:else if script.trim().length > 50}
            <div class="bg-dark-800 border border-dark-600 rounded-lg p-4 mb-4">
              <button
                on:click={handleCalculateViralityScore}
                disabled={isCalculatingScore}
                class="w-full btn-primary flex items-center justify-center gap-2"
              >
                {#if isCalculatingScore}
                  <div
                    class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"
                  ></div>
                  <span>Calculating Virality Score...</span>
                {:else}
                  <TrendingUp class="w-4 h-4" />
                  <span>Calculate Virality Score</span>
                {/if}
              </button>
              <p class="text-xs text-dark-400 text-center mt-2">
                Get AI-powered predictions on your video's viral potential
              </p>
            </div>
          {/if}

          <!-- Script Preview -->
          <div class="bg-dark-800 rounded-lg p-4 mb-4">
            <div class="flex items-center justify-between mb-3">
              <h4 class="font-medium text-white">Script</h4>
              <button
                on:click={() => copyToClipboard(generated.script)}
                class="text-dark-400 hover:text-white transition-colors"
                title="Copy script"
              >
                <Copy class="w-4 h-4" />
              </button>
            </div>
            <div
              class="text-dark-200 text-sm leading-relaxed whitespace-pre-wrap"
            >
              {generated.script}
            </div>
          </div>

          <!-- Hooks -->
          {#if generated.hooks.length > 0}
            <div class="bg-dark-800 rounded-lg p-4 mb-4">
              <h4 class="font-medium text-white mb-3">Engaging Hooks</h4>
              <div class="space-y-2">
                {#each generated.hooks as hook, index}
                  <div class="flex items-start space-x-2">
                    <span class="text-primary-400 font-mono text-xs mt-1"
                      >{index + 1}.</span
                    >
                    <div class="flex-1 text-dark-200 text-sm">{hook}</div>
                    <button
                      on:click={() => copyToClipboard(hook)}
                      class="text-dark-400 hover:text-white transition-colors"
                    >
                      <Copy class="w-3 h-3" />
                    </button>
                  </div>
                {/each}
              </div>
            </div>
          {/if}

          <!-- Hashtags -->
          {#if generated.hashtags.length > 0}
            <div class="bg-dark-800 rounded-lg p-4 mb-4">
              <div class="flex items-center justify-between mb-3">
                <h4 class="font-medium text-white">Hashtags</h4>
                <button
                  on:click={() => copyToClipboard(generated.hashtags.join(" "))}
                  class="text-dark-400 hover:text-white transition-colors"
                  title="Copy all hashtags"
                >
                  <Copy class="w-4 h-4" />
                </button>
              </div>
              <div class="flex flex-wrap gap-2">
                {#each generated.hashtags as hashtag}
                  <span
                    class="bg-primary-600/20 text-primary-300 px-2 py-1 rounded text-xs"
                  >
                    {hashtag}
                  </span>
                {/each}
              </div>
            </div>
          {/if}

          <!-- AI Content Director -->
          <AIDirector
            script={generated.script}
            {genre}
            on:directionsReady={(e) => {
              addNotification({
                type: "success",
                message: "AI direction complete! Ready to execute.",
                duration: 5000,
              });
            }}
            on:execute={(e) => {
              addNotification({
                type: "info",
                message: "Starting video production...",
                duration: 3000,
              });
              // TODO: Integrate with pipeline execution
            }}
          />

          <!-- Generation Info -->
          <div class="text-xs text-dark-400">
            Generated on {new Date(generated.generatedAt).toLocaleString()}
          </div>
        {:else}
          <!-- Empty State -->
          <div class="text-center py-12">
            <Sparkles class="w-16 h-16 text-dark-600 mx-auto mb-4" />
            <h4 class="text-lg font-medium text-dark-400 mb-2">
              No script generated yet
            </h4>
            <p class="text-dark-500 text-sm">
              Enter a topic and genre, then click "Generate Script with AI" to
              create your content
            </p>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  textarea {
    resize: vertical;
    min-height: 120px;
  }
</style>
