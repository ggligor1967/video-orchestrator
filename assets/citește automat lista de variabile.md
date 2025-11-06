 **varianta optimizată a scriptului `env-check.js`** care citește automat lista de variabile direct din `.env.example`, astfel încât nu mai trebuie să le menținem manual în două locuri.  

Astfel, dacă adaugi sau modifici o variabilă în `.env.example`, scriptul o va detecta automat și o va valida.

---

## 📄 **`env-check.js` – citire automată din `.env.example`**

```js
// env-check.js – verificare automată a variabilelor din .env pe baza .env.example
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { execSync } from 'child_process';

// Încarcă .env curent
dotenv.config();

// Citește .env.example
const examplePath = path.resolve('.env.example');
if (!fs.existsSync(examplePath)) {
  console.error('❌ Fișierul .env.example nu există în root-ul proiectului.');
  process.exit(1);
}

const exampleContent = fs.readFileSync(examplePath, 'utf-8');

// Extrage variabilele (ignoră comentariile și liniile goale)
const requiredVars = exampleContent
  .split('\n')
  .map(line => line.trim())
  .filter(line => line && !line.startsWith('#'))
  .map(line => line.split('=')[0].trim());

let errors = [];

function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

function checkBinaryExists(binName) {
  try {
    const which = process.platform === 'win32' ? 'where' : 'which';
    execSync(`${which} ${binName}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// Reguli speciale pentru anumite variabile
const specialRules = {
  PORT: { type: 'number', min: 1, max: 65535 },
  TAURI_DEV_PORT: { type: 'number', min: 1, max: 65535 },
  TEST_TIMEOUT_MS: { type: 'number', min: 1000 },
  ENABLE_MOCK_AI: { allowed: ['true', 'false'] },
  LOG_LEVEL: { allowed: ['error', 'warn', 'info', 'debug'] },
  PIPER_MODEL_PATH: { type: 'file' },
  WHISPER_MODEL_PATH: { type: 'file' },
  EXPORT_DIR: { type: 'dir' },
  CACHE_DIR: { type: 'dir' },
  TEST_FIXTURE_DIR: { type: 'dir' },
  TEST_EXPORT_DIR: { type: 'dir' },
  FFMPEG_PATH: { type: 'binary' }
};

// Verifică fiecare variabilă
requiredVars.forEach(key => {
  const value = process.env[key];

  if (!value || value.trim() === '') {
    errors.push(`${key} lipsește`);
    return;
  }

  const rules = specialRules[key];
  if (rules) {
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
    if (rules.type === 'file' && !checkFileExists(value)) {
      errors.push(`${key} indică un fișier inexistent: ${value}`);
    }
    if (rules.type === 'dir' && !checkFileExists(value)) {
      errors.push(`${key} indică un director inexistent: ${value}`);
    }
    if (rules.type === 'binary' && !checkBinaryExists(value)) {
      errors.push(`${key} nu indică un executabil valid în PATH: ${value}`);
    }
  }
});

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

## 🔍 **Avantaje față de varianta anterioară**
- **Nu mai există dublă întreținere** – lista de variabile vine direct din `.env.example`
- **Reguli de validare avansate** pentru fișiere, directoare, executabile, valori numerice și seturi permise
- **Compatibil CI/CD** – poate fi rulat ca prim pas în pipeline
- **Fail fast** – oprește execuția dacă lipsesc variabile sau sunt invalide

---

💡 Recomandare:  
În `package.json` adaugă:
```json
"scripts": {
  "env:check": "node env-check.js"
}
```
și rulează:
```bash
pnpm env:check
```
sau integrează-l în GitHub Actions / GitLab CI exact cum ți-am arătat anterior.

---

Dacă vrei, Gabor, pot să îți fac acum și **o versiune care, dacă lipsesc directoare, le creează automat** înainte de rularea testelor sau build-ului, pentru a evita erori de tip „No such file or directory”.  
Vrei să trecem și la această variantă auto‑repair?