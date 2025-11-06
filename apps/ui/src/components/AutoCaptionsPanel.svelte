<script>
  import { onMount } from "svelte";

  const API_BASE = "http://127.0.0.1:4545";

  let languages = [];
  let styles = [];
  let loading = false;
  let error = null;

  // Form state
  let selectedLanguage = "en";
  let selectedStyle = "minimal";
  let audioFile = null;
  let audioFileName = "";
  let strictMode = false;
  let addEmojis = false;

  // Generation state
  let generating = false;
  let progress = 0;
  let generatedCaptions = null;
  let downloadLinks = { srt: null, vtt: null };

  // Fetch available languages
  async function fetchLanguages() {
    try {
      const response = await fetch(`${API_BASE}/auto-captions/languages`);
      const data = await response.json();
      languages = data.languages || [];
      if (languages.length > 0 && !selectedLanguage) {
        selectedLanguage = languages[0].code;
      }
    } catch (err) {
      console.error("Failed to fetch languages:", err);
    }
  }

  // Fetch available styles
  async function fetchStyles() {
    try {
      const response = await fetch(`${API_BASE}/auto-captions/styles`);
      const data = await response.json();
      styles = data.styles || [];
      if (styles.length > 0 && !selectedStyle) {
        selectedStyle = styles[0].id;
      }
    } catch (err) {
      console.error("Failed to fetch styles:", err);
    }
  }

  // Handle file selection
  function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
      audioFile = file;
      audioFileName = file.name;
    }
  }

  // Generate captions
  async function generateCaptions() {
    if (!audioFile) {
      alert("Please select an audio/video file");
      return;
    }

    generating = true;
    progress = 0;
    error = null;
    generatedCaptions = null;

    // Simulate progress
    const progressInterval = setInterval(() => {
      if (progress < 90) {
        progress += Math.random() * 10;
      }
    }, 500);

    try {
      const formData = new FormData();
      formData.append("audio", audioFile);
      formData.append("language", selectedLanguage);
      formData.append("style", selectedStyle);
      formData.append("strictMode", strictMode);
      formData.append("addEmojis", addEmojis);

      const response = await fetch(`${API_BASE}/auto-captions/generate`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      clearInterval(progressInterval);
      progress = 100;

      if (data.success) {
        generatedCaptions = data.captions;
        downloadLinks = data.downloadLinks || { srt: null, vtt: null };
        setTimeout(() => {
          generating = false;
        }, 500);
      } else {
        throw new Error(data.error || "Failed to generate captions");
      }
    } catch (err) {
      clearInterval(progressInterval);
      error = err.message;
      generating = false;
      progress = 0;
    }
  }

  // Download captions
  function downloadCaptions(format) {
    if (!generatedCaptions) return;

    const link = downloadLinks[format];
    if (link) {
      window.open(link, "_blank");
    } else {
      // Fallback: create blob from captions text
      const blob = new Blob([generatedCaptions], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `captions.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  // Reset form
  function resetForm() {
    audioFile = null;
    audioFileName = "";
    generatedCaptions = null;
    progress = 0;
    error = null;
  }

  // Get language name
  function getLanguageName(code) {
    const lang = languages.find((l) => l.code === code);
    return lang ? lang.name : code;
  }

  // Get style description
  function getStyleDescription(id) {
    const style = styles.find((s) => s.id === id);
    return style ? style.description : "";
  }

  onMount(() => {
    fetchLanguages();
    fetchStyles();
  });
</script>

<div class="auto-captions-panel">
  <header class="header">
    <h1>🎯 Auto-Captions Generator</h1>
    <p>
      Generate multilingual captions automatically using AI-powered
      transcription
    </p>
  </header>

  <div class="content-grid">
    <!-- Left Column: Form -->
    <section class="form-section">
      <h2>⚙️ Caption Settings</h2>

      <!-- File Upload -->
      <div class="form-group">
        <label for="audio-file">Audio/Video File</label>
        <div class="file-upload">
          <input
            type="file"
            id="audio-file"
            accept="audio/*,video/*"
            on:change={handleFileSelect}
            disabled={generating}
          />
          <div class="file-info">
            {#if audioFileName}
              <span class="file-name">📁 {audioFileName}</span>
            {:else}
              <span class="file-placeholder">No file selected</span>
            {/if}
          </div>
        </div>
      </div>

      <!-- Language Selection -->
      <div class="form-group">
        <label for="language">Language</label>
        <select
          id="language"
          bind:value={selectedLanguage}
          disabled={generating}
        >
          {#each languages as lang}
            <option value={lang.code}>
              {lang.name} ({lang.code})
            </option>
          {/each}
        </select>
        <small>Select the spoken language in your audio</small>
      </div>

      <!-- Style Selection -->
      <div class="form-group">
        <label for="style">Caption Style</label>
        <select id="style" bind:value={selectedStyle} disabled={generating}>
          {#each styles as style}
            <option value={style.id}>
              {style.name}
            </option>
          {/each}
        </select>
        <small>{getStyleDescription(selectedStyle)}</small>
      </div>

      <!-- Options -->
      <div class="form-group options">
        <label class="checkbox-label">
          <input
            type="checkbox"
            bind:checked={strictMode}
            disabled={generating}
          />
          <span>Strict Mode (Enhanced profanity filtering)</span>
        </label>

        <label class="checkbox-label">
          <input
            type="checkbox"
            bind:checked={addEmojis}
            disabled={generating}
          />
          <span>Add Emojis (Automatic emoji insertion)</span>
        </label>
      </div>

      <!-- Generate Button -->
      <button
        class="btn-generate"
        on:click={generateCaptions}
        disabled={!audioFile || generating}
      >
        {#if generating}
          ⏳ Generating... {Math.round(progress)}%
        {:else}
          ✨ Generate Captions
        {/if}
      </button>

      {#if generating}
        <div class="progress-bar">
          <div class="progress-fill" style="width: {progress}%"></div>
        </div>
      {/if}

      {#if error}
        <div class="error-message">
          ⚠️ {error}
        </div>
      {/if}
    </section>

    <!-- Right Column: Preview -->
    <section class="preview-section">
      <div class="preview-header">
        <h2>👁️ Caption Preview</h2>
        {#if generatedCaptions}
          <div class="download-buttons">
            <button
              class="btn-download"
              on:click={() => downloadCaptions("srt")}
            >
              ⬇️ SRT
            </button>
            <button
              class="btn-download"
              on:click={() => downloadCaptions("vtt")}
            >
              ⬇️ VTT
            </button>
          </div>
        {/if}
      </div>

      <div class="preview-box">
        {#if generatedCaptions}
          <pre class="captions-text">{generatedCaptions}</pre>
        {:else if generating}
          <div class="preview-placeholder">
            <div class="spinner"></div>
            <p>Generating captions...</p>
          </div>
        {:else}
          <div class="preview-placeholder">
            <p>📝 Captions will appear here</p>
            <p class="placeholder-hint">
              Upload a file and click Generate to start
            </p>
          </div>
        {/if}
      </div>

      {#if generatedCaptions}
        <button class="btn-reset" on:click={resetForm}>
          🔄 Generate New Captions
        </button>
      {/if}
    </section>
  </div>

  <!-- Style Preview Cards -->
  <section class="styles-showcase">
    <h3>Available Caption Styles</h3>
    <div class="styles-grid">
      {#each styles as style}
        <div
          class="style-card"
          class:selected={selectedStyle === style.id}
          on:click={() => !generating && (selectedStyle = style.id)}
        >
          <div class="style-name">{style.name}</div>
          <div
            class="style-preview"
            style="font-family: {style.fontFamily}; color: {style.color}; font-size: {style.fontSize};"
          >
            Example Text
          </div>
          <div class="style-description">{style.description}</div>
        </div>
      {/each}
    </div>
  </section>
</div>

<style>
  .auto-captions-panel {
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
  }

  .header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .header h1 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    color: #2c3e50;
  }

  .header p {
    color: #7f8c8d;
    font-size: 1.1rem;
  }

  .content-grid {
    display: grid;
    grid-template-columns: 400px 1fr;
    gap: 2rem;
    margin-bottom: 3rem;
  }

  /* Form Section */
  .form-section {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .form-section h2 {
    margin-bottom: 1.5rem;
    color: #2c3e50;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  .form-group label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #2c3e50;
  }

  .form-group select {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 1rem;
  }

  .form-group small {
    display: block;
    margin-top: 0.5rem;
    color: #7f8c8d;
    font-size: 0.85rem;
  }

  .file-upload input[type="file"] {
    display: none;
  }

  .file-upload {
    cursor: pointer;
  }

  .file-upload label {
    cursor: pointer;
  }

  .file-info {
    padding: 1rem;
    border: 2px dashed #e0e0e0;
    border-radius: 8px;
    text-align: center;
    cursor: pointer;
  }

  .file-info:hover {
    border-color: #3498db;
    background: #f8f9fa;
  }

  .file-name {
    font-weight: 600;
    color: #27ae60;
  }

  .file-placeholder {
    color: #7f8c8d;
  }

  .options {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: normal !important;
  }

  .checkbox-label input[type="checkbox"] {
    width: 18px;
    height: 18px;
  }

  .btn-generate {
    width: 100%;
    padding: 1rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    font-size: 1.1rem;
  }

  .btn-generate:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .progress-bar {
    margin-top: 1rem;
    height: 8px;
    background: #e0e0e0;
    border-radius: 4px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #667eea, #764ba2);
    transition: width 0.3s;
  }

  .error-message {
    margin-top: 1rem;
    padding: 1rem;
    background: #fee;
    color: #e74c3c;
    border-radius: 8px;
    font-weight: 600;
  }

  /* Preview Section */
  .preview-section {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
  }

  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .preview-header h2 {
    margin: 0;
    color: #2c3e50;
  }

  .download-buttons {
    display: flex;
    gap: 0.5rem;
  }

  .btn-download {
    padding: 0.5rem 1rem;
    background: #27ae60;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
  }

  .preview-box {
    flex: 1;
    min-height: 400px;
    background: #f8f9fa;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    padding: 1rem;
    overflow-y: auto;
  }

  .captions-text {
    font-family: "Courier New", monospace;
    font-size: 0.9rem;
    line-height: 1.6;
    white-space: pre-wrap;
    margin: 0;
  }

  .preview-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #7f8c8d;
  }

  .preview-placeholder p {
    margin: 0.5rem 0;
  }

  .placeholder-hint {
    font-size: 0.9rem;
  }

  .spinner {
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .btn-reset {
    margin-top: 1rem;
    padding: 0.75rem;
    background: #95a5a6;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
  }

  /* Styles Showcase */
  .styles-showcase {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .styles-showcase h3 {
    margin-bottom: 1rem;
    color: #2c3e50;
  }

  .styles-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }

  .style-card {
    background: #f8f9fa;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    padding: 1rem;
    cursor: pointer;
    transition: all 0.3s;
  }

  .style-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .style-card.selected {
    border-color: #667eea;
    background: #f0f4ff;
  }

  .style-name {
    font-weight: 700;
    margin-bottom: 0.5rem;
    color: #2c3e50;
  }

  .style-preview {
    padding: 1rem;
    background: white;
    border-radius: 6px;
    text-align: center;
    margin-bottom: 0.5rem;
    font-weight: 700;
  }

  .style-description {
    font-size: 0.85rem;
    color: #7f8c8d;
  }

  @media (max-width: 1024px) {
    .content-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
