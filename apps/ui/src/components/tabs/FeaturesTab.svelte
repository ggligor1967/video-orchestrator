<script>
  import TemplatesMarketplace from "../TemplatesMarketplace.svelte";
  import BatchExportManager from "../BatchExportManager.svelte";
  import AutoCaptionsPanel from "../AutoCaptionsPanel.svelte";

  let activeFeature = "marketplace";

  const features = [
    {
      id: "marketplace",
      label: "🛒 Templates Marketplace",
      component: TemplatesMarketplace,
    },
    { id: "captions", label: "🎯 Auto-Captions", component: AutoCaptionsPanel },
    { id: "batch", label: "🎬 Batch Export", component: BatchExportManager },
  ];
</script>

<div class="features-tab">
  <!-- Feature Selector -->
  <div class="feature-selector">
    {#each features as feature}
      <button
        class="feature-btn"
        class:active={activeFeature === feature.id}
        on:click={() => (activeFeature = feature.id)}
      >
        {feature.label}
      </button>
    {/each}
  </div>

  <!-- Feature Content -->
  <div class="feature-content">
    {#each features as feature}
      {#if activeFeature === feature.id}
        <svelte:component this={feature.component} />
      {/if}
    {/each}
  </div>
</div>

<style>
  .features-tab {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: #1a1a1a;
  }

  .feature-selector {
    display: flex;
    gap: 0.5rem;
    padding: 1rem;
    background: #2c2c2c;
    border-bottom: 2px solid #3a3a3a;
  }

  .feature-btn {
    padding: 0.75rem 1.5rem;
    background: #3a3a3a;
    color: #e0e0e0;
    border: 2px solid #4a4a4a;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    font-size: 1rem;
    transition: all 0.3s;
  }

  .feature-btn:hover {
    background: #4a4a4a;
    border-color: #667eea;
  }

  .feature-btn.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-color: #764ba2;
  }

  .feature-content {
    flex: 1;
    overflow-y: auto;
  }
</style>
