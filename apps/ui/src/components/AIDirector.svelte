<script>
  import { createEventDispatcher } from "svelte";
  import { projectContext } from "../stores/appStore";

  export let script = "";
  export let genre = "horror";

  const dispatch = createEventDispatcher();

  let loading = false;
  let error = null;
  let direction = null;
  let showAlternatives = false;
  let showPreview = false;
  let autoExecute = false;

  /**
   * Get AI direction for the video
   */
  async function getAIDirection() {
    if (!script || script.length < 50) {
      error = "Script prea scurt (minim 50 caractere)";
      return;
    }

    loading = true;
    error = null;

    try {
      const response = await fetch("http://127.0.0.1:4545/ai-director/direct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          script,
          genre,
          options: {
            quality: "standard",
            speed: "balanced",
            autoExecute,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get AI direction");
      }

      const data = await response.json();
      direction = data.direction;

      // Update project store
      projectContext.update((p) => ({
        ...p,
        aiDecisions: direction.decisions,
        aiPredictions: direction.predictions,
        aiContext: direction.context,
      }));

      dispatch("directionsReady", direction);
    } catch (err) {
      error = err.message;
      console.error("AI Direction error:", err);
    } finally {
      loading = false;
    }
  }

  /**
   * Get quick preview of execution plan
   */
  async function previewPlan() {
    loading = true;
    error = null;

    try {
      const response = await fetch(
        "http://127.0.0.1:4545/ai-director/preview",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ script, genre }),
        },
      );

      if (!response.ok) throw new Error("Failed to preview plan");

      const data = await response.json();
      direction = { ...direction, preview: data.preview };
      showPreview = true;
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }

  function formatConfidence(value) {
    return Math.round(value * 100);
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  }
</script>

