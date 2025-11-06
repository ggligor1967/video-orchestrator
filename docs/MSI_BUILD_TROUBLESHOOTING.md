# MSI Build Troubleshooting Guide
# Solutions for network-related build failures

## Problem: MSI Packaging Fails Due to Network Issues (8% blocker)

### Root Causes
1. **Cargo crate downloads timeout** - crates.io connectivity issues
2. **Git dependencies fail** - GitHub connectivity problems  
3. **Concurrent download limits** - Registry throttling
4. **DNS resolution failures** - Network infrastructure issues

---

## Solution 1: Offline Build with Vendor Dependencies

### Step 1: Prepare Dependencies (When Network is Good)
```powershell
# Run diagnostic first
.\scripts\check-cargo-cache.ps1

# Prepare vendor directory with all dependencies
.\scripts\cargo-offline-build.ps1 -PrepareVendor
```

**What this does:**
- Downloads ALL dependencies to local `vendor/` directory
- Creates `.cargo/config.toml` for offline builds
- Locks versions in `Cargo.lock`

### Step 2: Build Offline (When Network is Bad)
```powershell
# Build using cached/vendored dependencies
.\scripts\cargo-offline-build.ps1 -BuildOffline
```

**What this does:**
- Uses local vendor directory (no network calls)
- Builds with pre-downloaded dependencies
- Creates MSI package at `apps/ui/src-tauri/target/release/bundle/msi/`

### Step 3: Full Workflow (Recommended)
```powershell
# Complete workflow with retry logic
.\scripts\cargo-offline-build.ps1 -FullBuild
```

---

## Solution 2: Cargo Configuration Optimization

### Already Applied
The file `apps/ui/src-tauri/.cargo/config.toml` now includes:

```toml
[net]
retry = 5                    # Retry failed downloads 5 times
git-fetch-with-cli = true    # Use git CLI (more reliable)

[http]
timeout = 30                 # 30-second timeout per request
check-revoke = false         # Skip certificate revocation checks

[registries.crates-io]
index = "sparse+https://index.crates.io/"  # Faster sparse protocol
```

**Benefits:**
- Automatic retry on network failures
- Longer timeouts for slow connections
- Sparse protocol reduces download size

---

## Solution 3: Pre-download Dependencies

### Manual Method
```powershell
cd apps\ui\src-tauri

# Generate lockfile if missing
cargo generate-lockfile

# Pre-download all dependencies
cargo fetch --locked

# Verify everything is cached
cargo tree
```

### Automated Method
```powershell
# Use the diagnostic tool
.\scripts\check-cargo-cache.ps1

# This shows:
# - Current cache size
# - Missing dependencies
# - Network status
```

---

## Solution 4: Build with Retry Logic

The `cargo-offline-build.ps1` script includes automatic retry:

```powershell
# Retries build up to 3 times with 10-second delays
.\scripts\cargo-offline-build.ps1 -BuildOffline
```

**Features:**
- 3 automatic retries on failure
- 10-second delay between attempts
- Network connectivity check before build
- Detailed error logging

---

## Solution 5: Manual Incremental Build

If automated scripts fail, try manual incremental build:

```powershell
cd apps\ui\src-tauri

# Step 1: Build dependencies only
cargo build --release --lib

# Step 2: Build binary
cargo build --release

# Step 3: Create bundle (from project root)
cd d:\playground\Aplicatia
pnpm --filter @app/ui tauri build
```

**Why this helps:**
- Smaller network requests per stage
- Can resume from last successful stage
- Easier to diagnose specific failures

---

## Verification

### After Successful Build
```powershell
# Check MSI was created
cd apps\ui\src-tauri\target\release\bundle\msi
Get-ChildItem *.msi | Select-Object Name, @{N="Size(MB)";E={[math]::Round($_.Length/1MB,2)}}
```

**Expected Output:**
```
Name                                              Size(MB)
----                                              --------
Video Orchestrator_1.0.0_x64_en-US.msi           383.38
```

### Test Installation
```powershell
# Install MSI (requires admin)
msiexec /i "Video Orchestrator_1.0.0_x64_en-US.msi" /qn /L*V install.log

# Check installation log
Get-Content install.log -Tail 20
```

---

## Troubleshooting Common Errors

### Error: "failed to download from `https://crates.io`"
**Solution:**
```powershell
# Pre-download with retry
.\scripts\cargo-offline-build.ps1 -PrepareVendor

# Then build offline
.\scripts\cargo-offline-build.ps1 -BuildOffline
```

### Error: "Blocking waiting for file lock on package cache"
**Solution:**
```powershell
# Kill stuck cargo processes
Get-Process cargo -ErrorAction SilentlyContinue | Stop-Process -Force

# Clean lock files
Remove-Item "$env:USERPROFILE\.cargo\.package-cache*" -Force

# Retry build
.\scripts\cargo-offline-build.ps1 -BuildOffline
```

### Error: "connection timed out"
**Solution:**
```powershell
# Increase timeout in config.toml
# (Already set to 30 seconds in new config)

# Or use vendor method (no network needed)
.\scripts\cargo-offline-build.ps1 -PrepareVendor
.\scripts\cargo-offline-build.ps1 -BuildOffline
```

### Error: "authentication failed"
**Solution:**
```powershell
# Update Cargo credentials
cargo login

# Or skip auth with vendor method
.\scripts\cargo-offline-build.ps1 -PrepareVendor
```

---

## Prevention for Future Builds

### 1. Keep Cargo.lock Committed
✅ Already done - `Cargo.lock` is in version control

### 2. Maintain Vendor Directory
```powershell
# Update vendor periodically (when network is good)
cd apps\ui\src-tauri
cargo vendor vendor

# Commit vendor/ to repository (optional for large repos)
git add vendor/
git commit -m "chore: update vendored dependencies"
```

### 3. Use CI/CD with Caching
```yaml
# GitHub Actions example
- name: Cache cargo registry
  uses: actions/cache@v3
  with:
    path: ~/.cargo/registry
    key: ${{ runner.os }}-cargo-registry-${{ hashFiles('**/Cargo.lock') }}

- name: Cache cargo index
  uses: actions/cache@v3
  with:
    path: ~/.cargo/git
    key: ${{ runner.os }}-cargo-git-${{ hashFiles('**/Cargo.lock') }}
```

---

## Quick Reference

| Scenario | Command |
|----------|---------|
| **Good network, prepare for offline** | `.\scripts\cargo-offline-build.ps1 -PrepareVendor` |
| **Bad network, build offline** | `.\scripts\cargo-offline-build.ps1 -BuildOffline` |
| **Complete workflow** | `.\scripts\cargo-offline-build.ps1 -FullBuild` |
| **Diagnose issues** | `.\scripts\check-cargo-cache.ps1` |
| **Manual vendor** | `cd apps\ui\src-tauri; cargo vendor vendor` |
| **Check cache** | `cargo tree` (in src-tauri directory) |

---

## Success Metrics

✅ **Build completes without network calls**
✅ **MSI package created in under 10 minutes**  
✅ **No timeout errors during cargo build**
✅ **Reproducible builds across different networks**

---

## Additional Resources

- [Cargo Offline Documentation](https://doc.rust-lang.org/cargo/reference/offline.html)
- [Cargo Vendor Guide](https://doc.rust-lang.org/cargo/commands/cargo-vendor.html)
- [Tauri Build Guide](https://tauri.app/v2/guides/building/)

---

**Last Updated:** Generated for Video Orchestrator project
**Status:** Solutions implemented and tested
