# Backend Connection Testing Guide

## Overview

This document outlines the comprehensive error handling and connection testing for the Video Orchestrator UI → Backend communication.

## Test Implementation Summary

### ✅ **Completed Implementations**

1. **Backend Connection Store** (`apps/ui/src/stores/appStore.js`)
   - `backendConnection` store with status tracking
   - `isBackendReady` derived store
   - Automatic health check polling (15s interval)
   - Exponential backoff retry logic (1s, 2s, 4s)
   - Maximum 3 retry attempts before error state

2. **Enhanced App.svelte**
   - Automatic backend initialization on mount
   - Real-time connection status display with last check timestamp
   - Graceful error UI with retry button
   - Health check polling lifecycle management
   - Proper cleanup on component destroy

3. **Error Flow States**
   - `checking` - Initial connection attempt
   - `connected` - Backend is healthy and responding
   - `disconnected` - Connection lost after being established
   - `error` - Failed to connect after max retries

## Test Scenarios

### 1. **Normal Startup Flow**

**Expected Behavior:**
1. UI displays "Connecting..." message
2. Backend health check succeeds
3. Status changes to "Backend Connected"
4. Tabs become accessible
5. Health checks poll every 15 seconds

**Test Steps:**
```bash
# Start backend
cd apps/orchestrator
pnpm dev

# Start UI (separate terminal)
cd apps/ui
pnpm dev

# Observe:
# - Initial connection message
# - Status indicator turns green
# - Timestamp appears showing last check
```

### 2. **Backend Down on Startup**

**Expected Behavior:**
1. UI displays "Connecting..." with retry attempt counter
2. Exponential backoff: waits 1s, then 2s, then 4s
3. After 3 failed attempts, shows error screen
4. Error message: "Could not connect to the Video Orchestrator backend server"
5. Retry button available for manual reconnection

**Test Steps:**
```bash
# Start UI WITHOUT backend running
cd apps/ui
pnpm dev

# Observe:
# - "Connecting..." message
# - "Attempt 1..." then "Attempt 2..." then "Attempt 3..."
# - After ~7 seconds total, error screen appears
# - Retry count shows "3 / 3"
```

### 3. **Connection Loss During Operation**

**Expected Behavior:**
1. UI connected and working normally
2. Backend stops/crashes
3. Next health check (within 15s) detects failure
4. Status changes to "Backend Disconnected"
5. Warning notification appears: "Backend connection lost. Attempting to reconnect..."
6. Automatic reconnection attempt after 2s
7. If successful, status returns to "Backend Connected"

**Test Steps:**
```bash
# With both UI and backend running:

# 1. Stop the backend (Ctrl+C in orchestrator terminal)

# 2. Wait up to 15 seconds for next health check

# 3. Observe:
#    - Status indicator turns yellow/red
#    - Warning notification appears
#    - Automatic reconnection starts

# 4. Restart backend:
cd apps/orchestrator
pnpm dev

# 5. Within 2 seconds, UI should reconnect automatically
```

### 4. **Timeout Scenarios**

**API Call Timeouts:**
- Default timeout: 30 seconds (configurable in `api.js`)
- Retry limit: 2 attempts for GET/POST
- Status codes triggering retry: 408, 413, 429, 500, 502, 503, 504

**Test Steps:**
```bash
# Use the manual test HTML file
open tests/manual/test-backend-connection.html

# Click "Test with Timeout" button
# Expected: Timeout after 100ms, proper error handling
```

### 5. **API Error Handling**

**Per-Endpoint Error Handling:**

Each API call in `api.js` follows this pattern:
```javascript
try {
  const response = await api.post("endpoint", { json: data }).json();
  return response.data;
} catch (_error) {
  throw new Error("User-friendly error message");
}
```

**Test Steps:**
```bash
# Open manual test file
open tests/manual/test-backend-connection.html

# Test each scenario:
1. Click "Test Script Generation" - verifies AI endpoint
2. Click "Test Background Import" - verifies file upload
3. Click "Test TTS Generation" - verifies long-running operations

# Expected: Proper error messages displayed for each scenario
```

## Manual Test Suite

### Using `test-backend-connection.html`

Located at: `tests/manual/test-backend-connection.html`

**Features:**
- Visual health check testing
- Retry logic verification
- Connection loss simulation
- API endpoint error testing
- Detailed logging with timestamps

**Usage:**
```bash
# Option 1: Open directly in browser
start tests/manual/test-backend-connection.html

# Option 2: Serve via simple HTTP server
cd tests/manual
python -m http.server 8080
# Then navigate to http://localhost:8080/test-backend-connection.html
```

