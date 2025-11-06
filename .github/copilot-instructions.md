# Video Orchestrator - AI Agent Instructions v2.0

## 🚨 MANDATORY VERIFICATION PROTOCOL

**GOLDEN RULE: NEVER TRUST. ALWAYS VERIFY. DOCUMENT EVERYTHING.**

### Before ANY Action or Statement:

1. **VERIFY CURRENT STATE**
   ```powershell
   # ALWAYS run these checks first:
   Get-Location  # Confirm you're in correct directory
   Test-Path [file/directory]  # Check existence
   Get-Item [file] | Select Length, LastWriteTime  # Check size and timestamp
   Get-Content [file] -Tail 20  # Read actual content
   ```

2. **CHECK EXIT CODES**
   ```powershell
   # From terminal history or logs:
   # Exit Code: 0 = Success ✅
   # Exit Code: 1 = Failed ❌
   # NEVER ignore exit codes
   ```

3. **MEASURE, DON'T ASSUME**
   ```powershell
   # WRONG: "MSI exists, so it's complete"
   # RIGHT: Check actual size
   $msi = Get-Item "*.msi"
   if ($msi.Length -lt 100MB) { "❌ INCOMPLETE" }
   ```

---

## 📋 VERIFICATION CHECKLIST FOR EVERY RESPONSE

**Before typing ANY response, complete this checklist:**

```markdown
□ Did I verify the current directory with Get-Location?
□ Did I check if files exist with Test-Path?
□ Did I measure file sizes, not just check existence?
□ Did I read recent content with Get-Content?
□ Did I check terminal history for exit codes?
□ Did I verify timestamps are recent (not old artifacts)?
□ Did I document each verification step?
□ Would I bet $1000 this information is accurate?

If ANY box is unchecked → STOP. VERIFY FIRST.
```

---

## 🔴 CRITICAL PROJECT STATUS (November 3, 2025)

**VERIFIED STATE** (not assumptions):
- **Code**: ~75% complete (exists but has issues)
- **Build System**: ~25% functional (configuration exists, builds FAIL)
- **MSI Package**: 0% functional (2.15 MB stub, not 383 MB expected)
- **Deployment**: 0% (cannot install or run)
- **Tools**: Missing or incomplete (FFmpeg, Piper, Whisper not bundled)

**KNOWN FAILURES**:
- `pnpm tauri build`: Exit Code: 1 ❌
- MSI size: 2.15 MB instead of 383 MB ❌
- Tools not downloading correctly ❌
- Backend status uncertain ❌

---

## 📝 DOCUMENTATION REQUIREMENTS

### For EVERY File Modification:

```markdown
## Action: [What you're doing]

### Pre-Verification:
```powershell
# Show verification commands run
Get-Location
Test-Path "target-file.js"
Get-Item "target-file.js" | Select Length, LastWriteTime
# Output: [paste actual output]
```

### Changes to Make:
- Line X: [specific change]
- Line Y: [specific change]
- Reason: [why this change is needed]

### Post-Verification:
```powershell
# Verify changes applied
Get-Content "target-file.js" | Select-String "new-code"
# Output: [paste actual output]
```

### Impact Assessment:
- [ ] Will this break existing functionality?
- [ ] Dependencies affected: [list]
- [ ] Tests to run: [list]
```

---

## 🎯 IMPLEMENTATION PRIORITIES

**Follow REAL_DEFICIENCIES_IMPLEMENTATION_PLAN.md exactly:**

### Phase 1: Foundation Fix (REQUIRED FIRST)
```powershell
# VERIFY before starting:
Test-Path "tools\ffmpeg\ffmpeg.exe"  # Should be FALSE initially
Test-Path "node_modules"  # Check if cleanup needed

# Document each step:
Write-Host "[$(Get-Date)] Starting Phase 1: Foundation Fix"
# ... execute steps ...
Write-Host "[$(Get-Date)] Phase 1 result: [SUCCESS/FAILED]"
```

### Phase 2-5: Follow Sequentially
- **NEVER** skip phases
- **ALWAYS** verify previous phase success
- **DOCUMENT** every command and result

---

## 🚫 PROHIBITED BEHAVIORS

