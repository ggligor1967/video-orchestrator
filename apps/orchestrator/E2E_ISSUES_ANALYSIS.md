# E2E Pipeline Test Issues Analysis

**Test Run Date**: 2025-10-14  
**Results**: 7/23 tests passing (30.43%)  
**Status**: 16 critical integration issues identified

---

## ✅ Tests Passing (7/23)

1. **Step 2**: Get video info for background (graceful skip when no videos)
2. **Step 4**: Support different subtitle formats (graceful skip)
3. **Step 5**: Export final video (2 tests - graceful skip)
4. **Integration**: Validate file paths across endpoints (403 for path traversal) ✅ SECURITY WORKING
5. **Performance**: Script generation < 5 seconds ✅
6. **Performance**: Concurrent requests (5 simultaneous) ✅

---

## ❌ Critical Issues (16 failed tests)

### Issue #1: Response Format Inconsistency
**Impact**: 2 tests failing  
**Status**: HIGH PRIORITY

**Problem**:
```javascript
// Current backend response:
{
  "success": true,
  "data": {
    "script": "...",
    "hooks": [...],
    "hashtags": [...],
    "duration": 30
  }
}

// E2E tests expect:
{
  "success": true,
  "script": "...",
  "hooks": [...],
  "hashtags": [...],
  "duration": 30
}
```

**Affected Tests**:
- `Step 1: should generate a complete story script`
- `Step 1: should generate scripts with different genres`
- `Step 3: should list available voices`

**Root Cause**: Backend wraps all responses in `{success, data}` structure, but tests expect flat response.

**Fix Options**:
1. **Option A (preferred)**: Update E2E tests to match backend format `response.body.data.*`
2. **Option B**: Modify backend to return flat responses (breaks consistency)

**Recommendation**: Update E2E tests - backend format is more consistent.

---

### Issue #2: Missing Endpoints (404s)
**Impact**: 5 tests failing  
**Status**: CRITICAL

**Missing Routes**:
1. `GET /assets/backgrounds/list` → 404
2. `POST /batch/submit` → 404
3. `POST /scheduler/create` → 404
4. `POST /export` → 404

**Expected Routes** (from documentation):
- `/assets/backgrounds` (exists) but tests call `/assets/backgrounds/list`
- `/batch/*` (exists) but may have different endpoint structure
- `/scheduler/*` (exists) but may have different endpoint structure
- `/export` (exists) but may be under different path

**Investigation Needed**:
```bash
# Check actual routes:
grep -r "router\\.get\\|router\\.post" apps/orchestrator/src/routes/
```

**Action**: Map E2E test expectations to actual backend routes.

---

### Issue #3: Batch/Scheduler Service Logic Error
**Impact**: 2 tests failing  
**Status**: HIGH PRIORITY

**Problem**:
```javascript
// Test calls:
GET /batch/list  → expects array of all jobs
GET /scheduler/list  → expects array of all scheduled posts

// Backend interprets:
GET /batch/:batchId where batchId="list"  → Error: "Batch job list not found"
GET /scheduler/:postId where postId="list"  → Error: "Scheduled post list not found"
```

**Root Cause**: Route parameter `:batchId` captures "list" as an ID instead of treating it as a separate endpoint.

**Backend Error**:
```
error: Unhandled error Batch job list not found
  at Object.getBatchJobStatus (batchService.js:150:13)
```

**Fix Required**:
```javascript
// Current (incorrect):
router.get('/batch/:batchId', getBatchStatus);

// Should be:
router.get('/batch', listAllBatchJobs);  // List all
router.get('/batch/:batchId', getBatchStatus);  // Get specific

// Same for scheduler:
router.get('/scheduler', listAllScheduledPosts);  // List all
router.get('/scheduler/:postId', getPost);  // Get specific
```

---

### Issue #4: Pipeline Validation Mismatch
**Impact**: 3 tests failing  
**Status**: HIGH PRIORITY

**Problem**:
```javascript
// E2E test sends:
{
  topic: 'mysterious disappearance',
  genre: 'mystery',
  duration: 30,
  voice: 'en_US-lessac-medium',
  platform: 'tiktok'
}

// Backend expects (Zod schema):
{
  script: string,        // ❌ REQUIRED but not provided
  backgroundId: string,  // ❌ REQUIRED but not provided
  voice: string,
  platform: string
}
```

