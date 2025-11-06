**Organising Module 1**

Let’s break this down:

I’ll start with an overview, followed by a file tree for the app’s UI structure. Then, I’ll set up dependencies in the package.json, along with the Tauri config in tauri.conf.json. For the components, I’ll need files like Tabs.svelte, StepHeader.svelte, and StatusPill.svelte in src/lib/components. I'll also have a store for app state (like step statuses and autoContinue) in src/lib/stores.ts. The API will go in src/lib/api.ts.

Each tab will have its own page, such as StoryScript.svelte, Background.svelte, and others. App.svelte will handle the tabs and routing. Simple CSS for styling, plus some basic tests using Vitest. I'll focus on snippets for clarity.
# Modul 1 — UI complet (Tauri + Svelte)

Mai jos ai kitul implementabil pentru UI-ul minimalist, cu tab-uri, previzualizare media, indicatori de status și „auto-continue”. Comunică cu backend-ul local pe http://127.0.0.1:4545 (deja configurat în Modul 0).

---

## Structură directoare UI

```
apps/ui/
├─ package.json
├─ vite.config.ts
├─ tauri.conf.json
├─ src/
│  ├─ app.css
│  ├─ App.svelte
│  ├─ main.ts
│  ├─ lib/
│  │  ├─ api.ts
│  │  ├─ stores.ts
│  │  ├─ types.ts
│  │  ├─ components/
│  │  │  ├─ Tabs.svelte
│  │  │  ├─ StepHeader.svelte
│  │  │  ├─ StatusPill.svelte
│  │  │  ├─ MediaPreview.svelte
│  │  │  └─ Toolbar.svelte
│  │  └─ tabs/
│  │     ├─ StoryScript.svelte
│  │     ├─ Background.svelte
│  │     ├─ VoiceOver.svelte
│  │     ├─ AudioSFX.svelte
│  │     ├─ Subtitles.svelte
│  │     └─ ExportPost.svelte
│  └─ tests/
│     └─ app.spec.ts
└─ README.md
```

---

## package.json (UI)

```json
{
  "name": "@app/ui",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "tauri dev",
    "build": "tauri build",
    "test": "vitest",
    "lint": "echo \"(add ESLint if needed)\"",
    "format": "echo \"(run prettier if configured)\""
  },
  "devDependencies": {
    "@tauri-apps/cli": "^1.5.10",
    "@tauri-apps/api": "^1.5.4",
    "@types/node": "^20.12.12",
    "svelte": "^4.2.18",
    "svelte-check": "^3.8.6",
    "typescript": "^5.5.4",
    "vite": "^5.4.1",
    "vitest": "^1.6.0"
  },
  "dependencies": {
    "ky": "^1.2.4"
  }
}
```

---

## vite.config.ts

```ts
import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  plugins: [svelte()],
  server: {
    strictPort: true,
    port: 5173
  },
  clearScreen: false
});
```

---

## tauri.conf.json (minimal)

```json
{
  "package": { "productName": "Video Orchestrator", "version": "0.1.0" },
  "tauri": {
    "windows": [{ "title": "Video Orchestrator", "width": 1200, "height": 800, "resizable": true }],
    "allowlist": { "all": false, "shell": { "all": false } }
  },
  "build": { "beforeBuildCommand": "", "beforeDevCommand": "" }
}
```

---

## src/app.css (stil minimalist)

