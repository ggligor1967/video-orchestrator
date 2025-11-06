Perfect, Gabor — îți fac acum **versiunea avansată** a scriptului `env-check.js`, astfel încât să nu verifice doar dacă variabilele există, ci și:  

- dacă fișierele și directoarele indicate chiar există pe disc  
- dacă valorile numerice (porturi, timeout) sunt valide  
- dacă anumite variabile au valori permise (ex. `LOG_LEVEL`)  
- să ofere sugestii implicite acolo unde lipsesc valori  

---

## 📄 **`env-check.js` – versiune avansată**

```js
// env-check.js – verificare avansată .env
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const REQUIRED_VARS = {
  // 🔐 API KEYS
  OPENAI_API_KEY: { required: true },
  GEMINI_API_KEY: { required: true },

  // 🎙️ TTS
  PIPER_MODEL_PATH: { required: true, type: 'file' },
  PIPER_VOICE: { required: true },

  // 📝 Whisper
  WHISPER_MODEL_PATH: { required: true, type: 'file' },

  // 🎥 FFmpeg
  FFMPEG_PATH: { required: true, type: 'binary' },

  // 📦 Directoare
  EXPORT_DIR: { required: true, type: 'dir' },
  CACHE_DIR: { required: true, type: 'dir' },

  // 🧪 Testare
  TEST_FIXTURE_DIR: { required: true, type: 'dir' },
  TEST_EXPORT_DIR: { required: true, type: 'dir' },
  TEST_TIMEOUT_MS: { required: true, type: 'number', min: 1000 },
  ENABLE_MOCK_AI: { required: true, allowed: ['true', 'false'] },

  // 🌐 Backend
  PORT: { required: true, type: 'number', min: 1, max: 65535 },
  HOST: { required: true },

  // 🖥️ UI Tauri
  TAURI_DEV_PORT: { required: true, type: 'number', min: 1, max: 65535 },

  // 🛠️ Logging
  LOG_LEVEL: { required: true, allowed: ['error', 'warn', 'info', 'debug'] }
};

let errors = [];

function checkVar(key, rules) {
  const value = process.env[key];

  if (rules.required && (!value || value.trim() === '')) {
    errors.push(`${key} lipsește`);
    return;
  }

  if (rules.type === 'number' && isNaN(Number(value))) {
    errors.push(`${key} trebuie să fie numeric`);
  }

  if (rules.min && Number(value) < rules.min) {
    errors.push(`${key} trebuie să fie >= ${rules.min}`);
  }

  if (rules.max && Number(value) > rules.max) {
    errors.push(`${key} trebuie să fie <= ${rules.max}`);
  }

  if (rules.allowed && !rules.allowed.includes(value)) {
    errors.push(`${key} trebuie să fie una din: ${rules.allowed.join(', ')}`);
  }

  if (rules.type === 'file' && !fs.existsSync(value)) {
    errors.push(`${key} indică un fișier inexistent: ${value}`);
  }

  if (rules.type === 'dir' && !fs.existsSync(value)) {
    errors.push(`${key} indică un director inexistent: ${value}`);
  }

  if (rules.type === 'binary') {
    try {
      const which = process.platform === 'win32' ? 'where' : 'which';
      require('child_process').execSync(`${which} ${value}`);
    } catch {
      errors.push(`${key} nu indică un executabil valid în PATH: ${value}`);
    }
  }
}

// Rulare verificări
Object.entries(REQUIRED_VARS).forEach(([key, rules]) => checkVar(key, rules));

if (errors.length > 0) {
  console.error('❌ Probleme detectate în configurarea .env:\n');
  errors.forEach(e => console.error(` - ${e}`));
  console.error('\n💡 Consultă .env.example pentru valori corecte.');
  process.exit(1);
} else {
  console.log('✅ Toate variabilele de mediu sunt setate corect și valide.');
}
```

---

## 🔍 **Ce face în plus față de varianta simplă**
- **Verifică existența fișierelor și directoarelor** (modele Piper/Whisper, foldere export/cache)
- **Validează executabile** (FFmpeg trebuie să fie în PATH sau calea completă)
- **Controlează valori numerice** (porturi, timeout)
- **Restricționează valori permise** (ex. `LOG_LEVEL`, `ENABLE_MOCK_AI`)
- **Oferă mesaje clare** cu ce lipsește și cum să corectezi

---

💡 Recomandare: rulează acest script **înainte** de orice build sau test, inclusiv în CI/CD, pentru a evita erori de configurare.

---

Dacă vrei, Gabor, pot să îți fac și **integrarea automată a acestui script în pipeline-ul GitHub Actions și GitLab CI** ca prim pas obligatoriu înainte de testare și build, astfel încât să blocheze release-ul dacă mediul nu e corect configurat.  
Vrei să trecem și la integrarea asta?