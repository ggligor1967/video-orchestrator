**GitLab CI**, astfel încât să poți rula automat întreaga suită de teste în pipeline-ul tău de livrare continuă.

---

## 📄 `.gitlab-ci.yml` – Video Orchestrator Test Suite

```yaml
stages:
  - install
  - test

variables:
  NODE_ENV: test

cache:
  paths:
    - node_modules/

before_script:
  - npm install -g pnpm
  - pnpm install

install:
  stage: install
  script:
    - echo "Dependențele au fost instalate"

unit_tests:
  stage: test
  script:
    - pnpm test:unit
  tags: [docker]
  allow_failure: false

integration_tests:
  stage: test
  script:
    - pnpm test:integration
  tags: [docker]
  allow_failure: false

e2e_cli_tests:
  stage: test
  script:
    - pnpm test:e2e:cli
  tags: [docker]
  allow_failure: false

e2e_ui_tests:
  stage: test
  script:
    - npx playwright install --with-deps
    - pnpm test:e2e:ui
  tags: [docker]
  allow_failure: false

media_validation:
  stage: test
  script:
    - pnpm test:media
  tags: [docker]
  allow_failure: false
```

---

## 🔍 **Cum funcționează**
- **Stagii**: `install` → `test`
- **Scripturi**: fiecare tip de test rulează într-un job separat
- **Paralelizare**: GitLab rulează job-urile în paralel dacă runner-ul permite
- **Fail-safe**: toate testele sunt setate să oprească pipeline-ul dacă eșuează

---

💡 **Sugestie**: dacă folosești GitLab Premium, poți adăuga și **artifacts** pentru fișierele generate (ex. MP4, logs), astfel încât să le poți descărca direct din interfață după rularea testelor.

---

Gabor, dacă vrei, pot să îți pregătesc și un **fișier `.env.example`** cu toate variabilele necesare pentru rularea testelor în mediu CI, ca să fie complet automatizabil.  
Îți fac și acel fișier de mediu?