```css
:root {
  --bg: #0f1115;
  --panel: #171a21;
  --text: #e6e6e6;
  --muted: #9aa0a6;
  --accent: #7aa2f7;
  --ok: #50fa7b;
  --warn: #f1fa8c;
  --err: #ff5555;
}
* { box-sizing: border-box; }
html, body, #app { height: 100%; }
body { margin: 0; background: var(--bg); color: var(--text); font: 14px/1.5 system-ui, Segoe UI, Roboto, Arial; }
h1, h2, h3 { margin: 0 0 12px; }
button { background: var(--panel); color: var(--text); border: 1px solid #2a2f3a; padding: 8px 12px; border-radius: 8px; cursor: pointer; }
button.primary { background: var(--accent); color: #0b0d12; border: none; }
input, select, textarea { background: #0d0f14; color: var(--text); border: 1px solid #272b35; border-radius: 6px; padding: 8px; width: 100%; }
.container { display: grid; grid-template-columns: 260px 1fr; height: 100%; }
.sidebar { background: var(--panel); border-right: 1px solid #222633; padding: 16px; }
.content { padding: 16px 20px; overflow: auto; }
.row { display: flex; gap: 10px; align-items: center; }
.grid { display: grid; gap: 12px; }
.grid.two { grid-template-columns: 1fr 1fr; }
.card { background: #12151c; border: 1px solid #1f2430; border-radius: 12px; padding: 12px; }
.badge { padding: 2px 8px; border-radius: 999px; font-size: 12px; }
.badge.ok { background: #1a2e20; color: var(--ok); border: 1px solid #254b30; }
.badge.warn { background: #2f2e1a; color: var(--warn); border: 1px solid #4b4725; }
.badge.err { background: #2f1a1a; color: var(--err); border: 1px solid #4b2525; }
.progress { height: 6px; background: #1a1d26; border-radius: 999px; overflow: hidden; }
.progress > div { height: 100%; background: var(--accent); width: 0%; transition: width 200ms; }
.tab { display: flex; align-items: center; gap: 8px; padding: 8px; border-radius: 8px; cursor: pointer; }
.tab.active { background: #12151c; border: 1px solid #222738; }
.footer { padding: 10px; border-top: 1px solid #1e2230; display: flex; align-items: center; justify-content: space-between; }
```

---

## src/main.ts

```ts
import "./app.css";
import App from "./App.svelte";

const app = new App({ target: document.getElementById("app")! });
export default app;
```

---

## src/lib/types.ts

```ts
export type StepKey = "story" | "background" | "voice" | "audio" | "subs" | "export";

export type StepStatus = "idle" | "in-progress" | "done" | "error";

export interface StepState {
  key: StepKey;
  title: string;
  status: StepStatus;
  error?: string | null;
}

export interface Health {
  ok: boolean;
  timestamp?: string;
}
```

---

## src/lib/stores.ts

```ts
import { writable, derived } from "svelte/store";
import type { StepKey, StepState } from "./types";

export const stepsOrder: StepKey[] = ["story", "background", "voice", "audio", "subs", "export"];

export const steps = writable<StepState[]>([
  { key: "story", title: "Story & Script", status: "idle" },
  { key: "background", title: "Background", status: "idle" },
  { key: "voice", title: "Voice-over", status: "idle" },
  { key: "audio", title: "Audio & SFX", status: "idle" },
  { key: "subs", title: "Subtitles", status: "idle" },
  { key: "export", title: "Export & Post", status: "idle" }
]);

export const currentTab = writable<StepKey>("story");
export const autoContinue = writable<boolean>(true);

export const progressPct = derived(steps, ($s) => {
  const done = $s.filter((x) => x.status === "done").length;
  return Math.round((done / $s.length) * 100);
});

export function setStepStatus(key: StepKey, status: StepState["status"], error?: string) {
  steps.update((arr) => arr.map((s) => (s.key === key ? { ...s, status, error: error ?? null } : s)));
}

export function gotoNextStep() {
  let nextKey: StepKey | null = null;
  steps.update((arr) => {
    const idx = arr.findIndex((s) => s.status !== "done");
    if (idx >= 0 && idx + 1 < arr.length) nextKey = arr[idx + 1].key;
    return arr;
  });
  if (nextKey) currentTab.set(nextKey);
}
```

---

## src/lib/api.ts