<div class="ai-director-container">
  <div class="ai-director-header">
    <h3>🎬 AI Content Director</h3>
    <p>Direcție creativă inteligentă pentru video-ul tău</p>
  </div>

  <div class="ai-director-actions">
    <button
      class="btn-primary ai-director-btn"
      on:click={getAIDirection}
      disabled={loading || !script || script.length < 50}
    >
      {#if loading}
        <span class="spinner"></span>
        Analizez context...
      {:else}
        🎯 Obține Direcție AI
      {/if}
    </button>

    <label class="auto-execute-toggle">
      <input type="checkbox" bind:checked={autoExecute} />
      <span>Auto-execută după direcție</span>
    </label>
  </div>

  {#if error}
    <div class="error-banner">
      <span class="error-icon">⚠️</span>
      <span>{error}</span>
    </div>
  {/if}

  {#if direction}
    <div class="direction-results">
      <!-- Context Summary -->
      <div class="context-card">
        <h4>📊 Analiză Context</h4>
        <div class="context-grid">
          <div class="context-item">
            <span class="label">Mood:</span>
            <span class="value">{direction.context.mood}</span>
          </div>
          <div class="context-item">
            <span class="label">Arc Emoțional:</span>
            <span class="value">{direction.context.emotionalArc}</span>
          </div>
          <div class="context-item">
            <span class="label">Viral Hooks:</span>
            <span class="value"
              >{direction.context.viralHooks?.length || 0}</span
            >
          </div>
          <div class="context-item">
            <span class="label">Trend Alignment:</span>
            <span class="value"
              >{formatConfidence(direction.context.trendAlignment)}%</span
            >
          </div>
        </div>
      </div>

      <!-- Creative Decisions -->
      <div class="decisions-grid">
        <!-- Background -->
        <div class="decision-card">
          <div class="decision-header">
            <span class="decision-icon">🎨</span>
            <h5>Background</h5>
            <span
              class="confidence-badge"
              style="--confidence: {direction.decisions.background.confidence}"
            >
              {formatConfidence(direction.decisions.background.confidence)}%
            </span>
          </div>
          <div class="decision-content">
            <p class="decision-value">{direction.decisions.background.id}</p>
            <p class="decision-style">{direction.decisions.background.style}</p>
          </div>
        </div>

        <!-- Voice -->
        <div class="decision-card">
          <div class="decision-header">
            <span class="decision-icon">🎤</span>
            <h5>Voice</h5>
            <span
              class="confidence-badge"
              style="--confidence: {direction.decisions.voice.confidence}"
            >
              {formatConfidence(direction.decisions.voice.confidence)}%
            </span>
          </div>
          <div class="decision-content">
            <p class="decision-value">{direction.decisions.voice.id}</p>
            <p class="decision-style">
              {direction.decisions.voice.type} • {direction.decisions.voice
                .mood}
            </p>
          </div>
        </div>

        <!-- Music -->
        <div class="decision-card">
          <div class="decision-header">
            <span class="decision-icon">🎵</span>
            <h5>Music</h5>
            <span
              class="confidence-badge"
              style="--confidence: {direction.decisions.music.confidence}"
            >
              {formatConfidence(direction.decisions.music.confidence)}%
            </span>
          </div>
          <div class="decision-content">
            <p class="decision-value">{direction.decisions.music.id}</p>
            <p class="decision-style">
              {direction.decisions.music.genre} • {direction.decisions.music
                .energy}
            </p>
          </div>
        </div>

        <!-- Effects -->
        <div class="decision-card">
          <div class="decision-header">
            <span class="decision-icon">✨</span>
            <h5>Effects</h5>
          </div>
          <div class="decision-content">
            <div class="effects-list">
              {#each direction.decisions.effects as effect}
                <span class="effect-tag">{effect.type}</span>
              {/each}
            </div>
          </div>
        </div>
      </div>

      <!-- Quality Predictions -->
      <div class="predictions-card">
        <h4>🎯 Predicții Calitate</h4>
        <div class="predictions-grid">
          <div class="prediction-item">
            <span class="prediction-label">Viral Potential</span>
            <div class="prediction-bar">
              <div
                class="prediction-fill viral"
                style="width: {formatConfidence(
                  direction.predictions.viralPotential,
                )}%"
              ></div>
              <span class="prediction-value"
                >{formatConfidence(direction.predictions.viralPotential)}%</span
              >
            </div>
          </div>

          <div class="prediction-item">
            <span class="prediction-label">Production Quality</span>
            <div class="prediction-bar">
              <div
                class="prediction-fill quality"
                style="width: {formatConfidence(
                  direction.predictions.productionQuality,
                )}%"
              ></div>
              <span class="prediction-value"
                >{formatConfidence(
                  direction.predictions.productionQuality,
                )}%</span
              >
            </div>
          </div>

          <div class="prediction-item">
            <span class="prediction-label">Audience Match</span>
            <div class="prediction-bar">
              <div
                class="prediction-fill audience"
                style="width: {formatConfidence(
                  direction.predictions.audienceMatch,
                )}%"
              ></div>
              <span class="prediction-value"
                >{formatConfidence(direction.predictions.audienceMatch)}%</span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Execution Time -->
      <div class="execution-info">
        <span class="info-icon">⏱️</span>
        <span
          >Timp estimat producție: <strong
            >{formatTime(direction.estimatedTime)}</strong
          ></span
        >
      </div>

      <!-- Actions -->
      <div class="direction-actions">
        <button class="btn-secondary" on:click={previewPlan}>
          📋 Preview Plan Execuție
        </button>

        {#if direction.alternatives && direction.alternatives.length > 0}
          <button
            class="btn-secondary"
            on:click={() => (showAlternatives = true)}
          >
            🔄 Vezi Alternative ({direction.alternatives.length})
          </button>
        {/if}

        <button
          class="btn-primary"
          on:click={() => dispatch("execute", direction)}
        >
          ▶️ Execută Acum
        </button>
      </div>
    </div>
  {/if}
</div>

<!-- Preview Modal -->
{#if showPreview && direction?.preview}
  <div class="modal-overlay" on:click={() => (showPreview = false)}>
    <div class="modal-content" on:click|stopPropagation>
      <div class="modal-header">
        <h3>📋 Execution Plan Preview</h3>
        <button class="modal-close" on:click={() => (showPreview = false)}
          >×</button
        >
      </div>

      <div class="modal-body">
        <div class="plan-timeline">
          {#each direction.preview.steps as step}
            <div class="timeline-step">
              <div class="step-header">
                <span class="step-name">{step.name}</span>
                <span class="step-duration">{step.duration}</span>
              </div>
              <div class="step-tasks">
                {#each step.tasks as task}
                  <span class="task-tag">{task}</span>
                {/each}
              </div>
            </div>
          {/each}
        </div>

        <div class="plan-summary">
          <strong>Total Time:</strong>
          {direction.preview.totalTime}
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- Alternatives Modal -->
{#if showAlternatives && direction?.alternatives}
  <div class="modal-overlay" on:click={() => (showAlternatives = false)}>
    <div class="modal-content wide" on:click|stopPropagation>
      <div class="modal-header">
        <h3>🔄 Alternative Creative Directions</h3>
        <button class="modal-close" on:click={() => (showAlternatives = false)}
          >×</button
        >
      </div>

      <div class="modal-body">
        <div class="alternatives-grid">
          {#each direction.alternatives as alt, i}
            <div class="alternative-card">
              <h4>Alternative {i + 1}</h4>
              <p class="alt-description">{alt.description}</p>
              <div class="alt-decisions">
                <div><strong>Background:</strong> {alt.background.id}</div>
                <div><strong>Voice:</strong> {alt.voice.id}</div>
                <div><strong>Music:</strong> {alt.music.id}</div>
              </div>
              <button
                class="btn-secondary"
                on:click={() => {
                  direction.decisions = alt;
                  showAlternatives = false;
                }}
              >
                Folosește această variantă
              </button>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .ai-director-container {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    padding: 24px;
    margin: 24px 0;
    color: white;
  }

  .ai-director-header h3 {
    margin: 0 0 8px 0;
    font-size: 1.5rem;
    font-weight: 600;
  }

  .ai-director-header p {
    margin: 0;
    opacity: 0.9;
    font-size: 0.95rem;
  }

  .ai-director-actions {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-top: 20px;
  }

  .ai-director-btn {
    flex: 1;
    max-width: 300px;
    padding: 12px 24px;
    font-size: 1rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .auto-execute-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    user-select: none;
  }

  .auto-execute-toggle input {
    cursor: pointer;
  }

  .spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .error-banner {
    background: rgba(220, 38, 38, 0.2);
    border: 1px solid rgba(220, 38, 38, 0.5);
    border-radius: 8px;
    padding: 12px 16px;
    margin-top: 16px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .direction-results {
    margin-top: 24px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .context-card,
  .predictions-card {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 16px;
  }

  .context-card h4,
  .predictions-card h4 {
    margin: 0 0 12px 0;
    font-size: 1.1rem;
  }

  .context-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px;
  }

  .context-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .context-item .label {
    font-size: 0.85rem;
    opacity: 0.8;
  }

  .context-item .value {
    font-weight: 600;
    font-size: 1.1rem;
  }

  .decisions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 16px;
  }

  .decision-card {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 16px;
  }

  .decision-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  }

  .decision-icon {
    font-size: 1.5rem;
  }

  .decision-header h5 {
    margin: 0;
    flex: 1;
    font-size: 1rem;
  }

  .confidence-badge {
    background: rgba(255, 255, 255, 0.2);
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.85rem;
    font-weight: 600;
  }

  .decision-value {
    margin: 0 0 4px 0;
    font-weight: 600;
  }

  .decision-style {
    margin: 0;
    font-size: 0.9rem;
    opacity: 0.8;
  }

  .effects-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .effect-tag {
    background: rgba(255, 255, 255, 0.2);
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 0.85rem;
  }

  .predictions-grid {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .prediction-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .prediction-label {
    font-size: 0.95rem;
    font-weight: 500;
  }

  .prediction-bar {
    position: relative;
    height: 32px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    overflow: hidden;
  }

  .prediction-fill {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    border-radius: 16px;
    transition: width 0.6s ease;
  }

  .prediction-fill.viral {
    background: linear-gradient(90deg, #10b981, #34d399);
  }

  .prediction-fill.quality {
    background: linear-gradient(90deg, #3b82f6, #60a5fa);
  }

  .prediction-fill.audience {
    background: linear-gradient(90deg, #8b5cf6, #a78bfa);
  }

  .prediction-value {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    font-weight: 600;
    font-size: 0.95rem;
  }

  .execution-info {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
  }

  .info-icon {
    font-size: 1.2rem;
  }

  .direction-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .direction-actions button {
    flex: 1;
    min-width: 180px;
  }

  /* Modal Styles */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
  }

  .modal-content {
    background: white;
    border-radius: 12px;
    max-width: 600px;
    width: 100%;
    max-height: 80vh;
    overflow: auto;
    color: #1f2937;
  }

  .modal-content.wide {
    max-width: 900px;
  }

  .modal-header {
    padding: 20px 24px;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .modal-header h3 {
    margin: 0;
    font-size: 1.25rem;
  }

  .modal-close {
    background: none;
    border: none;
    font-size: 2rem;
    line-height: 1;
    cursor: pointer;
    color: #6b7280;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .modal-close:hover {
    color: #1f2937;
  }

  .modal-body {
    padding: 24px;
  }

  .plan-timeline {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .timeline-step {
    padding: 16px;
    background: #f3f4f6;
    border-radius: 8px;
  }

  .step-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .step-name {
    font-weight: 600;
    font-size: 1.05rem;
  }

  .step-duration {
    color: #6b7280;
    font-size: 0.9rem;
  }

  .step-tasks {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .task-tag {
    background: white;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 0.85rem;
    border: 1px solid #e5e7eb;
  }

  .plan-summary {
    margin-top: 20px;
    padding: 12px;
    background: #dbeafe;
    border-radius: 8px;
    text-align: center;
  }

  .alternatives-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
  }

  .alternative-card {
    padding: 20px;
    background: #f9fafb;
    border-radius: 8px;
    border: 2px solid #e5e7eb;
  }

  .alternative-card h4 {
    margin: 0 0 8px 0;
    color: #667eea;
  }

  .alt-description {
    margin: 0 0 12px 0;
    color: #6b7280;
    font-size: 0.95rem;
  }

  .alt-decisions {
    margin: 12px 0;
    font-size: 0.9rem;
    line-height: 1.8;
  }

  .alternative-card button {
    width: 100%;
    margin-top: 12px;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .ai-director-actions {
      flex-direction: column;
      align-items: stretch;
    }

    .ai-director-btn {
      max-width: none;
    }

    .decisions-grid {
      grid-template-columns: 1fr;
    }

    .direction-actions button {
      min-width: 0;
    }
  }
</style>
