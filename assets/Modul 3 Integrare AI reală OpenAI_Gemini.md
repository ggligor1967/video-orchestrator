# Modul 3 — Integrare AI reală (OpenAI/Gemini)

Obiectiv: înlocuim mock-ul din aiService cu apeluri reale către un singur provider AI plătit (OpenAI sau Google Gemini), folosind aceeași interfață. Adăugăm prompturi optimizate, validare strictă a răspunsului, retry cu backoff, timeouts și teste automate.

---

## Configurație și dependențe

### .env (root sau apps/orchestrator/.env.local)
```
OPENAI_API_KEY=sk-...
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini

# Alternativ Google Gemini (compatibil OpenAI):
# OPENAI_API_KEY=YOUR_GEMINI_API_KEY
# OPENAI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/
# OPENAI_MODEL=gemini-2.0-flash
```

### package.json (apps/orchestrator) — dependențe utile
```json
{
  "dependencies": {
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "multer": "^1.4.5-lts.1",
    "zod": "^3.23.8",
    "node-fetch": "^3.3.2"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "supertest": "^6.3.4",
    "nock": "^13.5.4",
    "nodemon": "^3.1.0"
  }
}
```

---

## Prompturi optimizate

### System prompt
```
You craft concise, suspenseful storytime scripts for short vertical videos (TikTok/Shorts).
Tone: calm, eerie, sensory details, no gore, no graphic violence, no doxxing.
Keep sentences short. English only. Output JSON strictly matching the schema.
```

### User prompt (dinamic)
```
Write a first-person story in the {GENRE} space for a vertical short video.
Structure: 
- Hook (0–3s, 1–2 punchy lines)
- Build (sensory, subtle dread)
- Cliffhanger (stop before resolution, clean)
- CTA: "Want Part 2? Comment 'P2'."

Constraints:
- 120–160 words
- 90–120 wpm pacing
- No gore, no graphic content, no personal data
- Calm tone, present tense, short sentences

Topic: "{TOPIC}"

Also produce:
- 3 alternative hooks (<=7s each)
- Up to 12 hashtags: 50% niche (#storytime, #scarystory/#mystery/#paranormal/#truecrime), 30% context, 20% light trends. No banned/misleading tags.
Return JSON with keys: script (string), hooks (string[3]), hashtags (string[]).
```

---

## Implementare serviciu AI

### src/services/aiService.js
```js
import fetch from "node-fetch";
import { z } from "zod";

const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
const apiKey = process.env.OPENAI_API_KEY || "";
const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

const AiResponseSchema = z.object({
  script: z.string().min(40),
  hooks: z.array(z.string().min(5)).min(1).max(5),
  hashtags: z.array(z.string().min(2)).min(3).max(15)
});

function buildMessages(topic, genre) {
  const system = `You craft concise, suspenseful storytime scripts for short vertical videos (TikTok/Shorts).
Tone: calm, eerie, sensory details, no gore, no graphic violence, no doxxing.
Keep sentences short. English only. Output JSON strictly matching the schema.`;

  const user = `Write a first-person story in the ${genre} space for a vertical short video.
Structure: 
- Hook (0–3s, 1–2 punchy lines)
- Build (sensory, subtle dread)
- Cliffhanger (stop before resolution, clean)
- CTA: "Want Part 2? Comment 'P2'."

Constraints:
- 120–160 words
- 90–120 wpm pacing
- No gore, no graphic content, no personal data
- Calm tone, present tense, short sentences

Topic: "${topic}"

