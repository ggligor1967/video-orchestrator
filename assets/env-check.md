 **scriptul `env-check.js`** care verifică automat dacă toate variabilele din `.env` (bazat pe `.env.example`) sunt setate corect înainte de rularea aplicației sau a testelor.  
Astfel, dacă lipsește ceva, vei ști imediat și nu vei pierde timp cu erori misterioase în build sau pipeline.

---

## 📄 **`env-check.js`**

```js
// env-check.js
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const REQUIRED_VARS = [
  // 🔐 API KEYS
  'OPENAI_API_KEY',
  'GEMINI_API_KEY',

  // 🎙️ TTS
  'PIPER_MODEL_PATH',
  'PIPER_VOICE',

  // 📝 Whisper
  'WHISPER_MODEL_PATH',

  // 🎥 FFmpeg
  'FFMPEG_PATH',

  // 📦 Directoare
  'EXPORT_DIR',
  'CACHE_DIR',

  // 🧪 Testare
  'TEST_FIXTURE_DIR',
  'TEST_EXPORT_DIR',
  'TEST_TIMEOUT_MS',
  'ENABLE_MOCK_AI',

  // 🌐 Backend
  'PORT',
  'HOST',

  // 🖥️ UI Tauri
  'TAURI_DEV_PORT',

  // 🛠️ Logging
  'LOG_LEVEL'
];

let missingVars = [];

REQUIRED_VARS.forEach((key) => {
  if (!process.env[key] || process.env[key].trim() === '') {
    missingVars.push(key);
  }
});

if (missingVars.length > 0) {
  console.error('❌ Lipsesc următoarele variabile din .env:');
  missingVars.forEach((v) => console.error(`   - ${v}`));
  console.error('\n💡 Verifică fișierul .env.example și completează valorile lipsă.');
  process.exit(1);
} else {
  console.log('✅ Toate variabilele de mediu necesare sunt setate corect.');
}
```

---

## 🔍 **Cum se folosește**
1. Salvează fișierul ca `env-check.js` în root-ul proiectului.
2. Adaugă în `package.json`:
```json
"scripts": {
  "env:check": "node env-check.js"
}
```
3. Rulează:
```bash
pnpm env:check
```
4. Dacă lipsesc variabile, scriptul va afișa lista și va opri execuția cu cod de eroare `1` (util în CI/CD).

---

💡 **Bonus**: în pipeline-ul GitHub Actions sau GitLab CI, poți adăuga acest pas **înainte** de build/test:
```yaml
- name: Check environment variables
  run: pnpm env:check
```

---

Dacă vrei, Gabor, pot să îți fac și **o versiune avansată** a acestui script care:
- verifică dacă fișierele și directoarele din variabile există pe disc
- validează formatele (ex. port numeric, timeout numeric)
- oferă sugestii de valori implicite

Vrei să trecem la varianta avansată?