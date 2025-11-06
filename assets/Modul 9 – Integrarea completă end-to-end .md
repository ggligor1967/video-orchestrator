**Planning deliverables**

Okay, I need to keep this concise but still comprehensive. No citations are necessary, and I’ll stay away from mentioning tools. The structure should include:

- Overview of objectives
- Data model and project context, define ProjectState for shared package and paths
- Backend integration tasks, including serving static files and endpoint creation
- UI integration with project context and path selection
- E2E CLI script for sequential flow and output verification
- Tests using Jest with temporary fixtures
- Runbook steps for installation
- Error handling, retries, and fallback behaviours
- Performance and caching considerations
- Definition of Done clarified
# Modul 9 – Integrarea completă end-to-end

În acest modul legăm toate modulele într-un flux coerent: de la prompt → script → fundal → voice-over → mix audio → subtitrări → compoziție → export MP4 → (opțional) postare. Vei primi integrarea codului, un pipeline API/CLI pentru rulare automată, actualizări UI și un test end-to-end care validează un export final.

---

## Obiectiv și condiții preliminare

- Integrarea tuturor endpoint-urilor implementate în modulele 2–7.
- Un „context de proiect” în UI care reține calea asset-urilor și rezultatelor.
- Servire fișiere media local pentru previzualizare în UI.
- Un CLI e2e care rulează întreg fluxul fără UI.
- Test end-to-end care validează fișierul final cu ffprobe.

Precondiții:
- FFmpeg instalat și accesibil în PATH.
- Piper + model existent (tools/piper/...).
- Whisper.cpp + model existent (tools/whisper/...).
- UI și Orchestrator la zi cu modulele precedente.

---

## Integrare backend

### 1) Servire fișiere statice din data/

Adaugă în apps/orchestrator/src/app.js:
```js
import path from "path";
import express from "express";
const dataDir = path.resolve("data");
app.use("/static", express.static(dataDir, { fallthrough: true, immutable: false, maxAge: "1h" }));
```
- Ideea: orice cale salvată în data/... devine accesibilă ca http://127.0.0.1:4545/static/...

### 2) Conectează toate rutele

În apps/orchestrator/src/app.js (complet):
```js
import express from "express";
import cors from "cors";
import healthRoutes from "./routes/health.js";
import aiRoutes from "./routes/ai.js";
import assetsRoutes from "./routes/assets.js";
import ttsRoutes from "./routes/tts.js";
import audioRoutes from "./routes/audio.js";
import subsRoutes from "./routes/subs.js";
import videoRoutes from "./routes/video.js";
import exportRoutes from "./routes/export.js";
import path from "path";

const app = express();
app.use(cors());
app.use(express.json());

const dataDir = path.resolve("data");
app.use("/static", express.static(dataDir));

app.use("/health", healthRoutes);
app.use("/ai", aiRoutes);
app.use("/assets", assetsRoutes);
app.use("/tts", ttsRoutes);
app.use("/audio", audioRoutes);
app.use("/subs", subsRoutes);
app.use("/video", videoRoutes);
app.use("/export", exportRoutes);

export default app;
```

### 3) „Pipeline” orchestrat din backend (opțional, dar util)

Adaugă o rută care rulează cap-coadă cu input minim (topic + gen + fundal selectat). Creează apps/orchestrator/src/routes/pipeline.js:

