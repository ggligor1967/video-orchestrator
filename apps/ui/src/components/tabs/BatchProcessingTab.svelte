<script>
  import { onMount, onDestroy } from "svelte";
  import {
    Layers,
    Play,
    Pause,
    X,
    Trash2,
    RefreshCw,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Plus,
    FileVideo,
  } from "lucide-svelte";
  import { projectContext, addNotification } from "../../stores/appStore.js";
  import {
    createBatchJob,
    getBatchJobStatus,
    listBatchJobs,
    cancelBatchJob,
    deleteBatchJob,
  } from "../../lib/api.js";

  let batchJobs = [];
  let selectedBatchId = null;
  let batchStatus = null;
  let isCreating = false;
  let isLoading = false;
  let statusRefreshInterval = null;

  // Batch configuration
  let batchVideos = [];
  let maxConcurrent = 3;
  let stopOnError = false;

  // Subscribe to project context
  const unsubscribe = projectContext.subscribe((context) => {
    // Could pull script/genre from context if needed
  });

  onMount(async () => {
    await loadBatchJobs();
  });

  async function loadBatchJobs() {
    isLoading = true;
    try {
      const result = await listBatchJobs();
      batchJobs = result.batches || [];
    } catch (error) {
      console.error("Failed to load batch jobs:", error);
      addNotification("Failed to load batch jobs", "error");
    } finally {
      isLoading = false;
    }
  }

  async function createNewBatch() {
    if (batchVideos.length === 0) {
      addNotification("Please add at least one video to the batch", "error");
      return;
    }

    isCreating = true;

    try {
      addNotification("Creating batch job...", "info");

      const result = await createBatchJob({
        videos: batchVideos,
        config: {
          maxConcurrent,
          stopOnError,
        },
      });

      selectedBatchId = result.batchId;
      addNotification(
        `Batch job created! Processing ${result.totalVideos} videos...`,
        "success",
      );

      // Refresh list and start monitoring
      await loadBatchJobs();
      startStatusRefresh();
    } catch (error) {
      console.error("Batch creation failed:", error);
      addNotification(error.message || "Failed to create batch job", "error");
    } finally {
      isCreating = false;
    }
  }

  async function selectBatch(batchId) {
    selectedBatchId = batchId;
    await refreshBatchStatus();
    startStatusRefresh();
  }

  async function refreshBatchStatus() {
    if (!selectedBatchId) return;

    try {
      batchStatus = await getBatchJobStatus(selectedBatchId);
    } catch (error) {
      console.error("Failed to get batch status:", error);
      stopStatusRefresh();
    }
  }

  function startStatusRefresh() {
    stopStatusRefresh();
    statusRefreshInterval = setInterval(async () => {
      await refreshBatchStatus();

      // Stop refreshing if batch is complete
      if (
        batchStatus &&
        (batchStatus.status === "completed" ||
          batchStatus.status === "completed_with_errors" ||
          batchStatus.status === "cancelled")
      ) {
        stopStatusRefresh();
        await loadBatchJobs();
      }
    }, 2000);
  }

  function stopStatusRefresh() {
    if (statusRefreshInterval) {
      clearInterval(statusRefreshInterval);
      statusRefreshInterval = null;
    }
  }

  async function handleCancelBatch(batchId) {
    if (!confirm("Are you sure you want to cancel this batch job?")) return;

    try {
      await cancelBatchJob(batchId);
      addNotification("Batch job cancelled", "success");
      await loadBatchJobs();
      if (selectedBatchId === batchId) {
        await refreshBatchStatus();
      }
    } catch (error) {
      console.error("Cancel failed:", error);
      addNotification(error.message || "Failed to cancel batch job", "error");
    }
  }

  async function handleDeleteBatch(batchId) {
    if (!confirm("Are you sure you want to delete this batch job?")) return;

    try {
      await deleteBatchJob(batchId);
      addNotification("Batch job deleted", "success");
      if (selectedBatchId === batchId) {
        selectedBatchId = null;
        batchStatus = null;
        stopStatusRefresh();
      }
      await loadBatchJobs();
    } catch (error) {
      console.error("Delete failed:", error);
      addNotification("Failed to delete batch job", "error");
    }
  }

  function addVideoToBatch() {
    batchVideos = [
      ...batchVideos,
      {
        script: "",
        genre: "horror",
        preset: "tiktok",
        voiceId: "default",
        includeSubtitles: true,
      },
    ];
  }

  function removeVideoFromBatch(index) {
    batchVideos = batchVideos.filter((_, i) => i !== index);
  }

  function getStatusColor(status) {
    const colors = {
      pending: "text-gray-400",
      processing: "text-blue-400",
      completed: "text-green-400",
      completed_with_errors: "text-yellow-400",
      cancelled: "text-red-400",
      failed: "text-red-400",
    };
    return colors[status] || "text-gray-400";
  }

  function getStatusIcon(status) {
    if (status === "completed") return CheckCircle2;
    if (status === "failed" || status === "cancelled") return AlertCircle;
    return Loader2;
  }

  function formatTime(seconds) {
    if (!seconds) return "Unknown";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  }

  onDestroy(() => {
    unsubscribe();
    stopStatusRefresh();
  });