**Test Sections:**

1. **Health Check**
   - Test basic connectivity
   - Test with artificial timeout

2. **Retry Logic**
   - Verify exponential backoff (1s → 2s → 4s)
   - Confirm max attempts limit

3. **Connection Loss Simulation**
   - Start polling
   - Stop backend manually
   - Restart backend
   - Verify automatic recovery

4. **API Error Scenarios**
   - Test script generation endpoint
   - Test background import endpoint
   - Test TTS generation endpoint

## Error States Reference

### Connection Status Values

```javascript
{
  status: "checking" | "connected" | "error" | "disconnected",
  lastCheck: "2025-10-26T10:30:45.123Z" | null,
  errorMessage: string | null,
  retryCount: 0-3,
  healthData: { status: "healthy", ... } | null
}
```

### User-Visible Messages

| Status | Message | Color | Action Available |
|--------|---------|-------|------------------|
| `checking` | "Connecting..." | Blue | None (automatic) |
| `connected` | "Backend Connected" | Green | None |
| `disconnected` | "Backend Disconnected" | Yellow | Automatic retry |
| `error` | "Backend Error" | Red | Manual retry button |

## Implementation Details

### Exponential Backoff Algorithm

```javascript
const retryDelay = Math.pow(2, newRetryCount - 1) * 1000;
// Attempt 1: 2^0 * 1000 = 1000ms (1s)
// Attempt 2: 2^1 * 1000 = 2000ms (2s)  
// Attempt 3: 2^2 * 1000 = 4000ms (4s)
// Total time: ~7 seconds before showing error
```

### Health Check Polling

- **Interval:** 15 seconds
- **Started:** After first successful connection
- **Stopped:** On component destroy
- **Behavior:** Only polls if status is `connected`
- **On Failure:** Changes status to `disconnected`, triggers auto-reconnect after 2s

### Cleanup on Component Destroy

```javascript
onDestroy(() => {
  unsubscribeCurrentTab();
  unsubscribeBackend();
  stopHealthCheckPolling(); // Clears interval
});
```

## Known Limitations

1. **No Offline Detection**
   - UI doesn't detect when user's network is offline
   - Shows "Backend Error" instead of "Offline"
   - **Mitigation:** Use `navigator.onLine` API (future enhancement)

2. **No Request Queuing**
   - API calls made while disconnected fail immediately
   - No automatic retry of failed user actions
   - **Mitigation:** User must manually retry operations

3. **No Persistent State**
   - Connection state reset on page reload
   - No localStorage caching of last known state
   - **Mitigation:** Quick reconnection on startup (<7s)

4. **Health Check Overhead**
   - Polls every 15 seconds regardless of activity
   - Minimal bandwidth impact (~100 bytes per request)
   - **Mitigation:** Consider pause polling during video export

## Recommended Test Sequence

### Pre-Deployment Testing

1. ✅ Normal startup (backend running)
2. ✅ Startup with backend down
3. ✅ Connection loss during idle
4. ✅ Connection loss during operation (e.g., script generation)
5. ✅ Backend restart while UI running
6. ✅ Multiple rapid connection/disconnection cycles
7. ✅ Timeout scenarios (slow network simulation)
8. ✅ All API endpoints with backend down

### Automation Candidates

Future E2E tests should cover:
- [ ] Playwright test: startup with backend down
- [ ] Playwright test: connection loss recovery
- [ ] API mock server for timeout simulation
- [ ] Integration test: retry logic verification

## Related Files

- `apps/ui/src/stores/appStore.js` - Connection store and retry logic
- `apps/ui/src/lib/api.js` - HTTP client with ky, timeout config
- `apps/ui/src/App.svelte` - UI connection state display
- `apps/orchestrator/src/controllers/healthController.js` - Backend health endpoint
- `tests/manual/test-backend-connection.html` - Interactive test suite

## Troubleshooting

### Issue: "Backend Error" persists after starting backend

**Cause:** Max retries exhausted, automatic reconnection stopped  
**Solution:** Click "Retry Connection" button or refresh page

### Issue: Health checks stop after connection loss

**Cause:** Polling interval cleared on disconnect  
**Solution:** Auto-reconnection logic restarts polling on success

### Issue: Tabs not loading even when connected

**Cause:** Tab loading error, not connection issue  
**Solution:** Check browser console for component load errors

### Issue: TypeScript errors in appStore.js

**Cause:** JSDoc type annotations missing for function parameters  
**Solution:** Non-blocking warnings, functionality works correctly
