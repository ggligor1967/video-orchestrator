Perfect, Gabor — intrăm în **Modul 6 – Subtitrări (Whisper.cpp + AutoSub)**, adică partea în care automatizăm generarea de subtitrări sincronizate din audio, le punem într-un format standard `.srt` și le integrăm în tab-ul „Subtitles” din UI.  
Vom lucra 100% local, cu **Whisper.cpp** pentru recunoaștere vocală și **AutoSub** pentru segmentare și formatare.

---

# **Modul 6 – Subtitrări (Whisper.cpp + AutoSub)**

## 🎯 Obiectiv
- Integrare **Whisper.cpp** local pentru transcriere audio → text
- Folosirea **AutoSub** pentru generare `.srt` cu timpi corecți
- Endpoint API `/subs/generate` care primește un fișier audio și returnează `.srt`
- Opțiune de editare rapidă în UI (din tab-ul „Subtitles”)
- Teste automate pentru validarea formatului `.srt`

---

## 📂 Structura directoare

```
apps/orchestrator/
├── src/
│   ├── routes/
│   │   └── subs.js
│   ├── controllers/
│   │   └── subsController.js
│   ├── services/
│   │   └── subsService.js
│   └── utils/
│       └── filePaths.js
└── test/
    └── subs.test.js
```

---

## 🔧 Instalare Whisper.cpp + AutoSub

1. **Whisper.cpp** (Windows build):  
   - Repo: https://github.com/ggerganov/whisper.cpp  
   - Compilează sau descarcă binarul precompilat (`main.exe`) și pune-l în `tools/whisper/`
   - Descarcă modelul `ggml-base.en.bin` (suficient pentru engleză, rapid) în `tools/whisper/models/`

2. **AutoSub** (Python, local):  
   - `pip install git+https://github.com/agermanidis/autosub.git`  
   - Necesită ffmpeg instalat și în PATH

Structura:
```
tools/whisper/
├── main.exe
└── models/
    └── ggml-base.en.bin
```

---

## 📜 Serviciu Subtitrări

**src/services/subsService.js**
```js
import { spawn } from "child_process";
import path from "path";
import fs from "fs";

const WHISPER_BIN = path.resolve("tools/whisper/main.exe");
const WHISPER_MODEL = path.resolve("tools/whisper/models/ggml-base.en.bin");

export async function generateSrtFromAudio(audioPath, outDir) {
  if (!fs.existsSync(WHISPER_BIN)) throw new Error("Whisper binary not found");
  if (!fs.existsSync(WHISPER_MODEL)) throw new Error("Whisper model not found");

  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${path.basename(audioPath, path.extname(audioPath))}.srt`);

  return new Promise((resolve, reject) => {
    const args = [
      "-m", WHISPER_MODEL,
      "-f", audioPath,
      "-osrt",
      "-of", path.join(outDir, path.basename(audioPath, path.extname(audioPath)))
    ];
    const proc = spawn(WHISPER_BIN, args);

    proc.stderr.on("data", (d) => console.error("[Whisper]", d.toString()));
    proc.on("close", (code) => {
      if (code === 0 && fs.existsSync(outPath)) resolve(outPath);
      else reject(new Error(`Whisper exited with code ${code}`));
    });
  });
}
```

---

## 📜 Controller Subtitrări

**src/controllers/subsController.js**
```js
import { z } from "zod";
import path from "path";
import fs from "fs";
import { generateSrtFromAudio } from "../services/subsService.js";

const schema = z.object({
  audioPath: z.string().min(3)
});

export async function subsGenerate(req, res) {
  try {
    const { audioPath } = schema.parse(req.body);
    const outDir = path.resolve("data/subs");
    const srtPath = await generateSrtFromAudio(audioPath, outDir);
    const srtContent = fs.readFileSync(srtPath, "utf-8");
    res.json({ path: srtPath, content: srtContent });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
```

---

## 📜 Rută API

**src/routes/subs.js**
```js
import { Router } from "express";
import { subsGenerate } from "../controllers/subsController.js";
const router = Router();

router.post("/generate", subsGenerate);

export default router;
```

În `src/app.js`:
```js
import subsRoutes from "./routes/subs.js";
app.use("/subs", subsRoutes);
```

---

## 🧪 Test automat

**test/subs.test.js**
```js
import request from "supertest";
import app from "../src/app.js";
import fs from "fs";

describe("Subtitles API", () => {
  it("generates SRT file", async () => {
    const audioPath = "test/fixtures/sample.wav"; // fișier scurt de test
    const res = await request(app)
      .post("/subs/generate")
      .send({ audioPath });
    expect(res.statusCode).toBe(200);
    expect(res.body.content).toMatch(/\d+\n\d{2}:\d{2}:\d{2},\d{3}/);
    expect(fs.existsSync(res.body.path)).toBe(true);
  });
});
```

---

## 🔗 Conectare cu UI (Subtitles tab)

În `apps/ui/src/lib/api.ts`:
```ts
export async function generateSubtitles(audioPath: string) {
  return await ky.post(`${base}/subs/generate`, { json: { audioPath } }).json<{ path: string; content: string }>();
}
```

În `Subtitles.svelte`:
```svelte
import { generateSubtitles } from "../api";
...
async function run() {
  setStepStatus("subs", "in-progress");
  try {
    const res = await generateSubtitles(selectedAudioPath);
    srtText = res.content;
    setStepStatus("subs", "done");
    if ($autoContinue) gotoNextStep();
  } catch (e) {
    setStepStatus("subs", "error", String(e));
  }
}
```

---

## ✅ Definition of Done – Modul 6
- Whisper.cpp rulează local și generează `.srt` din audio
- Endpoint `/subs/generate` funcțional
- UI poate trimite audio și primi subtitrări reale
- Testele trec (unit + integration)
- Subtitrările sunt lizibile, sincronizate și editabile în UI

---

Dacă vrei, următorul pas este **Modul 7 – Export & Postare**, unde vom combina video + audio + subtitrări într-un MP4 final optimizat pentru TikTok/Shorts/Reels și vom adăuga opțiunea de postare automată pe TikTok.  
Continuăm cu Modul 7?