</script>

<div class="h-full flex">
  <!-- Left Panel - Batch List & Creation -->
  <div class="w-1/2 p-6 border-r border-dark-700 overflow-y-auto">
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h2 class="text-2xl font-bold text-white mb-2">Batch Processing</h2>
        <p class="text-dark-300">Process multiple videos simultaneously</p>
      </div>

      <!-- Create New Batch Section -->
      <div class="bg-dark-800 border border-dark-600 rounded-lg p-4">
        <h3 class="text-lg font-semibold text-white mb-4">Create New Batch</h3>

        <!-- Configuration -->
        <div class="space-y-4 mb-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-dark-300 mb-2">
                Max Concurrent
              </label>
              <input
                type="number"
                bind:value={maxConcurrent}
                min="1"
                max="10"
                class="form-input"
                disabled={isCreating}
              />
            </div>
            <div class="flex items-center space-x-2 pt-8">
              <input
                type="checkbox"
                bind:checked={stopOnError}
                id="stopOnError"
                disabled={isCreating}
              />
              <label for="stopOnError" class="text-sm text-dark-300">
                Stop on Error
              </label>
            </div>
          </div>

          <!-- Videos List -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="block text-sm font-medium text-dark-300">
                Videos ({batchVideos.length})
              </label>
              <button
                on:click={addVideoToBatch}
                disabled={isCreating || batchVideos.length >= 50}
                class="btn-secondary text-xs flex items-center gap-1"
              >
                <Plus class="w-3 h-3" />
                Add Video
              </button>
            </div>

            {#if batchVideos.length === 0}
              <div
                class="text-center py-4 border border-dashed border-dark-600 rounded"
              >
                <FileVideo class="w-8 h-8 text-dark-500 mx-auto mb-2" />
                <p class="text-sm text-dark-400">No videos added yet</p>
              </div>
            {:else}
              <div class="space-y-2 max-h-64 overflow-y-auto">
                {#each batchVideos as video, index}
                  <div class="bg-dark-900 rounded p-3 space-y-2">
                    <div class="flex items-center justify-between">
                      <span class="text-sm font-medium text-white"
                        >Video {index + 1}</span
                      >
                      <button
                        on:click={() => removeVideoFromBatch(index)}
                        class="text-red-400 hover:text-red-300"
                      >
                        <X class="w-4 h-4" />
                      </button>
                    </div>
                    <textarea
                      bind:value={video.script}
                      placeholder="Enter script..."
                      class="form-textarea h-16 text-xs"
                      disabled={isCreating}
                    ></textarea>
                    <div class="grid grid-cols-2 gap-2">
                      <select
                        bind:value={video.genre}
                        class="form-input text-xs"
                        disabled={isCreating}
                      >
                        <option value="horror">Horror</option>
                        <option value="mystery">Mystery</option>
                        <option value="paranormal">Paranormal</option>
                        <option value="true crime">True Crime</option>
                      </select>
                      <select
                        bind:value={video.preset}
                        class="form-input text-xs"
                        disabled={isCreating}
                      >
                        <option value="tiktok">TikTok</option>
                        <option value="youtube">YouTube</option>
                        <option value="instagram">Instagram</option>
                      </select>
                    </div>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        </div>

        <button
          on:click={createNewBatch}
          disabled={isCreating || batchVideos.length === 0}
          class="w-full btn-primary flex items-center justify-center gap-2"
        >
          {#if isCreating}
            <div
              class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"
            ></div>
            <span>Creating Batch...</span>
          {:else}
            <Layers class="w-4 h-4" />
            <span>Create Batch Job</span>
          {/if}
        </button>
      </div>

      <!-- Batch Jobs List -->
      <div>
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-white">Batch Jobs</h3>
          <button
            on:click={loadBatchJobs}
            disabled={isLoading}
            class="text-dark-400 hover:text-white transition-colors"
            title="Refresh"
          >
            <RefreshCw class="w-4 h-4 {isLoading ? 'animate-spin' : ''}" />
          </button>
        </div>

        {#if isLoading}
          <div class="text-center py-8">
            <div
              class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"
            ></div>
            <p class="text-dark-400">Loading batch jobs...</p>
          </div>
        {:else if batchJobs.length === 0}
          <div class="text-center py-8">
            <Layers class="w-12 h-12 text-dark-600 mx-auto mb-4" />
            <h4 class="text-lg font-medium text-dark-400 mb-2">
              No batch jobs yet
            </h4>
            <p class="text-dark-500 text-sm">
              Create your first batch to get started
            </p>
          </div>
        {:else}
          <div class="space-y-2">
            {#each batchJobs as job}
              {@const StatusIcon = getStatusIcon(job.status)}
              <div
                class="bg-dark-800 rounded-lg p-4 cursor-pointer transition-all border-2
                  {selectedBatchId === job.id
                  ? 'border-primary-500'
                  : 'border-transparent hover:border-dark-600'}"
                on:click={() => selectBatch(job.id)}
              >
                <div class="flex items-start justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <StatusIcon
                      class="w-4 h-4 {getStatusColor(
                        job.status,
                      )} {job.status === 'processing' ? 'animate-spin' : ''}"
                    />
                    <span class="text-white font-medium">
                      {job.totalVideos} videos
                    </span>
                  </div>
                  <div class="flex items-center gap-2">
                    {#if job.status === "processing"}
                      <button
                        on:click|stopPropagation={() =>
                          handleCancelBatch(job.id)}
                        class="text-yellow-400 hover:text-yellow-300 transition-colors"
                        title="Cancel"
                      >
                        <Pause class="w-4 h-4" />
                      </button>
                    {/if}
                    <button
                      on:click|stopPropagation={() => handleDeleteBatch(job.id)}
                      class="text-red-400 hover:text-red-300 transition-colors"
                      title="Delete"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div class="space-y-1">
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-dark-300">Progress</span>
                    <span class="text-white font-medium">{job.progress}%</span>
                  </div>
                  <div
                    class="w-full h-2 bg-dark-700 rounded-full overflow-hidden"
                  >
                    <div
                      class="h-full bg-primary-500 transition-all"
                      style="width: {job.progress}%"
                    ></div>
                  </div>
                  <div
                    class="flex items-center justify-between text-xs text-dark-400"
                  >
                    <span>Completed: {job.completedVideos}</span>
                    <span>Failed: {job.failedVideos}</span>
                  </div>
                </div>

                <div class="text-xs text-dark-500 mt-2">
                  Created: {new Date(job.createdAt).toLocaleString()}
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>

  <!-- Right Panel - Batch Status Details -->
  <div class="w-1/2 p-6 overflow-y-auto">
    <div class="space-y-6">
      <h3 class="text-lg font-semibold text-white mb-4">Batch Details</h3>

      {#if batchStatus}
        <div class="space-y-4">
          <!-- Status Overview -->
          <div class="bg-dark-800 rounded-lg p-4">
            <div class="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div class="text-xs uppercase text-dark-400">Status</div>
                <div
                  class="text-lg font-semibold {getStatusColor(
                    batchStatus.status,
                  )} capitalize"
                >
                  {batchStatus.status.replace(/_/g, " ")}
                </div>
              </div>
              <div>
                <div class="text-xs uppercase text-dark-400">Progress</div>
                <div class="text-lg font-semibold text-white">
                  {batchStatus.progress}%
                </div>
              </div>
              <div>
                <div class="text-xs uppercase text-dark-400">Completed</div>
                <div class="text-lg font-semibold text-green-400">
                  {batchStatus.completedVideos}
                </div>
              </div>
              <div>
                <div class="text-xs uppercase text-dark-400">Failed</div>
                <div class="text-lg font-semibold text-red-400">
                  {batchStatus.failedVideos}
                </div>
              </div>
            </div>

            {#if batchStatus.estimatedTimeRemaining}
              <div class="bg-dark-900 rounded p-3">
                <div class="text-xs uppercase text-dark-400 mb-1">
                  Estimated Time Remaining
                </div>
                <div class="text-white font-medium">
                  {formatTime(batchStatus.estimatedTimeRemaining)}
                </div>
              </div>
            {/if}
          </div>

          <!-- Videos List -->
          <div class="bg-dark-800 rounded-lg p-4">
            <h4 class="font-medium text-white mb-3">Videos</h4>
            <div class="space-y-2 max-h-96 overflow-y-auto">
              {#each batchStatus.videos as video}
                {@const VideoStatusIcon = getStatusIcon(video.status)}
                <div class="bg-dark-900 rounded p-3">
                  <div class="flex items-start justify-between mb-2">
                    <div class="flex items-center gap-2">
                      <VideoStatusIcon
                        class="w-4 h-4 {getStatusColor(
                          video.status,
                        )} {video.status === 'processing'
                          ? 'animate-spin'
                          : ''}"
                      />
                      <span class="text-sm text-white"
                        >Video {video.index + 1}</span
                      >
                    </div>
                    <span
                      class="text-xs {getStatusColor(video.status)} capitalize"
                    >
                      {video.status}
                    </span>
                  </div>

                  {#if video.progress > 0}
                    <div
                      class="w-full h-1 bg-dark-700 rounded-full overflow-hidden mb-2"
                    >
                      <div
                        class="h-full bg-primary-500 transition-all"
                        style="width: {video.progress}%"
                      ></div>
                    </div>
                  {/if}

                  {#if video.error}
                    <div class="text-xs text-red-400 mt-2">
                      Error: {video.error}
                    </div>
                  {/if}

                  {#if video.result}
                    <div class="text-xs text-green-400 mt-2">
                      ✓ Completed - {video.result.duration}s, {(
                        video.result.size /
                        1024 /
                        1024
                      ).toFixed(2)} MB
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          </div>
        </div>
      {:else}
        <!-- Empty State -->
        <div class="text-center py-12">
          <Layers class="w-16 h-16 text-dark-600 mx-auto mb-4" />
          <h4 class="text-lg font-medium text-dark-400 mb-2">
            No batch selected
          </h4>
          <p class="text-dark-500 text-sm">
            Select a batch job from the list to view its details
          </p>
        </div>
      {/if}
    </div>
  </div>
</div>
