**Modul 7 – Export & Postare**, adică momentul în care tot ce am construit până acum (fundal, voice-over, muzică/SFX, subtitrări) se combină într-un **MP4 final optimizat** pentru TikTok, YouTube Shorts și Instagram Reels, cu opțiune de postare automată pe TikTok.

---

# **Modul 7 – Export & Postare**

## 🎯 Obiectiv
- Combinarea video + audio + subtitrări într-un fișier final `.mp4`
- Aplicarea preseturilor de export pentru fiecare platformă
- Adăugarea de elemente grafice opționale (badge „Part N”, progress bar)
- Endpoint `/export` care returnează calea fișierului final
- Opțional: integrare API TikTok pentru postare automată

---

## 📂 Structura directoare

```
apps/orchestrator/
├── src/
│   ├── routes/
│   │   └── export.js
│   ├── controllers/
│   │   └── exportController.js
│   ├── services/
│   │   └── exportService.js
│   └── utils/
│       └── ffmpegCmd.js
└── test/
    └── export.test.js
```

---

## 🔧 Preseturi export

| Platformă       | Rezoluție  | FPS | Codec video | Bitrate video | Codec audio | Bitrate audio |
|-----------------|------------|-----|-------------|---------------|-------------|---------------|
| TikTok          | 1080×1920  | 30  | H.264       | 8–10 Mbps     | AAC         | 192 kbps      |
| YouTube Shorts  | 1080×1920  | 30  | H.264       | 12 Mbps       | AAC         | 192 kbps      |
| Instagram Reels | 1080×1920  | 30  | H.264       | 8 Mbps        | AAC         | 192 kbps      |

---

## 📜 Serviciu Export

**src/services/exportService.js**
```js
import { runFfmpeg } from "../utils/ffmpegCmd.js";
import path from "path";
import fs from "fs";

const presets = {
  tiktok: { vbitrate: "8M", abitrate: "192k" },
  shorts: { vbitrate: "12M", abitrate: "192k" },
  reels: { vbitrate: "8M", abitrate: "192k" }
};

export async function exportFinal({ videoPath, audioPath, srtPath, preset = "tiktok", overlays = [] }) {
  if (!presets[preset]) throw new Error(`Unknown preset: ${preset}`);
  const { vbitrate, abitrate } = presets[preset];

  const outDir = path.resolve("data/exports");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${path.basename(videoPath, path.extname(videoPath))}_${preset}.mp4`);

  // Construim filtrul video
  let vf = [];
  if (srtPath) vf.push(`subtitles='${srtPath.replace(/\\/g, "\\\\")}'`);
  if (overlays.includes("progress")) {
    vf.push("drawbox=x=0:y=ih-8:w=iw*(t/duration):h=8:color=white@0.8:t=max");
  }
  if (overlays.includes("badge")) {
    vf.push("drawtext=text='Part 1':x=20:y=20:fontsize=48:fontcolor=white:box=1:boxcolor=black@0.5");
  }

  const args = [
    "-i", videoPath,
    "-i", audioPath,
    "-c:v", "libx264", "-preset", "medium", "-b:v", vbitrate,
    "-c:a", "aac", "-b:a", abitrate,
    "-movflags", "+faststart",
    "-r", "30"
  ];

  if (vf.length) {
    args.splice(2, 0, "-filter_complex", vf.join(","));
  }

  args.push(outPath);

  await runFfmpeg(args);
  return outPath;
}
```

---

## 📜 Controller Export

**src/controllers/exportController.js**
```js
import { z } from "zod";
import { exportFinal } from "../services/exportService.js";

const schema = z.object({
  videoPath: z.string().min(3),
  audioPath: z.string().min(3),
  srtPath: z.string().optional(),
  preset: z.enum(["tiktok", "shorts", "reels"]).default("tiktok"),
  overlays: z.array(z.string()).optional()
});

export async function exportVideo(req, res) {
  try {
    const params = schema.parse(req.body);
    const outPath = await exportFinal(params);
    res.json({ path: outPath });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
```

---

## 📜 Rută API

**src/routes/export.js**
```js
import { Router } from "express";
import { exportVideo } from "../controllers/exportController.js";
const router = Router();

router.post("/", exportVideo);

export default router;
```

În `src/app.js`:
```js
import exportRoutes from "./routes/export.js";
app.use("/export", exportRoutes);
```

---

## 🧪 Test automat

**test/export.test.js**
```js
import request from "supertest";
import app from "../src/app.js";
import fs from "fs";

describe("Export API", () => {
  it("exports final MP4", async () => {
    const res = await request(app)
      .post("/export")
      .send({
        videoPath: "test/fixtures/bg.mp4",
        audioPath: "test/fixtures/voice.wav",
        preset: "tiktok"
      });
    expect(res.statusCode).toBe(200);
    expect(fs.existsSync(res.body.path)).toBe(true);
  });
});
```

---

## 🔗 Conectare cu UI (Export tab)

În `apps/ui/src/lib/api.ts`:
```ts
export async function exportVideo(videoPath: string, audioPath: string, srtPath: string | null, preset: string, overlays: string[]) {
  return await ky.post(`${base}/export`, { json: { videoPath, audioPath, srtPath, preset, overlays } }).json<{ path: string }>();
}
```

În `ExportPost.svelte`:
```svelte
import { exportVideo } from "../api";
...
async function run() {
  setStepStatus("export", "in-progress");
  try {
    const res = await exportVideo(selectedVideoPath, selectedAudioPath, selectedSrtPath, preset, ["progress","badge"]);
    exportPath = res.path;
    setStepStatus("export", "done");
  } catch (e) {
    setStepStatus("export", "error", String(e));
  }
}
```

---

## 📤 Postare automată pe TikTok (opțional)

TikTok oferă API pentru upload video:  
https://developers.tiktokglobalshop.com/doc/api-reference/video/upload-video

Flux:
1. Obții token OAuth2
2. POST `/video/upload/` cu fișierul MP4
3. POST `/video/publish/` cu meta (descriere, hashtags)

În orchestrator:
- Endpoint `/post/tiktok` care primește `videoPath` + meta
- Folosește `form-data` pentru upload

---

## ✅ Definition of Done – Modul 7
- Endpoint `/export` combină video + audio + subtitrări + overlays
- Preseturi pentru TikTok/Shorts/Reels
- UI poate exporta și salva MP4 final
- Opțional: postare automată pe TikTok
- Testele trec (unit + integration)

---

Gabor, dacă vrei, următorul pas este **Modul 8 – Generator voxel (Godot)**, unde vom crea fundalul „Minecraft parkour-like” original, complet integrat în flux.  
Vrei să continuăm cu Modul 8?