Also produce:
- 3 alternative hooks (<=7s each)
- Up to 12 hashtags: 50% niche (#storytime, #scarystory/#mystery/#paranormal/#truecrime), 30% context, 20% light trends. No banned/misleading tags.

Return strictly valid JSON:
{
  "script": string,
  "hooks": string[],
  "hashtags": string[]
}`;

  return [
    { role: "system", content: system },
    { role: "user", content: user }
  ];
}

async function callChatCompletions(messages, { timeoutMs = 20000 } = {}) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        response_format: { type: "json_object" }
      })
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`AI HTTP ${res.status}: ${txt.slice(0, 200)}`);
    }
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) throw new Error("AI: empty content");
    return content;
  } finally {
    clearTimeout(t);
  }
}

async function withRetry(fn, { retries = 2, baseDelay = 600 } = {}) {
  let lastErr;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i === retries) break;
      const delay = baseDelay * Math.pow(2, i);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw lastErr;
}

export async function aiGenerateScript(topic, genre) {
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY");
  const messages = buildMessages(topic, genre);

  const content = await withRetry(() => callChatCompletions(messages));
  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (e) {
    // fallback: încearcă să extragi bloc JSON dacă modelul a adăugat text suplimentar
    const m = content.match(/\{[\s\S]*\}$/);
    if (!m) throw new Error("AI returned non-JSON content");
    parsed = JSON.parse(m[0]);
  }
  const validated = AiResponseSchema.parse(parsed);

  // Curățări simple
  validated.hashtags = Array.from(new Set(validated.hashtags.map(h => h.trim().replace(/\s+/g, "")))).slice(0, 12);
  validated.hooks = validated.hooks.map(h => h.trim()).slice(0, 3);

  return validated;
}
```

---

## Controller actualizat

### src/controllers/aiController.js
```js
import { z } from "zod";
import { aiGenerateScript } from "../services/aiService.js";

const schema = z.object({
  topic: z.string().min(3),
  genre: z.enum(["horror", "mystery", "paranormal", "true crime"])
});

export async function generateScript(req, res) {
  try {
    const { topic, genre } = schema.parse(req.body);
    const result = await aiGenerateScript(topic, genre);
    res.json(result);
  } catch (err) {
    const code = String(err.message || "").includes("OPENAI_API_KEY") ? 500 : 400;
    res.status(code).json({ error: err.message });
  }
}
```

---

## Conectare în UI (înlocuiește mock)

### apps/ui/src/lib/api.ts
```ts
import ky from "ky";
const base = "http://127.0.0.1:4545";

export async function generateScript(topic: string, genre: string) {
  return await ky.post(`${base}/ai/script`, { json: { topic, genre } }).json<{
    script: string; hooks: string[]; hashtags: string[];
  }>();
}
```

În StoryScript.svelte, rămâne neschimbat — acum va primi date reale.

---

## Testare automată

### Test integrare API (mock HTTP cu nock)

**apps/orchestrator/test/ai.test.js**
```js
import request from "supertest";
import nock from "nock";
import app from "../src/app.js";

const BASE = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";

describe("AI /ai/script", () => {
  beforeAll(() => {
    process.env.OPENAI_API_KEY = "test-key";
  });

  it("returns structured content", async () => {
    const scope = nock(BASE)
      .post("/chat/completions")
      .reply(200, {
        choices: [{
          message: {
            content: JSON.stringify({
              script: "I watch the corridor lights flicker. My badge beeps. I am alone. Or so I think...",
              hooks: ["The elevator moved by itself.", "The badge beeped twice.", "Someone typed my name."],
              hashtags: ["#storytime","#scarystory","#nightshift","#mystery"]
            })
          }
        }]
      });

    const res = await request(app)
      .post("/ai/script")
      .send({ topic: "Night shift at empty hospital", genre: "mystery" });

    expect(res.statusCode).toBe(200);
    expect(res.body.script).toMatch(/I /);
    expect(Array.isArray(res.body.hooks)).toBe(true);
    expect(res.body.hashtags.length).toBeGreaterThan(2);
    scope.done();
  });

  it("validates input", async () => {
    const res = await request(app).post("/ai/script").send({ topic: "a", genre: "mystery" });
    expect(res.statusCode).toBe(400);
  });
});
```

### Test unitare pentru schema

**apps/orchestrator/test/ai.schema.test.js**
```js
import { z } from "zod";

const AiResponseSchema = z.object({
  script: z.string().min(40),
  hooks: z.array(z.string().min(5)).min(1).max(5),
  hashtags: z.array(z.string().min(2)).min(3).max(15)
});

describe("AI schema", () => {
  it("valid", () => {
    const data = {
      script: "This is a sufficiently long script with suspense and clean cliffhanger.",
      hooks: ["One", "Two hooks"],
      hashtags: ["#storytime", "#mystery", "#nightshift"]
    };
    expect(() => AiResponseSchema.parse(data)).not.toThrow();
  });

  it("invalid when script too short", () => {
    const bad = { script: "short", hooks: ["ok hook"], hashtags: ["#a","#b","#c"] };
    expect(() => AiResponseSchema.parse(bad)).toThrow();
  });
});
```

---

## Control cost și robustețe

- Folosește model rapid/ieftin: gpt-4o-mini sau gemini-2.0-flash.
- Limitează apelurile: doar pentru draft final, nu pentru regenerări continue.
- Timeouts: 20s; retry: 2 cu backoff (600ms, 1200ms).
- Loghează rata de succes/eroare; expune un counter în GET /health dacă vrei monitorizare.

---

## Definition of done — Modul 3

- /ai/script apelează provider real și întoarce JSON validat.
- Erorile sunt clare (400 input/validare, 500 lipsă cheie).
- Testele trec: unit + integrare (nock).
- UI poate genera script real din tab-ul „Story & Script”.

---

## Rulare

1. Completează .env cu cheia și modelul.
2. pnpm --filter @app/orchestrator dev
3. pnpm --filter @app/ui dev
4. În UI, introdu topic + selectează genul → „Generate script”.
5. Teste:
   - pnpm --filter @app/orchestrator test

---

Vrei să continuăm cu Modul 4 — Servicii media FFmpeg (crop 9:16, speed ramp, loudness, mux, subtitrări burn-in) și să legăm tab-urile Background/Voice/Audio/Subs/Export la endpoint-uri reale?
