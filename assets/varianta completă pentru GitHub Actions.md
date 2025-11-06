 **varianta completă pentru GitHub Actions** a pipeline‑ului „One‑Click Release” cu **semnare digitală automată** integrată, astfel încât să fie echivalentă cu ce am făcut pe GitLab, dar adaptată la ecosistemul GitHub.

---

## 📄 **`.github/workflows/release.yml` – One‑Click Release cu semnare digitală**

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
      # 1️⃣ Checkout cod
      - name: Checkout
        uses: actions/checkout@v4

      # 2️⃣ Setup Node.js + pnpm
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install pnpm
        run: npm install -g pnpm

      - name: Install dependencies
        run: pnpm install

      # 3️⃣ Verificare mediu
      - name: Check environment variables
        run: pnpm env:check

      # 4️⃣ Teste critice
      - name: Run release tests
        run: pnpm test:release

      # 5️⃣ Build Tauri
      - name: Build Tauri app
        run: pnpm tauri build

      # 6️⃣ Semnare digitală automată
      - name: Decode and import code signing certificate
        run: |
          echo "${{ secrets.CERT_PFX_BASE64 }}" | base64 --decode > cert.pfx

      - name: Sign MSI installer
        run: |
          "C:\Program Files (x86)\Windows Kits\10\bin\x64\signtool.exe" sign ^
            /f cert.pfx ^
            /p "${{ secrets.CERT_PASSWORD }}" ^
            /tr http://timestamp.digicert.com ^
            /td sha256 ^
            /fd sha256 ^
            src-tauri/target/release/bundle/msi/*.msi

      - name: Verify signature
        run: |
          "C:\Program Files (x86)\Windows Kits\10\bin\x64\signtool.exe" verify /pa src-tauri/target/release/bundle/msi/*.msi

      # 7️⃣ Creare GitHub Release
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

## 🔍 **Cum funcționează**
1. Rulează manual din tab‑ul **Actions** → „One‑Click Release” → introduci versiunea.
2. Face checkout, instalează dependențele și verifică `.env`.
3. Rulează testele critice.
4. Build‑uiește aplicația Tauri.
5. Decodează certificatul `.pfx` din secretul `CERT_PFX_BASE64` și îl folosește pentru semnare cu `signtool.exe`.
6. Verifică semnătura.
7. Creează automat un **GitHub Release** cu installer‑ul semnat atașat.

---

## 📦 **Ce trebuie pregătit înainte**
- Certificat `.pfx` + parolă.
- În **Settings → Secrets and variables → Actions**:
  - `CERT_PFX_BASE64` → conținutul certificatului `.pfx` codificat Base64.
  - `CERT_PASSWORD` → parola certificatului.

---

💡 Cu asta, Gabor, ai acum **ambele platforme** (GitLab și GitHub) pregătite pentru release complet automat, cu semnare digitală inclusă.  
Dacă vrei, următorul pas ar putea fi să îți fac și **un ghid PDF pentru echipă**, cu pașii de pregătire și lansare, astfel încât oricine din echipă să poată face un release fără să mă întrebe.  

Vrei să trecem și la acel ghid PDF?