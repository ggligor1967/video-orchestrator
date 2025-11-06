<script>
  import { onMount, onDestroy } from "svelte";
  import { get } from "svelte/store";
  import ResponsiveTabNavigation from "./components/ResponsiveTabNavigation.svelte";
  import {
    currentTab,
    backendConnection,
    initializeBackend,
    retryBackendConnection,
    stopHealthCheckPolling,
  } from "./stores/appStore.js";

  const tabLoaders = {
    "story-script": () => import("./components/tabs/StoryScriptTab.svelte"),
    background: () => import("./components/tabs/BackgroundTab.svelte"),
    voiceover: () => import("./components/tabs/VoiceoverTab.svelte"),
    "audio-sfx": () => import("./components/tabs/AudioSfxTab.svelte"),
    subtitles: () => import("./components/tabs/SubtitlesTab.svelte"),
    export: () => import("./components/tabs/ExportTab.svelte"),
    batch: () => import("./components/tabs/BatchProcessingTab.svelte"),
    scheduler: () => import("./components/tabs/SchedulerTab.svelte"),
    features: () => import("./components/tabs/FeaturesTab.svelte"),
  };

  const tabs = [
    { id: "story-script", label: "Story & Script", icon: "FileText" },
    { id: "background", label: "Background", icon: "Image" },
    { id: "voiceover", label: "Voice-over", icon: "Mic" },
    { id: "audio-sfx", label: "Audio & SFX", icon: "Volume2" },
    { id: "subtitles", label: "Subtitles", icon: "Type" },
    { id: "export", label: "Export & Post", icon: "Download" },
    { id: "batch", label: "Batch Processing", icon: "Layers" },
    { id: "scheduler", label: "Scheduler", icon: "Clock" },
    { id: "features", label: "✨ New Features", icon: "Sparkles" },
  ];

  let currentTabValue = get(currentTab);
  let currentTabComponent = null;
  let tabLoadError = null;
  let connectionState = get(backendConnection);
  let isRetrying = false;

  const loadedTabs = {};

  async function loadTabComponent(tabId) {
    if (loadedTabs[tabId]) {
      currentTabComponent = loadedTabs[tabId];
      return;
    }

    currentTabComponent = null;
    tabLoadError = null;

    const loader = tabLoaders[tabId];
    if (!loader) {
      console.warn(`No component loader registered for tab "${tabId}"`);
      tabLoadError = "Unknown section requested. Please pick another tab.";
      return;
    }

    try {
      const module = await loader();
      loadedTabs[tabId] = module.default;
      currentTabComponent = module.default;
    } catch (error) {
      console.error(`Failed to load ${tabId} tab:`, error);
      tabLoadError = "Failed to load this section. Please retry.";
    }
  }

  function prefetchRemainingTabs() {
    if (typeof window === "undefined") return;

    const schedule =
      window.requestIdleCallback ||
      ((cb) => setTimeout(() => cb({ didTimeout: true }), 800));

    schedule(async () => {
      for (const tab of tabs) {
        if (tab.id === currentTabValue || loadedTabs[tab.id]) continue;
        const loader = tabLoaders[tab.id];
        if (!loader) continue;
        try {
          const module = await loader();
          loadedTabs[tab.id] = module.default;
        } catch (error) {
          console.warn(`Prefetch for ${tab.id} tab skipped:`, error);
        }
      }
    });
  }

  async function handleRetryConnection() {
    isRetrying = true;
    await retryBackendConnection();
    isRetrying = false;
  }

  const unsubscribeCurrentTab = currentTab.subscribe((value) => {
    if (currentTabValue === value) return;
    currentTabValue = value;
    loadTabComponent(value);
  });

  const unsubscribeBackend = backendConnection.subscribe((value) => {
    connectionState = value;
  });

  onMount(async () => {
    loadTabComponent(currentTabValue);
    prefetchRemainingTabs();
    // Initialize backend without blocking UI mount
    initializeBackend().catch((err) =>
      console.warn("Backend init failed:", err),
    );
  });

  onDestroy(() => {
    unsubscribeCurrentTab();
    unsubscribeBackend();
    stopHealthCheckPolling();
  });

  function handleTabChange(tabId) {
    if (currentTabValue !== tabId) {
      currentTab.set(tabId);
    }
  }

  // Derived values for UI
  $: backendStatusLabel =
    connectionState.status === "connected"
      ? "Backend Connected"
      : connectionState.status === "error"
        ? "Backend Error"
        : connectionState.status === "disconnected"
          ? "Backend Disconnected"
          : "Connecting...";

  $: backendStatusClass =
    connectionState.status === "connected"
      ? "status-completed"
      : connectionState.status === "error"
        ? "status-error"
        : "status-processing";

  $: showBackendError =
    connectionState.status === "error" ||
    connectionState.status === "disconnected";