**NEVER DO THIS:**
```powershell
# ❌ WRONG - Assuming without verification:
"The MSI package is ready for distribution"

# ❌ WRONG - Trusting old information:
"According to the report from 2 hours ago..."

# ❌ WRONG - Ignoring size/content:
if (Test-Path "file.msi") { "MSI is complete" }

# ❌ WRONG - Skipping verification:
"I'll just update the status to complete"
```

**ALWAYS DO THIS:**
```powershell
# ✅ RIGHT - Verify everything:
$msi = Get-Item "*.msi" -ErrorAction SilentlyContinue
if ($msi) {
    $size = [math]::Round($msi.Length/1MB, 2)
    Write-Host "MSI found: $size MB (expected 383MB)"
    if ($size -lt 100) { 
        Write-Host "❌ This is a stub, not complete package" 
    }
} else {
    Write-Host "❌ No MSI found"
}
```

---

## 🔍 VERIFICATION COMMANDS REFERENCE

### Before Claiming Build Success:
```powershell
# 1. Check MSI size (MUST be >350 MB)
Get-ChildItem "apps\ui\src-tauri\target\release\bundle\msi\*.msi" | 
    Select Name, @{N="MB";E={[math]::Round($_.Length/1MB,2)}}, LastWriteTime

# 2. Verify tools present (MUST total >500 MB)
Get-ChildItem "tools" -Recurse -Include *.exe | 
    Measure-Object -Sum Length | 
    Select @{N="TotalMB";E={[math]::Round($_.Sum/1MB,2)}}

# 3. Check build logs for errors
Get-Content "build.log" -Tail 50 | Select-String -Pattern "exit code:"

# 4. Verify backend health
Invoke-WebRequest -Uri "http://127.0.0.1:4545/health" -Method GET
```

### Before Updating Documentation:
```powershell
# 1. Read current content
Get-Content "README.md" | Select-String "status"

# 2. Verify claim accuracy
# [Run specific verification for the claim]

# 3. Document the change
git diff README.md  # Show what changed
```

---

## 📊 STATUS REPORTING TEMPLATE

**USE THIS FORMAT FOR ALL STATUS REPORTS:**

```markdown
## Component: [Name]
**Timestamp**: [Get-Date output]
**Verified By**: [Actual commands run]

### Current State:
- File exists: [Yes/No] at [path]
- File size: [X MB] (expected: [Y MB])
- Last modified: [timestamp]
- Build result: Exit Code [0/1]
- Verification command:
  ```powershell
  [Exact command run]
  # Output:
  [Exact output received]
  ```

### Verdict:
- ✅ WORKING: [if all checks pass]
- ⚠️ PARTIAL: [if some checks pass]
- ❌ BROKEN: [if checks fail]

### Evidence Screenshot:
[If possible, include terminal output screenshot]

### Next Action Required:
[Specific step from REAL_DEFICIENCIES_IMPLEMENTATION_PLAN.md]
```

---

## 🛠️ WORKING WITH TOOLS

### Before Using Any Tool:
```powershell
# 1. Verify tool exists and size is correct
$tool = Get-ChildItem "tools\ffmpeg" -Filter "ffmpeg.exe" -Recurse | Select -First 1
if ($tool) {
    Write-Host "Found: $($tool.FullName)"
    Write-Host "Size: $([math]::Round($tool.Length/1MB,2)) MB (expected ~283 MB)"
} else {
    Write-Host "❌ Tool not found - run scripts\download-tools.ps1"
}

# 2. Test tool execution
& $tool.FullName -version

# 3. Document tool availability
"FFmpeg: $(if($tool){'Available'}else{'Missing'}) at $(Get-Date)" | 
    Out-File "tool-status.log" -Append
```

---

## 🔧 TROUBLESHOOTING PROTOCOL

### When Something Fails:

1. **DOCUMENT THE FAILURE**
   ```powershell
   @"
   FAILURE REPORT - $(Get-Date)
   Command: [exact command that failed]
   Exit Code: [code]
   Error Message: [full error]
   Current Directory: $(Get-Location)
   "@ | Out-File "failure-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"
   ```

2. **VERIFY PREREQUISITES**
   ```powershell
   # Run scripts\diagnose-build.ps1
   powershell -ExecutionPolicy Bypass -File scripts\diagnose-build.ps1
   ```

