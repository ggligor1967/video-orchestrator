Perfect, Gabor — mergem mai departe cu **Modul 2 – Backend Orchestrator complet funcțional**, astfel încât UI-ul din Modul 1 să înceapă să comunice cu rute reale și să putem lega fluxul end-to-end.

---

# **Modul 2 – Backend Orchestrator (Node.js + Express)**

## 🎯 Obiectiv
- Implementarea API-ului local cu endpoint-urile de bază
- Structură clară pe module (controllers, services, utils)
- Validare input și răspunsuri consistente
- Teste unitare și de integrare
- Conectare cu UI-ul (înlocuirea mock-urilor din `api.ts`)

---

## 📂 Structura directoare backend

```
apps/orchestrator/
├── package.json
├── src/
│   ├── index.js
│   ├── app.js
│   ├── routes/
│   │   ├── health.js
│   │   ├── ai.js
│   │   ├── assets.js
│   │   ├── tts.js
│   │   ├── audio.js
│   │   ├── subs.js
│   │   ├── video.js
│   │   └── export.js
│   ├── controllers/
│   │   ├── aiController.js
│   │   ├── assetsController.js
│   │   ├── ttsController.js
│   │   ├── audioController.js
│   │   ├── subsController.js
│   │   ├── videoController.js
│   │   └── exportController.js
│   ├── services/
│   │   ├── aiService.js
│   │   ├── ffmpegService.js
│   │   ├── ttsService.js
│   │   ├── subsService.js
│   │   └── fileService.js
│   ├── utils/
│   │   ├── validate.js
│   │   └── logger.js
│   └── config/
│       └── env.js
└── test/
    ├── health.test.js
    ├── ai.test.js
    └── ...
```

---

## 📜 Configurare de bază

**apps/orchestrator/package.json** (actualizat)
```json
{
  "name": "@app/orchestrator",
  "version": "0.1.0",
  "type": "module",
  "main": "src/index.js",
  "scripts": {
    "dev": "nodemon src/index.js",
    "test": "jest --runInBand"
  },
  "dependencies": {
    "express": "^4.19.2",
    "dotenv": "^16.4.5",
    "multer": "^1.4.5-lts.1",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "nodemon": "^3.1.0",
    "jest": "^29.7.0",
    "supertest": "^6.3.4"
  }
}
```

---

## **src/index.js**
```js
import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";

const PORT = process.env.PORT || 4545;
app.listen(PORT, () => {
  console.log(`Orchestrator API running at http://127.0.0.1:${PORT}`);
});
```

---

## **src/app.js**
```js
import express from "express";
import cors from "cors";
import healthRoutes from "./routes/health.js";
import aiRoutes from "./routes/ai.js";
import assetsRoutes from "./routes/assets.js";

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/health", healthRoutes);
app.use("/ai", aiRoutes);
app.use("/assets", assetsRoutes);

export default app;
```

---

## **src/routes/health.js**
```js
import { Router } from "express";
const router = Router();

router.get("/", (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

export default router;
```

---

## **src/routes/ai.js**
```js
import { Router } from "express";
import { generateScript } from "../controllers/aiController.js";
const router = Router();

router.post("/script", generateScript);

export default router;
```

---

## **src/controllers/aiController.js**
```js
import { z } from "zod";
import { aiGenerateScript } from "../services/aiService.js";

const schema = z.object({
  topic: z.string().min(3),
  genre: z.enum(["horror", "mystery", "paranormal", "true crime"])
});

export async function generateScript(req, res) {
  try {
    const { topic, genre } = schema.parse(req.body);
    const result = await aiGenerateScript(topic, genre);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
```

---

## **src/services/aiService.js** (mock temporar)
```js
export async function aiGenerateScript(topic, genre) {
  // TODO: Integrare reală cu OpenAI/Gemini în Modul 3
  return {
    script: `This is a mock script for topic "${topic}" in genre "${genre}".`,
    hooks: ["Hook 1", "Hook 2", "Hook 3"],
    hashtags: ["#storytime", "#mock", "#ai"]
  };
}
```

---

## **src/routes/assets.js**
```js
import { Router } from "express";
import multer from "multer";
import { importBackground } from "../controllers/assetsController.js";

const upload = multer({ dest: "data/assets/backgrounds/" });
const router = Router();

router.post("/backgrounds/import", upload.single("file"), importBackground);

export default router;
```

---

## **src/controllers/assetsController.js**
```js
export async function importBackground(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  res.json({
    id: req.file.filename,
    path: req.file.path,
    duration: null // TODO: calcul durată cu ffprobe
  });
}
```

---

## **test/health.test.js**
```js
import request from "supertest";
import app from "../src/app.js";

describe("Healthcheck", () => {
  it("should return ok:true", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});
```

---

## 🔗 Conectare cu UI
În `apps/ui/src/lib/api.ts` înlocuiești mock-urile cu apeluri reale:
```ts
export async function generateScript(topic: string, genre: string) {
  return await ky.post(`${base}/ai/script`, { json: { topic, genre } }).json();
}

export async function importBackground(file: File) {
  const fd = new FormData();
  fd.append("file", file);
  return await ky.post(`${base}/assets/backgrounds/import`, { body: fd }).json();
}
```

---

## ✅ Definition of Done Modul 2
- API local rulează pe 4545
- `/health` răspunde OK
- `/ai/script` primește topic+genre și returnează mock script
- `/assets/backgrounds/import` acceptă upload video
- Testele unitare trec
- UI poate apela aceste endpoint-uri și primește date reale

---

Dacă vrei, următorul pas este **Modul 3 – Integrarea reală cu API-ul AI (OpenAI/Gemini)**, unde înlocuim mock-ul din `aiService.js` cu apelul real și adăugăm prompturile optimizate pentru generarea scripturilor, hook-urilor și hashtag-urilor.  

Vrei să trecem direct la **Modul 3 – Integrare AI reală**?