```js
import { Router } from "express";
import { aiGenerateScript } from "../services/aiService.js";
import { generateTTS } from "../services/ttsService.js";
import { loudnorm, mixWithMusic } from "../services/audioService.js";
import { generateSrtFromAudio } from "../services/subsService.js";
import { cropAndScale, speedRamp, muxVideoAudio } from "../services/videoService.js";
import { exportFinal } from "../services/exportService.js";
import path from "path";
import fs from "fs";

const router = Router();

router.post("/build", async (req, res) => {
  const {
    topic,
    genre = "mystery",
    bgPath,
    musicPath = null,
    voicePreset = "en_US-amy-medium.onnx",
    rate = 0.92,
    pitch = -1,
    preset = "tiktok",
    overlays = ["progress"]
  } = req.body || {};

  try {
    // 1) Script (AI)
    const { script, hooks, hashtags } = await aiGenerateScript(topic, genre);

    // 2) TTS
    const outDir = path.resolve("data", "pipeline", Date.now().toString());
    fs.mkdirSync(outDir, { recursive: true });
    const voiceWav = path.join(outDir, "voice.wav");
    await generateTTS({ text: script, voicePreset, rate, pitch, outPath: voiceWav });

    // 3) Subtitrări
    const srtPath = await generateSrtFromAudio(voiceWav, outDir);

    // 4) Audio: mix (opțional muzică) + loudnorm
    let mixed = voiceWav;
    if (musicPath) {
      const mixWav = path.join(outDir, "mix.wav");
      await mixWithMusic(voiceWav, musicPath, mixWav, 0.25);
      mixed = mixWav;
    }
    const normWav = path.join(outDir, "mix_norm.wav");
    await loudnorm(mixed, normWav);

    // 5) Video processing (crop + ramp)
    const cropped = path.join(outDir, "bg_cropped.mp4");
    await cropAndScale(bgPath, cropped);
    const ramped = path.join(outDir, "bg_ramped.mp4");
    await speedRamp(cropped, ramped);

    // 6) Export final (burn subs + mux + presets)
    const finalPath = await exportFinal({
      videoPath: ramped,
      audioPath: normWav,
      srtPath,
      preset,
      overlays
    });

    res.json({
      ok: true,
      script,
      hooks,
      hashtags,
      outputs: {
        voiceWav,
        srtPath,
        normWav,
        video: ramped,
        finalPath
      }
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
```

În app.js:
```js
import pipelineRoutes from "./routes/pipeline.js";
app.use("/pipeline", pipelineRoutes);
```

---

## Integrare UI end-to-end

### 1) Context de proiect și păstrarea căilor

apps/ui/src/lib/types.ts:
```ts
export interface ProjectContext {
  bgPath: string | null;
  voicePath: string | null;
  mixPath: string | null;
  srtPath: string | null;
  finalPath: string | null;
}
```

apps/ui/src/lib/stores.ts:
```ts
import { writable } from "svelte/store";
import type { ProjectContext } from "./types";

export const project = writable<ProjectContext>({
  bgPath: null,
  voicePath: null,
  mixPath: null,
  srtPath: null,
  finalPath: null
});
```

### 2) Actualizează tab-urile să salveze căi reale

- Background: după import, setează project.bgPath.
- Voice-over: după TTS, setează project.voicePath.
- Audio&SFX: după mix/loudnorm, setează project.mixPath.
- Subtitles: după generare, setează project.srtPath.
- Export: după export, setează project.finalPath.

Exemplu (în Background.svelte după import):
```svelte
<script lang="ts">
  import { project } from "../stores";
  // ...
  async function run() {
    // importBackground → res.path (de pe /assets)
    const res = await importBackground(selectedFile);
    project.update(p => ({ ...p, bgPath: res.path }));
    videoSrc = `http://127.0.0.1:4545/static/${res.path.split("data/")[1] ?? ""}`;
  }
</script>
```

Observație: cum toate fișierele sunt în data/, pentru previzualizare construim URL-ul static cu /static/… relativ la data/.

### 3) Buton „Run all” în Export & Post (apelează pipeline)

apps/ui/src/lib/api.ts:
```ts
export async function runPipeline(payload: {
  topic: string;
  genre: string;
  bgPath: string;
  musicPath?: string|null;
  voicePreset?: string;
  rate?: number;
  pitch?: number;
  preset?: "tiktok"|"shorts"|"reels";
  overlays?: string[];
}) {
  return await ky.post(`${base}/pipeline/build`, { json: payload }).json<{
    ok: boolean;
    script: string;
    hooks: string[];
    hashtags: string[];
    outputs: { finalPath: string; srtPath: string; voiceWav: string; normWav: string; video: string; };
  }>();
}
```

În ExportPost.svelte, adaugă un buton „Run all (pipeline)” care colectează din stores contextul și topicul (din Story tab) și apelează pipeline-ul. Pe succes, setează project.finalPath și arată link de previzualizare.

---

## CLI end-to-end (fără UI)

Creează scripts/e2e.mjs pentru rulare completă:

```js
#!/usr/bin/env node
import fetch from "node-fetch";

