**Modul 4 – Servicii media FFmpeg**.  
Aici facem partea „greu de ridicat” din orchestrator: procesarea video/audio locală, astfel încât să putem lega tab-urile **Background**, **Voice-over**, **Audio & SFX**, **Subtitles** și **Export** din UI la endpoint-uri reale.

---

# **Modul 4 – Servicii media FFmpeg**

## 🎯 Obiectiv
- Implementarea serviciilor locale pentru:
  1. **Crop 9:16 + scale** (din surse 16:9 sau ultrawide)
  2. **Speed ramp** (ușor accelerat după primele secunde)
  3. **Normalizare loudness** (-16 LUFS, peak ≤ -1 dB)
  4. **Mix audio** (voice + muzică + SFX cu sidechain)
  5. **Mux video + audio**
  6. **Burn-in subtitrări** sau soft subs
- Endpoint-uri API pentru fiecare operație
- Teste automate cu **ffprobe** pentru validare

---

## 📂 Structura directoare

```
apps/orchestrator/
├── src/
│   ├── routes/
│   │   ├── audio.js
│   │   ├── video.js
│   │   └── subs.js
│   ├── controllers/
│   │   ├── audioController.js
│   │   ├── videoController.js
│   │   └── subsController.js
│   ├── services/
│   │   ├── ffmpegService.js
│   │   ├── audioService.js
│   │   ├── videoService.js
│   │   └── subsService.js
│   └── utils/
│       ├── ffmpegCmd.js
│       └── filePaths.js
└── test/
    ├── audio.test.js
    ├── video.test.js
    └── subs.test.js
```

---

## 🔧 Utilitar comun FFmpeg

**src/utils/ffmpegCmd.js**
```js
import { spawn } from "child_process";

export function runFfmpeg(args, { cwd = process.cwd() } = {}) {
  return new Promise((resolve, reject) => {
    const ff = spawn("ffmpeg", ["-y", ...args], { cwd });
    let stderr = "";
    ff.stderr.on("data", (d) => { stderr += d.toString(); });
    ff.on("close", (code) => {
      if (code === 0) resolve({ ok: true, log: stderr });
      else reject(new Error(`FFmpeg exited with code ${code}: ${stderr}`));
    });
  });
}
```

---

## 📜 Serviciu video

**src/services/videoService.js**
```js
import { runFfmpeg } from "../utils/ffmpegCmd.js";
import path from "path";

export async function cropAndScale(inputPath, outputPath) {
  const args = [
    "-i", inputPath,
    "-filter_complex", "[0:v]scale=-1:1920,crop=1080:1920",
    "-r", "30",
    "-an",
    "-c:v", "libx264", "-crf", "18", "-preset", "medium",
    outputPath
  ];
  await runFfmpeg(args);
  return outputPath;
}

export async function speedRamp(inputPath, outputPath) {
  const args = [
    "-i", inputPath,
    "-filter_complex", "[0:v]setpts='if(lte(T,2),PTS,PTS*0.96)'",
    "-r", "30",
    "-an",
    "-c:v", "libx264", "-crf", "18", "-preset", "medium",
    outputPath
  ];
  await runFfmpeg(args);
  return outputPath;
}

export async function muxVideoAudio(videoPath, audioPath, outputPath) {
  const args = [
    "-i", videoPath,
    "-i", audioPath,
    "-c:v", "copy",
    "-c:a", "aac", "-b:a", "192k",
    "-shortest",
    outputPath
  ];
  await runFfmpeg(args);
  return outputPath;
}
```

---

## 📜 Serviciu audio

**src/services/audioService.js**
```js
import { runFfmpeg } from "../utils/ffmpegCmd.js";

export async function loudnorm(inputPath, outputPath) {
  const args = [
    "-i", inputPath,
    "-filter:a", "loudnorm=I=-16:TP=-1:LRA=11",
    outputPath
  ];
  await runFfmpeg(args);
  return outputPath;
}

export async function mixWithMusic(voicePath, musicPath, outputPath, musicVol = 0.25) {
  const args = [
    "-i", voicePath,
    "-i", musicPath,
    "-filter_complex",
    `[1:a]volume=${musicVol}[bg];[0:a][bg]amix=inputs=2:duration=first:dropout_transition=3`,
    "-c:a", "aac", "-b:a", "192k",
    outputPath
  ];
  await runFfmpeg(args);
  return outputPath;
}
```

---

## 📜 Serviciu subtitrări

**src/services/subsService.js**
```js
import { runFfmpeg } from "../utils/ffmpegCmd.js";

export async function burnInSubs(videoPath, srtPath, outputPath) {
  const args = [
    "-i", videoPath,
    "-vf", `subtitles='${srtPath.replace(/\\/g, "\\\\")}'`,
    "-c:v", "libx264", "-crf", "18", "-preset", "medium",
    "-c:a", "copy",
    outputPath
  ];
  await runFfmpeg(args);
  return outputPath;
}
```

---

## 📜 Rute API

**src/routes/video.js**
```js
import { Router } from "express";
import { cropAndScale, speedRamp, muxVideoAudio } from "../services/videoService.js";
const router = Router();

router.post("/crop-scale", async (req, res) => {
  try {
    const { inputPath, outputPath } = req.body;
    await cropAndScale(inputPath, outputPath);
    res.json({ ok: true, outputPath });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/speed-ramp", async (req, res) => {
  try {
    const { inputPath, outputPath } = req.body;
    await speedRamp(inputPath, outputPath);
    res.json({ ok: true, outputPath });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/mux", async (req, res) => {
  try {
    const { videoPath, audioPath, outputPath } = req.body;
    await muxVideoAudio(videoPath, audioPath, outputPath);
    res.json({ ok: true, outputPath });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
```

---

## 🧪 Teste automate

**test/video.test.js**
```js
import { cropAndScale } from "../src/services/videoService.js";
import fs from "fs";

describe("Video service", () => {
  it("crops and scales video", async () => {
    const input = "test/fixtures/sample.mp4";
    const output = "test/out/cropped.mp4";
    await cropAndScale(input, output);
    expect(fs.existsSync(output)).toBe(true);
  });
});
```

---

## 🔗 Conectare cu UI

- **Background tab** → `/video/crop-scale` după import
- **Voice-over tab** → TTS local (Modul 5)
- **Audio & SFX tab** → `/audio/mix` + `/audio/loudnorm`
- **Subtitles tab** → `/subs/burn-in` sau `/subs/soft`
- **Export tab** → `/video/mux` + preseturi

---

## ✅ Definition of Done – Modul 4
- Servicii FFmpeg implementate și testate local
- Endpoint-uri API pentru fiecare operație
- Teste unitare/integration cu fișiere de fixture
- UI poate trimite fișiere reale și primește output procesat

---

Dacă vrei, următorul pas este **Modul 5 – TTS local (Piper/Coqui)**, unde legăm generarea vocii în tab-ul „Voice-over” la un serviciu local rapid și gratuit.  
Continuăm cu Modul 5?
