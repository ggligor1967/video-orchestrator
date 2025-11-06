<script>
  /**
   * ResponsiveTabNavigation.svelte - Responsive tab navigation with touch/keyboard support
   * Optimized for desktop, tablet, and mobile
   */
  import { createEventDispatcher, onMount, onDestroy } from "svelte";
  import { Play, Check, Clock } from "lucide-svelte";
  import { tabStatus } from "../stores/appStore.js";
  import InteractionHandler from "./InteractionHandler.svelte";

  export let tabs = [];
  export let activeTab = "story-script";

  const dispatch = createEventDispatcher();
  let status = {};
  let scrollContainer;
  let isMobile = false;
  let tabElements = {};
  let isDragging = false;
  let startX = 0;
  let scrollLeft = 0;

  const unsubscribe = tabStatus.subscribe((value) => {
    status = value;
  });

  onMount(() => {
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    scrollActiveTabIntoView();
    console.log("ResponsiveTabNavigation mounted with", tabs.length, "tabs");
    console.log("Active tab:", activeTab);
    console.log("Tab status:", status);
  });

  onDestroy(() => {
    unsubscribe();
    window.removeEventListener("resize", checkIfMobile);
  });

  function checkIfMobile() {
    isMobile = window.innerWidth < 768;
  }

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
    console.log(
      "🖱️ Tab clicked:",
      tabId,
      "| Current:",
      activeTab,
      "| Status:",
      status[tabId],
    );

    // Prevent navigation if currently dragging
    if (isDragging) {
      console.warn("⚠️ Click ignored - drag in progress");
      return;
    }

    dispatch("tabChange", tabId);
    scrollActiveTabIntoView(tabId);
  }

  function handleKeyNavigation(event, currentIndex) {
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

    if (event.key === "Home") {
      event.preventDefault();
      handleTabClick(tabs[0].id);
    }

    if (event.key === "End") {
      event.preventDefault();
      handleTabClick(tabs[tabs.length - 1].id);
    }
  }

  function scrollActiveTabIntoView(tabId = activeTab) {
    if (!scrollContainer || !tabElements[tabId]) return;

    const tabElement = tabElements[tabId];
    const containerRect = scrollContainer.getBoundingClientRect();
    const tabRect = tabElement.getBoundingClientRect();

    if (
      tabRect.left < containerRect.left ||
      tabRect.right > containerRect.right
    ) {
      tabElement.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }

  // Touch/Mouse drag to scroll
  function handleDragStart(event) {
    if (!scrollContainer) return;
    isDragging = true;
    startX = event.clientX || event.touches?.[0].clientX;
    scrollLeft = scrollContainer.scrollLeft;
    console.log("🖱️ Drag started at X:", startX);
  }

  function handleDragMove(event) {
    if (!isDragging || !scrollContainer) return;
    event.preventDefault();
    const x = event.clientX || event.touches?.[0].clientX;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    scrollContainer.scrollLeft = scrollLeft - walk;
  }

  function handleDragEnd() {
    console.log("🖱️ Drag ended, isDragging:", isDragging);
    // Add small delay to prevent click immediately after drag
    setTimeout(() => {
      isDragging = false;
    }, 100);
  }

  // Swipe gesture detection
  let touchStartX = 0;
  let touchStartY = 0;

  function handleTouchStart(event) {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
  }

  function handleTouchEnd(event) {
    const touchEndX = event.changedTouches[0].clientX;
    const touchEndY = event.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    // Horizontal swipe (threshold: 50px, and more horizontal than vertical)
    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
      const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
      if (deltaX < 0 && currentIndex < tabs.length - 1) {
        // Swipe left - next tab
        handleTabClick(tabs[currentIndex + 1].id);
      } else if (deltaX > 0 && currentIndex > 0) {
        // Swipe right - previous tab
        handleTabClick(tabs[currentIndex - 1].id);
      }
    }
  }

  $: completedCount = Object.values(status).filter((s) => s.completed).length;
  $: progressPercentage = (completedCount / tabs.length) * 100;
</script>