const BASE = "http://127.0.0.1:4545";

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`${path} HTTP ${res.status}: ${await res.text()}`);
  return res.json();
}

async function main() {
  const topic = process.argv.slice(2).join(" ") || "Night shift at an empty hospital";
  const genre = "mystery";
  const bgPath = "data/assets/backgrounds/obs/sample_bg.mp4";
  const musicPath = null;

  const out = await post("/pipeline/build", {
    topic, genre, bgPath, musicPath, voicePreset: "en_US-amy-medium.onnx", rate: 0.92, pitch: -1, preset: "tiktok", overlays: ["progress","badge"]
  });

  console.log("Final:", out.outputs.finalPath);
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
```

Adaugă în package.json (root):
```json
"scripts": {
  "e2e": "node scripts/e2e.mjs"
}
```

---

## Test end-to-end cu validări media

apps/orchestrator/test/e2e.pipeline.test.js:
```js
import request from "supertest";
import app from "../src/app.js";
import { execFileSync } from "child_process";

function ffprobeInfo(file) {
  const out = execFileSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height,avg_frame_rate", "-of", "csv=p=0", file], { encoding: "utf8" }).trim();
  const [w, h, fr] = out.split(",");
  return { w: Number(w), h: Number(h), fr };
}

describe("E2E pipeline", () => {
  it("produces a valid 1080x1920 MP4", async () => {
    const payload = {
      topic: "Night shift at empty hospital",
      genre: "mystery",
      bgPath: "test/fixtures/bg.mp4",
      musicPath: null,
      voicePreset: "en_US-amy-medium.onnx",
      rate: 0.92,
      pitch: -1,
      preset: "tiktok",
      overlays: ["progress"]
    };

    const res = await request(app).post("/pipeline/build").send(payload);
    expect(res.statusCode).toBe(200);
    const finalPath = res.body.outputs.finalPath;
    const info = ffprobeInfo(finalPath);
    expect(info.w).toBe(1080);
    expect(info.h).toBe(1920);
    expect(info.fr.includes("30")).toBe(true);
  }, 120000);
});
```

Note:
- Testul presupune fișiere fixture valide (bg, modele Piper/Whisper). Poți marca testul e2e ca „optional” în CI local sau să folosești skip dacă nu există tool-urile.

---

## Gestionare erori, retry și UX

- AI (Modul 3): deja cu retry/backoff.
- FFmpeg: prinde stderr din runFfmpeg și propagă un mesaj scurt și clar către UI.
- Piper/Whisper: înainte de rulare, validează existența binarelor și modelelor; răspunde 400 cu mesaj util.
- UI: dacă un pas eșuează, marchează step-ul ca „Error” și permite reluare; păstrează fișierele intermediare.

---

## Performanță și cache

- Cache pentru:
  - Script AI per topic+genre (salvează JSON sub data/cache/ai/).
  - TTS per script hash + preset (data/cache/tts/).
  - Crop/ramp per bgPath + opțiuni (data/cache/video/).
- Verifică existența fișierelor înainte de re-procesare; dacă există și sunt valide, sari pasul.

---

## Runbook end-to-end

- Pornește orchestrator:
  - pnpm --filter @app/orchestrator dev
- Pornește UI:
  - pnpm --filter @app/ui dev
- Din UI:
  - Story → Generate
  - Background → Import (sau selectează un bg din data/assets/backgrounds/)
  - Voice-over → Generate
  - Audio → Mix + Loudnorm
  - Subtitles → Generate
  - Export → Export video sau Run all (pipeline)
- CLI:
  - pnpm e2e "Your topic here"

---

## Definition of done – Modul 9

- Flux complet funcțional din UI și din CLI.
- Fișier final MP4 validat cu ffprobe: 1080×1920, 30fps, AAC 192kbps, +faststart.
- Toate erorile gestionate și raportate în UI.
- Timp total: < 15 minute pentru un clip de ~60s pe un PC mediu.
- Opțional: postare TikTok configurabilă.

---

Dacă vrei, îți pot pregăti acum un checklist „ready for release” și un ghid scurt pentru livrarea unui installer Windows (Tauri bundle) cu preflight check pentru FFmpeg/Piper/Whisper. Vrei să-l adaug?
