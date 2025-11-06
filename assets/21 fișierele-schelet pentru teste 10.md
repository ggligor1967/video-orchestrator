Perfect, Gabor — îți fac acum **fișierele-schelet** pentru testele din suită, astfel încât echipa să le poată implementa direct.  
Le voi structura pe **Vitest** (unit), **Supertest** (integration API) și **Playwright** (E2E UI), cu locuri clare unde să adaugi logica efectivă.

---

## 📂 Structură propusă

```
tests/
  unit/
    aiService.test.js
    ttsService.test.js
    audioService.test.js
    videoService.test.js
    subsService.test.js
  integration/
    api.test.js
  e2e/
    pipeline-cli.test.js
    pipeline-ui.spec.js
  media-validation/
    mediaValidation.test.js
```

---

## 🧪 **1. Unit Test – aiService (Vitest)**

```js
// tests/unit/aiService.test.js
import { describe, it, expect } from 'vitest';
import { generateStory } from '../../apps/orchestrator/services/aiService.js';

describe('aiService', () => {
  it('should return a story object for valid prompt', async () => {
    const result = await generateStory('Tell me a short story');
    expect(result).toHaveProperty('title');
    expect(result).toHaveProperty('script');
  });

  it('should throw error for empty prompt', async () => {
    await expect(generateStory('')).rejects.toThrow();
  });
});
```

---

## 🔗 **2. Integration Test – API Endpoints (Supertest)**

```js
// tests/integration/api.test.js
import request from 'supertest';
import app from '../../apps/orchestrator/index.js';

describe('API Endpoints', () => {
  it('POST /ai should return story JSON', async () => {
    const res = await request(app)
      .post('/ai')
      .send({ prompt: 'Test prompt' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('title');
  });

  it('POST /tts should return audio file', async () => {
    const res = await request(app)
      .post('/tts')
      .send({ text: 'Hello world' });
    expect(res.status).toBe(200);
    // verifică tipul de conținut
    expect(res.headers['content-type']).toMatch(/audio/);
  });
});
```

---

## 🎭 **3. E2E UI Test – Playwright**

```js
// tests/e2e/pipeline-ui.spec.js
import { test, expect } from '@playwright/test';

test('UI pipeline end-to-end', async ({ page }) => {
  await page.goto('http://localhost:1420'); // port Tauri dev
  await page.fill('#story-input', 'Night shift at an empty hospital');
  await page.click('#generate-story');
  await page.click('#next-tab');
  // ... continuă pașii până la export
  await page.click('#export-video');
  const fileExists = await page.locator('#export-success').isVisible();
  expect(fileExists).toBeTruthy();
});
```

---

## 🎬 **4. E2E CLI Test**

```js
// tests/e2e/pipeline-cli.test.js
import { exec } from 'child_process';
import { expect, it } from 'vitest';
import fs from 'fs';

it('CLI pipeline should produce valid MP4', (done) => {
  exec('pnpm e2e "Test topic"', () => {
    const files = fs.readdirSync('data/exports');
    const mp4 = files.find(f => f.endsWith('.mp4'));
    expect(mp4).toBeTruthy();
    done();
  });
});
```

---

## 🎼 **5. Media Validation Test**

```js
// tests/media-validation/mediaValidation.test.js
import { execSync } from 'child_process';
import { expect, it } from 'vitest';

it('Exported MP4 should have correct dimensions and fps', () => {
  const output = execSync('ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate -of csv=p=0 data/exports/test.mp4').toString();
  expect(output).toMatch(/1080,1920/);
  expect(output).toMatch(/30\/1/);
});
```

---

## ⚡ **Cum să le rulezi**
- Unit & integration:
```bash
pnpm vitest
```
- E2E UI:
```bash
pnpm playwright test
```
- Media validation:
```bash
pnpm vitest tests/media-validation
```

---

Dacă vrei, Gabor, pot să îți fac și **un fișier `package.json` cu scripturi de test preconfigurate**, astfel încât să rulezi toată suita cu o singură comandă și să o integrezi în pipeline-ul de release.  
Îți pregătesc și acest setup?
