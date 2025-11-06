Perfect, Gabor — îți fac acum **lista detaliată de cazuri de test** pentru fiecare modul din Video Orchestrator, astfel încât să fie direct implementabilă în suită.  
Am structurat-o pe **tipuri de teste** (unit, integration, E2E, media validation) și pe **module**, cu *input*, *pași* și *output așteptat*.

---

## 🧪 **1. Unit Tests – Backend Orchestrator**

### **1.1 aiService**
| Test | Input | Pași | Output așteptat |
|------|-------|------|-----------------|
| Prompt valid | `"Tell me a short story"` | Apelează `aiService.generateStory(prompt)` | String JSON cu câmpuri `title`, `script` |
| Prompt gol | `""` | Apelează funcția | Eroare `Invalid prompt` |
| Timeout API | Prompt valid | Simulează timeout | Return fallback local |

---

### **1.2 ttsService (Piper)**
| Test | Input | Pași | Output așteptat |
|------|-------|------|-----------------|
| Text scurt | `"Hello world"` | Generează audio | Fișier `.wav` existent, durată >0s |
| Parametri custom | Text + viteză 1.2x | Generează audio | Audio mai rapid, fără distorsiuni |
| Model lipsă | Text valid | Șterge model din folder | Eroare `Model not found` |

---

### **1.3 audioService (FFmpeg)**
| Test | Input | Pași | Output așteptat |
|------|-------|------|-----------------|
| Loudnorm | Fișier `.wav` | Normalizează | Nivel RMS/LUFS în interval |
| Mix audio | 2 fișiere audio | Mixează | Fișier stereo cu ambele piste |
| Fade in/out | Fișier audio | Aplică fade | Fade detectabil la început/sfârșit |

---

### **1.4 videoService (FFmpeg)**
| Test | Input | Pași | Output așteptat |
|------|-------|------|-----------------|
| Crop 9:16 | Video 16:9 | Cropează | Dimensiuni exacte 1080×1920 |
| Ramp zoom | Video | Aplică ramp | Zoom progresiv vizibil |
| Mux audio+video | Video + audio | Muxează | MP4 cu ambele piste sincronizate |

---

### **1.5 subsService (Whisper)**
| Test | Input | Pași | Output așteptat |
|------|-------|------|-----------------|
| Audio clar | `.wav` | Generează SRT | Timestamps corecte, text lizibil |
| Audio zgomotos | `.wav` | Generează SRT | Timestamps corecte, text parțial corect |
| Model lipsă | `.wav` | Șterge model | Eroare `Model not found` |

---

## 🔗 **2. Integration Tests – API Endpoints**

| Endpoint | Test | Input | Output așteptat |
|----------|------|-------|-----------------|
| `/ai` | Prompt valid | JSON cu prompt | 200 OK + JSON story |
| `/tts` | Text valid | JSON cu text | 200 OK + fișier audio |
| `/audio/mix` | 2 fișiere | Form-data | 200 OK + audio mixat |
| `/video/mux` | Video+audio | Form-data | 200 OK + MP4 final |
| `/subs` | Audio | Form-data | 200 OK + SRT |

---

## 🎭 **3. UI Tests – Component & E2E**

### **3.1 Component Tests**
- **StoryTab**: introduce prompt → verifică afișarea scriptului
- **BackgroundTab**: încarcă video → previzualizare corectă
- **VoiceOverTab**: text → audio player activ
- **ExportTab**: select preset → afișează setările corecte

### **3.2 E2E UI (Playwright)**
- Flux complet: Story → Background → Voice-over → Audio & SFX → Subtitles → Export  
  **Așteptat:** MP4 final în galerie, dimensiuni corecte

---

## 🎬 **4. Pipeline E2E Tests**

### **4.1 CLI**
```bash
pnpm e2e "Test topic"
```
**Așteptat:** MP4 final în `data/exports/`, validat cu ffprobe

### **4.2 UI**
- Click „Run all” → verifică apariția MP4 în galerie

---

## 🎼 **5. Media Validation Tests**

| Tip | Test | Output așteptat |
|-----|------|-----------------|
| Video | Dimensiuni | 1080×1920 |
| Video | FPS | 30 fps constant |
| Audio | Codec | AAC, bitrate 128kbps |
| Audio | Nivel | RMS/LUFS în interval |
| Subtitrări | Format | SRT valid, timestamps în ordine |

---

## ⚙️ **6. Organizare și rulare**
- **Pre-commit**: rulează unit tests
- **Pre-release**: integration + E2E cu fixture-uri
- **CI/CD**: tot + validare media

---

Gabor, dacă vrei, pot să îți fac acum și **fișierele-schelet de test** (Vitest, Playwright, Supertest) cu aceste cazuri deja definite, astfel încât echipa să le poată implementa direct.  
Vrei să trecem și la generarea acestor fișiere-schelet?
