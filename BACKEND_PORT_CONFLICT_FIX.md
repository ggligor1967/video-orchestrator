# Backend Port 4545 - Conflict Resolution Guide

**Problem**: Backend cannot start because port 4545 is already in use

**Error**:
```
error: Failed to start server: listen EADDRINUSE: address already in use 127.0.0.1:4545
```

---

## 🔍 Diagnosis

**Current State** (verified 2025-11-03 20:40):
- Port 4545: **OCCUPIED** by Node process (PID: 25312)
- Total Node processes running: **10**
- Backend status: **CANNOT START**

---

## ✅ Solution Options

### Option 1: Kill All Node Processes (Recommended - Fast)

**Steps**:
1. Open PowerShell **as Administrator** (Right-click → Run as Administrator)
2. Execute:
   ```powershell
   taskkill /F /IM node.exe
   ```
3. Wait 2 seconds
4. Start backend:
   ```powershell
   cd D:\playground\Aplicatia\apps\orchestrator
   pnpm dev
   ```

**Pros**:
- ✅ Fast (1 command)
- ✅ Guaranteed to work
- ✅ Cleans up all stuck processes

**Cons**:
- ⚠️ Kills ALL Node processes (including other apps)

---

### Option 2: Kill Only Port 4545 Process (Precise)

**Steps**:
1. Find process on port 4545:
   ```powershell
   Get-NetTCPConnection -LocalPort 4545 | Select OwningProcess
   # Output: 25312
   ```

2. Kill specific process (as Administrator):
   ```powershell
   taskkill /F /PID 25312
   ```

3. Start backend:
   ```powershell
   cd D:\playground\Aplicatia\apps\orchestrator
   pnpm dev
   ```

**Pros**:
- ✅ Precise (only kills blocking process)
- ✅ Preserves other Node apps

**Cons**:
- ⚠️ Requires Administrator rights
- ⚠️ Need to find PID first

---

### Option 3: Change Backend Port (Alternative)

If you can't kill the process, change the backend port:

**Steps**:
1. Edit `apps/orchestrator/.env`:
   ```env
   PORT=4546  # Changed from 4545
   ```

2. Edit `apps/ui/src/config.js` or equivalent:
   ```js
   const BACKEND_URL = 'http://127.0.0.1:4546'  // Changed from 4545
   ```

3. Start backend:
   ```powershell
   cd apps\orchestrator
   pnpm dev
   ```

**Pros**:
- ✅ No need for Administrator
- ✅ Preserves existing process

**Cons**:
- ⚠️ Need to update frontend config
- ⚠️ May confuse future debugging

---

## 🚀 Quick Fix (Copy-Paste)

**Run this in Administrator PowerShell**:

```powershell
# Stop all Node processes
Write-Host "Stopping all Node processes..." -ForegroundColor Yellow
taskkill /F /IM node.exe

# Wait for cleanup
Start-Sleep -Seconds 2

# Verify port is free
$port = Get-NetTCPConnection -LocalPort 4545 -ErrorAction SilentlyContinue
if ($port) {
    Write-Host "❌ Port 4545 still occupied" -ForegroundColor Red
} else {
    Write-Host "✅ Port 4545 is FREE!" -ForegroundColor Green
}

# Navigate and start backend
cd D:\playground\Aplicatia\apps\orchestrator
Write-Host "`nStarting backend..." -ForegroundColor Cyan
pnpm dev
```

---

## 🔍 Verification

**After starting backend, verify it's running**:

```powershell
# Check if port 4545 is listening
Get-NetTCPConnection -LocalPort 4545 -State Listen

# Test health endpoint
Invoke-WebRequest -Uri "http://127.0.0.1:4545/health" -Method GET
```

**Expected output**:
```json
{"status":"success","message":"Data loaded successfully"}
```

---

## 📊 Current Node Processes (as of 20:40)

| PID   | CPU (s) | Memory (MB) | Start Time          |
|-------|---------|-------------|---------------------|
| 5312  | 7.47    | 8.36        | 03/11/2025 15:58:50 |
| 6092  | 20.72   | 62.86       | 03/11/2025 15:59:11 |
| 9668  | 12315   | 87.97       | 03/11/2025 15:58:51 |
| 15692 | 3.13    | 4.83        | 03/11/2025 15:58:48 |
| 20252 | 91.92   | 91.22       | 03/11/2025 15:58:46 |
| 22012 | 9.41    | 8.8         | 03/11/2025 15:58:48 |
| 23524 | 7.39    | 8.58        | 03/11/2025 15:58:54 |
| 23716 | 0.41    | 46.33       | 03/11/2025 20:36:46 |
| 23936 | 0.23    | 71.49       | 03/11/2025 20:36:46 |
| **25312** | 1.77 | **80.16** | **03/11/2025 20:34:36** ← **BLOCKING** |

**Analysis**:
- PID 25312 is the **blocking process** (started 20:34:36, using 80 MB)
- Multiple other Node processes suggest previous failed starts
- Recommendation: **Kill all and restart cleanly**

---

## ⚠️ Why This Happens

1. **Previous backend didn't shut down cleanly**
   - You closed terminal without stopping server
   - Or server crashed but process remained

2. **Multiple terminal sessions**
   - Running `pnpm dev` from multiple terminals
   - Each tries to bind to port 4545

3. **Development workflow**
   - Hot reload creates child processes
   - Parent dies but children remain orphaned

---

## 🛡️ Prevention

**Best practices**:

1. **Always stop backend with Ctrl+C** (not close terminal)

2. **Use single terminal for backend**:
   ```powershell
   # Don't open multiple terminals running pnpm dev
   ```

3. **Check port before starting**:
   ```powershell
   Get-NetTCPConnection -LocalPort 4545 -ErrorAction SilentlyContinue
   ```

4. **Use process manager** (optional):
   ```powershell
   # Install PM2
   npm install -g pm2
   
   # Start backend
   pm2 start "pnpm dev" --name "video-orch-backend"
   
   # Stop cleanly
   pm2 stop video-orch-backend
   ```

---

## 📝 Phase 5 Testing - Backend Required

**Once backend starts successfully**:

1. Verify health:
   ```powershell
   Invoke-WebRequest -Uri "http://127.0.0.1:4545/health"
   ```

2. Test with application:
   - Launch installed app: `C:\Program Files\Video Orchestrator\video-orchestrator.exe`
   - Try importing media files
   - Test video generation pipeline

3. Complete Phase 5 tests (currently blocked)

---

**Status**: BLOCKED until port 4545 is freed  
**Solution**: Run `taskkill /F /IM node.exe` as Administrator  
**Next**: Start backend with `pnpm dev` and complete Phase 5 testing
