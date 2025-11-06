 **fișier YAML de pipeline CI/CD** (exemplu pentru **GitHub Actions**) care rulează automat toată suita de teste pe care am definit-o, la fiecare commit sau înainte de un release.  
Îl poți adapta ușor și pentru GitLab CI, Azure DevOps sau alte platforme.

---

## 📄 `.github/workflows/tests.yml`

```yaml
name: Video Orchestrator – Test Suite

on:
  push:
    branches: [ main, release/* ]
  pull_request:
    branches: [ main ]
  workflow_dispatch: # rulare manuală

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      # 1️⃣ Checkout cod
      - name: Checkout repository
        uses: actions/checkout@v4

      # 2️⃣ Instalare Node + pnpm
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install pnpm
        run: npm install -g pnpm

      # 3️⃣ Instalare dependențe
      - name: Install dependencies
        run: pnpm install

      # 4️⃣ Teste unitare
      - name: Run unit tests
        run: pnpm test:unit

      # 5️⃣ Teste integrare API
      - name: Run integration tests
        run: pnpm test:integration

      # 6️⃣ Teste E2E CLI
      - name: Run E2E CLI tests
        run: pnpm test:e2e:cli

      # 7️⃣ Teste E2E UI (headless)
      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run E2E UI tests
        run: pnpm test:e2e:ui

      # 8️⃣ Validare media
      - name: Run media validation tests
        run: pnpm test:media
```

---

## 🔍 **Cum funcționează**
- **Trigger**: rulează la fiecare push pe `main` sau branch de tip `release/*`, la pull request sau manual.
- **Mediu**: folosește `ubuntu-latest` pentru viteză și cost redus.
- **Pași**:
  1. Face checkout la cod
  2. Instalează Node.js și pnpm
  3. Instalează dependențele
  4. Rulează pe rând toate tipurile de teste (unit, integration, E2E CLI, E2E UI, media validation)

---

💡 **Sugestie**:  
Dacă vrei să optimizezi timpul de rulare, putem împărți testele în **job-uri paralele** (unit + integration într-un job, E2E + media în altul), astfel încât pipeline-ul să fie mai rapid.

---

Vrei să îți fac și **varianta GitLab CI** a acestui pipeline, ca să o ai pregătită în caz că vei folosi GitLab în loc de GitHub?