<nav class="tab-navigation bg-dark-800 border-b border-dark-700">
  <!-- Tab Buttons Container -->
  <div
    bind:this={scrollContainer}
    class="tabs-container"
    class:is-dragging={isDragging}
    on:mousedown={handleDragStart}
    on:mousemove={handleDragMove}
    on:mouseup={handleDragEnd}
    on:mouseleave={handleDragEnd}
    on:touchstart={handleTouchStart}
    on:touchend={handleTouchEnd}
    role="tablist"
    tabindex="0"
    aria-label="Video orchestrator steps"
  >
    {#each tabs as tab, index (tab.id)}
      {@const tabStat = getTabStatus(tab.id)}
      {@const isActive = tab.id === activeTab}

      <InteractionHandler
        ariaLabel={`${tab.label} (step ${index + 1} of ${tabs.length})`}
        hapticFeedback={isMobile}
        on:click={() => handleTabClick(tab.id)}
        on:tap={() => handleTabClick(tab.id)}
        on:navigate={(e) => handleKeyNavigation(e.detail.originalEvent, index)}
      >
        <button
          bind:this={tabElements[tab.id]}
          class="tab-button transition-smooth"
          class:tab-active={isActive}
          class:tab-completed={tabStat === "completed"}
          class:tab-pending={tabStat === "pending"}
          class:is-dragging={isDragging}
          role="tab"
          tabindex={isActive ? 0 : -1}
          aria-selected={isActive}
          aria-controls={`panel-${tab.id}`}
          type="button"
        >
          <!-- Tab Icon -->
          <span class="tab-icon" aria-hidden="true">{getTabIcon(tab)}</span>

          <!-- Tab Label (hide on small mobile) -->
          <span class="tab-label">{tab.label}</span>

          <!-- Status Indicator -->
          <div class="tab-status" aria-hidden="true">
            {#if tabStat === "completed"}
              <Check class="w-4 h-4 text-green-400" />
            {:else if isActive}
              <Play class="w-4 h-4" />
            {:else}
              <Clock class="w-4 h-4 text-dark-400" />
            {/if}
          </div>

          <!-- Step Number Badge -->
          <span class="tab-badge">
            {index + 1}
          </span>
        </button>
      </InteractionHandler>
    {/each}
  </div>

  <!-- Progress Indicator -->
  <div class="progress-section">
    <div class="progress-info">
      <span class="progress-label">Progress</span>
      <span class="progress-count">
        {completedCount} / {tabs.length} completed
      </span>
    </div>
    <div class="progress-bar-container">
      <div
        class="progress-bar-fill"
        style="width: {progressPercentage}%"
        role="progressbar"
        aria-valuenow={completedCount}
        aria-valuemin="0"
        aria-valuemax={tabs.length}
        aria-label="Overall progress"
      ></div>
    </div>
  </div>

  <!-- Swipe Hint (only on mobile, first time) -->
  {#if isMobile}
    <div class="swipe-hint animate-fade-in-up">
      <span class="text-xs text-dark-400"> 👈 Swipe to navigate tabs 👉 </span>
    </div>
  {/if}
</nav>

<style>
  .tab-navigation {
    min-height: 70px;
    padding: 8px 0;
    display: block;
    position: relative;
    z-index: 10;
    visibility: visible !important;
  }

  .tabs-container {
    display: flex;
    gap: 8px;
    padding: 0 16px;
    overflow-x: auto;
    overflow-y: hidden;
    scroll-behavior: smooth;
    cursor: grab;
    -webkit-overflow-scrolling: touch;
  }

  .tabs-container.is-dragging {
    cursor: grabbing;
    scroll-behavior: auto;
  }

  /* Hide scrollbar but keep functionality */
  .tabs-container {
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE/Edge */
  }

  .tabs-container::-webkit-scrollbar {
    display: none; /* Chrome/Safari */
  }

  .tab-button {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    white-space: nowrap;
    border: none;
    background: transparent;
    color: var(--text-secondary);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    min-height: 38px; /* Compact but still accessible */
    cursor: pointer;
  }

  .tab-button:focus {
    outline: none;
  }

  .tab-active {
    background: var(--primary-color);
    color: white;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
  }

  .tab-completed {
    background: rgba(16, 185, 129, 0.2);
    color: rgb(16, 185, 129);
  }

  .tab-completed:hover {
    background: rgba(16, 185, 129, 0.3);
  }

  .tab-pending:hover {
    background: rgba(255, 255, 255, 0.05);
    color: var(--text-primary);
  }

  /* Prevent accidental clicks during drag */
  .tab-button.is-dragging {
    pointer-events: none;
  }

  .tab-icon {
    font-size: 18px;
    flex-shrink: 0;
  }

  .tab-label {
    flex: 1;
    min-width: 80px;
  }

  .tab-status {
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  .tab-badge {
    font-size: 11px;
    padding: 2px 6px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
    flex-shrink: 0;
  }

  .progress-section {
    margin-top: 8px;
    padding: 0 16px;
  }

  .progress-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 11px;
    color: var(--text-secondary);
    margin-bottom: 4px;
  }

  .progress-label {
    font-weight: 500;
  }

  .progress-count {
    color: var(--text-primary);
  }

  .progress-bar-container {
    height: 4px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    overflow: hidden;
  }

  .progress-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--primary-color), #10b981);
    border-radius: 10px;
    transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .swipe-hint {
    text-align: center;
    padding: 8px 0 0 0;
    opacity: 0.7;
  }

  /* Mobile optimizations */
  @media (max-width: 639px) {
    .tab-navigation {
      min-height: 100px;
    }

    .tab-button {
      padding: 8px 12px;
      font-size: 13px;
      min-width: 120px;
    }

    .tab-label {
      min-width: 60px;
      font-size: 12px;
    }

    .tab-badge {
      font-size: 10px;
      padding: 1px 4px;
    }
  }

  /* Tablet optimizations */
  @media (min-width: 640px) and (max-width: 1023px) {
    .tab-button {
      padding: 10px 14px;
    }
  }

  /* Desktop optimizations */
  @media (min-width: 1024px) {
    .tabs-container {
      gap: 12px;
      padding: 0 24px;
    }

    .tab-button {
      padding: 12px 20px;
      font-size: 15px;
    }

    .swipe-hint {
      display: none; /* Hide swipe hint on desktop */
    }
  }

  /* High contrast mode */
  @media (prefers-contrast: high) {
    .tab-button {
      border: 1px solid var(--border-color);
    }

    .tab-active {
      border-color: var(--primary-color);
      border-width: 2px;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .tab-button,
    .progress-bar-fill,
    .tabs-container {
      transition: none;
    }

    .animate-fade-in-up {
      animation: none;
    }
  }
</style>