```ts
import ky from "ky";
import type { Health } from "./types";

const base = "http://127.0.0.1:4545";

export async function health(): Promise<Health> {
  try {
    return await ky.get(`${base}/health`, { timeout: 4000 }).json<Health>();
  } catch {
    return { ok: false };
  }
}

// Placeholders pentru viitoarele rute (vor fi completate ulterior)
export async function generateScript(topic: string, genre: string) {
  // return await ky.post(`${base}/ai/script`, { json: { topic, genre } }).json();
  return { script: "", hooks: [], hashtags: [] };
}

export async function importBackground(file: File) {
  const fd = new FormData();
  fd.append("file", file);
  // return await ky.post(`${base}/assets/backgrounds/import`, { body: fd }).json();
  return { id: "mock", path: "path/to/bg.mp4", duration: 60 };
}
```

---

## src/lib/components/StatusPill.svelte

```svelte
<script lang="ts">
  export let status: "idle" | "in-progress" | "done" | "error" = "idle";
  $: label =
    status === "idle" ? "Idle" :
    status === "in-progress" ? "Working" :
    status === "done" ? "Done" : "Error";
  $: cls =
    status === "done" ? "badge ok" :
    status === "in-progress" ? "badge warn" :
    status === "error" ? "badge err" : "badge";
</script>

<span class={cls}>{label}</span>
```

---

## src/lib/components/Tabs.svelte

```svelte
<script lang="ts">
  import { steps, currentTab } from "../stores";
  import type { StepKey } from "../types";

  function selectTab(key: StepKey) {
    currentTab.set(key);
  }
</script>

<div class="grid" style="gap: 8px;">
  {#each $steps as s}
    <div class="tab {s.key === $currentTab ? 'active' : ''}" on:click={() => selectTab(s.key)}>
      <strong>{s.title}</strong>
    </div>
  {/each}
</div>
```

---

## src/lib/components/StepHeader.svelte

```svelte
<script lang="ts">
  import StatusPill from "./StatusPill.svelte";
  export let title = "";
  export let status: "idle" | "in-progress" | "done" | "error" = "idle";
  export let onPrimary: (() => void) | null = null;
  export let primaryLabel = "Run";
</script>

<div class="row" style="justify-content: space-between; margin-bottom: 10px;">
  <h2>{title}</h2>
  <div class="row" style="gap: 10px;">
    <StatusPill {status} />
    {#if onPrimary}
      <button class="primary" on:click={onPrimary}>{primaryLabel}</button>
    {/if}
  </div>
</div>
```

---

## src/lib/components/MediaPreview.svelte

```svelte
<script lang="ts">
  export let videoSrc: string | null = null;
  export let audioSrc: string | null = null;
</script>

<div class="grid two">
  <div class="card">
    <h3>Video Preview</h3>
    {#if videoSrc}
      <video src={videoSrc} controls style="width:100%; border-radius:8px;"></video>
    {:else}
      <div class="muted">No video selected.</div>
    {/if}
  </div>
  <div class="card">
    <h3>Audio Preview</h3>
    {#if audioSrc}
      <audio src={audioSrc} controls style="width:100%;"></audio>
    {:else}
      <div class="muted">No audio selected.</div>
    {/if}
  </div>
</div>
```

---

## Pagini tab-uri

### src/lib/tabs/StoryScript.svelte