</script>

<main class="h-screen flex flex-col bg-dark-900 text-white">
  <!-- Header - Compact -->
  <header class="bg-dark-800 border-b border-dark-700 px-4 py-2">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <div
          class="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center"
        >
          <span class="text-white font-bold text-xs">VO</span>
        </div>
        <h1 class="text-lg font-semibold">Video Orchestrator</h1>
      </div>

      <!-- Backend Status Indicator - Compact -->
      <div class="flex items-center space-x-2 text-xs">
        <div class="flex items-center space-x-1">
          <div class="status-dot {backendStatusClass}"></div>
          <span class="text-dark-200">{backendStatusLabel}</span>
        </div>
        {#if connectionState.lastCheck}
          <span class="text-dark-400 text-[10px]">
            {new Date(connectionState.lastCheck).toLocaleTimeString()}
          </span>
        {/if}
      </div>
    </div>
  </header>

  <!-- Tab Navigation -->
  <ResponsiveTabNavigation
    {tabs}
    activeTab={currentTabValue}
    on:tabChange={(e) => handleTabChange(e.detail)}
  />

  <!-- Tab Content -->
  <div class="flex-1 overflow-hidden">
    {#if connectionState.status === "connected"}
      {#if tabLoadError}
        <div class="flex items-center justify-center h-full">
          <div class="text-center space-y-3">
            <div class="text-red-500 text-5xl">⚠️</div>
            <p class="text-lg font-semibold">
              Unable to open {tabs.find((tab) => tab.id === currentTabValue)
                ?.label}
            </p>
            <p class="text-sm text-dark-300">{tabLoadError}</p>
            <button
              class="btn-primary"
              on:click={() => loadTabComponent(currentTabValue)}
            >
              Retry
            </button>
          </div>
        </div>
      {:else if !currentTabComponent}
        <div class="flex items-center justify-center h-full">
          <div class="text-center">
            <div
              class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"
            ></div>
            <p class="text-dark-300">
              Loading {tabs.find((tab) => tab.id === currentTabValue)?.label}...
            </p>
          </div>
        </div>
      {:else}
        <svelte:component this={currentTabComponent} />
      {/if}
    {:else if showBackendError}
      <div class="flex items-center justify-center h-full">
        <div class="text-center space-y-4 max-w-md px-4">
          <div class="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 class="text-xl font-semibold mb-2">Backend Connection Failed</h2>
          <p class="text-dark-300">
            {connectionState.errorMessage ||
              "Could not connect to the Video Orchestrator backend server."}
          </p>
          <p class="text-sm text-dark-400">
            Please ensure the backend is running on port 4545.
          </p>
          {#if connectionState.retryCount > 0}
            <p class="text-sm text-yellow-500">
              Retry attempts: {connectionState.retryCount} / 3
            </p>
          {/if}
          <button
            class="btn-primary"
            on:click={handleRetryConnection}
            disabled={isRetrying}
          >
            {isRetrying ? "Retrying..." : "Retry Connection"}
          </button>
        </div>
      </div>
    {:else}
      <div class="flex items-center justify-center h-full">
        <div class="text-center">
          <div
            class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"
          ></div>
          <p class="text-dark-300">Connecting to backend...</p>
          {#if connectionState.retryCount > 0}
            <p class="text-sm text-dark-400 mt-2">
              Attempt {connectionState.retryCount + 1}...
            </p>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</main>

<style>
  /* Additional component-specific styles if needed */
</style>
