<script>
  import { onMount } from "svelte";

  // API base URL
  const API_BASE = "http://127.0.0.1:4545";

  // State
  let templates = [];
  let featuredTemplates = [];
  let loading = true;
  let error = null;
  let selectedTemplate = null;
  let searchQuery = "";
  let filters = {
    category: "all",
    priceRange: "all",
    minRating: 0,
  };

  // User state (mock - in production would come from auth)
  const userId = "user-demo-001";

  // Fetch templates from API
  async function fetchTemplates() {
    loading = true;
    error = null;

    try {
      let url = `${API_BASE}/templates/marketplace?`;

      if (filters.category !== "all") {
        url += `category=${filters.category}&`;
      }

      if (filters.minRating > 0) {
        url += `minRating=${filters.minRating}&`;
      }

      if (searchQuery) {
        url = `${API_BASE}/templates/marketplace/search?q=${encodeURIComponent(searchQuery)}`;
        if (filters.category !== "all") {
          url += `&category=${filters.category}`;
        }
      }

      const response = await fetch(url);
      const data = await response.json();

      templates = data.templates || [];
      loading = false;
    } catch (err) {
      error = err.message;
      loading = false;
    }
  }

  // Fetch featured templates
  async function fetchFeatured() {
    try {
      const response = await fetch(
        `${API_BASE}/templates/marketplace/featured`,
      );
      const data = await response.json();
      featuredTemplates = data.templates || [];
    } catch (err) {
      console.error("Failed to fetch featured templates:", err);
    }
  }

  // Purchase template
  async function purchaseTemplate(templateId, price) {
    if (price === 0) {
      // Free template - just download
      await downloadTemplate(templateId);
      return;
    }

    if (!confirm(`Purchase this template for $${price}?`)) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/templates/marketplace/${templateId}/purchase`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        },
      );

      if (!response.ok) throw new Error("Purchase failed");

      alert("Purchase successful! Downloading template...");
      await downloadTemplate(templateId);
    } catch (err) {
      alert(`Purchase failed: ${err.message}`);
    }
  }

  // Download template
  async function downloadTemplate(templateId) {
    try {
      const response = await fetch(
        `${API_BASE}/templates/marketplace/${templateId}/download`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        },
      );

      const data = await response.json();

      if (data.success) {
        alert(`Template downloaded! URL: ${data.download.downloadUrl}`);
        // In production, would actually download the file
      }
    } catch (err) {
      alert(`Download failed: ${err.message}`);
    }
  }

  // View template details
  async function viewTemplate(template) {
    selectedTemplate = template;
  }

  // Close modal
  function closeModal() {
    selectedTemplate = null;
  }

  // Apply filters
  function applyFilters() {
    fetchTemplates();
  }

  // Handle search
  function handleSearch() {
    fetchTemplates();
  }

  // On mount
  onMount(() => {
    fetchTemplates();
    fetchFeatured();
  });
</script>

<div class="marketplace-container">
  <header class="marketplace-header">
    <h1>📦 Templates Marketplace</h1>
    <p>Professional video templates for every genre</p>
  </header>

  <!-- Search & Filters -->
  <div class="controls">
    <div class="search-box">
      <input
        type="text"
        placeholder="Search templates..."
        bind:value={searchQuery}
        on:keyup={(e) => e.key === "Enter" && handleSearch()}
      />
      <button on:click={handleSearch} class="btn-search">🔍 Search</button>
    </div>

    <div class="filters">
      <select bind:value={filters.category} on:change={applyFilters}>
        <option value="all">All Categories</option>
        <option value="horror">Horror</option>
        <option value="mystery">Mystery</option>
        <option value="paranormal">Paranormal</option>
        <option value="true-crime">True Crime</option>
      </select>

      <select bind:value={filters.priceRange} on:change={applyFilters}>
        <option value="all">All Prices</option>
        <option value="free">Free Only</option>
        <option value="premium">Premium</option>
      </select>

      <select bind:value={filters.minRating} on:change={applyFilters}>
        <option value="0">All Ratings</option>
        <option value="4">4+ Stars</option>
        <option value="4.5">4.5+ Stars</option>
      </select>
    </div>
  </div>

  <!-- Featured Templates -->
  {#if featuredTemplates.length > 0}
    <section class="featured-section">
      <h2>⭐ Featured Templates</h2>
      <div class="featured-grid">
        {#each featuredTemplates.slice(0, 3) as template}
          <div class="featured-card" on:click={() => viewTemplate(template)}>
            <div class="featured-badge">⭐ Featured</div>
            <div class="template-thumbnail">
              <img src={template.thumbnail} alt={template.name} />
            </div>
            <h3>{template.name}</h3>
            <p class="rating">
              {template.rating}★ ({template.downloads} downloads)
            </p>
            <p class="price">
              {template.price === 0 ? "FREE" : `$${template.price}`}
            </p>
          </div>
        {/each}
      </div>
    </section>
  {/if}

  <!-- All Templates -->
  <section class="templates-section">
    <h2>🎨 All Templates ({templates.length})</h2>

    {#if loading}
      <div class="loading">Loading templates...</div>
    {:else if error}
      <div class="error">Error: {error}</div>
    {:else if templates.length === 0}
      <div class="empty">No templates found. Try adjusting your filters.</div>
    {:else}
      <div class="templates-grid">
        {#each templates as template}
          <div class="template-card">
            <div class="template-thumbnail">
              <img src={template.thumbnail} alt={template.name} />
              {#if template.isPremium}
                <div class="premium-badge">💎 Premium</div>
              {/if}
            </div>

            <div class="template-info">
              <h3>{template.name}</h3>
              <p class="description">{template.description}</p>

              <div class="template-meta">
                <span class="category">{template.category}</span>
                <span class="rating">{template.rating}★</span>
                <span class="downloads">{template.downloads} downloads</span>
              </div>

              <div class="template-footer">
                <span class="price">
                  {template.price === 0 ? "FREE" : `$${template.price}`}
                </span>
                <div class="actions">
                  <button
                    class="btn-view"
                    on:click={() => viewTemplate(template)}
                  >
                    👁️ View
                  </button>
                  <button
                    class="btn-get"
                    on:click={() =>
                      purchaseTemplate(template.id, template.price)}
                  >
                    {template.price === 0 ? "⬇️ Download" : "🛒 Buy"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </section>
</div>

<!-- Template Detail Modal -->
{#if selectedTemplate}
  <div class="modal-overlay" on:click={closeModal}>
    <div class="modal-content" on:click|stopPropagation>
      <button class="modal-close" on:click={closeModal}>✕</button>

      <div class="modal-header">
        <img src={selectedTemplate.thumbnail} alt={selectedTemplate.name} />
        <div class="modal-header-info">
          <h2>{selectedTemplate.name}</h2>
          <p class="modal-category">{selectedTemplate.category}</p>
          <div class="modal-rating">
            {selectedTemplate.rating}★ · {selectedTemplate.downloads} downloads
          </div>
        </div>
      </div>

      <div class="modal-body">
        <p class="modal-description">{selectedTemplate.description}</p>

        <div class="modal-tags">
          {#each selectedTemplate.tags as tag}
            <span class="tag">{tag}</span>
          {/each}
        </div>

        <div class="modal-author">
          <strong>Author:</strong>
          {selectedTemplate.author}
        </div>
      </div>

      <div class="modal-footer">
        <span class="modal-price">
          {selectedTemplate.price === 0 ? "FREE" : `$${selectedTemplate.price}`}
        </span>
        <button
          class="btn-purchase"
          on:click={() => {
            purchaseTemplate(selectedTemplate.id, selectedTemplate.price);
            closeModal();
          }}
        >
          {selectedTemplate.price === 0
            ? "⬇️ Download Free"
            : `🛒 Buy for $${selectedTemplate.price}`}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .marketplace-container {
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
  }

  .marketplace-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .marketplace-header h1 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    color: #2c3e50;
  }

  .marketplace-header p {
    color: #7f8c8d;
    font-size: 1.1rem;
  }

  /* Controls */
  .controls {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
  }

  .search-box {
    flex: 1;
    min-width: 300px;
    display: flex;
    gap: 0.5rem;
  }

  .search-box input {
    flex: 1;
    padding: 0.75rem;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 1rem;
  }

  .btn-search {
    padding: 0.75rem 1.5rem;
    background: #3498db;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
  }

  .filters {
    display: flex;
    gap: 0.5rem;
  }

  .filters select {
    padding: 0.75rem;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 1rem;
    background: white;
  }

  /* Featured Section */
  .featured-section {
    margin-bottom: 3rem;
  }

  .featured-section h2 {
    font-size: 1.8rem;
    margin-bottom: 1rem;
    color: #2c3e50;
  }

  .featured-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
  }

  .featured-card {
    position: relative;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    padding: 1.5rem;
    color: white;
    cursor: pointer;
    transition: transform 0.3s;
  }

  .featured-card:hover {
    transform: translateY(-5px);
  }

  .featured-badge {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 600;
  }

  /* Templates Grid */
  .templates-section h2 {
    font-size: 1.8rem;
    margin-bottom: 1rem;
    color: #2c3e50;
  }

  .templates-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.5rem;
  }

  .template-card {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition:
      transform 0.3s,
      box-shadow 0.3s;
  }

  .template-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }

  .template-thumbnail {
    position: relative;
    width: 100%;
    height: 200px;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .template-thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .premium-badge {
    position: absolute;
    top: 0.5rem;
    left: 0.5rem;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.85rem;
  }

  .template-info {
    padding: 1rem;
  }

  .template-info h3 {
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
    color: #2c3e50;
  }

  .description {
    color: #7f8c8d;
    font-size: 0.9rem;
    margin-bottom: 0.75rem;
    line-height: 1.4;
  }

  .template-meta {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 1rem;
    font-size: 0.85rem;
  }

  .category {
    background: #e8f4f8;
    color: #3498db;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    text-transform: capitalize;
  }

  .rating {
    color: #f39c12;
  }

  .downloads {
    color: #95a5a6;
  }

  .template-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 0.75rem;
    border-top: 1px solid #ecf0f1;
  }

  .price {
    font-size: 1.3rem;
    font-weight: 700;
    color: #27ae60;
  }

  .actions {
    display: flex;
    gap: 0.5rem;
  }

  .btn-view {
    padding: 0.5rem 1rem;
    background: #ecf0f1;
    color: #2c3e50;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
  }

  .btn-get {
    padding: 0.5rem 1rem;
    background: #27ae60;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
  }

  /* Modal */
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
    padding: 2rem;
  }

  .modal-content {
    background: white;
    border-radius: 16px;
    max-width: 600px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
  }

  .modal-close {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    border: none;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 1.2rem;
  }

  .modal-header {
    display: flex;
    gap: 1rem;
    padding: 1.5rem;
    border-bottom: 1px solid #ecf0f1;
  }

  .modal-header img {
    width: 120px;
    height: 120px;
    object-fit: cover;
    border-radius: 8px;
  }

  .modal-header-info h2 {
    margin-bottom: 0.5rem;
  }

  .modal-category {
    color: #3498db;
    font-weight: 600;
    text-transform: capitalize;
  }

  .modal-rating {
    color: #f39c12;
    margin-top: 0.5rem;
  }

  .modal-body {
    padding: 1.5rem;
  }

  .modal-description {
    line-height: 1.6;
    margin-bottom: 1rem;
  }

  .modal-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .tag {
    background: #ecf0f1;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.9rem;
  }

  .modal-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-top: 1px solid #ecf0f1;
  }

  .modal-price {
    font-size: 1.5rem;
    font-weight: 700;
    color: #27ae60;
  }

  .btn-purchase {
    padding: 0.75rem 2rem;
    background: #27ae60;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    font-size: 1rem;
  }

  /* Loading/Error States */
  .loading,
  .error,
  .empty {
    text-align: center;
    padding: 3rem;
    color: #7f8c8d;
    font-size: 1.1rem;
  }

  .error {
    color: #e74c3c;
  }
</style>