```svelte
<script lang="ts">
  import StepHeader from "../components/StepHeader.svelte";
  import { setStepStatus, gotoNextStep, autoContinue } from "../stores";
  import { generateScript } from "../api";
  let topic = "";
  let genre = "horror";
  let scriptText = "";
  let hooks: string[] = [];
  let hashtags: string[] = [];

  async function run() {
    setStepStatus("story", "in-progress");
    try {
      // în Modul 2/3 înlocuiești mock-ul cu apelul real
      const res = await generateScript(topic, genre);
      scriptText = res.script ?? "(script will appear here)";
      hooks = res.hooks ?? ["Hook sample 1", "Hook sample 2", "Hook sample 3"];
      hashtags = res.hashtags ?? ["#storytime", "#scarystory", "#minecraft", "#parkour"];
      setStepStatus("story", "done");
      if ($autoContinue) gotoNextStep();
    } catch (e) {
      setStepStatus("story", "error", String(e));
    }
  }
</script>

<StepHeader title="Story & Script" status={"idle"} onPrimary={run} primaryLabel="Generate script" />
<div class="grid">
  <div class="card">
    <label>Topic / Link / Prompt</label>
    <input bind:value={topic} placeholder="e.g., 'Night shift at an empty hospital'"/>
  </div>
  <div class="card">
    <label>Genre</label>
    <select bind:value={genre}>
      <option value="horror">Horror</option>
      <option value="mystery">Mystery</option>
      <option value="paranormal">Paranormal</option>
      <option value="true crime">True crime</option>
    </select>
  </div>
  <div class="card">
    <label>Generated script</label>
    <textarea rows="10" bind:value={scriptText}></textarea>
  </div>
  <div class="card grid two">
    <div>
      <h3>Hooks</h3>
      <ul>{#each hooks as h}<li>{h}</li>{/each}</ul>
    </div>
    <div>
      <h3>Hashtags</h3>
      <div>{#each hashtags as t}<span class="badge" style="margin:2px;">{t}</span>{/each}</div>
    </div>
  </div>
</div>
```

### src/lib/tabs/Background.svelte

```svelte
<script lang="ts">
  import StepHeader from "../components/StepHeader.svelte";
  import MediaPreview from "../components/MediaPreview.svelte";
  import { setStepStatus, gotoNextStep, autoContinue } from "../stores";
  import { importBackground } from "../api";
  let selectedFile: File | null = null;
  let videoSrc: string | null = null;

  async function run() {
    if (!selectedFile) return;
    setStepStatus("background", "in-progress");
    try {
      // Real: upload la backend; aici doar URL local
      await importBackground(selectedFile);
      videoSrc = URL.createObjectURL(selectedFile);
      setStepStatus("background", "done");
      if ($autoContinue) gotoNextStep();
    } catch (e) {
      setStepStatus("background", "error", String(e));
    }
  }
</script>

<StepHeader title="Background" status={"idle"} onPrimary={run} primaryLabel="Import background" />
<div class="grid">
  <div class="card">
    <input type="file" accept="video/*" on:change={(e)=>{selectedFile = (e.target as HTMLInputElement).files?.[0] ?? null}} />
  </div>
  <MediaPreview {videoSrc} {audioSrc} />
</div>

<script lang="ts">
  let audioSrc: string | null = null;
</script>
```

### src/lib/tabs/VoiceOver.svelte

```svelte
<script lang="ts">
  import StepHeader from "../components/StepHeader.svelte";
  import MediaPreview from "../components/MediaPreview.svelte";
  import { setStepStatus, gotoNextStep, autoContinue } from "../stores";
  let text = "I woke up to a message I never sent.";
  let rate = 0.92;
  let pitch = -1;
  let audioSrc: string | null = null;

  async function run() {
    setStepStatus("voice", "in-progress");
    try {
      // Real: POST /tts/generate -> path WAV -> object URL
      // Mock preview
      audioSrc = null; // replace with generated audio preview
      setStepStatus("voice", "done");
      if ($autoContinue) gotoNextStep();
    } catch (e) {
      setStepStatus("voice", "error", String(e));
    }
  }
</script>

<StepHeader title="Voice-over" status={"idle"} onPrimary={run} primaryLabel="Generate voice" />
<div class="grid">
  <div class="card">
    <label>Script</label>
    <textarea rows="8" bind:value={text}></textarea>
    <div class="row" style="margin-top:8px;">
      <div style="flex:1;">
        <label>Rate</label>
        <input type="number" step="0.01" min="0.7" max="1.2" bind:value={rate} />
      </div>
      <div style="flex:1;">
        <label>Pitch (semitones)</label>
        <input type="number" step="1" min="-6" max="6" bind:value={pitch} />
      </div>
    </div>
  </div>
  <MediaPreview {audioSrc} {videoSrc} />
</div>

<script lang="ts">
  let videoSrc: string | null = null;
</script>
```

### src/lib/tabs/AudioSFX.svelte

