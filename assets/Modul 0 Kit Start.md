 **Kit-ul de Start pentru Modul 0** astfel încât să poți pune pe picioare rapid scheletul aplicației noastre **Orchestrator Local + API AI**.  
Acest modul este fundația pe care vom construi totul: structura de fișiere, monorepo, configurări de bază, comenzi de rulare și testare.

---

## 🎯 Obiectiv Modul 0
- Crearea unui **monorepo** cu două aplicații:
  - **UI** (Tauri + Svelte/React minimal)
  - **Backend Orchestrator** (Node.js + Express)
- Configurare **pnpm workspaces**
- Setare **linting, formatare, hooks**
- **Healthcheck** funcțional pe backend
- Comenzi de dezvoltare și testare

---

## 📂 Structura de directoare

```
project-root/
│
├── apps/
│   ├── ui/                  # Aplicația desktop (Tauri + Svelte)
│   └── orchestrator/        # Backend local (Node.js + Express)
│
├── packages/
│   └── shared/              # Tipuri și utilitare comune
│
├── scripts/                 # Scripturi CLI auxiliare
│
├── pnpm-workspace.yaml
├── package.json
├── .editorconfig
├── .gitignore
├── README.md
└── .env.example
```

---

## 📜 Conținut fișiere cheie

### **pnpm-workspace.yaml**
```yaml
packages:
  - "apps/*"
  - "packages/*"
  - "scripts"
```

### **package.json** (root)
```json
{
  "name": "video-orchestrator",
  "private": true,
  "version": "0.0.1",
  "workspaces": [
    "apps/*",
    "packages/*",
    "scripts"
  ],
  "scripts": {
    "dev": "concurrently -k \"pnpm --filter @app/orchestrator dev\" \"pnpm --filter @app/ui dev\"",
    "build": "pnpm -r build",
    "test": "pnpm -r test",
    "lint": "pnpm -r lint",
    "format": "pnpm -r format"
  },
  "devDependencies": {
    "concurrently": "^8.2.0",
    "eslint": "^8.57.0",
    "prettier": "^3.2.5",
    "husky": "^9.0.11",
    "lint-staged": "^15.2.0"
  }
}
```

### **.editorconfig**
```
root = true

[*]
charset = utf-8
indent_style = space
indent_size = 2
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
```

### **.gitignore**
```
node_modules
dist
build
.env
.env.local
.DS_Store
```

### **.env.example**
```
OPENAI_API_KEY=your_api_key_here
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini
```

---

## ⚙️ Backend Orchestrator – setup minim

**apps/orchestrator/package.json**
```json
{
  "name": "@app/orchestrator",
  "version": "0.0.1",
  "main": "src/index.js",
  "scripts": {
    "dev": "nodemon src/index.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.19.2",
    "dotenv": "^16.4.5"
  },
  "devDependencies": {
    "nodemon": "^3.1.0",
    "jest": "^29.7.0",
    "supertest": "^6.3.4"
  }
}
```

**apps/orchestrator/src/index.js**
```js
import express from "express";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4545;

app.get("/health", (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Orchestrator running on http://localhost:${PORT}`);
});
```

**apps/orchestrator/test/health.test.js**
```js
import request from "supertest";
import app from "../src/index.js";

describe("Healthcheck", () => {
  it("should return ok:true", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});
```

---

## 🖥️ UI – setup minim Tauri + Svelte

**apps/ui/package.json**
```json
{
  "name": "@app/ui",
  "version": "0.0.1",
  "scripts": {
    "dev": "tauri dev",
    "build": "tauri build",
    "test": "vitest"
  },
  "devDependencies": {
    "@tauri-apps/cli": "^1.5.0",
    "svelte": "^4.2.0",
    "vite": "^5.0.0",
    "vitest": "^1.2.0"
  }
}
```

**apps/ui/src/App.svelte**
```svelte
<script>
  let health = "Checking...";
  fetch("http://127.0.0.1:4545/health")
    .then(r => r.json())
    .then(d => health = d.ok ? "Backend OK" : "Backend Error")
    .catch(() => health = "Backend Unreachable");
</script>

<main>
  <h1>Video Orchestrator</h1>
  <p>{health}</p>
</main>
```

---

## 🧪 Testare rapidă Modul 0

1. **Instalare dependențe**
```bash
pnpm install
```

2. **Pornire backend**
```bash
pnpm --filter @app/orchestrator dev
```

3. **Pornire UI**
```bash
pnpm --filter @app/ui dev
```

4. **Verificare healthcheck**
- Deschide UI → vezi mesajul „Backend OK”
- Sau direct în browser: `http://127.0.0.1:4545/health`

---

## ✅ Definition of Done Modul 0
- Monorepo funcțional cu pnpm workspaces
- Backend rulează și răspunde la `/health`
- UI pornește și afișează status backend
- Comenzile `pnpm dev`, `pnpm build`, `pnpm test` funcționează
- Linting și formatare configurate

---

Gabor, dacă vrei, următorul pas este să îți pregătesc **Modul 1** cu UI complet (tabs, layout, previzualizare media) astfel încât să putem începe integrarea fluxului real.  
Vrei să trecem direct la **Modul 1 – UI complet**?
