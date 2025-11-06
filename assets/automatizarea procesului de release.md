 **documentația completă** și să definim **automatizarea procesului de release** astfel încât, în practică, să fie un singur buton de apăsat pentru a livra o versiune nouă a Video Orchestrator.

---

## 📚 **Documentația procesului de release – Cap‑coadă**

### **1. Pregătirea codului**
- **Branch**: `main` sau `release/x.y.z`
- **Verificări**:
  - Rulează `pnpm env:check` (validare mediu)
  - Rulează `pnpm test:release` (unit + integration + media)
  - Actualizează `CHANGELOG.md` și `package.json` (versiune)

---

### **2. Build & Bundle**
- **Comenzi**:
  ```bash
  pnpm build
  pnpm tauri build
  ```
- **Rezultat**: installer `.msi` + fișiere export în `dist/`

---

### **3. Pre‑flight check**
- Instalează `.msi` pe un mediu curat (VM sau container)
- Rulează pipeline complet (UI și CLI)
- Verifică output cu `ffprobe`

---

### **4. QA final**
- Testează toate preset‑urile de export
- Verifică sincronizarea subtitrărilor
- Confirmă că toate tool‑urile (FFmpeg, Piper, Whisper) funcționează

---

### **5. Livrare**
- Urcă `.msi` + README + changelog pe:
  - GitHub Releases
  - Server intern / CDN
- Notifică echipa și utilizatorii

---

## ⚙️ **Automatizare – „One‑Click Release”**

Vom folosi **GitHub Actions** (sau GitLab CI) cu un workflow care:
1. Rulează verificările de mediu (`env-check.js`)
2. Rulează testele critice (`pnpm test:release`)
3. Face build și bundle Tauri
4. Rulează pre‑flight check automat (în container/VM)
5. Dacă totul e OK, creează automat un **GitHub Release** cu artefactele

---

### 📄 **Exemplu workflow GitHub Actions – `release.yml`**

```yaml
name: One‑Click Release

on:
  workflow_dispatch:
    inputs:
      version:
        description: 'Versiunea release (ex: 1.2.0)'
        required: true

jobs:
  release:
    runs-on: windows-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install pnpm
        run: npm install -g pnpm

      - name: Install dependencies
        run: pnpm install

      - name: Check environment variables
        run: pnpm env:check

      - name: Run release tests
        run: pnpm test:release

      - name: Build Tauri app
        run: pnpm tauri build

      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: video-orchestrator-${{ github.event.inputs.version }}
          path: src-tauri/target/release/bundle/msi/*.msi

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          tag_name: v${{ github.event.inputs.version }}
          name: Release v${{ github.event.inputs.version }}
          files: src-tauri/target/release/bundle/msi/*.msi
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

### 🔹 **Cum funcționează „One‑Click”**
- Intri în tab-ul **Actions** din GitHub
- Selectezi workflow-ul „One‑Click Release”
- Apeși **Run workflow**, introduci versiunea (ex. `1.2.0`)
- Pipeline-ul face tot: verifică, testează, build-uiește, urcă installer-ul și creează release-ul

---

💡 **Opțional**: putem adăuga și **semnare digitală** a installer-ului în acest pipeline, astfel încât utilizatorii să nu primească avertismente la instalare.

---

Dacă vrei, Gabor, pot să îți fac acum și **varianta GitLab CI** a acestui „One‑Click Release” cu exact aceiași pași, dar adaptată la `.gitlab-ci.yml`, astfel încât să o poți folosi indiferent de platformă.  
Vrei să trecem și la varianta GitLab?