```svelte
<script lang="ts">
  import StepHeader from "../components/StepHeader.svelte";
  import MediaPreview from "../components/MediaPreview.svelte";
  import { setStepStatus, gotoNextStep, autoContinue } from "../stores";
  let musicFile: File | null = null;
  let sfxFile: File | null = null;
  let bgVolume = 0.25;
  let audioSrc: string | null = null;

  async function run() {
    setStepStatus("audio", "in-progress");
    try {
      // Real: POST /audio/mix -> path WAV
      audioSrc = null; // replace with composed mix preview
      setStepStatus("audio", "done");
      if ($autoContinue) gotoNextStep();
    } catch (e) {
      setStepStatus("audio", "error", String(e));
    }
  }
</script>

<StepHeader title="Audio & SFX" status={"idle"} onPrimary={run} primaryLabel="Create mix" />
<div class="grid two">
  <div class="card">
    <label>Music (optional)</label>
    <input type="file" accept="audio/*" on:change={(e)=>{musicFile=(e.target as HTMLInputElement).files?.[0]??null}} />
    <label style="margin-top:8px;">SFX (optional)</label>
    <input type="file" accept="audio/*" on:change={(e)=>{sfxFile=(e.target as HTMLInputElement).files?.[0]??null}} />
    <label style="margin-top:8px;">Music volume</label>
    <input type="range" min="0" max="1" step="0.01" bind:value={bgVolume} />
  </div>
  <MediaPreview {audioSrc} {videoSrc} />
</div>

<script lang="ts">
  let videoSrc: string | null = null;
</script>
```

### src/lib/tabs/Subtitles.svelte

```svelte
<script lang="ts">
  import StepHeader from "../components/StepHeader.svelte";
  import { setStepStatus, gotoNextStep, autoContinue } from "../stores";
  let srtText = "";
  async function run() {
    setStepStatus("subs", "in-progress");
    try {
      // Real: POST /subs/generate -> srt text/file
      srtText = "1\n00:00:00,000 --> 00:00:02,000\nI woke up to a message I never sent.\n";
      setStepStatus("subs", "done");
      if ($autoContinue) gotoNextStep();
    } catch (e) {
      setStepStatus("subs", "error", String(e));
    }
  }
</script>

<StepHeader title="Subtitles" status={"idle"} onPrimary={run} primaryLabel="Generate subtitles" />
<div class="grid">
  <div class="card">
    <label>Subtitle (.srt)</label>
    <textarea rows="12" bind:value={srtText}></textarea>
  </div>
</div>
```

### src/lib/tabs/ExportPost.svelte

```svelte
<script lang="ts">
  import StepHeader from "../components/StepHeader.svelte";
  import { setStepStatus } from "../stores";
  let preset = "tiktok";
  let exportPath = "";

  async function run() {
    setStepStatus("export", "in-progress");
    try {
      // Real: POST /export -> finalPath
      exportPath = "outputs/finals/part1_ready.mp4";
      setStepStatus("export", "done");
    } catch (e) {
      setStepStatus("export", "error", String(e));
    }
  }
</script>

<StepHeader title="Export & Post" status={"idle"} onPrimary={run} primaryLabel="Export video" />
<div class="grid">
  <div class="card">
    <label>Preset</label>
    <select bind:value={preset}>
      <option value="tiktok">TikTok</option>
      <option value="shorts">YouTube Shorts</option>
      <option value="reels">Instagram Reels</option>
    </select>
  </div>
  <div class="card">
    <label>Output</label>
    <input readonly value={exportPath} />
    <div class="row" style="margin-top:8px; gap:8px;">
      <button disabled>Post to TikTok (coming)</button>
      <button on:click={()=>{ /* open folder later via Tauri */ }}>Open folder</button>
    </div>
  </div>
</div>
```

---

## src/App.svelte

