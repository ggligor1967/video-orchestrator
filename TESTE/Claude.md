Based on my analysis of the test results, here's a comprehensive breakdown:

  📊 Overall Test Results Summary

  ✅ Passed:  284 tests (82.8%)
  ❌ Failed:  22 tests (6.4%)
  ⏭️  Skipped: 37 tests (10.8%)
  ⚠️  Errors:  5 unhandled errors

  Files: 12 failed | 6 passed | 2 skippedDuration: 6.44 seconds

  ---
  🔴 Critical Issues

  1. API Key Configuration Problems (HIGHEST PRIORITY)

  Both AI providers are failing authentication:

  OpenAI:
  401 Incorrect API key provided: sk-proj-***_COM

  Google Gemini:
  400 Bad Request: API key not valid

  Impact: All AI-dependent features (script generation, background suggestions) are broken.

  Fix: Update .env file with valid API keys:
  OPENAI_API_KEY=sk-...
  GEMINI_API_KEY=...

  ---
  2. TTS Service Implementation Issues

  Problem: Method name mismatch
  Error: ttsService.generateSpeech is not a function

  Impact: All voice-over generation tests failing (13+ test cases)

  Root Cause: Tests expect voice parameter but validation schema doesn't require it, causing 400 errors.

  Failed Tests:
  - ❌ should accept valid TTS request with default settings
  - ❌ should accept TTS request with custom voice
  - ❌ should accept TTS request with speed adjustment
  - ❌ should validate text length limits (voice missing)
  - ❌ should handle special characters (voice missing)

  ---
  3. Audio Normalization API Contract Mismatch

  Problem: Test expects different request schema than controller implements

  Test sends:
  { inputPath: 'path/to/audio.wav' }

  Controller expects:
  {
    voiceover: 'string',
    backgroundMusic: 'string',
    soundEffects: ['array'],
    settings: { object }
  }

  Failed Tests:
  - ❌ should validate required fields
  - ❌ should accept valid normalize request (3 variants)
  - ❌ should validate required audio path

  ---
  🟡 Unit Test Failures

  4. Graceful Degradation Tests (2 failures)

  File: tests/unit/gracefulDegradation.test.js

  - ❌ should allow retry after cooldown period - Timing issue with cooldown mechanism
  - ❌ should use custom cooldown period - Custom cooldown not being respected

  Issue: Service availability tracking timing logic may have race conditions.

  ---
  5. Error Response Formatting (2 failures)

  File: tests/unit/errorResponse.test.js

  - ❌ should format Zod validation errors - Error message format mismatch
  - ❌ should handle nested field paths - Nested validation path formatting

  Issue: Zod error transformation not matching expected format.

  ---
  6. Path Handling Issues (2 failures)

  paths.test.js:
  - ❌ should handle absolute paths correctly - Path resolution logic issue

  pathSecurity.test.js:
  - ❌ should throw on path with invalid characters - Error message mismatch:
    - Expected: "invalid characters"
    - Got: "File does not exist"

  ---
  7. Log Sanitization (1 failure)

  File: tests/unit/logSanitization.test.js

  - ❌ should redact Bearer tokens - Token pattern not matching

  Issue: Regex pattern for Bearer token redaction needs adjustment.

  ---
  🟠 Integration Test Failures

  8. AI Script Generation

  File: tests/ai.test.js

  - ❌ should reject extremely long topics - Validation not enforcing topic length limits
    - Expected: 400 Bad Request
    - Got: 200 OK (accepted invalid input)

  ---
  9. Subtitles Generation

  File: tests/subs.test.js

  - ❌ should create a valid SRT file - 400 error (validation issue)
  - ❌ should convert SRT to VTT - 500 error (server error)

  ---
  10. End-to-End Pipeline

  File: tests/e2e-pipeline.test.js

  - ❌ Step 3: Voice-over generation (500 error - see TTS issue #2)
  - ❌ Step 7: Batch job listing (500 error)
  - ❌ Cross-module state management (state not persisting)

  ---
  11. Health Check Status

  File: tests/health.test.js

  - ❌ should return 200 OK with health status
    - Expected: "ok"
    - Got: "degraded"

  Reason: System is correctly reporting degraded status due to:
  - Missing/invalid AI API keys
  - TTS service issues
  - External tool availability problems

  ---
  ⚠️ Unhandled Errors

  1. OpenAI 401 Unauthorized (2 occurrences)
  2. Gemini 400 Invalid API Key (2 occurrences)
  3. ETIMEDOUT - Retry handler test creating unhandled rejection

  ---
  ✅ What's Working Well

  Passing Test Suites:
  - ✅ Path utilities (26/27 tests)
  - ✅ Pagination middleware
  - ✅ Error response helpers (22/24 tests)
  - ✅ Service availability tracking (15/17 tests)
  - ✅ Log sanitization (19/20 tests)
  - ✅ Path security (18/19 tests)
  - ✅ Video processing validation
  - ✅ Most TTS validation logic

  ---
  🔧 Recommended Fix Priority

  Priority 1 (Immediate):

  1. Fix API keys - Update .env with valid OpenAI and Gemini keys
  2. Fix TTS schema - Make voice parameter required in validation schema
  3. Fix audio API contract - Align test expectations with controller schema

  Priority 2 (Short-term):

  4. Fix graceful degradation timing issues
  5. Fix Zod error formatting
  6. Fix AI topic length validation
  7. Fix subtitle generation endpoints

  Priority 3 (Medium-term):

  8. Resolve path handling edge cases
  9. Fix log sanitization Bearer token regex
  10. Improve error messages for path security

  ---
  📝 Quick Fix Commands

  # 1. Update environment variables
  cp apps/orchestrator/.env.example apps/orchestrator/.env
  # Then edit .env with valid API keys

  # 2. Run only passing tests to verify
  pnpm --filter @app/orchestrator test tests/unit/paths.test.js

  # 3. Re-run after fixes
  pnpm test:unit

  ---
  Summary: The test suite is in reasonable shape with 82.8% pass rate. The main blockers are invalid API keys and
  TTS service contract mismatches. Once these are resolved, most integration tests should pass.