**Backend Error**:
```
ZodError: [
  { "path": ["script"], "message": "Required" },
  { "path": ["backgroundId"], "message": "Required" }
]
```

**Analysis**:
The E2E test assumes `/pipeline/build` is a **high-level endpoint** that generates script internally.  
The backend implements it as a **composition endpoint** that requires pre-generated script and background.

**Fix Options**:
1. **Update E2E tests**: Generate script first, then pass to pipeline
2. **Modify `/pipeline/build`**: Make `topic`/`genre` optional, generate script if not provided

**Recommendation**: Option 1 (update tests) - keeps backend clean.

---

### Issue #5: Path Validation Overly Restrictive
**Impact**: 1 test failing  
**Status**: MEDIUM PRIORITY

**Problem**:
```
// Test tries to create:
data/test-e2e/speed-test-0.8.wav

// Validation middleware blocks:
warn: Path traversal attempt detected
  requestedPath: "data/test-e2e/speed-test-0.8.wav"
  resolvedPath: "d:\\playground\\aplicatia\\apps\\orchestrator\\data\\test-e2e\\speed-test-0.8.wav"
  → 403 Forbidden
```

**Root Cause**: `test-e2e` directory not in allowedDirs list.

**Current allowedDirs**:
```javascript
[
  'data/assets',
  'data/cache',
  'data/exports',
  'data/tts',
  'data/subs'
]
```

**Fix**:
```javascript
// Add test directory to allowedDirs when NODE_ENV === 'test':
if (process.env.NODE_ENV === 'test') {
  allowedDirs.push(
    path.join(projectRoot, 'data/test-e2e'),
    path.join(projectRoot, 'data/test-unit'),
    path.join(projectRoot, 'data/test-integration')
  );
}
```

---

### Issue #6: Sequential Test Dependencies
**Impact**: Cascading failures  
**Status**: MEDIUM PRIORITY

**Problem**:
```javascript
// Step 3 expects Step 1 to succeed:
expect(pipelineData.script).toBeTruthy();  // ❌ null because Step 1 failed

// Step 4 expects Step 3 to succeed:
expect(pipelineData.ttsPath).toBeTruthy();  // ❌ null because Step 3 failed
```

**Current Behavior**:
- Step 1 fails → `pipelineData.script = null`
- Step 3 fails immediately because no script
- Step 4 fails immediately because no TTS path
- **Cascading failure** prevents testing later steps

**Fix**:
```javascript
// Add graceful fallbacks:
it('should generate voice-over from script', async () => {
  if (!pipelineData.script) {
    // Generate fallback script for this test
    pipelineData.script = 'Test script for TTS generation';
  }
  
  // Continue with test...
});
```

---

## 🔧 Recommended Fix Priority

### Phase 1: Quick Wins (30 minutes)
1. ✅ **Update E2E tests**: Fix response format expectations (`.body.data.*`)
2. ✅ **Add test directories** to allowedDirs in validatePath middleware
3. ✅ **Add fallback data** for sequential tests (prevent cascading failures)

### Phase 2: Route Fixes (1 hour)
4. ✅ **Map endpoint URLs**: Verify all routes match E2E expectations
5. ✅ **Fix batch/scheduler routes**: Add separate list endpoints
6. ✅ **Update pipeline validation**: Make schema match E2E expectations

### Phase 3: Integration Testing (30 minutes)
7. ✅ **Rerun E2E tests**: Validate all fixes
8. ✅ **Add missing endpoints**: Implement any truly missing routes
9. ✅ **Document API contract**: Update docs with correct endpoint signatures

---

## 📊 Expected Results After Fixes

**Before**: 7/23 passing (30.43%)  
**After Phase 1**: ~15/23 passing (65%)  
**After Phase 2**: ~21/23 passing (91%)  
**After Phase 3**: 23/23 passing (100%)

---

## 🚀 Next Steps

1. **Fix response format**: Update E2E tests to use `response.body.data.*`
2. **Add test directories**: Update validatePath middleware
3. **Fix batch/scheduler routes**: Add list endpoints
4. **Update pipeline schema**: Align with E2E expectations
5. **Rerun tests**: Verify 100% pass rate
6. **Document changes**: Update API documentation

**Estimated Time**: 2 hours total  
**Impact**: Unlocks Module 9 completion (E2E validation → UI → MSI)
