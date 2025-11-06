<script>
  import { onMount, onDestroy } from "svelte";

  const API_BASE = "http://127.0.0.1:4545";
  const userId = "user-demo-001";

  let jobs = [];
  let loading = false;
  let error = null;
  let refreshInterval = null;

  // New batch job form
  let newBatchForm = {
    videos: [{ videoId: "video-1", format: "mp4", preset: "1080p" }],
    priority: "normal",
  };

  // Fetch all jobs
  async function fetchJobs() {
    loading = true;
    error = null;

    try {
      const response = await fetch(
        `${API_BASE}/batch-export/list?userId=${userId}`,
      );
      const data = await response.json();
      jobs = data.jobs || [];
      loading = false;
    } catch (err) {
      error = err.message;
      loading = false;
    }
  }

  // Create new batch job
  async function createBatchJob() {
    try {
      const response = await fetch(`${API_BASE}/batch-export/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          videos: newBatchForm.videos,
          priority: newBatchForm.priority,
          notifyOnComplete: true,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Batch job created successfully!");
        newBatchForm.videos = [
          { videoId: "video-1", format: "mp4", preset: "1080p" },
        ];
        fetchJobs();
      }
    } catch (err) {
      alert(`Failed to create batch job: ${err.message}`);
    }
  }

  // Cancel job
  async function cancelJob(jobId) {
    if (!confirm("Cancel this batch job?")) return;

    try {
      const response = await fetch(`${API_BASE}/batch-export/${jobId}/cancel`, {
        method: "POST",
      });

      if (response.ok) {
        alert("Job cancelled");
        fetchJobs();
      }
    } catch (err) {
      alert(`Failed to cancel job: ${err.message}`);
    }
  }

  // Retry failed exports
  async function retryJob(jobId) {
    try {
      const response = await fetch(`${API_BASE}/batch-export/retry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });

      if (response.ok) {
        alert("Retrying failed exports");
        fetchJobs();
      }
    } catch (err) {
      alert(`Failed to retry: ${err.message}`);
    }
  }

  // Delete job
  async function deleteJob(jobId) {
    if (!confirm("Delete this job? This cannot be undone.")) return;

    try {
      const response = await fetch(`${API_BASE}/batch-export/${jobId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Job deleted");
        fetchJobs();
      }
    } catch (err) {
      alert(`Failed to delete job: ${err.message}`);
    }
  }

  // Add video to batch
  function addVideo() {
    newBatchForm.videos = [
      ...newBatchForm.videos,
      {
        videoId: `video-${newBatchForm.videos.length + 1}`,
        format: "mp4",
        preset: "1080p",
      },
    ];
  }

  // Remove video from batch
  function removeVideo(index) {
    newBatchForm.videos = newBatchForm.videos.filter((_, i) => i !== index);
  }

  // Get status color
  function getStatusColor(status) {
    const colors = {
      pending: "#f39c12",
      processing: "#3498db",
      completed: "#27ae60",
      failed: "#e74c3c",
      cancelled: "#95a5a6",
      partial: "#e67e22",
    };
    return colors[status] || "#7f8c8d";
  }

  // Get status icon
  function getStatusIcon(status) {
    const icons = {
      pending: "⏳",
      processing: "⚙️",
      completed: "✅",
      failed: "❌",
      cancelled: "🚫",
      partial: "⚠️",
    };
    return icons[status] || "📦";
  }

  // Format date
  function formatDate(dateString) {
    return new Date(dateString).toLocaleString();
  }

  onMount(() => {
    fetchJobs();
    // Refresh every 5 seconds for active jobs
    refreshInterval = setInterval(() => {
      const hasActiveJobs = jobs.some((j) => j.status === "processing");
      if (hasActiveJobs) {
        fetchJobs();
      }
    }, 5000);
  });

  onDestroy(() => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }
  });
</script>

<div class="batch-export-container">
  <header class="header">
    <h1>🎬 Batch Export Manager</h1>
    <p>Export multiple videos simultaneously with queue management</p>
  </header>

  <!-- Create New Batch -->
  <section class="create-batch">
    <h2>➕ Create New Batch Export</h2>

    <div class="batch-form">
      <div class="videos-list">
        <h3>Videos to Export ({newBatchForm.videos.length})</h3>

        {#each newBatchForm.videos as video, index}
          <div class="video-item">
            <input
              type="text"
              placeholder="Video ID"
              bind:value={video.videoId}
            />
            <select bind:value={video.format}>
              <option value="mp4">MP4</option>
              <option value="mov">MOV</option>
              <option value="webm">WebM</option>
            </select>
            <select bind:value={video.preset}>
              <option value="1080p">1080p (Full HD)</option>
              <option value="720p">720p (HD)</option>
              <option value="4k">4K (Ultra HD)</option>
            </select>
            <button
              class="btn-remove"
              on:click={() => removeVideo(index)}
              disabled={newBatchForm.videos.length === 1}
            >
              🗑️
            </button>
          </div>
        {/each}

        <button class="btn-add-video" on:click={addVideo}>
          ➕ Add Another Video
        </button>
      </div>

      <div class="batch-options">
        <label>
          Priority:
          <select bind:value={newBatchForm.priority}>
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
          </select>
        </label>

        <button class="btn-create" on:click={createBatchJob}>
          🚀 Create Batch Job
        </button>
      </div>
    </div>
  </section>

  <!-- Jobs List -->
  <section class="jobs-section">
    <div class="section-header">
      <h2>📋 Batch Jobs ({jobs.length})</h2>
      <button class="btn-refresh" on:click={fetchJobs}> 🔄 Refresh </button>
    </div>

    {#if loading && jobs.length === 0}
      <div class="loading">Loading jobs...</div>
    {:else if error}
      <div class="error">Error: {error}</div>
    {:else if jobs.length === 0}
      <div class="empty">
        <p>No batch jobs yet</p>
        <p>Create your first batch export above to get started</p>
      </div>
    {:else}
      <div class="jobs-list">
        {#each jobs as job}
          <div
            class="job-card"
            style="border-left: 4px solid {getStatusColor(job.status)}"
          >
            <div class="job-header">
              <div class="job-title">
                <span class="job-icon">{getStatusIcon(job.status)}</span>
                <div>
                  <h3>Batch Job #{job.id.slice(0, 8)}</h3>
                  <span class="job-date">{formatDate(job.createdAt)}</span>
                </div>
              </div>

              <div
                class="job-status"
                style="color: {getStatusColor(job.status)}"
              >
                {job.status.toUpperCase()}
              </div>
            </div>

            <div class="job-progress">
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  style="width: {job.progress}%; background: {getStatusColor(
                    job.status,
                  )}"
                ></div>
              </div>
              <span class="progress-text">{job.progress}%</span>
            </div>

            <div class="job-stats">
              <div class="stat">
                <span class="stat-label">Total</span>
                <span class="stat-value">{job.totalVideos}</span>
              </div>
              <div class="stat">
                <span class="stat-label">Completed</span>
                <span class="stat-value success">{job.completedVideos}</span>
              </div>
              <div class="stat">
                <span class="stat-label">Failed</span>
                <span class="stat-value error">{job.failedVideos}</span>
              </div>
              <div class="stat">
                <span class="stat-label">Priority</span>
                <span class="stat-value priority-{job.priority}"
                  >{job.priority}</span
                >
              </div>
            </div>

            <!-- Videos Details -->
            <details class="job-details">
              <summary>📹 View Videos ({job.videos.length})</summary>
              <div class="videos-grid">
                {#each job.videos as video}
                  <div
                    class="video-card"
                    style="border-color: {getStatusColor(video.status)}"
                  >
                    <div class="video-header">
                      <span>{video.videoId}</span>
                      <span class="video-status">{video.status}</span>
                    </div>
                    <div class="video-progress">
                      <div class="mini-progress">
                        <div
                          style="width: {video.progress}%; background: {getStatusColor(
                            video.status,
                          )}"
                        ></div>
                      </div>
                      <span>{video.progress}%</span>
                    </div>
                    <div class="video-settings">
                      {video.format.toUpperCase()} · {video.preset}
                    </div>
                    {#if video.error}
                      <div class="video-error">⚠️ {video.error}</div>
                    {/if}
                  </div>
                {/each}
              </div>
            </details>

            <!-- Actions -->
            <div class="job-actions">
              {#if job.status === "processing"}
                <button class="btn-cancel" on:click={() => cancelJob(job.id)}>
                  🚫 Cancel
                </button>
              {/if}

              {#if job.failedVideos > 0 && job.status !== "processing"}
                <button class="btn-retry" on:click={() => retryJob(job.id)}>
                  🔄 Retry Failed
                </button>
              {/if}

              {#if job.status !== "processing"}
                <button class="btn-delete" on:click={() => deleteJob(job.id)}>
                  🗑️ Delete
                </button>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </section>
</div>

<style>
  .batch-export-container {
    padding: 2rem;
    max-width: 1200px;
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

  /* Create Batch Section */
  .create-batch {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .create-batch h2 {
    margin-bottom: 1rem;
    color: #2c3e50;
  }

  .batch-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .videos-list h3 {
    margin-bottom: 0.75rem;
    color: #2c3e50;
  }

  .video-item {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .video-item input,
  .video-item select {
    padding: 0.75rem;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 1rem;
  }

  .video-item input {
    flex: 2;
  }

  .video-item select {
    flex: 1;
  }

  .btn-remove {
    padding: 0.75rem;
    background: #e74c3c;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
  }

  .btn-remove:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-add-video {
    padding: 0.75rem;
    background: #ecf0f1;
    color: #2c3e50;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
  }

  .batch-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .batch-options label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
  }

  .batch-options select {
    padding: 0.75rem;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
  }

  .btn-create {
    padding: 0.75rem 2rem;
    background: #27ae60;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    font-size: 1rem;
  }

  /* Jobs Section */
  .jobs-section {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .section-header h2 {
    color: #2c3e50;
  }

  .btn-refresh {
    padding: 0.5rem 1rem;
    background: #3498db;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
  }

  .jobs-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .job-card {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 1.5rem;
  }

  .job-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
  }

  .job-title {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .job-icon {
    font-size: 2rem;
  }

  .job-title h3 {
    margin: 0;
    color: #2c3e50;
  }

  .job-date {
    font-size: 0.85rem;
    color: #7f8c8d;
  }

  .job-status {
    font-weight: 700;
    font-size: 1.1rem;
  }

  .job-progress {
    display: flex;
    gap: 1rem;
    align-items: center;
    margin-bottom: 1rem;
  }

  .progress-bar {
    flex: 1;
    height: 24px;
    background: #e0e0e0;
    border-radius: 12px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    transition: width 0.3s;
  }

  .progress-text {
    font-weight: 600;
    min-width: 50px;
    text-align: right;
  }

  .job-stats {
    display: flex;
    gap: 2rem;
    margin-bottom: 1rem;
  }

  .stat {
    display: flex;
    flex-direction: column;
  }

  .stat-label {
    font-size: 0.85rem;
    color: #7f8c8d;
  }

  .stat-value {
    font-size: 1.3rem;
    font-weight: 700;
  }

  .stat-value.success {
    color: #27ae60;
  }

  .stat-value.error {
    color: #e74c3c;
  }

  .priority-low {
    color: #95a5a6;
  }
  .priority-normal {
    color: #3498db;
  }
  .priority-high {
    color: #e74c3c;
  }

  /* Job Details */
  .job-details {
    margin: 1rem 0;
  }

  .job-details summary {
    cursor: pointer;
    padding: 0.75rem;
    background: white;
    border-radius: 8px;
    font-weight: 600;
  }

  .videos-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
  }

  .video-card {
    background: white;
    border-left: 3px solid;
    padding: 1rem;
    border-radius: 6px;
  }

  .video-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    font-weight: 600;
  }

  .video-status {
    font-size: 0.85rem;
    text-transform: uppercase;
  }

  .video-progress {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .mini-progress {
    flex: 1;
    height: 6px;
    background: #e0e0e0;
    border-radius: 3px;
    overflow: hidden;
  }

  .mini-progress div {
    height: 100%;
  }

  .video-settings {
    font-size: 0.85rem;
    color: #7f8c8d;
  }

  .video-error {
    margin-top: 0.5rem;
    padding: 0.5rem;
    background: #fee;
    color: #e74c3c;
    border-radius: 4px;
    font-size: 0.85rem;
  }

  /* Job Actions */
  .job-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .btn-cancel {
    padding: 0.5rem 1rem;
    background: #e74c3c;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
  }

  .btn-retry {
    padding: 0.5rem 1rem;
    background: #f39c12;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
  }

  .btn-delete {
    padding: 0.5rem 1rem;
    background: #95a5a6;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
  }

  /* States */
  .loading,
  .error,
  .empty {
    text-align: center;
    padding: 3rem;
    color: #7f8c8d;
  }

  .error {
    color: #e74c3c;
  }

  .empty p:first-child {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
</style>