3. **CHECK COMMON ISSUES**
   - Rust version correct? (`rustc --version`)
   - Node version correct? (`node --version`)
   - WiX installed? (Check Program Files)
   - Tools downloaded? (Check tools/ size)
   - Permissions? (Run as Administrator)

4. **DOCUMENT THE SOLUTION**
   ```markdown
   ## Issue: [Description]
   ## Cause: [Root cause]
   ## Solution: [Exact steps to fix]
   ## Verification: [How to confirm fixed]
   ```

---

## 📈 PROGRESS TRACKING

### Use Milestone Markers:
```powershell
# After completing each phase:
$status = @{
    Phase = "Phase 1: Foundation"
    StartTime = $startTime
    EndTime = Get-Date
    Duration = (Get-Date) - $startTime
    Result = "SUCCESS/FAILED"
    Issues = @("Issue 1", "Issue 2")
    NextStep = "Phase 2: Backend Validation"
}

$status | ConvertTo-Json | Out-File "progress-log.json" -Append
```

### Daily Status Check:
```powershell
# Run every morning:
Write-Host "=== DAILY STATUS CHECK - $(Get-Date) ===" -ForegroundColor Cyan

# 1. Check MSI status
$msi = Get-ChildItem "apps\ui\src-tauri\target\release\bundle\msi\*.msi" -ErrorAction SilentlyContinue
Write-Host "MSI: $(if($msi){"$([math]::Round($msi.Length/1MB,2)) MB"}else{'Not found'})"

# 2. Check tools status  
$toolsSize = (Get-ChildItem "tools" -Recurse -File | Measure-Object -Sum Length).Sum
Write-Host "Tools: $([math]::Round($toolsSize/1MB,2)) MB"

# 3. Check last build result
$lastBuild = Get-Content "build.log" -Tail 1 -ErrorAction SilentlyContinue
Write-Host "Last build: $lastBuild"

# 4. Overall assessment
Write-Host "Ready to deploy: $(if($msi -and $msi.Length -gt 350MB){'YES'}else{'NO'})"
```

---

## 🚀 QUICK REFERENCE

### Critical Paths:
```
Project Root: d:\playground\Aplicatia
Backend: apps\orchestrator (port 4545)
Frontend: apps\ui
Tools: tools\ffmpeg, tools\piper, tools\whisper
MSI Output: apps\ui\src-tauri\target\release\bundle\msi
Logs: build.log, install.log
```

### Critical Files to Monitor:
```
REAL_DEFICIENCIES_IMPLEMENTATION_PLAN.md - Implementation guide
tauri.conf.json - Bundle configuration  
package.json - Build scripts
build.log - Build output
```

### Critical Commands:
```powershell
# Clean build
pnpm clean && pnpm install --frozen-lockfile

# Download tools
powershell -File scripts\download-tools.ps1

# Run diagnostics
powershell -File scripts\diagnose-build.ps1

# Monitor build
powershell -File scripts\monitor-build.ps1

# Build MSI
cd apps\ui && pnpm tauri build --verbose
```

---

## ⚠️ FINAL WARNINGS

1. **NEVER** claim success without verification
2. **NEVER** trust file existence alone
3. **NEVER** ignore Exit Code: 1
4. **NEVER** skip verification steps
5. **NEVER** assume from partial evidence

**ALWAYS**:
- Measure actual file sizes
- Check recent timestamps
- Read actual content
- Verify exit codes
- Document everything

---

## 📝 AGENT ACCOUNTABILITY

**Before submitting ANY response:**

Sign-off checklist:
- [ ] I verified all facts with actual commands
- [ ] I documented all verification steps
- [ ] I checked file sizes, not just existence
- [ ] I reviewed exit codes from builds
- [ ] I followed REAL_DEFICIENCIES_IMPLEMENTATION_PLAN.md
- [ ] I would stake my reputation on this information

**If you cannot check all boxes, DO NOT SUBMIT THE RESPONSE.**

---

**REMEMBER**: The project is currently BROKEN (0% deployable). Every action should move toward fixing the real deficiencies identified. Follow the implementation plan exactly. Verify everything. Document everything. Trust nothing without proof.

**Current Priority**: Execute Phase 1 of REAL_DEFICIENCIES_IMPLEMENTATION_PLAN.md - Foundation Fix

**Last Updated**: November 3, 2025
**Version**: 2.0 - Complete Rewrite for Verification-First Approach