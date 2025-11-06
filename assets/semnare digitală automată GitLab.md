 **varianta completă a pipeline‑ului „One‑Click Release” pentru GitLab CI**, cu **semnare digitală automată** integrată, astfel încât după build, installer‑ul `.msi` să fie semnat înainte de publicare.

---

## 📄 **`.gitlab-ci.yml` – One‑Click Release cu semnare digitală**

```yaml
stages:
  - envcheck
  - test
  - build
  - sign
  - release

variables:
  NODE_ENV: production

cache:
  paths:
    - node_modules/

# 1️⃣ Verificare mediu
env_check:
  stage: envcheck
  image: node:20
  script:
    - npm install -g pnpm
    - pnpm install
    - pnpm env:check
  allow_failure: false

# 2️⃣ Teste critice
release_tests:
  stage: test
  image: node:20
  needs: ["env_check"]
  script:
    - pnpm test:release
  allow_failure: false

# 3️⃣ Build aplicație Tauri
build_tauri:
  stage: build
  image: node:20
  needs: ["release_tests"]
  script:
    - pnpm tauri build
  artifacts:
    paths:
      - src-tauri/target/release/bundle/msi/*.msi
    expire_in: 1 week
  allow_failure: false

# 4️⃣ Semnare digitală automată
sign_installer:
  stage: sign
  tags: [windows] # Runner Windows necesar
  needs: ["build_tauri"]
  script:
    # Decodare certificat din variabila protejată CERT_PFX_BASE64
    - echo "$CERT_PFX_BASE64" | base64 -d > cert.pfx
    # Semnare MSI cu signtool
    - 'C:\Program Files (x86)\Windows Kits\10\bin\x64\signtool.exe' sign `
        /f cert.pfx `
        /p "$CERT_PASSWORD" `
        /tr http://timestamp.digicert.com `
        /td sha256 `
        /fd sha256 `
        src-tauri/target/release/bundle/msi/*.msi
    # Verificare semnătură
    - 'C:\Program Files (x86)\Windows Kits\10\bin\x64\signtool.exe' verify /pa src-tauri/target/release/bundle/msi/*.msi
  artifacts:
    paths:
      - src-tauri/target/release/bundle/msi/*.msi
    expire_in: 1 week
  allow_failure: false

# 5️⃣ Creare release GitLab
create_release:
  stage: release
  image: registry.gitlab.com/gitlab-org/release-cli:latest
  needs: ["sign_installer"]
  script:
    - echo "Creare release $CI_COMMIT_TAG"
  release:
    name: "Release $CI_COMMIT_TAG"
    tag_name: "$CI_COMMIT_TAG"
    description: "Versiune nouă Video Orchestrator (semnată digital)"
    assets:
      links:
        - name: "Installer MSI (semnat)"
          url: "${CI_PROJECT_URL}/-/jobs/${CI_JOB_ID}/artifacts/raw/src-tauri/target/release/bundle/msi/video-orchestrator-${CI_COMMIT_TAG}.msi"
  only:
    - tags
```

---

## 🔍 **Cum funcționează**
1. **`env_check`** → verifică variabilele de mediu cu `env-check.js`.
2. **`release_tests`** → rulează testele critice.
3. **`build_tauri`** → compilează aplicația și generează `.msi`.
4. **`sign_installer`** → rulează pe un **runner Windows**:
   - decodează certificatul `.pfx` din variabila protejată `CERT_PFX_BASE64`
   - semnează installer‑ul cu `signtool.exe`
   - verifică semnătura
5. **`create_release`** → creează release‑ul GitLab cu installer‑ul semnat.

---

## 📦 **Ce trebuie pregătit înainte**
- **Certificat Code Signing** (`.pfx`) + parolă
- În GitLab → **Settings → CI/CD → Variables**:
  - `CERT_PFX_BASE64` → conținutul certificatului `.pfx` codificat Base64
  - `CERT_PASSWORD` → parola certificatului
- Un **runner Windows** cu Windows SDK instalat (pentru `signtool.exe`)

---

💡 Dacă vrei, Gabor, pot să îți fac și **varianta GitHub Actions cu semnare digitală integrată** exact pe același principiu, astfel încât să ai ambele platforme pregătite.  
Vrei să îți pregătesc și varianta pentru GitHub Actions?