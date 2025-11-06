<script>
  import { createEventDispatcher, onDestroy } from "svelte";
  import { Play, Check, Clock } from "lucide-svelte";
  import { tabStatus } from "../stores/appStore.js";

  export let tabs = [];
  export let activeTab = "story-script";

  const dispatch = createEventDispatcher();
  let status = {};

  const unsubscribe = tabStatus.subscribe((value) => {
    status = value;
  });

  onDestroy(() => {
    unsubscribe();
  });

  function getTabIcon(tab) {
    const iconMap = {
      FileText: "📝",
      Image: "🎬",
      Mic: "🎤",
      Volume2: "🔊",
      Type: "📄",
      Download: "📤",
    };
    return iconMap[tab.icon] || "⚙️";
  }

  function getTabStatus(tabId) {
    const tabStat = status[tabId];
    if (!tabStat) return "pending";

    if (tabStat.completed) return "completed";
    if (tabId === activeTab) return "active";
    return "pending";
  }

  function handleTabClick(tabId) {
    dispatch("tabChange", tabId);
  }

  function handleKeyNavigation(event) {
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
    if (currentIndex === -1) return;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      const nextTab = tabs[(currentIndex + 1) % tabs.length];
      handleTabClick(nextTab.id);
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      const prevTab = tabs[(currentIndex - 1 + tabs.length) % tabs.length];
      handleTabClick(prevTab.id);
    }
  }
</script>

<nav class="bg-dark-800 border-b border-dark-700 px-4 py-3">
  <div class="flex space-x-1 overflow-x-auto">
    {#each tabs as tab, index (tab.id)}
      {@const tabStat = getTabStatus(tab.id)}

      <button
        class="tab-transition flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap
               {tab.id === activeTab
          ? 'bg-primary-600 text-white'
          : tabStat === 'completed'
            ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
            : 'text-dark-300 hover:text-white hover:bg-dark-700'}"
        on:click={() => handleTabClick(tab.id)}
        on:keyup={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleTabClick(tab.id);
          }
        }}
        tabindex={tab.id === activeTab ? 0 : -1}
        on:keydown={handleKeyNavigation}
        aria-pressed={tab.id === activeTab}
        aria-label={`${tab.label} (step ${index + 1} of ${tabs.length})`}
        type="button"
      >
        <!-- Tab Icon -->
        <span class="text-lg" aria-hidden="true">{getTabIcon(tab)}</span>

        <!-- Tab Label -->
        <span>{tab.label}</span>

        <!-- Status Indicator -->
        <div class="flex items-center" aria-hidden="true">
          {#if tabStat === "completed"}
            <Check class="w-4 h-4 text-green-400" />
          {:else if tab.id === activeTab}
            <Play class="w-4 h-4" />
          {:else}
            <Clock class="w-4 h-4 text-dark-400" />
          {/if}
        </div>

        <!-- Step Number -->
        <span class="text-xs opacity-75 bg-black/20 px-1.5 py-0.5 rounded">
          {index + 1}
        </span>
      </button>
    {/each}
  </div>

  <!-- Progress Indicator -->
  <div class="mt-3">
    <div class="flex items-center justify-between text-xs text-dark-300 mb-1">
      <span>Progress</span>
      <span
        >{Object.values(status).filter((s) => s.completed).length} / {tabs.length}
        completed</span
      >
    </div>
    <div class="progress-bar">
      <div
        class="progress-fill"
        style="width: {(Object.values(status).filter((s) => s.completed)
          .length /
          tabs.length) *
          100}%"
      ></div>
    </div>
  </div>
</nav>

<style>
  nav {
    min-height: 80px;
  }

  .tab-transition {
    transition: all 0.2s ease-in-out;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
