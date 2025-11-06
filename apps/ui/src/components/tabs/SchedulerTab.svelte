<script>
  import { onMount, onDestroy } from "svelte";
  import {
    Calendar,
    Clock,
    Send,
    Trash2,
    RefreshCw,
    CheckCircle2,
    XCircle,
    Loader2,
    Edit3,
    Hash,
  } from "lucide-svelte";
  import { projectContext, addNotification } from "../../stores/appStore.js";
  import {
    schedulePost,
    listScheduledPosts,
    getUpcomingPosts,
    updateScheduledPost,
    cancelScheduledPost,
    deleteScheduledPost,
  } from "../../lib/api.js";

  /** @type {any[]} */
  let scheduledPosts = [];
  /** @type {any[]} */
  let upcomingPosts = [];
  /** @type {string|null} */
  let selectedPostId = null;
  let isScheduling = false;
  let isLoading = false;

  // Schedule form
  let videoPath = "";
  /** @type {string[]} */
  let platforms = [];
  let scheduledTime = "";
  let caption = "";
  let hashtags = "";

  const platformOptions = [
    { value: "tiktok", label: "TikTok", color: "bg-pink-600" },
    { value: "youtube", label: "YouTube", color: "bg-red-600" },
    { value: "instagram", label: "Instagram", color: "bg-purple-600" },
    { value: "facebook", label: "Facebook", color: "bg-blue-600" },
  ];

  // Subscribe to project context
  const unsubscribe = projectContext.subscribe((context) => {
    // Could pull export path from context
    if (context.export.path) {
      videoPath = context.export.path;
    }
  });

  onMount(async () => {
    await loadScheduledPosts();
    await loadUpcomingPosts();

    // Set default scheduled time to 1 hour from now
    const now = new Date();
    now.setHours(now.getHours() + 1);
    scheduledTime = now.toISOString().slice(0, 16);
  });

  async function loadScheduledPosts() {
    isLoading = true;
    try {
      const result = await listScheduledPosts();
      scheduledPosts = result.posts || [];
    } catch (error) {
      console.error("Failed to load scheduled posts:", error);
      addNotification("Failed to load scheduled posts", "error");
    } finally {
      isLoading = false;
    }
  }

  async function loadUpcomingPosts() {
    try {
      const result = await getUpcomingPosts(5);
      upcomingPosts = result.posts || [];
    } catch (error) {
      console.error("Failed to load upcoming posts:", error);
    }
  }

  async function handleSchedulePost() {
    if (!videoPath.trim()) {
      addNotification("Please provide a video path", "error");
      return;
    }

    if (platforms.length === 0) {
      addNotification("Please select at least one platform", "error");
      return;
    }

    if (!scheduledTime) {
      addNotification("Please select a scheduled time", "error");
      return;
    }

    isScheduling = true;

    try {
      addNotification("Scheduling post...", "info");

      const hashtagArray = hashtags
        .split(/[,\s]+/)
        .filter(Boolean)
        .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`));

      const result = await schedulePost({
        videoPath,
        platforms,
        scheduledTime: new Date(scheduledTime).toISOString(),
        caption,
        hashtags: hashtagArray,
      });

      addNotification(
        `Post scheduled successfully for ${platforms.join(", ")}!`,
        "success",
      );

      // Reset form
      caption = "";
      hashtags = "";
      platforms = [];
      const now = new Date();
      now.setHours(now.getHours() + 1);
      scheduledTime = now.toISOString().slice(0, 16);

      // Refresh lists
      await loadScheduledPosts();
      await loadUpcomingPosts();
    } catch (error) {
      console.error("Post scheduling failed:", error);
      addNotification(error.message || "Failed to schedule post", "error");
    } finally {
      isScheduling = false;
    }
  }

  async function handleCancelPost(postId) {
    if (!confirm("Are you sure you want to cancel this scheduled post?"))
      return;

    try {
      await cancelScheduledPost(postId);
      addNotification("Scheduled post cancelled", "success");
      await loadScheduledPosts();
      await loadUpcomingPosts();
    } catch (error) {
      console.error("Cancel failed:", error);
      addNotification(error.message || "Failed to cancel post", "error");
    }
  }

  async function handleDeletePost(postId) {
    if (!confirm("Are you sure you want to delete this scheduled post?"))
      return;

    try {
      await deleteScheduledPost(postId);
      addNotification("Scheduled post deleted", "success");
      await loadScheduledPosts();
      await loadUpcomingPosts();
    } catch (error) {
      console.error("Delete failed:", error);
      addNotification("Failed to delete post", "error");
    }
  }

  /**
   * @param {string} platform
   */
  function togglePlatform(platform) {
    if (platforms.includes(platform)) {
      platforms = platforms.filter((p) => p !== platform);
    } else {
      platforms = [...platforms, platform];
    }
  }

  /**
   * @param {string} status
   */
  function getStatusColor(status) {
    const colors = {
      scheduled: "text-blue-400",
      posting: "text-yellow-400",
      posted: "text-green-400",
      failed: "text-red-400",
      cancelled: "text-gray-400",
    };
    return colors[status] || "text-gray-400";
  }

  /**
   * @param {string} status
   */
  function getStatusIcon(status) {
    if (status === "posted") return CheckCircle2;
    if (status === "failed" || status === "cancelled") return XCircle;
    if (status === "posting") return Loader2;
    return Clock;
  }

  /**
   * @param {string} dateString
   */
  function formatDateTime(dateString) {
    return new Date(dateString).toLocaleString();
  }

  /**
   * @param {string} dateString
   */
  function getTimeUntil(dateString) {
    const now = new Date();
    const target = new Date(dateString);
    const diff = target.getTime() - now.getTime();

    if (diff < 0) return "Past";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  onDestroy(() => {
    unsubscribe();
  });
</script>

<div class="h-full flex">
  <!-- Left Panel - Schedule New Post -->
  <div class="w-1/2 p-6 border-r border-dark-700 overflow-y-auto">
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h2 class="text-2xl font-bold text-white mb-2">
          Social Media Scheduler
        </h2>
        <p class="text-dark-300">Schedule posts across multiple platforms</p>
      </div>

      <!-- Schedule Form -->
      <div class="bg-dark-800 border border-dark-600 rounded-lg p-4">
        <h3 class="text-lg font-semibold text-white mb-4">Schedule New Post</h3>

        <div class="space-y-4">
          <!-- Video Path -->
          <div>
            <label class="block text-sm font-medium text-dark-300 mb-2">
              Video Path *
            </label>
            <input
              type="text"
              bind:value={videoPath}
              placeholder="/data/exports/video.mp4"
              class="form-input"
              disabled={isScheduling}
            />
            <p class="text-xs text-dark-400 mt-1">
              Path to your exported video file
            </p>
          </div>

          <!-- Platforms -->
          <div>
            <label class="block text-sm font-medium text-dark-300 mb-2">
              Platforms * ({platforms.length} selected)
            </label>
            <div class="grid grid-cols-2 gap-2">
              {#each platformOptions as platform}
                <label
                  class="flex items-center space-x-2 p-3 rounded border cursor-pointer transition-colors
                    {platforms.includes(platform.value)
                    ? 'border-primary-500 bg-primary-500/20'
                    : 'border-dark-600 hover:border-dark-500'}"
                >
                  <input
                    type="checkbox"
                    checked={platforms.includes(platform.value)}
                    on:change={() => togglePlatform(platform.value)}
                    disabled={isScheduling}
                  />
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 {platform.color} rounded-full"></div>
                    <span class="text-white text-sm">{platform.label}</span>
                  </div>
                </label>
              {/each}
            </div>
          </div>

          <!-- Scheduled Time -->
          <div>
            <label class="block text-sm font-medium text-dark-300 mb-2">
              Scheduled Time *
            </label>
            <input
              type="datetime-local"
              bind:value={scheduledTime}
              class="form-input"
              disabled={isScheduling}
            />
          </div>

          <!-- Caption -->
          <div>
            <label class="block text-sm font-medium text-dark-300 mb-2">
              Caption
            </label>
            <textarea
              bind:value={caption}
              placeholder="Write your post caption..."
              class="form-textarea h-24"
              disabled={isScheduling}
            ></textarea>
            <p class="text-xs text-dark-400 mt-1">
              {caption.length} characters
            </p>
          </div>

          <!-- Hashtags -->
          <div>
            <label class="block text-sm font-medium text-dark-300 mb-2">
              <Hash class="w-4 h-4 inline" /> Hashtags
            </label>
            <input
              type="text"
              bind:value={hashtags}
              placeholder="#viral #trending #shorts"
              class="form-input"
              disabled={isScheduling}
            />
            <p class="text-xs text-dark-400 mt-1">
              Separate hashtags with spaces or commas
            </p>
          </div>
        </div>

        <button
          on:click={handleSchedulePost}
          disabled={isScheduling ||
            !videoPath ||
            platforms.length === 0 ||
            !scheduledTime}
          class="w-full btn-primary flex items-center justify-center gap-2 mt-6"
        >
          {#if isScheduling}
            <div
              class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"
            ></div>
            <span>Scheduling...</span>
          {:else}
            <Send class="w-4 h-4" />
            <span>Schedule Post</span>
          {/if}
        </button>
      </div>

      <!-- Upcoming Posts -->
      <div>
        <h3 class="text-lg font-semibold text-white mb-4">Next Posts</h3>
        {#if upcomingPosts.length === 0}
          <div class="text-center py-8 bg-dark-800 rounded-lg">
            <Clock class="w-12 h-12 text-dark-600 mx-auto mb-4" />
            <p class="text-dark-400">No upcoming posts scheduled</p>
          </div>
        {:else}
          <div class="space-y-2">
            {#each upcomingPosts as post}
              {@const StatusIcon = getStatusIcon(post.status)}
              <div class="bg-dark-800 rounded-lg p-3">
                <div class="flex items-start justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <StatusIcon
                      class="w-4 h-4 {getStatusColor(
                        post.status,
                      )} {post.status === 'posting' ? 'animate-spin' : ''}"
                    />
                    <div>
                      <div class="text-sm font-medium text-white">
                        {formatDateTime(post.scheduledTime)}
                      </div>
                      <div class="text-xs text-dark-400">
                        in {getTimeUntil(post.scheduledTime)}
                      </div>
                    </div>
                  </div>
                  <div class="flex gap-1">
                    {#each post.platforms as platform}
                      {@const platformInfo = platformOptions.find(
                        (p) => p.value === platform,
                      )}
                      <div
                        class="w-2 h-2 {platformInfo?.color ||
                          'bg-gray-600'} rounded-full"
                        title={platformInfo?.label || platform}
                      ></div>
                    {/each}
                  </div>
                </div>
                {#if post.caption}
                  <p class="text-xs text-dark-300 line-clamp-2">
                    {post.caption}
                  </p>
                {/if}
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>

  <!-- Right Panel - All Scheduled Posts -->
  <div class="w-1/2 p-6 overflow-y-auto">
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-white">All Scheduled Posts</h3>
        <button
          on:click={async () => {
            await loadScheduledPosts();
            await loadUpcomingPosts();
          }}
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
          <p class="text-dark-400">Loading scheduled posts...</p>
        </div>
      {:else if scheduledPosts.length === 0}
        <div class="text-center py-12">
          <Calendar class="w-16 h-16 text-dark-600 mx-auto mb-4" />
          <h4 class="text-lg font-medium text-dark-400 mb-2">
            No scheduled posts
          </h4>
          <p class="text-dark-500 text-sm">
            Schedule your first post to get started
          </p>
        </div>
      {:else}
        <div class="space-y-3">
          {#each scheduledPosts as post}
            {@const StatusIcon = getStatusIcon(post.status)}
            <div class="bg-dark-800 rounded-lg p-4">
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-center gap-3">
                  <StatusIcon
                    class="w-5 h-5 {getStatusColor(
                      post.status,
                    )} {post.status === 'posting' ? 'animate-spin' : ''}"
                  />
                  <div>
                    <div class="text-white font-medium">
                      {formatDateTime(post.scheduledTime)}
                    </div>
                    <div
                      class="text-xs {getStatusColor(post.status)} capitalize"
                    >
                      {post.status}
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  {#if post.status === "scheduled"}
                    <button
                      on:click={() => handleCancelPost(post.id)}
                      class="text-yellow-400 hover:text-yellow-300 transition-colors"
                      title="Cancel"
                    >
                      <XCircle class="w-4 h-4" />
                    </button>
                  {/if}
                  <button
                    on:click={() => handleDeletePost(post.id)}
                    class="text-red-400 hover:text-red-300 transition-colors"
                    title="Delete"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </div>

              <!-- Platforms -->
              <div class="flex flex-wrap gap-2 mb-3">
                {#each post.platforms as platform}
                  {@const platformInfo = platformOptions.find(
                    (p) => p.value === platform,
                  )}
                  <span
                    class="text-xs px-2 py-1 {platformInfo?.color ||
                      'bg-gray-600'} text-white rounded"
                  >
                    {platformInfo?.label || platform}
                  </span>
                {/each}
              </div>

              <!-- Caption -->
              {#if post.caption}
                <div class="bg-dark-900 rounded p-3 mb-2">
                  <p class="text-sm text-dark-200">{post.caption}</p>
                </div>
              {/if}

              <!-- Hashtags -->
              {#if post.hashtags && post.hashtags.length > 0}
                <div class="flex flex-wrap gap-1">
                  {#each post.hashtags as hashtag}
                    <span class="text-xs text-primary-300">
                      {hashtag}
                    </span>
                  {/each}
                </div>
              {/if}

              <!-- Video Path -->
              <div class="text-xs text-dark-500 mt-2 truncate">
                Video: {post.videoPath}
              </div>

              <!-- Retry Info -->
              {#if post.retryCount > 0}
                <div class="text-xs text-yellow-400 mt-2">
                  Retry attempts: {post.retryCount}
                </div>
              {/if}

              <!-- Time Until -->
              {#if post.status === "scheduled"}
                <div class="text-xs text-primary-400 mt-2">
                  Posts in {getTimeUntil(post.scheduledTime)}
                </div>
              {/if}
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>
