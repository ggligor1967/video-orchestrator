**Checklist-ul „Ready for Release”** și **Ghidul de livrare installer Windows (Tauri bundle)** cu un **preflight check** pentru FFmpeg, Piper și Whisper, astfel încât să poți livra orchestratorul ca aplicație desktop complet funcțională, gata de instalat pe orice PC cu Windows 11.

---

# 📦 **Checklist „Ready for Release”**

## 1️⃣ Cod și structură
- [ ] **Toate modulele 0–9** implementate și testate local
- [ ] **UI**: toate tab-urile funcționale, fără mock-uri rămase
- [ ] **Backend**: toate endpoint-urile returnează date reale
- [ ] **Pipeline API** funcțional (input minim → MP4 final)
- [ ] **Servire statică** activă pentru previzualizare media în UI
- [ ] **Cache** activ pentru AI/TTS/Video

## 2️⃣ Testare
- [ ] **Unit tests** trec (pnpm test)
- [ ] **Integration tests** trec (pnpm test)
- [ ] **E2E pipeline test** trece (ffprobe validează MP4)
- [ ] Test manual UI: flux complet de la prompt → export
- [ ] Test CLI: `pnpm e2e "topic"`

## 3️⃣ Asset-uri și tool-uri
- [ ] **FFmpeg** instalat și în PATH
- [ ] **Piper** + model `.onnx` în `tools/piper/models/`
- [ ] **Whisper.cpp** + model `.bin` în `tools/whisper/models/`
- [ ] **OBS** configurat pentru captură fundal (opțional)
- [ ] **Godot voxel runner** exportat și funcțional (opțional)

## 4️⃣ Configurație
- [ ] `.env` completat cu chei API AI
- [ ] Preseturi export validate (TikTok/Shorts/Reels)
- [ ] Setări UI: auto-continue, overlay-uri implicite
- [ ] Structură `data/` curată (assets, cache, exports)

## 5️⃣ UX și detalii finale
- [ ] Icon aplicație setat în Tauri
- [ ] Titlu și versiune corecte în `tauri.conf.json`
- [ ] Mesaje de eroare clare în UI
- [ ] Tooltips pentru parametri avansați
- [ ] Documentație utilizator inclusă

---

# 🖥 **Ghid livrare installer Windows (Tauri)**

## 1️⃣ Build Tauri
În `apps/ui`:
```bash
pnpm build
pnpm tauri build
```
- Output: `src-tauri/target/release/bundle/msi/Video Orchestrator_0.1.0_x64_en-US.msi`
- Include backend-ul în același pachet (Tauri permite includerea binarelor și folderelor necesare)

## 2️⃣ Includere tool-uri locale
În `tauri.conf.json`:
```json
"bundle": {
  "resources": [
    "../apps/orchestrator",
    "../data",
    "../tools/ffmpeg/**",
    "../tools/piper/**",
    "../tools/whisper/**"
  ]
}
```
- Asigură-te că binarele Piper, Whisper și eventual FFmpeg sunt incluse în `tools/` și referite relativ

## 3️⃣ Preflight check la pornire
În `apps/ui/src/lib/preflight.ts`:
```ts
export async function preflightCheck(): Promise<{ok: boolean; errors: string[]}> {
  const errors: string[] = [];
  const checks = [
    { name: "FFmpeg", cmd: "ffmpeg -version" },
    { name: "Piper", cmd: "tools/piper/piper.exe --help" },
    { name: "Whisper", cmd: "tools/whisper/main.exe --help" }
  ];
  for (const c of checks) {
    try {
      const res = await fetch(`http://127.0.0.1:4545/system/check`, { method: "POST", body: JSON.stringify({ cmd: c.cmd }) });
      const json = await res.json();
      if (!json.ok) errors.push(`${c.name} missing or not working`);
    } catch {
      errors.push(`${c.name} check failed`);
    }
  }
  return { ok: errors.length === 0, errors };
}
```

În backend (`/system/check`):
```js
import { exec } from "child_process";
router.post("/check", (req, res) => {
  const { cmd } = req.body;
  exec(cmd, (err) => {
    if (err) return res.json({ ok: false });
    res.json({ ok: true });
  });
});
```

UI: la pornire, rulează `preflightCheck()` și afișează un dialog dacă lipsesc componente.

## 4️⃣ Documentație utilizator
Include în installer:
- **README.pdf** cu:
  - Cerințe minime (Windows 11, CPU x64, 8GB RAM)
  - Instalare și primii pași
  - Cum să adaugi fundaluri și muzică
  - Cum să folosești pipeline-ul
  - Cum să postezi pe TikTok

---

## 🚀 Rezultat final
După acest pas:
- Ai un **installer MSI** care instalează UI + backend + tool-uri locale
- La prima pornire, aplicația verifică dacă totul e pregătit
- Utilizatorul poate produce clipuri end-to-end fără configurări suplimentare

---

Gabor, dacă vrei, pot să îți fac acum și **un flux grafic „Release Pipeline”** care arată cum treci de la cod sursă → build → installer → test final → livrare către utilizatori.  
Îl facem?