```svelte
<script lang="ts">
  import Tabs from "./lib/components/Tabs.svelte";
  import { currentTab, steps, progressPct, autoContinue } from "./lib/stores";
  import { health } from "./lib/api";
  import StoryScript from "./lib/tabs/StoryScript.svelte";
  import Background from "./lib/tabs/Background.svelte";
  import VoiceOver from "./lib/tabs/VoiceOver.svelte";
  import AudioSFX from "./lib/tabs/AudioSFX.svelte";
  import Subtitles from "./lib/tabs/Subtitles.svelte";
  import ExportPost from "./lib/tabs/ExportPost.svelte";

  let backendOk = false;
  (async () => {
    const h = await health();
    backendOk = h.ok;
  })();
</script>

<div class="container">
  <aside class="sidebar">
    <h2 style="margin-bottom:16px;">Orchestrator</h2>
    <div class="row" style="justify-content:space-between;">
      <div class="badge {backendOk ? 'ok' : 'err'}">{backendOk ? 'Backend OK' : 'Backend Down'}</div>
      <label class="row" style="gap:6px;">
        <input type="checkbox" bind:checked={$autoContinue} />
        Auto-continue
      </label>
    </div>
    <div style="margin:12px 0;">
      <div class="progress"><div style="width: {$progressPct}%"></div></div>
      <small style="color: var(--muted)">{ $progressPct }% complete</small>
    </div>
    <Tabs />
    <div style="margin-top:16px;">
      <ul style="list-style:none; padding:0; margin:0; color:var(--muted);">
        {#each $steps as s}
          <li style="padding:6px 0;">• {s.title}</li>
        {/each}
      </ul>
    </div>
  </aside>
  <main class="content">
    {#if $currentTab === "story"} <StoryScript/> {/if}
    {#if $currentTab === "background"} <Background/> {/if}
    {#if $currentTab === "voice"} <VoiceOver/> {/if}
    {#if $currentTab === "audio"} <AudioSFX/> {/if}
    {#if $currentTab === "subs"} <Subtitles/> {/if}
    {#if $currentTab === "export"} <ExportPost/> {/if}
    <div class="footer">
      <small style="color:var(--muted)">Tip: keep hooks under 7s, end with a clean cliffhanger.</small>
      <small style="color:var(--muted)">1080×1920 • 30 fps • -16 LUFS</small>
    </div>
  </main>
</div>
```

---

## src/tests/app.spec.ts (Vitest smoke)

```ts
import { describe, it, expect } from "vitest";

describe("UI skeleton", () => {
  it("runs vitest", () => {
    expect(true).toBe(true);
  });
});
```

---

## README.md (UI)

```md
# UI – Video Orchestrator (Module 1)

- Tauri + Svelte UI minimalist, 6 tab-uri:
  - Story & Script
  - Background
  - Voice-over
  - Audio & SFX
  - Subtitles
  - Export & Post

- Indicator backend: ping la http://127.0.0.1:4545/health
- Auto-continue: trece la pasul următor când un task se marchează „Done”
- Previzualizare media: video/audio player

## Develop
1. Pornește orchestratorul (Module 0) la 4545
2. `pnpm --filter @app/ui dev`

## Test
- `pnpm --filter @app/ui test`

## Next
- Conectează endpoint-urile reale în `src/lib/api.ts`
- Adaugă status real per pas cu `setStepStatus()`
```

---

## Pași de rulare (Module 1)

- Pornește backend-ul din Modul 0:
  - pnpm —filter @app/orchestrator dev
- Pornește UI (în alt terminal):
  - pnpm —filter @app/ui dev
- Verifică în UI:
  - Indicator „Backend OK”
  - Navigare între tab-uri
  - Previzualizări și acțiuni mock funcționale
- Rulează testele UI:
  - pnpm —filter @app/ui test

---

## Ce urmează

- Modul 2: expune endpoint-urile reale în orchestrator (ai/script, assets, tts, audio/mix, subs, video/compose, export) și conectează-le în `api.ts`, înlocuind mock-urile.
- Modul 3: integrarea API-ului AI pentru generare de scripturi + UI de vizualizare a hook-urilor și hashtag-urilor cu opțiuni A/B.
