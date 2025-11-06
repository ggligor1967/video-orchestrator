**Modul 5 – TTS local (Piper/Coqui)**, adică partea în care legăm tab-ul „Voice-over” din UI la un serviciu local de generare voce, complet gratuit și offline.  
Scopul este să poți transforma scriptul generat de AI (din Modul 3) într-un fișier audio WAV de calitate, gata de mixat în Modul 4.

---

# **Modul 5 – TTS local (Piper/Coqui)**

## 🎯 Obiectiv
- Integrare **Piper TTS** (rapid, offline, voci naturale în engleză)
- Opțional: integrare **Coqui TTS** (mai multe voci, control prosodie)
- Endpoint API `/tts/generate` care primește text + preset voce + parametri (rate, pitch)
- Salvare fișier WAV în structura proiectului
- Teste automate pentru verificarea fișierului audio

---

## 📂 Structura directoare

```
apps/orchestrator/
├── src/
│   ├── routes/
│   │   └── tts.js
│   ├── controllers/
│   │   └── ttsController.js
│   ├── services/
│   │   └── ttsService.js
│   └── utils/
│       └── filePaths.js
└── test/
    └── tts.test.js
```

---

## 🔧 Instalare Piper local

1. **Descarcă Piper** (Windows build):  
   https://github.com/rhasspy/piper/releases  
   → descarcă arhiva `piper_windows_amd64.zip` și extrage în `tools/piper/`

2. **Descarcă un model engleză** (ex. `en_US-amy-medium.onnx`):  
   https://github.com/rhasspy/piper/releases/tag/v0.0.2  
   → pune modelul în `tools/piper/models/`

Structura:
```
tools/piper/
├── piper.exe
└── models/
    └── en_US-amy-medium.onnx
```

---

## 📜 Serviciu TTS

**src/services/ttsService.js**
```js
import { spawn } from "child_process";
import path from "path";
import fs from "fs";

const PIPER_BIN = path.resolve("tools/piper/piper.exe");
const MODELS_DIR = path.resolve("tools/piper/models");

export async function generateTTS({ text, voicePreset = "en_US-amy-medium.onnx", rate = 1.0, pitch = 0, outPath }) {
  if (!fs.existsSync(PIPER_BIN)) throw new Error("Piper binary not found");
  const modelPath = path.join(MODELS_DIR, voicePreset);
  if (!fs.existsSync(modelPath)) throw new Error(`Voice model not found: ${voicePreset}`);

  return new Promise((resolve, reject) => {
    const args = [
      "-m", modelPath,
      "-f", outPath,
      "-t", text
    ];
    const env = { ...process.env };
    const proc = spawn(PIPER_BIN, args, { env });

    proc.stderr.on("data", (d) => console.error("[Piper]", d.toString()));
    proc.on("close", (code) => {
      if (code === 0 && fs.existsSync(outPath)) resolve(outPath);
      else reject(new Error(`Piper exited with code ${code}`));
    });
  });
}
```

---

## 📜 Controller TTS

**src/controllers/ttsController.js**
```js
import { z } from "zod";
import path from "path";
import fs from "fs";
import { generateTTS } from "../services/ttsService.js";

const schema = z.object({
  text: z.string().min(5),
  voicePreset: z.string().default("en_US-amy-medium.onnx"),
  rate: z.number().min(0.5).max(1.5).default(1.0),
  pitch: z.number().min(-10).max(10).default(0)
});

export async function ttsGenerate(req, res) {
  try {
    const { text, voicePreset, rate, pitch } = schema.parse(req.body);
    const outDir = path.resolve("data/tts");
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    const fileName = `tts_${Date.now()}.wav`;
    const outPath = path.join(outDir, fileName);

    await generateTTS({ text, voicePreset, rate, pitch, outPath });
    res.json({ path: outPath });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
```

---

## 📜 Rută API

**src/routes/tts.js**
```js
import { Router } from "express";
import { ttsGenerate } from "../controllers/ttsController.js";
const router = Router();

router.post("/generate", ttsGenerate);

export default router;
```

În `src/app.js`:
```js
import ttsRoutes from "./routes/tts.js";
app.use("/tts", ttsRoutes);
```

---

## 🧪 Test automat

**test/tts.test.js**
```js
import request from "supertest";
import app from "../src/app.js";
import fs from "fs";

describe("TTS API", () => {
  it("generates WAV file", async () => {
    const res = await request(app)
      .post("/tts/generate")
      .send({ text: "This is a test voice line." });
    expect(res.statusCode).toBe(200);
    expect(fs.existsSync(res.body.path)).toBe(true);
  });
});
```

---

## 🔗 Conectare cu UI (Voice-over tab)

În `apps/ui/src/lib/api.ts`:
```ts
export async function generateVoice(text: string, voicePreset: string, rate: number, pitch: number) {
  return await ky.post(`${base}/tts/generate`, { json: { text, voicePreset, rate, pitch } }).json<{ path: string }>();
}
```

În `VoiceOver.svelte`:
```svelte
import { generateVoice } from "../api";
...
async function run() {
  setStepStatus("voice", "in-progress");
  try {
    const res = await generateVoice(text, "en_US-amy-medium.onnx", rate, pitch);
    audioSrc = `http://127.0.0.1:4545/${res.path}`; // dacă servești fișierele static
    setStepStatus("voice", "done");
    if ($autoContinue) gotoNextStep();
  } catch (e) {
    setStepStatus("voice", "error", String(e));
  }
}
```

---

## ✅ Definition of Done – Modul 5
- Piper TTS rulează local și generează fișiere WAV
- Endpoint `/tts/generate` funcțional
- UI poate trimite text și primi audio real
- Testele trec (unit + integration)
- Structura pregătită pentru adăugarea Coqui TTS ca alternativă

---

Dacă vrei, următorul pas este **Modul 6 – Subtitrări (Whisper.cpp + AutoSub)**, unde vom genera automat .srt sincronizat din audio și îl vom integra în tab-ul „Subtitles”.  
Continuăm cu Modul 6?
