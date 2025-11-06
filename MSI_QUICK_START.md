# Quick Start: MSI Build Commands

## Diagnostic
```powershell
pnpm msi:diagnose
```
Check cargo cache, dependencies, and existing MSI packages.

## Prepare (when network is good)
```powershell
pnpm msi:prepare
```
Download all dependencies locally for offline builds.

## Build (offline mode)
```powershell
pnpm msi:build
```
Build MSI using cached dependencies (no network needed).

## Full Build (recommended)
```powershell
pnpm msi:build:full
```
Complete workflow: prepare + build with automatic retry logic.

---

## Current Status

✅ MSI exists: `Video Orchestrator_1.0.0_x64_en-US.msi`  
✅ Location: `apps/ui/src-tauri/target/release/bundle/msi/`  
✅ Size: ~383 MB  
✅ Status: FUNCTIONAL

---

## Network Issues Fixed

- ✅ Cargo retry logic (5 attempts)
- ✅ Extended timeouts (30s)
- ✅ Sparse protocol for faster downloads
- ✅ Offline build support with vendored dependencies
- ✅ Automatic error recovery

---

See `MSI_NETWORK_ISSUES_RESOLVED.md` for complete details.
