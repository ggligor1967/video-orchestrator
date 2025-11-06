**varianta GitLab CI** pentru „One‑Click Release”, astfel încât să poți lansa o versiune nouă a Video Orchestrator direct din pipeline, cu un singur click.

---

## 📄 **`.gitlab-ci.yml` – One‑Click Release**

```yaml
stages:
  - envcheck
  - test
  - build
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

# 2️⃣ Teste critice înainte de release
release_tests:
  stage: test
  image: node:20
  script:
    - pnpm test:release
  allow_failure: false

# 3️⃣ Build aplicație Tauri
build_tauri:
  stage: build
  image: node:20
  script:
    - pnpm tauri build
  artifacts:
    paths:
      - src-tauri/target/release/bundle/msi/*.msi
    expire_in: 1 week
  allow_failure: false

# 4️⃣ Creare release GitLab cu artefacte
create_release:
  stage: release
  image: registry.gitlab.com/gitlab-org/release-cli:latest
  script:
    - echo "Creare release v$CI_COMMIT_TAG"
  release:
    name: "Release $CI_COMMIT_TAG"
    tag_name: "$CI_COMMIT_TAG"
    description: "Versiune nouă Video Orchestrator"
    assets:
      links:
        - name: "Installer MSI"
          url: "${CI_PROJECT_URL}/-/jobs/${CI_JOB_ID}/artifacts/raw/src-tauri/target/release/bundle/msi/video-orchestrator-${CI_COMMIT_TAG}.msi"
  only:
    - tags
```

---

## 🔍 **Cum funcționează**
1. **`env_check`** – rulează `env-check.js` și oprește pipeline-ul dacă lipsesc variabile sau fișiere critice.
2. **`release_tests`** – rulează testele critice (`pnpm test:release`).
3. **`build_tauri`** – compilează aplicația și generează installer `.msi`.
4. **`create_release`** – creează automat un **GitLab Release** cu artefactul `.msi` atașat.

---

## 🚀 **Flux „One‑Click” în GitLab**
- Creezi un **tag** nou (ex. `v1.2.0`) în repo:
  ```bash
  git tag v1.2.0
  git push origin v1.2.0
  ```
- GitLab CI pornește automat pipeline-ul:
  1. Verifică mediul
  2. Rulează testele
  3. Face build
  4. Publică release-ul cu installer-ul

---

💡 Dacă vrei, pot să îți fac și **o variantă cu job-uri paralele** pentru testare și build, astfel încât release-ul să fie mai rapid.  
Vrei să optimizăm acum pipeline-ul pentru viteză maximă?